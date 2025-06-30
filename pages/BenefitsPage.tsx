
import React from 'react';
import { RECOMMENDED_SCHEMES } from '../constants';
import SchemeCard from '../components/SchemeCard';

const BenefitsPage: React.FC = () => {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-bharat-blue-900 mb-2">My Recommended Benefits</h1>
        <p className="text-lg text-gray-600">Based on your profile and queries, here are some schemes you might find useful.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {RECOMMENDED_SCHEMES.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>
    </div>
  );
};

export default BenefitsPage;
