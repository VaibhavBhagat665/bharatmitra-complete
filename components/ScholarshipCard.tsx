import React, { useContext, useState, useEffect } from 'react';
import { Scholarship } from '../types';
import { UserContext } from '../contexts/UserContext';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship }) => {
  const { userData, addSchemeToHistory } = useContext(UserContext);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    // Check if this scholarship is already in the user's history
    const alreadyApplied = userData?.scheme_history?.some(
      entry => entry.scheme_id === scholarship.id
    );
    if (alreadyApplied) {
      setApplied(true);
    }
  }, [userData, scholarship.id]);


  const handleApplyClick = async () => {
    if (!applied) {
      console.log(`Applying for ${scholarship.name}. This will award 5 tokens via the backend.`);
      await addSchemeToHistory(scholarship.id, scholarship.name);
      setApplied(true); // UI optimistically updates
    }
    window.open(scholarship.link, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl border-t-4 border-bharat-green-600 flex flex-col">
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-bharat-blue-900 mb-2">{scholarship.name}</h3>
        <p className="text-sm text-gray-500 mb-2">Provider: {scholarship.provider}</p>
        <p className="text-lg font-semibold text-bharat-green-700 mb-4">{scholarship.amount}</p>
        <div className="text-sm text-gray-600">
          <p><span className="font-semibold">Deadline:</span> {scholarship.deadline}</p>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button 
          onClick={handleApplyClick} 
          className={`w-full font-bold py-2 px-4 rounded transition-colors text-white ${applied ? 'bg-gray-400 cursor-not-allowed' : 'bg-bharat-saffron-500 hover:bg-bharat-saffron-600'}`}
          disabled={applied}
        >
          {applied ? 'Applied (5 Tokens Earned)' : 'Apply Now & Earn 5 Tokens'}
        </button>
      </div>
    </div>
  );
};

export default ScholarshipCard;