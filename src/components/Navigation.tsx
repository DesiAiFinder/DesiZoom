import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Search, Calendar, Gift, Info, ShoppingBag, Radio } from 'lucide-react';
import { useLocationContext } from '../contexts/LocationContext';
import { GeolocationService } from '../utils/geolocation';
import ProfileDropdown from './ProfileDropdown';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { location: userLocation, loading: locationLoading } = useLocationContext();

  const navigationItems = [
    { name: 'Search', href: '/', icon: Search },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Deals', href: '/deals', icon: Gift },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Local Places', href: '/local-places', icon: MapPin },
    { name: 'Radio', href: '/radio', icon: Radio },
    { name: 'Local Info', href: '/local-info', icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Indian-themed logo icon */}
            <div className="relative">
              {/* Main logo container with Indian flag colors */}
              <div className="w-10 h-10 flag-gradient rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 logo-float">
                {/* Ashoka Chakra in center */}
                <div className="w-6 h-6 border-2 border-blue-600 rounded-full relative">
                  {/* 12 spokes for better visibility */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-3 bg-blue-600 origin-bottom"
                      style={{
                        transform: `rotate(${i * 30}deg)`,
                        left: '50%',
                        bottom: '50%',
                        marginLeft: '-1px'
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Decorative dots around logo */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            
            {/* Enhanced text with Indian styling */}
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-green-600 bg-clip-text text-transparent group-hover:from-orange-500 group-hover:via-red-500 group-hover:to-green-500 transition-all duration-300">
                Desi Finder
              </span>
              <span className="text-xs text-gray-500 -mt-1 font-medium">
                INDIAN Community Portal
              </span>
            </div>
            {/* Location Display */}
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="w-3 h-3 text-gray-500" />
              {locationLoading ? (
                <span className="text-xs text-gray-500">Detecting location...</span>
              ) : userLocation ? (
                <span className="text-xs text-gray-600">
                  {GeolocationService.getLocationDisplay(userLocation)}
                </span>
              ) : (
                <span className="text-xs text-gray-500">Location not available</span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <ProfileDropdown />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Side Panel */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Side Panel */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-saffron-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">DF</span>
                    </div>
                    <span className="text-xl font-bold text-gradient">Desi Finder</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Location Display */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {locationLoading ? (
                      <span>Detecting location...</span>
                    ) : userLocation ? (
                      <span>{GeolocationService.getLocationDisplay(userLocation)}</span>
                    ) : (
                      <span>Location not available</span>
                    )}
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 px-4 py-4 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                          isActive(item.href)
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* User Section */}
                <div className="px-4 py-4 border-t border-gray-200">
                  <div className="flex justify-start">
                    <ProfileDropdown mobileMenuPosition="bottom" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
