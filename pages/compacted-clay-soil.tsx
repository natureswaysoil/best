import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function CompactedClaySoilPage() {
  return (
    <SeoProblemLandingPage
      slug="compacted-clay-soil"
      eyebrow="Liquid soil conditioner for hard lawns"
      title="Fix Compacted Clay Soil Without Tilling the Whole Lawn"
      description="A practical lawn-recovery guide for hard clay soil, poor drainage, dry spots, and weak roots using liquid humic, fulvic, kelp, and soil-conditioning products."
      primaryCta="View Lawn Recovery System"
      primaryHref="/homeowners-landscapers-government"
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
        'Apply a liquid soil conditioner containing humic, fulvic, and kelp ingredients during active grass growth.',
        'Water the product in so it reaches the root zone instead of drying on the leaf surface.',
        'Repeat on a maintenance schedule and combine with compost, biochar, or overseeding where the soil needs deeper rebuilding.',
      ]}
      products={[
        {
          name: 'Liquid Humic & Fulvic Acid with Kelp',
          href: '/product/NWS_011',
          bestFor: 'root-zone support, hard soil, yellow grass, and weak fertilizer response',
          description: 'A concentrated liquid soil conditioner for lawns, gardens, landscape beds, and larger grounds programs.',
        },
        {
          name: 'Seaweed & Humic Acid Lawn Treatment',
          href: '/product/NWS_018',
          bestFor: 'lawn stress, heat stress, dry spots, and routine turf support',
          description: 'A simple entry product for homeowners and grounds crews that want a liquid lawn soil treatment.',
        },
        {
          name: 'Liquid Biochar Soil Amendment',
          href: '/government#quote-request',
          bestFor: 'longer-term soil building, poor soil, and public grounds restoration',
          description: 'A premium biobased soil-building option for agencies, landscapers, and restoration-minded buyers.',
        },
      ]}
      faqs={[
        {
          question: 'Can liquid soil conditioner replace core aeration?',
          answer: 'It is best positioned as a liquid soil-conditioning tool, not a mechanical replacement for every aeration job. It can be used when tilling is not practical and can also support lawns before or after aeration.',
        },
        {
          question: 'What products should I start with for compacted clay soil?',
          answer: 'Start with Liquid Humic & Fulvic Acid with Kelp or the Lawn Recovery System. For poor soil restoration projects, add Liquid Biochar or compost-based amendments.',
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
