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
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl">
            <Hotel className="w-6 h-6" />
            <span>Grand Luxe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-stone-700 hover:text-stone-900 transition-colors">
              Home
            </Link>
            <Link to="/rooms" className="text-stone-700 hover:text-stone-900 transition-colors">
              Rooms
            </Link>
            <Link to="/services" className="text-stone-700 hover:text-stone-900 transition-colors">
              Services
            </Link>
            {user && (
              <Link
                to={user.role === 'admin' ? '/admin' : '/profile'}
                className="text-stone-700 hover:text-stone-900 transition-colors"
              >
                {user.role === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" className="gap-2">
                    <User className="w-4 h-4" />
                    {user.name}
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-700 hover:text-stone-900 transition-colors px-4 py-2"
              >
                Home
              </Link>
              <Link
                to="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-700 hover:text-stone-900 transition-colors px-4 py-2"
              >
                Rooms
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-700 hover:text-stone-900 transition-colors px-4 py-2"
              >
                Services
              </Link>
              {user && (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/profile'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-stone-700 hover:text-stone-900 transition-colors px-4 py-2"
                >
                  {user.role === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
                </Link>
              )}
              
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-stone-200">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="w-4 h-4" />
                        {user.name}
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
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
