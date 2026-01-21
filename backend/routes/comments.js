import express from 'express'
import Comment from '../models/Comment.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Comment.find({
      product: productId,
      status: 'approved',
    })
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0,
      })
      return
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
    })
  } catch (error) {
    console.error('Error updating product rating:', error)
  }
}

// Get product reviews
router.get('/products/:productId', async (req, res) => {
  try {
    const comments = await Comment.find({
      product: req.params.productId,
      status: 'approved',
    })
      .populate('user', 'name')
      .populate('order', 'trackingNumber')
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user's review for a product (if exists)
router.get('/products/:productId/my-review', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      product: req.params.productId,
      user: req.user._id,
    })
      .populate('order', 'trackingNumber status')
    
    if (!comment) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    res.json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Check if user can review a product:
// - Must have at least one delivered order containing the product
// - Must not have already reviewed this product
router.get('/products/:productId/can-review', authenticate, async (req, res) => {
  try {
    const productId = req.params.productId

    // Has the user already reviewed this product?
    const existingReview = await Comment.findOne({
      user: req.user._id,
      product: productId,
    }).select('_id')

    // Find a delivered order that contains this product
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      status: 'delivered',
      'items.product': productId,
    }).select('_id trackingNumber')

    if (!deliveredOrder) {
      return res.json({
        canReview: false,
        orders: [],
        hasReviewed: !!existingReview,
      })
    }

    if (existingReview) {
      return res.json({
        canReview: false,
        orders: [],
        hasReviewed: true,
      })
    }

    return res.json({
      canReview: true,
      orders: [{
        _id: deliveredOrder._id,
        trackingNumber: deliveredOrder.trackingNumber,
      }],
      hasReviewed: false,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create review (only for delivered orders)
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body
    
    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({ 
        message: 'Product ID, Order ID, rating, and comment are required' 
      })
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }
    
    // Verify order exists and belongs to user
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review your own orders' })
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        message: 'You can only review products from delivered orders' 
      })
    }
    
    // Check if product is in the order
    const productInOrder = order.items.some(
      item => item.product.toString() === productId
    )
    
    if (!productInOrder) {
      return res.status(400).json({ 
        message: 'This product is not in the specified order' 
      })
    }
    
    // Check if review already exists for this user and product (any order)
    const existingReview = await Comment.findOne({
      user: req.user._id,
      product: productId,
    })
    
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this product' 
      })
    }
    
    // Create review (status will be pending for admin/manager approval)
    const newComment = await Comment.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      comment: comment.trim(),
      status: 'pending',
    })
    
    await newComment.populate('user', 'name')
    await newComment.populate('order', 'trackingNumber')
    await newComment.populate('product', 'name')
    
    res.status(201).json(newComment)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'You have already reviewed this product' 
      })
    }
    res.status(400).json({ message: error.message })
  }
})

// Update review (only by the user who created it)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const review = await Comment.findById(req.params.id)
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own reviews' })
    }
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' })
      }
      review.rating = rating
    }
    
    if (comment !== undefined) {
      review.comment = comment.trim()
    }
    
    // Reset status to pending if review is updated
    if (review.status === 'approved') {
      review.status = 'pending'
    }
    
    await review.save()
    await review.populate('user', 'name')
    await review.populate('order', 'trackingNumber')
    await review.populate('product', 'name')
    
    // Update product rating if review was approved
    if (review.status === 'approved') {
      await updateProductRating(review.product._id)
    }
    
    res.json(review)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete review (only by the user who created it)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Comment.findById(req.params.id)
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reviews' })
    }
    
    const productId = review.product
    await Comment.findByIdAndDelete(req.params.id)
    
    // Update product rating
    await updateProductRating(productId)
    
    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get user's reviews
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.user._id })
      .populate('product', 'name images')
      .populate('order', 'trackingNumber status')
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
