import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { PRODUCT_CATEGORIES, getCategoryIcon } from '../../utils/categories'

const ManagerProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    category: '',
    images: [],
  })
  const [imageUrls, setImageUrls] = useState([''])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [imageMethod, setImageMethod] = useState('url') // 'url' or 'upload'
  
  useEffect(() => {
    fetchProducts()
  }, [])
  
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0')
      return
    }
    
    if (parseInt(formData.stock) < 0) {
      toast.error('Stock cannot be negative')
      return
    }
    
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('price', formData.price)
      submitData.append('discount', formData.discount || '0')
      submitData.append('stock', formData.stock)
      submitData.append('category', formData.category)
      
      // Handle images
      if (imageMethod === 'upload' && uploadedFiles.length > 0) {
        uploadedFiles.forEach((file, index) => {
          submitData.append('images', file, file.name)
        })
        console.log('Uploading files:', uploadedFiles.map(f => f.name))
      }
      
      if (imageMethod === 'url') {
        const validUrls = imageUrls.filter(url => url.trim())
        if (validUrls.length > 0) {
          submitData.append('imageUrls', JSON.stringify(validUrls))
        }
      }
      
      // Log FormData contents for debugging
      console.log('FormData entries:')
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]))
      }
      
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, submitData)
        toast.success('Product updated successfully')
      } else {
        await api.post('/products', submitData)
        toast.success('Product created successfully')
      }
      setIsModalOpen(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Product creation error:', error)
      
      let errorMessage = 'Operation failed. Please check all fields and try again.'
      
      if (!error.response) {
        // Network error - backend not running
        if (error.message?.includes('connect') || error.message?.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.'
        } else {
          errorMessage = error.message || errorMessage
        }
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage
      }
      
      toast.error(errorMessage)
    }
  }
  
  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount || '',
      stock: product.stock,
      category: product.category,
      images: product.images || [],
    })
    if (product.images && product.images.length > 0) {
      setImageUrls(product.images)
      setImageMethod('url')
    }
    setUploadedFiles([])
    setIsModalOpen(true)
  }
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Validate file types
      const validFiles = files.filter(file => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        return validTypes.includes(file.type)
      })
      
      if (validFiles.length !== files.length) {
        toast.error('Some files were skipped. Only images (JPEG, PNG, GIF, WebP) are allowed.')
      }
      
      // Validate file sizes (5MB max)
      const sizeValidFiles = validFiles.filter(file => {
        return file.size <= 5 * 1024 * 1024 // 5MB
      })
      
      if (sizeValidFiles.length !== validFiles.length) {
        toast.error('Some files were skipped. Maximum file size is 5MB.')
      }
      
      if (sizeValidFiles.length > 5) {
        toast.error('Maximum 5 images allowed. Only first 5 will be uploaded.')
        setUploadedFiles(sizeValidFiles.slice(0, 5))
      } else {
        setUploadedFiles(sizeValidFiles)
      }
      
      if (sizeValidFiles.length > 0) {
        toast.success(`${sizeValidFiles.length} file(s) selected`)
      }
    } else {
      setUploadedFiles([])
    }
  }
  
  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }
  
  const addImageUrlField = () => {
    setImageUrls([...imageUrls, ''])
  }
  
  const removeImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls.length > 0 ? newUrls : [''])
  }
  
  const removeUploadedFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }
  
  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await api.delete(`/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      stock: '',
      category: '',
      images: [],
    })
    setImageUrls([''])
    setUploadedFiles([])
    setImageMethod('url')
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); resetForm(); setIsModalOpen(true); }} icon={Plus}>
          Add Product
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg'
                  }}
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                {product.discount > 0 && (
                  <Badge variant="danger">-{product.discount}%</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)} icon={Edit}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(product._id)} icon={Trash2}>
                  Delete
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); resetForm(); }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Discount (%)"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                required
              >
                <option value="">Select a category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Image Upload Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Product Images</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setImageMethod('url')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    imageMethod === 'url'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <LinkIcon className="h-4 w-4 inline mr-1" />
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMethod('upload')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    imageMethod === 'upload'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-1" />
                  Upload File
                </button>
              </div>
            </div>
            
            {imageMethod === 'url' ? (
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImageUrlField}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another URL
                </Button>
                
                {/* Preview URLs */}
                {imageUrls.some(url => url.trim()) && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {imageUrls.filter(url => url.trim()).map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      id="product-image-upload-input"
                    />
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(index)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsModalOpen(false); setEditingProduct(null); resetForm(); }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManagerProducts
