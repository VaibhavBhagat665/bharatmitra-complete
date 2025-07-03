import React from 'react';

export const AshokaChakraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Modern hexagonal tech pattern */}
    <path d="M12 2 L18 6 L18 12 L12 16 L6 12 L6 6 Z" />
    <path d="M12 6 L16 8 L16 12 L12 14 L8 12 L8 8 Z" />
    <circle cx="12" cy="10" r="1.5" />
    
    {/* Geometric connection lines */}
    <path d="M12 2 L12 6" />
    <path d="M18 6 L16 8" />
    <path d="M18 12 L16 12" />
    <path d="M12 16 L12 14" />
    <path d="M6 12 L8 12" />
    <path d="M6 6 L8 8" />
    
    {/* Corner accents */}
    <path d="M3 3 L5 3 L5 5" />
    <path d="M19 3 L21 3 L21 5" />
    <path d="M3 21 L5 21 L5 19" />
    <path d="M19 21 L21 21 L21 19" />
  </svg>
);

// Logo with text version
export const BharatMitraLogo: React.FC<{ size?: number; showText?: boolean }> = ({ 
  size = 24, 
  showText = false 
}) => (
  <div className="flex items-center gap-2">
    <AshokaChakraIcon 
      width={size} 
      height={size}
      className="text-blue-600"
    />
    {showText && (
      <div className="flex flex-col">
        <span className="text-lg font-bold text-blue-900">Bharat Mitra</span>
        <span className="text-xs text-gray-600">Your Government Guide</span>
      </div>
    )}
  </div>
);

// Demo component showing different usage scenarios
export default function LogoDemo() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bharat Mitra Logo</h1>
          <p className="text-gray-600">A friendly tech assistant for Indian government schemes</p>
        </div>
        
        {/* Large version with text */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Primary Logo</h2>
          <BharatMitraLogo size={64} showText={true} />
        </div>
        
        {/* Different sizes */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Icon Sizes</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <AshokaChakraIcon width={16} height={16} className="text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-gray-600">16px (favicon)</span>
            </div>
            <div className="text-center">
              <AshokaChakraIcon width={24} height={24} className="text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-gray-600">24px (header)</span>
            </div>
            <div className="text-center">
              <AshokaChakraIcon width={32} height={32} className="text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-gray-600">32px (app icon)</span>
            </div>
            <div className="text-center">
              <AshokaChakraIcon width={48} height={48} className="text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-gray-600">48px (large)</span>
            </div>
          </div>
        </div>
        
        {/* Color variations */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Color Variations</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <AshokaChakraIcon width={32} height={32} className="text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-gray-600">Primary</span>
            </div>
            <div className="text-center">
              <AshokaChakraIcon width={32} height={32} className="text-gray-700 mx-auto mb-2" />
              <span className="text-sm text-gray-600">Monochrome</span>
            </div>
            <div className="text-center bg-blue-900 p-2 rounded">
              <AshokaChakraIcon width={32} height={32} className="text-white mx-auto mb-2" />
              <span className="text-sm text-white">On Dark</span>
            </div>
          </div>
        </div>
        
        {/* Usage examples */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          
          {/* Header example */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Website Header</h3>
            <div className="bg-blue-50 p-4 rounded border flex items-center justify-between">
              <BharatMitraLogo size={32} showText={true} />
              <div className="flex gap-4">
                <button className="text-blue-600 hover:text-blue-800">Schemes</button>
                <button className="text-blue-600 hover:text-blue-800">About</button>
                <button className="text-blue-600 hover:text-blue-800">Contact</button>
              </div>
            </div>
          </div>
          
          {/* App icon example */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Mobile App Icon</h3>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl w-20 h-20 flex items-center justify-center">
              <AshokaChakraIcon width={48} height={48} className="text-white" />
            </div>
          </div>
          
          {/* Business card example */}
          <div>
            <h3 className="text-lg font-medium mb-2">Business Card</h3>
            <div className="bg-white border-2 border-gray-200 p-4 rounded-lg w-80">
              <div className="flex items-center gap-3 mb-2">
                <AshokaChakraIcon width={24} height={24} className="text-blue-600" />
                <div>
                  <div className="font-bold text-blue-900">Bharat Mitra</div>
                  <div className="text-xs text-gray-600">Your Government Guide</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                Helping citizens navigate government schemes with ease
              </div>
            </div>
          </div>
        </div>
        
        {/* Design explanation */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Design Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-900 mb-2">🌍 India Map</h3>
              <p className="text-gray-600 text-sm">Simplified silhouette represents national identity and coverage</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">⚙️ Gear Icon</h3>
              <p className="text-gray-600 text-sm">Technology and systematic approach to governance</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">🤝 Handshake</h3>
              <p className="text-gray-600 text-sm">Partnership between government and citizens</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">💡 Light Bulb</h3>
              <p className="text-gray-600 text-sm">Innovation, knowledge, and empowerment</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">👥 People</h3>
              <p className="text-gray-600 text-sm">Community and inclusive citizen engagement</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">🔗 Connected Lines</h3>
              <p className="text-gray-600 text-sm">Digital connectivity and integrated approach</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
