import Link from 'next/link';
import { ArrowRight, CheckCircle, HelpCircle, Leaf, Mail, ShieldCheck } from 'lucide-react';
import Layout from './Layout';
import SEO from './SEO';

export interface SeoProductCard {
  name: string;
  href: string;
  bestFor: string;
  description: string;
}

export interface SeoFaq {
  question: string;
  answer: string;
}

interface SeoProblemLandingPageProps {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta?: string;
  secondaryHref?: string;
  problems: string[];
  solutionSteps: string[];
  products: SeoProductCard[];
  faqs: SeoFaq[];
  keywords: string[];
  audienceNote: string;
}

export default function SeoProblemLandingPage({
  slug,
  eyebrow,
  title,
  description,
  primaryCta,
  primaryHref,
  secondaryCta = 'Request Bulk Quote',
  secondaryHref = 'mailto:natureswaysoil@gmail.com?subject=Nature%27s%20Way%20Soil%20Quote%20Request',
  problems,
  solutionSteps,
  products,
  faqs,
  keywords,
  audienceNote,
}: SeoProblemLandingPageProps) {
  const pageUrl = `https://natureswaysoil.com/${slug}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SEO title={`${title} | Nature's Way Soil`} description={description} url={pageUrl} type="website" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Layout>
        <section className="bg-gradient-to-br from-green-50 via-white to-amber-50 py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                <Leaf className="h-4 w-4" />
                {eyebrow}
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
                {title}
              </h1>
              <p className="mb-8 text-xl leading-relaxed text-gray-700">{description}</p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center justify-center rounded-lg bg-nature-green-600 px-6 py-4 font-bold text-white transition-colors hover:bg-nature-green-700"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href={secondaryHref}
                  className="inline-flex items-center justify-center rounded-lg border-2 border-nature-green-600 px-6 py-4 font-bold text-nature-green-700 transition-colors hover:bg-green-50"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {secondaryCta}
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-nature-green-100">
                <ShieldCheck className="h-8 w-8 text-nature-green-700" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Best fit for</h2>
              <p className="mb-6 leading-relaxed text-gray-700">{audienceNote}</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Problems this page helps solve</h2>
              <p className="text-lg text-gray-600">Searchers usually arrive with a problem. These pages move them from problem to product or quote request.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {problems.map((problem) => (
                <div key={problem} className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <CheckCircle className="mb-4 h-7 w-7 text-nature-green-600" />
                  <p className="font-semibold leading-relaxed text-gray-800">{problem}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-green-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-nature-green-700">Simple plan</p>
                <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">How Nature&apos;s Way Soil recommends handling it</h2>
                <p className="text-lg leading-relaxed text-gray-700">Use this section as the bridge between education and the product recommendation. It keeps the page useful for Google while giving buyers a clear next step.</p>
              </div>
              <div className="space-y-4">
                {solutionSteps.map((step, index) => (
                  <div key={step} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-nature-green-600 font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-nature-green-700">Recommended products</p>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Start with the product that matches the job</h2>
              <p className="text-lg text-gray-600">Each recommendation links visitors to a product page, a funnel page, or a quote request path.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div key={product.name} className="flex flex-col rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg">
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">{product.name}</h3>
                  <p className="mb-4 text-sm font-semibold text-nature-green-700">Best for: {product.bestFor}</p>
                  <p className="mb-6 flex-1 leading-relaxed text-gray-600">{product.description}</p>
                  <Link href={product.href} className="inline-flex items-center font-bold text-nature-green-700 hover:text-nature-green-800">
                    View next step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <HelpCircle className="mx-auto mb-4 h-10 w-10 text-nature-green-600" />
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Frequently asked questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <summary className="cursor-pointer text-lg font-bold text-gray-900">{faq.question}</summary>
                  <p className="mt-4 leading-relaxed text-gray-700">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
