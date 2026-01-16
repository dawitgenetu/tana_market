import { motion } from 'framer-motion'
import { 
  ShoppingBag, 
  Shield, 
  Truck, 
  Star, 
  Target, 
  Zap, 
  Heart,
  CheckCircle,
  Award,
  Globe,
  Lock,
  CreditCard,
  Package
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'

const About = () => {
  const features = [
    {
      icon: ShoppingBag,
      title: 'Wide Product Range',
      description: 'Browse through thousands of quality products across 20+ categories',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with Chapa payment gateway',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery with real-time order tracking',
    },
    {
      icon: Star,
      title: 'Customer Reviews',
      description: 'Read authentic reviews and ratings from verified customers',
    },
    {
      icon: Package,
      title: 'Order Tracking',
      description: 'Track your orders in real-time with unique TANA tracking numbers',
    },
    {
      icon: CreditCard,
      title: 'Easy Checkout',
      description: 'Streamlined checkout process with multiple payment options',
    },
  ]

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our top priority',
    },
    {
      icon: Award,
      title: 'Quality Products',
      description: 'We ensure only the best products reach you',
    },
    {
      icon: Globe,
      title: 'Local Focus',
      description: 'Supporting local businesses and communities',
    },
    {
      icon: Lock,
      title: 'Security & Privacy',
      description: 'Your data and transactions are always protected',
    },
  ]

  const stats = [
    { number: '1000+', label: 'Products' },
    { number: '5000+', label: 'Happy Customers' },
    { number: '20+', label: 'Categories' },
    { number: '99%', label: 'Satisfaction Rate' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">About Tana Market</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Your trusted e-commerce platform for quality products. We're committed to providing 
              an exceptional shopping experience with secure payments, fast delivery, and outstanding customer service.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-8 w-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize online shopping in Ethiopia by providing a seamless, secure, and 
                user-friendly e-commerce platform that connects customers with quality products 
                while supporting local businesses and communities.
              </p>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To become Ethiopia's leading e-commerce platform, known for innovation, reliability, 
                and exceptional customer service. We aim to make online shopping accessible, 
                convenient, and enjoyable for everyone.
              </p>
            </Card>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-gray-600">Numbers that speak for themselves</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Tana Market?</h2>
            <p className="text-gray-600">Discover what makes us different</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <value.icon className="h-8 w-8 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-br from-primary-600 to-teal-600 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
              <p className="text-primary-100 mb-8 text-lg">
                Join thousands of satisfied customers and discover quality products today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                    Browse Products
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default About
