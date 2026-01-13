import express from 'express'
import { authenticate } from '../middleware/auth.js'
import Order from '../models/Order.js'
import axios from 'axios'
import crypto from 'crypto'
import { notifyOrderStatusChange, notifyPaymentStatus, notifyNewPaidOrder } from '../utils/notifications.js'

const router = express.Router()

// Initialize payment
router.post('/initialize', authenticate, async (req, res) => {
  try {
    // Check if Chapa API key is configured
    if (!process.env.CHAPA_SECRET_KEY) {
      console.error('CHAPA_SECRET_KEY is not configured in environment variables')
      return res.status(500).json({ 
        message: 'Payment gateway is not configured. Please contact support.' 
      })
    }
    
    const { orderId, amount } = req.body
    
    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Order ID and amount are required' })
    }
    
    const order = await Order.findById(orderId).populate('user', 'name email phone')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Verify order belongs to user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' })
    }
    
    // Generate unique transaction reference (use order ID since tracking number doesn't exist yet)
    const txRef = order.trackingNumber || `ORDER-${order._id.toString()}-${Date.now()}`
    
    // Prepare customer name
    const nameParts = (order.user.name || req.user.name || 'Customer').split(' ')
    const firstName = nameParts[0] || 'Customer'
    const lastName = nameParts.slice(1).join(' ') || 'User'
    
    // Chapa payment initialization
    const chapaPayload = {
      amount: amount.toString(),
      currency: 'ETB',
      email: order.user.email || req.user.email,
      first_name: firstName,
      last_name: lastName,
      phone_number: order.user.phone || req.user.phone || '251900000000',
      tx_ref: txRef,
      callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/verify`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}?auto_verify=true&tx_ref=${txRef}&orderId=${order._id}`,
      meta: {
        order_id: order._id.toString(),
        tracking_number: order.trackingNumber,
      },
    }
    
    console.log('Initializing Chapa payment:', {
      tx_ref: txRef,
      amount: amount,
      email: chapaPayload.email,
    })
    
    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!chapaResponse.data || !chapaResponse.data.data || !chapaResponse.data.data.checkout_url) {
      console.error('Invalid Chapa response:', chapaResponse.data)
      return res.status(400).json({ message: 'Invalid response from payment gateway' })
    }
    
    // Update order with payment reference
    order.paymentReference = txRef
    await order.save()
    
    res.json({
      checkout_url: chapaResponse.data.data.checkout_url,
      tx_ref: txRef,
    })
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message)
    
    // Provide more specific error messages
    let errorMessage = 'Payment initialization failed'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage = 'Invalid API Key or the business can\'t accept payments at the moment. Please verify your API key and ensure the account is active and able to process payments.'
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
      errorMessage = 'Unable to connect to payment gateway. Please try again later.'
    }
    
    res.status(400).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Helper function to verify and update payment
const verifyAndUpdatePayment = async (tx_ref, order = null) => {
  try {
    if (!process.env.CHAPA_SECRET_KEY) {
      console.error('CHAPA_SECRET_KEY is not configured')
      return { success: false, error: 'Payment gateway not configured' }
    }

    // Find order if not provided
    if (!order) {
      order = await Order.findOne({
        $or: [
          { paymentReference: tx_ref },
          { _id: tx_ref.replace('ORDER-', '').split('-')[0] },
          { trackingNumber: tx_ref },
        ],
      }).populate('user', 'name email')
    } else {
      await order.populate('user', 'name email')
    }

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Skip if already paid
    if (order.status === 'paid') {
      return { success: true, order, message: 'Payment already verified' }
    }

    // Verify payment with Chapa
    const verifyResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    )

    const paymentData = verifyResponse.data.data

    if (!paymentData) {
      return { success: false, error: 'Invalid payment data from Chapa' }
    }

    // Compare amounts (handle both string and number)
    const paymentAmount = parseFloat(paymentData.amount)
    const orderAmount = parseFloat(order.total)

    if (paymentData.status === 'success' && paymentAmount === orderAmount) {
      // Payment successful - update status to paid (this will trigger tracking number generation)
      // Only update if not already paid to avoid duplicate tracking number generation
      if (order.status !== 'paid') {
        order.status = 'paid'
        order.paymentReference = tx_ref
        try {
          await order.save()
        } catch (saveError) {
          // If save fails due to duplicate tracking number, reload order and try again
          if (saveError.code === 11000 && saveError.keyPattern?.trackingNumber) {
            console.log('Duplicate tracking number detected, reloading order and retrying...')
            const reloadedOrder = await Order.findById(order._id)
            if (reloadedOrder.status === 'paid' && reloadedOrder.trackingNumber) {
              // Order was already updated, use the reloaded version
              order = reloadedOrder
            } else {
              // Retry save with a slight delay
              await new Promise(resolve => setTimeout(resolve, 100))
              order.status = 'paid'
              order.paymentReference = tx_ref
              await order.save()
            }
          } else {
            throw saveError
          }
        }
      } else {
        // Order already paid, just update payment reference if needed
        if (order.paymentReference !== tx_ref) {
          order.paymentReference = tx_ref
          await order.save()
        }
      }

      // Reload order to get the generated tracking number
      const updatedOrder = await Order.findById(order._id).populate('user', 'name email')

      console.log('Payment verified successfully for order:', updatedOrder.trackingNumber || order._id)

      // Create notifications
      try {
        await notifyOrderStatusChange(updatedOrder, 'paid', order.user._id)
        await notifyPaymentStatus(order.user._id, true, order._id, updatedOrder.trackingNumber)
        await notifyNewPaidOrder(updatedOrder)
      } catch (notifyError) {
        console.error('Error sending notifications:', notifyError)
        // Don't fail payment verification if notifications fail
      }

      return { success: true, order: updatedOrder, message: 'Payment verified successfully' }
    } else {
      return {
        success: false,
        error: 'Payment verification failed',
        details: {
          status: paymentData.status,
          paymentAmount,
          orderAmount,
          match: paymentAmount === orderAmount
        }
      }
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message)
    return { success: false, error: error.message || 'Verification failed' }
  }
}

