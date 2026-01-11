import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Comment from '../models/Comment.js'
import { notifyOrderStatusChange } from '../utils/notifications.js'

const router = express.Router()

// All manager routes require authentication and manager/admin role
router.use(authenticate)
router.use(authorize('manager', 'admin'))

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, pendingOrders, shippedOrders, totalComments] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments({ status: 'paid' }),
      Order.countDocuments({ status: 'shipped' }),
      Comment.countDocuments(),
    ])
    
    res.json({
      totalProducts,
      pendingOrders,
      shippedOrders,
      totalComments,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get orders (only paid orders)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['paid', 'approved', 'shipped', 'delivered'] }
    })
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Approve order (only paid orders can be approved)
router.put('/orders/:id/approve', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (order.status !== 'paid') {
      return res.status(400).json({ message: 'Only paid orders can be approved' })
    }
    
    order.status = 'approved'
    await order.save()
    
    // Notify customer
    try {
      await notifyOrderStatusChange(order, 'approved', order.user._id)
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError)
      // Don't fail the request if notification fails
    }
    
    res.json(order)
  } catch (error) {
    console.error('Approve order error:', error)
    res.status(400).json({ message: error.message || 'Failed to approve order' })
  }
})

// Ship order (only approved orders can be shipped)
router.put('/orders/:id/ship', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (!['paid', 'approved'].includes(order.status)) {
      return res.status(400).json({ message: 'Only paid or approved orders can be shipped' })
    }
    
    order.status = 'shipped'
    await order.save()
    
    // Notify customer
    try {
      await notifyOrderStatusChange(order, 'shipped', order.user._id)
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError)
      // Don't fail the request if notification fails
    }
    
    res.json(order)
  } catch (error) {
    console.error('Ship order error:', error)
    res.status(400).json({ message: error.message || 'Failed to ship order' })
  }
})

// Get comments
router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
