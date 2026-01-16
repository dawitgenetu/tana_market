import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const parsed = JSON.parse(token)
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth and redirect
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
        console.error('Backend server is not running. Please start the backend server on port 5001.')
        error.message = 'Cannot connect to server. Please make sure the backend is running on port 5001.'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
