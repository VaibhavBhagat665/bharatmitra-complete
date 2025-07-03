import React, { useContext, useState } from 'react';
import { Scholarship } from '../types';
import { UserContext } from '../contexts/UserContext';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship }) => {
  const { addTokens } = useContext(UserContext);
  const [applied, setApplied] = useState(false);

  const handleApplyClick = () => {
    if (!applied) {
      console.log(`Applying for ${scholarship.name}. Awarding 5 tokens.`);
      addTokens(5);
      setApplied(true);
    }
    window.open(scholarship.link, '_blank');
  };

  return (
    <div className="group transform transition-all duration-300 hover:-translate-y-2">
      <div className="rounded-2xl border-t-4 border-red-500 bg-white shadow-md group-hover:shadow-xl group-hover:shadow-red-300 transition-all duration-300 flex flex-col h-full justify-between">
        <div className="p-6 flex-grow">
          <h3 className="text-xl font-bold text-red-800 mb-2">{scholarship.name}</h3>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Provider:</span> {scholarship.provider}
          </p>
          <p className="text-lg font-semibold text-green-700 mb-3">{scholarship.amount}</p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Deadline:</span> {scholarship.deadline}
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleApplyClick}
            disabled={applied}
            className={`w-full font-semibold py-2 px-4 rounded-full text-sm transition-all duration-200 text-white ${
              applied
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {applied ? 'Applied (5 Tokens Earned)' : 'Apply Now & Earn 5 Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipCard;
