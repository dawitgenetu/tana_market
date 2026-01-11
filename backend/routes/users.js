import express from 'express'
import { authenticate } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  res.json(req.user)
})

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password')
    res.json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
