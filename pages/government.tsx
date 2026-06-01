import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

const contact = {
  phone: '(252) 560-7390',
  phoneHref: 'tel:+12525607390',
  email: 'natureswaysoil@gmail.com',
  emailHref: 'mailto:natureswaysoil@gmail.com?subject=Government%20quote%20request',
};

const registrationDetails = {
  cage: '9TYW7',
  uei: 'MM7NWZETLWR3',
  primaryNaics: '325314',
  primaryNaicsLabel: 'Fertilizer Manufacturing',
  additionalNaics: ['325998', '424910', '561730', '115112'],
};

const buyerBadges = [
  'HUBZone Certified',
  'SAM Registered',
  'GPC / Micro-Purchase Ready',
  'USDA BioPreferred products where applicable',
];

const buyerProblems = [
  {
    title: 'Grounds & Facility Maintenance',
    text: 'Concentrated soil conditioners and turf-support products for public lawns, campuses, medians, parks, and common areas.',
  },
  {
    title: 'Housing, Kennels & Pet Areas',
    text: 'Outdoor odor-control and lawn-spot support for base housing, pet relief areas, kennels, patios, turf, and hard surfaces.',
  },
  {
    title: 'DOT, FAA & Right-of-Way Turf',
    text: 'Liquid products that are easy to store, dilute, and apply for stressed turf, compacted soils, landscaped edges, and recovery areas.',
  },
  {
    title: 'Sustainability & Soil Restoration',
    text: 'Biobased soil-building products including humic, fulvic, kelp, compost, worm castings, and activated biochar options.',
  },
];

const featuredProducts = [
  {
    name: 'Pet Urine Eliminator & Hard Surface Cleaner',
    bestFor: 'VA facilities, housing, kennels, pet areas, patios, artificial turf, concrete, and outdoor public spaces',
    blurb: '1-gallon concentrate that makes up to 128 gallons of cleaning solution. Designed for odor-causing residue on outdoor surfaces and pet-use areas.',
    sizes: '1 gal concentrate · Larger quantities quoted',
    cta: 'Request odor-control pricing',
  },
  {
    name: 'Liquid Soil Conditioner / Lawn Recovery System',
    bestFor: 'NCDOT, FAA, public grounds, recreation areas, facility lawns, and compacted or stressed soils',
    blurb: 'Humic, fulvic, kelp, and soil-support ingredients for root-zone support, water movement, and visible turf recovery programs.',
    sizes: '32 oz, 1 gal, 2.5 gal, 5 gal formats available',
    cta: 'Request lawn recovery pricing',
  },
  {
    name: 'Liquid Biochar Soil Amendment',
    bestFor: 'Soil restoration, sustainability programs, landscape beds, planting projects, and poor-soil recovery',
    blurb: 'Activated liquid biochar option for agencies and contractors looking for a concentrated biobased soil-building product.',
    sizes: '1 gal and project quantities quoted',
    cta: 'Request biochar pricing',
  },
  {
    name: 'Hay, Pasture & Lawn Fertilizer',
    bestFor: 'Large turf areas, public grounds, right-of-way edges, recreation areas, food plots, and facility lawns',
    blurb: 'Microbial fertilizer blend positioned for grass recovery, greener grounds, and larger-area maintenance programs.',
    sizes: '1 gal, 2.5 gal, 5 gal, and bulk options',
    cta: 'Request turf fertilizer pricing',
  },
  {
    name: 'Enhanced Living Compost with Biochar & Worm Castings',
    bestFor: 'Landscape beds, planting projects, soil restoration, municipal beautification, and contractor installation work',
    blurb: 'Living compost blend with worm castings, activated biochar, and weed-free aged compost for soil improvement projects.',
    sizes: 'Bagged product · Project quantities quoted',
    cta: 'Request compost pricing',
  },
  {
    name: 'Liquid Humic & Fulvic Acid with Kelp',
    bestFor: 'Grounds crews, landscapers, athletic fields, campus lawns, and routine turf support',
    blurb: 'Professional-grade liquid soil conditioner for root-zone support, stressed grass, and general grounds maintenance.',
    sizes: '1 gal, 2.5 gal, and 5 gal formats',
    cta: 'Request soil conditioner pricing',
  },
];

const orderingOptions = [
  {
    title: '1. Scan or Visit This Page',
    text: 'Use the QR code from the business card or capability statement to review products, registrations, and purchasing options.',
  },
  {
    title: '2. Request a Quote or Invoice',
    text: 'Send products, quantities, ship-to address, need-by date, and tax-exempt status. We can prepare a quote or invoice.',
  },
  {
    title: '3. Pay by GPC, Card, ACH, or Invoice',
    text: 'Government purchase cards and micro-purchase orders are supported. Larger or recurring orders can be quoted directly.',
  },
];

const capabilityStats = [
  ['CAGE', registrationDetails.cage],
  ['UEI', registrationDetails.uei],
  ['Primary NAICS', `${registrationDetails.primaryNaics} - ${registrationDetails.primaryNaicsLabel}`],
  ['Service Area', 'Nationwide shipping; Southeast focus'],
  ['Business Type', 'Small family farm manufacturer'],
  ['Formats', '1 gal · 2.5 gal · 5 gal · bulk quoted'],
];

