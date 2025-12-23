import { MapPin, Star, Phone, Globe } from 'lucide-react';
import type { Business } from '../types';
import { GeolocationService } from '../utils/geolocation';

interface PlaceCardProps {
  business: Business;
}

const PlaceCard = ({ business }: PlaceCardProps) => {
  const getPriceLevelText = (level?: number) => {
    if (level === undefined) return 'Any';
    return '$'.repeat(level);
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return 'No rating';
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Business Image */}
      <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden relative group">
        {business.photos && business.photos.length > 0 ? (
          <>
            <img
              src={business.photos[0]}
              alt={business.name}
              className="w-full h-full object-cover business-image transition-opacity duration-500"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            
            {/* Image overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            
            {/* Photo count indicator */}
            {business.photos && business.photos.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                +{business.photos.length - 1} more
              </div>
            )}
          </>
        ) : null}
        
        {/* Fallback placeholder */}
        <div 
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200"
          style={{ display: business.photos && business.photos.length > 0 ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <span className="text-white font-bold text-lg">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-primary-600 text-sm font-medium">No Image Available</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {business.name}
        </h3>
        <p className="text-gray-600 text-sm mb-2">
          {business.address}
        </p>
        {business.distance && (
          <p className="text-sm text-primary-600 font-medium mb-3">
            {GeolocationService.formatDistance(business.distance)} away
          </p>
        )}

        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-4">
          {business.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {business.rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({getRatingStars(business.rating)})
              </span>
            </div>
          )}
          {business.priceLevel && (
            <span className="text-sm font-medium text-gray-700">
              {getPriceLevelText(business.priceLevel)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex-1 btn-secondary flex items-center justify-center space-x-1 text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-outline flex items-center justify-center space-x-1 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${business.placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-primary flex items-center justify-center space-x-1 text-sm"
          >
            <MapPin className="w-4 h-4" />
            <span>Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;

