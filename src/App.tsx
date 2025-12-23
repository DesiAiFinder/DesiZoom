import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import About from './pages/About';
import Search from './pages/Search';
import Events from './pages/Events';
import Deals from './pages/Deals';
import Marketplace from './pages/Marketplace';
import LocalInfo from './pages/LocalInfo';
import LocalPlaces from './pages/LocalPlaces';
import Radio from './pages/Radio';
import Admin from './pages/Admin';
import ServiceProviderDashboard from './pages/ServiceProviderDashboard';
import MyListings from './pages/MyListings';
import UserDetails from './pages/UserDetails';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Search />} />
              <Route path="about" element={<About />} />
              <Route path="events" element={<Events />} />
              <Route path="deals" element={<Deals />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="radio" element={<Radio />} />
              <Route path="local-info" element={<LocalInfo />} />
              <Route path="local-places" element={<LocalPlaces />} />
              <Route path="register" element={<Register />} />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute>
                    <ServiceProviderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="my-listings" 
                element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="user/:userId" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <UserDetails />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
