#!/usr/bin/env node

/**
 * Test Blog Generation
 * Forces blog generation for testing purposes
 */

import { promises as fs } from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'auto-blog-generation.log');

// Log function
async function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} - ${message}\n`;
  
  try {
    await fs.appendFile(LOG_FILE, logLine);
  } catch (error) {
    console.warn('Could not write to log file:', error.message);
  }
  
  console.log(`${timestamp}: ${message}`);
}

// Test topics for content generation
const testTopics = [
  {
    title: "10 Essential Herbs Every Gardener Should Grow",
    category: "Herb Gardening",
    tags: ["herbs", "beginner-gardening", "culinary-herbs", "medicinal-plants"],
    focus: "herb gardening basics and essential varieties"
  },
  {
    title: "Creating Perfect Raised Garden Beds",
    category: "Garden Design",
    tags: ["raised-beds", "garden-design", "soil-preparation", "drainage"],
    focus: "raised bed construction and soil preparation"
  },
  {
    title: "Seasonal Soil Care: What to Do Each Month",
    category: "Soil Health",
    tags: ["soil-care", "seasonal-gardening", "maintenance", "fertilizing"],
    focus: "monthly soil maintenance schedule"
  }
];

// Generate test article
async function generateTestArticle(topic) {
  const slug = topic.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const article = {
    id: slug,
    title: topic.title,
    slug: slug,
    excerpt: `Learn essential tips and techniques for ${topic.focus}. This comprehensive guide covers everything you need to know to succeed with ${topic.category.toLowerCase()}.`,
    content: generateArticleContent(topic),
    author: "Nature's Way Soil Expert",
    publishedAt: new Date().toISOString().split('T')[0],
    featuredImage: `/images/blog/${slug}-featured.jpg`,
    tags: topic.tags,
    category: topic.category,
    readTime: Math.floor(Math.random() * 5) + 8, // 8-12 minutes
    seoTitle: `${topic.title} | Nature's Way Soil Gardening Guide`,
    seoDescription: `Expert guide to ${topic.focus}. Get professional tips and techniques for successful ${topic.category.toLowerCase()}.`
  };

  return article;
}

// Generate article content
function generateArticleContent(topic) {
  return `
# ${topic.title}

${topic.category} is one of the most rewarding aspects of gardening, offering both practical benefits and deep satisfaction. Whether you're a beginner just starting your gardening journey or an experienced gardener looking to expand your knowledge, this comprehensive guide will help you master ${topic.focus}.

## Getting Started with ${topic.category}

The foundation of successful ${topic.category.toLowerCase()} begins with understanding the basic principles and having the right tools and materials. Our **Premium Organic Soil Mix** provides the perfect foundation for any ${topic.category.toLowerCase()} project, ensuring your plants have the nutrients and drainage they need to thrive.

### Essential Elements for Success

**Soil Preparation:** Start with high-quality soil that drains well but retains moisture. Our Premium Organic Soil Mix is specifically formulated to provide the ideal growing medium for ${topic.category.toLowerCase()}.

**Planning:** Take time to plan your approach, considering factors like:
- Available space and sunlight
- Your experience level and time commitment
- Seasonal timing and local climate
- Long-term maintenance requirements

### Step-by-Step Implementation

**Week 1-2: Foundation Work**
Begin by preparing your growing area. Remove any weeds or debris, and test your existing soil if working with an established area. Incorporate our Premium Organic Soil Mix to improve soil structure and fertility.

**Week 3-4: Installation**
This is when you'll implement your ${topic.category.toLowerCase()} plan. Take your time during this phase – proper installation now prevents problems later.

**Ongoing: Maintenance and Care**
Regular maintenance ensures long-term success. Develop a routine that includes:
- Regular watering (adjust based on season and weather)
- Monitoring for pests and diseases
- Seasonal soil amendments
- Pruning or harvesting as appropriate

## Advanced Techniques

Once you've mastered the basics, these advanced techniques will take your ${topic.category.toLowerCase()} to the next level:

### Seasonal Optimization
Each season brings unique opportunities and challenges. Spring is ideal for major plantings and soil preparation, while fall is perfect for soil improvement and planning for next year.

### Troubleshooting Common Issues
Even experienced gardeners encounter challenges. Common issues include:
- Poor drainage or waterlogged soil
- Nutrient deficiencies
- Pest and disease problems
- Seasonal stress on plants

Most of these issues can be prevented or resolved with proper soil preparation and regular care.

## Product Recommendations

For ${topic.category.toLowerCase()} success, we recommend:

**Premium Organic Soil Mix** - Our flagship product provides the perfect foundation for any gardening project. Rich in organic matter and beneficial microorganisms, it improves soil structure while providing essential nutrients.

**Organic Fertilizer Blend** - Specially formulated to support healthy plant growth without harsh chemicals. Slow-release formula provides consistent nutrition throughout the growing season.

**Natural Mulch Blend** - Helps retain soil moisture, suppress weeds, and regulate soil temperature. Made from locally sourced organic materials.

## Seasonal Calendar

**Spring (March-May)**
- Prepare soil and planting areas
- Begin planting after last frost
- Establish watering routines
- Apply organic fertilizer

**Summer (June-August)**
- Maintain consistent watering
- Monitor for pests and diseases
- Harvest regularly to encourage production
- Mulch to conserve moisture

**Fall (September-November)**
- Prepare for winter
- Plant cool-season varieties
- Improve soil with compost
- Plan for next year

**Winter (December-February)**
- Plan and research for next season
- Order seeds and supplies
- Maintain tools and equipment
- Study and learn new techniques

## Conclusion

Successful ${topic.category.toLowerCase()} is achievable for gardeners of all experience levels. By starting with quality soil, following proven techniques, and maintaining consistent care, you'll enjoy abundant results and the satisfaction of growing your own ${topic.category.toLowerCase()}.

Remember that gardening is a journey of continuous learning. Each season brings new experiences and opportunities to improve your skills. Start with the basics, be patient with yourself, and enjoy the process of creating something beautiful and productive.

For more detailed guidance and premium soil products to support your ${topic.category.toLowerCase()} success, explore our full range of organic gardening solutions. Our expert team is always here to help you achieve your gardening goals.

*Ready to start your ${topic.category.toLowerCase()} journey? Browse our Premium Organic Soil Mix and other essential gardening products to get started today.*
`.trim();
}

