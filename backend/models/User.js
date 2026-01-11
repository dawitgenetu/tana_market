import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'manager', 'admin'],
    default: 'customer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)
