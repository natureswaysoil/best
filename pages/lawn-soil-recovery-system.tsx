import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function LawnSoilRecoverySystemPage() {
  return (
    <SeoProblemLandingPage
      slug="lawn-soil-recovery-system"
      eyebrow="Humic, fulvic and kelp root-zone support"
      title="Lawn & Soil Recovery System for Yellow Grass, Weak Roots & Tired Soil"
      description="A product-focused landing page for Nature's Way Soil Lawn & Soil Recovery System, a 1 gallon concentrate with liquid humic acid, fulvic acid, and kelp for lawns, gardens, landscapes, and root development support."
      primaryCta="View Humic & Fulvic Product"
      primaryHref="/product/NWS_011"
      secondaryCta="Shop All Products"
      secondaryHref="/shop"
      problems={[
        'Yellow grass, weak turf, and lawn areas that need root-zone support rather than only nitrogen',
        'Lawns, gardens, and landscapes with compacted, tired, sandy, or nutrient-poor soil',
        'Customers searching for liquid humic acid, fulvic acid, kelp, and lawn soil conditioner products',
        'Homeowners needing an easy 1 gallon concentrate that can be mixed in watering cans or sprayers',
        'Landscapers wanting a simple soil-conditioning add-on for maintenance routes',
        'Grass recovery programs where roots, nutrient availability, and soil biology need support together',
      ]}
      solutionSteps={[
        'Start with soil conditioning when grass looks weak even after normal watering and feeding.',
        'Mix 2 ounces per gallon of water and apply evenly to the lawn, garden, pasture, or landscape area.',
        'Water in after application so humic, fulvic, and kelp materials reach the root zone.',
        'Repeat every 3-4 weeks during active growth or after stress from heat, drought, traffic, or poor soil conditions.',
      ]}
      products={[
        {
          name: "Nature's Way Soil Lawn & Soil Recovery System",
          href: '/product/NWS_011',
          bestFor: 'yellow grass, root support, lawn soil conditioning, gardens, and landscapes',
          description: 'A liquid humic and fulvic acid with kelp concentrate positioned to improve nutrient uptake, root growth, and soil health.',
        },
        {
          name: 'Seaweed & Humic Acid Lawn Treatment',
          href: '/product/NWS_018',
          bestFor: 'lawn treatment customers comparing seaweed, humic acid, and kelp options',
          description: 'A lawn-focused support product for routine turf care and stress recovery programs.',
        },
        {
          name: 'Hay, Pasture & Lawn Recovery System with Liquid Biochar',
          href: '/product/NWS_022',
          bestFor: 'larger lawns, hay fields, pastures, food plots, and broad-acre recovery',
          description: 'A larger-format recovery option with liquid biochar, humic, fulvic, kelp, yucca, and beneficial biology.',
        },
      ]}
      faqs={[
        {
          question: 'Is Lawn & Soil Recovery System a fertilizer or a soil conditioner?',
          answer: 'It is best positioned as a concentrated soil conditioner with humic acid, fulvic acid, and kelp for root-zone support and nutrient-uptake support.',
        },
        {
          question: 'Can customers use it on gardens as well as lawns?',
          answer: 'Yes. The page positions it for lawns, gardens, landscapes, pastures, root development, and soil conditioning.',
        },
        {
          question: 'How much should be mixed per gallon?',
          answer: 'The product copy recommends 2 ounces per gallon of water for routine application.',
        },
        {
          question: 'Will it fix every yellow lawn problem?',
          answer: 'No single product fixes every issue. Yellow grass can also come from drought, disease, insects, pH imbalance, or nutrient deficiency. This page positions the product as root-zone and soil-conditioning support.',
        },
      ]}
      keywords={['lawn recovery', 'soil conditioner', 'liquid humic acid', 'fulvic acid', 'kelp', 'yellow grass']}
      audienceNote="Homeowners, landscapers, gardeners, pasture owners, and turf managers looking for liquid soil conditioning and root-zone support."
    />
  );
}
