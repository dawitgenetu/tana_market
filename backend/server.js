import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Webhook endpoint needs raw body for Chapa verification
app.use('/api/payments/verify', express.raw({ type: 'application/json' }))

// Routes
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import paymentRoutes from './routes/payments.js'
import userRoutes from './routes/users.js'
import commentRoutes from './routes/comments.js'
import adminRoutes from './routes/admin.js'
import managerRoutes from './routes/manager.js'

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/manager', managerRoutes)

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    res.json({
      totalProducts: 0,
      totalOrders: 0,
      happyCustomers: 0,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' })
  }
})

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tana-market')
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
