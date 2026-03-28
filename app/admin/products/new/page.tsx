'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useCategories } from '@/contexts/CategoriesContext';
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Package,
  Tag,
  Search,
  TruckIcon,
  Percent,
  AlertCircle,
  Settings,
} from 'lucide-react';

interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  price: string;
  stock: string;
  sku: string;
}

interface ProductImage {
  id: string;
  file: File;
  preview: string;
  isMain: boolean;
}

interface ProductFormData {
  // Basic Info
  name: string;
  category: string;
  subcategory: string;
  item: string;
  brand: string;
  originCountry: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  description: string;

  // Product Specifications
  weight: string;
  ingredients: string;
  skinType: string[];
  expiryDate: string;
  shelfLife: string;
  productCondition: 'NEW' | 'USED' | 'REFURBISHED';
  gtin: string;
  averageRating: number;
  reviewCount: number;

  // Images
  images: ProductImage[];

  // Variants
  variants: ProductVariant[];

  // SEO Fields
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  tags: string;
  bengaliProductName: string;
  bengaliMetaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogImageFile: File | null;
  ogImagePreview: string;
  imageAltTexts: string[];

  // Shipping & Delivery
  shippingWeight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  isFragile: boolean;
  freeShippingEligible: boolean;

  // Discount & Offers
  discountPercentage: string;
  salePrice: string;
  offerStartDate: string;
  offerEndDate: string;
  flashSaleEligible: boolean;

  // Stock Management
  lowStockThreshold: string;
  barcode: string;

  // Additional Options
  returnEligible: boolean;
  codAvailable: boolean;
  preOrderOption: boolean;
  relatedProducts: string;
}

interface Subcategory {
  name: string;
  items: string[];
}

const brands = [
  'Maybelline',
  'L\'Oréal Paris',
  'MAC',
  'Estée Lauder',
  'Clinique',
  'Lancôme',
  'NARS',
  'Urban Decay',
  'Chanel',
  'Dior',
  'Fresh',
  'Neutrogena',
  'CeraVe',
  'The Ordinary',
  'Other',
];

const countries = [
  'Bangladesh (Local)',
  'USA',
  'France',
  'UK',
  'Japan',
  'South Korea',
  'Germany',
  'Italy',
  'Thailand',
  'India',
  'China',
];

const skinTypes = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal', 'All Skin Types'];

