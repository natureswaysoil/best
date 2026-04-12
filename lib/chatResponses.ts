interface EducationalResponse {
  answer: string;
  productHelp?: string;
  competitorOption?: string;
}

interface ScoredIntent {
  phrases: string[];
  response: string;
  requiresApplicationQuestion?: boolean;
  bonusPhrases?: string[];
}

export const initialChatMessage =
  'Hi! I can help with mix rates, application timing, lawn recovery, compost, biochar, and product selection. Try asking something like "how do I apply humic acid?" or "what helps dog urine spots?"';

const educationalResponses: Array<{
  phrases: string[];
  response: EducationalResponse;
}> = [
  {
    phrases: ['yellow leaves', 'yellowing leaves', 'yellow leaf', 'chlorosis', 'yellow plant'],
    response: {
      answer:
        'Yellow leaves usually indicate nitrogen deficiency, overwatering, or poor soil drainage. First, check if soil is soggy or compacted. For nutrient deficiency, soil needs living microbes to break down organic matter into plant-available nutrients.',
      productHelp:
        'If it is nutrient deficiency, our liquid fertilizer with living microbes can help restore the soil\'s natural nutrient cycling.',
      competitorOption:
        'For immediate results, you could also try Dr. Earth or Espoma liquid fertilizers from garden centers.'
    }
  },
  {
    phrases: ['clay soil', 'clay'],
    response: {
      answer:
        'Clay soil is nutrient-rich but has poor drainage and aeration. The fix is improving structure without stripping fertility. Add organic matter and biochar to create pore space while keeping the soil biologically active.',
      productHelp:
        'Our biochar works especially well for clay because it creates permanent structure improvements and habitat for beneficial microbes.',
      competitorOption:
        'You can also use perlite or expanded shale from local nurseries, though biochar provides longer-lasting benefits.'
    }
  },
  {
    phrases: ['sandy soil', 'sand soil', 'sandy'],
    response: {
      answer:
        'Sandy soil drains well but does not hold nutrients or water. You need more organic matter and stronger microbial activity so the soil can retain both moisture and fertility.',
      productHelp:
        'Our enhanced compost blend with biochar helps sandy soil hold water and nutrients much better.',
      competitorOption:
        'Any quality compost will help, especially if it includes worm castings. Local municipal compost is often a good budget option.'
    }
  },
  {
    phrases: ['fertilizer', 'fertiliser'],
    response: {
      answer:
        'Plants need 16 essential nutrients. Synthetic fertilizers provide fast NPK, but living soil biology helps plants access a broader nutrient range naturally over time.',
      productHelp:
        'If you want to transition to natural fertility, our microbe-rich liquid fertilizer helps rebuild that soil biology.',
      competitorOption:
        'For organic options, consider Jobes Organics, Dr. Earth, or even compost tea you can make yourself.'
    }
  },
  {
    phrases: ['organic', 'organic gardening'],
    response: {
      answer:
        'Organic gardening works by feeding the soil ecosystem instead of only feeding the plant. Healthy soil biology improves nutrient uptake, water retention, and disease resistance naturally.',
      productHelp:
        'All our products support organic growing by building soil biology rather than depleting it.'
    }
  },
  {
    phrases: ['compost'],
    response: {
      answer:
        'Good compost contains beneficial microbes, improves soil structure, and supplies slow-release nutrients. The key is using compost that is mature, stable, and biologically active.',
      productHelp:
        'Our enhanced living compost includes worm castings and biochar for strong biological activity and better soil improvement.',
      competitorOption:
        'Local nurseries often carry quality compost. Look for trusted brands or make your own compost pile.'
    }
  },
  {
    phrases: ['biochar'],
    response: {
      answer:
        'Biochar creates long-term habitat for soil microbes and can improve water retention significantly. It works because it adds durable pore structure and massive surface area for beneficial biology.',
      productHelp:
        'Our activated biochar is sized specifically for garden use and helps create lasting soil improvements.',
      competitorOption:
        'You can find biochar at some garden centers, or make it yourself if you have a safe and legal setup.'
    }
  },
  {
    phrases: ['microbes', 'microbial', 'soil biology'],
    response: {
      answer:
        'Soil microbes are the foundation of plant health. They break down organic matter, protect roots, improve nutrient uptake, and help plants handle stress more effectively.',
      productHelp:
        'Our liquid fertilizers contain beneficial microbes and are made fresh weekly for maximum activity.',
      competitorOption:
        'You can also buy mycorrhizal inoculants or make compost tea to add biology to the root zone.'
    }
  },
  {
    phrases: ['tomato', 'tomatoes'],
    response: {
      answer:
        'Tomatoes need steady moisture, good drainage, and even nutrition. Common issues include blossom end rot, yellowing, and stress from inconsistent watering.',
      productHelp:
        'Our tomato fertilizer includes calcium support and helps reduce blossom end rot while improving soil biology.',
      competitorOption:
        'For blossom end rot specifically, bone meal, gypsum, or other calcium-support products can help.'
    }
  },
  {
    phrases: ['lawn', 'grass', 'turf'],
    response: {
      answer:
        'Healthy lawns need good soil biology, proper pH, and adequate organic matter. Many lawn problems come from compaction, weak root systems, or poor microbial activity.',
      productHelp:
        'Our lawn treatment with seaweed and humic acid helps build the soil biology that creates naturally greener, healthier grass.',
      competitorOption:
        'For quick greening, Milorganite or other organic lawn foods can help. For soil improvement, compost is still a strong baseline.'
    }
  },
  {
    phrases: ['humic acid', 'fulvic acid', 'humic', 'fulvic'],
    response: {
      answer:
        'Humic acid works best as a diluted soil drench. Start with 2 ounces per gallon of water, apply evenly to the root zone, then water lightly so it moves into the soil profile. For lawns, apply about 1 gallon of mixed solution per 1,000 sq ft. Reapply every 3-4 weeks during active growth.',
      productHelp:
        'For your products, follow the label usage rate first. If the label gives a range, use the lower rate weekly or the higher rate monthly.',
      competitorOption:
        'If you use a different brand, look for the humic acid concentration and follow the label rate before increasing strength.'
    }
  },
  {
    phrases: ['pet safe', 'dog safe', 'cat safe', 'pets'],
    response: {
      answer:
        'Pet-safe gardening means avoiding harsh synthetic chemistry and focusing on building healthy soil naturally. That is safer for animals and usually better for long-term plant health too.',
      productHelp:
        'All our products are natural and safe for pets, kids, and beneficial insects when used as directed.',
      competitorOption:
        'Most OMRI-listed organic fertilizers are pet-safe. Espoma, Dr. Earth, and plain compost are common alternatives.'
    }
  },
  {
    phrases: ['price', 'pricing', 'cost'],
    response: {
      answer:
        'Soil health is an investment that often reduces long-term costs by lowering watering needs, fertilizer use, and plant losses.',
      competitorOption:
        'For budget options, municipal compost, homemade compost tea, and buying amendments in bulk can be very cost-effective.'
    }
  },
  {
    phrases: ['budget', 'cheap', 'affordable'],
    response: {
      answer:
        'You can improve soil on any budget. The most important thing is adding organic matter consistently and keeping biology active over time.',
      competitorOption:
        'Free municipal compost, coffee grounds, leaf mold, and DIY compost tea are strong low-cost options.'
    }
  },
  {
    phrases: ['diy', 'do it yourself'],
    response: {
      answer:
        'DIY soil improvement works well if you stay consistent. Compost, compost tea, mulch, and leaf mold all help build fertility and soil biology naturally.',
      competitorOption:
        'A simple 5-gallon compost tea setup or free organic matter from local sources can go a long way.'
    }
  },
  {
    phrases: ['hydroponic', 'hydroponics'],
    response: {
      answer:
        'Hydroponics can be productive, but it depends on careful nutrient balance and reservoir management. Soil growing is often more forgiving, but hydroponics can work very well with the right routine.',
      competitorOption:
        'For hydroponic nutrients, General Hydroponics and Masterblend are common benchmarks if you need conventional options.'
    }
  },
  {
    phrases: ['shipping', 'delivery'],
    response: {
      answer:
        'We offer free shipping on orders over $50. Liquid fertilizers are shipped promptly so you receive them while they are still fresh and biologically active.'
    }
  },
  {
    phrases: ['application', 'apply', 'use', 'mix', 'dilute', 'dosage', 'rate'],
    response: {
      answer:
        'Application depends on the product and crop, but the general pattern is simple: dilute liquid products as directed, apply to the root zone, and repeat on a schedule instead of over-applying all at once.',
      productHelp:
        'Each product has a label rate, and we can help narrow that down if you tell us which product and what you are growing.'
    }
  },
  {
    phrases: ['hello', 'hi', 'hey'],
    response: {
      answer:
        'Hi! I can help with soil problems, application timing, plant nutrition, organic growing, and product selection. What are you working on?'
    }
  },
  {
    phrases: ['help'],
    response: {
      answer:
        'I can help with soil problems, plant nutrition, organic growing methods, lawn recovery, and product use. Ask a direct question and I will keep the answer specific.'
    }
  },
  {
    phrases: ['nutrients', 'nutrition', 'npk'],
    response: {
      answer:
        'Plants need both major nutrients and micronutrients. Healthy soil biology helps make a wider range of nutrients available in forms roots can actually use.',
      productHelp:
        'Our liquid fertilizers provide balanced nutrition along with the microbes that improve long-term uptake.',
      competitorOption:
        'Kelp meal and rock dust are also commonly used to broaden micronutrient availability.'
    }
  },
  {
    phrases: ['watering', 'watering schedule', 'overwater', 'underwater'],
    response: {
      answer:
        'Most plant problems trace back to watering patterns. Soil should stay evenly moist, not soggy, and better soil structure helps prevent both drought stress and waterlogging.',
      productHelp:
        'Biochar can improve water retention and make watering more forgiving over time.'
    }
  },
  {
    phrases: ['pests', 'bugs', 'insects'],
    response: {
      answer:
        'Healthy plants resist pests better. Start by improving soil health and root strength, then use targeted controls only if needed.',
      productHelp:
        'Building soil biology with our products helps create the foundation for stronger, more resilient plants.',
      competitorOption:
        'Neem oil, diatomaceous earth, and beneficial insects are common organic next steps for active infestations.'
    }
  },
  {
    phrases: ['disease', 'fungus', 'fungal'],
    response: {
      answer:
        'Plant disease often starts with stress, poor airflow, or weak root-zone biology. Beneficial microbes help plants defend themselves and compete with harmful organisms.',
      productHelp:
        'Our living compost and liquid fertilizers help build that protective soil biology.',
      competitorOption:
        'For active disease pressure, copper fungicides or biological products like Serenade are common organic options.'
    }
  },
  {
    phrases: ['when to fertilize', 'fertilize', 'feeding schedule'],
    response: {
      answer:
        'Most plants need the most feeding during active growth. Spring and early summer are high-demand periods, while fall is better for rebuilding soil and winter is usually lighter unless you are growing actively indoors.',
      productHelp:
        'A lighter, repeated schedule is usually safer and more effective than one heavy feeding.'
    }
  },
  {
    phrases: ['expensive'],
    response: {
      answer:
        'Good soil amendments can look expensive upfront, but they often reduce long-term costs by improving water retention, reducing plant losses, and lowering repeated fertilizer needs.',
      competitorOption:
        'Municipal compost, leaf mold, and DIY compost tea are good lower-cost ways to start improving soil.'
    }
  },
  {
    phrases: ['local'],
    response: {
      answer:
        'Local suppliers can be a great choice, especially for compost and bulk amendments. Local extension offices also give good soil-specific guidance for your area.',
      competitorOption:
        'If you want local recommendations, your county extension office is usually the best place to start.'
    }
  }
];

