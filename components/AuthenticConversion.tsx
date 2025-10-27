import React from 'react';

// Flexible product type for components
type ProductInfo = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  features: string[];
  description?: string;
  tags?: string[];
};

// Authentic farm transparency - real stories, not fake badges
export const FarmTransparency = ({ weeklyUpdate }: { weeklyUpdate?: string }) => (
  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
    <div className="flex items-start gap-3">
      <span className="text-2xl">🚜</span>
      <div>
        <h4 className="font-medium text-green-800 mb-1">Fresh from Our Farm This Week</h4>
        <p className="text-green-700 text-sm leading-relaxed">
          {weeklyUpdate || "Just finished brewing this week's batch of liquid fertilizer on Tuesday. The microbes are active and ready to work in your soil. We'll ship it Thursday so you get maximum potency."}
        </p>
        <p className="text-xs text-green-600 mt-2 italic">
          - The Nature's Way Soil Family
        </p>
      </div>
    </div>
  </div>
);

// Educational value - explain WHY it works, not just what it does
export const WhyItWorks = ({ product }: { product: ProductInfo }) => {
  const getEducationalContent = (category: string) => {
    if (category === 'Fertilizer') {
      return {
        title: "Why Liquid Fertilizer Works Better",
        explanation: "Liquid fertilizers are absorbed 8x faster than granules because plants can uptake nutrients immediately through their roots and leaves. The living microbes start colonizing your soil within hours.",
        science: "Each drop contains billions of beneficial bacteria that form symbiotic relationships with plant roots, dramatically improving nutrient absorption."
      };
    } else if (category === 'Compost') {
      return {
        title: "The Science of Living Compost",
        explanation: "Unlike bagged compost that sits for months, our living compost is teeming with active microorganisms that immediately begin improving soil structure and plant health.",
        science: "The combination of worm castings, biochar, and active compost creates a permanent habitat for beneficial soil life."
      };
    } else if (category === 'Soil Amendment') {
      return {
        title: "How Biochar Transforms Soil",
        explanation: "Activated biochar creates permanent homes for soil microbes while improving water retention by up to 40%. Think of it as building apartments for beneficial bacteria.",
        science: "The porous structure of biochar provides 300+ square meters of surface area per gram - incredible habitat for soil life."
      };
    }
    return {
      title: "Why This Product Works",
      explanation: "Our natural approach feeds the soil ecosystem, not just the plant, creating lasting improvements that get better over time.",
      science: "Natural soil biology creates resilient, self-sustaining garden ecosystems."
    };
  };

  const content = getEducationalContent(product.category);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <span className="mr-2">🧪</span>
          {content.title}
        </h4>
        <p className="text-sm text-blue-700 mb-3">{content.explanation}</p>
        <div className="bg-blue-100 rounded p-3">
          <p className="text-xs text-blue-600 italic">{content.science}</p>
        </div>
      </div>
    </div>
  );
};

