
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bharat-blue-950 text-white mt-8">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Bharat Mitra. All Rights Reserved.</p>
        <p className="text-sm text-bharat-blue-300 mt-1">Jai Hind! 🇮🇳</p>
      </div>
    </footer>
  );
};

export default Footer;
