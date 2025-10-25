#!/usr/bin/env ts-node
/**
 * Hybrid Video System - Nature's Way Soil
 * Combines existing static video assets with AI-generated HeyGen videos
 * 
 * Strategy:
 * 1. Use existing static videos for product demonstrations
 * 2. Generate AI videos for educational/how-to content
 * 3. Intelligent routing based on content type and availability
 */

import 'dotenv/config'
import { processCsvUrl } from './core'
import { postToInstagram } from './instagram'
import { postToTwitter } from './twitter'
import { postToPinterest } from './pinterest'
import { postToYouTube } from './youtube'
import { createClientWithSecrets as createHeyGenClient } from './heygen'
import { mapProductToHeyGenPayload } from './heygen-adapter'
import { generateScript } from './openai'
import { markRowPosted, writeColumnValues } from './sheets'
import { updateStatus, incrementSuccessfulPost, incrementFailedPost, addError } from './health-server'
import axios from 'axios'

// Start health check server
import './health-server'

// Static video assets configuration
const STATIC_VIDEO_BASE_URL = 'https://natureswaysoil.github.io/best/videos'
const STATIC_VIDEO_PRODUCTS = [
  'NWS_001', 'NWS_002', 'NWS_003', 'NWS_004', 'NWS_006',
  'NWS_011', 'NWS_012', 'NWS_013', 'NWS_014', 'NWS_016',
  'NWS_018', 'NWS_021'
]

// Video routing strategy
type VideoStrategy = 'static' | 'ai-generated' | 'hybrid'

interface VideoSelection {
  url: string
  type: 'static' | 'ai'
  source: string
  thumbnailUrl?: string
  strategy: VideoStrategy
}

/**
 * Check if static video exists and is accessible
 */
async function checkStaticVideoExists(productId: string): Promise<boolean> {
  try {
    const videoUrl = `${STATIC_VIDEO_BASE_URL}/${productId}.mp4`
    const response = await axios.head(videoUrl, { timeout: 5000 })
    return response.status === 200
  } catch {
    return false
  }
}

/**
 * Intelligent video selection: static vs AI-generated
 */
async function selectVideoStrategy(productId: string, productTitle: string): Promise<VideoStrategy> {
  // Check if we have a static video for this product
  const hasStaticVideo = STATIC_VIDEO_PRODUCTS.includes(productId) && 
                        await checkStaticVideoExists(productId)

  // Educational content keywords suggest AI generation
  const educationalKeywords = [
    'how to', 'guide', 'tutorial', 'tips', 'benefits', 'uses',
    'application', 'instructions', 'best practices'
  ]
  
  const isEducational = educationalKeywords.some(keyword => 
    productTitle.toLowerCase().includes(keyword)
  )

  // Decision logic
  if (hasStaticVideo && !isEducational) {
    return 'static'  // Use high-quality product demo
  } else if (isEducational) {
    return 'ai-generated'  // Educational content works better with AI avatars
  } else {
    return 'hybrid'  // Try static first, fallback to AI
  }
}

/**
 * Get video for posting - combines static and AI strategies
 */
async function getVideoForPosting(
  productId: string, 
  productTitle: string,
  script?: string
): Promise<VideoSelection | null> {
  
  const strategy = await selectVideoStrategy(productId, productTitle)
  console.log(`📹 Video strategy for ${productId}: ${strategy}`)

  switch (strategy) {
    case 'static':
      return {
        url: `${STATIC_VIDEO_BASE_URL}/${productId}.mp4`,
        type: 'static',
        source: 'existing-assets',
        thumbnailUrl: `${STATIC_VIDEO_BASE_URL}/${productId}.jpg`,
        strategy
      }

    case 'ai-generated':
      if (!script) {
        console.log('❌ No script available for AI video generation')
        return null
      }
      
      try {
        const heygenClient = await createHeyGenClient()
        const mapping = mapProductToHeyGenPayload({ title: productTitle })
        
        console.log('🎬 Creating AI video with HeyGen...')
        const jobId = await heygenClient.createVideoJob({
          script,
          ...mapping.payload,
          title: `${productTitle} (${productId})`,
          meta: { productId, strategy: 'ai-generated' }
        })

        console.log('⏳ Waiting for AI video completion...')
        const videoUrl = await heygenClient.pollJobForVideoUrl(jobId, {
          timeoutMs: 25 * 60_000, // 25 minutes
          intervalMs: 15_000 // Check every 15 seconds
        })

        console.log('✅ AI video ready:', videoUrl)
        return {
          url: videoUrl,
          type: 'ai',
          source: 'heygen-generated',
          strategy
        }
      } catch (error: any) {
        console.error('❌ AI video generation failed:', error?.message || error)
        return null
      }

    case 'hybrid':
      // Try static first
      if (await checkStaticVideoExists(productId)) {
        console.log('📹 Using static video (hybrid fallback)')
        return {
          url: `${STATIC_VIDEO_BASE_URL}/${productId}.mp4`,
          type: 'static',
          source: 'existing-assets-fallback',
          thumbnailUrl: `${STATIC_VIDEO_BASE_URL}/${productId}.jpg`,
          strategy
        }
      }
      
      // Fallback to AI generation
      console.log('🎬 Static video not available, generating AI video (hybrid)')
      if (!script) {
        console.log('❌ No script available for hybrid AI fallback')
        return null
      }

      try {
        const heygenClient = await createHeyGenClient()
        const mapping = mapProductToHeyGenPayload({ title: productTitle })
        
        const jobId = await heygenClient.createVideoJob({
          script,
          ...mapping.payload,
          title: `${productTitle} (${productId})`,
          meta: { productId, strategy: 'hybrid-ai' }
        })

        const videoUrl = await heygenClient.pollJobForVideoUrl(jobId, {
          timeoutMs: 25 * 60_000,
          intervalMs: 15_000
        })

        console.log('✅ Hybrid AI video ready:', videoUrl)
        return {
          url: videoUrl,
          type: 'ai',
          source: 'heygen-hybrid',
          strategy
        }
      } catch (error: any) {
        console.error('❌ Hybrid AI video generation failed:', error?.message || error)
        return null
      }

    default:
      return null
  }
}

