import React, { useState, useEffect } from 'react';
import { razorpayService, PaymentTransaction } from '../services/razorpayService';

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
  const [userPaymentId, setUserPaymentId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [autoVerifyAttempts, setAutoVerifyAttempts] = useState<number>(0);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

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

  // Auto-verify payment every 10 seconds
  useEffect(() => {
    if (timeLeft > 0 && autoVerifyAttempts < 18) { // Try for 3 minutes (18 attempts)
      const autoVerifyInterval = setInterval(async () => {
        setIsAutoVerifying(true);
        try {
          const result = await razorpayService.verifyPayment(transaction.id);
          if (result.success) {
            onVerificationSuccess(transaction);
            return;
          }
        } catch (error) {
          console.log('Auto verification attempt failed:', error);
        } finally {
          setIsAutoVerifying(false);
        }
        
        setAutoVerifyAttempts(prev => prev + 1);
      }, 10000); // Every 10 seconds

      return () => clearInterval(autoVerifyInterval);
    }
  }, [timeLeft, autoVerifyAttempts, transaction.id, onVerificationSuccess]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleManualVerification = async () => {
    setIsVerifying(true);
    setVerificationError('');

    try {
      const result = await razorpayService.verifyPayment(transaction.id, userPaymentId);
      
      if (result.success) {
        onVerificationSuccess(transaction);
      } else {
        setVerificationError(result.message || 'Payment verification failed');
      }
    } catch (error) {
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transaction.id);
    alert('Transaction ID copied to clipboard!');
  };

  const copyRazorpayOrderId = () => {
    if (transaction.razorpayOrderId) {
      navigator.clipboard.writeText(transaction.razorpayOrderId);
      alert('Razorpay Order ID copied to clipboard!');
    }
  };

  if (timeLeft <= 0) {
    return (
      <div className="text-center">
        <div className="text-red-600 text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Session Expired</h2>
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
        
        {isAutoVerifying && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-sm">
              🔄 Auto-verifying payment with Razorpay...
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Payment Instructions:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Open your UPI app and scan the QR code</li>
          <li>2. Verify the amount (₹{transaction.amount})</li>
          <li>3. Complete the payment</li>
          <li>4. Payment will be automatically verified by Razorpay</li>
          <li>5. If auto-verification fails, enter your payment ID below</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Payment Details:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              Transaction ID: {transaction.id}
              <button
                onClick={copyTransactionId}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Copy
              </button>
            </p>
            <p>
              Razorpay Order ID: {transaction.razorpayOrderId}
              <button
                onClick={copyRazorpayOrderId}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Copy
              </button>
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPI Payment ID (Optional - for manual verification)
          </label>
          <input
            type="text"
            value={userPaymentId}
            onChange={(e) => setUserPaymentId(e.target.value)}
            placeholder="Enter your UPI payment ID"
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
            onClick={handleManualVerification}
            disabled={isVerifying}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying with Razorpay...' : 'Verify Payment Manually'}
          </button>

          <button
            onClick={onCancel}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Cancel Payment
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm font-semibold">
            🔒 Secure Payment Processing by Razorpay
          </p>
          <p className="text-green-600 text-xs mt-1">
            Payment verification is automatic and secure
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Having trouble? Contact support with Transaction ID: {transaction.id}
        </p>
      </div>
    </div>
  );
};

export default PaymentVerification;
