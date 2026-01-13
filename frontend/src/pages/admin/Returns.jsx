import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, CheckCircle, XCircle, DollarSign, Clock, Package } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const AdminReturns = () => {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReference, setRefundReference] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      // Try admin endpoint first, fallback to manager endpoint
      let response
      try {
        response = await api.get('/admin/returns')
      } catch (adminError) {
        response = await api.get('/manager/returns')
      }
      setReturns(response.data || [])
    } catch (error) {
      console.error('Error fetching returns:', error)
      toast.error('Failed to load return requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (order) => {
    if (!window.confirm(`Approve return request for Order #${order.trackingNumber || order._id.slice(-8)}?`)) {
      return
    }

    try {
      // Try admin endpoint first, fallback to manager endpoint
      try {
        await api.put(`/admin/returns/${order._id}/approve`)
      } catch (adminError) {
        await api.put(`/manager/returns/${order._id}/approve`)
      }
      toast.success('Return request approved')
      fetchReturns()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve return request')
    }
  }

  const handleReject = (order) => {
    setSelectedOrder(order)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    try {
      // Try admin endpoint first, fallback to manager endpoint
      try {
        await api.put(`/admin/returns/${selectedOrder._id}/reject`, {
          rejectionReason: rejectionReason.trim(),
        })
      } catch (adminError) {
        await api.put(`/manager/returns/${selectedOrder._id}/reject`, {
          rejectionReason: rejectionReason.trim(),
        })
      }
      toast.success('Return request rejected')
      setRejectModalOpen(false)
      setSelectedOrder(null)
      setRejectionReason('')
      fetchReturns()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject return request')
    } finally {
      setProcessing(false)
    }
  }

  const handleRefund = (order) => {
    setSelectedOrder(order)
    setRefundAmount(order.total.toString())
    setRefundReference('')
    setRefundModalOpen(true)
  }

  const submitRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount')
      return
    }

    setProcessing(true)
    try {
      // Try admin endpoint first, fallback to manager endpoint
      try {
        await api.put(`/admin/returns/${selectedOrder._id}/refund`, {
          refundAmount: parseFloat(refundAmount),
          refundReference: refundReference.trim() || undefined,
        })
      } catch (adminError) {
        await api.put(`/manager/returns/${selectedOrder._id}/refund`, {
          refundAmount: parseFloat(refundAmount),
          refundReference: refundReference.trim() || undefined,
        })
      }
      toast.success('Refund processed successfully')
      setRefundModalOpen(false)
      setSelectedOrder(null)
      setRefundAmount('')
      setRefundReference('')
      fetchReturns()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process refund')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      requested: { variant: 'warning', label: 'Requested', icon: Clock },
      approved: { variant: 'info', label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'danger', label: 'Rejected', icon: XCircle },
      returned: { variant: 'info', label: 'Returned', icon: Package },
      refunded: { variant: 'success', label: 'Refunded', icon: DollarSign },
    }
    
    const statusInfo = statusMap[status] || { variant: 'gray', label: status, icon: RotateCcw }
    const Icon = statusInfo.icon
    return (
      <Badge variant={statusInfo.variant} className="flex items-center space-x-1">
        <Icon className="h-4 w-4" />
        <span>{statusInfo.label}</span>
      </Badge>
    )
  }

  const getStatusCounts = () => {
    const counts = {
      requested: 0,
      approved: 0,
      rejected: 0,
      returned: 0,
      refunded: 0,
    }
    
    returns.forEach(order => {
      if (order.returnRequest && order.returnRequest.status !== 'none') {
        counts[order.returnRequest.status] = (counts[order.returnRequest.status] || 0) + 1
      }
    })
    
    return counts
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  const statusCounts = getStatusCounts()
  const filteredReturns = returns.filter(order => 
    order.returnRequest && order.returnRequest.status !== 'none'
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Returns & Refunds</h1>
        <p className="text-gray-600 mt-2">Manage customer return requests and process refunds</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">{statusCounts.requested}</p>
            <p className="text-sm text-gray-600">Requested</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-info-600">{statusCounts.approved}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-600">{statusCounts.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-info-600">{statusCounts.returned}</p>
            <p className="text-sm text-gray-600">Returned</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">{statusCounts.refunded}</p>
            <p className="text-sm text-gray-600">Refunded</p>
          </div>
        </Card>
      </div>

      {filteredReturns.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No return requests found</p>
            <p className="text-sm text-gray-500">Return requests will appear here when customers submit them</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.trackingNumber || order._id.slice(-8)}
                      </h3>
                      {getStatusBadge(order.returnRequest.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Customer:</span> {order.user?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Order Total:</span> {formatCurrency(order.total || 0)}
                      </div>
                      <div>
                        <span className="font-medium">Order Date:</span>{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Request Date:</span>{' '}
                        {order.returnRequest.requestedAt
                          ? new Date(order.returnRequest.requestedAt).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>

                    {order.returnRequest.reason && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Return Reason:</p>
                        <p className="text-sm text-gray-600">{order.returnRequest.reason}</p>
                      </div>
                    )}

                    {order.returnRequest.rejectionReason && (
                      <div className="mb-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-600">{order.returnRequest.rejectionReason}</p>
                      </div>
                    )}

                    {order.returnRequest.refundAmount > 0 && (
                      <div className="mb-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700 mb-1">Refund Details:</p>
                        <p className="text-sm text-green-600">
                          Amount: {formatCurrency(order.returnRequest.refundAmount)}
                        </p>
                        {order.returnRequest.refundReference && (
                          <p className="text-sm text-green-600">
                            Reference: {order.returnRequest.refundReference}
                          </p>
                        )}
                        {order.returnRequest.refundedAt && (
                          <p className="text-sm text-green-600">
                            Refunded: {new Date(order.returnRequest.refundedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {order.returnRequest.processedBy && (
                      <p className="text-xs text-gray-500">
                        Processed by: {order.returnRequest.processedBy?.name || 'Admin'}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {order.returnRequest.status === 'requested' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(order)}
                          icon={CheckCircle}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(order)}
                          icon={XCircle}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {order.returnRequest.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRefund(order)}
                        icon={DollarSign}
                      >
                        Process Refund
                      </Button>
                    )}
                    {order.returnRequest.status === 'refunded' && (
                      <Badge variant="success" className="w-full justify-center">
                        Refund Completed
                      </Badge>
                    )}
                    {order.returnRequest.status === 'rejected' && (
                      <Badge variant="danger" className="w-full justify-center">
                        Request Rejected
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => {
          setRefundModalOpen(false)
          setSelectedOrder(null)
          setRefundAmount('')
          setRefundReference('')
        }}
        title="Process Refund"
      >
        <div className="space-y-4">
          {selectedOrder && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">
                Order: {selectedOrder.trackingNumber || selectedOrder._id.slice(-8)}
              </p>
              <p className="text-sm text-gray-600">
                Order Total: {formatCurrency(selectedOrder.total || 0)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount *
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="Enter refund amount"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {selectedOrder && formatCurrency(selectedOrder.total || 0)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Reference (Optional)
            </label>
            <input
              type="text"
              value={refundReference}
              onChange={(e) => setRefundReference(e.target.value)}
              placeholder="Transaction reference, receipt number, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRefundModalOpen(false)
                setSelectedOrder(null)
                setRefundAmount('')
                setRefundReference('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRefund}
              loading={processing}
              disabled={!refundAmount || parseFloat(refundAmount) <= 0}
            >
              Process Refund
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false)
          setSelectedOrder(null)
          setRejectionReason('')
        }}
        title="Reject Return Request"
      >
        <div className="space-y-4">
          {selectedOrder && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">
                Order: {selectedOrder.trackingNumber || selectedOrder._id.slice(-8)}
              </p>
              {selectedOrder.returnRequest.reason && (
                <p className="text-sm text-gray-600">
                  Reason: {selectedOrder.returnRequest.reason}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this return request is being rejected..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRejectModalOpen(false)
                setSelectedOrder(null)
                setRejectionReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={submitRejection}
              loading={processing}
              disabled={!rejectionReason.trim()}
            >
              Reject Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminReturns
