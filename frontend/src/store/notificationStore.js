import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../utils/api'

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      loading: false,
      lastChecked: null,
      
      // Fetch notifications
      fetchNotifications: async (unreadOnly = false) => {
        set({ loading: true })
        try {
          const response = await api.get(`/notifications?unreadOnly=${unreadOnly}&limit=50`)
          set({ 
            notifications: response.data || [],
            loading: false,
            lastChecked: new Date().toISOString(),
          })
          await get().fetchUnreadCount()
        } catch (error) {
          console.error('Error fetching notifications:', error)
          set({ loading: false })
        }
      },
      
      // Fetch unread count
      fetchUnreadCount: async () => {
        try {
          const response = await api.get('/notifications/unread/count')
          set({ unreadCount: response.data.count || 0 })
        } catch (error) {
          console.error('Error fetching unread count:', error)
        }
      },
      
      // Mark notification as read
      markAsRead: async (notificationId) => {
        try {
          await api.put(`/notifications/${notificationId}/read`)
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n._id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }))
        } catch (error) {
          console.error('Error marking notification as read:', error)
        }
      },
      
      // Mark all as read
      markAllAsRead: async () => {
        try {
          await api.put('/notifications/read-all')
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }))
        } catch (error) {
          console.error('Error marking all as read:', error)
        }
      },
      
      // Delete notification
      deleteNotification: async (notificationId) => {
        try {
          await api.delete(`/notifications/${notificationId}`)
          set((state) => {
            const notification = state.notifications.find((n) => n._id === notificationId)
            return {
              notifications: state.notifications.filter((n) => n._id !== notificationId),
              unreadCount: notification && !notification.read 
                ? Math.max(0, state.unreadCount - 1) 
                : state.unreadCount,
            }
          })
        } catch (error) {
          console.error('Error deleting notification:', error)
        }
      },
      
      // Add notification (for real-time updates)
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },
      
      // Clear notifications
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 })
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        lastChecked: state.lastChecked 
      }),
    }
  )
)

export default useNotificationStore
