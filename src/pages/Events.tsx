import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, DollarSign, ExternalLink, X, Plus, Search as SearchIcon, Edit, Trash2 } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { EventsService } from '../services/eventsService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import type { Event, EventCategory } from '../types';

const Events = () => {
  console.log('🔍 Events component mounted');
  const { events, loading, error, searchEvents, getEventsByCategory, fetchEvents } = useEvents();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    address: '',
    price: '',
    link: '',
    category: 'cultural' as EventCategory
  });

  const categories = [
    { id: 'all', name: 'All Events', color: 'bg-gray-500' },
    { id: 'cultural', name: 'Cultural', color: 'bg-purple-500' },
    { id: 'religious', name: 'Religious', color: 'bg-blue-500' },
    { id: 'business', name: 'Business', color: 'bg-green-500' },
    { id: 'social', name: 'Social', color: 'bg-pink-500' },
    { id: 'educational', name: 'Educational', color: 'bg-yellow-500' }
  ];

  // Handle category and search changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchEvents(searchQuery);
    } else if (selectedCategory !== 'all') {
      getEventsByCategory(selectedCategory);
    }
    // Don't call fetchEvents() here as it's already called in the hook
  }, [selectedCategory, searchQuery, searchEvents, getEventsByCategory]);

  // Update filtered events when events change
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: EventCategory) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-500';
  };

  const getCategoryName = (category: EventCategory) => {
    const cat = categories.find(c => c.id === category);
    return cat?.name || 'Other';
  };

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetEventForm = () => {
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
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time || undefined,
        venue: eventForm.venue,
        address: eventForm.address,
        price: eventForm.price || undefined,
        link: eventForm.link || undefined,
        category: eventForm.category,
        source: 'admin' as const,
        is_active: true,
        created_by: user?.id || undefined // Add user ID for tracking
      };

      await EventsService.createEvent(eventData);
      setSubmitSuccess(true);
      resetEventForm();
      
      // Refresh events list
      await fetchEvents();
      
      // Close form after a short delay
      setTimeout(() => {
        setShowEventForm(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting event:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit event');
    } finally {
      setIsSubmitting(false);
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

      // Refresh events list
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const canEditEvent = (event: Event) => {
    if (!isAuthenticated) return false;
    if (isAdmin) return true; // Admin can edit all events
    return event.created_by === user?.id; // Service provider can edit their own events
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Community Events
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Discover upcoming Indian community events and celebrations
            </p>
          </div>
          {isAuthenticated && (
            <button 
              onClick={() => setShowEventForm(true)}
              className="btn-primary flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <SearchIcon className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Filter by Category
            </h3>
            
            {/* Mobile: Horizontal Scrollable Categories */}
            <div className="block sm:hidden">
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as EventCategory | 'all')}
                    className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? `${category.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Desktop: Traditional Grid */}
            <div className="hidden sm:block">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as EventCategory | 'all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? `${category.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} events
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new events.
            </p>
          </div>
        ) : !loading && !error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="card hover:shadow-lg transition-shadow duration-200">
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-3 h-3 ${getCategoryColor(event.category)} rounded-full mt-1`}></div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {getCategoryName(event.category)}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>

                {/* Event Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  {event.time && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs text-gray-500 truncate">{event.address}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {event.price}
                    </span>
                  </div>
                  
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <span>Learn More</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Action Button */}
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center mb-3"
                  >
                    View Event Details
                  </a>
                )}

                {/* Edit/Delete Buttons for Service Providers */}
                {canEditEvent(event) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // TODO: Implement edit functionality
                        alert('Edit functionality coming soon!');
                      }}
                      className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="flex-1 btn-danger text-sm py-2 flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

      </div>

      {/* Event Submission Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Submit an Event</h2>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  resetEventForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="p-6 space-y-6">
              {/* Success Message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700">Event submitted successfully! Thank you for your contribution.</p>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}

              {/* Event Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              {/* Event Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe the event"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={eventForm.date}
                    onChange={handleEventFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={eventForm.time}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Venue and Address */}
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={eventForm.venue}
                  onChange={handleEventFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Event venue name"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={eventForm.address}
                  onChange={handleEventFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Full address"
                />
              </div>

              {/* Price and Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={eventForm.price}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Free, $25, $50-100"
                  />
                </div>
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Link
                  </label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    value={eventForm.link}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={eventForm.category}
                  onChange={handleEventFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="cultural">Cultural</option>
                  <option value="religious">Religious</option>
                  <option value="social">Social</option>
                  <option value="business">Business</option>
                  <option value="educational">Educational</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventForm(false);
                    resetEventForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner w-4 h-4"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Submit Event</span>
                    </>
                  )}
          </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