const scoredIntents: ScoredIntent[] = [
  {
    phrases: ['dog urine', 'pet urine', 'yellow spots', 'urine burn', 'dog spots'],
    response:
      'For dog urine spots, flush the area with water first if the burn is fresh, then apply a soil-neutralizing product to the root zone. Saturate the spot and a few inches beyond the yellow ring because salts spread outward. Reapply every 1-2 weeks in high-traffic areas until new growth fills back in.\n\nFor severe spots, rake out dead grass lightly, treat the soil, then overseed once the area is no longer burning.'
  },
  {
    phrases: ['blossom end rot'],
    response:
      'Blossom end rot is usually a calcium uptake problem, not just low calcium in the soil. Keep watering even, avoid dry-to-soaked swings, and support the root zone with steady fertility. Remove damaged fruit and focus on consistency so new fruit develops cleanly.'
  },
  {
    phrases: ['hydroponic', 'hydroponics', 'reservoir', 'nutrient solution'],
    bonusPhrases: ['seedlings', 'mature plants', 'ppm', 'ph'],
    requiresApplicationQuestion: true,
    response:
      'For hydroponic fertilizer concentrate, start light and increase gradually. Begin seedlings around 1 teaspoon per gallon, then move mature plants closer to 1 tablespoon per gallon if they are feeding well. Refresh reservoir solution every 7-10 days and keep pH around 5.8-6.2.\n\nIf plants are stressed, pale, or newly transplanted, stay at the lower rate first rather than pushing concentration.'
  },
  {
    phrases: ['kelp', 'seaweed'],
    bonusPhrases: ['foliar', 'spray', 'transplant', 'stress'],
    requiresApplicationQuestion: true,
    response:
      'Liquid kelp is usually used as either a soil drench or foliar spray. A strong starting rate is 1-2 ounces per gallon of water. Apply weekly during active growth, or every two weeks for maintenance. It is especially useful after transplanting or during heat and drought stress.\n\nUse the lower rate for tender plants and foliar spraying, and the higher rate for established plants needing recovery support.'
  },
  {
    phrases: ['biochar'],
    bonusPhrases: ['potting soil', 'container', 'terrarium', 'mix'],
    requiresApplicationQuestion: true,
    response:
      'Biochar works best when mixed into soil rather than left dry on top. Blend about 1 cup into each gallon of potting mix, or work it into the top few inches of garden soil. If possible, pre-charge it with compost, worm castings, or liquid fertilizer before use so it starts out loaded with nutrients and microbes.\n\nFor terrariums or containers, a thin layer underneath the main substrate also works well.'
  },
  {
    phrases: ['bone meal'],
    bonusPhrases: ['flowering', 'fruiting', 'roots'],
    requiresApplicationQuestion: true,
    response:
      'Liquid bone meal should be shaken well, then diluted before applying to the root zone. A strong general-use rate is about 3 ounces per gallon of water. Apply at planting time and again every four weeks for flowering or fruiting crops.\n\nAvoid spraying it on leaves. It works best as a root-zone feeding for blossoms, fruit set, and root development.'
  },
  {
    phrases: ['compost'],
    bonusPhrases: ['topdress', 'beds', 'container', 'potting mix'],
    requiresApplicationQuestion: true,
    response:
      'For compost, spread a 1-2 inch layer over beds and mix it into the top few inches of soil, or topdress around established plants with about a half-inch layer and water it in. In containers, blend compost into the potting mix rather than using it alone.\n\nSpring and fall are usually the best times for heavier compost applications, but light topdressing can be done through the season.'
  },
  {
    phrases: ['transplant shock', 'transplant', 'just planted'],
    bonusPhrases: ['wilting', 'drooping', 'stressed'],
    response:
      'For transplant shock, focus on root recovery first. Water thoroughly after planting, then use a gentle root-zone drench with kelp, humic acid, or a transplant-support fertilizer at the label rate. Keep soil evenly moist, not soggy, and protect the plant from intense afternoon stress for a few days.\n\nAvoid heavy fertilizing right away. The goal is root establishment before pushing top growth.'
  },
  {
    phrases: ['lawn', 'grass', 'turf'],
    bonusPhrases: ['schedule', 'how often', 'when should', 'feeding schedule', 'apply'],
    requiresApplicationQuestion: true,
    response:
      'For lawn treatments, apply during active growth and repeat every 3-4 weeks unless the label says otherwise. Early morning or cooler parts of the day are best. If the product is a soil conditioner or humic-seaweed blend, water it in lightly after application so it reaches the root zone.\n\nAfter heat stress, pet damage, or compaction, a monthly schedule is usually more effective than one heavy treatment.'
  },
  {
    phrases: ['humic acid', 'fulvic acid', 'humic', 'fulvic'],
    bonusPhrases: ['how often', 'mix rate', 'dilute', 'apply', 'root zone'],
    requiresApplicationQuestion: true,
    response:
      'For humic acid, dilute 2 ounces per gallon of water and apply to the root zone as a soil drench. For lawns and beds, target roughly 1 gallon of mixed solution per 1,000 sq ft, then water in lightly. Reapply every 3-4 weeks during active growth.\n\nIf your bottle has a specific label rate, follow that first, then adjust frequency based on plant response.'
  }
];

