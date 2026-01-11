import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const baseClasses = `bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 ${paddingClasses[padding]} ${className}`
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300' : ''
  
  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
