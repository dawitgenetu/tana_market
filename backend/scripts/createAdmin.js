import mongoose from 'mongoose'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tana-market')
    console.log('Connected to MongoDB')
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@tanamarket.com' })
    if (existingAdmin) {
      console.log('Admin user already exists!')
      process.exit(0)
    }
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tanamarket.com',
      password: 'admin123', // Change this password!
      role: 'admin',
      isActive: true,
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('Email: admin@tanamarket.com')
    console.log('Password: admin123')
    console.log('⚠️  Please change the password after first login!')
    
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
