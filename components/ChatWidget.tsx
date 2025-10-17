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
      text: 'Hi! I\'m here to help with any questions about our soil products. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const predefinedResponses: Record<string, string> = {
    'shipping': 'We offer free shipping on orders over $50! Orders typically ship within 1-2 business days.',
    'fertilizer': 'Our microbe-rich fertilizers are perfect for all plants and are completely safe for kids and pets. They help build stronger, healthier soil naturally.',
    'biochar': 'Our premium biochar improves soil structure, water retention, and nutrient availability. It\'s made from sustainable sources right here on our farm.',
    'compost': 'Our natural compost is rich in beneficial microorganisms and perfect for vegetable gardens, flower beds, and lawn care.',
    'natural': 'All our products are 100% natural and safe for children, pets, and pollinators. We believe in naturally stronger soil.',
    'price': 'Our products start at $25 for small bags, with bulk discounts available. Check out our bundles for the best value!',
    'application': 'Application is easy! Simply spread evenly over your soil and water in. Detailed instructions come with each product.',
    'hello': 'Hello! Welcome to Nature\'s Way Soil. What can I help you with today?',
    'help': 'I can help you with product information, shipping details, application instructions, and more. What would you like to know?'
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return 'Thank you for your question! For specific inquiries, please call us at (555) 123-4567 or email hello@naturesway.com. Our team is happy to help!';
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
                <h3 className="font-bold text-lg">Need Help With Your Garden?</h3>
                <p className="text-sm text-green-100">Ask Us</p>
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