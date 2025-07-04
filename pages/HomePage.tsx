import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Wheat, 
  Home, 
  MessageCircle, 
  Search, 
  Globe, 
  BookOpen, 
  Monitor, 
  Shield, 
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Users,
  Award,
  Heart,
  Zap,
  CheckCircle,
  Info
} from 'lucide-react';

// Mock AshokaChakraIcon component
const AshokaChakraIcon = ({ className }: { className?: string }) => (
  <div className={`${className} rounded-full border-4 border-current flex items-center justify-center`}>
    <div className="w-2 h-2 bg-current rounded-full"></div>
  </div>
);

// Mock useUser hook
const useUser = () => ({
  language: 'en' as 'en' | 'hi'
});

const testimonials = {
  en: [],
  hi: []
};

const content = {
  en: {
    title: 'Welcome to Bharat Mitra',
    subtitle: 'Your trusted AI assistant for navigating Indian government schemes. Ask in English/Hindi and get clear answers about scholarships, farmer support, and citizen benefits.',
    startChatButton: 'Start Asking Questions',
    benefitsButton: 'View Recommended Benefits',
    studentsTitle: 'For Students',
    studentsDesc: 'Find scholarships, educational loans, and skill development programs tailored for you.',
    farmersTitle: 'For Farmers',
    farmersDesc: 'Get crop insurance, subsidies for equipment, and income support schemes like PM-KISAN.',
    citizensTitle: 'For All Citizens',
    citizensDesc: 'Learn about Ayushman Bharat, housing schemes, and social welfare benefits for everyone.',
    knowledgeHubTitle: 'Bharat Knowledge Hub',
    faqTitle: 'Frequently Asked Questions',
    faqData: [
      {
        icon: MessageCircle,
        title: 'Is this chatbot free?',
        answer: 'Yes! Bharat Mitra is free for everyone and helps you access real schemes.',
      },
      {
        icon: Search,
        title: 'How accurate is the advice?',
        answer: 'We use trusted government APIs & datasets to answer your questions.',
      },
      {
        icon: Globe,
        title: 'Can I ask in Hindi?',
        answer: 'Absolutely! Speak or type in Hindi, and the chatbot will respond in Hindi.',
      },
      {
        icon: BookOpen,
        title: 'What kind of schemes can I ask about?',
        answer: 'You can ask about education, farming, health, housing, employment and more.',
      },
      {
        icon: Monitor,
        title: 'Do I need to install any app?',
        answer: 'No installation needed — just open the website and start chatting!',
      },
      {
        icon: Shield,
        title: 'Is my data safe?',
        answer: "Absolutely. We don't collect any personal data or store your queries.",
      },
    ],
    schemeData: [
      {
        title: 'National Scholarship Portal',
        description: 'Find and apply for various scholarships with ease.',
      },
      {
        title: 'PM-KISAN Yojana',
        description: 'Receive ₹6,000 annually in 3 installments directly in your bank.',
      },
      {
        title: 'Ayushman Bharat',
        description: 'Free treatment up to ₹5 lakhs under the world\'s largest health scheme.',
      },
      {
        title: 'Beti Bachao Beti Padhao',
        description: 'Support for girl child education and safety.',
      },
    ]
  },
  hi: {
    title: 'भारत मित्र में आपका स्वागत है',
    subtitle: 'भारतीय सरकारी योजनाओं के लिए आपका विश्वसनीय AI सहायक। हिंदी/अंग्रेजी में पूछें और छात्रवृत्ति, किसान सहायता और नागरिक लाभों के बारे में स्पष्ट उत्तर पाएं।',
    startChatButton: 'सवाल पूछना शुरू करें',
    benefitsButton: 'सुझाई गई योजनाएं देखें',
    studentsTitle: 'छात्रों के लिए',
    studentsDesc: 'आपके लिए उपयुक्त छात्रवृत्ति, शैक्षणिक ऋण और कौशल विकास कार्यक्रम खोजें।',
    farmersTitle: 'किसानों के लिए',
    farmersDesc: 'फसल बीमा, उपकरण सब्सिडी और PM-KISAN जैसी आय सहायता योजनाएं प्राप्त करें।',
    citizensTitle: 'सभी नागरिकों के लिए',
    citizensDesc: 'आयुष्मान भारत, आवास योजनाओं और सभी के लिए सामाजिक कल्याण लाभों के बारे में जानें।',
    knowledgeHubTitle: 'भारत ज्ञान केंद्र',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    faqData: [
      {
        icon: MessageCircle,
        title: 'क्या यह चैटबॉट मुफ्त है?',
        answer: 'हां! भारत मित्र सभी के लिए मुफ्त है और आपको वास्तविक योजनाओं तक पहुंचने में मदद करता है।',
      },
      {
        icon: Search,
        title: 'सलाह कितनी सटीक है?',
        answer: 'हम आपके सवालों का जवाब देने के लिए विश्वसनीय सरकारी APIs और डेटासेट का उपयोग करते हैं।',
      },
      {
        icon: Globe,
        title: 'क्या मैं हिंदी में पूछ सकता हूं?',
        answer: 'बिल्कुल! हिंदी में बोलें या टाइप करें, और चैटबॉट हिंदी में जवाब देगा।',
      },
      {
        icon: BookOpen,
        title: 'मैं किस प्रकार की योजनाओं के बारे में पूछ सकता हूं?',
        answer: 'आप शिक्षा, कृषि, स्वास्थ्य, आवास, रोजगार और अधिक के बारे में पूछ सकते हैं।',
      },
      {
        icon: Monitor,
        title: 'क्या मुझे कोई ऐप इंस्टॉल करना होगा?',
        answer: 'कोई इंस्टॉलेशन की आवश्यकता नहीं — बस वेबसाइट खोलें और चैट करना शुरू करें!',
      },
      {
        icon: Shield,
        title: 'क्या मेरा डेटा सुरक्षित है?',
        answer: "बिल्कुल। हम कोई व्यक्तिगत डेटा एकत्र नहीं करते या आपकी क्वेरी स्टोर नहीं करते।",
      },
    ],
    schemeData: [
      {
        title: 'राष्ट्रीय छात्रवृत्ति पोर्टल',
        description: 'आसानी से विभिन्न छात्रवृत्तियों को खोजें और आवेदन करें।',
      },
      {
        title: 'PM-KISAN योजना',
        description: 'सीधे अपने बैंक में 3 किश्तों में सालाना ₹6,000 प्राप्त करें।',
      },
      {
        title: 'आयुष्मान भारत',
        description: 'दुनिया की सबसे बड़ी स्वास्थ्य योजना के तहत ₹5 लाख तक का मुफ्त इलाज।',
      },
      {
        title: 'बेटी बचाओ बेटी पढ़ाओ',
        description: 'बालिका शिक्षा और सुरक्षा के लिए समर्थन।',
      },
    ]
  }
};

const HomePage: React.FC = () => {
  const { language } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentContent = content[language];
  const currentTestimonials = testimonials[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentTestimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentTestimonials.length]);

  const schemeImages = [
    'https://www.pw.live/files001/nsp.png',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR89shLdvO83-NTbz1rweZkxbxbGtkxyis02A&s',
    'https://www.okbima.com/assets/uploads/blog/2018977fba45e5fa1bb958ed777f29db.webp',
    'https://upload.wikimedia.org/wikipedia/en/8/8c/Beti_Bachao_Beti_Padhao_logo.jpg?20231027000024'
  ];

  const schemeLinks = [
    'https://scholarships.gov.in/',
    'https://pmkisan.gov.in/',
    'https://pmjay.gov.in/',
    'https://www.pmindia.gov.in/hi/government_tr_rec/%E0%A4%AC%E0%A5%87%E0%A4%9F%E0%A5%80-%E0%A4%AC%E0%A4%9A%E0%A4%BE%E0%A4%93-%E0%A4%AC%E0%A5%87%E0%A4%9F%E0%A5%80-%E0%A4%AA%E0%A4%A2%E0%A4%BC%E0%A4%BE%E0%A4%93-%E0%A4%AC%E0%A4%BE%E0%A4%B2/',
  ];

  const featureCards = [
    {
      icon: GraduationCap,
      title: currentContent.studentsTitle,
      description: currentContent.studentsDesc,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Wheat,
      title: currentContent.farmersTitle,
      description: currentContent.farmersDesc,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Home,
      title: currentContent.citizensTitle,
      description: currentContent.citizensDesc,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600'
    },
  ];

  const stats = [
    { icon: Users, number: '10M+', label: 'Citizens Helped' },
    { icon: Award, number: '500+', label: 'Government Schemes' },
    { icon: Heart, number: '99%', label: 'Satisfaction Rate' },
    { icon: Zap, number: '24/7', label: 'Always Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 px-6 py-20 text-center text-white">
          {/* Ashoka Chakra */}
          <div className="flex justify-center items-center mb-8">
            <AshokaChakraIcon className="h-24 w-24 text-white animate-spin-slow" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {currentContent.title}
          </h1>

          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 text-blue-100 leading-relaxed">
            {currentContent.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
            <button
              onClick={() => window.location.href = '/chat'}
              className="group bg-white text-blue-700 font-bold py-4 px-8 rounded-full text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-3"
            >
              <MessageCircle className="h-5 w-5" />
              {currentContent.startChatButton}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => window.location.href = '/benefits'}
              className="group bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-3"
            >
              <Search className="h-5 w-5" />
              {currentContent.benefitsButton}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all duration-300">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Help</h2>
            <p className="text-xl text-gray-600">Tailored solutions for every citizen</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featureCards.map((card, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`}></div>
                <div className="relative z-10 p-8 text-white">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 w-fit mb-6">
                    <card.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                  <p className="text-lg opacity-90 leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Knowledge Hub */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-600" />
              {currentContent.knowledgeHubTitle}
            </h2>
            <p className="text-xl text-gray-600">Explore popular government schemes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentContent.schemeData.map((scheme, idx) => (
              <a
                key={idx}
                href={schemeLinks[idx]}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={schemeImages[idx]} 
                    alt={scheme.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {scheme.title}
                    </h3>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{scheme.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <HelpCircle className="h-10 w-10 text-blue-600" />
              {currentContent.faqTitle}
            </h2>
            <p className="text-xl text-gray-600">Get answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentContent.faqData.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 group"
              >
                <div className="bg-blue-50 rounded-2xl p-4 w-fit mb-6 group-hover:bg-blue-100 transition-colors">
                  <faq.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{faq.title}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join millions of Indians who trust Bharat Mitra for government scheme guidance
          </p>
          <button
            onClick={() => window.location.href = '/chat'}
            className="group inline-flex items-center gap-3 bg-white text-blue-700 font-bold py-4 px-8 rounded-full text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            <MessageCircle className="h-6 w-6" />
            Start Your Journey
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