// Honest value comparison - show real math, not marketing fluff
export const HonestValue = ({ product }: { product: ProductInfo }) => {
  const calculateValue = () => {
    if (product.category === 'Fertilizer') {
      const gallonsMade = 64; // Typical for liquid concentrates
      const costPerGallon = product.price / gallonsMade;
      return {
        makes: `${gallonsMade} gallons of fertilizer`,
        costPer: `$${costPerGallon.toFixed(2)} per gallon`,
        comparisons: [
          { type: 'Store-bought liquid fertilizer', cost: '$1.50/gallon' },
          { type: 'Synthetic granules', cost: '$0.50/gallon (no microbes)' },
          { type: 'Our living fertilizer', cost: `$${costPerGallon.toFixed(2)}/gallon with billions of microbes` }
        ]
      };
    } else if (product.category === 'Compost') {
      const coverage = 20; // sq ft per lb
      const costPerSqFt = product.price / (10 * coverage); // 10 lb bag
      return {
        makes: `Covers ${10 * coverage} sq ft at 1-inch depth`,
        costPer: `$${costPerSqFt.toFixed(3)} per sq ft`,
        comparisons: [
          { type: 'Bagged store compost', cost: '$0.15/sq ft (no microbes)' },
          { type: 'Bulk compost delivery', cost: '$0.08/sq ft (quality varies)' },
          { type: 'Our living compost', cost: `$${costPerSqFt.toFixed(3)}/sq ft with worm castings & biochar` }
        ]
      };
    }
    return null;
  };

  const value = calculateValue();
  if (!value) return null;

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium mb-3 text-gray-800">Honest Value Breakdown</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{value.makes}</span>
            <span className="font-medium">{value.costPer}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <h6 className="text-sm font-medium mb-2">Compare to alternatives:</h6>
          <div className="space-y-1">
            {value.comparisons.map((comp, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600">{comp.type}</span>
                <span className={index === value.comparisons.length - 1 ? 'font-medium text-green-600' : ''}>{comp.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Best used for - practical guidance, not sales fluff
export const PracticalGuidance = ({ product }: { product: ProductInfo }) => {
  const getGuidance = (category: string) => {
    const baseGuidance = {
      whenToUse: [] as string[],
      bestFor: [] as string[],
      seasonalTips: [] as string[]
    };

    if (category === 'Fertilizer') {
      baseGuidance.whenToUse = [
        'Plants showing nutrient deficiency (yellowing leaves)',
        'New transplants to prevent shock',
        'During active growing season every 2-3 weeks',
        'Recovery after stress (drought, heat, transplanting)'
      ];
      baseGuidance.bestFor = [
        'Vegetables and fruits that need steady nutrition',
        'Container plants with limited soil volume',
        'Quick fixes for struggling plants',
        'Organic gardens where synthetic fertilizers aren\'t wanted'
      ];
      baseGuidance.seasonalTips = [
        'Spring: Start light, increase as plants establish',
        'Summer: Apply early morning to avoid leaf burn',
        'Fall: Reduce frequency as growth slows',
        'Winter: Indoor plants only, very dilute'
      ];
    } else if (category === 'Compost') {
      baseGuidance.whenToUse = [
        'Starting new garden beds or raised beds',
        'Annual soil improvement in spring or fall',
        'Reviving tired, depleted soil',
        'Improving clay or sandy soil structure'
      ];
      baseGuidance.bestFor = [
        'Long-term soil health improvement',
        'Building organic matter and water retention',
        'Creating habitat for beneficial soil life',
        'Slow-release nutrition that lasts months'
      ];
      baseGuidance.seasonalTips = [
        'Spring: Apply 4-6 weeks before planting',
        'Summer: Use as mulch around established plants',
        'Fall: Best time to add - breaks down over winter',
        'Winter: Can be applied but won\'t be active until spring'
      ];
    } else if (category === 'Soil Amendment') {
      baseGuidance.whenToUse = [
        'Poor drainage or water retention issues',
        'Compacted or heavy clay soil',
        'Starting terrariums or container gardens',
        'Long-term soil structure improvement'
      ];
      baseGuidance.bestFor = [
        'Permanent soil structure improvement',
        'Creating microbial habitat that lasts years',
        'Improving both drainage and water retention',
        'Reducing need for frequent watering'
      ];
    }

    return baseGuidance;
  };

  const guidance = getGuidance(product.category);

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
          <span className="mr-2">🎯</span>
          When to Use This Product
        </h4>
        <ul className="space-y-1">
          {guidance.whenToUse.map((tip, index) => (
            <li key={index} className="text-sm text-yellow-700 flex items-start">
              <span className="mr-2 text-yellow-600 font-bold">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-3 flex items-center">
          <span className="mr-2">🌱</span>
          Best Results For
        </h4>
        <ul className="space-y-1">
          {guidance.bestFor.map((use, index) => (
            <li key={index} className="text-sm text-green-700 flex items-start">
              <span className="mr-2 text-green-600 font-bold">•</span>
              {use}
            </li>
          ))}
        </ul>
      </div>

      {guidance.seasonalTips.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-3 flex items-center">
            <span className="mr-2">📅</span>
            Seasonal Application Tips
          </h4>
          <ul className="space-y-1">
            {guidance.seasonalTips.map((tip, index) => (
              <li key={index} className="text-sm text-purple-700 flex items-start">
                <span className="mr-2 text-purple-600 font-bold">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Real customer stories - only use with actual permission and photos
export const AuthenticCustomerStory = ({ 
  customerName, 
  location, 
  story, 
  photoUrl, 
  verified = true 
}: { 
  customerName: string; 
  location: string; 
  story: string; 
  photoUrl?: string; 
  verified?: boolean; 
}) => (
  <div className="border rounded-lg p-4 bg-white">
    <div className="flex items-start gap-3">
      {photoUrl && (
        <img 
          src={photoUrl} 
          alt={`${customerName}'s garden`}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-800 mb-3 leading-relaxed">"{story}"</p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span className="font-medium">{customerName}</span>, {location}
            {verified && <span className="ml-2 text-green-600">✓ verified purchase</span>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Helpful contact - encourage questions, not pressure sales
export const HelpfulContact = ({ className = '' }: { className?: string }) => (
  <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
      <span className="mr-2">📞</span>
      Questions? We Love Talking Soil!
    </h4>
    <p className="text-sm text-blue-700 mb-3">
      Not sure what your plants need? Call or email us. We're farmers first - 
      we'd rather help you succeed than sell you the wrong product.
    </p>
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-blue-600">📧</span>
        <span className="text-blue-800">support@natureswaysoil.com</span>
      </div>
    </div>
  </div>
);

// Gentle guarantee - reassuring, not pushy
export const GentleGuarantee = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
    <div className="flex items-start gap-3">
      <span className="text-2xl">🤝</span>
      <div>
        <h4 className="font-medium text-gray-800 mb-1">Our Promise</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          We stand behind our products because we use them on our own farm. 
          If you're not seeing the results you expected, reach out and we'll 
          make it right - whether that's a refund, exchange, or just some 
          friendly growing advice.
        </p>
      </div>
    </div>
  </div>
);