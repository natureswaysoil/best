#!/usr/bin/env node

/**
 * HeyGen Video Generator
 * Professional AI video generation using HeyGen's API
 * Creates talking head videos with avatars for product demonstrations
 */

import fs from 'fs/promises';
import path from 'path';

export class HeyGenVideoGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.HEYGEN_API_KEY;
    this.baseUrl = 'https://api.heygen.com/v1';
    
    if (!this.apiKey) {
      throw new Error('HeyGen API key is required. Set HEYGEN_API_KEY environment variable.');
    }
  }

  log(message) {
    console.log(`[HeyGen] ${new Date().toISOString()} - ${message}`);
  }

  /**
   * Create video using HeyGen's streaming avatar API
   */
  async createVideo({
    script,
    title,
    avatarId = 'Anna_public_3_20240108', // Default professional avatar
    voiceId = 'b8266b04af0a4c7e8adc8ea21273eecd', // Default voice
    background = '#0d3b2a', // Nature's Way brand color
    productImage = null
  }) {
    try {
      this.log(`Creating video: ${title}`);

      const videoData = {
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: voiceId,
              speed: 1.0
            },
            background: {
              type: 'color',
              value: background
            }
          }
        ],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: '16:9',
        test: false, // Set to true for testing (watermarked)
        caption: false, // We'll handle captions separately if needed
        callback_id: `nws_${Date.now()}`
      };

      // Add product image overlay if provided
      if (productImage) {
        videoData.video_inputs[0].background = {
          type: 'image',
          url: productImage,
          fit: 'cover'
        };
      }

      const response = await fetch(`${this.baseUrl}/video/generate`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HeyGen API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      this.log(`Video creation initiated - Video ID: ${result.data.video_id}`);
      
      return {
        videoId: result.data.video_id,
        status: 'processing',
        title: title
      };

    } catch (error) {
      this.log(`Video creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check video generation status
   */
  async getVideoStatus(videoId) {
    try {
      const response = await fetch(`${this.baseUrl}/video_status.get?video_id=${videoId}`, {
        headers: {
          'X-API-KEY': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        status: result.data.status, // 'processing', 'completed', 'failed'
        progress: result.data.progress || 0,
        videoUrl: result.data.video_url || null,
        duration: result.data.duration || null,
        callback_id: result.data.callback_id || null,
        error: result.data.error || null
      };

    } catch (error) {
      this.log(`Status check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for video to complete processing
   */
  async waitForCompletion(videoId, maxWaitTime = 600000) { // 10 minutes max
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getVideoStatus(videoId);
      
      this.log(`Video ${videoId}: ${status.status} (${status.progress}%)`);
      
      if (status.status === 'completed') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`);
      }
      
      // Wait 15 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
    
    throw new Error('Video generation timeout');
  }

  /**
   * Download video from HeyGen and save locally
   */
  async downloadVideo(videoUrl, outputPath) {
    try {
      this.log(`Downloading video to: ${outputPath}`);
      
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const buffer = await response.buffer();
      await fs.writeFile(outputPath, buffer);
      
      this.log(`Video downloaded successfully: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      this.log(`Download failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * List available avatars
   */
  async getAvatars() {
    try {
      const response = await fetch(`${this.baseUrl}/avatar.list`, {
        headers: {
          'X-API-KEY': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch avatars: ${response.status}`);
      }

      const result = await response.json();
      return result.data.avatars || [];

    } catch (error) {
      this.log(`Failed to get avatars: ${error.message}`);
      throw error;
    }
  }

  /**
   * List available voices
   */
  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voice.list`, {
        headers: {
          'X-API-KEY': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const result = await response.json();
      return result.data.voices || [];

    } catch (error) {
      this.log(`Failed to get voices: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate script for product video
   */
  generateProductScript(product) {
    const problems = [
      'yellowing grass', 'brown patches', 'thin lawn', 'bare spots',
      'poor soil', 'slow growth', 'weak roots', 'stressed plants'
    ];
    
    const benefits = [
      'lush green growth', 'stronger roots', 'healthier soil',
      'faster recovery', 'natural nutrition', 'long-lasting results'
    ];

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    const randomBenefit = benefits[Math.floor(Math.random() * benefits.length)];

    return `Hi! I'm here to tell you about ${product.name}, the natural solution for ${randomProblem}.

This organic formula delivers ${randomBenefit} without harsh chemicals. It's completely pet-safe and kid-friendly.

Simply mix with water and apply to your lawn or garden. You'll see results in just days, with full benefits in 2-3 weeks.

${product.name} works with nature, not against it. Get yours today at NaturesWaySoil.com and transform your outdoor space naturally!`;
  }

  /**
   * Generate video for a product
   */
  async generateProductVideo(product, outputDir = './public/videos') {
    try {
      const script = this.generateProductScript(product);
      const title = `${product.name} - Natural Lawn Care Solution`;
      
      // Create video
      const videoJob = await this.createVideo({
        script,
        title,
        avatarId: 'Anna_public_3_20240108', // Professional female avatar
        voiceId: 'b8266b04af0a4c7e8adc8ea21273eecd', // Clear English voice
        background: '#0d3b2a' // Nature's Way brand color
      });

      // Wait for completion
      const result = await this.waitForCompletion(videoJob.videoId);
      
      // Download video
      const outputPath = path.join(outputDir, `${product.id}.mp4`);
      await fs.mkdir(outputDir, { recursive: true });
      await this.downloadVideo(result.videoUrl, outputPath);

      return {
        productId: product.id,
        videoPath: outputPath,
        videoUrl: result.videoUrl,
        duration: result.duration,
        script: script
      };

    } catch (error) {
      this.log(`Failed to generate video for ${product.name}: ${error.message}`);
      throw error;
    }
  }
}

