import os, re, math, requests, textwrap, asyncio, aiohttp
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from moviepy.editor import ImageClip, CompositeVideoClip, AudioFileClip

W, H = 1080, 1920
FPS = 30
FONT_SIZE = 72
OUT_PATH = "nws_video.mp4"
TMP = Path("/tmp/nws")
TMP.mkdir(exist_ok=True)
VOICE_ID = "15bd057749e24626b06ea471c2c35b43"

SCENES = [
    {"image": "https://www.natureswaysoil.com/images/products/NWS_001/main.jpg",
     "sentences": ["Your soil is alive —", "and it deserves to be treated that way.", "Our Liquid Fertilizer is packed with billions of beneficial microbes,", "made fresh every week right here on our family farm."]},
    {"image": "https://www.natureswaysoil.com/images/products/NWS_013/main.jpg",
     "sentences": ["Our Enhanced Living Compost", "blends premium worm castings, activated biochar,", "and aged compost into one powerful soil amendment.", "Your plants will feel the difference in just two to three weeks."]},
    {"image": "https://www.natureswaysoil.com/images/products/NWS_018/main.jpg",
     "sentences": ["Our Seaweed and Humic Acid Treatment", "gives your lawn the deep green boost it has been missing.", "One hundred percent natural. Safe for kids and pets.", "Visit NaturesWaySoil dot com — thirty day guarantee."]},
]

async def generate_tts(api_key, text, out_path):
    headers = {"X-Api-Key": api_key, "Content-Type": "application/json"}
    payload = {"voice_id": VOICE_ID, "text": text, "speed": 0.95}
    async with aiohttp.ClientSession() as session:
        async with session.post("https://api.heygen.com/v1/audio/text_to_speech", headers=headers, json=payload) as r:
            data = await r.json()
            if not data.get("data", {}).get("audio_url"):
                raise RuntimeError(f"TTS failed: {data}")
            audio_url = data["data"]["audio_url"]
        async with session.get(audio_url) as r:
            out_path.write_bytes(await r.read())
    print(f"  TTS saved: {out_path}")

def download_image(url, out_path):
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    out_path.write_bytes(r.content)

def make_caption_frame(text):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", FONT_SIZE)
    except:
        font = ImageFont.load_default()
    lines = textwrap.wrap(text, width=22)
    line_h = FONT_SIZE + 16
    total_h = len(lines) * line_h
    y = int(H * 0.62) - total_h // 2
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        x = (W - (bbox[2] - bbox[0])) // 2
        for dx, dy in [(-3,3),(3,3),(0,4)]:
            draw.text((x+dx, y+dy), line, font=font, fill=(0,0,0,200))
        draw.text((x, y), line, font=font, fill=(255,255,255,255))
        y += line_h
    return np.array(img)

def make_bg_clip(image_path, duration):
    img = Image.open(image_path).convert("RGB")
    ir = img.width / img.height
    tr = W / H
    if ir > tr:
        nw = int(img.height * tr)
        l = (img.width - nw) // 2
        img = img.crop((l, 0, l+nw, img.height))
    else:
        nh = int(img.width / tr)
        t = (img.height - nh) // 2
        img = img.crop((0, t, img.width, t+nh))
    img = img.resize((W, H), Image.LANCZOS)
    overlay = Image.new("RGB", (W, H), (0,0,0))
    img = Image.blend(img, overlay, alpha=0.38)
    return ImageClip(np.array(img)).set_duration(duration)

def make_logo_clip(total_duration):
    img = Image.new("RGBA", (W, 110), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    except:
        font = ImageFont.load_default()
    draw.text((40, 30), "Nature's Way Soil", font=font, fill=(255,255,255,230))
    return ImageClip(np.array(img), ismask=False).set_duration(total_duration).set_position(("left","top"))

async def main():
    import sys
    sys.path.insert(0, "/workspaces/best/pipeline")
    from secrets_manager import get_secrets
    s = get_secrets()

    print("\n[1/4] Generating voiceover...")
    full_script = "  ".join(sent for sc in SCENES for sent in sc["sentences"])
    audio_path = TMP / "voice.mp3"
    await generate_tts(s["HEYGEN_API_KEY"], full_script, audio_path)

    print("\n[2/4] Loading audio...")
    audio = AudioFileClip(str(audio_path))
    total = audio.duration
    print(f"  Duration: {total:.1f}s")

    print("\n[3/4] Building scenes...")
    total_sents = sum(len(sc["sentences"]) for sc in SCENES)
    all_clips = []
    t = 0
    for i, sc in enumerate(SCENES):
        dur = total * len(sc["sentences"]) / total_sents
        img_path = TMP / f"img{i}.jpg"
        download_image(sc["image"], img_path)
        bg = make_bg_clip(img_path, dur).set_start(t)
        all_clips.append(bg)
        seg = dur / len(sc["sentences"])
        for j, sent in enumerate(sc["sentences"]):
            cap = ImageClip(make_caption_frame(sent), ismask=False).set_duration(seg*0.9).set_start(t + j*seg)
            all_clips.append(cap)
        t += dur

    all_clips.append(make_logo_clip(total))

    print("\n[4/4] Rendering...")
    final = CompositeVideoClip(all_clips, size=(W,H)).set_audio(audio)
    final.write_videofile(OUT_PATH, fps=FPS, codec="libx264", audio_codec="aac",
        temp_audiofile="/tmp/nws/tmp.m4a", remove_temp=True, verbose=False, logger=None)
    print(f"\n✅ Done! → {OUT_PATH}")

asyncio.run(main())