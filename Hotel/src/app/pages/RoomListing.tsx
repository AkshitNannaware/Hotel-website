import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { SlidersHorizontal, Wifi, Car, Coffee, Waves, Users, Maximize2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { Room } from '../types/room';

const RoomListing = () => {
  const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    return imageUrl.startsWith('/uploads/') ? `${API_BASE}${imageUrl}` : imageUrl;
  };
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('price-low');
  const [showFilters, setShowFilters] = useState(false);
  const [roomsState, setRoomsState] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Pool Access': Waves,
    'Parking': Car,
    'Room Service': Coffee,
  };

  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true);
      setLoadError(null);
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
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [API_BASE]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredRooms = roomsState
    .filter(room => room.price >= priceRange[0] && room.price <= priceRange[1])
    .filter(room => selectedTypes.length === 0 || selectedTypes.includes(room.type))
    .filter(room => 
      selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => room.amenities.includes(amenity))
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-stone-500 mb-3">Rooms</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 leading-tight">
                Quiet, tailored stays with a sense of place.
              </h1>
              <p className="text-stone-600 mt-4 max-w-2xl">
                Explore our collection of suites and rooms curated for comfort, light, and balance.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                  {filteredRooms.length} rooms available
                </span>
                <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                  Flexible check-in
                </span>
                <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700">
                  Curated amenities
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-xs uppercase tracking-wider text-stone-500">Total Rooms</p>
                  <p className="text-2xl font-semibold text-stone-900">{roomsState.length}</p>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-xs uppercase tracking-wider text-stone-500">Filtered</p>
                  <p className="text-2xl font-semibold text-stone-900">{filteredRooms.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-dashed border-stone-200 p-4 text-sm text-stone-600">
                  Set your filters and compare suites without leaving the page.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full`}>
            <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm backdrop-blur lg:sticky lg:top-4">
              <h3 className="text-xl font-semibold text-stone-900 mb-6">Filters</h3>

              {/* Price Range */}
              <div className="mb-8">
                <label className="block text-sm mb-4">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  step={10}
                  className="mb-2"
                />
              </div>

              {/* Room Type */}
              <div className="mb-8">
                <h4 className="mb-4">Room Type</h4>
                <div className="space-y-3">
                  {['Single', 'Double', 'Suite', 'Deluxe'].map(type => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={type}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <Label htmlFor={type} className="cursor-pointer text-stone-700">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h4 className="mb-4">Amenities</h4>
                <div className="space-y-3">
                  {['WiFi', 'AC', 'Pool Access', 'Parking'].map(amenity => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={amenity} className="cursor-pointer text-stone-700">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedAmenities([]);
                  setPriceRange([0, 1000]);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Room Cards */}
          <div className="flex-1">
            {isLoading && (
              <div className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                Loading rooms...
              </div>
            )}
            {loadError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`}
                  className="group rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={resolveImageUrl(room.images[0])}
                      alt={room.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {room.available && (
                      <div className="absolute top-4 left-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs text-white">
                        Available
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-stone-900">{room.name}</h3>
                        <p className="text-sm text-stone-600">{room.type} Room</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-stone-900">${room.price}</div>
                        <div className="text-xs text-stone-500">per night</div>
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 mt-3 line-clamp-2">
                      {room.description || 'A bright, restful room with curated amenities.'}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-stone-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Up to {room.maxGuests} guests
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize2 className="w-4 h-4" />
                        {room.size} m²
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {room.amenities.slice(0, 6).map((amenity, idx) => {
                        const Icon = amenityIcons[amenity] || Coffee;
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                          >
                            <Icon className="w-4 h-4" />
                            {amenity}
                          </span>
                        );
                      })}
                    </div>

                    <div className="mt-5">
                      <Button className="w-full rounded-xl">View Details & Book</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-2xl mb-2">No rooms found</h3>
                <p className="text-stone-600 mb-6">Try adjusting your filters</p>
                <Button
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedAmenities([]);
                    setPriceRange([0, 1000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomListing;
