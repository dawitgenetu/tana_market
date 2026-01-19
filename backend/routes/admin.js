import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Comment from '../models/Comment.js'
import ActivityLog from '../models/ActivityLog.js'
import { notifyOrderStatusChange } from '../utils/notifications.js'

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

    // Get real-time sales data for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'approved', 'shipped', 'delivered'] },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Get today's sales
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todaySales = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'approved', 'shipped', 'delivered'] },
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      }
    ])

    // Get delivery time statistics
    const deliveryStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'approved', 'shipped', 'delivered'] },
          estimatedDeliveryTime: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgDeliveryTime: { $avg: '$estimatedDeliveryTime' },
          minDeliveryTime: { $min: '$estimatedDeliveryTime' },
          maxDeliveryTime: { $max: '$estimatedDeliveryTime' },
          totalOrders: { $sum: 1 }
        }
      }
    ])

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      salesData: salesData.map(item => ({
        date: item._id,
        sales: item.sales,
        orders: item.orders
      })),
      todaySales: todaySales[0]?.sales || 0,
      todayOrders: todaySales[0]?.orders || 0,
      deliveryStats: deliveryStats[0] || {
        avgDeliveryTime: 1440,
        minDeliveryTime: 2,
        maxDeliveryTime: 14400,
        totalOrders: 0
      }
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
    ).populate('product')

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Update product rating
    const reviews = await Comment.find({
      product: comment.product._id,
      status: 'approved',
    })

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length

      await Product.findByIdAndUpdate(comment.product._id, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      })
    }

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
    ).populate('product')

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Update product rating (remove this review from calculation)
    const reviews = await Comment.find({
      product: comment.product._id,
      status: 'approved',
    })

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length

      await Product.findByIdAndUpdate(comment.product._id, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      })
    } else {
      await Product.findByIdAndUpdate(comment.product._id, {
        rating: 0,
        reviewCount: 0,
      })
    }

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
    // Get sales data for last 12 months
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'approved', 'shipped', 'delivered'] },
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])

    // Format sales data
    const sales = salesData.map(item => ({
      period: `${new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      sales: item.totalSales,
      orders: item.orderCount
    }))

    // Get top products by sales
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'approved', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ])

    const products = await Promise.all(
      topProducts.map(async (item) => {
        const product = await Product.findById(item._id).select('name')
        return {
          name: product?.name || 'Unknown',
          revenue: item.totalRevenue,
          quantity: item.totalQuantity
        }
      })
    )

    // Get category distribution
    const categoryData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'approved', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: '$productData.category',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ])

    const categories = categoryData.map(item => ({
      name: item._id || 'Uncategorized',
      value: item.totalRevenue
    }))

    // Get overall stats
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'approved', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ])

    res.json({
      sales,
      products,
      categories,
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders: totalRevenue[0]?.count || 0,
        averageOrderValue: totalRevenue[0]?.total / (totalRevenue[0]?.count || 1) || 0
      }
    })
  } catch (error) {
    console.error('Reports error:', error)
    res.status(500).json({ message: error.message })
  }
})

// Get all return requests
router.get('/returns', async (req, res) => {
  try {
    const orders = await Order.find({
      'returnRequest.status': { $ne: 'none' }
    })
      .populate('user', 'name email')
      .populate('items.product')
      .populate('returnRequest.processedBy', 'name')
      .sort({ 'returnRequest.requestedAt': -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Approve return request
router.put('/returns/:orderId/approve', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.returnRequest.status !== 'requested') {
      return res.status(400).json({ message: 'Return request is not in requested status' })
    }

    order.returnRequest.status = 'approved'
    order.returnRequest.approvedAt = new Date()
    order.returnRequest.processedBy = req.user._id

    await order.save()
    await order.populate('items.product')

    // Notify customer
    try {
      await notifyOrderStatusChange(order, 'return_approved', order.user._id)
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError)
    }

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Reject return request
router.put('/returns/:orderId/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body
    const order = await Order.findById(req.params.orderId).populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.returnRequest.status !== 'requested') {
      return res.status(400).json({ message: 'Return request is not in requested status' })
    }

    order.returnRequest.status = 'rejected'
    order.returnRequest.rejectedAt = new Date()
    order.returnRequest.rejectionReason = rejectionReason || 'Return request rejected'
    order.returnRequest.processedBy = req.user._id

    await order.save()
    await order.populate('items.product')

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Mark return as received and process refund
router.put('/returns/:orderId/refund', async (req, res) => {
  try {
    const { refundAmount, refundReference } = req.body
    const order = await Order.findById(req.params.orderId).populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.returnRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Return must be approved before processing refund' })
    }

    const refund = refundAmount || order.total

    order.returnRequest.status = 'refunded'
    order.returnRequest.returnedAt = new Date()
    order.returnRequest.refundedAt = new Date()
    order.returnRequest.refundAmount = refund
    order.returnRequest.refundReference = refundReference || `REF-${Date.now()}`
    order.returnRequest.processedBy = req.user._id

    // If order hasn't been shipped/delivered yet, cancel it to prevent shipping
    if (['paid', 'approved'].includes(order.status)) {
      order.status = 'cancelled'
    }

    await order.save()
    await order.populate('items.product')

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
