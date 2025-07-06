import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { paymentService, PaymentTransaction } from './paymentService';
import PaymentVerification from './PaymentVerification';

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

const BuyTokens = () => {
  const { rewardTokens, userData, refreshUserData } = useUser();
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [singleTokens, setSingleTokens] = useState<number>(0);
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment' | 'verification' | 'success'>('select');
  const [currentTransaction, setCurrentTransaction] = useState<PaymentTransaction | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [upiString, setUpiString] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

  const handlePayNow = () => {
    const { amount, tokens } = calculateTotal();
    
    if (amount <= 0 || tokens <= 0) {
      alert('Please select tokens to purchase');
      return;
    }

    // Create a new transaction
    const transaction = paymentService.createTransaction(
      amount, 
      tokens, 
      userData?.id || 'anonymous'
    );

    setCurrentTransaction(transaction);
    
    // Generate UPI payment string and QR code
    const upiPaymentString = paymentService.generateUpiPaymentString(transaction);
    const qrUrl = paymentService.generateQRCode(upiPaymentString);
    
    setUpiString(upiPaymentString);
    setQrCodeUrl(qrUrl);
    setPaymentStep('payment');
  };

  const handlePaymentComplete = () => {
    if (currentTransaction) {
      setPaymentStep('verification');
    }
  };

  const handleVerificationSuccess = async (transaction: PaymentTransaction) => {
    setIsProcessing(true);
    
    try {
      await rewardTokens(transaction.tokens, `UPI Purchase - ${transaction.id}`);
      await refreshUserData();
      setPaymentStep('success');
    } catch (error) {
      console.error('Error adding tokens:', error);
      alert('Payment verified but failed to add tokens. Please contact support with transaction ID: ' + transaction.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setSelectedCombo(null);
    setSingleTokens(0);
    setPaymentStep('select');
    setCurrentTransaction(null);
    setQrCodeUrl('');
    setUpiString('');
  };

  const copyUpiString = () => {
    navigator.clipboard.writeText(upiString);
    alert('UPI payment string copied to clipboard!');
  };

  const copyTransactionId = () => {
    if (currentTransaction) {
      navigator.clipboard.writeText(currentTransaction.id);
      alert('Transaction ID copied to clipboard!');
    }
  };

  const { amount, tokens } = calculateTotal();

  // Success screen
  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-800 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              {currentTransaction?.tokens} Bharat Tokens have been added to your account.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">
                Current Token Balance: {userData?.bharat_tokens || 0} tokens
              </p>
              {currentTransaction && (
                <p className="text-green-600 text-sm mt-2">
                  Transaction ID: {currentTransaction.id}
                </p>
              )}
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

  // Payment verification screen
  if (paymentStep === 'verification' && currentTransaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Verify Payment</h1>
            
            <div className="text-center mb-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-blue-800">
                  {currentTransaction.tokens} Bharat Tokens
                </p>
                <p className="text-2xl font-bold text-blue-600">₹{currentTransaction.amount}</p>
              </div>
            </div>

            {isProcessing ? (
              <div className="text-center">
                <div className="text-blue-600 text-6xl mb-4">⏳</div>
                <h2 className="text-xl font-semibold mb-4">Processing...</h2>
                <p className="text-gray-600">Adding tokens to your account...</p>
              </div>
            ) : (
              <PaymentVerification
                transaction={currentTransaction}
                onVerificationSuccess={handleVerificationSuccess}
                onCancel={handleStartOver}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Payment screen
  if (paymentStep === 'payment' && currentTransaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Complete Payment</h1>
            
            <div className="text-center mb-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-blue-800">
                  {currentTransaction.tokens} Bharat Tokens
                </p>
                <p className="text-2xl font-bold text-blue-600">₹{currentTransaction.amount}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Transaction ID: {currentTransaction.id}
                  <button
                    onClick={copyTransactionId}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Copy
                  </button>
                </p>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold mb-4">Scan QR Code to Pay</h2>
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="UPI QR Code" 
                    className="border-2 border-gray-300 rounded-lg shadow-md"
                    style={{ width: '250px', height: '250px' }}
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
                  <strong>Payment Instructions:</strong><br />
                  1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)<br />
                  2. Scan the QR code or paste the UPI string<br />
                  3. Verify the amount is ₹{currentTransaction.amount}<br />
                  4. Complete the payment<br />
                  5. Click "I've Completed Payment" below
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handlePaymentComplete}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  I've Completed Payment
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

  // Token selection screen
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
            <p>2. Click "Pay Now" to generate secure payment link</p>
            <p>3. Complete payment using UPI (Google Pay, PhonePe, etc.)</p>
            <p>4. Verify payment with transaction ID</p>
            <p>5. Tokens will be added after verification</p>
          </div>
          
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm font-semibold">
              🔒 Secure Payment Processing
            </p>
            <p className="text-blue-600 text-xs mt-1">
              All transactions are tracked and verified for security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyTokens;
