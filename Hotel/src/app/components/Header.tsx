import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Hotel, User, Menu, X, LogIn, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between lg:justify-center">
          
         {/* Desktop Navigation (Kept Same) */}
          <div className="hidden lg:flex items-center gap-12 text-sm uppercase tracking-widest text-white/90 font-bold">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/rooms" className="hover:text-white transition-colors">Accommodation</Link>
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <Link to="/offers" className="hover:text-white transition-colors">Offers</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link>
                )}
                <Link to="/profile?tab=profile" className="hover:text-white transition-colors">Profile</Link>
              </>
            ) : (
              <Link to="/login" className="hover:text-white transition-colors">Login&Signup</Link>
            )}
          </div>
        </nav>

        {/* Full Screen Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-[#3f4a40] backdrop-blur-md z-[60] transition-all">
            <div className="flex justify-end p-8">
               <button onClick={() => setMobileMenuOpen(false)} className="text-white border border-white/20 p-3 rounded-full">
                  <X className="w-6 h-6" />
               </button>
            </div>
            <nav className="flex flex-col items-center gap-8 p-6 text-center">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Home</Link>
              <Link to="/rooms" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Rooms</Link>
              <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Services</Link>
              <Link to="/offers" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Offers</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Contact</Link>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Admin Dashboard</Link>
                  )}
                  <Link to="/profile?tab=profile" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Profile</Link>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-2xl text-white uppercase tracking-widest font-light">Login&Signup</Link>
              )}
              
              <div className="w-full h-px bg-white/10 my-4 max-w-xs" />
              
              {user ? (
                <Button onClick={handleLogout} variant="ghost" className="text-white text-lg">Logout</Button>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg">Sign In</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;