import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Loading from '../../components/ui/Loading'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    salesData: [],
    todaySales: 0,
    todayOrders: 0,
    deliveryStats: {
      avgDeliveryTime: 1440,
      minDeliveryTime: 2,
      maxDeliveryTime: 14400,
      totalOrders: 0
    }
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
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
  
  const formatDeliveryTime = (minutes) => {
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
  
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'info' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'success' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue || 0), icon: DollarSign, color: 'warning' },
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
        <p className="text-gray-600 mt-2">Real-time overview of your e-commerce platform</p>
      </div>
      
      {/* Main Stats */}
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
      
      {/* Today's Sales & Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todaySales || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.todayOrders || 0} orders</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDeliveryTime(Math.round(stats.deliveryStats?.avgDeliveryTime || 1440))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Range: {formatDeliveryTime(stats.deliveryStats?.minDeliveryTime || 2)} - {formatDeliveryTime(stats.deliveryStats?.maxDeliveryTime || 14400)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Orders with Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveryStats?.totalOrders || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total configured</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Overview (Last 30 Days)</h2>
          {stats.salesData && stats.salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Sales (Last 30 Days)</h2>
          {stats.salesData && stats.salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#0ea5e9" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    #{order.trackingNumber || order._id.slice(-8)}
                  </p>
                  <p className="text-sm text-gray-600">{order.user?.name || 'N/A'}</p>
                  {order.estimatedDeliveryTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      Delivery: {formatDeliveryTime(order.estimatedDeliveryTime)}
                    </p>
                  )}
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(order.total || 0)}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No recent orders</p>
          )}
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard
