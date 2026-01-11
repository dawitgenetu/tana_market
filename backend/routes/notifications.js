import express from 'express'
import { authenticate } from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// All notification routes require authentication
router.use(authenticate)

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query
    
    const query = { user: req.user._id }
    if (unreadOnly === 'true') {
      query.read = false
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
    
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get unread notification count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    })
    
    res.json({ count })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    
    notification.read = true
    await notification.save()
    
    res.json(notification)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    )
    
    res.json({ 
      message: 'All notifications marked as read',
      updated: result.modifiedCount,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    
    res.json({ message: 'Notification deleted' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete all read notifications
router.delete('/read/all', async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user._id,
      read: true,
    })
    
    res.json({ 
      message: 'All read notifications deleted',
      deleted: result.deletedCount,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
