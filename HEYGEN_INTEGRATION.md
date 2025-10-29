# HeyGen AI Video Integration

## Overview

Nature's Way Soil now uses HeyGen's AI video generation platform to create professional talking head videos for products and blog content. HeyGen provides realistic AI avatars that can present product information in a natural, engaging way.

## Features

- **Professional AI Avatars**: Choose from dozens of realistic presenters
- **Natural Voice Synthesis**: High-quality text-to-speech in multiple languages
- **Branded Videos**: Consistent visual identity with Nature's Way Soil branding
- **Automatic Generation**: Seamlessly integrated with existing video workflows
- **Fallback Support**: Graceful fallback to FFmpeg if HeyGen is unavailable

## Setup

### 1. Get HeyGen API Key

1. Visit [HeyGen Settings](https://app.heygen.com/settings/api)
2. Create an API key for video generation
3. Copy the API key

### 2. Configure Environment

Add to your `.env.local`:

```bash
HEYGEN_API_KEY=your_heygen_api_key_here
```

### 3. Test Integration

```bash
npm run heygen:test
```

This will verify your API key and connection.

## Available Commands

### Video Generation
```bash
npm run videos          # Generate all product videos (uses HeyGen if available)
npm run blog:videos     # Generate blog videos (uses HeyGen if available)
```

### HeyGen Management
```bash
npm run heygen:test     # Test API connection
npm run heygen:avatars  # List available avatars
npm run heygen:voices   # List available voices
```

## How It Works

### Product Videos

1. **Script Generation**: Creates engaging 30-second scripts highlighting product benefits
2. **Avatar Selection**: Uses professional female avatar (Anna) for consistent branding
3. **Voice Synthesis**: Natural English voice optimized for gardening content
4. **Brand Integration**: Nature's Way Soil green background and messaging
5. **Download & Storage**: Videos saved to `public/videos/` directory

### Blog Videos

1. **Content Adaptation**: Converts blog excerpts into presenter-friendly scripts
2. **Educational Focus**: Professional tone suitable for gardening education
3. **Call-to-Action**: Includes website promotion and product recommendations
4. **Automatic Integration**: Videos appear automatically in blog posts

## Default Configuration

### Avatar
- **ID**: `Anna_public_3_20240108`
- **Type**: Professional female presenter
- **Style**: Clean, educational appearance

### Voice
- **ID**: `b8266b04af0a4c7e8adc8ea21273eecd`
- **Language**: English (US)
- **Gender**: Female
- **Tone**: Clear, professional

### Branding
- **Background**: `#0d3b2a` (Nature's Way Soil brand green)
- **Resolution**: 1280x720 (16:9 aspect ratio)
- **Duration**: 30 seconds average

## Customization

### Change Avatar

View available avatars:
```bash
npm run heygen:avatars
```

Update in script:
```javascript
const result = await generator.generateProductVideo(product, {
  avatarId: 'your_chosen_avatar_id'
});
```

### Change Voice

View available voices:
```bash
npm run heygen:voices
```

Update voice ID in the generator configuration.

### Custom Scripts

Modify script generation in:
- `scripts/heygen-video-generator.mjs` - `generateProductScript()`
- `scripts/generate-blog-videos.mjs` - `generateVideoWithHeyGen()`

## Cost Management

- **Testing**: Use `test: true` in video creation for watermarked previews
- **Rate Limiting**: Built-in delays between API requests
- **Error Handling**: Automatic fallback to prevent API quota exhaustion
- **Batch Processing**: Efficient handling of multiple video requests

## Fallback System

If HeyGen is unavailable (API key missing, quota exceeded, etc.):

1. **Automatic Detection**: Scripts detect missing/invalid API key
2. **FFmpeg Fallback**: Falls back to local FFmpeg video generation
3. **Graceful Degradation**: No interruption to video workflows
4. **Clear Messaging**: Logs indicate which generation method was used

## Quality Assurance

### Video Validation
- Automatic duration checking
- Download verification
- File format validation
- Error logging and reporting

### Content Review
- Product scripts emphasize benefits and safety
- Blog videos maintain educational tone
- Call-to-action consistency across all videos
- Brand messaging alignment

## Monitoring

### Generation Logs
Videos are logged with:
- Generation timestamp
- Success/failure status
- File locations
- Script content
- Avatar and voice used

### Performance Metrics
- Generation success rate
- Average processing time
- API quota usage
- Fallback frequency

## Troubleshooting

### Common Issues

**"HeyGen API key not found"**
- Add `HEYGEN_API_KEY` to `.env.local`
- Verify API key is valid at HeyGen settings

**"Video generation timeout"**
- Check internet connection
- Verify HeyGen service status
- Consider shorter scripts

**"Download failed"**
- Check disk space in `public/videos/`
- Verify file permissions
- Try regenerating the video

### Debug Mode

Enable detailed logging:
```bash
DEBUG=heygen npm run videos
```

### API Limits

- Check quota at [HeyGen Dashboard](https://app.heygen.com)
- Monitor usage in video generation logs
- Consider upgrading plan for higher limits

## Integration with Social Media

HeyGen videos automatically integrate with:
- **Instagram**: Posted as video content with captions
- **Twitter**: Shared as video tweets with product links
- **YouTube**: Uploaded as educational content
- **Pinterest**: Used as video pins for products

The social media automation scripts in `scripts/social-media-auto-post.mjs` will automatically use HeyGen-generated videos when available.

## Best Practices

### Script Writing
- Keep scripts under 150 words for 30-second videos
- Use conversational, friendly tone
- Include clear call-to-action
- Emphasize product benefits over features

### Avatar Selection
- Use consistent avatar across product line
- Choose professional appearance for credibility
- Consider target audience demographics

### Voice Optimization
- Match voice to brand personality
- Ensure clear pronunciation of product names
- Test with sample content before bulk generation

### Content Strategy
- Align video messaging with website copy
- Maintain consistency across all touchpoints
- Regular content audits and updates

This integration elevates Nature's Way Soil's video content to professional standards while maintaining automation efficiency and cost-effectiveness.