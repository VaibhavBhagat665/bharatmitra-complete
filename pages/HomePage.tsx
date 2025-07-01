import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AshokaChakraIcon } from '../components/icons/AshokaChakraIcon';

const testimonials = [
  {
    name: 'Anjali, B.Tech Student',
    message:
      'Bharat Mitra helped me find a scholarship I never knew existed. It made a real difference!',
  },
  {
    name: 'Rajeev, Farmer from MP',
    message:
      'I got info on PM-KISAN easily. The chatbot spoke in Hindi and made it simple!',
  },
  {
    name: 'Meena, Homemaker',
    message:
      'I found health schemes for my family with just one question. Great work!',
  },
];

const HomePage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 bg-fixed bg-[url('https://www.transparenttextures.com/patterns/flower.png')] bg-red-50 bg-blend-overlay bg-opacity-90 text-center">
      {/* Ashoka Chakra */}
      <div className="flex justify-center items-center mb-6 animate-fade-in">
        <AshokaChakraIcon className="h-24 w-24 text-bharat-blue-800 animate-spin-slow" />
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-bharat-blue-900 mb-4 drop-shadow-md animate-fade-in-up">
        🇮🇳 Welcome to Bharat Mitra
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8 animate-fade-in-up delay-200">
        Your trusted AI assistant for navigating Indian government schemes. Ask in your own language and get clear answers about scholarships, farmer support, and citizen benefits.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 animate-fade-in-up delay-300">
        <Link
          to="/chat"
          className="bg-bharat-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-bharat-blue-800 transform hover:scale-105 transition-all shadow-lg"
        >
          Start Asking Questions
        </Link>
        <Link
          to="/benefits"
          className="bg-bharat-saffron-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-bharat-saffron-600 transform hover:scale-105 transition-all shadow-lg"
        >
          View Recommended Benefits
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-fade-in-up delay-500 mb-16">
        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-bharat-blue-500 transition hover:scale-[1.02] hover:shadow-red-200">
          <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">🎓 For Students</h3>
          <p className="text-gray-600">
            Find scholarships, educational loans, and skill development programs tailored for you.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-bharat-green-500 transition hover:scale-[1.02] hover:shadow-red-200">
          <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">🌾 For Farmers</h3>
          <p className="text-gray-600">
            Get crop insurance, subsidies for equipment, and income support schemes like PM-KISAN.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-bharat-saffron-500 transition hover:scale-[1.02] hover:shadow-red-200">
          <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">🏠 For All Citizens</h3>
          <p className="text-gray-600">
            Learn about Ayushman Bharat, housing schemes, and social welfare benefits for everyone.
          </p>
        </div>
      </div>

      {/* Testimonials Slider */}
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-3xl mx-auto animate-fade-in-up delay-700">
        <h2 className="text-2xl font-bold text-red-700 mb-6">✨ What People Are Saying</h2>
        <div className="relative h-32 overflow-hidden">
          {testimonials.map((t, idx) => (
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
      </div>

     {/* 🌐 Bharat Knowledge Hub Marquee Section */}
<div className="mt-24">
  <h2 className="text-3xl font-extrabold text-bharat-blue-900 mb-8 text-center flex items-center justify-center gap-2">
    📚 Bharat Knowledge Hub <span className="text-xl">🔍📖🧠</span>
  </h2>
  <div className="marquee-container">
    <div className="marquee-track gap-6 px-6">
      {[
        {
          category: 'EDUCATION',
          title: 'National Scholarship Portal',
          description: 'Find and apply for various scholarships with ease.',
          image: 'https://www.pw.live/files001/nsp.png',
          link : 'https://scholarships.gov.in/'
        },
        {
          category: 'FARMING',
          title: 'PM-KISAN Yojana',
          description: 'Receive ₹6,000 annually in 3 installments directly in your bank.',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR89shLdvO83-NTbz1rweZkxbxbGtkxyis02A&s',
          link : 'https://pmkisan.gov.in/'
        },
        {
          category: 'HEALTHCARE',
          title: 'Ayushman Bharat',
          description: 'Free treatment up to ₹5 lakhs under the world’s largest health scheme.',
          image: 'https://www.okbima.com/assets/uploads/blog/2018977fba45e5fa1bb958ed777f29db.webp',
          link : 'https://pmjay.gov.in/'
        },
        {
          category: 'WOMEN EMPOWERMENT',
          title: 'Beti Bachao Beti Padhao',
          description: 'Support for girl child education and safety.',
          image: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Beti_Bachao_Beti_Padhao_logo.jpg?20231027000024',
          link : 'https://www.pmindia.gov.in/hi/government_tr_rec/%E0%A4%AC%E0%A5%87%E0%A4%9F%E0%A5%80-%E0%A4%AC%E0%A4%9A%E0%A4%BE%E0%A4%93-%E0%A4%AC%E0%A5%87%E0%A4%9F%E0%A5%80-%E0%A4%AA%E0%A4%A2%E0%A4%BC%E0%A4%BE%E0%A4%93-%E0%A4%AC%E0%A4%BE%E0%A4%B2/'
        },
        {
          category: 'SKILL DEVELOPMENT',
          title: 'Skill India Mission',
          description: 'Free training and certification for Indian youth.',
          image: 'https://launchpadeducation.in/wp-content/uploads/2024/02/blog-pictures-2024-02-24T113438.040.jpg',
          link : 'https://www.skillindiadigital.gov.in/'
        },
        {
          category: 'SENIOR CITIZENS',
          title: 'Atal Pension Yojana',
          description: 'Retirement savings scheme for unorganized sector workers.',
          image: 'https://cdn.zeebiz.com/sites/default/files/2022/09/27/202341-atal-pension-yojana.jpg',
          link : 'https://www.npscra.nsdl.co.in/scheme-details.php'
        },
      ].map((entry, idx) => (
        <a
          key={idx}
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative min-w-[280px] max-w-xs rounded-xl overflow-hidden shadow-md grayscale hover:grayscale-0 transform hover:scale-105 transition-all duration-300 group bg-white"
        >
          <img
            src={entry.image}
            alt={entry.title}
            className="w-full h-40 object-cover"
          />
          <div className="p-4 flex flex-col justify-between h-40">
            <div className="flex items-center gap-2 text-xl font-bold text-bharat-blue-900">
              <span>{entry.emoji}</span>
              <h3 className="text-lg md:text-xl">{entry.title}</h3>
            </div>
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
          🤔 Frequently Asked Questions <span className="animate-ping text-lg">❓</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Is this chatbot free?',
              answer: '🤖Yes! Bharat Mitra is free for everyone and helps you access real schemes.',
              icon: '💬',
            },
            {
              title: 'How accurate is the advice?',
              answer: '💬We use trusted government APIs & datasets to answer your questions.',
              icon: '🔍',
            },
            {
              title: 'Can I ask in Hindi?',
              answer: '✅Absolutely! Speak or type in Hindi, and the chatbot will respond in Hindi.',
              icon: '🇮🇳',
            },
            {
    icon: "📚",
    title: "What kind of schemes can I ask about?",
    answer: "🎯 You can ask about education, farming, health, housing, employment and more government schemes.",
  },
  {
    icon: "🖥️",
    title: "Do I need to install any app?",
    answer: "🌐 No installation needed — just open the website in your browser and start chatting!",
  },
  {
    icon: "🔒",
    title: "Is my data safe?",
    answer: "🛡️ Absolutely. We don’t collect any personal data or store your queries.",
  },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 group transition-all duration-500 hover:brightness-105 hover:shadow-red-200 cursor-pointer"
            >
              <div className="text-3xl mb-2">{faq.icon}</div>
              <h4 className="font-semibold text-bharat-blue-900 text-lg">{faq.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};

export default HomePage;
