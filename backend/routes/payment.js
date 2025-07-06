const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order endpoint
router.post('/create-order', async (req, res) => {
  try {
    const { amount, tokens, userId } = req.body;
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        tokens: tokens.toString(),
        purpose: 'Bharat Tokens Purchase'
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Create QR code endpoint
router.post('/create-qr', async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    
    const qrData = {
      type: 'upi_qr',
      usage: 'single_use',
      amount: amount * 100,
      currency: 'INR',
      description: 'Bharat Tokens Purchase',
      close_by: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      notes: {
        order_id: orderId
      }
    };

    const qrCode = await razorpay.qrCodes.create(qrData);
    
    res.json({
      success: true,
      qrCodeUrl: qrCode.image_url,
      qrCodeId: qrCode.id
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create QR code'
    });
  }
});

// Verify payment endpoint
router.post('/verify-payment', async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    
    // Fetch order details
    const order = await razorpay.orders.fetch(orderId);
    
    if (order.status === 'paid') {
      // Fetch payments for the order
      const payments = await razorpay.orders.fetchPayments(orderId);
      const successfulPayment = payments.items.find(
        payment => payment.status === 'captured' || payment.status === 'authorized'
      );
      
      if (successfulPayment) {
        res.json({
          success: true,
          verified: true,
          paymentId: successfulPayment.id,
          amount: successfulPayment.amount / 100,
          status: successfulPayment.status
        });
        return;
      }
    }
    
    // If specific payment ID provided, verify it
    if (paymentId) {
      const payment = await razorpay.payments.fetch(paymentId);
      
      if (payment.order_id === orderId && 
          (payment.status === 'captured' || payment.status === 'authorized')) {
        res.json({
          success: true,
          verified: true,
          paymentId: payment.id,
          amount: payment.amount / 100,
          status: payment.status
        });
        return;
      }
    }
    
    res.json({
      success: false,
      verified: false,
      message: 'Payment not found or not completed'
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// Webhook endpoint
router.post('/webhook', (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    
    // Handle different events
    switch (event) {
      case 'payment.captured':
        console.log('Payment captured:', paymentEntity.id);
        // Update your database here
        break;
        
      case 'payment.failed':
        console.log('Payment failed:', paymentEntity.id);
        // Update your database here
        break;
        
      default:
        console.log('Unhandled event:', event);
    }
    
    res.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
