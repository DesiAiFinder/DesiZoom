# Desi Finder - Your Community Hub

A comprehensive community portal designed as a "one-stop shop for all Desi needs." Find Indian businesses, events, and community resources in your local area.

## Features

### 🏪 Business Discovery
- **Indian Grocery Stores** - Find nearby Indian supermarkets and specialty food stores
- **Indian Restaurants** - Discover local Indian restaurants, including South Indian, North Indian, and regional cuisines
- **Hindu Temples** - Locate nearby temples and religious centers
- **Travel Agents** - Find travel agencies specializing in India travel, visa services, and tour operators
- **Service Providers** - Discover local handymen, electricians, plumbers, lawn care, and other home services

### 📍 Location-Based Features
- **Geolocation Integration** - Automatically detects user's current location
- **Distance Calculation** - Shows distance in miles from user's location
- **Search Radius** - Configurable search radius (default ~10 miles)
- **Fallback Location** - Uses configurable default coordinates when geolocation is unavailable

### 🎉 Events & Community
- **Static Events** - Curated list of local Indian community events
- **Live Eventbrite Integration** - Real-time event discovery from Eventbrite API
- **Event Details** - Shows event titles, dates, venues, pricing, and direct links
- **Community Focus** - Specifically searches for "Indian community" events

### 💰 Deals & Offers
- **Curated Deals** - Manually curated list of local deals and offers
- **Categorized Offers** - Organized by categories like Food, Travel, Services
- **Direct Links** - Links to deal sources and merchant websites
- **Price Information** - Shows pricing details and discount information

### 🏛️ Local Information Hub
- **City Information** - Displays current city and local area details
- **Utility Contacts** - Quick access to local utility company contact information
- **Emergency Services** - Non-emergency contact numbers for police and fire departments
- **Trash & Recycling** - Information about local waste management services
- **Government Services** - Links to local government websites and services

### 👥 User Registration & Community Building
- **Signup System** - Simple registration form for community members
- **Contact Collection** - Captures name, email, and optional phone number
- **Database Storage** - Secure storage of user information in Supabase
- **Community Updates** - Platform for sending updates and local deals to registered users

### 🔐 Admin Dashboard
- **Secure Access** - Password-protected admin interface
- **User Management** - View and manage registered community members
- **Signup Analytics** - Track registration trends and user engagement
- **Export Functionality** - Export user data to CSV

### 📱 PWA Features
- **Progressive Web App** - Installable on mobile devices
- **Offline Functionality** - Service worker for offline capabilities
- **Responsive Design** - Mobile-friendly interface
- **Fast Loading** - Optimized for quick page loads

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context + Custom Hooks
- **Database**: Supabase (PostgreSQL)
- **APIs**: Google Places API, Eventbrite API
- **PWA**: Vite PWA plugin with Workbox

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google Places API key
- Eventbrite API key (optional)

### 1. Clone and Install

```bash
git clone <repository-url>
cd desi-finder
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
VITE_ADMIN_PASSWORD=your_admin_password
```

### 3. Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the script to create the necessary tables and policies

### 4. Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Places API
3. Create an API key
4. Add the key to your environment variables

### 5. Run the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Keys Setup

### Google Places API
1. Create a project in Google Cloud Console
2. Enable the following APIs:
   - Places API
   - Geocoding API
3. Create credentials (API Key)
4. Restrict the API key to your domain (recommended)

### Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Run the database setup script

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## Project Structure

```
desi-finder/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript definitions
│   ├── data/             # Static JSON data
│   ├── config/           # Configuration files
│   └── styles/           # Global styles
├── supabase-setup.sql    # Database setup script
└── README.md
```

## Features in Detail

### Business Search
- Real-time search using Google Places API
- Smart categorization of Indian businesses
- Distance calculation and sorting
- Filtering by rating, price level, and radius

### Event Management
- Static events from JSON data
- Live Eventbrite integration
- Category filtering and search
- Event details with pricing and links

### User Management
- Simple registration form
- Admin dashboard for user management
- Export functionality
- Analytics and statistics

### PWA Capabilities
- Installable on mobile devices
- Offline functionality
- Push notifications (ready for implementation)
- App-like experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email info@desifinder.com or create an issue in the repository.

## Roadmap

- [ ] Push notifications for new events and deals
- [ ] User reviews and ratings
- [ ] Business owner dashboard
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Social features
- [ ] Mobile app (React Native)

---

**Desi Finder** - Connecting the Desi community, one discovery at a time! 🇮🇳
