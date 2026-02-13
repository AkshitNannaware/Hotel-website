import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Search, Calendar, Users, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import type { Room } from '../types/room';

const ctaImage = '/0c0b1b9fcebeedd073f75517ee322f51.jpg';

const Home = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [showHomeAboutMore, setShowHomeAboutMore] = useState(false);
  const discoverRef = useRef<HTMLDivElement | null>(null);
  const [accommodationIndex, setAccommodationIndex] = useState(0);
  const [roomsState, setRoomsState] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [servicesState, setServicesState] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const heroImage = '/15101348_3840_2160_60fps.mp4';
  const fallbackRoomImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400';
  const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';

  useEffect(() => {
    const loadRooms = async () => {
      setRoomsLoading(true);
      setRoomsError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms`);
        if (!response.ok) {
          throw new Error(`Failed to load rooms (${response.status})`);
        }
        const data = await response.json();
        const normalized = (data as any[]).map((room) => ({
          id: room._id || room.id,
          name: room.name,
          type: room.type,
          price: room.price,
          images: room.images || [],
          description: room.description || '',
          amenities: room.amenities || [],
          maxGuests: room.maxGuests || 1,
          size: room.size || 0,
          available: room.available ?? true,
        }));
        setRoomsState(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load rooms';
        setRoomsError(message);
      } finally {
        setRoomsLoading(false);
      }
    };

    loadRooms();
  }, [API_BASE]);

  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await fetch(`${API_BASE}/api/services`);
        if (!response.ok) {
          throw new Error(`Failed to load services (${response.status})`);
        }
        const data = await response.json();
        const normalized = (Array.isArray(data) ? data : []).map((service) => ({
          ...service,
          category: String(service.category || '').toLowerCase(),
        }));
        setServicesState(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load services';
        setServicesError(message);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [API_BASE]);

  useEffect(() => {
    if (roomsState.length === 0) {
      setAccommodationIndex(0);
      return;
    }
    if (accommodationIndex >= roomsState.length) {
      setAccommodationIndex(0);
    }
  }, [accommodationIndex, roomsState.length]);

  const accommodationsCount = roomsState.length;
  const activeAccommodation = accommodationsCount ? roomsState[accommodationIndex] : null;
  const prevAccommodation = accommodationsCount
    ? roomsState[(accommodationIndex - 1 + accommodationsCount) % accommodationsCount]
    : null;
  const nextAccommodation = accommodationsCount
    ? roomsState[(accommodationIndex + 1) % accommodationsCount]
    : null;

  const resolveRoomImage = (room: Room | null) => {
    const imageUrl = room?.images?.[0] || fallbackRoomImage;
    if (!imageUrl) return fallbackRoomImage;
    return imageUrl.startsWith('/uploads/') ? `${API_BASE}${imageUrl}` : imageUrl;
  };
  const resolveServiceImage = (service: any) => {
    const imageUrl = String(service?.image || '').trim();
    if (!imageUrl) {
      return 'https://images.unsplash.com/photo-1516455207990-7a41e1d4ffd5?w=600&h=400&fit=crop';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/uploads/')) {
      return `${API_BASE}${imageUrl}`;
    }
    if (imageUrl.startsWith('uploads/')) {
      return `${API_BASE}/${imageUrl}`;
    }
    if (imageUrl.startsWith('/')) {
      return `${API_BASE}${imageUrl}`;
    }
    return `${API_BASE}/${imageUrl}`;
  };
  const resolveRoomMeta = (room: Room | null) => {
    if (!room) {
      return 'Signature stay | Curated comfort | Luxury details | 1 bathroom';
    }
    const sizeLabel = room.size ? `${room.size} m2` : 'Signature stay';
    const typeLabel = room.type ? `${room.type} room` : 'Curated comfort';
    const guestLabel = `${room.maxGuests || 1} guests`;
    return `${sizeLabel} | ${typeLabel} | ${guestLabel} | 1 bathroom`;
  };

  const getServicesByCategory = (category: string) => {
    return servicesState
      .filter((service) => service.category === category)
      .slice(0, 2);
  };

  const categoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      spa: 'Spa & Wellness',
      bar: 'Bar & Lounge',
      restaurant: 'Restaurant',
      dining: 'In-room Dining',
    };
    return labels[category] || category;
  };

  const categoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      spa: '🧖',
      bar: '🍹',
      restaurant: '🍽️',
      dining: '🍴',
    };
    return emojis[category] || '✨';
  };

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || 'Failed to subscribe. Please try again.';
        throw new Error(message);
      }

      toast.success('Successfully subscribed to our newsletter!');
      setNewsletterEmail('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe. Please try again.';
      toast.error(message);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('search', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    if (rooms) params.set('rooms', rooms);
    
    const queryString = params.toString();
    window.location.href = `/rooms${queryString ? `?${queryString}` : ''}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[520px] sm:h-[620px] lg:h-[749px] bg-stone-900">
        <video
          src={heroImage}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-stone-900/60" />
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <div className="text-white text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-serif tracking-tight mb-4">
              Effortless bookings
            </h1>
            <p className="text-base md:text-lg text-stone-200">
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
                    onKeyDown={handleKeyDown}
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
                    onKeyDown={handleKeyDown}
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
                    onKeyDown={handleKeyDown}
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
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-12 border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full h-12 rounded-full text-base"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Services */}
      <section id="discover" className="max-w-7xl mx-auto px-4 py-24 bg-[#F9F8F6] relative overflow-hidden">
  {/* Header Section */}
  <div className="mb-20 grid grid-cols-1 lg:grid-cols-[1fr_1fr] items-start gap-8">
    <div className="relative">
      <h2 className="text-5xl md:text-6xl font-serif text-stone-800 leading-[1.1] tracking-tight">
        At <br /> Our Services
      </h2>
    </div>
    <div className="flex flex-col items-start lg:items-end text-left lg:text-right pt-4">
       <div className="flex items-center gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-stone-400">Luxury Hospitality & Experience</p>
       </div>
       <p className="text-stone-500 leading-relaxed text-base md:text-lg max-w-sm">
        Where every service tells a story of tradition and artistry
      </p>
    </div>
  </div>

  {servicesLoading && (
    <div className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
      Loading services...
    </div>
  )}
  {servicesError && (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {servicesError}
    </div>
  )}

  {servicesState.length === 0 && !servicesLoading ? (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-stone-600">
      No services are available yet. Please check back soon.
    </div>
  ) : (
    <div className="relative min-h-[600px] flex items-center justify-center">
      {/* Decorative Background Curve */}
      <svg 
        className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none opacity-30 z-0" 
        viewBox="0 0 1200 400" 
        fill="none"
      >
        <path 
          d="M-50 300 C 150 350, 400 50, 600 200 S 1000 350, 1250 100" 
          stroke="#000000" 
          strokeWidth="1.5" 
          strokeDasharray="8 8" 
        />
      </svg>

      {/* Cards Grid: Arch Shapes - Display only first 3 services */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        
        {/* Left Card (Lowered) */}
        {servicesState[0] && (
          <div className="flex flex-col items-center translate-y-12">
            <div className="w-full aspect-[4/5] rounded-t-full overflow-hidden shadow-lg">
              <img 
                src={resolveServiceImage(servicesState[0])} 
                alt={servicesState[0].name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-serif text-stone-800">{servicesState[0].name}</h3>
              <p className="text-xs text-stone-400 font-medium uppercase">{servicesState[0].category || 'Service'}</p>
            </div>
          </div>
        )}

        {/* Middle Card (Elevated Arch) */}
        {servicesState[1] && (
          <div className="flex flex-col items-center -translate-y-12">
            <div className="w-full aspect-[4/6] rounded-t-full overflow-hidden shadow-lg border-[12px] border-white/30 backdrop-blur-sm">
              <img 
                src={resolveServiceImage(servicesState[1])} 
                alt={servicesState[1].name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-serif text-stone-800">{servicesState[1].name}</h3>
              <p className="text-xs text-stone-400 font-medium uppercase">{servicesState[1].category || 'Service'}</p>
            </div>
          </div>
        )}

        {/* Right Card (Slightly Lowered) */}
        {servicesState[2] && (
          <div className="flex flex-col items-center translate-y-8">
            <div className="w-full aspect-[4/5] rounded-t-full overflow-hidden shadow-lg">
              <img 
                src={resolveServiceImage(servicesState[2])} 
                alt={servicesState[2].name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-serif text-stone-800">{servicesState[2].name}</h3>
              <p className="text-xs text-stone-400 font-medium uppercase">{servicesState[2].category || 'Service'}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )}

        <div className="mt-8 text-center">
          <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            From crafting deeply personal stays and world-class culinary masterpieces to hosting immersive, high-prestige events and hospitality expertise with thoughtful innovation to ensure every guest journey is a sanctuary of comfort and style
          </p>
          <Link to="/rooms">
          <Button className="mt-6 rounded-full px-8 h-12 text-xs tracking-[0.2em] uppercase bg-amber-500 text-stone-900 hover:bg-amber-400">
            Explore our Rooms...
          </Button>
          </Link>
        </div>
</section>


      {/* Accommodations */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.35em] uppercase text-stone-500">
            <span className="h-px w-10 bg-stone-300" />
            Discover our best offers
            <span className="h-px w-10 bg-stone-300" />
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-serif text-stone-800">
            Our accommodations
          </h2>
        </div>

        {roomsLoading && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
            Loading rooms...
          </div>
        )}
        {roomsError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {roomsError}
          </div>
        )}

        {roomsState.length === 0 && !roomsLoading ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            No rooms are available yet. Please check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 items-center">
            <div className="hidden lg:block">
              <div className="relative rounded-[24px] overflow-hidden shadow-lg">
                <img
                  src={resolveRoomImage(prevAccommodation)}
                  alt={prevAccommodation?.name || 'Previous room'}
                  className="h-[360px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
              </div>
            </div>

            <div className="relative rounded-[28px] overflow-hidden shadow-2xl">
              <img
                src={resolveRoomImage(activeAccommodation)}
                alt={activeAccommodation?.name || 'Featured room'}
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={() =>
                  setAccommodationIndex((prevIndex) => (prevIndex - 1 + accommodationsCount) % accommodationsCount)
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
                aria-label="Previous accommodation"
              >
                <ChevronLeft className="h-5 w-5 mx-auto" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setAccommodationIndex((prevIndex) => (prevIndex + 1) % accommodationsCount)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
                aria-label="Next accommodation"
              >
                <ChevronRight className="h-5 w-5 mx-auto" />
              </button>
              <div className="absolute bottom-6 left-1/2 w-[86%] -translate-x-1/2 text-center text-white">
                <div className="text-xs tracking-[0.35em] uppercase text-amber-200">
                  ${activeAccommodation?.price ?? 0} / day
                </div>
                <div className="mt-2 text-2xl font-serif">
                  {activeAccommodation?.name || 'Signature Stay'}
                </div>
                <div className="mt-3 text-xs text-stone-200">
                  {resolveRoomMeta(activeAccommodation)}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-[24px] overflow-hidden shadow-lg">
                <img
                  src={resolveRoomImage(nextAccommodation)}
                  alt={nextAccommodation?.name || 'Next room'}
                  className="h-[360px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
              </div>
            </div>
          </div>
        )}

        {roomsState.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {roomsState.map((_, index) => (
              <button
                key={`accommodation-dot-${index}`}
                type="button"
                onClick={() => setAccommodationIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === accommodationIndex ? 'w-6 bg-amber-400' : 'w-4 bg-stone-300'
                }`}
                aria-label={`Go to accommodation ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            Browse signature offers for every occasion, from family-friendly packages to romantic getaways.
            Book direct for our best price guarantee, plus complimentary services and experiences.
          </p>
          <Link to="/rooms">
          <Button className="mt-6 rounded-full px-8 h-12 text-xs tracking-[0.2em] uppercase bg-amber-500 text-stone-900 hover:bg-amber-400">
            Explore our Rooms...
          </Button>
          </Link>
        </div>
      </section>
      

      {/* Restaurant */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.35em] uppercase text-stone-500">
            <span className="h-px w-10 bg-stone-300" />
            Culinary excellence awaits
            <span className="h-px w-10 bg-stone-300" />
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-serif text-stone-800">
            Restaurant
          </h2>
        </div>

        {servicesLoading && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
            Loading restaurants...
          </div>
        )}
        {servicesError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {servicesError}
          </div>
        )}

        {(() => {
          const restaurantServices = servicesState.filter((service) => service.category === 'restaurant');
          
          if (restaurantServices.length === 0 && !servicesLoading) {
            return (
              <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-stone-600">
                No restaurants are available yet. Please check back soon.
              </div>
            );
          }

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {restaurantServices.map((restaurant, idx) => (
                  <div key={restaurant._id || restaurant.id || idx} className="group relative">
                    <div className="relative rounded-[24px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                      <img
                        src={resolveServiceImage(restaurant)}
                        alt={restaurant.name}
                        className="h-[380px] w-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-serif text-xl shadow-lg">
                        {idx + 1}
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="text-[10px] tracking-[0.3em] uppercase text-amber-200 mb-2">
                          {idx === 0 ? 'Signature' : idx === 1 ? 'Premium' : 'Exclusive'}
                        </div>
                        <h3 className="text-xl md:text-2xl font-serif mb-2">
                          {restaurant.name}
                        </h3>
                        {restaurant.description && (
                          <p className="text-xs text-stone-300 mb-2 line-clamp-2">
                            {restaurant.description}
                          </p>
                        )}
                        <Link
                          to="/services#services-restaurant"
                          className="text-xs text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          Explore menu →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
                  Experience culinary artistry where every dish tells a story, blending tradition with innovation in an atmosphere of refined elegance.
                </p>
                <Link to="/services">
                  <Button className="mt-6 rounded-full px-8 h-12 text-xs tracking-[0.2em] uppercase bg-amber-500 text-stone-900 hover:bg-amber-400">
                    Explore our Restaurants...
                  </Button>
                </Link>
              </div>
            </>
          );
        })()}
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-[24px] bg-white border border-stone-100 shadow-lg px-6 py-10 md:px-10 text-center">
          <p className="text-xs tracking-[0.35em] uppercase text-stone-500">About</p>
          <h3 className="mt-3 text-2xl md:text-3xl font-serif text-stone-800">
            Discover the story behind our hospitality
          </h3>
          <p className="mt-4 text-stone-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            From curated stays to signature service, learn what makes our experience timeless.
          </p>
          <Link to="/about" className="inline-flex">
            <Button className="mt-6 rounded-full px-8 h-12 text-xs tracking-[0.2em] uppercase bg-amber-500 text-stone-900 hover:bg-amber-400">
              Visit About Page
            </Button>
          </Link>
        </div>
      </section>   

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-[36px] text-white px-8 py-14 md:px-14">
            <img
              src={ctaImage}
              alt="Scenic retreat"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/10" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-serif leading-tight">
                Discover a new unique
                <br />
                living experience
              </h2>
              <p className="mt-4 text-stone-200 max-w-lg text-base md:text-lg">
                Take a step into the extraordinary by immersing yourself in a unique life
                experience. Your home away from everyone is waiting for you.
              </p>
              <Link to="/rooms" className="inline-flex">
                <Button className="mt-6 rounded-full px-8 h-11 text-xs tracking-[0.25em] uppercase bg-white text-stone-900 hover:bg-stone-100">
                  Discover
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-800 mb-4">Stay up to date</h2>
              <p className="text-stone-600 text-base md:text-lg">
                Subscribe to our newsletter to get the latest updates on special offers and destinations.
              </p>
            </div>
            
            <div>
              <div className="flex gap-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubscribe()}
                  className="h-14 bg-white border-stone-300"
                  disabled={isSubscribing}
                />
                <Button 
                  className="h-14 px-8 rounded-xl" 
                  onClick={handleNewsletterSubscribe}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;