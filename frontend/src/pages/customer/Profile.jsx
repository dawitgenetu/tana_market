import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.put('/users/profile', formData)
      updateUser(response.data)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-20 w-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
                <p className="text-gray-600">{user?.email}</p>
                {user?.role && (
                  <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    {user.role.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                icon={User}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <Input
                type="email"
                label="Email Address"
                icon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled
              />
              
              <Input
                type="tel"
                label="Phone Number"
                icon={Phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              
              <Input
                label="Address"
                icon={MapPin}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              
              <div className="pt-4">
                <Button type="submit" loading={loading} icon={Save}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default Profile
