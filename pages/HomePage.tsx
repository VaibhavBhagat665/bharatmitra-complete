import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AshokaChakraIcon } from '../components/icons/AshokaChakraIcon';
import { useUser } from '../contexts/UserContext';

const testimonials = {
  en: [
    // {
    //   name: 'Anjali, B.Tech Student',
    //   message: 'Bharat Mitra helped me find a scholarship I never knew existed. It made a real difference!',
    // },
    // {
    //   name: 'Rajeev, Farmer from MP',
    //   message: 'I got info on PM-KISAN easily. The chatbot spoke in Hindi and made it simple!',
    // },
    // {
    //   name: 'Meena, Homemaker',
    //   message: 'I found health schemes for my family with just one question. Great work!',
    // },
  ],
  hi: [
    // {
    //   name: 'अंजलि, बी.टेक छात्रा',
    //   message: 'भारत मित्र ने मुझे एक ऐसी छात्रवृत्ति दिलाई जिसके बारे में मैं जानती ही नहीं थी। इसने वास्तव में फर्क डाला!',
    // },
    // {
    //   name: 'राजीव, मध्य प्रदेश के किसान',
    //   message: 'मुझे PM-KISAN की जानकारी आसानी से मिली। चैटबॉट हिंदी में बात करता है और सब कुछ सरल बनाता है!',
    // },
    // {
    //   name: 'मीना, गृहिणी',
    //   message: 'मैंने अपने परिवार के लिए स्वास्थ्य योजनाएं सिर्फ एक सवाल से पा लीं। बहुत बढ़िया काम!',
    // },
  ]
};

