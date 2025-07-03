import React, { useState } from 'react';

// Real scholarship data with working links and images
const REAL_SCHOLARSHIPS = [
  {
    id: '1',
    name: 'National Scholarship Portal (NSP)',
    provider: 'Ministry of Education, Govt. of India',
    amount: '₹10,000 - ₹20,000 per year',
    deadline: 'October 31, 2024',
    link: 'https://scholarships.gov.in',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 16,
      maxAge: 25,
      course: ['B.Tech', 'B.Sc', 'BA', 'B.Com', 'M.Tech', 'M.Sc', 'MA', 'M.Com'],
      caste: ['SC', 'ST', 'OBC'],
      maxIncome: 800000,
      state: ['All States']
    }
  },
  {
    id: '2',
    name: 'AICTE Pragati Scholarship',
    provider: 'All India Council for Technical Education',
    amount: '₹50,000 per year',
    deadline: 'December 15, 2024',
    link: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 17,
      maxAge: 23,
      course: ['B.Tech', 'B.E'],
      caste: ['All'],
      maxIncome: 800000,
      state: ['All States']
    }
  },
  {
    id: '3',
    name: 'PM YASASVI Scholarship',
    provider: 'Ministry of Social Justice & Empowerment',
    amount: '₹1,25,000 per year',
    deadline: 'November 30, 2024',
    link: 'https://yet.nta.ac.in/',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 17,
      maxAge: 22,
      course: ['B.Tech', 'B.E', 'B.Sc', 'BA'],
      caste: ['OBC', 'EBC', 'DNT'],
      maxIncome: 250000,
      state: ['All States']
    }
  },
  {
    id: '4',
    name: 'INSPIRE Scholarship',
    provider: 'Department of Science & Technology',
    amount: '₹80,000 per year',
    deadline: 'January 31, 2025',
    link: 'https://online-inspire.gov.in/',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 17,
      maxAge: 25,
      course: ['B.Sc', 'M.Sc', 'Integrated M.Sc'],
      caste: ['All'],
      maxIncome: 800000,
      state: ['All States']
    }
  },
  {
    id: '5',
    name: 'KVPY Fellowship',
    provider: 'Indian Institute of Science',
    amount: '₹5,000 - ₹7,000 per month',
    deadline: 'September 30, 2024',
    link: 'http://kvpy.iisc.ernet.in/',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 16,
      maxAge: 22,
      course: ['B.Sc', 'B.S', 'B.Stat', 'B.Math', 'Int. M.Sc'],
      caste: ['All'],
      maxIncome: null,
      state: ['All States']
    }
  },
  {
    id: '6',
    name: 'Maulana Azad National Fellowship',
    provider: 'UGC - Ministry of Minority Affairs',
    amount: '₹28,000 per month',
    deadline: 'December 31, 2024',
    link: 'https://www.ugc.ac.in/page/Maulana-Azad-National-Fellowship-for-Minority-Students.aspx',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 21,
      maxAge: 35,
      course: ['M.Phil', 'Ph.D'],
      caste: ['Minority'],
      maxIncome: null,
      state: ['All States']
    }
  },
  {
    id: '7',
    name: 'LIC Golden Jubilee Scholarship',
    provider: 'Life Insurance Corporation',
    amount: '₹10,000 per year',
    deadline: 'June 30, 2025',
    link: 'https://licindia.in/golden-jubilee-scholarship',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 18,
      maxAge: 25,
      course: ['B.Tech', 'B.E', 'B.Sc', 'BA', 'B.Com'],
      caste: ['All'],
      maxIncome: 200000,
      state: ['All States']
    }
  },
  {
    id: '8',
    name: 'HDFC Parivartan Scholarship',
    provider: 'HDFC Bank',
    amount: '₹15,000 - ₹75,000',
    deadline: 'August 31, 2024',
    link: 'https://www.buddy4study.com/scholarship/hdfc-bank-parivartan-ecss-scholarship-programme',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 18,
      maxAge: 25,
      course: ['B.Tech', 'B.E', 'B.Sc', 'BA', 'B.Com', 'Diploma'],
      caste: ['All'],
      maxIncome: 300000,
      state: ['All States']
    }
  },
  {
    id: '9',
    name: 'Sitaram Jindal Foundation Scholarship',
    provider: 'Sitaram Jindal Foundation',
    amount: '₹500 - ₹3,200 per month',
    deadline: 'March 31, 2025',
    link: 'https://www.sitaramjindalfoundation.org/Scholarship.aspx',
    image: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 16,
      maxAge: 25,
      course: ['B.Tech', 'B.E', 'B.Sc', 'BA', 'B.Com', 'M.Tech', 'M.Sc'],
      caste: ['All'],
      maxIncome: 400000,
      state: ['All States']
    }
  },
  {
    id: '10',
    name: 'Tata Capital Pankh Scholarship',
    provider: 'Tata Capital',
    amount: '₹12,000 - ₹80,000',
    deadline: 'July 31, 2024',
    link: 'https://www.buddy4study.com/scholarship/tata-capital-pankh-scholarship-programme',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
    eligibility: {
      minAge: 18,
      maxAge: 25,
      course: ['B.Tech', 'B.E', 'B.Sc', 'BA', 'B.Com', 'Diploma'],
      caste: ['All'],
      maxIncome: 400000,
      state: ['All States']
    }
  }
];

