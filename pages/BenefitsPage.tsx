import React, { useState } from 'react';
import { RECOMMENDED_SCHEMES } from '../constants';
import SchemeCard from '../components/SchemeCard';

const BenefitsPage: React.FC = () => {
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [state, setState] = useState('');

  const filteredSchemes = RECOMMENDED_SCHEMES.filter((scheme) => {
    return (
      (!occupation || scheme.category.toLowerCase().includes(occupation.toLowerCase())) &&
      (!income || scheme.income === income) &&
      (!state || (scheme.state && scheme.state.toLowerCase().includes(state.toLowerCase())))
    );
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-red-50 px-4 sm:px-8 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-red-800 drop-shadow-sm mb-4">
          🔎 Benefit Finder
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Enter your details to find matching schemes for your occupation and needs.
        </p>
      </section>

      {/* Enhanced Filters */}
      <section className="bg-white rounded-2xl shadow-lg p-6 max-w-5xl mx-auto mb-12 border border-gray-200">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                </svg>
                Occupation
              </span>
            </label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="">Select Occupation</option>
              <option value="Farmer">Farmer</option>
              <option value="Laborer">Laborer</option>
              <option value="Industrial Worker">Industrial Worker</option>
              <option value="Shopkeeper">Shopkeeper</option>
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Student">Student</option>
              <option value="Women">Women</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Income Range
              </span>
            </label>
            <select
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="">Select Income Range</option>
              <option value="< 1 Lakh">&lt; 1 Lakh</option>
              <option value="1-5 Lakhs">1-5 Lakhs</option>
              <option value="5-10 Lakhs">5-10 Lakhs</option>
              <option value="> 10 Lakhs">&gt; 10 Lakhs</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                State (Optional)
              </span>
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="e.g., Uttar Pradesh"
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => {
                setOccupation('');
                setIncome('');
                setState('');
              }}
              className="w-full p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(occupation || income || state) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {occupation && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {occupation}
                <button 
                  onClick={() => setOccupation('')}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            )}
            {income && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {income}
                <button 
                  onClick={() => setIncome('')}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            )}
            {state && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {state}
                <button 
                  onClick={() => setState('')}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* Results Summary */}
      <section className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredSchemes.length > 0 ? (
              <>
                Found {filteredSchemes.length} matching scheme{filteredSchemes.length !== 1 ? 's' : ''}
              </>
            ) : (
              'No matching schemes found'
            )}
          </h2>
          
          {filteredSchemes.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click on cards to learn more
            </div>
          )}
        </div>
      </section>

      {/* Grid of SchemeCards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredSchemes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No matching schemes found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or clearing them to see more schemes.
              </p>
              <button 
                onClick={() => {
                  setOccupation('');
                  setIncome('');
                  setState('');
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          filteredSchemes.map((scheme, index) => (
            <div
              key={scheme.id}
              className="transition-all duration-300"
              style={{
                animation: `slideUp 0.6s ease-out both`,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <SchemeCard scheme={scheme} />
            </div>
          ))
        )}
      </section>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
};

export default BenefitsPage;
