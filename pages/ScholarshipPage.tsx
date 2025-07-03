import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

// Types
interface ScholarshipCriteria {
  age: number | null;
  course: string;
  caste: string;
  income: number | null;
  state: string;
}

interface Scheme {
  id: string;
  title: string;
  department: string;
  description: string;
  eligibility: string;
  link: string;
  category: string;
  tags: string[];
}

// Mock UserContext for demo
const mockUserContext = {
  addTokens: (tokens: number) => console.log(`Added ${tokens} tokens`),
  tokens: 100
};

// Real scholarship data with enhanced eligibility matching
const SCHOLARSHIP_DATA: Scheme[] = [
  {
    id: '4',
    title: 'Central Sector Scholarship',
    department: 'Department of Higher Education',
    description: '₹10,000 - ₹20,000 per annum for meritorious college students.',
    eligibility: 'Family income < ₹8L, age 17-22',
    link: 'https://scholarships.gov.in/',
    category: 'Scholarship',
    tags: ['college', 'merit'],
  },
  {
    id: '5',
    title: 'AICTE Pragati Scholarship for Girls',
    department: 'AICTE',
    description: '₹50,000 per annum for girl students in technical courses.',
    eligibility: 'Girls enrolled in B.Tech/B.E., income < ₹8L',
    link: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    category: 'Scholarship',
    tags: ['girls', 'engineering'],
  },
  {
    id: '6',
    title: 'PM YASASVI Scheme',
    department: 'Ministry of Social Justice & Empowerment',
    description: 'Up to ₹1.25 lakh for OBC, EBC, and DNT students.',
    eligibility: 'OBC/EBC/DNT, income < ₹2.5L',
    link: 'https://yet.nta.ac.in/',
    category: 'Scholarship',
    tags: ['obc', 'minority'],
  },
  {
    id: '7',
    title: 'UP Post Matric Scholarship',
    department: 'Government of Uttar Pradesh',
    description: 'Financial aid for UP students in higher education.',
    eligibility: 'Residents of UP, income < ₹2L',
    link: 'https://scholarship.up.gov.in/',
    category: 'Scholarship',
    tags: ['state', 'up'],
  },
  {
    id: '8',
    title: 'NTSE Scholarship',
    department: 'NCERT',
    description: '₹1,250 - ₹2,000 per month for Class 10 students.',
    eligibility: 'Class 10 students qualifying NTSE exam',
    link: 'https://ncert.nic.in',
    category: 'Scholarship',
    tags: ['school', 'merit'],
  },
  {
    id: '9',
    title: 'INSPIRE Scholarship',
    department: 'DST',
    description: '₹80,000 per annum for science students.',
    eligibility: 'B.Sc./M.Sc. students, income < ₹8L',
    link: 'https://online-inspire.gov.in/',
    category: 'Scholarship',
    tags: ['science'],
  },
  {
    id: '10',
    title: 'KVPY Scholarship',
    department: 'DST',
    description: '₹5,000 - ₹7,000 per month for science streams.',
    eligibility: 'B.Sc./B.Stat students qualifying KVPY',
    link: 'http://kvpy.iisc.ernet.in/',
    category: 'Scholarship',
    tags: ['research'],
  },
  {
    id: '11',
    title: 'Saksham Scholarship',
    department: 'AICTE',
    description: '₹50,000 per year for differently-abled engineering students.',
    eligibility: 'Disability + B.Tech enrollment',
    link: 'https://aicte-india.org/schemes/students-development-schemes/Saksham',
    category: 'Scholarship',
    tags: ['disability'],
  },
  {
    id: '12',
    title: 'National Fellowship for OBC',
    department: 'UGC',
    description: '₹25,000 monthly fellowship for OBC students.',
    eligibility: 'OBC category postgraduates',
    link: 'https://ugc.ac.in',
    category: 'Scholarship',
    tags: ['obc'],
  },
  {
    id: '13',
    title: 'Maulana Azad Fellowship',
    department: 'Ministry of Minority Affairs',
    description: '₹28,000 per month for minority students.',
    eligibility: 'Muslim/Christian/Sikh/Buddhist/Parsi students',
    link: 'https://minorityaffairs.gov.in',
    category: 'Scholarship',
    tags: ['minority'],
  },
  {
    id: '17',
    title: 'PMRF',
    department: 'Ministry of Education',
    description: '₹70,000 monthly for PhD students.',
    eligibility: 'PhD in top institutes',
    link: 'https://pmrf.in',
    category: 'Scholarship',
    tags: ['phd'],
  },
  {
    id: '19',
    title: 'CSIR NET JRF',
    department: 'CSIR',
    description: '₹31,000/month fellowship for science postgrads.',
    eligibility: 'M.Sc. + NET qualified',
    link: 'https://csirnet.nta.ac.in',
    category: 'Scholarship',
    tags: ['jrf'],
  },
  {
    id: '22',
    title: 'Siemens Scholarship',
    department: 'Siemens India',
    description: '₹75,000 per year for B.E./B.Tech students.',
    eligibility: 'Meritorious engineering students',
    link: 'https://www.siemens.co.in',
    category: 'Scholarship',
    tags: ['engineering'],
  },
  {
    id: '27',
    title: 'ONGC Scholarship for Meritorious Students',
    department: 'ONGC',
    description: '₹48,000 annually for selected courses.',
    eligibility: 'Engineering/MBBS/MBA/Geology',
    link: 'https://www.ongcscholar.org',
    category: 'Scholarship',
    tags: ['merit'],
  },
  {
    id: '31',
    title: 'ONGC SC/ST Scholarship',
    department: 'ONGC',
    description: '₹48,000 per annum for SC/ST students.',
    eligibility: 'SC/ST category',
    link: 'https://www.ongcscholar.org',
    category: 'Scholarship',
    tags: ['sc', 'st'],
  }
];

