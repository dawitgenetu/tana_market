import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Order from '../models/Order.js'

dotenv.config()

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/tana-mmarket'

const run = async () => {
  try {
    await mongoose.connect(MONGO)
    console.log('Connected to MongoDB')

    // Count docs with explicit null trackingNumber
    const nullCount = await Order.countDocuments({ trackingNumber: null })
    console.log(`Documents with trackingNumber:null: ${nullCount}`)

    if (nullCount > 0) {
      console.log('Removing trackingNumber field from documents where it is null...')
      const res = await Order.updateMany({ trackingNumber: null }, { $unset: { trackingNumber: '' } })
      console.log(`Modified ${res.modifiedCount} documents.`)
    }

    // Drop existing index if present
    try {
      const indexes = await Order.collection.indexes()
      const idx = indexes.find(i => i.name === 'trackingNumber_1')
      if (idx) {
        console.log('Dropping existing index trackingNumber_1')
        await Order.collection.dropIndex('trackingNumber_1')
      } else {
        console.log('No existing trackingNumber_1 index found')
      }
    } catch (err) {
      console.warn('Error checking/dropping index (continuing):', err.message)
    }

    // Create partial unique index
    console.log('Creating partial unique index on trackingNumber...')
    await Order.collection.createIndex(
      { trackingNumber: 1 },
      { unique: true, partialFilterExpression: { trackingNumber: { $exists: true, $ne: null } } }
    )

    console.log('Partial unique index created successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

run()
