import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    const { confirmPassword, ...userData } = formData
    const result = await register(userData)
    
    if (result.success) {
      toast.success('Registration successful!')
      navigate('/')
    } else {
      toast.error(result.error || 'Registration failed')
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
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Tana Market Logo" 
              className="h-20 w-auto object-contain"
              style={{ maxHeight: '80px' }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to start shopping</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Full Name"
            icon={User}
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
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
            type="tel"
            label="Phone Number"
            icon={Phone}
            placeholder="+251 9XX XXX XXX"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
          
          <Input
            type="password"
            label="Confirm Password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          
          <div className="flex items-start">
            <input 
              type="checkbox" 
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
              required
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </form>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

export default Register
