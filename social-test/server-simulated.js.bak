const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main automation endpoint
app.post('/api/social-automation', async (req, res) => {
  const { action, platform, test_mode } = req.body;
  
  console.log(`Received request: ${action} for platform: ${platform}`);
  
  try {
    // Simulate video generation and posting
    const result = {
      success: true,
      action: action || 'test_post',
      platform: platform || 'twitter',
      timestamp: new Date().toISOString(),
      video_info: {
        title: 'Nature\'s Way Soil - Test Post',
        duration: '30s',
        format: 'mp4',
        resolution: '1280x720'
      },
      post_info: {
        status: 'simulated_success',
        message: 'This is a test post demonstrating the automation workflow',
        post_url: 'https://twitter.com/example/status/123456789',
        engagement: {
          likes: 0,
          shares: 0,
          views: 0
        }
      },
      workflow_steps: [
        {
          step: 1,
          name: 'Video Generation',
          status: 'completed',
          method: 'simulated',
          duration_ms: 500
        },
        {
          step: 2,
          name: 'Content Preparation',
          status: 'completed',
          caption: 'Transform your garden with Nature\'s Way Soil! 🌱',
          hashtags: ['gardening', 'organic', 'soil', 'naturalmaterials'],
          duration_ms: 200
        },
        {
          step: 3,
          name: 'Social Media Posting',
          status: 'completed',
          platform: platform || 'twitter',
          duration_ms: 800
        }
      ],
      total_execution_time_ms: 1500
    };
    
    // Log for monitoring
    console.log('Test post executed successfully:', JSON.stringify(result, null, 2));
    
    res.json(result);
    
  } catch (error) {
    console.error('Error during automation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Social Media Automation Test',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      automation: '/api/social-automation [POST]'
    },
    documentation: {
      test_post: {
        method: 'POST',
        url: '/api/social-automation',
        body: {
          action: 'test_post',
          platform: 'twitter',
          test_mode: true
        }
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Social Media Automation Test Service listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
