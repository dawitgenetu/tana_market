import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Comment from '../models/Comment.js'
import ActivityLog from '../models/ActivityLog.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorize('admin'))

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, recentOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ status: { $in: ['paid', 'approved', 'shipped', 'delivered'] } }),
      Order.find({
        status: { $in: ['paid', 'approved', 'shipped', 'delivered'] }
      })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
    ])
    
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'approved', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ])
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      salesData: [],
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create user
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get all orders (only paid orders)
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

// Get all comments
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

// Approve comment
router.put('/comments/:id/approve', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    )
    res.json(comment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Reject comment
router.put('/comments/:id/reject', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    )
    res.json(comment)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get activity logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get reports
router.get('/reports', async (req, res) => {
  try {
    res.json({
      sales: [],
      products: [],
      categories: [],
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
