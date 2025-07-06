// services/razorpayService.ts
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
  vpa?: string; // UPI ID
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
  private readonly RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'your_test_key_id';
  private readonly RAZORPAY_KEY_SECRET = process.env.REACT_APP_RAZORPAY_KEY_SECRET || 'your_test_key_secret';
  private readonly BASE_URL = 'https://api.razorpay.com/v1';

  // Generate a unique transaction ID
  generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }

  // Create Razorpay order
  async createRazorpayOrder(amount: number, tokens: number, userId: string): Promise<RazorpayOrder> {
    const receipt = this.generateTransactionId();
    
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId: userId,
        tokens: tokens.toString(),
        purpose: 'Bharat Tokens Purchase'
      }
    };

    // In production, this API call should be made from your backend
    const response = await fetch(`${this.BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.RAZORPAY_KEY_ID}:${this.RAZORPAY_KEY_SECRET}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    return await response.json();
  }

  // Generate QR code for UPI payment
  async generateQRCode(orderId: string, amount: number): Promise<string> {
    const qrData = {
      type: 'upi_qr',
      usage: 'single_use',
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      description: 'Bharat Tokens Purchase',
      close_by: Math.floor(Date.now() / 1000) + 900, // 15 minutes from now
      notes: {
        order_id: orderId
      }
    };

    // In production, make this API call from your backend
    const response = await fetch(`${this.BASE_URL}/payments/qr_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.RAZORPAY_KEY_ID}:${this.RAZORPAY_KEY_SECRET}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(qrData)
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }

    const qrResponse = await response.json();
    return qrResponse.image_url;
  }

  // Create a new payment transaction
  async createTransaction(amount: number, tokens: number, userId: string): Promise<PaymentTransaction> {
    try {
      // Create Razorpay order first
      const razorpayOrder = await this.createRazorpayOrder(amount, tokens, userId);
      
      // Generate QR code
      const qrCodeUrl = await this.generateQRCode(razorpayOrder.id, amount);
      
      const transactionId = this.generateTransactionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.TRANSACTION_TIMEOUT);

      const transaction: PaymentTransaction = {
        id: transactionId,
        orderId: razorpayOrder.id,
        amount,
        tokens,
        status: 'pending',
        razorpayOrderId: razorpayOrder.id,
        createdAt: now,
        expiresAt,
        userId,
        qrCodeUrl,
        receipt: razorpayOrder.receipt
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

  // Verify payment with Razorpay
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
      // Check order status with Razorpay
      const orderResponse = await fetch(`${this.BASE_URL}/orders/${transaction.razorpayOrderId}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.RAZORPAY_KEY_ID}:${this.RAZORPAY_KEY_SECRET}`)}`
        }
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to fetch order status');
      }

      const orderData: RazorpayOrder = await orderResponse.json();

      // Check if order is paid
      if (orderData.status === 'paid') {
        // Get payment details
        const paymentsResponse = await fetch(`${this.BASE_URL}/orders/${transaction.razorpayOrderId}/payments`, {
          headers: {
            'Authorization': `Basic ${btoa(`${this.RAZORPAY_KEY_ID}:${this.RAZORPAY_KEY_SECRET}`)}`
          }
        });

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          const successfulPayment = paymentsData.items.find(
            (payment: RazorpayPayment) => payment.status === 'captured' || payment.status === 'authorized'
          );

          if (successfulPayment) {
            // Update transaction status
            transaction.status = 'completed';
            transaction.razorpayPaymentId = successfulPayment.id;
            this.transactions.set(transactionId, transaction);

            return {
              success: true,
              transactionId: transaction.id,
              message: 'Payment verified successfully',
              verified: true,
              paymentDetails: successfulPayment
            };
          }
        }
      }

      // If paymentId is provided, verify specific payment
      if (paymentId) {
        const paymentResponse = await fetch(`${this.BASE_URL}/payments/${paymentId}`, {
          headers: {
            'Authorization': `Basic ${btoa(`${this.RAZORPAY_KEY_ID}:${this.RAZORPAY_KEY_SECRET}`)}`
          }
        });

        if (paymentResponse.ok) {
          const paymentData: RazorpayPayment = await paymentResponse.json();
          
          if (paymentData.order_id === transaction.razorpayOrderId && 
              (paymentData.status === 'captured' || paymentData.status === 'authorized')) {
            
            transaction.status = 'completed';
            transaction.razorpayPaymentId = paymentData.id;
            this.transactions.set(transactionId, transaction);

            return {
              success: true,
              transactionId: transaction.id,
              message: 'Payment verified successfully',
              verified: true,
              paymentDetails: paymentData
            };
          }
        }
      }

      return {
        success: false,
        message: 'Payment not found or not completed yet. Please ensure payment is successful and try again.',
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

  // Webhook handler for Razorpay events
  handleWebhook(payload: any, signature: string): boolean {
    try {
      // Verify webhook signature
      const expectedSignature = this.generateWebhookSignature(payload);
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return false;
      }

      // Handle payment success event
      if (payload.event === 'payment.captured') {
        const payment = payload.payload.payment.entity;
        const orderId = payment.order_id;
        
        // Find transaction by order ID
        const transaction = Array.from(this.transactions.values())
          .find(tx => tx.razorpayOrderId === orderId);
        
        if (transaction) {
          transaction.status = 'completed';
          transaction.razorpayPaymentId = payment.id;
          this.transactions.set(transaction.id, transaction);
        }
      }

      // Handle payment failure event
      if (payload.event === 'payment.failed') {
        const payment = payload.payload.payment.entity;
        const orderId = payment.order_id;
        
        const transaction = Array.from(this.transactions.values())
          .find(tx => tx.razorpayOrderId === orderId);
        
        if (transaction) {
          transaction.status = 'failed';
          this.transactions.set(transaction.id, transaction);
        }
      }

      return true;
    } catch (error) {
      console.error('Webhook handling error:', error);
      return false;
    }
  }

  // Generate webhook signature
  private generateWebhookSignature(payload: any): string {
    // This is a simplified version - use actual HMAC-SHA256 with your webhook secret
    const crypto = require('crypto');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    
    return crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
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