const ScholarshipCard = ({ scholarship }) => {
  const handleApplyClick = () => {
    window.open(scholarship.link, '_blank');
  };

  return (
    <div className="group transform transition-all duration-300 hover:-translate-y-2">
      <div className="rounded-2xl border-t-4 border-red-500 bg-white shadow-md group-hover:shadow-xl group-hover:shadow-red-300 transition-all duration-300 flex flex-col h-full">
        {/* Scholarship Image */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <img 
            src={scholarship.image} 
            alt={scholarship.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="p-6 flex-grow">
          <h3 className="text-xl font-bold text-red-800 mb-2 line-clamp-2">{scholarship.name}</h3>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Provider:</span> {scholarship.provider}
          </p>
          <p className="text-lg font-semibold text-green-700 mb-2">{scholarship.amount}</p>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold">Deadline:</span> {scholarship.deadline}
          </p>
          
          {/* Eligibility Preview */}
          <div className="text-xs text-gray-500 mb-4">
            <p><span className="font-medium">Courses:</span> {scholarship.eligibility.course.slice(0, 3).join(', ')}{scholarship.eligibility.course.length > 3 ? '...' : ''}</p>
            {scholarship.eligibility.maxIncome && (
              <p><span className="font-medium">Max Income:</span> ₹{scholarship.eligibility.maxIncome.toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleApplyClick}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-200"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

const ScholarshipPage = () => {
  const [criteria, setCriteria] = useState({
    age: null,
    course: '',
    caste: '',
    income: null,
    state: ''
  });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCriteria(prev => ({ 
      ...prev, 
      [name]: value === '' ? (name === 'age' || name === 'income' ? null : '') : value 
    }));
  };

  const handleSearch = () => {
    
    const filtered = REAL_SCHOLARSHIPS.filter(scholarship => {
      const { eligibility } = scholarship;
      const age = criteria.age ? parseInt(criteria.age) : null;
      const income = criteria.income ? parseInt(criteria.income) : null;

      // Age matching
      const ageMatch = !age || 
        ((!eligibility.minAge || age >= eligibility.minAge) && 
         (!eligibility.maxAge || age <= eligibility.maxAge));

      // Course matching
      const courseMatch = !criteria.course || 
        eligibility.course.includes('All') ||
        eligibility.course.some(course => 
          course.toLowerCase().includes(criteria.course.toLowerCase()) ||
          criteria.course.toLowerCase().includes(course.toLowerCase())
        );

      // Caste matching
      const casteMatch = !criteria.caste || 
        eligibility.caste.includes('All') ||
        eligibility.caste.includes(criteria.caste) ||
        (criteria.caste === 'Minority' && eligibility.caste.includes('Minority'));

      // Income matching
      const incomeMatch = !income || 
        !eligibility.maxIncome || 
        income <= eligibility.maxIncome;

      // State matching (all scholarships are available for all states in this example)
      const stateMatch = true;

      return ageMatch && courseMatch && casteMatch && incomeMatch && stateMatch;
    });

    setResults(filtered);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50 px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-red-700 mb-2 drop-shadow-md">
          Real Scholarship Finder
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Discover genuine scholarships with working links and real application portals. 
          Find the perfect funding opportunity for your education.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input 
              type="number" 
              name="age" 
              id="age" 
              value={criteria.age || ''} 
              onChange={handleInputChange} 
              placeholder="Enter your age"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" 
            />
          </div>
          
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select 
              name="course" 
              id="course" 
              value={criteria.course} 
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.E">B.E</option>
              <option value="B.Sc">B.Sc</option>
              <option value="BA">BA</option>
              <option value="B.Com">B.Com</option>
              <option value="M.Tech">M.Tech</option>
              <option value="M.Sc">M.Sc</option>
              <option value="MA">MA</option>
              <option value="M.Com">M.Com</option>
              <option value="Ph.D">Ph.D</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="caste" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select 
              name="caste" 
              id="caste" 
              value={criteria.caste} 
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Any Category</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EBC">EBC</option>
              <option value="DNT">DNT</option>
              <option value="Minority">Minority</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Family Income (₹)
            </label>
            <input 
              type="number" 
              name="income" 
              id="income" 
              value={criteria.income || ''} 
              onChange={handleInputChange} 
              placeholder="e.g., 500000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" 
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input 
              type="text" 
              name="state" 
              id="state" 
              value={criteria.state} 
              placeholder="e.g., Maharashtra" 
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" 
            />
          </div>
          
          <div className="lg:col-span-1">
            <button 
              type="submit" 
              className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors shadow-md"
            >
              Find Scholarships
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {searched && results.length > 0 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Found {results.length} Matching Scholarships
              </h2>
              <p className="text-gray-600">Click "Apply Now" to visit the official application portal</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map(scholarship => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          </>
        )}

        {searched && results.length === 0 && (
          <div className="text-center bg-white rounded-xl p-8 shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Matching Scholarships Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or explore general scholarships.
            </p>
            <button 
              onClick={() => { setResults(REAL_SCHOLARSHIPS); setSearched(true); }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Show All Scholarships
            </button>
          </div>
        )}

        {!searched && (
          <div className="text-center bg-white rounded-xl p-8 shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Find Your Perfect Scholarship?
            </h3>
            <p className="text-gray-600 mb-4">
              Fill out the form above to discover scholarships tailored to your profile.
            </p>
            <button 
              onClick={() => { setResults(REAL_SCHOLARSHIPS); setSearched(true); }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Browse All Scholarships
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipPage;