// Update blog data file
async function updateBlogData(newArticle) {
  const blogDataPath = path.join(process.cwd(), 'data', 'blog.ts');
  
  try {
    const content = await fs.readFile(blogDataPath, 'utf-8');
    
    // Find the export statement
    const exportMatch = content.match(/(export const blogArticles: BlogArticle\[\] = \[)([\s\S]*?)(\];)/);
    
    if (exportMatch) {
      // Escape content for template literal
      const escapedContent = newArticle.content.replace(/`/g, '\\`').replace(/\$/g, '\\$');
      const escapedTitle = newArticle.title.replace(/'/g, "\\'");
      const escapedExcerpt = newArticle.excerpt.replace(/'/g, "\\'");
      const escapedSeoTitle = newArticle.seoTitle.replace(/'/g, "\\'");
      const escapedSeoDescription = newArticle.seoDescription.replace(/'/g, "\\'");
      
      // Insert new article at the beginning of the array
      const articleCode = `  {
    id: '${newArticle.id}',
    title: '${escapedTitle}',
    slug: '${newArticle.slug}',
    excerpt: '${escapedExcerpt}',
    content: \`${escapedContent}\`,
    author: '${newArticle.author}',
    publishedAt: '${newArticle.publishedAt}',
    featuredImage: '${newArticle.featuredImage}',
    tags: ${JSON.stringify(newArticle.tags)},
    category: '${newArticle.category}',
    readTime: ${newArticle.readTime},
    seoTitle: '${escapedSeoTitle}',
    seoDescription: '${escapedSeoDescription}'
  },`;
      
      const existingArticles = exportMatch[2].trim();
      const newContent = content.replace(
        exportMatch[0],
        `${exportMatch[1]}\n${articleCode}${existingArticles ? '\n' + existingArticles : ''}\n${exportMatch[3]}`
      );
      
      await fs.writeFile(blogDataPath, newContent);
      await log(`✅ Added new article: ${newArticle.title}`);
      return true;
    }
  } catch (error) {
    await log(`❌ Error updating blog data: ${error.message}`);
    return false;
  }
  
  return false;
}

// Main test function
async function runTest() {
  await log('🧪 Starting blog generation test');
  
  // Pick a random topic
  const topic = testTopics[Math.floor(Math.random() * testTopics.length)];
  await log(`📝 Generating article: ${topic.title}`);
  
  // Generate article
  const article = await generateTestArticle(topic);
  
  // Update blog data
  const success = await updateBlogData(article);
  
  if (success) {
    await log(`✅ Test complete - Generated: ${article.title}`);
    console.log('\n🎉 Test article generated successfully!');
    console.log(`📰 Title: ${article.title}`);
    console.log(`🏷️  Category: ${article.category}`);
    console.log(`📖 Read Time: ${article.readTime} minutes`);
    console.log(`🏃‍♂️ Run 'npm run blog:monitor' to see updated statistics`);
  } else {
    await log('❌ Test failed - Could not generate article');
    console.log('❌ Test failed');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().catch(console.error);
}

export { runTest, generateTestArticle, updateBlogData };