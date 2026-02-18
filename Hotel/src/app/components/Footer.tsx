import React from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import BookNowFooterButton from './BookNowFooterButton';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#3a4a3e] text-[#efece6]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(7,12,9,0.7) 0%, rgba(7,12,9,0.2) 35%, rgba(7,12,9,0.6) 100%), radial-gradient(circle at 15% 80%, rgba(90,110,90,0.35), transparent 55%), radial-gradient(circle at 85% 15%, rgba(90,110,90,0.25), transparent 50%)',
        }}
      />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:220px_100%]" />

      <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Navigation */}
          <div>
            <h2 className="text-2xl mb-4 text-[#efece6]" style={{ fontFamily: "'Playfair Display', serif" }}>
              King's Hideaway
            </h2>
            <nav className="space-y-2">
              {[
                { label: 'Rooms', to: '/rooms' },
                { label: 'Services', to: '/services' },
                { label: 'About', to: '/about' },
                { label: 'Contact', to: '/contact' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block text-sm text-[#d2cdbf] hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-4 text-[#efece6]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-[#d2cdbf]">
              <li>
                <Link to="/profile?tab=bookings" className="hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Special Offers
                </Link>
              </li>
              <li>51 Rooms & 26 Suites</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg mb-4 text-[#efece6]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-[#d2cdbf]">
              <li>Maldives 962 31 Sliac</li>
              <li>Sielnica Slovakia</li>
              <li className="pt-2">+8801222222222</li>
              <li>youremail@domain.com</li>
            </ul>
          </div>

          {/* Social & Connect */}
          <div>
            <h3 className="text-lg mb-4 text-[#efece6]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Connect
            </h3>
            <div className="flex gap-3 mb-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#efece6] hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#efece6] hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#efece6] hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#efece6] hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
              <Button className="bg-[#6b7262] text-[#232a22] hover:bg-[#efece6] hover:text-[#232a22] font-bold uppercase tracking-widest w-full">
                <Link to="/rooms" className="w-full h-full block text-center">
                  Book Now
                </Link>
              </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-[#6c7564] text-center">
          <p className="text-xs text-[#a9a492]">© {new Date().getFullYear()} King's Hideaway. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
