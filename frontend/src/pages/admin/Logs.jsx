import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'

const AdminLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchLogs()
  }, [])
  
  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs')
      setLogs(response.data || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getActionBadge = (action) => {
    const actionMap = {
      login: { variant: 'success', label: 'Login' },
      logout: { variant: 'info', label: 'Logout' },
      create: { variant: 'primary', label: 'Create' },
      update: { variant: 'warning', label: 'Update' },
      delete: { variant: 'danger', label: 'Delete' },
    }
    const actionInfo = actionMap[action] || { variant: 'gray', label: action }
    return <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>
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
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">Monitor all system activities and user actions</p>
      </div>
      
      <Card>
        <div className="space-y-4">
          {logs.map((log, index) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getActionBadge(log.action)}
                  <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                </div>
                <p className="text-sm text-gray-600">{log.description || log.action}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default AdminLogs
