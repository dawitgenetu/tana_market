import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Eye, X } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
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
    return ['pending', 'paid'].includes(status)
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
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {order.trackingNumber && (
                        <Link to={`/orders/${order.trackingNumber}`}>
                          <Button variant="outline" size="sm" icon={Eye}>
                            Track
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
    </div>
  )
}

export default Orders
