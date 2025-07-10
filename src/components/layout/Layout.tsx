import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const location = useLocation();

  // Scroll vers le haut lors des changements de page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Observer pour les animations au défilement
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });
    document.querySelectorAll('.text-appear').forEach(el => {
      observer.observe(el);
    });
    return () => {
      document.querySelectorAll('.text-appear').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, [location.pathname]);
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow md:pt-20">{children}</main>
      <Footer />
    </div>;
};
export default Layout;