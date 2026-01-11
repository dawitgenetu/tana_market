import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, CheckCircle2, Circle, Truck, MapPin } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const OrderTracking = () => {
  const { trackingNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchOrder()
  }, [trackingNumber])
  
  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/tracking/${trackingNumber}`)
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
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
            </div>
            <Badge variant="primary" size="lg">{order.status.toUpperCase()}</Badge>
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
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default OrderTracking
