import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AshokaChakraIcon } from '../components/icons/AshokaChakraIcon';
import { UserContext } from '../contexts/UserContext';

const HomePage: React.FC = () => {
  const { user } = useContext(UserContext);
  const chatLink = user ? '/chat' : '/login';
  const benefitsLink = user ? '/benefits' : '/login';

  return (
    <div className="text-center">
      <div className="flex justify-center items-center mb-6">
        <AshokaChakraIcon className="h-24 w-24 text-bharat-blue-800 animate-spin-slow" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-bharat-blue-900 mb-4">Welcome to Bharat Mitra</h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
        Your trusted AI assistant for navigating Indian government schemes. Ask questions in your own language and get clear, simple answers about benefits, scholarships, and farmer support programs.
      </p>
      <div className="space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          to={chatLink}
          className="inline-block bg-bharat-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-bharat-blue-800 transition-transform transform hover:scale-105 shadow-lg"
        >
          Start Asking Questions
        </Link>
        <Link 
          to={benefitsLink}
          className="inline-block bg-bharat-saffron-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-bharat-saffron-600 transition-transform transform hover:scale-105 shadow-lg"
        >
          View Recommended Benefits
        </Link>
      </div>
       <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-bharat-blue-500">
            <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">For Students</h3>
            <p className="text-gray-600">Find scholarships, educational loans, and skill development programs tailored for you.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-bharat-green-500">
            <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">For Farmers</h3>
            <p className="text-gray-600">Get information on crop insurance, subsidies for equipment, and income support schemes like PM-KISAN.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-bharat-saffron-500">
            <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">For All Citizens</h3>
            <p className="text-gray-600">Learn about health insurance (Ayushman Bharat), housing schemes, and other social welfare benefits.</p>
          </div>
        </div>
    </div>
  );
};

export default HomePage;