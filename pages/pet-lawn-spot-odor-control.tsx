import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function PetLawnSpotOdorControlPage() {
  return (
    <SeoProblemLandingPage
      slug="pet-lawn-spot-odor-control"
      eyebrow="Outdoor pet odor and lawn spot support"
      title="Pet Lawn Spot & Outdoor Odor Control for Lawns, Kennels, Patios & Turf"
      description="A buyer-focused guide for pet lawn spots, outdoor odor, kennels, patios, concrete, artificial turf, dog runs, and facility pet relief areas."
      primaryCta="View Lawn Spot Repair"
      primaryHref="/lawn-repair"
      secondaryCta="Request Facility Quote"
      secondaryHref="/government#quote-request"
      problems={[
        'Yellow lawn spots in high-use pet areas',
        'Odor-causing residue around kennels, dog runs, patios, turf, gravel, and concrete',
        'Pet relief areas at housing, parks, boarding facilities, and public grounds',
        'Outdoor surfaces that need a cleaner, less chemical-looking maintenance option',
        'Facilities needing gallon concentrate and recurring supply instead of small ready-to-use bottles',
        'Homeowners who want one product story for lawn spot support and outdoor pet area cleaning',
      ]}
      solutionSteps={[
        'Rinse heavy residue first when possible, especially on hard surfaces, turf, and kennel areas.',
        'Apply the concentrate according to label directions over the affected area rather than only treating the center of the spot.',
        'For lawn spots, water in after application so the product reaches the soil and root zone.',
        'For kennels, patios, artificial turf, and pet relief areas, build it into a regular maintenance schedule.',
      ]}
      products={[
        {
          name: 'Dog Urine Neutralizer & Lawn Repair',
          href: '/lawn-repair',
          bestFor: 'home lawns, pet lawn spots, yellow grass, and small pet-use areas',
          description: 'A direct homeowner funnel for pet lawn spots and lawn recovery support.',
        },
        {
          name: 'Pet Odor Eliminator & Hard Surface Cleaner',
          href: '/government#quote-request',
          bestFor: 'kennels, patios, artificial turf, concrete, gravel dog runs, and public pet areas',
          description: 'A government and facility positioning for gallon concentrate and recurring supply requests.',
        },
        {
          name: 'Lawn Recovery System',
          href: '/homeowners-landscapers-government',
          bestFor: 'larger stressed lawn areas around housing, parks, rental properties, and facilities',
          description: 'Use alongside spot treatment when the broader lawn needs root-zone and soil support.',
        },
      ]}
      faqs={[
        {
          question: 'Can this page help bring traffic from pet lawn spot searches?',
          answer: 'Yes. It targets pet lawn spot repair, outdoor pet odor control, kennel odor, artificial turf odor, and facility pet area cleaning in one focused page.',
        },
        {
          question: 'Should public buyers use the homeowner page or government page?',
          answer: 'Homeowners should start with the lawn repair page. Facilities, kennels, housing, parks, and public buyers should use the government quote form for gallons, recurring needs, or larger quantities.',
        },
        {
          question: 'Can it be used on hard surfaces?',
          answer: 'The page positions the product for outdoor hard surfaces such as patios, concrete, artificial turf, kennels, and dog-run areas when used according to label directions.',
        },
        {
          question: 'What is the best next step for a buyer?',
          answer: 'Homeowners can view the lawn repair product funnel. Agencies, facility managers, and kennel operators should request a quote with quantity and surface/use-case details.',
        },
      ]}
      keywords={['pet lawn spots', 'outdoor odor control', 'kennel cleaner', 'artificial turf odor', 'patio odor', 'facility care']}
      audienceNote="Homeowners, kennel operators, housing managers, VA and public facilities, parks, artificial turf owners, and pet relief area maintenance teams."
    />
  );
}