/**
 * Enhanced posting with video selection tracking
 */
async function postToSocialMedia(
  videoSelection: VideoSelection,
  caption: string,
  productId: string
): Promise<void> {
  const socialPromises = []

  // Instagram posting
  if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_IG_ID) {
    const instagramPromise = postToInstagram(
      videoSelection.url,
      caption,
      videoSelection.thumbnailUrl
    ).then(() => {
      console.log('✅ Posted to Instagram:', videoSelection.url)
      incrementSuccessfulPost('instagram')
    }).catch((error: any) => {
      console.error('❌ Instagram posting failed:', error?.message || error)
      incrementFailedPost('instagram')
      addError(`Instagram: ${productId} - ${error?.message || String(error)}`)
    })
    socialPromises.push(instagramPromise)
  }

  // Twitter posting
  if (process.env.TWITTER_API_KEY || process.env.TWITTER_BEARER_TOKEN) {
    const twitterPromise = postToTwitter(
      videoSelection.url,
      caption
    ).then(() => {
      console.log('✅ Posted to Twitter:', videoSelection.url)
      incrementSuccessfulPost('twitter')
    }).catch((error: any) => {
      console.error('❌ Twitter posting failed:', error?.message || error)
      incrementFailedPost('twitter')
      addError(`Twitter: ${productId} - ${error?.message || String(error)}`)
    })
    socialPromises.push(twitterPromise)
  }

  // Pinterest posting
  if (process.env.PINTEREST_ACCESS_TOKEN && process.env.PINTEREST_BOARD_ID) {
    const pinterestPromise = postToPinterest(
      videoSelection.url,
      caption,
      videoSelection.thumbnailUrl
    ).then(() => {
      console.log('✅ Posted to Pinterest:', videoSelection.url)
      incrementSuccessfulPost('pinterest')
    }).catch((error: any) => {
      console.error('❌ Pinterest posting failed:', error?.message || error)
      incrementFailedPost('pinterest')
      addError(`Pinterest: ${productId} - ${error?.message || String(error)}`)
    })
    socialPromises.push(pinterestPromise)
  }

  // YouTube posting
  if (process.env.YT_CLIENT_ID && process.env.YT_CLIENT_SECRET && process.env.YT_REFRESH_TOKEN) {
    const youtubePromise = postToYouTube(
      videoSelection.url,
      caption,
      `${productId} - Nature's Way Soil`
    ).then(() => {
      console.log('✅ Posted to YouTube:', videoSelection.url)
      incrementSuccessfulPost('youtube')
    }).catch((error: any) => {
      console.error('❌ YouTube posting failed:', error?.message || error)
      incrementFailedPost('youtube')
      addError(`YouTube: ${productId} - ${error?.message || String(error)}`)
    })
    socialPromises.push(youtubePromise)
  }

  // Wait for all social media posts to complete
  if (socialPromises.length > 0) {
    await Promise.allSettled(socialPromises)
  } else {
    console.log('⚠️  No social media platforms configured')
  }
}

/**
 * Main execution function - enhanced with hybrid video system
 */
