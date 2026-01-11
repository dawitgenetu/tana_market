import express from 'express'
import { authenticate } from '../middleware/auth.js'
import Order from '../models/Order.js'
import axios from 'axios'

const router = express.Router()

// Initialize payment
router.post('/initialize', authenticate, async (req, res) => {
  try {
    const { orderId, amount } = req.body
    
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Chapa payment initialization
      const chapaResponse = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
        {
          amount: amount.toString(),
          currency: 'ETB', // Ethiopian Birr
          email: req.user.email,
          first_name: req.user.name.split(' ')[0],
          last_name: req.user.name.split(' ').slice(1).join(' ') || '',
          phone_number: req.user.phone || '',
          tx_ref: order.trackingNumber || order._id.toString(),
          callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.trackingNumber}`,
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order.trackingNumber}`,
        },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY || 'your-chapa-secret'}`,
        },
      }
    )
    
    res.json({
      checkout_url: chapaResponse.data.data.checkout_url,
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    res.status(400).json({ message: 'Payment initialization failed' })
  }
})

export default router
