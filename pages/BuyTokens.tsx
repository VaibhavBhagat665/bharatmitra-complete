import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

interface ComboOption {
  id: string;
  name: string;
  tokens: number;
  price: number;
  savings: number;
}

const comboOptions: ComboOption[] = [
  {
    id: 'combo1',
    name: 'Starter Pack',
    tokens: 10,
    price: 90,
    savings: 10,
  },
  {
    id: 'combo2',
    name: 'Power Pack',
    tokens: 25,
    price: 200,
    savings: 50,
  },
  {
    id: 'combo3',
    name: 'Premium Pack',
    tokens: 50,
    price: 375,
    savings: 125,
  },
];

const SINGLE_TOKEN_PRICE = 10;
const UPI_ID = 'vaibhavbhagat7461@oksbi';
const UPI_NAME = 'Vaibhav Bhagat';

const BuyTokens = () => {
  const { rewardTokens, userData, refreshUserData } = useUser();
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [singleTokens, setSingleTokens] = useState<number>(0);
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment' | 'success'>('select');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [upiString, setUpiString] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [tokensToAdd, setTokensToAdd] = useState<number>(0);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);

  const handleComboSelect = (comboId: string) => {
    setSelectedCombo(comboId);
    setSingleTokens(0);
  };

  const handleSingleTokenChange = (quantity: number) => {
    setSingleTokens(quantity);
    setSelectedCombo(null);
  };

  const calculateTotal = () => {
    if (selectedCombo) {
      const combo = comboOptions.find(c => c.id === selectedCombo);
      return {
        amount: combo ? combo.price : 0,
        tokens: combo ? combo.tokens : 0,
      };
    }
    
    return {
      amount: singleTokens * SINGLE_TOKEN_PRICE,
      tokens: singleTokens,
    };
  };

  const generateUpiPayment = (amount: number) => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Bharat Tokens Purchase')}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    
    setUpiString(upiUrl);
    setQrCodeUrl(qrUrl);
  };

  const handlePayNow = () => {
    const { amount, tokens } = calculateTotal();
    
    if (amount <= 0 || tokens <= 0) {
      alert('Please select tokens to purchase');
      return;
    }

    setTotalAmount(amount);
    setTokensToAdd(tokens);
    generateUpiPayment(amount);
    setPaymentStep('payment');
  };

  const handlePaymentSuccess = async () => {
    setPaymentLoading(true);
    
    try {
      await rewardTokens(tokensToAdd, 'UPI Purchase');
      await refreshUserData();
      setPaymentStep('success');
    } catch (error) {
      console.error('Error adding tokens:', error);
      alert('Failed to add tokens. Please contact support.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedCombo(null);
    setSingleTokens(0);
    setPaymentStep('select');
    setQrCodeUrl('');
    setUpiString('');
    setTotalAmount(0);
    setTokensToAdd(0);
  };

  const copyUpiString = () => {
    navigator.clipboard.writeText(upiString);
    alert('UPI payment string copied to clipboard!');
  };

  const { amount, tokens } = calculateTotal();

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-800 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              {tokensToAdd} Bharat Tokens have been added to your account.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">
                Current Token Balance: {userData?.bharat_tokens || 0} tokens
              </p>
            </div>
            <button
              onClick={handleStartOver}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Buy More Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Complete Payment</h1>
            
            <div className="text-center mb-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-blue-800">
                  {tokensToAdd} Bharat Tokens
                </p>
                <p className="text-2xl font-bold text-blue-600">₹{totalAmount}</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold mb-4">Scan QR Code to Pay</h2>
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="UPI QR Code" 
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Or copy UPI payment string:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={upiString}
                    readOnly
                    className="flex-1 p-2 text-sm border rounded bg-white text-gray-700"
                  />
                  <button
                    onClick={copyUpiString}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Instructions:</strong><br />
                  1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)<br />
                  2. Scan the QR code or paste the UPI string<br />
                  3. Complete the payment of ₹{totalAmount}<br />
                  4. Click "Payment Completed" below after successful payment
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handlePaymentSuccess}
                  disabled={paymentLoading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing...' : 'Payment Completed'}
                </button>
                <button
                  onClick={handleStartOver}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Buy Bharat Tokens</h1>
          <p className="text-gray-600">
            Current Balance: <span className="font-semibold text-blue-600">{userData?.bharat_tokens || 0} tokens</span>
          </p>
        </div>

        {/* Combo Packs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Combo Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comboOptions.map(combo => (
              <div
                key={combo.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                  selectedCombo === combo.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => handleComboSelect(combo.id)}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{combo.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{combo.tokens}</div>
                  <p className="text-sm text-gray-600 mb-2">Bharat Tokens</p>
                  <div className="text-2xl font-bold text-gray-800 mb-2">₹{combo.price}</div>
                  <div className="text-sm text-green-600 font-semibold">
                    Save ₹{combo.savings}
                  </div>
                </div>
                {selectedCombo === combo.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Single Token Purchase */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Single Token Purchase</h2>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="text-center mb-4">
              <p className="text-gray-600 mb-2">Price per token: <span className="font-semibold">₹{SINGLE_TOKEN_PRICE}</span></p>
              <div className="flex items-center justify-center gap-4">
                <label className="text-gray-700 font-medium">Quantity:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={singleTokens}
                  onChange={(e) => handleSingleTokenChange(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        {(selectedCombo || singleTokens > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">Order Summary</h2>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Tokens:</span>
                <span className="font-semibold text-blue-600">{tokens}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-800">₹{amount}</span>
              </div>
              <button
                onClick={handlePayNow}
                disabled={amount <= 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay Now
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">How it works:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Select a combo pack or enter quantity for single tokens</p>
            <p>2. Click "Pay Now" to proceed to payment</p>
            <p>3. Complete payment using UPI</p>
            <p>4. Tokens will be added to your account instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyTokens;
