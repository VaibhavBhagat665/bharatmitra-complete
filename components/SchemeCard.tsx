
import React from 'react';
import { Scheme } from '../types';

interface SchemeCardProps {
  scheme: Scheme;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl border-t-4 border-bharat-blue-600 flex flex-col">
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">{scheme.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{scheme.department}</p>
        <p className="text-gray-700 mb-4">{scheme.description}</p>
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800">Eligibility:</h4>
          <p className="text-gray-600">{scheme.eligibility}</p>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <a 
          href={scheme.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-bold text-bharat-blue-700 hover:text-bharat-blue-900 transition-colors"
        >
          Learn More &rarr;
        </a>
      </div>
    </div>
  );
};

export default SchemeCard;
