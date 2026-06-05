import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function PastureLawnRecoveryPage() {
  return (
    <SeoProblemLandingPage
      slug="pasture-lawn-recovery"
      eyebrow="Large-area grass and turf recovery"
      title="Liquid Fertilizer for Hay, Pasture, Lawns & Large Public Grounds"
      description="A traffic landing page for pasture fertilizer, horse-safe lawn support, hay field recovery, food plots, recreation areas, and large turf maintenance."
      primaryCta="View Pasture Product"
      primaryHref="/product/NWS_021"
      secondaryCta="Request Bulk Quote"
      secondaryHref="/government#quote-request"
      problems={[
        'Thin grass in hay fields, horse pastures, food plots, and large lawns',
        'Large turf areas where granular fertilizer is expensive or difficult to spread',
        'Public grounds, parks, right-of-way edges, and recreation areas that need greener grass',
        'Small farms and landowners looking for easier liquid application options',
        'Grass that needs soil support plus plant nutrition during active growth',
        'Buyers comparing liquid pasture fertilizer, lawn fertilizer, and soil conditioners',
      ]}
      solutionSteps={[
        'Identify the acreage, grass type, current fertility program, and whether animals will use the area.',
        'Apply during active grass growth with appropriate dilution and water-in practices.',
        'Use humic, kelp, microbial, and nutrient support as part of a broader grass recovery plan.',
        'For larger properties, request pricing by gallons, acreage, or recurring seasonal supply.',
      ]}
      products={[
        {
          name: 'Horse Safe Hay, Pasture & Lawn Fertilizer',
          href: '/product/NWS_021',
          bestFor: 'hay, pasture, lawn, food plot, and large-area grass recovery',
          description: 'A liquid grass-support product for landowners, farms, and larger turf areas.',
        },
        {
          name: 'Liquid Humic & Fulvic Acid with Kelp',
          href: '/product/NWS_011',
          bestFor: 'soil conditioning alongside fertilizer programs',
          description: 'Use when the root zone needs more support than fertilizer alone can provide.',
        },
        {
          name: 'Government Grounds Quote',
          href: '/government#quote-request',
          bestFor: 'parks, campuses, public grounds, and recurring facility supply',
          description: 'Request quotes for larger quantities, tax-exempt purchasing, or public-sector supply needs.',
        },
      ]}
      faqs={[
        {
          question: 'Can one product be marketed to both farms and public grounds?',
          answer: 'Yes. The same grass-support product can be positioned for hay and pasture, large lawns, recreation areas, and facility grounds depending on the buyer.',
        },
        {
          question: 'Why use a liquid product for large grass areas?',
          answer: 'Liquid products can be easier to dilute, store, spray, and quote for buyers who already use sprayers, tanks, or maintenance equipment.',
        },
        {
          question: 'Should I combine it with soil conditioner?',
          answer: 'For weak grass, compacted soil, drought stress, or poor fertilizer response, pairing fertilizer with humic, fulvic, kelp, compost, or biochar can support a stronger recovery program.',
        },
        {
          question: 'Can I request bulk or pallet pricing?',
          answer: 'Yes. Use the government quote form for larger gallons, recurring supply, or institutional buying needs.',
        },
      ]}
      keywords={['pasture fertilizer', 'hay field fertilizer', 'horse pasture', 'large lawn fertilizer', 'public grounds', 'turf recovery']}
      audienceNote="Small farms, horse owners, landscapers, landowners, parks, schools, public grounds crews, and facility managers with larger grass areas."
    />
  );
}
