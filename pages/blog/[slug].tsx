import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { 
  getAllBlogArticles, 
  getBlogArticleBySlug, 
  getRelatedBlogArticles, 
  BlogArticle 
} from '../../data/blog';

interface BlogArticlePageProps {
  article: BlogArticle;
  relatedArticles: BlogArticle[];
}

export default function BlogArticlePage({ article, relatedArticles }: BlogArticlePageProps) {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateReadingProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Convert markdown-style headers to HTML
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return `<h1 key=${index} class="text-3xl font-bold text-gray-900 mb-6 mt-8">${line.slice(2)}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 key=${index} class="text-2xl font-bold text-gray-900 mb-4 mt-6">${line.slice(3)}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 key=${index} class="text-xl font-semibold text-gray-900 mb-3 mt-5">${line.slice(4)}</h3>`;
        } else if (line.startsWith('**') && line.endsWith('**')) {
          return `<p key=${index} class="font-bold text-gray-900 mb-3">${line.slice(2, -2)}</p>`;
        } else if (line.trim() === '') {
          return '<br />';
        } else if (line.startsWith('- ')) {
          return `<li key=${index} class="text-gray-700 mb-1">${line.slice(2)}</li>`;
        } else {
          return `<p key=${index} class="text-gray-700 mb-4 leading-relaxed">${line}</p>`;
        }
      })
      .join('');
  };

  // Check if article has video
  const videoUrl = `/videos/blog/${article.slug}.mp4`;
  const videoWebmUrl = `/videos/blog/${article.slug}.webm`;
  const videoPosterUrl = `/videos/blog/${article.slug}-poster.jpg`;

  return (
    <Layout>
      <Head>
        <title>{article.seoTitle || article.title} - Nature&apos;s Way Soil Blog</title>
        <meta 
          name="description" 
          content={article.seoDescription || article.excerpt}
        />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.featuredImage} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={article.author} />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:section" content={article.category} />
        {article.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={`https://natureswaysoil.com/blog/${article.slug}`} />
      </Head>

      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-nature-green-600 z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <article className="bg-white">
        {/* Hero Section with Video/Image */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-700 text-white overflow-hidden">
          {/* Background Video or Image */}
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-40"
              poster={videoPosterUrl}
            >
              <source src={videoWebmUrl} type="video/webm" />
              <source src={videoUrl} type="video/mp4" />
              {/* Fallback to featured image */}
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover opacity-40"
                priority
              />
            </video>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm">
                <li><Link href="/" className="hover:text-nature-green-300">Home</Link></li>
                <li className="text-gray-300">/</li>
                <li><Link href="/blog" className="hover:text-nature-green-300">Blog</Link></li>
                <li className="text-gray-300">/</li>
                <li className="text-nature-green-300">{article.category}</li>
              </ol>
            </nav>

            {/* Article Meta */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-nature-green-600 text-white text-sm font-semibold rounded-full mb-4">
                {article.category}
              </span>
              <div className="flex items-center space-x-4 text-gray-300 text-sm">
                <span>By {article.author}</span>
                <span>•</span>
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
                <span>•</span>
                <span>{article.readTime} min read</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-200 leading-relaxed max-w-3xl">
              {article.excerpt}
            </p>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-nature-green-100 text-nature-green-600 text-sm font-medium rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-nature-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{article.author}</h3>
                <p className="text-gray-600 mt-1">
                  Expert gardening team at Nature's Way Soil, dedicated to helping gardeners grow abundant, 
                  healthy plants using sustainable and organic methods.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-nature-green-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Put This Knowledge to Work?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Give your garden the foundation it needs with our premium organic soil mixes. 
              Specially formulated for healthy plant growth and sustainable gardening.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-nature-green-600 text-white font-semibold rounded-lg hover:bg-nature-green-700 transition-colors"
            >
              Shop Premium Soil Mixes
              <svg 
                className="ml-2 w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M9 19a2 2 0 11-4 0 2 2 0 014 0zM20 19a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <article
                    key={relatedArticle.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {relatedArticle.featuredImage ? (
                        <Image
                          src={relatedArticle.featuredImage}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-nature-green-100">
                          <span className="text-nature-green-600 text-6xl">🌱</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-nature-green-600 bg-nature-green-100 rounded-full mb-3">
                        {relatedArticle.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        <Link 
                          href={`/blog/${relatedArticle.slug}`}
                          className="hover:text-nature-green-600 transition-colors"
                        >
                          {relatedArticle.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {relatedArticle.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(relatedArticle.publishedAt)}</span>
                        <span>{relatedArticle.readTime} min read</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = getAllBlogArticles();
  const paths = articles.map((article) => ({
    params: { slug: article.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return {
      notFound: true,
    };
  }

  const relatedArticles = getRelatedBlogArticles(article, 3);

  return {
    props: {
      article,
      relatedArticles,
    },
    revalidate: 3600, // Revalidate every hour
  };
};