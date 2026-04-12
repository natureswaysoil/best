import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

const contact = {
  phone: '(252) 560-7390',
  phoneHref: 'tel:+12525607390',
  email: 'sales@natureswaysoil.com',
  emailHref: 'mailto:sales@natureswaysoil.com',
};

const credentials = [
  'Government Purchase Cards (GPC) accepted',
  'Micro-purchase ready for orders under $15,000',
  'Invoice and ACH options available',
  'Tax-exempt purchasing supported',
  'HUBZone Certified Small Business',
  'USDA BioPreferred product supplier',
  'SAM registered - active and compliant',
  'Fast nationwide shipping',
];

const registrationDetails = {
  cage: '9TYW7',
  uei: 'MM7NWZETLWR3',
  primaryNaics: '325314',
  primaryNaicsLabel: 'Fertilizer Manufacturing',
  additionalNaics: ['325998', '562910', '541620', '561730'],
};

const orderingOptions = [
  {
    title: 'Order Online',
    text: 'Use your Government Purchase Card to place eligible orders directly through our secure Stripe checkout.',
  },
  {
    title: 'Request Invoice',
    text: 'Send us your item list, quantity, and shipping address. We can issue an invoice for card or ACH payment.',
  },
  {
    title: 'Bulk / Institutional Orders',
    text: 'Contact us for larger quantities, pallet shipments, recurring supply needs, or public-sector buying questions.',
  },
];

const featuredProducts = [
  {
    name: 'Dog Urine Neutralizer & Lawn Repair',
    href: '#quote-request',
    useCase: 'Base housing, common areas, pet relief areas, and kennel-adjacent turf',
    blurb: 'Helps address yellow spots and lawn stress from pet urine in high-use outdoor areas.',
    price: 'Starting at $29.99/qt · $59.99/gal',
    cta: 'Request Pricing',
  },
  {
    name: 'Seaweed & Humic Acid Lawn Treatment',
    href: '#quote-request',
    useCase: 'Grounds crews, athletic fields, golf, and routine turf support',
    blurb: 'Liquid soil revitalizer for greener lawns, stronger root systems, and healthier turf.',
    price: 'Starting at $19.00/qt',
    cta: 'Request Pricing',
  },
  {
    name: 'Liquid Humic & Fulvic Acid with Kelp',
    href: '#quote-request',
    useCase: 'Soil conditioning, root-zone support, and large-area lawn care',
    blurb: 'Professional-grade liquid humic and fulvic acid blend enriched with organic kelp extract.',
    price: 'Starting at $69.99/2.5 gal',
    cta: 'Request Pricing',
  },
  {
    name: 'Liquid Biochar',
    href: '#quote-request',
    useCase: 'Soil restoration, NPDES stormwater compliance, PFAS-impacted sites, new construction, and environmental land-care programs',
    blurb: 'Activated liquid biochar for public-sector soil and water programs. Peer-reviewed research supports biochar for PFAS immobilization, stormwater filtration, and disturbed-soil restoration on construction sites.',
    price: '$79.99/gal · Volume pricing available',
    cta: 'Request Liquid Biochar Pricing',
  },
  {
    name: 'Horticultural Activated Charcoal (Dry Biochar)',
    href: '#quote-request',
    useCase: 'In-soil amendment, bioretention systems, stormwater filter media, new construction soil restoration, and PFAS-impacted site remediation',
    blurb: 'Activated charcoal/biochar for direct soil incorporation. Ideal for bioretention cells, bioslopes, filter strips, and post-construction soil restoration. Research demonstrates up to 98–100% reduction in PFAS leaching at 5% soil amendment rates.',
    price: '$29.99/4 qt · Bulk/project quantities quoted',
    cta: 'Request Dry Biochar Pricing',
  },
  {
    name: 'Hay, Pasture & Lawn Fertilizer',
    href: '#quote-request',
    useCase: 'Large turf areas, pastures, recreation areas, and facility grounds',
    blurb: 'Microbial fertilizer blend designed for healthy grass growth and greener grounds. Covers up to 5 acres per gallon at 1:50 dilution — approximately $20/acre at retail, less than half the cost of comparable granular options.',
    price: 'Starting at $99.99/2.5 gal · Bulk/pallet pricing available',
    cta: 'Request Pricing',
  },
  {
    name: 'Enhanced Living Compost with Fermented Duckweed',
    href: '#quote-request',
    useCase: 'Landscape beds, planting projects, and soil restoration work',
    blurb: 'A living compost blend with worm castings, activated biochar, and weed-free aged compost.',
    price: 'Starting at $29.99/10 lbs · Project quantities quoted',
    cta: 'Request Pricing',
  },
];

