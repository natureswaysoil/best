import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function LiquidBiocharSoilRestorationPage() {
  return (
    <SeoProblemLandingPage
      slug="liquid-biochar-soil-restoration"
      eyebrow="Biobased carbon for soil-building programs"
      title="Liquid Biochar for Soil Restoration, Lawn Recovery & Public Grounds"
      description="Learn where liquid biochar fits for poor soil, landscape beds, turf recovery, sustainability programs, and government grounds-maintenance projects."
      primaryCta="Request Biochar Quote"
      primaryHref="/government#quote-request"
      problems={[
        'Sandy or tired soil that struggles to hold water and nutrients',
        'Landscape beds and public grounds that need long-term soil rebuilding',
        'New planting areas, disturbed soil, and weak turf after construction or traffic',
        'Sustainability-focused agencies looking for biobased soil-support products',
        'Landscapers wanting a premium soil amendment story beyond synthetic fertilizer',
        'Homeowners comparing liquid biochar with granular or dry biochar products',
      ]}
      solutionSteps={[
        'Use liquid biochar as part of a soil-building plan rather than as a quick green-up fertilizer.',
        'Apply around root zones, planting areas, stressed turf, or landscape beds where soil improvement is the goal.',
        'Pair biochar with humic, fulvic, kelp, compost, or worm castings for a broader living-soil program.',
        'For agencies, contractors, and facilities, request project pricing based on acreage, gallons, or recurring supply needs.',
      ]}
      products={[
        {
          name: 'Liquid Biochar Soil Amendment',
          href: '/government#quote-request',
          bestFor: 'public-sector soil restoration, sustainability programs, and poor soil recovery',
          description: 'Activated liquid biochar positioned for soil-building and long-term grounds improvement programs.',
        },
        {
          name: 'Enhanced Living Compost with Biochar & Worm Castings',
          href: '/product/NWS_013',
          bestFor: 'planting beds, landscape installation, containers, and soil restoration work',
          description: 'A living compost blend with worm castings, activated biochar, and aged compost for stronger soil biology.',
        },
        {
          name: 'Liquid Humic & Fulvic Acid with Kelp',
          href: '/product/NWS_011',
          bestFor: 'liquid root-zone support alongside biochar programs',
          description: 'A complementary liquid soil conditioner for lawns, trees, gardens, and landscape maintenance routes.',
        },
      ]}
      faqs={[
        {
          question: 'What is liquid biochar best used for?',
          answer: 'Liquid biochar is best positioned as a soil-building amendment for poor soil, landscape beds, turf recovery programs, and sustainability-minded land-care projects.',
        },
        {
          question: 'Is liquid biochar the same as fertilizer?',
          answer: 'No. Biochar is better described as a soil amendment. It supports soil structure and nutrient-holding goals, while fertilizer directly supplies plant nutrients.',
        },
        {
          question: 'Can government buyers request project pricing?',
          answer: 'Yes. Nature’s Way Soil can quote liquid biochar for project-based orders, pilot programs, recurring supply, and larger quantities.',
        },
        {
          question: 'Should I combine biochar with compost or humic acid?',
          answer: 'For most soil restoration goals, biochar works well as part of a system with compost, worm castings, humic acid, fulvic acid, kelp, and good watering practices.',
        },
      ]}
      keywords={['liquid biochar', 'soil restoration', 'biochar for lawns', 'soil amendment', 'public grounds', 'BioPreferred']}
      audienceNote="Government buyers, landscapers, homeowners, schools, campuses, parks, and sustainability-focused land-care programs needing soil-building products."
    />
  );
}
