import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign,
  Calendar as CalendarIcon,
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import type { Product, Event, Deal } from '../types';

const MyListings = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'events' | 'deals'>('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category: 'other' as any,
    condition: 'new' as 'new' | 'used' | 'refurbished',
    location: '',
    contact_info: '',
    deal_percentage: '',
    original_price: ''
  });

  const categories = [
    { id: 'electronics', name: 'Electronics', color: 'bg-blue-500' },
    { id: 'clothing', name: 'Clothing', color: 'bg-purple-500' },
    { id: 'home_garden', name: 'Home & Garden', color: 'bg-green-500' },
    { id: 'vehicles', name: 'Vehicles', color: 'bg-red-500' },
    { id: 'books', name: 'Books', color: 'bg-yellow-500' },
    { id: 'sports', name: 'Sports', color: 'bg-orange-500' },
    { id: 'beauty', name: 'Beauty', color: 'bg-pink-500' },
    { id: 'food', name: 'Food', color: 'bg-indigo-500' },
    { id: 'services', name: 'Services', color: 'bg-teal-500' },
    { id: 'other', name: 'Other', color: 'bg-gray-500' }
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyListings();
    }
  }, [isAuthenticated, user]);

  const loadMyListings = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Load deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      setProducts(productsData || []);
      setEvents(eventsData || []);
      setDeals(dealsData || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        deal_percentage: productForm.deal_percentage ? parseFloat(productForm.deal_percentage) : null,
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        created_by: user?.id || null,
        is_active: true
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      setSubmitSuccess(true);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        category: 'other',
        condition: 'new',
        location: '',
        contact_info: '',
        deal_percentage: '',
        original_price: ''
      });
      
      loadMyListings();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitError('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      loadMyListings();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      loadMyListings();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;
      loadMyListings();
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal. Please try again.');
    }
  };

  const startEditingProduct = (product: Product) => {
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      category: product.category as any,
      condition: product.condition,
      location: product.location || '',
      contact_info: product.contact_info,
      deal_percentage: product.deal_percentage?.toString() || '',
      original_price: product.original_price?.toString() || ''
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-500';
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.name || 'Other';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            My Listings
          </h1>
          <p className="text-gray-600">
            Manage your products, events, and deals
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Products ({products.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Events ({events.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('deals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'deals'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span>Deals ({deals.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your listings...</p>
          </div>
        ) : (
          <div>
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My Products</h2>
                  <button
                    onClick={() => {
                      setShowProductForm(true);
                      setEditingProduct(null);
                      setProductForm({
                        title: '',
                        description: '',
                        price: '',
                        currency: 'USD',
                        category: 'other',
                        condition: 'new',
                        location: '',
                        contact_info: '',
                        deal_percentage: '',
                        original_price: ''
                      });
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first product to the marketplace.</p>
                    <button
                      onClick={() => {
                        setShowProductForm(true);
                        setEditingProduct(null);
                      }}
                      className="btn-primary"
                    >
                      List Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className={`w-3 h-3 ${getCategoryColor(product.category)} rounded-full mt-1`}></div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {getCategoryName(product.category)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                              {product.deal_percentage && product.original_price ? (
                                <>
                                  <span className="text-2xl font-bold text-primary-600">
                                    {formatPrice(product.price, product.currency)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(product.original_price, product.currency)}
                                    </span>
                                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                                      {product.deal_percentage}% OFF
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-primary-600">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.condition === 'new' 
                                ? 'bg-green-100 text-green-800' 
                                : product.condition === 'used'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Listed {formatDate(product.created_at)}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditingProduct(product)}
                              className="flex-1 btn-secondary text-sm py-2"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="btn-danger text-sm py-2 px-3"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My Events</h2>
                  <a href="/events" className="btn-primary flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Event</span>
                  </a>
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events created</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first event.</p>
                    <a href="/events" className="btn-primary">
                      Create Your First Event
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {event.description}
                          </p>
                          <div className="space-y-2 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {formatDate(event.date)}
                            </div>
                            {event.address && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {event.address}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={`/events#event-${event.id}`}
                              className="flex-1 btn-secondary text-sm py-2 text-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="btn-danger text-sm py-2 px-3"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My Deals</h2>
                  <a href="/deals" className="btn-primary flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Deal</span>
                  </a>
                </div>

                {deals.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deals created</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first deal.</p>
                    <a href="/deals" className="btn-primary">
                      Create Your First Deal
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deals.map((deal) => (
                      <div key={deal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {deal.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {deal.description}
                          </p>
                          <div className="space-y-2 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              {deal.discount ? `${deal.discount}% off` : 'Special offer'}
                            </div>
                            {deal.business && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {deal.business}
                              </div>
                            )}
                            {deal.valid_until && (
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                Valid until {formatDate(deal.valid_until)}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={`/deals#deal-${deal.id}`}
                              className="flex-1 btn-secondary text-sm py-2 text-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                            <button
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="btn-danger text-sm py-2 px-3"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'List New Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {submitSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    Product {editingProduct ? 'updated' : 'listed'} successfully!
                  </div>
                )}

                {submitError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="input"
                        placeholder="e.g., iPhone 13 Pro Max"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        required
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                        className="input"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="input"
                      placeholder="Describe your product in detail..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={productForm.currency}
                        onChange={(e) => setProductForm({ ...productForm, currency: e.target.value })}
                        className="input"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                      <select
                        required
                        value={productForm.condition}
                        onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as any })}
                        className="input"
                      >
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">Refurbished</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={productForm.location}
                        onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                        className="input"
                        placeholder="e.g., Toronto, ON"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info *</label>
                      <input
                        type="text"
                        required
                        value={productForm.contact_info}
                        onChange={(e) => setProductForm({ ...productForm, contact_info: e.target.value })}
                        className="input"
                        placeholder="Phone number or email"
                      />
                    </div>
                  </div>

                  {/* Deal Fields */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Deal Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.original_price}
                          onChange={(e) => {
                            const originalPrice = e.target.value;
                            const currentPrice = parseFloat(productForm.price);
                            let calculatedDiscount = '';
                            
                            if (originalPrice && currentPrice && parseFloat(originalPrice) > currentPrice) {
                              calculatedDiscount = (((parseFloat(originalPrice) - currentPrice) / parseFloat(originalPrice)) * 100).toFixed(1);
                            }
                            
                            setProductForm({ 
                              ...productForm, 
                              original_price: originalPrice,
                              deal_percentage: calculatedDiscount
                            });
                          }}
                          className="input"
                          placeholder="Original price before discount"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty if no deal</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={productForm.deal_percentage}
                          onChange={(e) => setProductForm({ ...productForm, deal_percentage: e.target.value })}
                          className="input"
                          placeholder="Auto-calculated when you enter original price"
                          readOnly={!!productForm.original_price && !!productForm.price}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {productForm.original_price && productForm.price 
                            ? 'Auto-calculated from prices above' 
                            : 'Leave empty if no deal'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>How it works:</strong>
                      </p>
                      <ul className="text-sm text-blue-800 mt-1 ml-4 list-disc">
                        <li>Enter the <strong>Current Price</strong> (what customers pay)</li>
                        <li>Enter the <strong>Original Price</strong> (price before discount)</li>
                        <li>The <strong>Discount Percentage</strong> will be calculated automatically</li>
                        <li>Leave both deal fields empty if there's no discount</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="btn-primary flex-1"
                    >
                      {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'List Product')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
