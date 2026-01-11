import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Product from '../models/Product.js'
import { authenticate, authorize } from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/products')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error(`Only image files are allowed! Received: ${file.mimetype}`))
    }
  }
})

// Multer error handler wrapper
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' })
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Maximum is 5 files.' })
          }
          return res.status(400).json({ message: err.message })
        }
        return res.status(400).json({ message: err.message || 'File upload error' })
      }
      next()
    })
  }
}

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, limit } = req.query
    const query = { isActive: true }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (search && search.trim()) {
      // Escape special regex characters
      const searchRegex = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { name: { $regex: searchRegex, $options: 'i' } },
        { description: { $regex: searchRegex, $options: 'i' } },
        { category: { $regex: searchRegex, $options: 'i' } },
      ]
    }
    
    const limitNum = parseInt(limit) || 100
    const products = await Product.find(query)
      .limit(limitNum)
      .sort({ createdAt: -1 })
    
    res.json({ 
      products,
      total: products.length,
      search: search || null,
      category: category || 'all'
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: error.message })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create product (Manager/Admin only)
router.post('/', authenticate, authorize('manager', 'admin'), handleUpload(upload.array('images', 5)), async (req, res) => {
  try {
    console.log('Product creation request received')
    console.log('Body:', req.body)
    console.log('Files:', req.files)
    
    const { name, description, price, discount, stock, category, imageUrls } = req.body
    
    // Validation
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, price, stock, and category are required' 
      })
    }
    
    // Validate price and stock are valid numbers
    const priceNum = parseFloat(price)
    const stockNum = parseInt(stock)
    
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: 'Price must be a valid number >= 0' })
    }
    
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ message: 'Stock must be a valid integer >= 0' })
    }
    
    let images = []
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files:', req.files.map(f => f.filename))
      images = req.files.map(file => `/uploads/products/${file.filename}`)
      console.log('Image paths:', images)
    } else {
      console.log('No files uploaded')
    }
    
    // Handle image URLs
    if (imageUrls) {
      try {
        const urls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls
        if (Array.isArray(urls)) {
          images = [...images, ...urls.filter(url => url && url.trim())]
        }
      } catch (parseError) {
        console.error('Error parsing imageUrls:', parseError)
        // Don't fail if URL parsing fails, just skip URLs
      }
    }
    
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      discount: discount ? parseFloat(discount) : 0,
      stock: stockNum,
      category: category.trim(),
      images: images.length > 0 ? images : ['/placeholder-product.jpg'],
    }
    
    console.log('Creating product with data:', productData)
    
    const product = await Product.create(productData)
    
    console.log('Product created successfully:', product._id)
    res.status(201).json(product)
  } catch (error) {
    console.error('Product creation error:', error)
    console.error('Error stack:', error.stack)
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ')
      return res.status(400).json({ message: `Validation error: ${messages}` })
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: error.message || 'Failed to create product. Please check all fields and try again.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Update product (Manager/Admin only)
router.put('/:id', authenticate, authorize('manager', 'admin'), handleUpload(upload.array('images', 5)), async (req, res) => {
  try {
    console.log('Product update request received')
    console.log('Body:', req.body)
    console.log('Files:', req.files ? req.files.map(f => ({ name: f.filename, size: f.size })) : 'No files')
    
    const { name, description, price, discount, stock, category, imageUrls } = req.body
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    let images = [...(product.images || [])]
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`)
      images = [...images, ...newImages]
    }
    
    // Handle image URLs
    if (imageUrls) {
      try {
        const urls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls
        if (Array.isArray(urls)) {
          images = [...images, ...urls.filter(url => url && url.trim())]
        }
      } catch (parseError) {
        console.error('Error parsing imageUrls:', parseError)
      }
    }
    
    // Remove duplicates
    images = [...new Set(images)]
    
    product.name = name || product.name
    product.description = description || product.description
    product.price = price ? parseFloat(price) : product.price
    product.discount = discount ? parseFloat(discount) : product.discount
    product.stock = stock ? parseInt(stock) : product.stock
    product.category = category || product.category
    product.images = images.length > 0 ? images : product.images
    
    await product.save()
    res.json(product)
  } catch (error) {
    console.error('Product update error:', error)
    res.status(400).json({ message: error.message || 'Failed to update product' })
  }
})

// Delete product (Manager/Admin only)
router.delete('/:id', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category')
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get product reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const Comment = (await import('../models/Comment.js')).default
    const comments = await Comment.find({
      product: req.params.id,
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
