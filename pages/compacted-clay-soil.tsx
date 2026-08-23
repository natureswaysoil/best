import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function CompactedClaySoilPage() {
  return (
    <SeoProblemLandingPage
      slug="compacted-clay-soil"
      eyebrow="Professional liquid soil recovery for hard lawns"
      title="Fix Compacted Clay Soil Without Tilling the Whole Lawn"
      description="Build a serious soil-recovery program for hard clay, poor drainage, dry spots, and weak roots with concentrated humic, fulvic, kelp, and soil-building products sized for whole-lawn treatment."
      primaryCta="Build My Soil Recovery Program"
      primaryHref="/product/NWS_011"
      problems={[
        'Hard clay soil that water runs off instead of soaking in',
        'Dry patches, weak roots, thin grass, and poor fertilizer response',
        'Lawns where core aeration is not practical or needs extra soil support',
        'Facility grounds, parks, medians, rental lawns, and public landscapes with compacted soil',
        'Homeowners and landscapers looking for a liquid soil-conditioning service add-on',
        'Grass that greens briefly after fertilizer but fades because the root zone is stressed',
      ]}
      solutionSteps={[
        'Start by watering the area and identifying the worst hard spots, dry patches, and runoff areas.',
        'Apply a concentrated liquid soil conditioner containing humic, fulvic, and kelp ingredients during active grass growth.',
        'Water the product in so it reaches the root zone instead of drying on the leaf surface.',
        'Repeat on a maintenance schedule and combine with biochar or compost-based amendments where the soil needs deeper rebuilding.',
      ]}
      products={[
        {
          name: 'Liquid Humic & Fulvic Acid with Kelp — Primary Soil Recovery Treatment',
          href: '/product/NWS_011',
          bestFor: 'whole-lawn root-zone support, hard soil, yellow grass, and weak fertilizer response',
          description: 'Start here for a full soil-conditioning program. Choose the 1 gallon or 2.5 gallon size for larger lawn and grounds applications instead of treating compacted soil as a small spot-treatment problem.',
        },
        {
          name: 'Liquid Biochar Soil Amendment — Long-Term Soil Builder',
          href: '/government#quote-request',
          bestFor: 'longer-term soil rebuilding, poor soil, commercial grounds, and larger restoration projects',
          description: 'A premium carbon-rich soil-building option to pair with liquid humic and fulvic treatments when the root zone needs more than routine maintenance.',
        },
        {
          name: 'Seaweed & Humic Acid Lawn Treatment — Maintenance Option',
          href: '/product/NWS_018',
          bestFor: 'follow-up lawn stress support, dry spots, heat stress, and routine maintenance',
          description: 'A lighter maintenance treatment for customers who have already started rebuilding the soil and want ongoing turf support.',
        },
      ]}
      faqs={[
        {
          question: 'Can liquid soil conditioner replace core aeration?',
          answer: 'It is best positioned as a liquid soil-conditioning tool, not a mechanical replacement for every aeration job. It can be used when tilling is not practical and can also support lawns before or after aeration.',
        },
        {
          question: 'What size should I start with for compacted clay soil?',
          answer: 'For a whole-lawn soil recovery program, start with the 1 gallon or 2.5 gallon Liquid Humic & Fulvic Acid with Kelp option. Smaller sizes are better suited to testing or limited spot applications, while larger sizes make more sense for repeated lawn treatment.',
        },
        {
          question: 'What products should I combine for badly compacted soil?',
          answer: 'Start with Liquid Humic & Fulvic Acid with Kelp for liquid root-zone support. For soil that needs deeper rebuilding, add Liquid Biochar or a compost-based amendment and use the Seaweed & Humic Acid Lawn Treatment later as a maintenance option.',
        },
        {
          question: 'Is this useful for landscapers and government grounds crews?',
          answer: 'Yes. Concentrated liquid formats are easy to store, dilute, and apply with sprayers or tank equipment for routine grounds maintenance.',
        },
        {
          question: 'How fast will I see results?',
          answer: 'Results depend on soil condition, watering, grass type, weather, and maintenance. Most programs work best as repeated soil support rather than a one-time quick fix.',
        },
      ]}
      keywords={['clay soil', 'liquid aeration', 'hard soil', 'dry spots', 'lawn recovery', 'humic acid']}
      audienceNote="Homeowners, landscapers, public grounds departments, campuses, parks, and facility managers dealing with hard soil, poor drainage, and stressed turf."
    />
  );
}
