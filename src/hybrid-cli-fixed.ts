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

type VideoStrategy = 'static' | 'ai-generated' | 'fallback'

interface VideoResult {
  url: string
  type: 'static' | 'ai'
  source: string
  strategy: VideoStrategy
}

// Existing static video assets
const STATIC_VIDEO_ASSETS = {
  'NWS_001': 'https://natureswaysoil.github.io/best/videos/NWS_001.mp4',
  'NWS_002': 'https://natureswaysoil.github.io/best/videos/NWS_002.mp4',
  'NWS_003': 'https://natureswaysoil.github.io/best/videos/NWS_003.mp4',
  'NWS_004': 'https://natureswaysoil.github.io/best/videos/NWS_004.mp4',
  'NWS_006': 'https://natureswaysoil.github.io/best/videos/NWS_006.mp4',
  'NWS_011': 'https://natureswaysoil.github.io/best/videos/NWS_011.mp4',
  'NWS_012': 'https://natureswaysoil.github.io/best/videos/NWS_012.mp4',
  'NWS_013': 'https://natureswaysoil.github.io/best/videos/NWS_013.mp4',
  'NWS_014': 'https://natureswaysoil.github.io/best/videos/NWS_014.mp4',
  'NWS_016': 'https://natureswaysoil.github.io/best/videos/NWS_016.mp4',
  'NWS_018': 'https://natureswaysoil.github.io/best/videos/NWS_018.mp4',
  'NWS_021': 'https://natureswaysoil.github.io/best/videos/NWS_021.mp4'
}

async function checkVideoAvailability(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, { timeout: 5000 })
    return response.status === 200
  } catch {
    return false
  }
}

async function getVideoForProduct(productId: string, productTitle: string, productDetails: string): Promise<VideoResult> {
  // Strategy 1: Use existing static video if available
  const staticVideoUrl = STATIC_VIDEO_ASSETS[productId as keyof typeof STATIC_VIDEO_ASSETS]
  if (staticVideoUrl) {
    const isAvailable = await checkVideoAvailability(staticVideoUrl)
    if (isAvailable) {
      console.log('✅ Using existing static video:', staticVideoUrl)
      return {
        url: staticVideoUrl,
        type: 'static',
        source: 'github-pages',
        strategy: 'static'
      }
    }
  }

  // Strategy 2: Generate AI video with HeyGen
  const hasHeyGenCreds = process.env.HEYGEN_API_KEY || process.env.GCP_SECRET_HEYGEN_API_KEY
  if (hasHeyGenCreds) {
    try {
      console.log('🎬 Creating AI video with HeyGen...')
      
      // Generate script first
      let script: string
      if (process.env.OPENAI_API_KEY) {
        try {
          script = await generateScript({ title: productTitle, details: productDetails })
          console.log('✅ Generated script with OpenAI')
        } catch (e) {
          console.log('⚠️ OpenAI failed, using product description')
          script = productDetails || productTitle
        }
      } else {
        script = productDetails || productTitle
      }

      // Get HeyGen client and mapping
      const heygenClient = await createHeyGenClient()
      const mapping = mapProductToHeyGenPayload({ 
        title: productTitle, 
        details: productDetails,
        productId 
      })

      // Create video job (fix script overwrite issue)
      const payload = {
        ...mapping.payload,
        script: script, // Explicitly set script after spread
        title: `${productTitle} (${productId})`,
        meta: { productId, strategy: 'ai-generated' }
      }

      const jobId = await heygenClient.createVideoJob(payload)
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
        strategy: 'ai-generated'
      }
    } catch (error) {
      console.error('❌ HeyGen video generation failed:', error)
      addError(`HeyGen failed for ${productId}: ${error}`)
    }
  }

  // Strategy 3: Fallback to placeholder or skip
  throw new Error(`No video available for product ${productId}`)
}

async function postToSocialMedia(videoResult: VideoResult, productTitle: string, productId: string) {
  const caption = `🌱 ${productTitle} - See it in action! Shop now at natureswaysoil.com #NaturesWaySoil #OrganicGardening #PlantHealth`
  const socialPromises: Promise<void>[] = []

  // Instagram
  if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_IG_ID) {
    const instagramPromise = postToInstagram(
      videoResult.url, 
      caption, 
      process.env.INSTAGRAM_ACCESS_TOKEN,
      process.env.INSTAGRAM_IG_ID
    ).then(() => {
      console.log('✅ Posted to Instagram')
      incrementSuccessfulPost()
    }).catch(error => {
      console.error('❌ Instagram post failed:', error)
      incrementFailedPost()
      addError(`Instagram: ${productId} - ${error}`)
    })
    socialPromises.push(instagramPromise)
  }

  // Twitter
  if (process.env.TWITTER_BEARER_TOKEN || (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET)) {
    const twitterPromise = postToTwitter(videoResult.url, caption)
      .then(() => {
        console.log('✅ Posted to Twitter')
        incrementSuccessfulPost()
      }).catch(error => {
        console.error('❌ Twitter post failed:', error)
        incrementFailedPost()
        addError(`Twitter: ${productId} - ${error}`)
      })
    socialPromises.push(twitterPromise)
  }

  // Pinterest
  if (process.env.PINTEREST_ACCESS_TOKEN && process.env.PINTEREST_BOARD_ID) {
    const pinterestPromise = postToPinterest(
      videoResult.url, 
      caption, 
      process.env.PINTEREST_ACCESS_TOKEN,
      process.env.PINTEREST_BOARD_ID
    ).then(() => {
      console.log('✅ Posted to Pinterest')
      incrementSuccessfulPost()
    }).catch(error => {
      console.error('❌ Pinterest post failed:', error)
      incrementFailedPost()
      addError(`Pinterest: ${productId} - ${error}`)
    })
    socialPromises.push(pinterestPromise)
  }

  // YouTube
  if (process.env.YT_CLIENT_ID && process.env.YT_CLIENT_SECRET && process.env.YT_REFRESH_TOKEN) {
    const youtubePromise = postToYouTube(
      videoResult.url, 
      caption,
      process.env.YT_CLIENT_ID,
      process.env.YT_CLIENT_SECRET,
      process.env.YT_REFRESH_TOKEN
    ).then(() => {
      console.log('✅ Posted to YouTube')
      incrementSuccessfulPost()
    }).catch(error => {
      console.error('❌ YouTube post failed:', error)
      incrementFailedPost()
      addError(`YouTube: ${productId} - ${error}`)
    })
    socialPromises.push(youtubePromise)
  }

  // Wait for all social media posts
  await Promise.allSettled(socialPromises)
}

