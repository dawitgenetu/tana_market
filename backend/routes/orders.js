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

// Get order by tracking number or order ID
router.get('/tracking/:trackingNumber', authenticate, async (req, res) => {
  try {
    const { trackingNumber } = req.params
    
    // Try to find by tracking number first, then by order ID
    let order = await Order.findOne({ trackingNumber })
    
    if (!order) {
      // If not found by tracking number, try by order ID
      try {
        order = await Order.findById(trackingNumber)
      } catch (e) {
        // Invalid ObjectId format, order not found
      }
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    await order.populate('items.product')
    await order.populate('user', 'name email')
    
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

// Request return/refund
router.post('/:id/return', authenticate, async (req, res) => {
  try {
    const { reason } = req.body
    const order = await Order.findById(req.params.id)
    
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' })
    }
    
    if (order.returnRequest.status !== 'none') {
      return res.status(400).json({ message: 'Return request already exists for this order' })
    }
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Return reason is required' })
    }
    
    order.returnRequest = {
      status: 'requested',
      reason: reason.trim(),
      requestedAt: new Date(),
    }
    
    await order.save()
    await order.populate('items.product')
    await order.populate('user', 'name email')
    
    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get return request details
router.get('/:id/return', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Users can only see their own return requests, admins/managers can see all
    if (order.user.toString() !== req.user._id.toString() && 
        !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    res.json({ returnRequest: order.returnRequest })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
