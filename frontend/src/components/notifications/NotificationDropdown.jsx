import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Check, 
  X, 
  Trash2, 
  CheckCheck,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell
} from 'lucide-react'
import useNotificationStore from '../../store/notificationStore'
import { formatDistanceToNow } from 'date-fns'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

const NotificationDropdown = ({ onClose }) => {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore()

  const getNotificationIcon = (type) => {
    const icons = {
      order_placed: Package,
      order_paid: CreditCard,
      order_approved: CheckCircle2,
      order_shipped: Truck,
      order_delivered: CheckCircle2,
      order_cancelled: XCircle,
      payment_success: CheckCircle2,
      payment_failed: XCircle,
      admin_alert: AlertCircle,
      system: Bell,
    }
    return icons[type] || Bell
  }

  const getNotificationColor = (type) => {
    if (type.includes('success') || type.includes('approved') || type.includes('delivered')) {
      return 'text-green-600 bg-green-50'
    }
    if (type.includes('failed') || type.includes('cancelled') || type.includes('rejected')) {
      return 'text-red-600 bg-red-50'
    }
    if (type.includes('shipped')) {
      return 'text-blue-600 bg-blue-50'
    }
    return 'text-primary-600 bg-primary-50'
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    if (notification.link) {
      onClose()
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {unreadNotifications.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div>
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Unread ({unreadNotifications.length})
                  </p>
                </div>
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getNotificationIcon}
                    getColor={getNotificationColor}
                  />
                ))}
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div>
                {unreadNotifications.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Earlier
                    </p>
                  </div>
                )}
                {readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getNotificationIcon}
                    getColor={getNotificationColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const NotificationItem = ({
  notification,
  onClick,
  onMarkRead,
  onDelete,
  getIcon,
  getColor,
}) => {
  const Icon = getIcon(notification.type)
  const colorClass = getColor(notification.type)
  const hasDistinctMessage =
    notification.message && notification.message !== notification.title

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      {notification.link ? (
        <Link
          to={notification.link}
          onClick={() => onClick(notification)}
          className="block p-4"
        >
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </p>
                {!notification.read && (
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                )}
              </div>
              {hasDistinctMessage && (
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </p>
                {!notification.read && (
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                )}
              </div>
              {hasDistinctMessage && (
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-2 flex items-center justify-end space-x-2">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead(notification._id)
            }}
            className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification._id)
          }}
          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default NotificationDropdown
