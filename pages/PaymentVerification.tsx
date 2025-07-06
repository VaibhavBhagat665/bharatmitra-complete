// PaymentVerification.tsx
import React, { useState, useEffect } from 'react';
import { paymentService, PaymentTransaction } from '../services/paymentService';

interface PaymentVerificationProps {
  transaction: PaymentTransaction;
  onVerificationSuccess: (transaction: PaymentTransaction) => void;
  onCancel: () => void;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({
  transaction,
  onVerificationSuccess,
  onCancel
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [userTxnId, setUserTxnId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showManualVerification, setShowManualVerification] = useState(false);

  // Calculate time left for transaction
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const timeRemaining = Math.max(0, transaction.expiresAt.getTime() - now.getTime());
      setTimeLeft(Math.floor(timeRemaining / 1000));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [transaction.expiresAt]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAutoVerification = async () => {
    setIsVerifying(true);
    setVerificationError('');

    try {
      const result = await paymentService.verifyPayment(transaction.id, userTxnId);
      
      if (result.success) {
        onVerificationSuccess(transaction);
      } else {
        setVerificationError(result.message);
        // Show manual verification option after failed auto verification
        setShowManualVerification(true);
      }
    } catch (error) {
      setVerificationError('Verification failed. Please try again.');
      setShowManualVerification(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerification = () => {
    if (!userTxnId.trim()) {
      setVerificationError('Please enter your UPI transaction ID');
      return;
    }

    // In a real app, this would be sent to backend for admin verification
    // For now, we'll simulate immediate verification
    const success = paymentService.manualVerifyPayment(transaction.id, userTxnId);
    
    if (success) {
      onVerificationSuccess(transaction);
    } else {
      setVerificationError('Manual verification failed. Please contact support.');
    }
  };

  if (timeLeft <= 0) {
    return (
      <div className="text-center">
        <div className="text-red-600 text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-red-600 mb-4">Transaction Expired</h2>
        <p className="text-gray-600 mb-6">
          This payment session has expired. Please create a new payment to continue.
        </p>
        <button
          onClick={onCancel}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start New Payment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-4">
          <p className="text-orange-800 font-semibold">
            Time Remaining: {formatTime(timeLeft)}
          </p>
          <p className="text-orange-600 text-sm">
            Complete payment before timer expires
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Payment Instructions:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Open your UPI app and scan the QR code</li>
          <li>2. Verify the amount (₹{transaction.amount})</li>
          <li>3. Complete the payment</li>
          <li>4. Copy your UPI transaction ID</li>
          <li>5. Enter it below and click "Verify Payment"</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPI Transaction ID (Optional but recommended)
          </label>
          <input
            type="text"
            value={userTxnId}
            onChange={(e) => setUserTxnId(e.target.value)}
            placeholder="Enter your UPI transaction ID"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can find this in your UPI app after payment completion
          </p>
        </div>

        {verificationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{verificationError}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleAutoVerification}
            disabled={isVerifying}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying Payment...' : 'Verify Payment'}
          </button>

          {showManualVerification && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-3">
                Auto-verification failed. If you've completed the payment, 
                please enter your UPI transaction ID above and click below:
              </p>
              <button
                onClick={handleManualVerification}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
              >
                Submit for Manual Verification
              </button>
            </div>
          )}

          <button
            onClick={onCancel}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Cancel Payment
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Transaction ID: {transaction.id}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Having trouble? Contact support with this transaction ID
        </p>
      </div>
    </div>
  );
};

export default PaymentVerification;
