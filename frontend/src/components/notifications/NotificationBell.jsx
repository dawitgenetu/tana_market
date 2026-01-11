import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useNotificationStore from '../../store/notificationStore'
import NotificationDropdown from './NotificationDropdown'

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { unreadCount, fetchNotifications, fetchUnreadCount } = useNotificationStore()
  
  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications()
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
      fetchNotifications(true) // Only fetch unread
    }, 30000)
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [fetchNotifications, fetchUnreadCount])
  
  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      fetchNotifications()
    }
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
