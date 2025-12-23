import { Link } from 'react-router-dom';
import { MapPin, Search, Calendar, Gift, Users } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { GeolocationService } from '../utils/geolocation';

const About = () => {
  const { location, loading: locationLoading } = useGeolocation();

  const quickActions = [
    {
      title: 'Find Indian Groceries',
      description: 'Discover nearby Indian grocery stores and supermarkets',
      icon: '🛒',
      href: '/search?category=grocery'
    },
    {
      title: 'Indian Restaurants',
      description: 'Explore local Indian restaurants and food options',
      icon: '🍽️',
      href: '/search?category=restaurant'
    },
    {
      title: 'Hindu Temples',
      description: 'Find nearby temples and religious centers',
      icon: '🕉️',
      href: '/search?category=temple'
    },
    {
      title: 'Travel Agents',
      description: 'Connect with India travel specialists',
      icon: '✈️',
      href: '/search?category=travel'
    }
  ];

  const stats = [
    { label: 'Businesses Found', value: 'Live Search', icon: Search },
    { label: 'Community Members', value: 'Growing', icon: Users },
    { label: 'Events Listed', value: 'Discover', icon: Calendar },
    { label: 'Active Deals', value: 'Explore', icon: Gift }
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section - Clean Flag Design */}
      <section className="relative">
        {/* Indian Flag Background - Compact */}
        <div className="h-32 flex flex-col">
          {/* Saffron (Orange) - Top third */}
          <div className="h-1/3 bg-orange-500"></div>
          {/* White - Middle third with Ashoka Chakra */}
          <div className="h-1/3 bg-white relative flex items-center justify-center">
            {/* Ashoka Chakra - Blue circle with 24 spokes */}
            <div className="w-8 h-8 border-2 border-blue-600 rounded-full relative">
              {/* 24 spokes */}
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-4 bg-blue-600 origin-bottom"
                  style={{
                    transform: `rotate(${i * 15}deg)`,
                    left: '50%',
                    bottom: '50%',
                    marginLeft: '-1px'
                  }}
                />
              ))}
            </div>
          </div>
          {/* Green - Bottom third */}
          <div className="h-1/3 bg-green-600"></div>
        </div>
      </section>

      {/* Welcome Section - Compact */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome to{' '}
              <span className="text-primary-600">Desi Finder</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl mb-3 text-gray-700 font-medium">
              Your one-stop shop for all Desi needs
            </p>
            
            {/* Description */}
            <p className="text-base mb-4 text-gray-600 max-w-2xl mx-auto">
              Discover Indian businesses, community events, local deals, and connect with your 
              Desi community right in your neighborhood.
            </p>
            
            {/* Location Display */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-600" />
              {locationLoading ? (
                <span className="text-sm text-gray-600">Detecting your location...</span>
              ) : location ? (
                <span className="text-sm text-gray-600">
                  {GeolocationService.getLocationDisplay(location)}
                </span>
              ) : (
                <span className="text-sm text-gray-600">Location not available</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/search"
                className="bg-primary-600 text-white hover:bg-primary-700 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Search className="w-4 h-4" />
                <span>Find Businesses</span>
              </Link>
              <Link
                to="/register"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Users className="w-4 h-4" />
                <span>Join Community</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What are you looking for?
            </h2>
            <p className="text-base text-gray-600">
              Quick access to the most popular searches in your area
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-primary-300"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Upcoming Events
              </h2>
              <p className="text-sm text-gray-600">
                Don't miss out on these community events
              </p>
            </div>
            <Link
              to="/events"
              className="btn-outline flex items-center space-x-2"
            >
              <span>View All Events</span>
              <Calendar className="w-4 h-4" />
            </Link>
          </div>

          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Discover Community Events
            </h3>
            <p className="text-gray-600 mb-6">
              Explore upcoming cultural events, festivals, and community gatherings in your area.
            </p>
            <Link
              to="/events"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Events</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Hot Deals
              </h2>
              <p className="text-sm text-gray-600">
                Exclusive offers from local Desi businesses
              </p>
            </div>
            <Link
              to="/deals"
              className="btn-outline flex items-center space-x-2"
            >
              <span>View All Deals</span>
              <Gift className="w-4 h-4" />
            </Link>
          </div>

          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Discover Amazing Deals
            </h3>
            <p className="text-gray-600 mb-6">
              Find exclusive discounts and special offers from Indian restaurants, grocery stores, and local businesses.
            </p>
            <Link
              to="/deals"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Gift className="w-4 h-4" />
              <span>Browse Deals</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Stay connected with local Desi events, get exclusive deals, and be part of 
            a vibrant community that celebrates our culture.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Register Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
