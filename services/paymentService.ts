// paymentService.ts
export interface PaymentTransaction {
  id: string;
  amount: number;
  tokens: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  upiTransactionId?: string;
  createdAt: Date;
  expiresAt: Date;
  userId: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId?: string;
  message: string;
  verified?: boolean;
}

class PaymentService {
  private transactions: Map<string, PaymentTransaction> = new Map();
  private readonly TRANSACTION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  // Generate a unique transaction ID
  generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }

  // Create a new payment transaction
  createTransaction(amount: number, tokens: number, userId: string): PaymentTransaction {
    const transactionId = this.generateTransactionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.TRANSACTION_TIMEOUT);

    const transaction: PaymentTransaction = {
      id: transactionId,
      amount,
      tokens,
      status: 'pending',
      createdAt: now,
      expiresAt,
      userId
    };

    this.transactions.set(transactionId, transaction);

    // Auto-expire transaction after timeout
    setTimeout(() => {
      const tx = this.transactions.get(transactionId);
      if (tx && tx.status === 'pending') {
        tx.status = 'expired';
        this.transactions.set(transactionId, tx);
      }
    }, this.TRANSACTION_TIMEOUT);

    return transaction;
  }

  // Get transaction by ID
  getTransaction(transactionId: string): PaymentTransaction | null {
    return this.transactions.get(transactionId) || null;
  }

  // Generate UPI payment string with transaction reference
  generateUpiPaymentString(transaction: PaymentTransaction): string {
    const UPI_ID = 'vaibhavbhagat7461@oksbi';
    const UPI_NAME = 'Vaibhav Bhagat';
    
    // Include transaction ID in payment note for tracking
    const paymentNote = `Bharat Tokens Purchase - ${transaction.id}`;
    
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${transaction.amount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;
  }

  // Generate QR code URL
  generateQRCode(upiString: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
  }

  // Mock payment verification (In real implementation, this would integrate with payment gateway)
  async verifyPayment(transactionId: string, userProvidedTxnId?: string): Promise<PaymentVerificationResult> {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }

    if (transaction.status === 'expired') {
      return {
        success: false,
        message: 'Transaction has expired. Please create a new payment.'
      };
    }

    if (transaction.status === 'completed') {
      return {
        success: false,
        message: 'Transaction already completed'
      };
    }

    // Mock verification process
    // In real implementation, you would:
    // 1. Check with payment gateway API
    // 2. Verify transaction amount and details
    // 3. Ensure transaction hasn't been used before
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate random verification result for demo
        // In production, replace with actual payment gateway verification
        const isVerified = Math.random() > 0.3; // 70% success rate for demo
        
        if (isVerified) {
          transaction.status = 'completed';
          transaction.upiTransactionId = userProvidedTxnId || `UPI${Date.now()}`;
          this.transactions.set(transactionId, transaction);
          
          resolve({
            success: true,
            transactionId: transaction.id,
            message: 'Payment verified successfully',
            verified: true
          });
        } else {
          resolve({
            success: false,
            message: 'Payment verification failed. Please ensure payment is completed and try again.',
            verified: false
          });
        }
      }, 2000); // Simulate API call delay
    });
  }

  // Manual verification method (for admin/support)
  manualVerifyPayment(transactionId: string, upiTxnId: string): boolean {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction || transaction.status !== 'pending') {
      return false;
    }

    transaction.status = 'completed';
    transaction.upiTransactionId = upiTxnId;
    this.transactions.set(transactionId, transaction);
    
    return true;
  }

  // Get all transactions for a user
  getUserTransactions(userId: string): PaymentTransaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Clean up expired transactions
  cleanupExpiredTransactions(): void {
    const now = new Date();
    for (const [id, transaction] of this.transactions.entries()) {
      if (transaction.expiresAt < now && transaction.status === 'pending') {
        transaction.status = 'expired';
        this.transactions.set(id, transaction);
      }
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Clean up expired transactions every 5 minutes
setInterval(() => {
  paymentService.cleanupExpiredTransactions();
}, 5 * 60 * 1000);
