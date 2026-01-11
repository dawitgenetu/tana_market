import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, Star, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { formatCurrency } from '../../utils/currency'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    happyCustomers: 0,
  })
  
  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [])
  
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=8')
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }
  
  const fetchStats = async () => {
    try {
      const response = await api.get('/stats')
      setStats(response.data || stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep default stats on error
    }
  }
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Tana Market
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Discover premium products with fast, secure delivery. Shop with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => window.location.href = '/products'}
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => window.location.href = '/products'}
              >
                Browse Products
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Products', value: stats.totalProducts, icon: ShoppingBag },
              { label: 'Orders', value: stats.totalOrders, icon: TrendingUp },
              { label: 'Happy Customers', value: stats.happyCustomers, icon: Star },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}+</h3>
                    <p className="text-gray-600">{stat.label}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Discover our most popular items</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/products/${product._id}`}>
                    <Card className="group cursor-pointer h-full flex flex-col">
                      <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100 aspect-square">
                        <img
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.discount > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{product.description}</p>
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
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
