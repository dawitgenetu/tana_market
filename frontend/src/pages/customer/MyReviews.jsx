import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MessageSquare, Package, Edit, Trash2 } from 'lucide-react'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

const MyReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await api.get('/comments/my-reviews')
      setReviews(response.data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (review) => {
    setSelectedReview(review)
    setRating(review.rating)
    setComment(review.comment)
    setEditModalOpen(true)
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      await api.delete(`/comments/${reviewId}`)
      toast.success('Review deleted successfully')
      fetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review')
    }
  }

  const submitEdit = async () => {
    if (!comment.trim()) {
      toast.error('Please write a comment')
      return
    }

    setSubmitting(true)
    try {
      await api.put(`/comments/${selectedReview._id}`, {
        rating,
        comment: comment.trim(),
      })
      toast.success('Review updated successfully')
      setEditModalOpen(false)
      setSelectedReview(null)
      setRating(5)
      setComment('')
      fetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pending Approval' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
    }
    const statusInfo = statusMap[status] || { variant: 'gray', label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2">Manage your product reviews and ratings</p>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews yet"
            description="You haven't reviewed any products yet. Reviews will appear here after you rate products from your delivered orders."
            action={
              <Link to="/orders">
                <Button>View My Orders</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link to={`/products/${review.product?._id}`}>
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={review.product?.images?.[0] || '/placeholder-product.jpg'}
                            alt={review.product?.name}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          />
                        </div>
                      </Link>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Link to={`/products/${review.product?._id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                              {review.product?.name}
                            </h3>
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({review.rating}/5)</span>
                            {getStatusBadge(review.status)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(review)}
                            icon={Edit}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(review._id)}
                            icon={Trash2}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>Order: {review.order?.trackingNumber || 'N/A'}</span>
                        </div>
                        <span>
                          Reviewed: {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.updatedAt && review.updatedAt !== review.createdAt && (
                          <span>
                            Updated: {new Date(review.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {review.reply && (
                        <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <p className="text-sm font-medium text-primary-700 mb-1">Store Response:</p>
                          <p className="text-sm text-primary-600">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Review Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedReview(null)
            setRating(5)
            setComment('')
          }}
          title="Edit Review"
        >
          <div className="space-y-4">
            {selectedReview && (
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <img
                  src={selectedReview.product?.images?.[0] || '/placeholder-product.jpg'}
                  alt={selectedReview.product?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedReview.product?.name}</h4>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false)
                  setSelectedReview(null)
                  setRating(5)
                  setComment('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitEdit}
                loading={submitting}
                disabled={!comment.trim()}
              >
                Update Review
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default MyReviews
