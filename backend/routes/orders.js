import express from 'express'
import Order from '../models/Order.js'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { notifyOrderStatusChange, createNotification } from '../utils/notifications.js'

const router = express.Router()

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 })

    // Auto-mark as delivered where delivery time has passed
    orders = await Promise.all(
      orders.map(order => order.autoMarkDeliveredIfDue())
    )

    // Notify when auto-delivered
    await Promise.all(orders
      .filter(order => order._wasAutoDelivered)
      .map(order => notifyOrderStatusChange(order, 'delivered', req.user._id)))

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

    // Auto-mark as delivered where delivery time has passed
    order = await order.autoMarkDeliveredIfDue()

    if (order._wasAutoDelivered) {
      await notifyOrderStatusChange(order, 'delivered', order.user?._id || req.user._id)
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

    // Only allow cancelling orders that have not been paid yet
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending (unpaid) orders can be cancelled. Please use the return/refund option for paid orders.' })
    }

    await Order.deleteOne({ _id: order._id })
    res.json({ message: 'Order cancelled and removed' })
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

    if (!['paid', 'approved', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Only paid orders can be refunded/returned' })
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

    // Notify admins/managers about new return/refund request
    try {
      const staffUsers = await User.find({
        role: { $in: ['admin', 'manager'] },
        isActive: true,
      }).select('_id')

      const isDelivered = order.status === 'delivered'
      const actionLabel = isDelivered ? 'return' : 'refund'
      const title = `New ${actionLabel} request`
      const message = `${order.user?.name || 'A customer'} requested a ${actionLabel} for order ${order.trackingNumber || order._id}.`

      await Promise.all(
        staffUsers.map((staff) =>
          createNotification(
            staff._id,
            'order_return_requested',
            title,
            message,
            '/admin/returns',
            { orderId: order._id.toString() }
          )
        )
      )
    } catch (notifyError) {
      console.error('Error notifying admins about return request:', notifyError)
    }

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