// Verify payment (Webhook/Callback from Chapa) - Automatically verifies payment
router.post('/verify', async (req, res) => {
  try {
    const { tx_ref, status } = req.body

    console.log('Payment verification received (webhook):', { tx_ref, status })

    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference is required' })
    }

    // Automatically verify and update payment
    const result = await verifyAndUpdatePayment(tx_ref)

    if (result.success) {
      console.log('✅ Payment automatically verified via webhook for:', tx_ref)
      const redirectPath = result.order.trackingNumber || result.order._id
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${redirectPath}?payment=success&auto_verified=true`)
    } else {
      console.log('⚠️ Payment verification failed via webhook:', result.error)
      // Try to find order for redirect even if verification failed
      const order = await Order.findOne({
        $or: [
          { paymentReference: tx_ref },
          { _id: tx_ref.replace('ORDER-', '').split('-')[0] },
          { trackingNumber: tx_ref },
        ],
      })
      const redirectPath = order?.trackingNumber || order?._id || ''
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${redirectPath}?payment=failed`)
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ message: 'Payment verification failed' })
  }
})

// Automatic payment verification endpoint (called when customer returns from payment)
router.post('/verify-auto', async (req, res) => {
  try {
    const { tx_ref, orderId } = req.body

    if (!tx_ref && !orderId) {
      return res.status(400).json({ message: 'Transaction reference or order ID is required' })
    }

    // Find order
    let order
    if (orderId) {
      order = await Order.findById(orderId)
    } else {
      order = await Order.findOne({
        $or: [
          { paymentReference: tx_ref },
          { _id: tx_ref.replace('ORDER-', '').split('-')[0] },
          { trackingNumber: tx_ref },
        ],
      })
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Use the payment reference from order or provided tx_ref
    const refToVerify = order.paymentReference || tx_ref

    if (!refToVerify) {
      return res.status(400).json({ message: 'No payment reference found' })
    }

    console.log('Auto-verifying payment:', { orderId: order._id, tx_ref: refToVerify, currentStatus: order.status })

    // Automatically verify payment
    const result = await verifyAndUpdatePayment(refToVerify, order)

    if (result.success) {
      console.log('✅ Auto-verification successful for order:', order._id)
      res.json({
        success: true,
        message: result.message || 'Payment verified successfully',
        order: result.order,
      })
    } else {
      console.log('⚠️ Auto-verification failed:', result.error, result.details)
      // Return success: false but don't use 400 status - payment might still be processing
      res.json({
        success: false,
        message: result.error || 'Payment verification failed',
        details: result.details,
      })
    }
  } catch (error) {
    console.error('Automatic verification error:', error.response?.data || error.message)
    res.json({
      success: false,
      message: 'Verification failed',
      error: error.response?.data || error.message
    })
  }
})

// Manual payment verification endpoint
router.get('/verify/:txRef', authenticate, async (req, res) => {
  try {
    const { txRef } = req.params

    // Find order
    const order = await Order.findOne({
      $or: [
        { trackingNumber: txRef },
        { paymentReference: txRef },
      ],
    }).populate('user')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Verify user owns this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Automatically verify payment
    const result = await verifyAndUpdatePayment(txRef, order)

    if (result.success) {
      res.json({
        success: true,
        message: result.message || 'Payment verified successfully',
        order: result.order,
      })
    } else {
      res.json({
        success: false,
        message: result.error || 'Payment not verified',
        details: result.details,
      })
    }
  } catch (error) {
    console.error('Manual verification error:', error.response?.data || error.message)
    res.status(400).json({
      success: false,
      message: 'Verification failed',
      error: error.response?.data || error.message
    })
  }
})

export default router
