import React from 'react';
import { Link } from 'react-router';
import { Hotel, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-xl mb-4">
              <Hotel className="w-6 h-6" />
              <span>Grand Luxe</span>
            </div>
            <p className="text-stone-400 text-sm mb-4">
              Experience luxury and comfort at its finest. Your perfect stay awaits.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-stone-400">
              <li><Link to="/rooms" className="hover:text-white transition-colors">Rooms</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors">Restaurant</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Spa & Wellness</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Conference Rooms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Swimming Pool</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Luxury Avenue, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>info@grandluxe.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-400 text-sm">
            © 2026 Grand Luxe Hotel. All rights reserved.
          </p>
          <div className="flex gap-6 text-stone-400 text-sm">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
