import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const AdminReports = () => {
  const [reports, setReports] = useState({
    sales: [],
    products: [],
    categories: [],
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchReports()
  }, [])
  
  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/reports')
      setReports(response.data || reports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const COLORS = ['#0ea5e9', '#a855f7', '#10b981', '#f59e0b', '#ef4444']
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">View detailed analytics and export reports</p>
        </div>
        <Button icon={Download}>Export PDF</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Report</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reports.sales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reports.categories || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(reports.categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

export default AdminReports
