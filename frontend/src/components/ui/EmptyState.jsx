const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="mb-4 p-4 bg-gray-100 rounded-full">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-md mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default EmptyState