const useCases = [
  {
    title: 'Base Housing & Grounds',
    text: 'Products for lawn recovery, soil support, and visible outdoor areas where durability and appearance matter.',
  },
  {
    title: 'Golf, Recreation & Athletic Areas',
    text: 'Turf-support products for maintained public spaces, recreation areas, and higher-visibility landscapes.',
  },
  {
    title: 'Animal Facilities & Kennels',
    text: 'Outdoor odor and turf-support products for pet and working-animal environments.',
  },
  {
    title: 'Sustainability & Land Care',
    text: 'Biobased, soil-focused products including Liquid Biochar for agencies and institutions prioritizing long-term soil improvement, restoration, and environmental stewardship.',
  },
];

const biocharUses = [
  {
    title: 'PFAS Immobilization',
    text: 'Peer-reviewed research shows activated biochar at 5% soil amendment rates reduces PFAS leaching by 98–100% in contaminated soils — a priority issue at military installations nationwide.',
  },
  {
    title: 'Stormwater & NPDES Compliance',
    text: 'Biochar is a recognized stormwater Best Management Practice (BMP) in multiple states. Research shows 60%+ removal of nitrogen and phosphorus from highway and construction-site runoff at low amendment rates.',
  },
  {
    title: 'New Construction & Disturbed Soils',
    text: 'Construction site soil compaction reduces infiltration and increases runoff. Biochar-amended soils restore porosity, reduce stormwater volume, and support vegetation establishment — recognized by NC DEQ as a stormwater BMP.',
  },
  {
    title: 'Grounds & Sustainability Programs',
    text: 'A natural fit for agencies pursuing biobased purchasing, carbon sequestration goals, and long-term soil health programs. USDA BioPreferred designated.',
  },
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
        message: 'Your request has been sent. Our government sales team will follow up within one business day.',
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
        <title>Government Purchases | Nature's Way Soil</title>
        <meta
          name="description"
          content="Government Purchase Cards accepted. Nature's Way Soil supports federal, state, local, school, and institutional buyers with fast ordering, invoice options, and environmentally focused products."
        />
      </Head>

      <main className="bg-[#f7f8f3] text-[#1f2a1f]">
        <div className="bg-[#2f4d25] px-4 py-2 text-center text-sm font-medium text-white">
          Government Purchase Cards Accepted | Micro-Purchase Ready | Request Invoice or Quote
        </div>

        <section className="border-b border-[#d8dfcf] bg-gradient-to-b from-[#edf4e6] to-[#f7f8f3]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="max-w-4xl">
              <p className="inline-flex rounded-full border border-[#bfd1b4] bg-white px-4 py-1 text-sm font-medium text-[#365c2b]">
                Government & Institutional Purchasing
              </p>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Government Purchase Cards Accepted
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#445044]">
                Nature&apos;s Way Soil supports federal, state, local, school, and
                institutional buyers with HUBZone-certified, SAM-registered,
                BioPreferred product solutions for grounds, housing, turf, and
                outdoor facility care.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="#featured-products"
                  className="rounded-xl bg-[#3e6b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#335826]"
                >
                  View Government-Friendly Products
                </Link>
                <Link
                  href="#quote-request"
                  className="rounded-xl border border-[#c6cebc] bg-white px-5 py-3 text-sm font-semibold text-[#1f2a1f] transition hover:bg-[#f1f4ec]"
                >
                  Request Invoice / Quote
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-[#365c2b]">
                <span className="rounded-full border border-[#bfd1b4] bg-white px-3 py-1">
                  CAGE: {registrationDetails.cage}
                </span>
                <span className="rounded-full border border-[#bfd1b4] bg-white px-3 py-1">
                  UEI: {registrationDetails.uei}
                </span>
                <span className="rounded-full border border-[#bfd1b4] bg-white px-3 py-1">
                  NAICS {registrationDetails.primaryNaics}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-[#d6decd] bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#567547]">
                Naturally Stronger Soil Starts Here
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                A simpler buying path for public-sector customers
              </h2>
              <p className="mt-4 text-base leading-7 text-[#485348]">
                Nature&apos;s Way Soil makes it easy for cardholders, grounds teams,
                facility managers, and purchasing staff to order practical,
                soil-focused products without a complicated sales process.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {credentials.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#d6decd] bg-[#f4f7ef] px-4 py-4 text-sm font-medium text-[#2d3a2d]"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#d6decd] bg-[#2f4d25] p-8 text-white shadow-sm">
              <h3 className="text-xl font-semibold">Registration Details</h3>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ['HUBZone', 'Certified Small Business'],
                  ['BioPreferred', 'USDA Certified Product'],
                  ['SAM Registered', 'Active & Compliant'],
                  ['Micro-Purchase', 'Ready for Orders < $15K'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-[#dfead8]">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-white p-5 text-[#1f2a1f]">
                <h4 className="text-base font-semibold">Registration Details</h4>

                <dl className="mt-4 space-y-4 text-sm">
                  <div className="border-b border-[#e3e8dc] pb-3">
                    <dt className="font-medium text-[#5a655a]">CAGE Code</dt>
                    <dd className="mt-1 text-base font-semibold text-[#1f2a1f]">
                      {registrationDetails.cage}
                    </dd>
                  </div>

                  <div className="border-b border-[#e3e8dc] pb-3">
                    <dt className="font-medium text-[#5a655a]">UEI</dt>
                    <dd className="mt-1 text-base font-semibold text-[#1f2a1f]">
                      {registrationDetails.uei}
                    </dd>
                  </div>

                  <div className="border-b border-[#e3e8dc] pb-3">
                    <dt className="font-medium text-[#5a655a]">Primary NAICS</dt>
                    <dd className="mt-1 text-base font-semibold text-[#1f2a1f]">
                      {registrationDetails.primaryNaics}
                    </dd>
                    <dd className="mt-1 text-sm text-[#4f5a4f]">
                      {registrationDetails.primaryNaicsLabel}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-medium text-[#5a655a]">Additional NAICS</dt>
                    <dd className="mt-1 text-sm leading-6 text-[#1f2a1f]">
                      {registrationDetails.additionalNaics.join(', ')}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 space-y-3 text-sm leading-6 text-[#edf3e7]">
                <p>
                  <span className="font-semibold text-white">Phone:</span>{' '}
                  <a href={contact.phoneHref} className="underline underline-offset-2">
                    {contact.phone}
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-white">Email:</span>{' '}
                  <a
                    href={contact.emailHref}
                    className="underline underline-offset-2"
                  >
                    {contact.email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#eef3e8]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight">How to order</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {orderingOptions.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-[#c9d8bd] bg-white p-6 shadow-sm">
              <p className="text-sm leading-7 text-[#435143]">
                <span className="font-semibold">Note for buyers:</span> We accept
                Government Purchase Cards through secure Stripe checkout. Tax-exempt
                purchasing can be supported when requested before invoicing or checkout.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Common government and institutional use cases
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#eef3e8]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-3xl border border-[#d6decd] bg-white p-8 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#567547]">
                  Featured Sustainability Product
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Biochar for PFAS, Stormwater & Soil Restoration
                </h2>
                <p className="mt-4 text-base leading-7 text-[#495549]">
                  Available in liquid and dry activated forms. Peer-reviewed research supports biochar for PFAS immobilization, NPDES stormwater compliance, post-construction soil restoration, and long-term sustainability programs. USDA BioPreferred designated · HUBZone certified supplier.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {biocharUses.map((item) => (
                    <div key={item.title} className="rounded-2xl bg-[#f4f7ef] p-5">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#4f5a4f]">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    href="#quote-request"
                    className="rounded-xl bg-[#3e6b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#335826]"
                  >
                    Request Liquid Biochar Pricing
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-[#d6decd] bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold">Best-fit government uses</h3>
                <div className="mt-6 space-y-4 text-sm leading-6 text-[#4f5a4f]">
                  <p>
                    <strong>• Military installations:</strong> PFAS-impacted soil and groundwater mitigation programs
                  </p>
                  <p>
                    <strong>• Construction & DOT projects:</strong> post-construction soil restoration and NPDES stormwater BMP compliance
                  </p>
                  <p>
                    <strong>• Grounds & environmental staff:</strong> bioslope amendment, bioretention filter media, and sediment control
                  </p>
                  <p>
                    <strong>• Sustainability programs:</strong> USDA BioPreferred, carbon sequestration, and biobased purchasing goals
                  </p>
                </div>

                <div className="mt-8 rounded-2xl bg-[#f4f7ef] p-5">
                  <p className="text-sm font-semibold text-[#3e6b2f]">Available in two forms:</p>
                  <p className="mt-2 text-sm leading-6 text-[#4f5a4f]">
                    <strong>Liquid Biochar</strong> — $79.99/gal · Volume pricing available<br />
                    <strong>Dry Activated Charcoal</strong> — $29.99/4 qt · Bulk/project quantities quoted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="featured-products" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight">
              Featured products for public-sector buyers
            </h2>
            <p className="mt-4 text-base leading-7 text-[#495549]">
              These products align well with grounds, housing, outdoor care,
              and routine facility use cases. All links currently route to the
              quote form until product-page slugs are finalized.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <div
                key={product.name}
                className="rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#1f2a1f]">{product.name}</h3>
                <p className="mt-3 text-sm font-medium text-[#567547]">
                  Best fit: {product.useCase}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">{product.blurb}</p>
                <p className="mt-3 text-sm font-semibold text-[#2f4d25]">{product.price}</p>
                <Link
                  href={product.href}
                  className="mt-5 inline-flex rounded-xl border border-[#c8d2bf] bg-[#f7f8f3] px-4 py-2 text-sm font-semibold text-[#2d3a2d] transition hover:bg-[#edf2e7]"
                >
                  {product.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="quote-request" className="bg-[#eef3e8]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Request an invoice or quote
                </h2>
                <p className="mt-4 text-base leading-7 text-[#495549]">
                  Send us the products, quantities, shipping destination, and your
                  need-by date. We can respond with a quote or invoice for card or
                  ACH payment.
                </p>

                <div className="mt-8 rounded-3xl border border-[#d6decd] bg-white p-6">
                  <h3 className="font-semibold">Helpful details to include</h3>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[#4f5a4f]">
                    <p>• Agency or organization name</p>
                    <p>• Contact name, email, and phone</p>
                    <p>• Product name(s) and quantity</p>
                    <p>• Shipping address</p>
                    <p>• Need-by date</p>
                    <p>• Tax-exempt status, if applicable</p>
                    <p>• Popular request: Liquid Biochar for sustainability and soil-restoration projects</p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-[#d6decd] bg-white p-6 shadow-sm"
              >
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Name</span>
                    <input
                      name="name"
                      required
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, name: event.target.value }))
                      }
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Agency / Organization</span>
                    <input
                      name="organization"
                      required
                      value={formData.organization}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, organization: event.target.value }))
                      }
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
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, email: event.target.value }))
                      }
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Phone</span>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Products / Quantity</span>
                    <textarea
                      name="products"
                      rows={4}
                      required
                      value={formData.products}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, products: event.target.value }))
                      }
                      className="rounded-xl border border-[#cbd4c3] px-4 py-3 outline-none focus:border-[#567547]"
                      placeholder="Example: Liquid Biochar - 12 gallons"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">
                      Shipping Address / Need-by Date
                    </span>
                    <textarea
                      name="shipping"
                      rows={4}
                      value={formData.shipping}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, shipping: event.target.value }))
                      }
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
                    className="rounded-xl bg-[#3e6b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#335826]"
                  >
                    {submitState.status === 'submitting' ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>

          <div className="mt-8 space-y-4">
            <details className="rounded-2xl border border-[#d6decd] bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Do you accept Government Purchase Cards?
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">
                Yes. Eligible orders can be placed directly through our secure
                Stripe checkout.
              </p>
            </details>

            <details className="rounded-2xl border border-[#d6decd] bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Can we request pricing before ordering?
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">
                Yes. Use the quote form on this page for product pricing,
                invoice requests, quantities, or project-based needs.
              </p>
            </details>

            <details className="rounded-2xl border border-[#d6decd] bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Can we buy tax-exempt?
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">
                Yes. Contact us before checkout or request an invoice so we can
                help process the order correctly.
              </p>
            </details>

            <details className="rounded-2xl border border-[#d6decd] bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Do you support larger orders?
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#4f5a4f]">
                Yes. We can help with larger institutional quantities, recurring
                needs, and pallet-scale requests where available.
              </p>
            </details>
          </div>
        </section>
      </main>
    </>
  );
}
