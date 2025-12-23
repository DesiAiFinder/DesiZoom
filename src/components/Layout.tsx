import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import PersistentRadioFooter from './PersistentRadioFooter';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <Footer />
      <PersistentRadioFooter />
    </div>
  );
};

export default Layout;
