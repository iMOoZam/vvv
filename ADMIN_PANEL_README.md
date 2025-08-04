# Admin Panel - Product Management

## Overview

The admin panel provides comprehensive product management functionality for the TakShop e-commerce platform. Administrators can add, edit, and remove products through an intuitive web interface.

## Features

### 🔐 Authentication

- Admin-only access with JWT token authentication
- Role-based permissions (admin vs user)
- Secure API endpoints with proper authorization

### 📦 Product Management

- **Add New Products**: Complete form with all product details
- **Edit Existing Products**: Modify any product information
- **Delete Products**: Remove products with confirmation
- **View Product List**: See all products with key information

### 📊 Dashboard Statistics

- Total number of users
- Total number of products
- Number of admin users
- Number of regular users

### 👥 User Management

- View all registered users
- See user roles and information
- Delete users (with confirmation)

## Product Form Fields

### Required Fields

- **نام محصول (Product Name)**: The name of the product
- **دسته‌بندی (Category)**: Product category selection
  - پردازنده (CPU)
  - کارت گرافیک (GPU)
  - رم (RAM)
  - هارد دیسک (Storage)
  - مادربورد (Motherboard)
  - پاور (Power Supply)
- **قیمت (Price)**: Price in Iranian Toman
- **موجودی (Stock)**: Available quantity

### Optional Fields

- **توضیحات (Description)**: Detailed product description
- **لینک تصویر (Image URL)**: Link to product image

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Add new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Users

- `GET /api/users` - Get all users (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## How to Use

### 1. Access Admin Panel

1. Navigate to `admin.html`
2. Login with admin credentials
3. Ensure you have admin role permissions

### 2. Add New Product

1. Click "افزودن محصول جدید" (Add New Product) button
2. Fill in the required fields
3. Add optional description and image URL
4. Click "افزودن محصول" (Add Product)

### 3. Edit Product

1. Find the product in the product list
2. Click the edit (pencil) icon
3. Modify the desired fields
4. Click "ذخیره تغییرات" (Save Changes)

### 4. Delete Product

1. Find the product in the product list
2. Click the delete (trash) icon
3. Confirm the deletion

## Security Features

- **JWT Authentication**: All admin operations require valid JWT tokens
- **Role Verification**: Only users with admin role can access admin functions
- **Input Validation**: Server-side validation for all product data
- **CSRF Protection**: Form submission includes proper headers

## Error Handling

The admin panel includes comprehensive error handling:

- Network errors
- Authentication failures
- Validation errors
- Server errors
- User-friendly error messages in Persian

## Responsive Design

The admin panel is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## File Structure

```
admin.html          # Admin panel HTML interface
admin.js            # Admin panel JavaScript functionality
server.js           # Backend API endpoints
styles.css          # Global styles
```

## Dependencies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Icons**: Font Awesome
- **Fonts**: Vazirmatn (Persian font)

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Notes

- All text is in Persian (Farsi)
- Prices are displayed in Iranian Toman
- Product images should be accessible URLs
- Stock quantities must be non-negative integers
- Product names and descriptions support Persian text
