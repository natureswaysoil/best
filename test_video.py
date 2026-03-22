import asyncio, aiohttp, time
from secrets_manager import get_secrets

AVATAR_ID = "Abigail_expressive_2024112501"  # Abigail Upper Body
VOICE_ID  = "15bd057749e24626b06ea471c2c35b43"  # Meadow Lark

SCRIPT = """
Your soil is alive — and it deserves to be treated that way.
At Nature's Way Soil, we make fresh organic liquid fertilizer, 
activated biochar, and living compost right here on our family farm.
No harsh chemicals. No fillers. Just real, living soil food 
that's safe for your kids, your pets, and your pollinators.
Your garden will feel the difference from the very first application.
Visit NaturesWaySoil dot com and feed your soil the way nature intended.
"""

async def make_video():
    s = get_secrets()
    headers = {"X-Api-Key": s["HEYGEN_API_KEY"], "Content-Type": "application/json"}

    payload = {
        "test": True,   # ← watermarked, no credits used
        "caption": False,
        "title": "NWS_Test_Video",
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": AVATAR_ID,
                "avatar_style": "normal",
            },
            "voice": {
                "type": "text",
                "input_text": SCRIPT,
                "voice_id": VOICE_ID,
                "speed": 0.95,
            },
            "background": {
                "type": "color",
                "value": "#1a4a1a",
            },
        }],
        "dimension": {"width": 1080, "height": 1920},
    }

    async with aiohttp.ClientSession() as session:
        # Submit
        print("Submitting to HeyGen...")
        async with session.post("https://api.heygen.com/v2/video/generate",
                                headers=headers, json=payload) as r:
            data = await r.json()
            if data.get("error"):
                print("ERROR:", data); return
            video_id = data["data"]["video_id"]
            print(f"Video ID: {video_id}")
            print("Waiting for render (usually 2-4 mins)...")

        # Poll
        while True:
            await asyncio.sleep(15)
            async with session.get("https://api.heygen.com/v1/video_status.get",
                                   headers=headers,
                                   params={"video_id": video_id}) as r:
                st = await r.json()
                status = st["data"]["status"]
                print(f"  Status: {status}")
                if status == "completed":
                    url = st["data"]["video_url"]
                    print(f"\n✅ VIDEO READY!\n{url}\n")
                    return
                if status == "failed":
                    print("❌ Failed:", st); return

asyncio.run(make_video())
