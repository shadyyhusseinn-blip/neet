import { Route } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import PortfolioPage from '../pages/public/PortfolioPage';
import PackagesPage from '../pages/public/PackagesPage';
import UnifiedLoginPage from '../pages/public/UnifiedLoginPage';
import PublicGalleries from '../components/shared/PublicGalleries';
import PublicGalleryLanding from '../components/shared/PublicGalleryLanding';
import AboutPage from '../pages/public/AboutPage';
import ServicesPage from '../pages/public/ServicesPage';
import BlogPage from '../pages/public/BlogPage';
import FAQPage from '../pages/public/FAQPage';
import BookNowPage from '../pages/public/BookNowPage';
import ContactPage from '../pages/public/ContactPage';
import ClientGallery from '../pages/public/ClientGallery';

export const publicRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/home" element={<LandingPage />} />
    <Route path="/portfolio" element={<PortfolioPage />} />
    <Route path="/packages" element={<PackagesPage />} />
    <Route path="/login" element={<UnifiedLoginPage />} />
    <Route path="/galleries" element={<PublicGalleries />} />
    <Route path="/gallery/:galleryId" element={<ClientGallery />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/faq" element={<FAQPage />} />
    <Route path="/book-now" element={<BookNowPage />} />
    <Route path="/contact" element={<ContactPage />} />
  </>
);
