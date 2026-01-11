import express from 'express'
import Order from '../models/Order.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      user: req.user._id,
    })
    await order.populate('items.product')
    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get order by tracking number
router.get('/tracking/:trackingNumber', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('items.product')
      .populate('user', 'name email')
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Cancel order
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' })
    }
    
    order.status = 'cancelled'
    await order.save()
    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
