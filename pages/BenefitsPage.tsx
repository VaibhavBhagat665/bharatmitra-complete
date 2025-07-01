import React from 'react';
import { RECOMMENDED_SCHEMES } from '../constants';
import SchemeCard from '../components/SchemeCard';

const BenefitsPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-red-50 px-4 sm:px-8 py-12">
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-red-800 drop-shadow-sm mb-4">
          My Recommended Benefits
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Based on your profile and queries, here are some schemes you might find useful.
        </p>
      </section>

      {/* Grid of Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {RECOMMENDED_SCHEMES.map((scheme, index) => (
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
        ))}
      </section>
    </main>
  );
};

export default BenefitsPage;
