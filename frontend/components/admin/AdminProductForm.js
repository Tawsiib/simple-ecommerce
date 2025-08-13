"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../lib/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProductForm = ({ product = null, productId = null, mode = 'create' }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: '',
    original_price: '',
    stock: '',
    category_id: '',
    brand_id: '',
    is_active: true,
    is_featured: false,
    weight: '',
    dimensions: '',
    tags: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    
    if (mode === 'edit' && productId) {
      fetchProduct();
    } else if (product && mode === 'edit') {
      setCurrentProduct(product);
      populateFormData(product);
    }
  }, [product, productId, mode]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/admin/products/${productId}`);
      if (response.data.success) {
        const productData = response.data.data;
        setCurrentProduct(productData);
        populateFormData(productData);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to fetch product data');
    }
  };

  const populateFormData = (productData) => {
    setFormData({
      name: productData.name || '',
      description: productData.description || '',
      short_description: productData.short_description || '',
      sku: productData.sku || '',
      price: productData.price || '',
      original_price: productData.original_price || '',
      stock: productData.stock || '',
      category_id: productData.category_id || '',
      brand_id: productData.brand_id || '',
      is_active: productData.is_active || true,
      is_featured: productData.is_featured || false,
      weight: productData.weight || '',
      dimensions: productData.dimensions || '',
      tags: productData.tags?.join(', ') || ''
    });
    
    if (productData.images) {
      setImages(productData.images);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await apiClient.get('/brands');
      if (response.data.success) {
        setBrands(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      let response;
      if (mode === 'create') {
        response = await apiClient.post('/admin/products', submitData);
      } else {
        response = await apiClient.put(`/admin/products/${currentProduct.id}`, submitData);
      }

      if (response.data.success) {
        toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully`);
        
        // Handle image uploads if there are new images
        if (images.some(img => img.isNew)) {
          await uploadImages(response.data.data.id);
        }
        
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(`Failed to ${mode} product`);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async (productId) => {
    const newImages = images.filter(img => img.isNew);
    
    for (const image of newImages) {
      const formData = new FormData();
      formData.append('image', image.file);
      
      try {
        await apiClient.post(`/admin/products/${productId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {mode === 'create' ? 'Create a new product listing' : 'Update product information'}
          </p>
        </div>
      </div>

      {/* Product form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <textarea
                  id="short_description"
                  name="short_description"
                  rows={3}
                  value={formData.short_description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Full Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Selling Price *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className="block w-full pr-8 border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 sm:text-sm">৳</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="original_price" className="block text-sm font-medium text-gray-700">
                  Original Price
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    id="original_price"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="block w-full pr-8 border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 sm:text-sm">৳</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories & Brands */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Categories & Brands</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">
                  Brand
                </label>
                <select
                  id="brand_id"
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Product Images</h3>
            
            {/* Image upload */}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500">
                    <span>Upload images</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Images</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview || image.url}
                        alt={`Product ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                  Dimensions (cm)
                </label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  placeholder="L x W x H"
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1 block w-full border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="is_featured"
                  name="is_featured"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                  Featured product
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <PlusIcon className="h-4 w-4 mr-2" />
            )}
            {mode === 'create' ? 'Create Product' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
