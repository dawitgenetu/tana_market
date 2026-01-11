import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  shippingAddress: {
    address: String,
    city: String,
    phone: String,
    notes: String,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'approved', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  trackingNumber: {
    type: String,
    unique: true,
  },
  paymentReference: {
    type: String,
  },
}, {
  timestamps: true,
})

// Generate tracking number only when order is paid
orderSchema.pre('save', async function(next) {
  // Only generate tracking number if status is paid and tracking number doesn't exist
  if (this.status === 'paid' && !this.trackingNumber) {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    
    // Count only paid orders with tracking numbers for the day
    const count = await mongoose.model('Order').countDocuments({
      status: 'paid',
      trackingNumber: { $exists: true, $ne: null },
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    })
    
    this.trackingNumber = `TANA-${dateStr}-${String(count + 1).padStart(4, '0')}`
  }
  
  // Remove tracking number if order status changes from paid to something else (except cancelled)
  if (this.isModified('status') && this.status !== 'paid' && this.status !== 'cancelled') {
    // Keep tracking number for approved, shipped, delivered
    // Only remove if going back to pending
    if (this.status === 'pending') {
      this.trackingNumber = undefined
    }
  }
  
  next()
})

export default mongoose.model('Order', orderSchema)
