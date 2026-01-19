import mongoose from 'mongoose'
import Product from '../models/Product.js'
import dotenv from 'dotenv'

dotenv.config()

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip, 256GB storage, Pro camera system with 3x Telephoto zoom. Features titanium design, Action Button, and USB-C connectivity.',
    price: 999.99,
    discount: 5,
    stock: 50,
    category: 'Mobile Phones & Accessories',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with 200MP camera, S Pen support, 256GB storage, and Snapdragon 8 Gen 3 processor. Perfect for productivity and photography.',
    price: 1199.99,
    discount: 10,
    stock: 30,
    category: 'Mobile Phones & Accessories',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    ],
    isActive: true,
  },
  {
    name: 'MacBook Pro 16" M3',
    description: 'Powerful laptop with M3 Pro chip, 16GB RAM, 512GB SSD. Perfect for professionals, creators, and developers. Features Liquid Retina XDR display.',
    price: 2499.99,
    discount: 0,
    stock: 25,
    category: 'Computer & Accessories',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life, quick charge, and superior sound quality. Perfect for music lovers and professionals.',
    price: 199.99,
    discount: 15,
    stock: 100,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Smart Watch Series 9',
    description: 'Advanced fitness tracking, heart rate monitor, GPS, water resistant, and 18-hour battery life. Stay connected and track your health.',
    price: 399.99,
    discount: 8,
    stock: 75,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max cushioning, breathable mesh upper, and durable rubber outsole. Available in multiple colors.',
    price: 129.99,
    discount: 20,
    stock: 150,
    category: 'Sports & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec32c3e7c3?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Coffee Maker Deluxe',
    description: 'Programmable coffee maker with 12-cup capacity, auto shut-off, and brew strength control. Start your day with perfect coffee every time.',
    price: 89.99,
    discount: 12,
    stock: 80,
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1517668808823-f8c0f12c4d0a?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with extra cushioning, eco-friendly material, and carrying strap. Perfect for yoga, pilates, and fitness exercises.',
    price: 49.99,
    discount: 10,
    stock: 200,
    category: 'Sports & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83d49e5a?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with RFID blocking, multiple card slots, and cash compartment. Sleek design that fits comfortably in your pocket.',
    price: 59.99,
    discount: 0,
    stock: 120,
    category: 'Jewelry & Accessories',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'
    ],
    isActive: true,
  },
  {
    name: 'Backpack Travel Pro',
    description: 'Durable travel backpack with laptop compartment, water-resistant material, and multiple pockets. Perfect for work, travel, and daily use.',
    price: 79.99,
    discount: 15,
    stock: 90,
    category: 'Travel & Luggage',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
    ],
    isActive: true,
  },
]

const addSampleProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tana-market')
    console.log('✅ Connected to MongoDB')
    
    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({})
    // console.log('Cleared existing products')
    
    // Check if products already exist
    const existingProducts = await Product.countDocuments()
    if (existingProducts > 0) {
      console.log(`⚠️  Found ${existingProducts} existing products in database.`)
      console.log('Adding new sample products...')
    }
    
    // Insert sample products
    const createdProducts = await Product.insertMany(sampleProducts)
    
    console.log(`\n✅ Successfully added ${createdProducts.length} sample products!`)
    console.log('\n📦 Products added:')
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.category} - $${product.price}`)
    })
    
    console.log('\n🎉 Sample products are now available in your store!')
    console.log('You can view them at: http://localhost:3000/products')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error adding sample products:', error)
    process.exit(1)
  }
}

addSampleProducts()
