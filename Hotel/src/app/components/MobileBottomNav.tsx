import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BedDouble, ConciergeBell, Info, CalendarCheck } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Accomodation', to: '/rooms', icon: BedDouble },
  { label: 'Services', to: '/services', icon: ConciergeBell },
  { label: 'About Us', to: '/about', icon: Info },
  { label: 'Book Now', to: '/rooms', icon: CalendarCheck },
];

const MobileBottomNav = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#3f4a40] border-t border-[#232325] flex justify-between px-2 py-1 md:hidden">
      {navItems.map(({ label, to, icon: Icon }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={label}
            to={to}
            className={`flex flex-col items-center flex-1 py-1 px-1 text-xs ${active ? 'text-white' : 'text-[#b0b0b0]'} transition-colors`}
          >
            <Icon className={`w-6 h-6 mb-0.5 ${active ? 'text-white' : 'text-[#b0b0b0]'}`} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
