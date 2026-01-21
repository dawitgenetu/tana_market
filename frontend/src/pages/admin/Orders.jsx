import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Truck, Clock } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchOrders()
  }, [])
  
  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleApprove = async (orderId) => {
    try {
      await api.put(`/manager/orders/${orderId}/approve`)
      toast.success('Order approved')
      fetchOrders()
    } catch (error) {
      console.error('Approve order error:', error)
      toast.error(error.response?.data?.message || 'Failed to approve order')
    }
  }
  
  const handleShip = async (orderId) => {
    try {
      await api.put(`/manager/orders/${orderId}/ship`)
      toast.success('Order marked as shipped')
      fetchOrders()
    } catch (error) {
      console.error('Ship order error:', error)
      toast.error(error.response?.data?.message || 'Failed to update order')
    }
  }
  
  const formatDeliveryTime = (minutes) => {
    if (!minutes) return 'Not set'
    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    } else {
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    }
  }
  
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pending' },
      paid: { variant: 'info', label: 'Paid' },
      approved: { variant: 'primary', label: 'Approved' },
      shipped: { variant: 'info', label: 'Shipped' },
      delivered: { variant: 'success', label: 'Delivered' },
    }
    const statusInfo = statusMap[status] || { variant: 'gray', label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2">Manage orders and set delivery times</p>
      </div>
      
      {orders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No paid orders found</p>
            <p className="text-sm text-gray-500">Only paid orders are displayed here</p>
          </div>
        </Card>
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.trackingNumber || order._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Customer: {order.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mb-1">Total: {formatCurrency(order.total || 0)}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Delivery Time: {formatDeliveryTime(order.estimatedDeliveryTime)}
                    </span>
                    {order.deliveryTimeSetBy && (
                      <span className="text-xs text-gray-500">
                        (Set by {order.deliveryTimeSetBy?.name || 'Admin'})
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  {order.status === 'paid' && (
                    <Button size="sm" onClick={() => handleApprove(order._id)} icon={CheckCircle}>
                      Approve
                    </Button>
                  )}
                  {order.status === 'approved' && (
                    <Button size="sm" variant="success" onClick={() => handleShip(order._id)} icon={Truck}>
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Badge variant="info">Shipped - Awaiting Delivery</Badge>
                  )}
                  {order.status === 'delivered' && (
                    <Badge variant="success">Delivered</Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrders
