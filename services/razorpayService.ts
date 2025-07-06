export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  created_at: number;
  notes: Record<string, string>;
}

export interface RazorpayPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  method: string;
  description: string;
  created_at: number;
  contact?: string;
  email?: string;
  vpa?: string;
  bank?: string;
  wallet?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  tokens: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  expiresAt: Date;
  userId: string;
  qrCodeUrl?: string;
  receipt: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId?: string;
  message: string;
  verified?: boolean;
  paymentDetails?: RazorpayPayment;
}

class RazorpayService {
  private transactions: Map<string, PaymentTransaction> = new Map();
  private readonly TRANSACTION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }

  // Create Razorpay order via backend
  async createRazorpayOrder(amount: number, tokens: number, userId: string): Promise<any> {
    const response = await fetch(`${this.API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        tokens,
        userId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    return await response.json();
  }

  // Generate QR code via backend
  async generateQRCode(orderId: string, amount: number): Promise<string> {
    const response = await fetch(`${this.API_BASE_URL}/payment/create-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        amount
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }

    const result = await response.json();
    return result.qrCodeUrl;
  }

  // Create a new payment transaction
  async createTransaction(amount: number, tokens: number, userId: string): Promise<PaymentTransaction> {
    try {
      // Create Razorpay order via backend
      const orderResponse = await this.createRazorpayOrder(amount, tokens, userId);
      
      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }
      
      // Generate QR code via backend
      const qrCodeUrl = await this.generateQRCode(orderResponse.orderId, amount);
      
      const transactionId = this.generateTransactionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.TRANSACTION_TIMEOUT);

      const transaction: PaymentTransaction = {
        id: transactionId,
        orderId: orderResponse.orderId,
        amount,
        tokens,
        status: 'pending',
        razorpayOrderId: orderResponse.orderId,
        createdAt: now,
        expiresAt,
        userId,
        qrCodeUrl,
        receipt: orderResponse.receipt
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
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create payment transaction');
    }
  }

  // Get transaction by ID
  getTransaction(transactionId: string): PaymentTransaction | null {
    return this.transactions.get(transactionId) || null;
  }

  // Verify payment via backend
  async verifyPayment(transactionId: string, paymentId?: string): Promise<PaymentVerificationResult> {
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

    try {
      const response = await fetch(`${this.API_BASE_URL}/payment/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: transaction.razorpayOrderId,
          paymentId: paymentId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const result = await response.json();

      if (result.success && result.verified) {
        // Update transaction status
        transaction.status = 'completed';
        transaction.razorpayPaymentId = result.paymentId;
        this.transactions.set(transactionId, transaction);

        return {
          success: true,
          transactionId: transaction.id,
          message: 'Payment verified successfully',
          verified: true,
          paymentDetails: result
        };
      }

      return {
        success: false,
        message: result.message || 'Payment not found or not completed yet. Please ensure payment is successful and try again.',
        verified: false
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'Payment verification failed. Please try again later.',
        verified: false
      };
    }
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

  // Get payment analytics
  getPaymentAnalytics(userId?: string): any {
    const transactions = userId 
      ? this.getUserTransactions(userId)
      : Array.from(this.transactions.values());

    return {
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(tx => tx.status === 'completed').length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length,
      pendingTransactions: transactions.filter(tx => tx.status === 'pending').length,
      totalAmount: transactions
        .filter(tx => tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.amount, 0),
      totalTokens: transactions
        .filter(tx => tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.tokens, 0)
    };
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();

// Clean up expired transactions every 5 minutes
setInterval(() => {
  razorpayService.cleanupExpiredTransactions();
}, 5 * 60 * 1000);
