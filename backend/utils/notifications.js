import Notification from '../models/Notification.js'

/**
 * Create a notification for a user
 */
export const createNotification = async (userId, type, title, message, link = null, metadata = {}) => {
  try {
    const normalizedMetadata = { ...metadata }
    if (metadata?.orderId) {
      normalizedMetadata.orderId = metadata.orderId.toString()
    }

    // De-duplicate: if a notification with same user/type/orderId exists, update it instead
    const dedupeQuery = {
      user: userId,
      type,
    }
    if (normalizedMetadata.orderId) {
      dedupeQuery['metadata.orderId'] = normalizedMetadata.orderId
    }

    const existing = normalizedMetadata.orderId
      ? await Notification.findOne(dedupeQuery)
      : null

    if (existing) {
      existing.title = title
      existing.message = message
      existing.link = link
      existing.metadata = normalizedMetadata
      existing.read = false
      await existing.save()
      return existing
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata: normalizedMetadata,
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Create order-related notifications
 */
export const notifyOrderStatusChange = async (order, newStatus, userId = null) => {
  // Get user ID - handle both populated and unpopulated user
  let targetUserId = userId
  if (!targetUserId) {
    targetUserId = order.user?._id || order.user
  }

  // If still no user ID, skip notification
  if (!targetUserId) {
    console.warn('Cannot create notification: No user ID found for order', order._id)
    return null
  }

  const notifications = {
    paid: {
      title: 'Payment Successful',
      message: `Your order ${order.trackingNumber || order._id} has been paid successfully.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    approved: {
      title: 'Order Approved',
      message: `Your order ${order.trackingNumber || order._id} has been approved and is being prepared.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    shipped: {
      title: 'Order Shipped',
      message: `Your order ${order.trackingNumber || order._id} has been shipped and is on its way.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    delivered: {
      title: 'Order Delivered',
      message: `Your order ${order.trackingNumber || order._id} has been delivered successfully.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order ${order.trackingNumber || order._id} has been cancelled.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    return_approved: {
      title: 'Return Request Approved',
      message: `Your return request for order ${order.trackingNumber || order._id} has been approved. Please ship the item back.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    refunded: {
      title: 'Refund Processed',
      message: `Refund for your order ${order.trackingNumber || order._id} has been processed.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    returned: {
      title: 'Return Received',
      message: `Your returned item for order ${order.trackingNumber || order._id} has been received.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
    return_rejected: {
      title: 'Return Request Rejected',
      message: `Your return request for order ${order.trackingNumber || order._id} has been rejected.`,
      link: `/orders/${order.trackingNumber || order._id}`,
    },
  }

  const notification = notifications[newStatus]
  if (notification) {
    await createNotification(
      targetUserId,
      `order_${newStatus}`,
      notification.title,
      notification.message,
      notification.link,
      { orderId: order._id.toString() }
    )
  }
}

/**
 * Notify manager/admin about new paid order
 */
export const notifyNewPaidOrder = async (order) => {
  // This would typically fetch all managers/admins
  // For now, we'll create a notification that can be assigned to managers
  // In a real system, you'd query for users with manager/admin roles

  const notification = await createNotification(
    null, // Will be set when we have manager/admin user IDs
    'order_paid',
    'New Paid Order',
    `New paid order ${order.trackingNumber || order._id} from ${order.user?.name || 'Customer'}`,
    `/manager/orders`,
    { orderId: order._id.toString() }
  )

  return notification
}

/**
 * Notify about payment status
 */
export const notifyPaymentStatus = async (userId, success, orderId, trackingNumber) => {
  if (success) {
    await createNotification(
      userId,
      'payment_success',
      'Payment Successful',
      `Your payment for order ${trackingNumber || orderId} was successful.`,
      `/orders/${trackingNumber || orderId}`,
      { orderId: orderId.toString() }
    )
  } else {
    await createNotification(
      userId,
      'payment_failed',
      'Payment Failed',
      `Your payment for order ${trackingNumber || orderId} failed. Please try again.`,
      `/orders/${trackingNumber || orderId}`,
      { orderId: orderId.toString() }
    )
  }
}

/**
 * Notify admin about system events
 */
export const notifyAdmin = async (adminId, title, message, link = null) => {
  return await createNotification(
    adminId,
    'admin_alert',
    title,
    message,
    link
  )
}
