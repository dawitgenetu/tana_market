// Utility function to get correct image URL
// Uses proxy in development, direct URL in production
const getBackendUrl = () => {
  // In development, use proxy (no base URL needed)
  // In production, you might need to set this to your backend URL
  if (import.meta.env.DEV) {
    return '' // Use proxy
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5001'
}

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder-product.jpg'
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // If it starts with /uploads, prepend backend URL or use proxy
  if (imagePath.startsWith('/uploads')) {
    const backendUrl = getBackendUrl()
    return backendUrl ? `${backendUrl}${imagePath}` : imagePath
  }

  // Otherwise return as is (for placeholder images)
  return imagePath
}

export const getLogoUrl = () => {
  return '/logo.png'
}
