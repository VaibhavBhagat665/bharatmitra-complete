import React, { useState, useContext } from 'react';
import { Scholarship, ScholarshipCriteria } from '../types';
import { RECOMMENDED_SCHEMES } from '../constants';
import { UserContext } from '../contexts/UserContext';
import ScholarshipCard from '../components/ScholarshipCard';

const ScholarshipPage: React.FC = () => {
  const [criteria, setCriteria] = useState<ScholarshipCriteria>({
    age: null,
    course: '',
    caste: '',
    income: null,
    state: ''
  });
  const [results, setResults] = useState<Scholarship[]>([]);
  const [searched, setSearched] = useState(false);
  const { addTokens } = useContext(UserContext);
  const [profileCompleted, setProfileCompleted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileCompleted) {
      addTokens(10);
      setProfileCompleted(true);
    }

    const filtered = RECOMMENDED_SCHEMES.filter(s => {
      const { eligibility } = s;
      const age = criteria.age ? parseInt(String(criteria.age)) : null;
      const income = criteria.income ? parseInt(String(criteria.income)) : null;

      const ageMatch = !age || (!eligibility.minAge || age >= eligibility.minAge) && (!eligibility.maxAge || age <= eligibility.maxAge);
      const courseMatch = !criteria.course || !eligibility.course || eligibility.course.includes(criteria.course);
      const casteMatch = !criteria.caste || !eligibility.caste || eligibility.caste.includes(criteria.caste);
      const incomeMatch = !income || !eligibility.maxIncome || income <= eligibility.maxIncome;
      const stateMatch = !criteria.state || !eligibility.state || eligibility.state.includes(criteria.state);

      return ageMatch && courseMatch && casteMatch && incomeMatch && stateMatch;
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
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" name="age" id="age" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course (e.g., B.Tech)</label>
            <input type="text" name="course" id="course" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label htmlFor="caste" className="block text-sm font-medium text-gray-700 mb-1">Caste Category</label>
            <select name="caste" id="caste" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500">
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
            <input type="number" name="income" id="income" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input type="text" name="state" id="state" placeholder="e.g., Uttar Pradesh" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div className="lg:col-span-1">
            <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors shadow-md">Find Scholarships</button>
          </div>
        </form>
      </div>

      <div className="max-w-6xl mx-auto">
        {searched && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
          </div>
        )}

        {searched && results.length === 0 && (
          <div className="text-center bg-white rounded-xl p-8 shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">No Matching Scholarships Found</h3>
            <p className="text-gray-600 mt-2">Try adjusting your search criteria. Many general scholarships are available on the National Scholarship Portal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipPage;
