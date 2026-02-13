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
    <header className="sticky top-0 z-50 w-full bg-stone-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white transition-transform duration-200 hover:scale-105">
            <Hotel className="w-6 h-6" />
            <span className="font-bold">Grand Luxe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-lg font-bold">
            <Link to="/" className="text-stone-100 hover:text-white transition-colors font-bold border-b-2 border-transparent hover:border-white/80 pb-1">
              Home
            </Link>
            <Link to="/rooms" className="text-stone-100 hover:text-white transition-colors font-bold border-b-2 border-transparent hover:border-white/80 pb-1">
              Rooms
            </Link>
            <Link to="/services" className="text-stone-100 hover:text-white transition-colors font-bold border-b-2 border-transparent hover:border-white/80 pb-1">
              Services
            </Link>
            {user && (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/profile?tab=bookings'}
                  className="text-stone-100 hover:text-white transition-colors font-bold border-b-2 border-transparent hover:border-white/80 pb-1"
                >
                  {user.role === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile?tab=profile">
                  <Button variant="ghost" className="gap-2 text-white hover:bg-white/10 hover:text-white font-bold text-base">
                    <User className="w-4 h-4" />
                    {user.name}
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white font-bold text-base"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white font-bold text-base">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-white text-stone-900 hover:bg-white/90 font-bold text-base">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-stone-900">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-100 hover:text-white transition-colors px-4 py-2 text-lg font-bold border-b border-transparent hover:border-white/60"
              >
                Home
              </Link>
              <Link
                to="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-100 hover:text-white transition-colors px-4 py-2 text-lg font-bold border-b border-transparent hover:border-white/60"
              >
                Rooms
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-100 hover:text-white transition-colors px-4 py-2 text-lg font-bold border-b border-transparent hover:border-white/60"
              >
                Services
              </Link>
              {user && (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/profile?tab=bookings'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-100 hover:text-white transition-colors px-4 py-2 text-lg font-bold border-b border-transparent hover:border-white/60"
                  >
                    {user.role === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
                  </Link>
                </>
              )}
              
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-white/10">
                {user ? (
                  <>
                    <Link to="/profile?tab=profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white font-bold text-base">
                        <User className="w-4 h-4" />
                        {user.name}
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-start gap-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white font-bold text-base"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-white hover:bg-white/10 hover:text-white font-bold text-base">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-white text-stone-900 hover:bg-white/90 font-bold text-base">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;