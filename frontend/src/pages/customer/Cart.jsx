import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'

const Cart = () => {
  const { items, updateQuantity, removeItem, subtotal, discount, total } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      toast.success('Item removed from cart')
    } else {
      updateQuantity(productId, newQuantity)
    }
  }
  
  const handleRemove = (productId) => {
    removeItem(productId)
    toast.success('Item removed from cart')
  }
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Start adding products to your cart to continue shopping"
            action={
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            }
          />
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const itemPrice = item.discount > 0
                ? item.price * (1 - item.discount / 100)
                : item.price
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <Link to={`/products/${item._id}`} className="flex-shrink-0">
                        <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={item.images?.[0] || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link to={`/products/${item._id}`}>
                              <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            {item.category && (
                              <Badge variant="gray" size="sm" className="mt-1">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 border border-gray-300 rounded-lg min-w-[50px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            {item.discount > 0 ? (
                              <div>
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency(itemPrice * item.quantity)}
                                </span>
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              
              {isAuthenticated ? (
                <Link to="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Please login to checkout
                  </p>
                  <Link to="/login" className="block">
                    <Button className="w-full">Login</Button>
                  </Link>
                </div>
              )}
              
              <Link to="/products" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
