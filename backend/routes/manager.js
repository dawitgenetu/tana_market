import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Comment from '../models/Comment.js'

const router = express.Router()

// All manager routes require authentication and manager/admin role
router.use(authenticate)
router.use(authorize('manager', 'admin'))

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, pendingOrders, shippedOrders, totalComments] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'paid'] } }),
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

// Get orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Approve order
router.put('/orders/:id/approve', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    )
    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Ship order
router.put('/orders/:id/ship', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'shipped' },
      { new: true }
    )
    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
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
