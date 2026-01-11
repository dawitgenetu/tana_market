// E-commerce Categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Apparel',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Food & Beverages',
  'Furniture',
  'Jewelry & Accessories',
  'Pet Supplies',
  'Office Supplies',
  'Baby & Kids',
  'Garden & Tools',
  'Musical Instruments',
  'Art & Crafts',
  'Travel & Luggage',
  'Computer & Accessories',
  'Mobile Phones & Accessories',
]

export const getCategoryIcon = (category) => {
  const iconMap = {
    'Electronics': '⚡',
    'Clothing & Apparel': '👕',
    'Home & Kitchen': '🏠',
    'Sports & Outdoors': '⚽',
    'Books & Media': '📚',
    'Toys & Games': '🎮',
    'Health & Beauty': '💄',
    'Automotive': '🚗',
    'Food & Beverages': '🍔',
    'Furniture': '🪑',
    'Jewelry & Accessories': '💍',
    'Pet Supplies': '🐾',
    'Office Supplies': '📎',
    'Baby & Kids': '👶',
    'Garden & Tools': '🌱',
    'Musical Instruments': '🎸',
    'Art & Crafts': '🎨',
    'Travel & Luggage': '✈️',
    'Computer & Accessories': '💻',
    'Mobile Phones & Accessories': '📱',
  }
  return iconMap[category] || '📦'
}
