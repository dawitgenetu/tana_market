import { useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import NotificationBell from '../notifications/NotificationBell'
import Button from '../ui/Button'

const AdminHeader = ({ onToggleSidebar = () => {} }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <NotificationBell />
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}

export default AdminHeader
