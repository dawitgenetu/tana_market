import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, CreditCard, Truck } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'

const Checkout = () => {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: 'Bahir Dar',
    phone: user?.phone || '',
    notes: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create order
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.discount > 0
            ? item.price * (1 - item.discount / 100)
            : item.price,
        })),
        shippingAddress: shippingInfo,
        total,
      }

      const response = await api.post('/orders', orderData)
      const order = response.data

      // Initialize payment
      const paymentResponse = await api.post('/payments/initialize', {
        orderId: order._id,
        amount: total,
      })

      // Clear cart after successful order creation
      clearCart()

      // Redirect to Chapa payment
      if (paymentResponse.data.checkout_url) {
        window.location.href = paymentResponse.data.checkout_url
      } else {
        toast.error('Payment initialization failed')
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.response?.data?.message || 'Checkout failed')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Full Address"
                    placeholder="Street address, apartment, suite, etc."
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City (Only Bahir Dar Supported)"
                      placeholder="Bahir Dar"
                      value={shippingInfo.city}
                      readOnly
                      required
                    />
                    <Input
                      label="Phone Number (from your profile)"
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      value={shippingInfo.phone}
                      onChange={(e) => {
                        // Allow editing only if no phone is set from profile
                        if (!user?.phone) {
                          const value = e.target.value;
                          if (value === '' || /^\d*$/.test(value)) {
                            setShippingInfo({ ...shippingInfo, phone: value })
                          }
                        }
                      }}
                      readOnly={!!user?.phone}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Delivery Notes (Optional)</label>
                    <textarea
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      className="input min-h-[100px]"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                </div>
                <div className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                  <p className="text-sm text-gray-700">
                    You will be redirected to Chapa payment gateway to complete your payment securely.
                  </p>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => {
                    const itemPrice = item.discount > 0
                      ? item.price * (1 - item.discount / 100)
                      : item.price

                    return (
                      <div key={item._id} className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(itemPrice * item.quantity)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <Badge variant="success">Free</Badge>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  icon={Truck}
                >
                  Complete Order
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
