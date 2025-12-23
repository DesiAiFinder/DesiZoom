import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, UserPlus, Settings, LogOut, Shield, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileDropdownProps {
  mobileMenuPosition?: 'top' | 'bottom';
}

const ProfileDropdown = ({ mobileMenuPosition }: ProfileDropdownProps = {}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Calculate position based on available space
  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 300; // Approximate dropdown height
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      
      // Position above if we're in mobile menu at bottom or not enough space below
      if (mobileMenuPosition === 'bottom' || spaceBelow < dropdownHeight) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isOpen, mobileMenuPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close on scroll to prevent misalignment
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleDashboardClick = () => {
    setIsOpen(false);
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-target"
        aria-label="Profile menu"
      >
        {isAuthenticated ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-primary-600 font-semibold text-sm">
            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${
            mobileMenuPosition === 'bottom' ? 'left-0' : 'right-0'
          } w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100] max-h-[85vh] overflow-y-auto ${
            position === 'top' 
              ? 'bottom-full mb-2' 
              : 'top-full mt-2'
          } ${mobileMenuPosition === 'bottom' ? 'sm:w-64 w-[calc(100vw-2rem)]' : ''}`}
          style={{
            maxWidth: mobileMenuPosition === 'bottom' ? 'calc(100vw - 2rem)' : '16rem'
          }}
        >
          {isAuthenticated ? (
            <>
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-semibold">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isAdmin 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isAdmin ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Service Provider
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleDashboardClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                </button>

                {!isAdmin && (
                  <Link
                    to="/my-listings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <ShoppingBag className="w-4 h-4 mr-3 text-gray-400" />
                    My Listings
                  </Link>
                )}

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest User Menu */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Welcome to Desi Finder</p>
                <p className="text-xs text-gray-500">Sign in to access all features</p>
              </div>

              <div className="py-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4 mr-3 text-gray-400" />
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-3 text-gray-400" />
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
