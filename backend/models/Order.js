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
  },
  paymentReference: {
    type: String,
  },
  returnRequest: {
    status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'returned', 'refunded'],
      default: 'none',
    },
    reason: {
      type: String,
    },
    requestedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    returnedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReference: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
}, {
  timestamps: true,
})

// Generate tracking number only when order is paid
orderSchema.pre('save', async function(next) {
  // Only generate tracking number if status is paid and tracking number doesn't exist
  if (this.status === 'paid' && !this.trackingNumber) {
    const date = new Date()
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    
    let attempts = 0
    let trackingNumber = null
    const maxAttempts = 100 // Prevent infinite loop
    
    // Generate unique tracking number with retry logic
    while (!trackingNumber && attempts < maxAttempts) {
      attempts++
      
      // Count only paid orders with tracking numbers for the day
      // Exclude the current order from the count
      const count = await mongoose.model('Order').countDocuments({
        status: 'paid',
        trackingNumber: { $exists: true, $ne: null },
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        _id: { $ne: this._id }, // Exclude current order
      })
      
      const proposedNumber = `TANA-${dateStr}-${String(count + attempts).padStart(4, '0')}`
      
      // Check if this tracking number already exists
      const exists = await mongoose.model('Order').findOne({
        trackingNumber: proposedNumber,
        _id: { $ne: this._id }, // Exclude current order
      })
      
      if (!exists) {
        trackingNumber = proposedNumber
      }
    }
    
    if (trackingNumber) {
      this.trackingNumber = trackingNumber
    } else {
      // Fallback: use timestamp-based tracking number if we can't generate a unique one
      this.trackingNumber = `TANA-${dateStr}-${Date.now().toString().slice(-4)}`
      console.warn('Could not generate unique tracking number, using fallback:', this.trackingNumber)
    }
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

// Ensure unique tracking numbers only when the field exists (allow multiple docs without the field)
orderSchema.index({ trackingNumber: 1 }, { unique: true, partialFilterExpression: { trackingNumber: { $exists: true } } })

export default mongoose.model('Order', orderSchema)
