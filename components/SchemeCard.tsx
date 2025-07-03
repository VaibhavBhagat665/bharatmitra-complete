import React from 'react';
import { Scheme } from '../types';

interface SchemeCardProps {
  scheme: Scheme;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme }) => {
  // Generate a consistent image URL based on scheme type/category
  const getSchemeImage = (schemeTitle: string, department: string) => {
    // Map different scheme types to relevant Unsplash images
    const imageMap: { [key: string]: string } = {
      'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop',
      'health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
      'agriculture': 'https://images.unsplash.com/photo-1544637167-0e8ce4ba31c1?w=400&h=200&fit=crop',
      'employment': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=200&fit=crop',
      'housing': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop',
      'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
      'social': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop',
      'technology': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=200&fit=crop',
      'transport': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop',
      'energy': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=200&fit=crop',
      'default': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop'
    };

    // Try to match scheme title or department to image categories
    const title = schemeTitle.toLowerCase();
    const dept = department.toLowerCase();
    
    for (const [key, url] of Object.entries(imageMap)) {
      if (title.includes(key) || dept.includes(key)) {
        return url;
      }
    }
    
    return imageMap.default;
  };

  // Generate department color based on department name
  const getDepartmentColor = (department: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800'
    ];
    
    // Use a simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < department.length; i++) {
      hash = department.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const imageUrl = getSchemeImage(scheme.title, scheme.department);
  const departmentColor = getDepartmentColor(scheme.department);

  return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={scheme.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${departmentColor}`}>
            {scheme.department}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-bharat-blue-600 transition-colors">
          {scheme.title}
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {scheme.description}
        </p>

        {/* Eligibility Section */}
        <div className="mb-6 flex-grow">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 mr-2 text-bharat-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-gray-800">Eligibility</h4>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed pl-6">
            {scheme.eligibility}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <a 
            href={scheme.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-bharat-blue-600 to-bharat-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-bharat-blue-700 hover:to-bharat-blue-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:ring-offset-2"
          >
            <span>Learn More</span>
            <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;
