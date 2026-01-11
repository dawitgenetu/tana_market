import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, ShoppingCart, TrendingUp, MessageSquare } from 'lucide-react'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Loading from '../../components/ui/Loading'

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    totalComments: 0,
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  const fetchStats = async () => {
    try {
      const response = await api.get('/manager/stats')
      setStats(response.data || stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'primary' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingCart, color: 'warning' },
    { label: 'Shipped Orders', value: stats.shippedOrders, icon: TrendingUp, color: 'success' },
    { label: 'Comments', value: stats.totalComments, icon: MessageSquare, color: 'info' },
  ]
  
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
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your operations.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/manager/products" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Manage Products</p>
          </a>
          <a href="/manager/orders" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
            <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">View Orders</p>
          </a>
          <a href="/manager/comments" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Manage Comments</p>
          </a>
        </div>
      </Card>
    </div>
  )
}

export default ManagerDashboard
