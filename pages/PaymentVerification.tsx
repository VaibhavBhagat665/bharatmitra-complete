// Enhanced PaymentVerification.tsx
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
  const [transactionStatus, setTransactionStatus] = useState<any>(null);
  const [isManualVerifying, setIsManualVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [userTxnId, setUserTxnId] = useState<string>('');
  const [showManualOption, setShowManualOption] = useState(false);

  // Real-time status monitoring
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const status = paymentService.getTransactionStatus(transaction.id);
      setTransactionStatus(status);
      
      if (status?.status === 'completed') {
        const updatedTransaction = paymentService.getTransaction(transaction.id);
        if (updatedTransaction) {
          onVerificationSuccess(updatedTransaction);
        }
      }
    }, 2000);

    // Show manual option after 30 seconds
    const manualTimer = setTimeout(() => {
      setShowManualOption(true);
    }, 30000);

    return () => {
      clearInterval(statusInterval);
      clearTimeout(manualTimer);
    };
  }, [transaction.id, onVerificationSuccess]);

  // Initialize status
  useEffect(() => {
    const status = paymentService.getTransactionStatus(transaction.id);
    setTransactionStatus(status);
  }, [transaction.id]);

  const handleManualVerification = async () => {
    setIsManualVerifying(true);
    setVerificationError('');

    try {
      const result = await paymentService.verifyPayment(transaction.id, userTxnId);
      
      if (result.success) {
        const updatedTransaction = paymentService.getTransaction(transaction.id);
        if (updatedTransaction) {
          onVerificationSuccess(updatedTransaction);
        }
      } else {
        setVerificationError(result.message);
      }
    } catch (error) {
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setIsManualVerifying(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVerificationProgress = () => {
    if (!transactionStatus) return 0;
    const maxAttempts = 5;
    return Math.min(100, (transactionStatus.attempts / maxAttempts) * 100);
  };

  if (!transactionStatus) {
    return <div>Loading...</div>;
  }

  if (transactionStatus.timeLeft <= 0) {
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
      {/* Auto-verification status */}
      <div className="text-center mb-6">
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
          <div className="text-blue-600 text-4xl mb-2">🔄</div>
          <p className="text-blue-800 font-semibold">Auto-Verifying Payment</p>
          <p className="text-blue-600 text-sm">
            We're automatically checking for your payment...
          </p>
          
          {/* Progress bar */}
          <div className="mt-3 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getVerificationProgress()}%` }}
            />
          </div>
          
          <p className="text-blue-600 text-xs mt-2">
            Attempt {transactionStatus.attempts} of 5 • Time left: {formatTime(transactionStatus.timeLeft)}
          </p>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-green-800 mb-2">✅ Complete Your Payment</h3>
        <ol className="text-sm text-green-700 space-y-1">
          <li>1. Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
          <li>2. Scan the QR code or use the UPI link</li>
          <li>3. Verify amount: ₹{transaction.amount}</li>
          <li>4. Complete the payment</li>
          <li>5. We'll detect it automatically!</li>
        </ol>
      </div>

      {/* Manual verification option */}
      {showManualOption && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚡ Quick Verification</h3>
          <p className="text-yellow-700 text-sm mb-3">
            Already completed payment? Click below to verify instantly:
          </p>
          
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={userTxnId}
                onChange={(e) => setUserTxnId(e.target.value)}
                placeholder="UPI Transaction ID (optional)"
                className="w-full p-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              />
            </div>
            
            <button
              onClick={handleManualVerification}
              disabled={isManualVerifying}
              className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {isManualVerifying ? 'Verifying...' : 'Verify Payment Now'}
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {verificationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{verificationError}</p>
        </div>
      )}

      {/* Cancel button */}
      <div className="text-center">
        <button
          onClick={onCancel}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Cancel Payment
        </button>
      </div>

      {/* Help text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Transaction ID: {transaction.id}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Payment will be verified automatically within 2-3 minutes
        </p>
      </div>
    </div>
  );
};

export default PaymentVerification;
