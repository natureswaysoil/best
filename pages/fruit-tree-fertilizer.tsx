import SeoProblemLandingPage from '../components/SeoProblemLandingPage';

export default function FruitTreeFertilizerPage() {
  return (
    <SeoProblemLandingPage
      slug="fruit-tree-fertilizer"
      eyebrow="Orchard nutrition and root-zone support"
      title="Fruit Tree Fertilizer with Liquid Biochar for Apples, Peaches, Pears & Citrus"
      description="A 32 oz concentrate landing page for backyard orchard owners who want stronger roots, better bloom support, fruit set support, and nutrient retention around apple, peach, pear, citrus, fig, plum, mango, and other fruit trees."
      primaryCta="View Fruit Tree Product"
      primaryHref="/product/fruit-tree-fertilizer"
      secondaryCta="Shop All Products"
      secondaryHref="/shop"
      problems={[
        'Fruit trees with weak growth, poor bloom support, or slow recovery after transplanting',
        'Backyard orchard soil that dries out quickly or struggles to hold nutrients in the root zone',
        'Apple, peach, pear, citrus, fig, plum, mango, and berry plantings that need seasonal feeding support',
        'Customers comparing fruit tree fertilizer, bloom booster, root booster, and soil conditioner products',
        'Young trees, mature trees, and stressed trees needing a simple watering-can or sprayer routine',
        'Garden buyers looking for a concentrated orchard feed instead of a bulky granular product',
      ]}
      solutionSteps={[
        'Apply during spring green-up, pre-bloom, fruit set, summer stress periods, and post-harvest recovery.',
        'Focus applications around the root zone instead of only spraying foliage so biochar, humic materials, and nutrients reach the soil.',
        'Water in after application to move the concentrate into the feeder-root area and reduce nutrient loss.',
        'Use as part of a complete orchard care plan with mulch, proper irrigation, pruning, and soil testing when possible.',
      ]}
      products={[
        {
          name: "Nature's Way Soil Fruit Tree Fertilizer with Liquid Biochar",
          href: '/product/fruit-tree-fertilizer',
          bestFor: 'apple, peach, pear, citrus, fig, plum, mango, berry, and backyard orchard feeding',
          description: '32 oz concentrate positioned for blooms, fruit set, roots, nutrient retention, and seasonal orchard support. Makes up to 64 gallons when diluted as directed.',
        },
        {
          name: 'Liquid Humic & Fulvic Acid with Kelp',
          href: '/product/NWS_011',
          bestFor: 'root-zone conditioning around trees, shrubs, lawns, and garden beds',
          description: 'A liquid soil conditioner that pairs well with orchard feeding programs when soil needs nutrient-uptake support.',
        },
        {
          name: 'Liquid Bone Meal Fertilizer',
          href: '/product/NWS_012',
          bestFor: 'phosphorus and calcium support for roots, flowers, vegetables, trees, and shrubs',
          description: 'A fast-absorbing liquid bone meal option for planting, bloom support, and root development programs.',
        },
      ]}
      faqs={[
        {
          question: 'What is this fruit tree fertilizer best used for?',
          answer: 'It is positioned for fruit trees and orchard plants that need seasonal root-zone feeding, bloom support, fruit set support, and help holding nutrients near the feeder roots.',
        },
        {
          question: 'Can it be used on apple, peach, pear, and citrus trees?',
          answer: 'Yes. The landing page is written for common backyard orchard trees including apple, peach, pear, citrus, fig, plum, mango, and related fruiting plants.',
        },
        {
          question: 'Why include liquid biochar in a fruit tree product?',
          answer: 'Liquid biochar is used as a soil-support ingredient to help with water holding, nutrient retention, and root-zone soil improvement goals.',
        },
        {
          question: 'When should customers apply fruit tree fertilizer?',
          answer: 'Good seasonal windows include spring green-up, pre-bloom, fruit set, summer stress periods, and after harvest to support recovery.',
        },
      ]}
      keywords={['fruit tree fertilizer', 'orchard booster', 'apple tree fertilizer', 'peach tree fertilizer', 'liquid biochar', 'root growth']}
      audienceNote="Backyard orchard owners, small farms, homesteads, garden centers, landscapers, and homeowners caring for apple, peach, pear, citrus, berry, and mixed fruit plantings."
    />
  );
}
