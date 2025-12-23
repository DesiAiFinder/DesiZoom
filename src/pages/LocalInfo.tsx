import { useEffect } from 'react';
import { MapPin, Phone, Globe, Trash2, Recycle, Leaf, Building, Users } from 'lucide-react';
import { useLocalInfo } from '../hooks/useLocalInfo';
import type { LocalInfo } from '../types';

const LocalInfo = () => {
  console.log('🔍 LocalInfo component mounted');
  const { localInfo, cityInfo, loading, error, getUtilities, getEmergencyContacts, getGovernmentServices, getTrashRecycling } = useLocalInfo();

  console.log('📊 LocalInfo state:', { localInfo, cityInfo, loading, error });

  // Load all data on component mount
  useEffect(() => {
    console.log('🔄 Loading all local info data');
    const loadAllData = async () => {
      try {
        await Promise.all([
          getUtilities(),
          getEmergencyContacts(),
          getGovernmentServices(),
          getTrashRecycling()
        ]);
      } catch (err) {
        console.error('Error loading local info:', err);
      }
    };
    
    loadAllData();
  }, [getUtilities, getEmergencyContacts, getGovernmentServices, getTrashRecycling]);

  const getUtilityIcon = (type: string) => {
    switch (type) {
      case 'electric': return '⚡';
      case 'gas': return '🔥';
      case 'water': return '💧';
      case 'internet': return '🌐';
      case 'cable': return '📺';
      default: return '🏢';
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'police': return '🚔';
      case 'fire': return '🚒';
      case 'medical': return '🚑';
      case 'non-emergency': return '📞';
      default: return '📞';
    }
  };

  const getTrashIcon = (type: string) => {
    switch (type) {
      case 'trash': return <Trash2 className="w-5 h-5" />;
      case 'recycling': return <Recycle className="w-5 h-5" />;
      case 'yard-waste': return <Leaf className="w-5 h-5" />;
      default: return <Trash2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Local Information
          </h1>
          <p className="text-gray-600">
            Essential information about your city and local services
          </p>
        </div>

        {/* City Info Card */}
        {cityInfo && (
          <div className="bg-gradient-to-r from-primary-500 to-saffron-500 rounded-lg p-8 text-white mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {cityInfo.name}
              </h2>
              <p className="text-orange-100 mb-4">
                {cityInfo.description}
              </p>
              {cityInfo.website && (
                <a
                  href={cityInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit City Website</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading local information...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* All Information Sections */}
        {!loading && !error && localInfo.length > 0 && (
          <div className="space-y-8">
            {/* Utilities Section */}
            {localInfo.filter(item => item.type === 'utility').length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Building className="w-6 h-6 text-orange-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Utilities</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localInfo.filter(item => item.type === 'utility').map((utility, index) => (
                    <div key={index} className="card">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getUtilityIcon(utility.subtype || '')}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {utility.name}
                          </h4>
                          <div className="space-y-2">
                            {utility.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <a 
                                  href={`tel:${utility.phone}`}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  {utility.phone}
                                </a>
                              </div>
                            )}
                            {utility.website && (
                              <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <a 
                                  href={utility.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  Visit Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Section */}
            {localInfo.filter(item => item.type === 'emergency').length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Phone className="w-6 h-6 text-red-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localInfo.filter(item => item.type === 'emergency').map((contact, index) => (
                    <div key={index} className={`card ${
                      contact.subtype === 'emergency' || contact.subtype === 'police' || contact.subtype === 'fire'
                        ? 'border-red-200 bg-red-50'
                        : ''
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getEmergencyIcon(contact.subtype || '')}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {contact.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a 
                              href={`tel:${contact.phone}`}
                              className={`text-lg font-medium ${
                                contact.subtype === 'emergency' || contact.subtype === 'police' || contact.subtype === 'fire'
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-primary-600 hover:text-primary-700'
                              }`}
                            >
                              {contact.phone}
                            </a>
                          </div>
                          {contact.website && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Globe className="w-4 h-4 text-gray-500" />
                              <a 
                                href={contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Government Section */}
            {localInfo.filter(item => item.type === 'government').length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Government Services</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localInfo.filter(item => item.type === 'government').map((service, index) => (
                    <div key={index} className="card">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {service.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            {service.description}
                          </p>
                          {service.website && (
                            <a 
                              href={service.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                            >
                              <Globe className="w-4 h-4" />
                              <span>Visit Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trash & Recycling Section */}
            {localInfo.filter(item => item.type === 'trash_recycling').length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Trash2 className="w-6 h-6 text-green-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Trash & Recycling</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {localInfo.filter(item => item.type === 'trash_recycling').map((item, index) => (
                    <div key={index} className="card">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          item.subtype === 'waste_management' ? 'bg-gray-100' :
                          item.subtype === 'recycling' ? 'bg-green-100' :
                          'bg-yellow-100'
                        }`}>
                          <div className={`${
                            item.subtype === 'waste_management' ? 'text-gray-600' :
                            item.subtype === 'recycling' ? 'text-green-600' :
                            'text-yellow-600'
                          }`}>
                            {getTrashIcon(item.subtype || '')}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                            {item.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            {item.description}
                          </p>
                          {item.website && (
                            <a 
                              href={item.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                            >
                              <Globe className="w-4 h-4" />
                              <span>Visit Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && localInfo.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No local information available
            </h3>
            <p className="text-gray-600">
              We couldn't find any local information for your area. Please try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalInfo;