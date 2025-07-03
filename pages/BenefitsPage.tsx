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

      {/* Filters */}
      <section className="bg-white rounded-2xl shadow p-6 max-w-5xl mx-auto mb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Occupation</label>
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
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
          <label className="block mb-1 text-sm font-medium text-gray-700">Income</label>
          <select
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Income</option>
            <option value="< 1 Lakh">&lt; 1 Lakh</option>
            <option value="1-5 Lakhs">1-5 Lakhs</option>
            <option value="5-10 Lakhs">5-10 Lakhs</option>
            <option value="> 10 Lakhs">&gt; 10 Lakhs</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">State (optional)</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., Uttar Pradesh"
          />
        </div>
      </section>

      {/* Grid of Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredSchemes.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">No matching schemes found.</p>
        ) : (
          filteredSchemes.map((scheme, index) => (
            <div
              key={scheme.id}
              className="group transition-transform duration-300 transform hover:-translate-y-2"
              style={{
                animation: `slideUp 0.6s ease-out both`,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="rounded-2xl border-t-4 border-red-500 bg-white shadow-md group-hover:shadow-xl group-hover:shadow-red-300 p-6 transition-all duration-300 flex flex-col h-full justify-between">
                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">
                    {scheme.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {scheme.description}
                  </p>
                </div>

                {/* Know More */}
                {scheme.link && (
                  <div className="mt-4">
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-full text-sm hover:bg-red-200 transition"
                    >
                      Know More →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default BenefitsPage;
