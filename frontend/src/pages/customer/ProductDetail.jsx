import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Minus, Plus, Heart, Share2 } from 'lucide-react'
import api from '../../utils/api'
import { formatCurrency } from '../../utils/currency'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviews, setReviews] = useState([])
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])
  
  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`)
      setReviews(response.data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }
  
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    
    addItem(product, quantity)
    toast.success('Product added to cart!')
  }
  
  const finalPrice = product?.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product?.price || 0
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }
  
  if (!product) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <Card className="p-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
          
          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.category && (
                <Badge variant="primary" className="mb-2">{product.category}</Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            <Card className="mb-6">
              <div className="mb-4">
                {product.discount > 0 ? (
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatCurrency(finalPrice)}
                      </span>
                      <span className="text-2xl text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge variant="danger">-{product.discount}%</Badge>
                    </div>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
              
              <div className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="label">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      {product.stock || 0} in stock
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    icon={ShoppingCart}
                  >
                    Add to Cart
                  </Button>
                  <Button variant="outline" icon={Heart}>
                    Wishlist
                  </Button>
                  <Button variant="outline" icon={Share2}>
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
