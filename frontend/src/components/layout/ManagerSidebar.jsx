import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, RotateCcw, X } from 'lucide-react'

const ManagerSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navItems = [
    { path: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/manager/products', icon: Package, label: 'Products' },
    { path: '/manager/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/manager/returns', icon: RotateCcw, label: 'Returns & Refunds' },
    { path: '/manager/comments', icon: MessageSquare, label: 'Comments' },
  ]
  
  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 min-h-screen transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      aria-label="Manager navigation"
    >
      <div className="p-6 flex items-center justify-between md:justify-start">
        <h2 className="text-lg font-bold text-gray-900">Manager Panel</h2>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="px-4 pb-6 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default ManagerSidebar
