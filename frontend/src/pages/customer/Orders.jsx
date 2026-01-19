import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Eye, X, RotateCcw, Star, CreditCard } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [returnReason, setReturnReason] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(null)
  const [returnReasonType, setReturnReasonType] = useState('')

  const refundReasons = [
    "Changed my mind",
    "Ordered by mistake",
    "Found a better price",
    "Shipping time too long",
    "Other"
  ]

  const returnReasonsList = [
    "Damaged / Defective",
    "Wrong item received",
    "Item not as described",
    "Quality not as expected",
    "Missing parts",
    "Changed my mind",
    "Other"
  ]

  const getReasonsList = (status) => {
    return status === 'delivered' ? returnReasonsList : refundReasons
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    try {
      await api.put(`/orders/${orderId}/cancel`)
      toast.success('Order cancelled successfully')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    }
  }

  const handleReturnRequest = (order) => {
    setSelectedOrder(order)
    setReturnReason('')
    setReturnReasonType('')
    setReturnModalOpen(true)
  }

  const submitReturnRequest = async () => {
    if (!returnReasonType) {
      toast.error('Please select a reason')
      return
    }

    if (returnReasonType === 'Other' && !returnReason.trim()) {
      toast.error('Please provide details for "Other"')
      return
    }

    setSubmittingReturn(true)
    try {
      const finalReason = returnReasonType === 'Other'
        ? returnReason.trim()
        : `${returnReasonType}${returnReason.trim() ? `: ${returnReason.trim()}` : ''}`

      await api.post(`/orders/${selectedOrder._id}/return`, {
        reason: finalReason,
      })
      toast.success('Request submitted successfully')
      setReturnModalOpen(false)
      setSelectedOrder(null)
      setReturnReason('')
      setReturnReasonType('')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmittingReturn(false)
    }
  }

  const handlePayNow = async (order) => {
    setProcessingPayment(order._id)
    try {
      const paymentResponse = await api.post('/payments/initialize', {
        orderId: order._id,
        amount: order.total,
      })

      // Redirect to Chapa payment
      if (paymentResponse.data.checkout_url) {
        window.location.href = paymentResponse.data.checkout_url
      } else {
        toast.error('Payment initialization failed')
        setProcessingPayment(null)
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.error(error.response?.data?.message || 'Failed to initialize payment')
      setProcessingPayment(null)
    }
  }

  const getReturnStatusBadge = (returnRequest) => {
    if (!returnRequest || returnRequest.status === 'none') return null

    const statusMap = {
      requested: { variant: 'warning', label: 'Return Requested' },
      approved: { variant: 'info', label: 'Return Approved' },
      rejected: { variant: 'danger', label: 'Return Rejected' },
      returned: { variant: 'info', label: 'Returned' },
      refunded: { variant: 'success', label: 'Refunded' },
    }

    const statusInfo = statusMap[returnRequest.status] || { variant: 'gray', label: returnRequest.status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pending' },
      paid: { variant: 'info', label: 'Paid' },
      approved: { variant: 'primary', label: 'Approved' },
      shipped: { variant: 'info', label: 'Shipped' },
      delivered: { variant: 'success', label: 'Delivered' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
    }

    const statusInfo = statusMap[status] || { variant: 'gray', label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const canCancel = (status) => {
    // Only allow cancelling orders that are not yet paid
    return status === 'pending'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Start shopping to see your orders here"
            action={
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.trackingNumber || order._id.slice(-8)}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Items:</span> {order.items?.length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {formatCurrency(order.total || 0)}
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <span className="font-medium">Tracking:</span>{' '}
                            <span className="font-mono text-xs">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                      {order.returnRequest && order.returnRequest.status !== 'none' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {getReturnStatusBadge(order.returnRequest)}
                          {order.returnRequest.reason && (
                            <p className="text-sm text-gray-600 mt-1">
                              Reason: {order.returnRequest.reason}
                            </p>
                          )}
                          {order.returnRequest.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">
                              Rejection: {order.returnRequest.rejectionReason}
                            </p>
                          )}
                          {order.returnRequest.refundAmount > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                              Refunded: {formatCurrency(order.returnRequest.refundAmount)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CreditCard}
                          onClick={() => handlePayNow(order)}
                          loading={processingPayment === order._id}
                          disabled={processingPayment === order._id}
                        >
                          Pay Now
                        </Button>
                      )}
                      {order.trackingNumber && (
                        <Link to={`/orders/${order.trackingNumber}`}>
                          <Button variant="outline" size="sm" icon={Eye}>
                            Track
                          </Button>
                        </Link>
                      )}
                      {['paid', 'approved', 'shipped', 'delivered'].includes(order.status) &&
                        (!order.returnRequest || order.returnRequest.status === 'none') && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => handleReturnRequest(order)}
                          >
                            {order.status === 'delivered' ? 'Return' : 'Refund'}
                          </Button>
                        )}
                      {order.status === 'delivered' && (
                        <Link to={`/orders/${order.trackingNumber}`}>
                          <Button variant="outline" size="sm" icon={Star}>
                            Review
                          </Button>
                        </Link>
                      )}
                      {canCancel(order.status) && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={X}
                          onClick={() => handleCancel(order._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false)
          setSelectedOrder(null)
          setReturnReason('')
          setReturnReasonType('')
        }}
        title={`Request ${selectedOrder?.status === 'delivered' ? 'Return' : 'Refund'}`}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Order: {selectedOrder?.trackingNumber || selectedOrder?._id.slice(-8)}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Total: {selectedOrder && formatCurrency(selectedOrder.total || 0)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <select
              value={returnReasonType}
              onChange={(e) => setReturnReasonType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">Select a reason</option>
              {selectedOrder && getReasonsList(selectedOrder.status).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details {returnReasonType !== 'Other' && '(Optional)'}
            </label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Provide more details about your request..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setReturnModalOpen(false)
                setSelectedOrder(null)
                setReturnReason('')
                setReturnReasonType('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReturnRequest}
              loading={submittingReturn}
              disabled={!returnReasonType}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Orders
