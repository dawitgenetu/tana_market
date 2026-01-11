# Product Management Guide

## 🎯 Features Added

### 1. **Image Management**
- ✅ **Image URL Input**: Add product images via URL
- ✅ **File Upload**: Upload images directly from your computer
- ✅ **Multiple Images**: Support for multiple product images
- ✅ **Image Preview**: Preview images before saving
- ✅ **Image Removal**: Remove individual images

### 2. **Category Management**
- ✅ **Predefined Categories**: 20 e-commerce categories
- ✅ **Category Select Box**: Dropdown with icons
- ✅ **Category Icons**: Visual icons for each category
- ✅ **Category Filtering**: Filter products by category

## 📦 E-Commerce Categories

The following categories are available:

1. ⚡ Electronics
2. 👕 Clothing & Apparel
3. 🏠 Home & Kitchen
4. ⚽ Sports & Outdoors
5. 📚 Books & Media
6. 🎮 Toys & Games
7. 💄 Health & Beauty
8. 🚗 Automotive
9. 🍔 Food & Beverages
10. 🪑 Furniture
11. 💍 Jewelry & Accessories
12. 🐾 Pet Supplies
13. 📎 Office Supplies
14. 👶 Baby & Kids
15. 🌱 Garden & Tools
16. 🎸 Musical Instruments
17. 🎨 Art & Crafts
18. ✈️ Travel & Luggage
19. 💻 Computer & Accessories
20. 📱 Mobile Phones & Accessories

## 🖼️ Adding Product Images

### Method 1: Image URL
1. Click "Image URL" button in the product form
2. Enter image URL (e.g., `https://example.com/image.jpg`)
3. Click "Add Another URL" to add more images
4. Preview images appear below
5. Remove URLs by clicking the X button

### Method 2: File Upload
1. Click "Upload File" button in the product form
2. Click the upload area or drag and drop images
3. Select one or multiple image files
4. Preview uploaded images
5. Remove files by hovering and clicking X

### Image Requirements:
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max Size**: 5MB per image
- **Max Images**: 5 images per product
- **Recommended**: 800x800px or larger for best quality

## 📝 Adding a Product

### Steps:
1. Go to **Manager/Admin Dashboard** → **Products**
2. Click **"Add Product"** button
3. Fill in the form:
   - **Product Name**: Required
   - **Description**: Required
   - **Price**: Required (number)
   - **Discount**: Optional (percentage 0-100)
   - **Stock**: Required (number)
   - **Category**: Select from dropdown
   - **Images**: Add via URL or upload

4. Click **"Create"** to save

### Example Product:
```
Name: iPhone 15 Pro
Description: Latest iPhone with A17 Pro chip
Price: 999.99
Discount: 10
Stock: 50
Category: Mobile Phones & Accessories
Images: [Upload or add URLs]
```

## 🔧 Backend Configuration

### Image Storage:
- **Location**: `backend/uploads/products/`
- **URL Path**: `/uploads/products/filename.jpg`
- **Static Serving**: Configured in `server.js`

### API Endpoints:

**Create Product** (Manager/Admin only):
```
POST /api/products
Content-Type: multipart/form-data

Fields:
- name: string
- description: string
- price: number
- discount: number (optional)
- stock: number
- category: string
- images: File[] (optional)
- imageUrls: string[] (optional)
```

**Update Product** (Manager/Admin only):
```
PUT /api/products/:id
Content-Type: multipart/form-data
(Same fields as create)
```

## 🎨 Frontend Components

### Product Form Features:
- ✅ Toggle between URL and Upload methods
- ✅ Real-time image preview
- ✅ Multiple image support
- ✅ Category dropdown with icons
- ✅ Form validation
- ✅ Error handling

### Product Display:
- ✅ Product cards with images
- ✅ Category badges
- ✅ Price display with discount
- ✅ Stock information
- ✅ Edit/Delete actions

## 🚀 Usage Examples

### Adding Product with Image URLs:
1. Select "Image URL" method
2. Enter: `https://example.com/product1.jpg`
3. Click "Add Another URL"
4. Enter: `https://example.com/product2.jpg`
5. Images preview automatically
6. Submit form

### Adding Product with File Upload:
1. Select "Upload File" method
2. Click upload area
3. Select image files from computer
4. Images preview automatically
5. Submit form

### Editing Product Images:
1. Click "Edit" on a product
2. Existing images load automatically
3. Add more images via URL or upload
4. Remove images by clicking X
5. Save changes

## 🔒 Security & Validation

- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Image count limit (5 per product)
- ✅ URL validation
- ✅ Authentication required (Manager/Admin)
- ✅ Role-based access control

## 📁 File Structure

```
frontend/
  src/
    utils/
      categories.js          # Category definitions
    pages/
      manager/
        Products.jsx         # Product management page
      admin/
        Products.jsx         # Uses Manager Products
      customer/
        Products.jsx        # Product browsing with categories

backend/
  routes/
    products.js              # Product API with image upload
  uploads/
    products/                # Image storage directory
  models/
    Product.js               # Product schema
```

## 🐛 Troubleshooting

### Images Not Uploading?
1. Check `backend/uploads/products/` directory exists
2. Verify file permissions
3. Check file size (max 5MB)
4. Verify file type (images only)

### Images Not Displaying?
1. Check image URLs are valid
2. Verify CORS settings for external URLs
3. Check browser console for errors
4. Verify upload path in backend

### Category Not Showing?
1. Categories are predefined in `frontend/src/utils/categories.js`
2. Verify category name matches exactly
3. Check category select dropdown

## 📚 Related Files

- `frontend/src/utils/categories.js` - Category definitions
- `frontend/src/pages/manager/Products.jsx` - Product form
- `backend/routes/products.js` - Product API
- `backend/models/Product.js` - Product model

---

**Need Help?** Check the main README.md or contact support.