const content = {
  en: {
    title: 'Welcome to Bharat Mitra',
    subtitle: 'Your trusted AI assistant for navigating Indian government schemes. Ask in your English/Hindi and get clear answers about scholarships, farmer support, and citizen benefits.',
    startChatButton: 'Start Asking Questions',
    downloadMobileButton: 'Download for Mobile',
    studentsTitle: '🎓 For Students',
    studentsDesc: 'Find scholarships, educational loans, and skill development programs tailored for you.',
    farmersTitle: '🌾 For Farmers',
    farmersDesc: 'Get crop insurance, subsidies for equipment, and income support schemes like PM-KISAN.',
    citizensTitle: '🏠 For All Citizens',
    citizensDesc: 'Learn about Ayushman Bharat, housing schemes, and social welfare benefits for everyone.',
    // testimonialsTitle: '✨ What People Are Saying',
    knowledgeHubTitle: '📚 Bharat Knowledge Hub',
    faqTitle: '🤔 Frequently Asked Questions',
    faqData: [
      {
        icon: '💬',
        title: 'Is this chatbot free?',
        answer: '🤖 Yes! Bharat Mitra is free for everyone and helps you access real schemes.',
      },
      {
        icon: '🔍',
        title: 'How accurate is the advice?',
        answer: '💬 We use trusted government APIs & datasets to answer your questions.',
      },
      {
        icon: '🇮🇳',
        title: 'Can I ask in Hindi?',
        answer: '✅ Absolutely! Speak or type in Hindi, and the chatbot will respond in Hindi.',
      },
      {
        icon: '📚',
        title: 'What kind of schemes can I ask about?',
        answer: '🎯 You can ask about education, farming, health, housing, employment and more.',
      },
      {
        icon: '🖥️',
        title: 'Do I need to install any app?',
        answer: '🌐 No installation needed — just open the website and start chatting!',
      },
      {
        icon: '🔒',
        title: 'Is my data safe?',
        answer: "🛡️ Absolutely. We don't collect any personal data or store your queries.",
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
    downloadMobileButton: 'मोबाइल के लिए डाउनलोड करें',
    studentsTitle: '🎓 छात्रों के लिए',
    studentsDesc: 'आपके लिए उपयुक्त छात्रवृत्ति, शैक्षणिक ऋण और कौशल विकास कार्यक्रम खोजें।',
    farmersTitle: '🌾 किसानों के लिए',
    farmersDesc: 'फसल बीमा, उपकरण सब्सिडी और PM-KISAN जैसी आय सहायता योजनाएं प्राप्त करें।',
    citizensTitle: '🏠 सभी नागरिकों के लिए',
    citizensDesc: 'आयुष्मान भारत, आवास योजनाओं और सभी के लिए सामाजिक कल्याण लाभों के बारे में जानें।',
    // testimonialsTitle: '✨ लोग क्या कह रहे हैं',
    knowledgeHubTitle: '📚 भारत ज्ञान केंद्र',
    faqTitle: '🤔 अक्सर पूछे जाने वाले प्रश्न',
    faqData: [
      {
        icon: '💬',
        title: 'क्या यह चैटबॉट मुफ्त है?',
        answer: '🤖 हां! भारत मित्र सभी के लिए मुफ्त है और आपको वास्तविक योजनाओं तक पहुंचने में मदद करता है।',
      },
      {
        icon: '🔍',
        title: 'सलाह कितनी सटीक है?',
        answer: '💬 हम आपके सवालों का जवाब देने के लिए विश्वसनीय सरकारी APIs और डेटासेट का उपयोग करते हैं।',
      },
      {
        icon: '🇮🇳',
        title: 'क्या मैं हिंदी में पूछ सकता हूं?',
        answer: '✅ बिल्कुल! हिंदी में बोलें या टाइप करें, और चैटबॉट हिंदी में जवाब देगा।',
      },
      {
        icon: '📚',
        title: 'मैं किस प्रकार की योजनाओं के बारे में पूछ सकता हूं?',
        answer: '🎯 आप शिक्षा, कृषि, स्वास्थ्य, आवास, रोजगार और अधिक के बारे में पूछ सकते हैं।',
      },
      {
        icon: '🖥️',
        title: 'क्या मुझे कोई ऐप इंस्टॉल करना होगा?',
        answer: '🌐 कोई इंस्टॉलेशन की आवश्यकता नहीं — बस वेबसाइट खोलें और चैट करना शुरू करें!',
      },
      {
        icon: '🔒',
        title: 'क्या मेरा डेटा सुरक्षित है?',
        answer: "🛡️ बिल्कुल। हम कोई व्यक्तिगत डेटा एकत्र नहीं करते या आपकी क्वेरी स्टोर नहीं करते।",
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

  // Function to handle APK download
  const handleDownloadAPK = () => {
    const link = document.createElement('a');
    link.href = '/bharat-mitra.apk'; 
    link.download = 'bharat-mitra.apk';
    link.click();
  };

  return (
    <>
      {/* 🔹 Background Video Section */}
      <div className="relative min-h-screen backdrop-blur-md overflow-hidden text-center text-white">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/30113222/12915429_1920_1080_25fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="relative z-10 px-6 py-12 backdrop-blur-sm bg-black/20 min-h-screen flex flex-col justify-center">
        {/* Ashoka Chakra */}
        <div className="flex justify-center items-center mb-6 animate-fade-in">
          <AshokaChakraIcon className="h-20 w-20 text-white rotate-slow" />
        </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md animate-fade-in-up">
            {currentContent.title}
          </h1>

          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in-up delay-200">
            {currentContent.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 animate-fade-in-up delay-300">
            <Link
              to="/chat"
              className="bg-bharat-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-bharat-blue-800 transform hover:scale-105 transition-all shadow-lg"
            >
              {currentContent.startChatButton}
            </Link>
            <button
              onClick={handleDownloadAPK}
              className="bg-bharat-saffron-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-bharat-saffron-600 transform hover:scale-105 transition-all shadow-lg flex items-center gap-2"
            >
              <span>📱</span>
              {currentContent.downloadMobileButton}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-fade-in-up delay-500 mb-16 text-black">
            {[
              {
                title: currentContent.studentsTitle,
                description: currentContent.studentsDesc,
                border: 'border-bharat-blue-500',
              },
              {
                title: currentContent.farmersTitle,
                description: currentContent.farmersDesc,
                border: 'border-bharat-green-500',
              },
              {
                title: currentContent.citizensTitle,
                description: currentContent.citizensDesc,
                border: 'border-bharat-saffron-500',
              },
            ].map((info, idx) => (
              <div
                key={idx}
                className={`bg-white/90 p-6 rounded-2xl shadow-xl border-t-4 ${info.border}`}
              >
                <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">{info.title}</h3>
                <p className="text-gray-700">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔸 Remaining Page Section (Testimonial + Marquee + FAQ) */}
      <div className="bg-red-50 px-6 py-16">
        {/* ✨ Testimonials */}
{/*         <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-3xl mx-auto animate-fade-in-up delay-700">
          <h2 className="text-2xl font-bold text-red-700 mb-6">{currentContent.testimonialsTitle}</h2>
          <div className="relative h-32 overflow-hidden">
            {currentTestimonials.map((t, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  idx === currentIndex
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-full scale-95'
                }`}
              >
                <div className="bg-bharat-blue-50 border-l-4 border-bharat-saffron-600 text-left p-6 rounded shadow-md h-full flex flex-col justify-center">
                  <p className="text-lg text-gray-800 italic mb-2">"{t.message}"</p>
                  <p className="text-sm text-gray-600 font-semibold">- {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* 🌐 Bharat Knowledge Hub */}
        <div className="mt-24">
          <h2 className="text-3xl font-extrabold text-bharat-blue-900 mb-8 text-center flex items-center justify-center gap-2">
            {currentContent.knowledgeHubTitle} <span className="text-xl">🔍📖🧠</span>
          </h2>
          <div className="marquee-container">
            <div className="marquee-track gap-6 px-6">
              {currentContent.schemeData.map((entry, idx) => (
                <a
                  key={idx}
                  href={schemeLinks[idx]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative min-w-[280px] max-w-xs rounded-xl overflow-hidden shadow-md grayscale hover:grayscale-0 transform hover:scale-105 transition-all duration-300 group bg-white"
                >
                  <img src={schemeImages[idx]} alt={entry.title} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col justify-between h-40">
                    <h3 className="text-lg md:text-xl font-bold text-bharat-blue-900">{entry.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{entry.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ❓ FAQ Section */}
        <div className="mt-24 max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-red-700 mb-8 flex items-center gap-2">
            {currentContent.faqTitle} <span className="animate-ping text-lg">❓</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentContent.faqData.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 group hover:brightness-105 hover:shadow-red-200 transition-all duration-500"
              >
                <div className="text-3xl mb-2">{faq.icon}</div>
                <h4 className="font-semibold text-bharat-blue-900 text-lg">{faq.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
