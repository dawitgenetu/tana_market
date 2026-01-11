import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import ActivityLog from '../models/ActivityLog.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' })
    }
    
    const user = await User.create({ name, email, password, phone, role: 'customer' })
    
    await ActivityLog.create({
      user: user._id,
      action: 'register',
      description: 'User registered',
    })
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' })
    }
    
    await ActivityLog.create({
      user: user._id,
      action: 'login',
      description: 'User logged in',
    })
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
