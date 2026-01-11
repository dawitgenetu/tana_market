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
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}`,
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
    res.status(400).json({ 
      message: error.response?.data?.message || 'Payment initialization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Verify payment (Webhook/Callback from Chapa)
router.post('/verify', async (req, res) => {
  try {
    const { tx_ref, status } = req.body
    
    console.log('Payment verification received:', { tx_ref, status })
    
    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference is required' })
    }
    
    // Find order by payment reference or order ID (tracking number may not exist yet for pending orders)
    const order = await Order.findOne({
      $or: [
        { paymentReference: tx_ref },
        { _id: tx_ref.replace('ORDER-', '').split('-')[0] },
        { trackingNumber: tx_ref },
      ],
    })
    
    if (!order) {
      console.error('Order not found for tx_ref:', tx_ref)
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Verify payment with Chapa
    try {
      const verifyResponse = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
        }
      )
      
      const paymentData = verifyResponse.data.data
      
      console.log('Payment data from Chapa:', paymentData)
      
      // Compare amounts (handle both string and number)
      const paymentAmount = parseFloat(paymentData.amount)
      const orderAmount = parseFloat(order.total)
      
      if (paymentData.status === 'success' && paymentAmount === orderAmount) {
        // Payment successful - update status to paid (this will trigger tracking number generation)
        order.status = 'paid'
        order.paymentReference = tx_ref
        await order.save()
        
        // Reload order to get the generated tracking number
        await order.populate('user', 'name email')
        const updatedOrder = await Order.findById(order._id)
        
        console.log('Payment verified successfully for order:', updatedOrder.trackingNumber || order._id)
        
        // Create notifications
        await notifyOrderStatusChange(updatedOrder, 'paid', order.user._id)
        await notifyPaymentStatus(order.user._id, true, order._id, updatedOrder.trackingNumber)
        await notifyNewPaidOrder(updatedOrder)
        
        // Redirect to success page using tracking number or order ID
        const redirectPath = updatedOrder.trackingNumber || order._id
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${redirectPath}?payment=success`)
      } else {
        console.log('Payment verification failed:', {
          status: paymentData.status,
          paymentAmount,
          orderAmount,
          match: paymentAmount === orderAmount
        })
        const redirectPath = order.trackingNumber || order._id
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${redirectPath}?payment=failed`)
      }
    } catch (verifyError) {
      console.error('Chapa verification error:', verifyError.response?.data || verifyError.message)
      const redirectPath = order.trackingNumber || order._id
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${redirectPath}?payment=error`)
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ message: 'Payment verification failed' })
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
    
    // Verify with Chapa
    const verifyResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    )
    
    const paymentData = verifyResponse.data.data
    
    const paymentAmount = parseFloat(paymentData.amount)
    const orderAmount = parseFloat(order.total)
    
    console.log('Manual verification:', {
      status: paymentData.status,
      paymentAmount,
      orderAmount,
      match: paymentAmount === orderAmount
    })
    
    if (paymentData.status === 'success' && paymentAmount === orderAmount) {
      order.status = 'paid'
      order.paymentReference = txRef
      await order.save()
      
      // Reload order to get the generated tracking number
      const updatedOrder = await Order.findById(order._id).populate('user', 'name email')
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: updatedOrder,
      })
    } else {
      res.json({
        success: false,
        message: 'Payment not verified',
        paymentData: {
          status: paymentData.status,
          amount: paymentAmount,
          orderAmount: orderAmount,
        },
      })
    }
  } catch (error) {
    console.error('Manual verification error:', error.response?.data || error.message)
    res.status(400).json({ 
      message: 'Verification failed',
      error: error.response?.data || error.message
    })
  }
})

export default router
