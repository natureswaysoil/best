const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// YouTube OAuth configuration from environment/Secret Manager
const getYouTubeCredentials = () => {
  return {
    client_id: process.env.YT_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID,
    client_secret: process.env.YT_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET,
    refresh_token: process.env.YT_REFRESH_TOKEN || process.env.YOUTUBE_REFRESH_TOKEN
  };
};

// Create OAuth2 client for YouTube
const createYouTubeClient = async () => {
  const credentials = getYouTubeCredentials();
  
  if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    throw new Error('YouTube credentials not configured. Set YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN environment variables.');
  }

  const oauth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    'http://localhost'
  );

  oauth2Client.setCredentials({
    refresh_token: credentials.refresh_token
  });

  return google.youtube({ version: 'v3', auth: oauth2Client });
};

// Generate a proper video file using FFmpeg
function generateSampleVideo() {
  const videoPath = path.join(__dirname, 'test-video.mp4');
  
  // Check if video already exists and is valid
  if (fs.existsSync(videoPath)) {
    const stats = fs.statSync(videoPath);
    if (stats.size > 100000) { // If larger than 100KB, assume it's valid
      console.log('Using existing video file:', videoPath);
      return videoPath;
    }
  }
  
  console.log('Generating new video with FFmpeg...');
  
  // Generate a proper H.264 video with audio using FFmpeg
  const { execSync } = require('child_process');
  
  const ffmpegCmd = `ffmpeg -y \
    -f lavfi -i color=c=darkgreen:s=1280x720:d=10 \
    -f lavfi -i sine=frequency=440:duration=10 \
    -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:\
text='Nature'\\''s Way Soil':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=h/2-100,\
drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:\
text='Transform Your Garden Naturally':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=h/2+50,\
drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:\
text='Organic Soil Amendments':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=h/2+120" \
    -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ar 44100 \
    -t 10 \
    -movflags +faststart \
    ${videoPath}`;
  
  try {
    execSync(ffmpegCmd, { stdio: 'pipe' });
    console.log('Video generated successfully:', videoPath);
    return videoPath;
  } catch (error) {
    console.error('FFmpeg error:', error.message);
    throw new Error('Failed to generate video with FFmpeg');
  }
}

// Upload video to YouTube
const uploadToYouTube = async (videoPath, metadata) => {
  try {
    const youtube = await createYouTubeClient();
    
    const fileSize = fs.statSync(videoPath).size;
    
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title || "Nature's Way Soil - Automated Post",
          description: metadata.description || "Transform your garden with Nature's Way Soil! 🌱\n\nOrganic soil amendments for healthier plants.\n\n#gardening #organic #soil",
          tags: metadata.tags || ['gardening', 'organic', 'soil', 'naturesmaterials'],
          categoryId: '26' // Howto & Style
        },
        status: {
          privacyStatus: metadata.privacy || 'public',
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    });
    
    return {
      success: true,
      video_id: response.data.id,
      url: `https://www.youtube.com/watch?v=${response.data.id}`,
      title: response.data.snippet.title,
      upload_time: response.data.snippet.publishedAt
    };
    
  } catch (error) {
    console.error('YouTube upload error:', error);
    throw new Error(`YouTube upload failed: ${error.message}`);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  const credentials = getYouTubeCredentials();
  const configured = !!(credentials.client_id && credentials.client_secret && credentials.refresh_token);
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    youtube_configured: configured
  });
});

// Main automation endpoint
app.post('/api/social-automation', async (req, res) => {
  const { action, platform, test_mode, title, description, tags, privacy } = req.body;
  
  console.log(`Received request: ${action} for platform: ${platform}`);
  
  try {
    // Check if YouTube is configured
    const credentials = getYouTubeCredentials();
    const isConfigured = !!(credentials.client_id && credentials.client_secret && credentials.refresh_token);
    
    if (!isConfigured) {
      return res.status(503).json({
        success: false,
        error: 'YouTube credentials not configured',
        message: 'Set YT_CLIENT_ID, YT_CLIENT_SECRET, and YT_REFRESH_TOKEN environment variables',
        platform: 'youtube'
      });
    }
    
    // Generate video
    console.log('Generating video...');
    const startTime = Date.now();
    const videoPath = await generateSampleVideo();
    const generationTime = Date.now() - startTime;
    
    // Prepare metadata
    const metadata = {
      title: title || "Nature's Way Soil - Garden Transformation Tips",
      description: description || "Transform your garden with Nature's Way Soil! 🌱\n\nLearn how organic soil amendments create healthier, more vibrant plants.\n\n#gardening #organic #soil #naturesmaterials",
      tags: tags || ['gardening', 'organic', 'soil', 'naturesmaterials', 'plants'],
      privacy: privacy || 'public'
    };
    
    // Upload to YouTube
    console.log('Uploading to YouTube...');
    const uploadStart = Date.now();
    const uploadResult = await uploadToYouTube(videoPath, metadata);
    const uploadTime = Date.now() - uploadStart;
    
    const result = {
      success: true,
      action: action || 'live_youtube_post',
      platform: 'youtube',
      timestamp: new Date().toISOString(),
      video_info: {
        title: metadata.title,
        path: videoPath,
        format: 'mp4'
      },
      youtube_result: uploadResult,
      workflow_steps: [
        {
          step: 1,
          name: 'Video Generation',
          status: 'completed',
          method: 'sample_video',
          duration_ms: generationTime
        },
        {
          step: 2,
          name: 'Content Preparation',
          status: 'completed',
          title: metadata.title,
          description: metadata.description.substring(0, 100) + '...',
          tags: metadata.tags,
          duration_ms: 50
        },
        {
          step: 3,
          name: 'YouTube Upload',
          status: 'completed',
          video_id: uploadResult.video_id,
          url: uploadResult.url,
          duration_ms: uploadTime
        }
      ],
      total_execution_time_ms: Date.now() - startTime
    };
    
    console.log('YouTube post successful:', JSON.stringify(result, null, 2));
    
    // Clean up temporary video file
    try {
      fs.unlinkSync(videoPath);
    } catch (e) {
      console.warn('Could not delete temp video:', e.message);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error during automation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      platform: 'youtube',
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Social Media Automation - YouTube Integration',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      automation: '/api/social-automation [POST]'
    },
    documentation: {
      youtube_post: {
        method: 'POST',
        url: '/api/social-automation',
        body: {
          action: 'live_youtube_post',
          platform: 'youtube',
          title: 'Optional custom title',
          description: 'Optional custom description',
          tags: ['optional', 'custom', 'tags'],
          privacy: 'public|unlisted|private'
        },
        required_env: [
          'YT_CLIENT_ID',
          'YT_CLIENT_SECRET',
          'YT_REFRESH_TOKEN'
        ]
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Social Media Automation Service (YouTube) listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const credentials = getYouTubeCredentials();
  const configured = !!(credentials.client_id && credentials.client_secret && credentials.refresh_token);
  console.log(`YouTube configured: ${configured}`);
});
