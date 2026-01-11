import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Loading from '../../components/ui/Loading'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    salesData: [],
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data || stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'info' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'success' },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue || 0), icon: DollarSign, color: 'warning' },
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your e-commerce platform</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.salesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{order.trackingNumber || order._id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">{order.user?.name || 'N/A'}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(order.total || 0)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
