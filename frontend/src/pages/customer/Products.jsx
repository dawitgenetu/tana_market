import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List } from 'lucide-react'
import api from '../../utils/api'
import { formatCurrency } from '../../utils/currency'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import { Package } from 'lucide-react'
import { PRODUCT_CATEGORIES, getCategoryIcon } from '../../utils/categories'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories] = useState(PRODUCT_CATEGORIES) // Use predefined categories
  const [viewMode, setViewMode] = useState('grid')
  
  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchTerm])
  
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (searchTerm) params.search = searchTerm
      
      const response = await api.get('/products', { params })
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Browse our complete product catalog</p>
        </div>
        
        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryIcon(cat)} {cat}
                </option>
              ))}
            </select>
            
            {/* View Mode */}
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Card>
        
        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/products/${product._id}`}>
                  <Card className={`group cursor-pointer h-full flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
                    <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square mb-4'}`}>
                      <img
                        src={product.images?.[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                    <div className={viewMode === 'list' ? 'ml-4 flex-1' : ''}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className={`text-sm text-gray-600 mb-4 ${viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'}`}>
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discount > 0 ? (
                            <div>
                              <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(product.price * (1 - product.discount / 100))}
                              </span>
                              <span className="text-sm text-gray-500 line-through ml-2">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                        <Button size="sm">View</Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