async function main() {
  console.log('🚀 Nature\'s Way Soil - Hybrid Video Automation System')
  console.log('='.repeat(60))
  
  const csvUrl = process.env.CSV_URL
  if (!csvUrl) {
    console.error('❌ CSV_URL environment variable is required')
    process.exit(1)
  }

  updateStatus({ status: 'starting', message: 'Hybrid video system starting...' })

  try {
    console.log('📊 Processing Google Sheets data from CSV...')
    const result = await processCsvUrl(csvUrl)
    
    if (result.skipped) {
      console.log('⏭️  Processing skipped:', result.reason)
      updateStatus({ status: 'skipped', message: result.reason })
      return
    }

    if (result.rows.length === 0) {
      console.log('📭 No rows to process')
      updateStatus({ status: 'completed', message: 'No rows to process' })
      return
    }

    console.log(`📝 Found ${result.rows.length} products to process`)
    updateStatus({ status: 'processing-rows', rowsProcessed: 0 })

    for (const { product, jobId, rowNumber } of result.rows) {
      console.log(`\n${'='.repeat(40)}`)
      console.log(`Processing Row ${rowNumber}: ${product?.title || jobId}`)
      console.log(`${'='.repeat(40)}`)

      const productId = jobId || product?.id || `PRODUCT_${rowNumber}`
      const productTitle = product?.title || product?.name || 'Nature\'s Way Soil Product'

      // Step 1: Generate marketing script with OpenAI
      let script: string | undefined
      if (process.env.OPENAI_API_KEY) {
        try {
          script = await generateScript(product)
          console.log('✅ Generated script with OpenAI')
          console.log('📝 Script preview:', script.substring(0, 100) + '...')
        } catch (error: any) {
          console.error('❌ OpenAI script generation failed:', error?.message || error)
          console.log('⚠️  Using product description as fallback')
          script = productTitle
        }
      } else {
        console.log('⚠️  OPENAI_API_KEY not set, using product title as script')
        script = productTitle
      }

      // Step 2: Select and get video using hybrid strategy
      const videoSelection = await getVideoForPosting(productId, productTitle, script)
      
      if (!videoSelection) {
        console.error('❌ Could not obtain video (static or AI)')
        console.log('⏭️  Skipping row - no video available')
        continue
      }

      console.log('✅ Video selected:', {
        type: videoSelection.type,
        source: videoSelection.source,
        strategy: videoSelection.strategy,
        url: videoSelection.url.substring(0, 60) + '...'
      })

      // Step 3: Create social media caption
      const baseCaption = script || productTitle
      const socialCaption = `${baseCaption}

🌱 Learn more: https://www.natureswaysoil.com
#NaturesWaySoil #OrganicGardening #PlantHealth #SustainableGardening`

      // Step 4: Post to social media platforms
      console.log('📱 Posting to social media platforms...')
      await postToSocialMedia(videoSelection, socialCaption, productId)

      // Step 5: Update Google Sheets with results
      if (process.env.GS_SERVICE_ACCOUNT_EMAIL) {
        try {
          const spreadsheetId = csvUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1]
          const sheetGid = csvUrl.match(/gid=([0-9]+)/)?.[1]
          
          if (spreadsheetId && sheetGid) {
            // Write video URL
            await writeColumnValues({
              spreadsheetId,
              sheetGid: Number(sheetGid),
              headers: result.headers,
              columnName: process.env.CSV_COL_VIDEO_URL || 'Video URL',
              rows: [{ rowNumber, value: videoSelection.url }]
            })

            // Mark as posted
            await markRowPosted(spreadsheetId, Number(sheetGid), result.headers, rowNumber)
            
            console.log('✅ Updated Google Sheets with video URL and posted status')
          }
        } catch (error: any) {
          console.error('⚠️  Failed to update Google Sheets:', error?.message || error)
        }
      }

      console.log(`✅ Completed processing ${productId} (${videoSelection.type} video)`)
      updateStatus({ status: 'processing-rows', rowsProcessed: rowNumber })
    }

    updateStatus({ status: 'completed', message: `Processed ${result.rows.length} products` })
    console.log(`\n🎉 Hybrid video automation completed successfully!`)
    console.log(`📊 Total products processed: ${result.rows.length}`)

  } catch (error: any) {
    console.error('❌ Fatal error in hybrid video system:', error)
    updateStatus({ status: 'error', message: error?.message || String(error) })
    addError(`System: ${error?.message || String(error)}`)
    process.exit(1)
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Received SIGINT, shutting down gracefully...')
  updateStatus({ status: 'stopped', message: 'Process interrupted' })
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⏹️  Received SIGTERM, shutting down gracefully...')
  updateStatus({ status: 'stopped', message: 'Process terminated' })
  process.exit(0)
})

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })
}

export { main, getVideoForPosting, selectVideoStrategy }