import React, { useState } from 'react';

type TokenType = 'basic' | 'premium';

interface TokenOption {
  id: string;
  name: string;
  price: number;
  type: TokenType;
}

interface ComboOption {
  id: string;
  name: string;
  description: string;
  tokens: { type: TokenType; quantity: number }[];
  price: number;
}

const tokenOptions: TokenOption[] = [
  { id: '1', name: 'Basic Token', price: 10, type: 'basic' },
  { id: '2', name: 'Premium Token', price: 25, type: 'premium' },
];

const comboOptions: ComboOption[] = [
  {
    id: 'combo1',
    name: 'Starter Pack',
    description: '5 Basic + 2 Premium Tokens',
    tokens: [
      { type: 'basic', quantity: 5 },
      { type: 'premium', quantity: 2 },
    ],
    price: 95,
  },
];

const BuyTokens = () => {
  const [selectedTokens, setSelectedTokens] = useState<Record<string, number>>({});
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);

  const handleTokenChange = (id: string, quantity: number) => {
    setSelectedTokens(prev => ({ ...prev, [id]: quantity }));
    setSelectedCombo(null); // deselect combo if individual selected
  };

  const handleComboSelect = (id: string) => {
    setSelectedCombo(id);
    setSelectedTokens({}); // deselect individuals
  };

  const calculateTotal = () => {
    if (selectedCombo) {
      const combo = comboOptions.find(c => c.id === selectedCombo);
      return combo ? combo.price : 0;
    }

    let total = 0;
    for (const id in selectedTokens) {
      const token = tokenOptions.find(t => t.id === id);
      if (token) total += token.price * (selectedTokens[id] || 0);
    }
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-100">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Buy Tokens</h1>

        {/* Individual Tokens */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Individual Tokens</h2>
          <div className="grid grid-cols-2 gap-4">
            {tokenOptions.map(token => (
              <div
                key={token.id}
                className="border p-4 rounded-lg shadow bg-blue-100 hover:shadow-[0_4px_10px_rgba(255,0,0,0.5)] transition-shadow duration-300"
              >
                <h3 className="text-lg font-medium">{token.name}</h3>
                <p>Price: ₹{token.price}</p>
                <input
                  type="number"
                  min="0"
                  className="mt-2 w-full border rounded px-2 py-1"
                  placeholder="Quantity"
                  value={selectedTokens[token.id] || ''}
                  onChange={e => handleTokenChange(token.id, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Combos */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Combo Packs</h2>
          <div className="grid grid-cols-1 gap-4">
            {comboOptions.map(combo => (
              <div
                key={combo.id}
                className={`border p-4 rounded-lg shadow bg-blue-100 hover:shadow-[0_4px_10px_rgba(255,0,0,0.5)] transition-shadow duration-300 cursor-pointer ${
                  selectedCombo === combo.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleComboSelect(combo.id)}
              >
                <h3 className="text-lg font-medium">{combo.name}</h3>
                <p>{combo.description}</p>
                <p className="font-semibold mt-2">Price: ₹{combo.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
          <p>Total: <strong>₹{calculateTotal()}</strong></p>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700  hover:shadow-[0_4px_10px_rgba(255,0,0,0.5)] transition-shadow duration-300">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyTokens;
