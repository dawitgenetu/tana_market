import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Minus, Plus, Heart, Share2, MessageSquare } from 'lucide-react'
import api from '../../utils/api'
import { formatCurrency } from '../../utils/currency'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviews, setReviews] = useState([])
  const [canReview, setCanReview] = useState(false)
  const [reviewableOrders, setReviewableOrders] = useState([])
  const [myReview, setMyReview] = useState(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const { addItem } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    if (isAuthenticated) {
      checkCanReview()
      fetchMyReview()
    }
  }, [id, isAuthenticated])

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

  const checkCanReview = async () => {
    try {
      const response = await api.get(`/comments/products/${id}/can-review`)
      setCanReview(response.data.canReview)
      setReviewableOrders(response.data.orders || [])
      if (response.data.orders && response.data.orders.length > 0) {
        setSelectedOrderId(response.data.orders[0]._id)
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error)
    }
  }

  const fetchMyReview = async () => {
    try {
      const response = await api.get(`/comments/products/${id}/my-review`)
      setMyReview(response.data)
    } catch (error) {
      // User hasn't reviewed yet, which is fine
      setMyReview(null)
    }
  }

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.error('Please login to write a review')
      navigate('/login')
      return
    }
    if (myReview) {
      setRating(myReview.rating)
      setComment(myReview.comment)
      setSelectedOrderId(myReview.order?._id)
    }
    setReviewModalOpen(true)
  }

  const submitReview = async () => {
    if (!comment.trim()) {
      toast.error('Please write a comment')
      return
    }

    if (!selectedOrderId) {
      toast.error('Please select an order')
      return
    }

    setSubmittingReview(true)
    try {
      if (myReview) {
        // Update existing review
        await api.put(`/comments/${myReview._id}`, {
          rating,
          comment: comment.trim(),
        })
        toast.success('Review updated successfully')
      } else {
        // Create new review
        await api.post('/comments', {
          productId: id,
          orderId: selectedOrderId,
          rating,
          comment: comment.trim(),
        })
        toast.success('Review submitted successfully! It will be visible after approval.')
      }
      setReviewModalOpen(false)
      setRating(5)
      setComment('')
      fetchReviews()
      fetchMyReview()
      checkCanReview()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
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
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg'
                  }}
                />
              </div>
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary-600' : 'border-transparent'
                        }`}
                    >
                      <img
                        src={img || '/placeholder-product.jpg'}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg'
                        }}
                      />
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
                      className={`h-5 w-5 ${i < Math.floor(product.rating || 0)
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
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews ({reviews.length})
            </h2>
            {isAuthenticated && canReview && (
              <Button
                onClick={handleWriteReview}
                icon={MessageSquare}
                variant={myReview ? 'outline' : 'primary'}
              >
                {myReview ? 'Update My Review' : 'Write a Review'}
              </Button>
            )}
            {isAuthenticated && myReview && !canReview && (
              <Button
                onClick={handleWriteReview}
                icon={MessageSquare}
                variant="outline"
              >
                Edit My Review
              </Button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.user?.name || 'Anonymous'}
                        {review.user?._id === user?._id && (
                          <Badge variant="primary" className="ml-2 text-xs">You</Badge>
                        )}
                      </h4>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                              }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  {review.order?.trackingNumber && (
                    <p className="text-xs text-gray-500 mt-2">
                      Order: {review.order.trackingNumber}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet. Be the first to review this product!</p>
              {isAuthenticated && canReview && (
                <Button
                  onClick={handleWriteReview}
                  className="mt-4"
                  icon={MessageSquare}
                >
                  Write the First Review
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Review Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false)
            if (!myReview) {
              setRating(5)
              setComment('')
            }
          }}
          title={myReview ? 'Update Your Review' : 'Write a Review'}
        >
          <div className="space-y-4">
            {reviewableOrders.length > 1 && (
              <div>
                <label className="label">Select Order</label>
                <select
                  value={selectedOrderId || ''}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="input"
                >
                  {reviewableOrders.map((order) => (
                    <option key={order._id} value={order._id}>
                      Order: {order.trackingNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label">Rating *</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                        }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating} out of 5</span>
              </div>
            </div>

            <div>
              <label className="label">Your Review *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={5}
                className="input"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewModalOpen(false)
                  if (!myReview) {
                    setRating(5)
                    setComment('')
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                loading={submittingReview}
                disabled={!comment.trim() || !selectedOrderId}
              >
                {myReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ProductDetail