// CLI usage
async function main() {
  const command = process.argv[2];
  
  if (command === 'test') {
    console.log('🧪 Testing HeyGen integration...');
    
    try {
      const generator = new HeyGenVideoGenerator();
      
      // Test API connection
      console.log('📋 Fetching available avatars...');
      const avatars = await generator.getAvatars();
      console.log(`✅ Found ${avatars.length} avatars`);
      
      console.log('🎤 Fetching available voices...');
      const voices = await generator.getVoices();
      console.log(`✅ Found ${voices.length} voices`);
      
      console.log('🎉 HeyGen integration is working!');
      
    } catch (error) {
      console.error('❌ HeyGen test failed:', error.message);
      console.error('');
      console.error('🔧 Setup required:');
      console.error('1. Get API key from: https://app.heygen.com/settings/api');
      console.error('2. Add to .env.local: HEYGEN_API_KEY=your_api_key');
      console.error('3. Run: npm run heygen:test');
      process.exit(1);
    }
  } else if (command === 'avatars') {
    console.log('👥 Available HeyGen Avatars:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const generator = new HeyGenVideoGenerator();
      const avatars = await generator.getAvatars();
      
      avatars.slice(0, 10).forEach(avatar => {
        console.log(`🎭 ${avatar.avatar_name || avatar.name}`);
        console.log(`   ID: ${avatar.avatar_id}`);
        console.log(`   Type: ${avatar.gender || 'Unknown'}`);
        console.log('');
      });
      
      if (avatars.length > 10) {
        console.log(`... and ${avatars.length - 10} more avatars available`);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch avatars:', error.message);
      process.exit(1);
    }
  } else if (command === 'voices') {
    console.log('🎤 Available HeyGen Voices:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const generator = new HeyGenVideoGenerator();
      const voices = await generator.getVoices();
      
      voices.slice(0, 10).forEach(voice => {
        console.log(`🗣️ ${voice.voice_name || voice.name}`);
        console.log(`   ID: ${voice.voice_id}`);
        console.log(`   Language: ${voice.language || 'Unknown'}`);
        console.log(`   Gender: ${voice.gender || 'Unknown'}`);
        console.log('');
      });
      
      if (voices.length > 10) {
        console.log(`... and ${voices.length - 10} more voices available`);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch voices:', error.message);
      process.exit(1);
    }
  } else {
    console.log('🎬 HeyGen Video Generator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Commands:');
    console.log('  npm run heygen:test     # Test API connection');
    console.log('  npm run heygen:avatars  # List available avatars');
    console.log('  npm run heygen:voices   # List available voices');
    console.log('');
    console.log('Setup:');
    console.log('  1. Get API key: https://app.heygen.com/settings/api');
    console.log('  2. Add HEYGEN_API_KEY to .env.local');
    console.log('  3. Run: npm run heygen:test');
  }
}

// Export for use in other modules
export default HeyGenVideoGenerator;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}