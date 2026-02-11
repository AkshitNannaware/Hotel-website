import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Calendar, Users, Building2, MapPin, Star, Wifi, Car, Coffee, Waves } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const destinations = [
  {
    name: 'Scotland',
    image: 'https://images.unsplash.com/photo-1655292912612-bb5b1bda9355?w=400',
  },
  {
    name: 'Germany',
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?w=400',
  },
  {
    name: 'Nepal',
    image: 'https://images.unsplash.com/photo-1729717949948-56b52db111dd?w=400',
  },
];

const propertyTypes = [
  {
    name: 'Apartments',
    count: '234,567',
    image: 'https://images.unsplash.com/photo-1655292912612-bb5b1bda9355?w=400',
  },
  {
    name: 'Resorts',
    count: '15,678',
    image: 'https://images.unsplash.com/photo-1729717949948-56b52db111dd?w=400',
  },
  {
    name: 'Villas',
    count: '45,123',
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?w=400',
  },
  {
    name: 'Cabins',
    count: '12,890',
    image: 'https://images.unsplash.com/photo-1655292912612-bb5b1bda9355?w=400',
  },
];

const featuredHotels = [
  {
    id: '1',
    name: 'Grand Luxe Hotel',
    location: 'New York, USA',
    rating: 4.8,
    reviews: 432,
    price: 350,
    image: 'https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?w=800',
    amenities: ['WiFi', 'Pool', 'Parking', 'Restaurant'],
  },
  {
    id: '2',
    name: 'Ocean View Resort',
    location: 'Maldives',
    rating: 4.9,
    reviews: 567,
    price: 550,
    image: 'https://images.unsplash.com/photo-1729717949948-56b52db111dd?w=800',
    amenities: ['WiFi', 'Pool', 'Spa', 'Beach'],
  },
  {
    id: '3',
    name: 'Mountain Retreat',
    location: 'Swiss Alps',
    rating: 4.7,
    reviews: 289,
    price: 420,
    image: 'https://images.unsplash.com/photo-1655292912612-bb5b1bda9355?w=800',
    amenities: ['WiFi', 'Restaurant', 'Spa', 'Ski'],
  },
];

const Home = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  
  const heroImage = 'https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?w=1200';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-stone-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/50" />
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <div className="text-white text-center mb-12">
            <h1 className="text-5xl md:text-6xl mb-4">
              Effortless bookings
            </h1>
            <p className="text-xl md:text-2xl text-stone-300">
              for <span className="italic">leisure</span> travel or <span className="italic">business</span>
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm text-stone-600 mb-2">Where</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    type="text"
                    placeholder="Search available rooms"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10 h-12 border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">Check In</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="pl-10 h-12 border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">Check Out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="pl-10 h-12 border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-stone-600 mb-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="pl-10 h-12 border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Link to="/rooms" className="w-full">
                  <Button className="w-full h-12 rounded-full text-base">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl mb-3">Discover</h2>
          <p className="text-xl text-stone-600">new places</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((dest, idx) => (
            <div 
              key={idx}
              className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <img 
                src={dest.image} 
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl">{dest.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Property Types */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl mb-8">Browse by property type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {propertyTypes.map((type, idx) => (
            <div 
              key={idx}
              className="group relative h-[300px] rounded-3xl overflow-hidden cursor-pointer bg-white shadow-md hover:shadow-xl transition-shadow"
            >
              <img 
                src={type.image} 
                alt={type.name}
                className="w-full h-2/3 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4">
                <h3 className="text-xl mb-1">{type.name}</h3>
                <p className="text-stone-600 text-sm">{type.count} properties</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl">Featured properties</h2>
          <Link to="/rooms" className="text-stone-900 hover:underline">View all →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredHotels.map((hotel) => (
            <Link 
              key={hotel.id}
              to={`/room/${hotel.id}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={hotel.image} 
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-sm">
                  ${hotel.price}/night
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl">{hotel.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm">{hotel.rating}</span>
                  </div>
                </div>
                
                <p className="text-stone-600 mb-4 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {hotel.location}
                </p>

                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-700">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stone-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl mb-4">Discover a new unique</h2>
          <h2 className="text-4xl mb-6">living experience</h2>
          <p className="text-xl text-stone-300 mb-8">
            Experience the most luxurious hotels and resorts challenging your comfort
          </p>
          <Link to="/rooms">
            <Button size="lg" className="rounded-full px-8 h-14 text-base">
              Explore More
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl mb-4">Stay up to date</h2>
              <p className="text-stone-600 text-lg">
                Subscribe to our newsletter to get the latest updates on special offers and destinations.
              </p>
            </div>
            
            <div>
              <div className="flex gap-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="h-14 bg-white border-stone-300"
                />
                <Button className="h-14 px-8 rounded-xl">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;