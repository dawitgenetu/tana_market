import express from 'express'
import Comment from '../models/Comment.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get product reviews
router.get('/products/:productId', async (req, res) => {
  try {
    const comments = await Comment.find({
      product: req.params.productId,
      status: 'approved',
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