export default function NewProductPage() {
  const router = useRouter();
  const { hasPermission } = useAdminAuth();
  const { refreshProducts } = useProducts();
  const { getActiveCategories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transform categories from context to the format needed by the form
  const categoriesData = useMemo(() => {
    return getActiveCategories().map(cat => ({
      name: cat.name,
      subcategories: cat.subcategories,
    }));
  }, [getActiveCategories]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: 'Make Up',
    subcategory: '',
    item: '',
    brand: '',
    originCountry: 'Bangladesh (Local)',
    status: 'active',
    featured: false,
    description: '',
    weight: '',
    ingredients: '',
    skinType: [],
    expiryDate: '',
    shelfLife: '',
    images: [],
    variants: [
      {
        id: '1',
        size: '',
        color: '',
        price: '',
        stock: '',
        sku: '',
      },
    ],
    metaTitle: '',
    metaDescription: '',
    urlSlug: '',
    tags: '',
    bengaliProductName: '',
    bengaliMetaDescription: '',
    focusKeyword: '',
    ogTitle: '',
    ogImageFile: null,
    ogImagePreview: '',
    imageAltTexts: [],
    productCondition: 'NEW',
    gtin: '',
    averageRating: 0,
    reviewCount: 0,
    shippingWeight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    isFragile: false,
    freeShippingEligible: false,
    discountPercentage: '',
    salePrice: '',
    offerStartDate: '',
    offerEndDate: '',
    flashSaleEligible: false,
    lowStockThreshold: '10',
    barcode: '',
    returnEligible: true,
    codAvailable: true,
    preOrderOption: false,
    relatedProducts: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hasPermission(PERMISSIONS.PRODUCTS_CREATE)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to create products.</p>
      </div>
    );
  }

  // Handle Image Upload - Fixed version
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ProductImage[] = [];
    const filesArray = Array.from(files);

    filesArray.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        return;
      }

      // Validate file size (max 10MB — matches server-side limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return;
      }

      const imageId = `${Date.now()}_${index}`;
      const preview = URL.createObjectURL(file);

      newImages.push({
        id: imageId,
        file: file,
        preview: preview,
        isMain: formData.images.length === 0 && index === 0,
      });
    });

    if (newImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        imageAltTexts: [...prev.imageAltTexts, ...Array(newImages.length).fill('')],
      }));

      // Clear error if exists
      if (errors.images) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setFormData(prev => {
      const imageIndex = prev.images.findIndex(img => img.id === imageId);
      const imageToRemove = prev.images[imageIndex];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const updatedImages = prev.images.filter(img => img.id !== imageId);
      const updatedAltTexts = prev.imageAltTexts.filter((_, idx) => idx !== imageIndex);

      // If removed image was main, set first image as main
      if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
        updatedImages[0].isMain = true;
      }

      return { ...prev, images: updatedImages, imageAltTexts: updatedAltTexts };
    });
  };

  const handleSetMainImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isMain: img.id === imageId,
      })),
    }));
  };

  // Handle OG Image Upload
  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('OG Image must be under 5MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      ogImageFile: file,
      ogImagePreview: preview,
    }));
  };

  // Handle Image Alt Text Change
  const handleImageAltTextChange = (index: number, value: string) => {
    setFormData(prev => {
      const newAltTexts = [...prev.imageAltTexts];
      newAltTexts[index] = value;
      return { ...prev, imageAltTexts: newAltTexts };
    });
  };

  // Handle Variants
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      size: '',
      color: '',
      price: '',
      stock: '',
      sku: `SKU-${Date.now()}`,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const handleRemoveVariant = (variantId: string) => {
    if (formData.variants.length <= 1) {
      alert('At least one variant is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId),
    }));
  };

  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === variantId ? { ...v, [field]: value } : v
      ),
    }));
  };

  // Handle Skin Type Selection
  const handleSkinTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      skinType: prev.skinType.includes(type)
        ? prev.skinType.filter(t => t !== type)
        : [...prev.skinType, type],
    }));
  };

  // Auto-generate URL slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      urlSlug: prev.urlSlug === '' ? generateSlug(name) : prev.urlSlug,
      metaTitle: prev.metaTitle === '' ? name : prev.metaTitle,
    }));
  };

  // Calculate sale price based on discount
  const calculateSalePrice = (price: string, discount: string) => {
    if (!price || !discount) return '';
    const priceNum = parseFloat(price);
    const discountNum = parseFloat(discount);
    if (isNaN(priceNum) || isNaN(discountNum)) return '';
    return (priceNum - (priceNum * discountNum / 100)).toFixed(2);
  };

  const handleDiscountChange = (discount: string) => {
    setFormData(prev => {
      const firstVariantPrice = prev.variants[0]?.price || '';
      return {
        ...prev,
        discountPercentage: discount,
        salePrice: calculateSalePrice(firstVariantPrice, discount),
      };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic Info Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Images Validation
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    // Variants Validation
    formData.variants.forEach((variant) => {
      if (!variant.price || parseFloat(variant.price) <= 0) {
        newErrors[`variant_${variant.id}_price`] = 'Valid price is required';
      }
      if (!variant.stock || parseInt(variant.stock) < 0) {
        newErrors[`variant_${variant.id}_stock`] = 'Valid stock is required';
      }
      if (!variant.sku.trim()) {
        newErrors[`variant_${variant.id}_sku`] = 'SKU is required';
      }
    });

    // Specifications Validation
    if (formData.skinType.length === 0) {
      newErrors.skinType = 'Please select at least one skin type';
    }

    // SEO Validation
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should be less than 60 characters';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be less than 160 characters';
    }

    // Stock Management Validation
    if (formData.lowStockThreshold && parseInt(formData.lowStockThreshold) < 0) {
      newErrors.lowStockThreshold = 'Low stock threshold must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix all errors before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload images to MinIO via /api/upload
      const uploadedImageUrls: string[] = [];
      for (const image of formData.images) {
        const uploadForm = new FormData();
        uploadForm.append('file', image.file);
        uploadForm.append('folder', 'products/new');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          const detail = err.detail ? ` (${err.detail})` : '';
          throw new Error(`Image upload failed: ${err.error || 'Unknown error'}${detail}`);
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrls.push(uploadData.url);
      }

      // Reorder so the main image is first
      const mainIndex = formData.images.findIndex(img => img.isMain);
      if (mainIndex > 0) {
        const [mainUrl] = uploadedImageUrls.splice(mainIndex, 1);
        uploadedImageUrls.unshift(mainUrl);

        // Also reorder alt texts
        const [mainAlt] = formData.imageAltTexts.splice(mainIndex, 1);
        formData.imageAltTexts.unshift(mainAlt);
      }

      // Step 1.5: Upload OG Image if exists
      let uploadedOgImageUrl: string | undefined;
      if (formData.ogImageFile) {
        const ogForm = new FormData();
        ogForm.append('file', formData.ogImageFile);
        ogForm.append('folder', 'products/og-images');

        const ogRes = await fetch('/api/upload', {
          method: 'POST',
          body: ogForm,
        });

        if (ogRes.ok) {
          const ogData = await ogRes.json();
          uploadedOgImageUrl = ogData.url;
        }
      }

      // Step 2: Build original price
      const basePrice = formData.variants.length > 0
        ? parseFloat(formData.variants[0].price) || 0
        : 0;

      const originalPrice = formData.discountPercentage
        ? basePrice / (1 - parseFloat(formData.discountPercentage) / 100)
        : formData.salePrice
        ? parseFloat(formData.salePrice)
        : undefined;

      // Step 3: POST product data to /api/products
      const productPayload = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand,
        originCountry: formData.originCountry,
        status: formData.status,
        featured: formData.featured,
        description: formData.description,
        weight: formData.weight || undefined,
        ingredients: formData.ingredients || undefined,
        skinType: formData.skinType.length > 0 ? formData.skinType : undefined,
        expiryDate: formData.expiryDate || undefined,
        shelfLife: formData.shelfLife || undefined,
        images: uploadedImageUrls.map((url, index) => ({
          url,
          alt: formData.imageAltTexts[index] || formData.name,
          title: formData.imageAltTexts[index] || formData.name,
        })),
        variants: formData.variants,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        urlSlug: formData.urlSlug || undefined,
        tags: formData.tags || undefined,
        bengaliName: formData.bengaliProductName || undefined,
        bengaliDescription: formData.bengaliMetaDescription || undefined,
        focusKeyword: formData.focusKeyword || undefined,
        ogTitle: formData.ogTitle || formData.metaTitle || undefined,
        ogImageUrl: uploadedOgImageUrl || undefined,
        canonicalUrl: formData.urlSlug
          ? `https://minsahbeauty.cloud/products/${formData.urlSlug}`
          : undefined,
        condition: formData.productCondition || 'NEW',
        gtin: formData.gtin || undefined,
        averageRating: formData.averageRating || 0,
        reviewCount: formData.reviewCount || 0,
        shippingWeight: formData.shippingWeight || undefined,
        dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height)
          ? formData.dimensions
          : undefined,
        isFragile: formData.isFragile || undefined,
        freeShippingEligible: formData.freeShippingEligible || undefined,
        discountPercentage: formData.discountPercentage || undefined,
        salePrice: formData.salePrice || undefined,
        originalPrice,
        offerStartDate: formData.offerStartDate || undefined,
        offerEndDate: formData.offerEndDate || undefined,
        flashSaleEligible: formData.flashSaleEligible || undefined,
        lowStockThreshold: formData.lowStockThreshold || undefined,
        barcode: formData.barcode || undefined,
        returnEligible: formData.returnEligible || undefined,
        codAvailable: formData.codAvailable || undefined,
        preOrderOption: formData.preOrderOption || undefined,
        relatedProducts: formData.relatedProducts || undefined,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create product');
      }

      await refreshProducts();
      alert('Product created successfully!');
      router.push('/admin/products');
      
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error instanceof Error ? error.message : 'Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDimensionChange = (field: 'length' | 'width' | 'height', value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value,
      },
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600">Create a comprehensive beauty product listing</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Hydrating Face Serum with Hyaluronic Acid"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      category: e.target.value,
                      subcategory: '',
                      item: '',
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categoriesData.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      subcategory: e.target.value,
                      item: '',
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!formData.category}
                >
                  <option value="">Select subcategory</option>
                  {categoriesData
                    .find(cat => cat.name === formData.category)
                    ?.subcategories.map(subcat => (
                      <option key={subcat.name} value={subcat.name}>
                        {subcat.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type/Item
                </label>
                <select
                  id="item"
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!formData.subcategory}
                >
                  <option value="">Select item</option>
                  {categoriesData
                    .find(cat => cat.name === formData.category)
                    ?.subcategories.find(sub => sub.name === formData.subcategory)
                    ?.items.map(item => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  list="brands"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Select or type brand"
                />
                <datalist id="brands">
                  {brands.map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
                {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
              </div>

              <div>
                <label htmlFor="originCountry" className="block text-sm font-medium text-gray-700 mb-1">
                  Origin Country *
                </label>
                <select
                  id="originCountry"
                  name="originCountry"
                  value={formData.originCountry}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex items-center space-x-6 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Product Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Provide a detailed description of the product, its benefits, how to use it, etc."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <ImageIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload product images. Maximum file size: 10MB per image. First image will be the main display.
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                multiple
                className="hidden"
                id="image-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Images
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Supported formats: JPEG, PNG, WebP (Max 10MB each)
              </p>
              {errors.images && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.images}
                </div>
              )}
            </div>

            {formData.images.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Images ({formData.images.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                        image.isMain ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="aspect-square">
                        <img
                          src={image.preview}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {image.isMain && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                          Main
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          {!image.isMain && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(image.id)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
                              title="Set as main image"
                            >
                              <ImageIcon className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.id)}
                            className="p-2 bg-red-500 rounded-full hover:bg-red-600 shadow-lg"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Image Alt Texts Section */}
              <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Image Alt Texts (for SEO)
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Add descriptive alt text for each image to improve search engine visibility
                  </p>
                  <div className="space-y-3">
                    {formData.images.map((image, index) => (
                      <div key={image.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Image {index + 1} - Alt Text {image.isMain && '(Main)'}
                          </label>
                          <input
                            type="text"
                            value={formData.imageAltTexts[index] || ''}
                            onChange={(e) => handleImageAltTextChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            placeholder="Rhode Peptide Lip Tint Ribbon Shade Bangladesh"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Tag className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
                <p className="text-sm text-gray-600">Add different sizes, colors, or variations with individual pricing</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={variant.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Variant #{index + 1}</h3>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Size/Volume
                    </label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={e => handleVariantChange(variant.id, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="e.g., 30ml, 50g"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color/Shade
                    </label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={e => handleVariantChange(variant.id, 'color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="e.g., Beige, Rose"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price (BDT ৳) *
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={e => handleVariantChange(variant.id, 'price', e.target.value)}
                      step="1"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                        errors[`variant_${variant.id}_price`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors[`variant_${variant.id}_price`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`variant_${variant.id}_price`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={e => handleVariantChange(variant.id, 'stock', e.target.value)}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                        errors[`variant_${variant.id}_stock`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors[`variant_${variant.id}_stock`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`variant_${variant.id}_stock`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={e => handleVariantChange(variant.id, 'sku', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                        errors[`variant_${variant.id}_sku`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="SKU-001"
                    />
                    {errors[`variant_${variant.id}_sku`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`variant_${variant.id}_sku`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Product Specifications</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Net Weight/Volume
                </label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 50ml, 100g"
                />
              </div>

              <div>
                <label htmlFor="shelfLife" className="block text-sm font-medium text-gray-700 mb-1">
                  Shelf Life
                </label>
                <input
                  type="text"
                  id="shelfLife"
                  name="shelfLife"
                  value={formData.shelfLife}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 24 months, 2 years"
                />
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (if applicable)
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suitable for Skin Type *
              </label>
              <div className="flex flex-wrap gap-2">
                {skinTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSkinTypeToggle(type)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      formData.skinType.includes(type)
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.skinType && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.skinType}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="productCondition" className="block text-sm font-medium text-gray-700 mb-1">
                Product Condition
              </label>
              <select
                id="productCondition"
                name="productCondition"
                value={formData.productCondition}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="NEW">New</option>
                <option value="USED">Used</option>
                <option value="REFURBISHED">Refurbished</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select product condition for structured data
              </p>
            </div>

            <div>
              <label htmlFor="gtin" className="block text-sm font-medium text-gray-700 mb-1">
                GTIN/EAN/UPC Barcode (Optional)
              </label>
              <input
                type="text"
                id="gtin"
                name="gtin"
                value={formData.gtin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1234567890123"
              />
              <p className="mt-1 text-xs text-gray-500">
                Helps with Google Shopping and product verification
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="averageRating" className="block text-sm font-medium text-gray-700 mb-1">
                  Average Rating (0-5)
                </label>
                <input
                  type="number"
                  id="averageRating"
                  name="averageRating"
                  value={formData.averageRating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  For structured data (if product already has reviews)
                </p>
              </div>
              <div>
                <label htmlFor="reviewCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Review Count
                </label>
                <input
                  type="number"
                  id="reviewCount"
                  name="reviewCount"
                  value={formData.reviewCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients List
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="List all active and inactive ingredients (comma-separated or line by line)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: Aqua, Glycerin, Hyaluronic Acid, Niacinamide, etc.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Fields */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Search className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                maxLength={60}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.metaTitle ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="SEO-optimized title for search engines"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Recommended: 50-60 characters
                </p>
                <p className="text-xs text-gray-500">
                  {formData.metaTitle.length}/60
                </p>
              </div>
              {errors.metaTitle && <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>}
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.metaDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description for search engine results"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Recommended: 150-160 characters
                </p>
                <p className="text-xs text-gray-500">
                  {formData.metaDescription.length}/160
                </p>
              </div>
              {errors.metaDescription && <p className="mt-1 text-sm text-red-600">{errors.metaDescription}</p>}
            </div>

            <div>
              <label htmlFor="bengaliProductName" className="block text-sm font-medium text-gray-700 mb-1">
                বাংলা Product Name
              </label>
              <input
                type="text"
                id="bengaliProductName"
                name="bengaliProductName"
                value={formData.bengaliProductName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="রোড পেপটাইড লিপ টিন্ট"
              />
              <p className="mt-1 text-xs text-gray-500">
                Bengali version of product name for local SEO
              </p>
            </div>

            <div>
              <label htmlFor="bengaliMetaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                বাংলা Meta Description
              </label>
              <textarea
                id="bengaliMetaDescription"
                name="bengaliMetaDescription"
                value={formData.bengaliMetaDescription}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="রোড পেপটাইড লিপ টিন্ট কিনুন সেরা দামে..."
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">০-১৬০ অক্ষর</p>
                <p className="text-xs text-gray-500">
                  {formData.bengaliMetaDescription.length}/160
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="focusKeyword" className="block text-sm font-medium text-gray-700 mb-1">
                Focus Keyword (Main SEO Keyword)
              </label>
              <input
                type="text"
                id="focusKeyword"
                name="focusKeyword"
                value={formData.focusKeyword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="rhode lip tint bangladesh"
              />
              <p className="mt-1 text-xs text-gray-500">
                Main keyword you want to rank for in search engines
              </p>
            </div>

            <div>
              <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Facebook/WhatsApp Title (Open Graph)
              </label>
              <input
                type="text"
                id="ogTitle"
                name="ogTitle"
                value={formData.ogTitle}
                onChange={handleChange}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Auto-filled from Meta Title"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to use Meta Title
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Sharing Image (1200x630px recommended)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleOgImageUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {formData.ogImagePreview && (
                <div className="mt-3">
                  <img
                    src={formData.ogImagePreview}
                    alt="OG Preview"
                    className="w-full max-w-md rounded-lg border border-gray-200"
                  />
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This image appears when sharing on Facebook, WhatsApp, etc.
              </p>
            </div>

            <div>
              <label htmlFor="urlSlug" className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                id="urlSlug"
                name="urlSlug"
                value={formData.urlSlug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="product-url-slug"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL: /products/{formData.urlSlug || 'product-url-slug'}
              </p>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags/Keywords
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="serum, hydrating, anti-aging (comma-separated)"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <TruckIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Shipping & Delivery</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingWeight" className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Weight
                </label>
                <input
                  type="text"
                  id="shippingWeight"
                  name="shippingWeight"
                  value={formData.shippingWeight}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 150g"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Weight with packaging
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Dimensions (L × W × H)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.dimensions.length}
                    onChange={e => handleDimensionChange('length', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="L (cm)"
                  />
                  <input
                    type="text"
                    value={formData.dimensions.width}
                    onChange={e => handleDimensionChange('width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="W (cm)"
                  />
                  <input
                    type="text"
                    value={formData.dimensions.height}
                    onChange={e => handleDimensionChange('height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="H (cm)"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFragile"
                  checked={formData.isFragile}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Fragile Item (Handle with care)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="freeShippingEligible"
                  checked={formData.freeShippingEligible}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Eligible for Free Shipping</span>
              </label>
            </div>
          </div>
        </div>

        {/* Discount & Offers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Percent className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Discount & Offers</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price (BDT ৳)
                </label>
                <input
                  type="number"
                  id="salePrice"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Automatically calculated from discount
                </p>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="flashSaleEligible"
                    checked={formData.flashSaleEligible}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Flash Sale Eligible</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="offerStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Start Date
                </label>
                <input
                  type="datetime-local"
                  id="offerStartDate"
                  name="offerStartDate"
                  value={formData.offerStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="offerEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Offer End Date
                </label>
                <input
                  type="datetime-local"
                  id="offerEndDate"
                  name="offerEndDate"
                  value={formData.offerEndDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Stock Management</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.lowStockThreshold ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock falls below this number
                </p>
                {errors.lowStockThreshold && <p className="mt-1 text-sm text-red-600">{errors.lowStockThreshold}</p>}
              </div>

              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode/UPC
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter barcode number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Additional Options</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="returnEligible"
                  checked={formData.returnEligible}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Return Eligible</span>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="codAvailable"
                  checked={formData.codAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cash on Delivery</span>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="preOrderOption"
                  checked={formData.preOrderOption}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Pre-order Option</span>
              </label>
            </div>

            <div>
              <label htmlFor="relatedProducts" className="block text-sm font-medium text-gray-700 mb-1">
                Related Products
              </label>
              <input
                type="text"
                id="relatedProducts"
                name="relatedProducts"
                value={formData.relatedProducts}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter product IDs separated by commas (e.g., 101, 102, 103)"
              />
              <p className="mt-1 text-xs text-gray-500">
                IDs of related products to show on product page
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky bottom-0">
          <Link
            href="/admin/products"
            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Creating Product...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
