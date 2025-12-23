import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  ShoppingBag, 
  Calendar, 
  Gift, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  DollarSign,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import type { User as UserType, Product, Event, Deal } from '../types';

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'events' | 'deals'>('products');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    if (userId) {
      loadUserDetails();
    }
  }, [userId, isAdmin, navigate]);

  const loadUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Load user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Load user's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Load user's events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Load user's deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      setUser(userData);
      setProducts(productsData || []);
      setEvents(eventsData || []);
      setDeals(dealsData || []);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      electronics: 'bg-blue-500',
      clothing: 'bg-purple-500',
      home_garden: 'bg-green-500',
      vehicles: 'bg-red-500',
      books: 'bg-yellow-500',
      sports: 'bg-orange-500',
      beauty: 'bg-pink-500',
      food: 'bg-indigo-500',
      services: 'bg-teal-500',
      other: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      electronics: 'Electronics',
      clothing: 'Clothing',
      home_garden: 'Home & Garden',
      vehicles: 'Vehicles',
      books: 'Books',
      sports: 'Sports',
      beauty: 'Beauty',
      food: 'Food',
      services: 'Services',
      other: 'Other'
    };
    return names[category] || 'Other';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600">The requested user could not be found.</p>
          <button
            onClick={() => navigate('/admin')}
            className="btn-primary mt-4"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 font-bold text-xl">
                {user.first_name?.charAt(0)?.toUpperCase()}{user.last_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.first_name} {user.last_name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <User className="w-4 h-4 mr-1" />
                    {user.role === 'admin' ? 'Administrator' : 'Service Provider'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Member since {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
        <div>
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed</h3>
                  <p className="text-gray-600">This user hasn't listed any products yet.</p>
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
                          <span className="text-2xl font-bold text-primary-600">
                            {formatPrice(product.price, product.currency)}
                          </span>
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
                          <a
                            href={`/marketplace#product-${product.id}`}
                            className="flex-1 btn-secondary text-sm py-2 text-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </a>
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
              {events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events created</h3>
                  <p className="text-gray-600">This user hasn't created any events yet.</p>
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
              {deals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deals created</h3>
                  <p className="text-gray-600">This user hasn't created any deals yet.</p>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
