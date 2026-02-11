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
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [priceRange, setPriceRange] = useState([0, 1000]);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl mb-2">Available Rooms</h1>
            <p className="text-stone-600">{filteredRooms.length} rooms found</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 md:flex-none"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-4">
              <h3 className="text-xl mb-6">Filters</h3>

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
            <div className="grid grid-cols-1 gap-6">
              {filteredRooms.map(room => (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    <div className="relative h-64 md:h-auto overflow-hidden">
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {room.available && (
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          Available
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-2xl mb-1">{room.name}</h3>
                          <p className="text-stone-600">{room.type} Room</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl mb-1">${room.price}</div>
                          <div className="text-sm text-stone-600">per night</div>
                        </div>
                      </div>

                      <p className="text-stone-600 mb-4 line-clamp-2">{room.description}</p>

                      <div className="flex items-center gap-4 mb-4 text-sm text-stone-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Up to {room.maxGuests} guests
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 className="w-4 h-4" />
                          {room.size} m²
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {room.amenities.slice(0, 6).map((amenity, idx) => {
                          const Icon = amenityIcons[amenity] || Coffee;
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-sm"
                            >
                              <Icon className="w-4 h-4" />
                              {amenity}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-200">
                        <Button className="w-full md:w-auto rounded-xl">
                          View Details & Book
                        </Button>
                      </div>
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