// Enhanced scholarship card component
const ScholarshipCard: React.FC<{ scholarship: Scheme }> = ({ scholarship }) => {
  const getThumbnailUrl = (department: string) => {
    // Generate thumbnails based on department
    const thumbnails = {
      'AICTE': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      'Ministry of Education': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200&fit=crop',
      'DST': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop',
      'UGC': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
      'NCERT': 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=300&h=200&fit=crop',
      'ONGC': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop',
      'Siemens India': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
      'Government of Uttar Pradesh': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=200&fit=crop',
      'Ministry of Social Justice & Empowerment': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=200&fit=crop',
      'Ministry of Minority Affairs': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop',
      'CSIR': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop'
    };
    
    return thumbnails[department] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=200&fit=crop';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={getThumbnailUrl(scholarship.department)} 
          alt={scholarship.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {scholarship.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{scholarship.title}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-2 font-medium">{scholarship.department}</p>
        <p className="text-gray-700 mb-4 line-clamp-3">{scholarship.description}</p>
        
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <h4 className="font-semibold text-blue-800 mb-1">Eligibility:</h4>
          <p className="text-sm text-blue-700">{scholarship.eligibility}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {scholarship.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-3">
          <a 
            href={scholarship.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            Apply
          </a>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const ScholarshipPage: React.FC = () => {
  const [criteria, setCriteria] = useState<ScholarshipCriteria>({
    age: null,
    course: '',
    caste: '',
    income: null,
    state: ''
  });
  const [results, setResults] = useState<Scheme[]>([]);
  const [searched, setSearched] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({ 
      ...prev, 
      [name]: value === '' ? (name === 'age' || name === 'income' ? null : '') : value 
    }));
  };

  const handleSearch = () => {
    if (!profileCompleted) {
      mockUserContext.addTokens(10);
      setProfileCompleted(true);
    }

    // Enhanced filtering logic
    const filtered = SCHOLARSHIP_DATA.filter(scheme => {
      const { eligibility, tags } = scheme;
      const lowerEligibility = eligibility.toLowerCase();
      const lowerTags = tags.map(tag => tag.toLowerCase());
      
      // Age matching
      if (criteria.age) {
        const age = parseInt(String(criteria.age));
        if (lowerEligibility.includes('age 17-22') && (age < 17 || age > 22)) return false;
        if (lowerEligibility.includes('class 10') && age < 15) return false;
      }
      
      // Course matching
      if (criteria.course) {
        const course = criteria.course.toLowerCase();
        const courseMatch = 
          lowerEligibility.includes(course) ||
          lowerTags.some(tag => tag.includes(course)) ||
          (course.includes('btech') || course.includes('b.tech')) && (lowerEligibility.includes('b.tech') || lowerEligibility.includes('engineering')) ||
          (course.includes('bsc') || course.includes('b.sc')) && lowerEligibility.includes('b.sc') ||
          (course.includes('msc') || course.includes('m.sc')) && lowerEligibility.includes('m.sc') ||
          (course.includes('mba')) && lowerEligibility.includes('mba') ||
          (course.includes('phd')) && lowerEligibility.includes('phd');
        
        if (!courseMatch) return false;
      }
      
      // Caste matching
      if (criteria.caste) {
        const caste = criteria.caste.toLowerCase();
        const casteMatch = 
          lowerEligibility.includes(caste) ||
          lowerTags.includes(caste) ||
          (caste === 'obc' && (lowerEligibility.includes('obc') || lowerEligibility.includes('minority'))) ||
          (caste === 'sc' && lowerEligibility.includes('sc')) ||
          (caste === 'st' && lowerEligibility.includes('st'));
        
        if (!casteMatch) return false;
      }
      
      // Income matching
      if (criteria.income) {
        const income = parseInt(String(criteria.income));
        if (lowerEligibility.includes('income < ₹8l') && income > 800000) return false;
        if (lowerEligibility.includes('income < ₹2.5l') && income > 250000) return false;
        if (lowerEligibility.includes('income < ₹2l') && income > 200000) return false;
      }
      
      // State matching
      if (criteria.state) {
        const state = criteria.state.toLowerCase();
        if (lowerEligibility.includes('residents of up') && !state.includes('uttar pradesh')) return false;
        if (lowerEligibility.includes('north eastern') && !['assam', 'meghalaya', 'tripura', 'mizoram', 'manipur', 'nagaland', 'arunachal pradesh', 'sikkim'].some(s => state.includes(s))) return false;
      }
      
      return true;
    });

    setResults(filtered);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50 px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-red-700 mb-2 drop-shadow-md">Scholarship Finder</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Fill in your details to find scholarships that match your profile. You get <span className="font-bold text-green-700">10 tokens</span> for completing your profile!
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input 
              type="number" 
              name="age" 
              id="age" 
              value={criteria.age || ''}
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" 
              placeholder="Enter your age"
            />
          </div>
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input 
              type="text" 
              name="course" 
              id="course" 
              value={criteria.course}
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" 
              placeholder="e.g., B.Tech, B.Sc, M.Sc, MBA, PhD"
            />
          </div>
          <div>
            <label htmlFor="caste" className="block text-sm font-medium text-gray-700 mb-1">Caste Category</label>
            <select 
              name="caste" 
              id="caste" 
              value={criteria.caste}
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Any</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EBC">EBC</option>
              <option value="DNT">DNT</option>
            </select>
          </div>
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">Annual Family Income (₹)</label>
            <input 
              type="number" 
              name="income" 
              id="income" 
              value={criteria.income || ''}
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" 
              placeholder="Enter annual income"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input 
              type="text" 
              name="state" 
              id="state" 
              value={criteria.state}
              placeholder="e.g., Uttar Pradesh" 
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" 
            />
          </div>
          <div className="lg:col-span-1">
            <button 
              type="button" 
              onClick={handleSearch}
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Found {results.length} Matching Scholarships</h2>
              <p className="text-gray-600">Click on any scholarship to visit the official application page</p>
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
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.347 0-4.518-.826-6.207-2.209C5.146 11.87 5 10.982 5 10c0-3.866 3.582-7 8-7s8 3.134 8 7c0 .982-.146 1.87-.793 2.791z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matching Scholarships Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or check these general options:</p>
            <div className="space-y-2">
              <a 
                href="https://scholarships.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                National Scholarship Portal
              </a>
              <a 
                href="https://www.aicte-india.org/schemes/students-development-schemes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                AICTE Scholarships
              </a>
            </div>
          </div>
        )}

        {!searched && (
          <div className="text-center bg-white rounded-xl p-8 shadow-md">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Find Your Perfect Scholarship?</h3>
            <p className="text-gray-600">Fill out the form above to discover scholarships tailored to your profile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipPage;
