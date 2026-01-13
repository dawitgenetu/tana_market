import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, CheckCircle2, Circle, Truck, MapPin, RefreshCw, Star, RotateCcw, MessageSquare } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const OrderTracking = () => {
  const { trackingNumber } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [reviews, setReviews] = useState({})
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  
  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/tracking/${trackingNumber}`)
      const orderData = response.data
      setOrder(orderData)
      
      // Check for auto_verify flag or payment status in URL
      const autoVerify = searchParams.get('auto_verify')
      const paymentStatus = searchParams.get('payment')
      const txRef = searchParams.get('tx_ref')
      
      // Automatically verify payment when returning from Chapa or if order is pending with payment reference
      if (orderData.status === 'pending' && orderData.paymentReference) {
        // If returning from Chapa, verify immediately
        if (autoVerify === 'true' || paymentStatus === 'success') {
          await autoVerifyPayment(orderData, txRef || orderData.paymentReference)
        } else {
          // For pending orders, automatically verify after a short delay
          // This handles cases where webhook might be delayed
          setTimeout(async () => {
            // Re-fetch to get latest status
            try {
              const latestResponse = await api.get(`/orders/tracking/${trackingNumber}`)
              const latestOrder = latestResponse.data
              if (latestOrder.status === 'pending' && latestOrder.paymentReference) {
                await autoVerifyPayment(latestOrder, latestOrder.paymentReference)
              }
            } catch (err) {
              console.error('Error re-fetching order:', err)
            }
          }, 2000) // Wait 2 seconds for webhook to process first
        }
      }
      
      // Show success message if payment was auto-verified
      if (paymentStatus === 'success' && searchParams.get('auto_verified') === 'true') {
        toast.success('Payment verified successfully!')
      } else if (paymentStatus === 'failed') {
        toast.error('Payment failed. Please try again.')
      } else if (paymentStatus === 'error') {
        toast.error('Payment verification error. Please contact support.')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const autoVerifyPayment = async (orderData, txRef = null) => {
    // Don't verify if already verifying or if order is not pending
    if (isVerifyingPayment || orderData.status !== 'pending') {
      return false
    }

    setIsVerifyingPayment(true)
    try {
      console.log('Auto-verifying payment for order:', orderData._id, 'tx_ref:', txRef || orderData.paymentReference)
      
      const response = await api.post('/payments/verify-auto', {
        tx_ref: txRef || orderData.paymentReference,
        orderId: orderData._id,
      })

      if (response.data.success) {
        console.log('Payment verified successfully!')
        // Payment verified - refresh order data immediately
        const updatedResponse = await api.get(`/orders/tracking/${trackingNumber}`)
        setOrder(updatedResponse.data)
        
        // Show success message
        if (orderData.status === 'pending' && updatedResponse.data.status === 'paid') {
          toast.success('Payment verified successfully!')
        }
        return true
      } else {
        console.log('Payment verification result:', response.data)
        // If verification failed, it might be that payment isn't ready yet
        // Don't show error, just log it
        return false
      }
    } catch (error) {
      console.error('Auto verification error:', error)
      // Log error but don't show toast - payment might still be processing
      return false
    } finally {
      setIsVerifyingPayment(false)
    }
  }
  
  useEffect(() => {
    fetchOrder()
  }, [trackingNumber])

  useEffect(() => {
    if (order && order.status === 'delivered') {
      fetchReviews()
    }
  }, [order])

  // Auto-verify payment when order is loaded and is pending
  useEffect(() => {
    if (!order || isVerifyingPayment || order.status !== 'pending') return

    const autoVerify = searchParams.get('auto_verify')
    const txRef = searchParams.get('tx_ref')
    
    // If auto_verify flag is set (returning from Chapa), verify immediately
    if (autoVerify === 'true' && order.paymentReference) {
      autoVerifyPayment(order, txRef || order.paymentReference)
    }
    // Note: The fetchOrder function already handles auto-verification for pending orders
  }, [order, searchParams, isVerifyingPayment])

  const fetchReviews = async () => {
    if (!order || !order.items) return
    
    const reviewMap = {}
    for (const item of order.items) {
      try {
        const response = await api.get(`/comments/products/${item.product._id}/my-review`)
        reviewMap[item.product._id] = response.data
      } catch (error) {
        // Review doesn't exist yet, that's okay
        reviewMap[item.product._id] = null
      }
    }
    setReviews(reviewMap)
  }

  const handleReview = (product) => {
    const existingReview = reviews[product._id]
    if (existingReview) {
      setRating(existingReview.rating)
      setComment(existingReview.comment)
    } else {
      setRating(5)
      setComment('')
    }
    setSelectedProduct(product)
    setReviewModalOpen(true)
  }

  const submitReview = async () => {
    if (!comment.trim()) {
      toast.error('Please write a comment')
      return
    }

    setSubmittingReview(true)
    try {
      const existingReview = reviews[selectedProduct._id]
      if (existingReview) {
        await api.put(`/comments/${existingReview._id}`, {
          rating,
          comment: comment.trim(),
        })
        toast.success('Review updated successfully')
      } else {
        await api.post('/comments', {
          productId: selectedProduct._id,
          orderId: order._id,
          rating,
          comment: comment.trim(),
        })
        toast.success('Review submitted successfully. It will be visible after approval.')
      }
      setReviewModalOpen(false)
      setSelectedProduct(null)
      fetchOrder()
      fetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleReturnRequest = () => {
    setReturnReason('')
    setReturnModalOpen(true)
  }

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for return')
      return
    }

    setSubmittingReturn(true)
    try {
      await api.post(`/orders/${order._id}/return`, {
        reason: returnReason.trim(),
      })
      toast.success('Return request submitted successfully')
      setReturnModalOpen(false)
      setReturnReason('')
      fetchOrder()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request')
    } finally {
      setSubmittingReturn(false)
    }
  }

  const getReturnStatusBadge = () => {
    if (!order?.returnRequest || order.returnRequest.status === 'none') return null
    
    const statusMap = {
      requested: { variant: 'warning', label: 'Return Requested' },
      approved: { variant: 'info', label: 'Return Approved' },
      rejected: { variant: 'danger', label: 'Return Rejected' },
      returned: { variant: 'info', label: 'Returned' },
      refunded: { variant: 'success', label: 'Refunded' },
    }
    
    const statusInfo = statusMap[order.returnRequest.status] || { variant: 'gray', label: order.returnRequest.status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }
  
  const verifyPayment = async (txRef) => {
    if (!txRef && !order) return
    
    setVerifying(true)
    try {
      // Use automatic verification endpoint
      const response = await api.post('/payments/verify-auto', {
        tx_ref: txRef || order?.paymentReference,
        orderId: order?._id,
      })
      
      if (response.data.success) {
        toast.success('Payment verified successfully!')
        fetchOrder() // Refresh order data
      } else {
        toast.error(response.data.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error(error.response?.data?.message || 'Failed to verify payment')
    } finally {
      setVerifying(false)
    }
  }
  
  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'paid', label: 'Payment Confirmed' },
    { key: 'approved', label: 'Order Approved' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ]
  
  const getCurrentStepIndex = () => {
    if (!order) return 0
    const index = statusSteps.findIndex(step => step.key === order.status)
    return index >= 0 ? index : 0
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card>
            <p className="text-gray-600 mb-4">Order not found</p>
            <Link to="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }
  
  const currentStep = getCurrentStepIndex()
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/orders">
            <Button variant="ghost" size="sm">← Back to Orders</Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Tracking</h1>
        
        {/* Tracking Number */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
              <p className="text-2xl font-mono font-bold text-gray-900">{order.trackingNumber}</p>
              {order.paymentReference && (
                <p className="text-xs text-gray-500 mt-1">Payment Ref: {order.paymentReference}</p>
              )}
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <Badge variant="primary" size="lg">{order.status.toUpperCase()}</Badge>
              {getReturnStatusBadge()}
              {/* Show verifying badge only when actually verifying */}
              {order.status === 'pending' && order.paymentReference && isVerifyingPayment && (
                <Badge variant="info" className="text-xs">
                  Verifying payment...
                </Badge>
              )}
              {order.status === 'delivered' && 
               (!order.returnRequest || order.returnRequest.status === 'none') && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={RotateCcw}
                  onClick={handleReturnRequest}
                >
                  Request Return
                </Button>
              )}
            </div>
          </div>
        </Card>
        
        {/* Status Timeline */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStep
              const isCurrent = index === currentStep
              
              return (
                <div key={step.key} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                        <Circle className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pb-4 border-l-2 border-gray-200 last:border-0">
                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <p className="text-sm text-primary-600 mt-1">In progress</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
        
        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <span>{order.shippingAddress?.address}</span>
              </p>
              <p>{order.shippingAddress?.city}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Items:</span>
                <span>{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.total || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total || 0)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => {
                const existingReview = reviews[item.product?._id]
                return (
                  <div key={item._id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {order.status === 'delivered' && (
                        <div className="mt-2">
                          {existingReview ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < existingReview.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">
                                {existingReview.status === 'pending' ? '(Pending Approval)' : 'Reviewed'}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReview(item.product)}
                                icon={MessageSquare}
                              >
                                {existingReview.status === 'pending' ? 'Update Review' : 'Edit Review'}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(item.product)}
                              icon={Star}
                            >
                              Write Review
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Return/Refund Request Info */}
        {order.returnRequest && order.returnRequest.status !== 'none' && (
          <Card className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Return/Refund Status</h3>
              {getReturnStatusBadge()}
            </div>
            
            <div className="space-y-4">
              {/* Request Details */}
              {order.returnRequest.reason && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Your Return Reason:</p>
                  <p className="text-sm text-gray-600">{order.returnRequest.reason}</p>
                  {order.returnRequest.requestedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Requested on: {new Date(order.returnRequest.requestedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Status Timeline */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    order.returnRequest.status === 'requested' || 
                    order.returnRequest.status === 'approved' ||
                    order.returnRequest.status === 'returned' ||
                    order.returnRequest.status === 'refunded'
                      ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600">Return Request Submitted</span>
                  {order.returnRequest.requestedAt && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(order.returnRequest.requestedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {order.returnRequest.status === 'approved' || 
                 order.returnRequest.status === 'returned' ||
                 order.returnRequest.status === 'refunded' ? (
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="w-3 h-3 rounded-full bg-primary-600" />
                    <span className="text-sm text-gray-600">Return Approved</span>
                    {order.returnRequest.approvedAt && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(order.returnRequest.approvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : null}

                {order.returnRequest.status === 'returned' || 
                 order.returnRequest.status === 'refunded' ? (
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="w-3 h-3 rounded-full bg-primary-600" />
                    <span className="text-sm text-gray-600">Item Returned</span>
                    {order.returnRequest.returnedAt && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(order.returnRequest.returnedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : null}

                {order.returnRequest.status === 'refunded' ? (
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="w-3 h-3 rounded-full bg-green-600" />
                    <span className="text-sm font-medium text-green-600">Refund Processed</span>
                    {order.returnRequest.refundedAt && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(order.returnRequest.refundedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : null}

                {order.returnRequest.status === 'rejected' ? (
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span className="text-sm text-red-600">Return Request Rejected</span>
                    {order.returnRequest.rejectedAt && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(order.returnRequest.rejectedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Rejection Reason */}
              {order.returnRequest.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{order.returnRequest.rejectionReason}</p>
                </div>
              )}

              {/* Refund Details */}
              {order.returnRequest.refundAmount > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700 mb-2">Refund Details</p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(order.returnRequest.refundAmount)}
                    </p>
                    {order.returnRequest.refundReference && (
                      <p className="text-sm text-green-600">
                        <span className="font-medium">Reference:</span> {order.returnRequest.refundReference}
                      </p>
                    )}
                    {order.returnRequest.refundedAt && (
                      <p className="text-xs text-green-600">
                        Processed on: {new Date(order.returnRequest.refundedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false)
          setSelectedProduct(null)
          setRating(5)
          setComment('')
        }}
        title={reviews[selectedProduct?._id] ? 'Update Review' : 'Write a Review'}
      >
        <div className="space-y-4">
          {selectedProduct && (
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <img
                src={selectedProduct.images?.[0] || '/placeholder-product.jpg'}
                alt={selectedProduct.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
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
                setReviewModalOpen(false)
                setSelectedProduct(null)
                setRating(5)
                setComment('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              loading={submittingReview}
              disabled={!comment.trim()}
            >
              {reviews[selectedProduct?._id] ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false)
          setReturnReason('')
        }}
        title="Request Return/Refund"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Order: {order?.trackingNumber || order?._id.slice(-8)}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Total: {order && formatCurrency(order.total || 0)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Return/Refund *
            </label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Please explain why you want to return this order..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setReturnModalOpen(false)
                setReturnReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReturnRequest}
              loading={submittingReturn}
              disabled={!returnReason.trim()}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OrderTracking
