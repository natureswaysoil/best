import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { getAllBlogArticles, getAllBlogCategories, BlogArticle } from '../data/blog';

interface BlogPageProps {
  articles: BlogArticle[];
  categories: string[];
}

export default function BlogPage({ articles, categories }: BlogPageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <Head>
        <title>Gardening Blog - Nature&apos;s Way Soil</title>
        <meta 
          name="description" 
          content="Expert gardening tips, soil health advice, and sustainable growing techniques from Nature's Way Soil. Learn how to grow abundant gardens naturally."
        />
        <meta property="og:title" content="Gardening Blog - Nature's Way Soil" />
        <meta property="og:description" content="Expert gardening tips and sustainable growing techniques" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="bg-gradient-to-b from-nature-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Gardening Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Expert tips, sustainable techniques, and practical advice to help you grow abundant, healthy gardens naturally. 
              From soil health to water conservation, discover the secrets of successful gardening.
            </p>
          </div>

          {/* Categories Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full bg-nature-green-600 text-white font-medium hover:bg-nature-green-700 transition-colors"
              >
                All Articles
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className="px-4 py-2 rounded-full bg-white text-nature-green-600 border-2 border-nature-green-600 font-medium hover:bg-nature-green-50 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Featured Image */}
                <div className="relative h-48 bg-gray-200">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
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

                {/* Article Content */}
                <div className="p-6">
                  {/* Category and Read Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-nature-green-600 bg-nature-green-100 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {article.readTime} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link 
                      href={`/blog/${article.slug}`}
                      className="hover:text-nature-green-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>By {article.author}</span>
                      <span>•</span>
                      <time dateTime={article.publishedAt}>
                        {formatDate(article.publishedAt)}
                      </time>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Read More Button */}
                  <div className="mt-6">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center text-nature-green-600 font-medium hover:text-nature-green-700 transition-colors"
                    >
                      Read Full Article
                      <svg 
                        className="ml-2 w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-nature-green-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Put These Tips to Work?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Start your gardening success with our premium organic soil mixes. 
              Specially formulated to give your plants the foundation they need to thrive.
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
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const articles = getAllBlogArticles();
  const categories = getAllBlogCategories();

  return {
    props: {
      articles,
      categories,
    },
    revalidate: 3600, // Revalidate every hour
  };
};