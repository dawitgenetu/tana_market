import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Button from '../ui/Button'

const ManagerHeader = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'M'}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name || 'Manager'}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}

export default ManagerHeader
