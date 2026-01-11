import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ShoppingBag } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      toast.success('Login successful!')
      // Redirect based on role
      const user = JSON.parse(localStorage.getItem('auth-storage'))?.state?.user
      if (user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user?.role === 'manager') {
        navigate('/manager/dashboard')
      } else {
        navigate('/')
      }
    } else {
      toast.error(result.error || 'Login failed')
    }
    
    setLoading(false)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-0 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl mb-4">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="Email Address"
            icon={Mail}
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <Input
            type="password"
            label="Password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Forgot password?
            </Link>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </form>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

export default Login
