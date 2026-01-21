import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'order_placed',
      'order_paid',
      'order_approved',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'order_return_requested',
      'order_return_approved',
      'order_return_rejected',
      'order_returned',
      'order_refunded',
      'payment_success',
      'payment_failed',
      'product_approved',
      'product_rejected',
      'comment_approved',
      'comment_rejected',
      'admin_alert',
      'system',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
})

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 })
notificationSchema.index({ createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