function normalizeMessage(message: string): string {
  return message.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isApplicationQuestion(message: string): boolean {
  return /(how|when|can i|should i|best way|what rate|how often).*(apply|use|mix|dilute|feed)|\bapply\b|\bapplication\b|\bhow to use\b|\bmix rate\b|\bhow much\b|\bdosage\b|\brate\b|\bschedule\b/.test(message);
}

function scorePhrases(message: string, phrases: string[]): number {
  return phrases.reduce((score, phrase) => {
    if (!message.includes(phrase)) {
      return score;
    }

    return score + Math.max(1, phrase.split(' ').length);
  }, 0);
}

function formatEducationalResponse(response: EducationalResponse): string {
  let formatted = response.answer;

  if (response.competitorOption) {
    formatted += `\n\nAlternative: ${response.competitorOption}`;
  }

  if (response.productHelp && response.productHelp.trim()) {
    formatted += `\n\nOur guidance: ${response.productHelp}`;
  }

  return formatted;
}

export function getChatResponse(userMessage: string): string {
  const normalizedMessage = normalizeMessage(userMessage);
  const applicationQuestion = isApplicationQuestion(normalizedMessage);

  let bestIntent: ScoredIntent | undefined;
  let bestIntentScore = 0;

  for (const intent of scoredIntents) {
    if (intent.requiresApplicationQuestion && !applicationQuestion) {
      continue;
    }

    const baseScore = scorePhrases(normalizedMessage, intent.phrases);
    const bonusScore = intent.bonusPhrases ? scorePhrases(normalizedMessage, intent.bonusPhrases) : 0;
    const totalScore = baseScore + bonusScore + (intent.requiresApplicationQuestion ? 2 : 0);

    if (totalScore > bestIntentScore) {
      bestIntent = intent;
      bestIntentScore = totalScore;
    }
  }

  if (bestIntent && bestIntentScore > 0) {
    return bestIntent.response;
  }

  let bestEducationalMatch: EducationalResponse | undefined;
  let bestEducationalScore = 0;

  for (const item of educationalResponses) {
    const score = scorePhrases(normalizedMessage, item.phrases);

    if (score > bestEducationalScore) {
      bestEducationalMatch = item.response;
      bestEducationalScore = score;
    }
  }

  if (bestEducationalMatch && bestEducationalScore > 0) {
    return formatEducationalResponse(bestEducationalMatch);
  }

  if (/(wilting|dying|brown|spots|drooping|burned)/.test(normalizedMessage)) {
    return 'Plant problems usually come back to watering, soil health, or disease pressure. Check whether the soil is staying too wet, drying too hard, or getting compacted around the roots. If you tell me the plant and symptom, I can narrow it down quickly.';
  }

  if (/(soil test|ph|test soil|soil ph)/.test(normalizedMessage)) {
    return 'Soil pH affects nutrient availability, and most plants prefer roughly 6.0-7.0. A simple soil test is the fastest way to know whether you need to correct pH or focus on biology, compost, and nutrient balance first.';
  }

  return 'I can help with specific things like mix rates, how often to apply, lawn recovery, tomato problems, compost use, biochar, or pet damage. Try a direct question like "how often should I apply humic acid?", "what helps blossom end rot?", or "how do I use biochar in potting soil?"';
}