function extractSpreadsheetIdFromCsv(csvUrl: string): string {
  const match = csvUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) throw new Error('Could not extract spreadsheet ID from CSV URL')
  return match[1]
}

function extractGidFromCsv(csvUrl: string): number | undefined {
  const match = csvUrl.match(/gid=(\d+)/)
  return match ? parseInt(match[1], 10) : undefined
}

async function main() {
  console.log('🚀 Nature\'s Way Soil - Hybrid Video System Starting...')
  updateStatus({ status: 'starting' })

  const csvUrl = process.env.CSV_URL
  if (!csvUrl) {
    throw new Error('CSV_URL environment variable is required')
  }

  try {
    console.log('📊 Fetching products from Google Sheets...')
    const result = await processCsvUrl(csvUrl)

    if (result.skipped) {
      console.log('⏭️ Processing skipped')
      updateStatus({ status: 'skipped' })
      return
    }

    if (!result.rows || result.rows.length === 0) {
      console.log('📭 No rows to process')
      updateStatus({ status: 'completed' })
      return
    }

    console.log(`📋 Processing ${result.rows.length} products...`)
    updateStatus({ status: 'processing-rows', rowsProcessed: 0 })

    for (const { product, jobId, rowNumber, record } of result.rows) {
      console.log(`\n========== Processing Row ${rowNumber}: ${product?.title || jobId} ==========`)
      
      try {
        // Get video for this product (static or AI-generated)
        const videoResult = await getVideoForProduct(
          jobId, 
          product?.title || product?.name || 'Unknown Product',
          product?.details || product?.description || ''
        )

        console.log(`📹 Video strategy: ${videoResult.strategy} (${videoResult.type})`)

        // Write video URL back to sheet
        if (process.env.GS_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          try {
            const spreadsheetId = extractSpreadsheetIdFromCsv(csvUrl)
            const sheetGid = extractGidFromCsv(csvUrl)
            
            await writeColumnValues({
              spreadsheetId,
              sheetGid,
              headers: Object.keys(record),
              columnName: process.env.CSV_COL_VIDEO_URL || 'Video URL',
              rows: [{ rowNumber, value: videoResult.url }],
            })
            
            console.log('✅ Wrote video URL to sheet')
          } catch (e) {
            console.error('⚠️ Failed to write video URL to sheet:', e)
          }
        }

        // Post to social media
        console.log('📱 Posting to social media...')
        await postToSocialMedia(videoResult, product?.title || 'Nature\'s Way Soil Product', jobId)

        // Mark row as posted
        if (process.env.GS_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          try {
            const spreadsheetId = extractSpreadsheetIdFromCsv(csvUrl)
            const sheetGid = extractGidFromCsv(csvUrl)
            await markRowPosted(spreadsheetId, Number(sheetGid), Object.keys(record), rowNumber)
            console.log('✅ Marked row as posted')
          } catch (e) {
            console.error('⚠️ Failed to mark row as posted:', e)
          }
        }

        console.log(`✅ Successfully processed ${product?.title || jobId}`)
        
      } catch (error) {
        console.error(`❌ Failed to process ${product?.title || jobId}:`, error)
        addError(`Processing failed for ${jobId}: ${error}`)
        continue
      }
      
      // Exit after first product if RUN_ONCE is set
      if (process.env.RUN_ONCE === 'true') {
        console.log('🔄 RUN_ONCE mode - stopping after first product')
        break
      }
    }

    updateStatus({ status: 'completed' })
    console.log('🎉 Hybrid video system completed successfully!')

  } catch (error) {
    console.error('💥 Fatal error:', error)
    updateStatus({ status: 'error' })
    addError(`Fatal: ${error}`)
    throw error
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️ Received SIGINT, shutting down gracefully...')
  updateStatus({ status: 'stopped' })
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⏹️ Received SIGTERM, shutting down gracefully...')
  updateStatus({ status: 'stopped' })
  process.exit(0)
})

main().catch(error => {
  console.error('💥 Unhandled error:', error)
  process.exit(1)
})