export default function GovernmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    products: '',
    shipping: '',
  });
  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'submitting' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: 'submitting', message: '' });

    const messageSections = [
      formData.products.trim() ? `Products / Quantity:\n${formData.products.trim()}` : '',
      formData.shipping.trim()
        ? `Shipping Address / Need-by Date:\n${formData.shipping.trim()}`
        : '',
    ].filter(Boolean);

    try {
      const response = await fetch('/api/government-rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agency: formData.organization.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          agencyType: 'Government / Institutional Buyer',
          useCase: formData.products.trim() || 'Quote request',
          message: messageSections.join('\n\n') || 'Quote request submitted from government page.',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to submit request');
      }

      setFormData({
        name: '',
        organization: '',
        email: '',
        phone: '',
        products: '',
        shipping: '',
      });
      setSubmitState({
        status: 'success',
        message: 'Your request has been sent. We will follow up with pricing or invoice details.',
      });
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to submit request right now.',
      });
    }
  }

  return (
    <>
      <Head>
        <title>Government Purchasing | Nature&apos;s Way Soil</title>
        <meta
          name="description"
          content="HUBZone certified and SAM registered supplier of biobased soil restoration, turf recovery, liquid biochar, compost, and outdoor facility-care products. GPC and micro-purchase ready."
        />
      </Head>

      <main className="bg-[#f7f8f3] text-[#172317]">
        <div className="bg-[#143d1f] px-4 py-2 text-center text-sm font-semibold text-white">
          HUBZone Certified • SAM Registered • GPC / Micro-Purchase Ready • Quotes & Invoices Available
        </div>

        <section className="relative overflow-hidden border-b border-[#d8dfcf] bg-gradient-to-br from-[#edf4e6] via-[#f7f8f3] to-white">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#dcead2] blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-20">
            <div>
              <p className="inline-flex rounded-full border border-[#bfd1b4] bg-white px-4 py-1 text-sm font-semibold text-[#315b28] shadow-sm">
                Government & Institutional Purchasing
              </p>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-[#12351c] sm:text-5xl lg:text-6xl">
                Biobased soil restoration and outdoor facility-care products for public buyers.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#435143]">
                Nature&apos;s Way Soil supplies concentrated products for grounds maintenance,
                turf recovery, pet-use areas, landscaping, soil restoration, and facility
                support. We are set up for simplified acquisition, GPC purchases, quote
                requests, and larger institutional orders.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="#featured-products"
                  className="rounded-xl bg-[#315b28] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24461f]"
                >
                  View Buyer-Focused Products
                </Link>
                <Link
                  href="#quote-request"
                  className="rounded-xl border border-[#c6cebc] bg-white px-5 py-3 text-sm font-semibold text-[#1f2a1f] shadow-sm transition hover:bg-[#f1f4ec]"
                >
                  Request Quote / Invoice
                </Link>
                <a
                  href={contact.phoneHref}
                  className="rounded-xl border border-[#c6cebc] bg-white px-5 py-3 text-sm font-semibold text-[#1f2a1f] shadow-sm transition hover:bg-[#f1f4ec]"
                >
                  Call {contact.phone}
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-[#315b28]">
                {buyerBadges.map((badge) => (
                  <span key={badge} className="rounded-full border border-[#bfd1b4] bg-white px-3 py-1">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#d6decd] bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#143d1f]">Quick buyer information</h2>
              <dl className="mt-6 grid gap-4">
                {capabilityStats.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-[#f4f7ef] p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[#60725a]">{label}</dt>
                    <dd className="mt-1 text-base font-semibold text-[#1f2a1f]">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 rounded-2xl bg-[#143d1f] p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#dbead5]">
                  Best conference fit
                </p>
                <p className="mt-2 text-sm leading-6">
                  DOT, FAA, VA, GSA, Corps of Engineers, Navy, Interior, housing,
                  parks, public grounds, and prime contractors handling grounds or
                  facility-maintenance supply.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#567547]">
              What buyers can source from us
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Practical products for public grounds and facilities</h2>
            <p className="mt-4 text-base leading-7 text-[#4f5a4f]">
              Lead with these use cases when purchasing teams need simple products that fit
              grounds maintenance, turf recovery, sustainability, housing, and facility-care needs.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {buyerProblems.map((item) => (
              <div key={item.title} className="rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#143d1f]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="featured-products" className="bg-[#eef3e8]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#567547]">
                Featured products for agencies and primes
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Top products to request for quote</h2>
              <p className="mt-4 text-base leading-7 text-[#4f5a4f]">
                These are the best-fit products for the current government buyer audience:
                grounds, DOT/FAA turf, VA and housing, kennels, public landscapes, and
                sustainability-minded soil restoration.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.map((product) => (
                <div key={product.name} className="flex flex-col rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#143d1f]">{product.name}</h3>
                  <p className="mt-3 text-sm font-medium text-[#456d3b]">Best fit: {product.bestFor}</p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#4f5a4f]">{product.blurb}</p>
                  <p className="mt-4 rounded-2xl bg-[#f4f7ef] p-3 text-sm font-semibold text-[#2f4d25]">{product.sizes}</p>
                  <Link
                    href="#quote-request"
                    className="mt-5 inline-flex justify-center rounded-xl border border-[#c8d2bf] bg-[#f7f8f3] px-4 py-2 text-sm font-semibold text-[#2d3a2d] transition hover:bg-[#edf2e7]"
                  >
                    {product.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-3xl border border-[#d6decd] bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#567547]">How to order</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Simple path for cardholders and purchasing teams</h2>
              <div className="mt-8 grid gap-5">
                {orderingOptions.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-[#f4f7ef] p-5">
                    <h3 className="font-semibold text-[#143d1f]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#4f5a4f]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#d6decd] bg-[#143d1f] p-8 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#dbead5]">Capability snapshot</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Small manufacturer, practical acquisition</h2>
              <p className="mt-4 text-base leading-7 text-[#edf3e7]">
                Nature&apos;s Way Soil &amp; Vermicompost LLC manufactures biobased liquid
                and dry soil amendments for lawn, landscape, garden, pasture, and
                facility grounds maintenance. Products are available for quotes,
                samples, recurring supply, and larger pack sizes upon request.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ['Micro-purchase ready', 'Straightforward quote and invoice support'],
                  ['Concentrated formats', 'Reduced storage and freight impact'],
                  ['Commercial traction', '$100K+ marketplace sales history'],
                  ['Family farm supplier', 'Small-batch production and direct support'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#dbead5]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="quote-request" className="bg-[#eef3e8]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#567547]">Quote request</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Request an invoice, quote, or product recommendation</h2>
                <p className="mt-4 text-base leading-7 text-[#495549]">
                  Send products, quantities, shipping destination, tax-exempt status,
                  and need-by date. We can respond with pricing, an invoice, or a
                  recommendation based on your facility or grounds issue.
                </p>

                <div className="mt-8 rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm">
                  <h3 className="font-semibold">Helpful details to include</h3>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a4f]">
                    <p>• Agency, organization, contractor, or facility name</p>
                    <p>• Product name(s), quantity, and preferred size</p>
                    <p>• Use case: turf recovery, odor control, soil restoration, public grounds, or facility care</p>
                    <p>• Shipping address and need-by date</p>
                    <p>• Tax-exempt status, GPC, ACH, or invoice preference</p>
                  </div>
                  <div className="mt-6 rounded-2xl bg-[#f4f7ef] p-4 text-sm leading-6 text-[#2d3a2d]">
                    Prefer email? Contact <a className="font-semibold underline" href={contact.emailHref}>{contact.email}</a> or call{' '}
                    <a className="font-semibold underline" href={contact.phoneHref}>{contact.phone}</a>.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm">
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Name</span>
                    <input
                      name="name"
                      required
                      value={formData.name}
                      onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Agency / Organization</span>
                    <input
                      name="organization"
                      required
                      value={formData.organization}
                      onChange={(event) => setFormData((current) => ({ ...current, organization: event.target.value }))}
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Phone</span>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Products / Quantity / Use Case</span>
                    <textarea
                      name="products"
                      rows={5}
                      required
                      value={formData.products}
                      onChange={(event) => setFormData((current) => ({ ...current, products: event.target.value }))}
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                      placeholder="Example: Pet Urine Eliminator - 12 gallons for kennel and pet relief area cleaning"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Shipping Address / Need-by Date</span>
                    <textarea
                      name="shipping"
                      rows={4}
                      value={formData.shipping}
                      onChange={(event) => setFormData((current) => ({ ...current, shipping: event.target.value }))}
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  {submitState.status !== 'idle' && (
                    <p
                      className={`text-sm ${
                        submitState.status === 'success' ? 'text-[#2f6b2f]' : 'text-[#8a3b32]'
                      }`}
                    >
                      {submitState.message || 'Submitting your request...'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitState.status === 'submitting'}
                    className="rounded-xl bg-[#315b28] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24461f] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitState.status === 'submitting' ? 'Submitting...' : 'Submit Government Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {[
              {
                question: 'Do you accept Government Purchase Cards?',
                answer: 'Yes. Eligible orders can be handled through secure card payment or by invoice request depending on the order details.',
              },
              {
                question: 'Can you quote larger or recurring orders?',
                answer: 'Yes. Send the products, quantities, ship-to address, and need-by date. We can quote larger quantities, recurring supply, and pallet-scale needs where available.',
              },
              {
                question: 'Can tax-exempt buyers request an invoice?',
                answer: 'Yes. Contact us before checkout or submit the quote form so the order can be handled correctly.',
              },
              {
                question: 'Which products should government buyers start with?',
                answer: 'For the current buyer audience, start with Pet Urine Eliminator & Hard Surface Cleaner, Liquid Soil Conditioner / Lawn Recovery System, Liquid Biochar, Hay/Pasture/Lawn Fertilizer, and Enhanced Living Compost.',
              },
            ].map((item) => (
              <details key={item.question} className="rounded-2xl border border-[#d6decd] bg-white p-5 shadow-sm">
                <summary className="cursor-pointer font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
