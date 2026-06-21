import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function LiquidBiocharProductPage() {
  return (
    <SeoProblemLandingPage
      slug="liquid-biochar"
      eyebrow="Activated biochar with humic, fulvic and kelp"
      title="Liquid Biochar Soil Conditioner for Gardens, Lawns, Trees, Containers & Raised Beds"
      description="A product-focused landing page for Nature's Way Soil Liquid Biochar with Humates, a concentrated soil conditioner built around 5-micron biochar, humic acid, fulvic acid, kelp, and soil biology support."
      primaryCta="View Liquid Biochar Product"
      primaryHref="/product/liquid-biochar-soil-conditioner"
      secondaryCta="View Biochar Restoration Page"
      secondaryHref="/liquid-biochar-soil-restoration"
      problems={[
        'Gardens, lawns, raised beds, trees, and containers that need better nutrient retention',
        'Sandy, depleted, or stressed soils that dry quickly and respond poorly to fertilizer alone',
        'Customers comparing liquid biochar with granular biochar, humic acid, compost tea, and kelp products',
        'Transplant areas and root zones that need carbon-rich soil support and microbial habitat',
        'Landscapers and homeowners wanting an easy liquid application instead of dusty dry biochar',
        'Soil-building programs where biochar, humic, fulvic, and kelp are used together',
      ]}
      solutionSteps={[
        'Use liquid biochar as a soil conditioner, not just a quick green-up fertilizer.',
        'Mix 2-4 ounces per gallon of water and apply as a soil drench, transplant solution, lawn treatment, or compost-tea booster.',
        'Target the root zone and water in when possible so the biochar and humates move into the soil profile.',
        'Repeat during active growth, after transplant stress, or when soil needs extra support holding moisture and nutrients.',
      ]}
      products={[
        {
          name: "Nature's Way Soil Liquid Biochar Soil Conditioner",
          href: '/product/liquid-biochar-soil-conditioner',
          bestFor: 'gardens, lawns, raised beds, trees, containers, greenhouses, and transplant support',
          description: 'A premium liquid soil-building blend made with activated biochar, humic acid, fulvic acid, kelp, molasses, and aloe for root-zone support.',
        },
        {
          name: 'Hay, Pasture & Lawn Recovery System with Liquid Biochar',
          href: '/product/NWS_022',
          bestFor: 'large-area grass, hay, pasture, food plots, and lawn recovery programs',
          description: 'A larger field and turf recovery option when biochar is part of a broader grass support system.',
        },
        {
          name: 'Enhanced Living Compost with Biochar & Worm Castings',
          href: '/product/NWS_013',
          bestFor: 'garden beds, raised beds, planting mixes, and living-soil refreshes',
          description: 'A dry living compost companion product for customers who want biochar plus organic matter and worm castings.',
        },
      ]}
      faqs={[
        {
          question: 'What makes liquid biochar different from regular dry biochar?',
          answer: 'Liquid biochar is easier to dilute and apply through watering cans, pump sprayers, hose-end systems, and tank mixes. It is positioned for customers who want biochar benefits without handling dusty dry material.',
        },
        {
          question: 'Is liquid biochar a fertilizer?',
          answer: 'It is best described as a soil conditioner. It supports nutrient retention, moisture-holding goals, root-zone biology, and soil-building programs, while fertilizers directly supply plant nutrients.',
        },
        {
          question: 'How should customers apply it?',
          answer: 'The product copy recommends mixing 2-4 ounces per gallon of water and applying as a soil drench, compost tea booster, transplant solution, or lawn and garden soil conditioner.',
        },
        {
          question: 'Where does it fit best?',
          answer: 'It fits gardens, lawns, raised beds, trees, containers, greenhouses, transplant programs, and other areas where soil needs better nutrient and water retention.',
        },
      ]}
      keywords={['liquid biochar', 'biochar soil conditioner', 'humic acid', 'fulvic acid', 'kelp', 'root growth']}
      audienceNote="Home gardeners, landscapers, greenhouse growers, homeowners, raised-bed growers, tree-care customers, and soil-restoration buyers looking for liquid biochar support."
    />
  );
}
