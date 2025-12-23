import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { 
  Calendar, 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  MapPin,
  Clock
} from 'lucide-react';
import type { Event, Deal } from '../types';

const ServiceProviderDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    address: '',
    price: '',
    link: '',
    category: 'cultural' as const
  });

  const [dealForm, setDealForm] = useState({
    title: '',
    description: '',
    category: 'food' as const,
    price: '',
    original_price: '',
    discount: '',
    valid_until: '',
    link: '',
    business: ''
  });

  useEffect(() => {
    loadUserContent();
  }, []);

  const loadUserContent = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user's events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Load user's deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      setEvents(eventsData || []);
      setDeals(dealsData || []);
    } catch (error) {
      console.error('Error loading user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const eventData = {
        ...eventForm,
        date: eventForm.date,
        time: eventForm.time || null,
        created_by: user.id,
        is_active: true
      };

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
      }

      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        address: '',
        price: '',
        link: '',
        category: 'cultural'
      });
      loadUserContent();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const dealData = {
        ...dealForm,
        valid_until: dealForm.valid_until || null,
        created_by: user.id,
        is_active: true
      };

      if (editingDeal) {
        // Update existing deal
        const { error } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', editingDeal.id);

        if (error) throw error;
      } else {
        // Create new deal
        const { error } = await supabase
          .from('deals')
          .insert([dealData]);

        if (error) throw error;
      }

      setShowDealForm(false);
      setEditingDeal(null);
      setDealForm({
        title: '',
        description: '',
        category: 'food',
        price: '',
        original_price: '',
        discount: '',
        valid_until: '',
        link: '',
        business: ''
      });
      loadUserContent();
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Failed to save deal. Please try again.');
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

      loadUserContent();
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

      loadUserContent();
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal. Please try again.');
    }
  };

  const startEditingEvent = (event: Event) => {
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || '',
      venue: event.venue,
      address: event.address,
      price: event.price || '',
      link: event.link || '',
      category: event.category as any
    });
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const startEditingDeal = (deal: Deal) => {
    setDealForm({
      title: deal.title,
      description: deal.description,
      category: deal.category as any,
      price: deal.price || '',
      original_price: deal.original_price || '',
      discount: deal.discount || '',
      valid_until: deal.valid_until || '',
      link: deal.link || '',
      business: deal.business || ''
    });
    setEditingDeal(deal);
    setShowDealForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your events and deals on Desi Finder
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Deals</p>
                <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{events.length + deals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setShowEventForm(true);
                setEditingEvent(null);
                setEventForm({
                  title: '',
                  description: '',
                  date: '',
                  time: '',
                  venue: '',
                  address: '',
                  price: '',
                  link: '',
                  category: 'cultural'
                });
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
            <button
              onClick={() => {
                setShowDealForm(true);
                setEditingDeal(null);
                setDealForm({
                  title: '',
                  description: '',
                  category: 'food',
                  price: '',
                  original_price: '',
                  discount: '',
                  valid_until: '',
                  link: '',
                  business: ''
                });
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Events ({events.length})</h3>
          </div>
          <div className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first event to the community.</p>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Event</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.venue}
                      </div>
                      {event.price && (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600">{event.price}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => startEditingEvent(event)}
                        className="flex-1 btn-secondary text-sm py-2"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex-1 btn-danger text-sm py-2"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deals Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Deals ({deals.length})</h3>
          </div>
          <div className="p-6">
            {deals.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first deal to help the community save money.</p>
                <button
                  onClick={() => setShowDealForm(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Deal</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <div key={deal.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{deal.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{deal.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      {deal.business && (
                        <div className="flex items-center">
                          <span className="font-medium">{deal.business}</span>
                        </div>
                      )}
                      {deal.price && (
                        <div className="flex items-center">
                          <span className="font-medium text-green-600">{deal.price}</span>
                        </div>
                      )}
                      {deal.valid_until && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Valid until {new Date(deal.valid_until).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => startEditingDeal(deal)}
                        className="flex-1 btn-secondary text-sm py-2"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="flex-1 btn-danger text-sm py-2"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                      className="input"
                    >
                      <option value="cultural">Cultural</option>
                      <option value="religious">Religious</option>
                      <option value="business">Business</option>
                      <option value="social">Social</option>
                      <option value="educational">Educational</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.address}
                    onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="text"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                      placeholder="e.g., $25, Free, $10-15"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                      type="url"
                      value={eventForm.link}
                      onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
                      placeholder="https://..."
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingEvent ? 'Update Event' : 'Add Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
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

      {/* Deal Form Modal */}
      {showDealForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <form onSubmit={handleDealSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={dealForm.title}
                      onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={dealForm.category}
                      onChange={(e) => setDealForm({ ...dealForm, category: e.target.value as any })}
                      className="input"
                    >
                      <option value="food">Food & Dining</option>
                      <option value="travel">Travel</option>
                      <option value="services">Services</option>
                      <option value="shopping">Shopping</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={dealForm.description}
                    onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={dealForm.business}
                    onChange={(e) => setDealForm({ ...dealForm, business: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                    <input
                      type="text"
                      value={dealForm.price}
                      onChange={(e) => setDealForm({ ...dealForm, price: e.target.value })}
                      placeholder="e.g., $15"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                    <input
                      type="text"
                      value={dealForm.original_price}
                      onChange={(e) => setDealForm({ ...dealForm, original_price: e.target.value })}
                      placeholder="e.g., $25"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                    <input
                      type="text"
                      value={dealForm.discount}
                      onChange={(e) => setDealForm({ ...dealForm, discount: e.target.value })}
                      placeholder="e.g., 40% off"
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={dealForm.valid_until}
                      onChange={(e) => setDealForm({ ...dealForm, valid_until: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                      type="url"
                      value={dealForm.link}
                      onChange={(e) => setDealForm({ ...dealForm, link: e.target.value })}
                      placeholder="https://..."
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingDeal ? 'Update Deal' : 'Add Deal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDealForm(false);
                      setEditingDeal(null);
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
  );
};

export default ServiceProviderDashboard;
