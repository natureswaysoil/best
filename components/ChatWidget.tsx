import { useState } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m here to help with soil and plant health questions. What\'s happening in your garden? 🌱',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const educationalResponses: Record<string, { answer: string; productHelp?: string; competitorOption?: string }> = {
    'yellow leaves': {
      answer: 'Yellow leaves usually indicate nitrogen deficiency, overwatering, or poor soil drainage. First, check if soil is soggy (overwatering) or compacted. For nutrient deficiency, soil needs living microbes to break down organic matter into plant-available nutrients.',
      productHelp: 'If it\'s nutrient deficiency, our liquid fertilizer with living microbes can help restore the soil\'s natural nutrient cycling.',
      competitorOption: 'For immediate results, you could also try Dr. Earth or Espoma liquid fertilizers from garden centers.'
    },
    'clay soil': {
      answer: 'Clay soil is nutrient-rich but has poor drainage and aeration. The key is improving soil structure without disrupting the beneficial aspects. Add organic matter and biochar to create pore spaces while maintaining fertility.',
      productHelp: 'Our biochar works especially well for clay - it creates permanent structure improvements and habitat for beneficial microbes.',
      competitorOption: 'You can also use perlite or expanded shale from local nurseries, though biochar provides longer-lasting benefits.'
    },
    'sandy soil': {
      answer: 'Sandy soil drains well but doesn\'t hold nutrients or water. You need to increase organic matter and create microbial networks to help retain both. Compost and biochar are the long-term solution.',
      productHelp: 'Our enhanced compost blend with biochar will help sandy soil hold water and nutrients much better.',
      competitorOption: 'Any quality compost will help, though look for ones with worm castings. Local municipal compost is often very affordable.'
    },
    'fertilizer': {
      answer: 'Plants need 16 essential nutrients. Synthetic fertilizers provide NPK but often kill soil microbes. Living soil with beneficial bacteria and fungi can provide all nutrients naturally by breaking down organic matter.',
      productHelp: 'If you want to transition to natural fertility, our microbe-rich liquid fertilizer helps rebuild that soil biology.',
      competitorOption: 'For organic options, consider Jobes Organics, Dr. Earth, or even compost tea you can make yourself.'
    },
    'organic': {
      answer: 'Organic gardening works by feeding the soil ecosystem instead of just the plant. Healthy soil biology creates disease resistance, better nutrient uptake, and improved water retention naturally.',
      productHelp: 'All our products support organic growing by building soil biology rather than depleting it.'
    },
    'compost': {
      answer: 'Good compost contains billions of beneficial microbes, improves soil structure, and provides slow-release nutrients. The key is making sure it\'s fully decomposed and biologically active.',
      productHelp: 'Our enhanced living compost includes 20% worm castings and 20% biochar for maximum biological activity and soil improvement.',
      competitorOption: 'Local nurseries often carry quality compost. Look for brands like Black Kow or make your own compost pile.'
    },
    'biochar': {
      answer: 'Biochar is charcoal that creates permanent habitat for soil microbes and improves water retention by up to 40%. It works by providing surface area - 300+ square meters per gram - for beneficial bacteria to live.',
      productHelp: 'Our activated biochar is sized specifically for garden use and helps create lasting soil improvements.',
      competitorOption: 'You can find biochar at some garden centers, or even make it yourself if you have a safe burn area.'
    },
    'microbes': {
      answer: 'Soil microbes are the foundation of plant health. They break down organic matter, protect roots from disease, improve nutrient uptake, and help plants communicate. Healthy soil contains billions per gram.',
      productHelp: 'Our liquid fertilizers contain billions of these beneficial microbes and are made fresh weekly for maximum activity.',
      competitorOption: 'You can also buy mycorrhizal inoculants from companies like Mycorrhizal Applications or make compost tea.'
    },
    'tomatoes': {
      answer: 'Tomatoes need consistent moisture, good drainage, and steady nutrition. Common problems: blossom end rot (calcium/watering issue), yellowing (nitrogen), or wilting (root problems or disease).',
      productHelp: 'Our tomato-specific liquid fertilizer includes calcium and helps prevent blossom end rot while building soil biology.',
      competitorOption: 'For blossom end rot specifically, any calcium supplement works. Bone meal or gypsum from garden stores are good options.'
    },
    'lawn': {
      answer: 'Healthy lawns need good soil biology, proper pH (6.0-7.0), and adequate organic matter. Most lawn problems come from compacted soil, thatch buildup, or poor microbial activity.',
      productHelp: 'Our lawn treatment with seaweed and humic acid helps build the soil biology that creates naturally green, healthy grass.',
      competitorOption: 'For quick greening, Milorganite or Ringer are good organic options. For soil improvement, any compost helps.'
    },
    'pet safe': {
      answer: 'Pet-safe gardening means avoiding synthetic chemicals that can harm animals. Focus on building healthy soil naturally - it\'s safer and more effective long-term.',
      productHelp: 'All our products are 100% natural and safe for pets, kids, and beneficial insects like bees and butterflies.',
      competitorOption: 'Most organic fertilizers are pet-safe. Check OMRI-listed products like Dr. Earth, Espoma, or simple compost.'
    },
    'price': {
      answer: 'Soil health is an investment that pays off in reduced watering, fertilizing, and pest problems. Quality organic products cost more upfront but improve soil permanently.',
      competitorOption: 'For budget options: municipal compost, homemade compost tea, or buying in bulk from feed stores can be very economical.'
    },
    'budget': {
      answer: 'You can improve soil on any budget! Composting kitchen scraps is free, and many cities offer free or cheap compost. The key is adding organic matter consistently.',
      competitorOption: 'Budget options: Free municipal compost, coffee grounds from coffee shops, fallen leaves for compost, or DIY compost tea.'
    },
    'diy': {
      answer: 'DIY soil improvement is very effective! Compost piles, compost tea brewing, and saving fallen leaves all build soil biology. The best soil amendments are often free.',
      competitorOption: 'Try making compost tea with a 5-gallon bucket, molasses, and compost. Or collect coffee grounds from local cafes.'
    },
    'hydroponic': {
      answer: 'Hydroponics can be very productive but requires precise nutrient management. Consider whether soil-based growing might be simpler and more sustainable for your situation.',
      competitorOption: 'For hydroponic nutrients, General Hydroponics or Masterblend are popular. But soil growing often produces better flavor with less effort.'
    },
    'shipping': {
      answer: 'We offer free shipping on orders over $50. We ship liquid fertilizers the same week they\'re made to ensure you get maximum microbial activity.',
      productHelp: ''
    },
    'application': {
      answer: 'Application depends on the product and your soil needs. Generally: liquid fertilizers are diluted and watered in, biochar is mixed into soil, and compost is spread as a top layer.',
      productHelp: 'Each product comes with detailed instructions, and we\'re happy to help you create a custom soil improvement plan.'
    },
    'hello': {
      answer: 'Hi! I\'m here to help with soil and plant questions. What\'s happening in your garden?',
      productHelp: ''
    },
    'help': {
      answer: 'I can help with soil problems, plant nutrition, organic growing methods, and general gardening questions. What specific challenge are you facing?',
      productHelp: ''
    },
    'nutrients': {
      answer: 'Plants need 16 essential nutrients. The "big 3" (NPK) get attention, but micronutrients like calcium, magnesium, and iron are equally important. Healthy soil biology makes all nutrients available naturally.',
      productHelp: 'Our liquid fertilizers provide balanced nutrition plus the microbes that make nutrients available to plants long-term.',
      competitorOption: 'For micronutrients specifically, kelp meal or rock dust from garden centers can be very effective and economical.'
    },
    'watering': {
      answer: 'Most plant problems come from watering issues - either too much or too little. Soil should be moist but not soggy. Good soil structure (from compost/biochar) helps maintain proper moisture levels.',
      productHelp: 'Biochar can improve water retention by 40%, reducing watering needs and preventing both drought stress and waterlogging.'
    },
    'pests': {
      answer: 'Healthy plants resist pests naturally. Focus on soil health first - strong plants with good nutrition and beneficial microbial partners are less attractive to harmful insects.',
      productHelp: 'Building soil biology with our products creates the foundation for natural pest resistance.',
      competitorOption: 'For immediate pest issues, neem oil, diatomaceous earth, or beneficial insects from local suppliers can help.'
    },
    'disease': {
      answer: 'Plant diseases often start with stressed plants in poor soil. Beneficial soil microbes create a protective barrier around roots and help plants defend themselves naturally.',
      productHelp: 'Our living compost and liquid fertilizers introduce beneficial microbes that help prevent root diseases and build plant immunity.',
      competitorOption: 'For existing disease issues, copper fungicides or beneficial bacteria products like Serenade can help.'
    },
    'when to fertilize': {
      answer: 'Feed soil biology year-round, but plants need most nutrition during active growth (spring/summer). Fall is great for building soil with compost. Avoid fertilizing dormant plants in winter.',
      productHelp: 'Our seasonal application guide can help you time applications for maximum plant benefit and soil health.'
    },
    'expensive': {
      answer: 'Quality soil amendments are an investment, but they improve soil permanently and reduce long-term costs. You can also start small and build soil health gradually.',
      competitorOption: 'Budget alternatives: Municipal compost, coffee grounds, leaf mold, or making your own compost tea can be very affordable.'
    },
    'local': {
      answer: 'Supporting local suppliers is great! Many areas have local compost facilities, and regional products are often well-suited to local soil conditions.',
      competitorOption: 'Check with your local cooperative extension for soil testing and recommendations specific to your area.'
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Look for educational matches first
    for (const [key, content] of Object.entries(educationalResponses)) {
      if (lowerMessage.includes(key) || 
          (key === 'hello' && (lowerMessage.includes('hi') || lowerMessage.includes('hey'))) ||
          (key === 'yellow leaves' && (lowerMessage.includes('yellow') || lowerMessage.includes('chlorosis'))) ||
          (key === 'clay soil' && lowerMessage.includes('clay')) ||
          (key === 'sandy soil' && lowerMessage.includes('sandy')) ||
          (key === 'pet safe' && (lowerMessage.includes('pet') || lowerMessage.includes('dog') || lowerMessage.includes('cat'))) ||
          (key === 'tomatoes' && (lowerMessage.includes('tomato') || lowerMessage.includes('blossom end rot'))) ||
          (key === 'lawn' && (lowerMessage.includes('grass') || lowerMessage.includes('turf')))) {
        
        // Start with educational content
        let response = content.answer;
        
        // Add competitor options first (education over sales)
        if (content.competitorOption) {
          response += '\n\n🌱 ' + content.competitorOption;
        }
        
        // Add our product option last, if relevant
        if (content.productHelp && content.productHelp.trim()) {
          response += '\n\n💡 ' + content.productHelp;
        }
        
        return response;
      }
    }
    
    // Handle plant problems generically
    if (lowerMessage.includes('wilting') || lowerMessage.includes('dying') || lowerMessage.includes('brown') || lowerMessage.includes('spots')) {
      return 'Plant problems usually stem from watering issues, soil health, or disease. Can you describe what you\'re seeing? Are leaves yellow, brown, spotted, or wilting? And what type of plant?\n\n🌱 Quick fixes: Check watering, improve drainage, or try organic fungicides from garden centers.\n\n💡 Long-term: Building soil biology prevents most plant health issues naturally.';
    }
    
    // Handle soil testing questions
    if (lowerMessage.includes('ph') || lowerMessage.includes('test') || lowerMessage.includes('soil test')) {
      return 'Soil pH affects nutrient availability. Most plants prefer 6.0-7.0 pH. You can test with a simple soil meter or pH strips. But remember - healthy soil biology can help plants access nutrients even in less-than-ideal pH.\n\n🌱 Local extension offices often offer affordable soil testing with detailed recommendations.\n\n💡 Building soil biology with compost and beneficial microbes often solves pH-related nutrient problems naturally.';
    }
    
    // Default response focuses on education and helpfulness
    return 'I\'m here to help you succeed with your soil and plants! Could you tell me more about what you\'re experiencing? The more specific you can be, the better I can point you toward the right solution - whether that\'s something we offer, a DIY approach, or another product that might work better for your situation.';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-gradient-to-b from-amber-50 to-white rounded-xl shadow-2xl border-2 border-nature-green-600 flex flex-col">
        {/* Header - Clickable to toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-nature-green-600 to-nature-green-700 text-white p-4 rounded-t-lg border-b-2 border-amber-700 text-left hover:from-nature-green-700 hover:to-nature-green-800 transition-all w-full"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">Soil & Plant Questions?</h3>
                <p className="text-sm text-green-100">Ask Our Farm Experts</p>
              </div>
            </div>
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <div className="w-3 h-3 bg-amber-300 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>

        {/* Chat Content - Toggleable */}
        {isOpen && (
          <div className="flex flex-col h-96">

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-nature-green-600 to-nature-green-700 shadow-md' 
                      : 'bg-gradient-to-br from-amber-200 to-amber-300'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-amber-800" />
                    )}
                  </div>
                  <div className={`px-3 py-2 rounded-xl text-sm shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-nature-green-600 to-nature-green-700 text-white'
                      : 'bg-white border border-amber-200 text-gray-800'
                  }`}>
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-amber-800" />
                  </div>
                  <div className="bg-white border border-amber-200 px-3 py-2 rounded-xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-nature-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-nature-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-nature-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-nature-green-600 bg-amber-50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border-2 border-nature-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600 text-sm bg-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-3 py-2 bg-gradient-to-r from-nature-green-600 to-nature-green-700 text-white rounded-lg hover:from-nature-green-700 hover:to-nature-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
        )}
    </div>
  );
}