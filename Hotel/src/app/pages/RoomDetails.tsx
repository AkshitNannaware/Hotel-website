import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Users, Maximize2, Star, Calendar, Wifi, Car, Coffee, Waves, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBooking } from '../context/BookingContext';
import { toast } from 'sonner';
import type { Room } from '../types/room';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentBooking } = useBooking();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [roomCount, setRoomCount] = useState('1');

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadRoom = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to load room (${response.status})`);
        }
        const data = await response.json();
        setRoom({
          id: data._id || data.id,
          name: data.name,
          type: data.type,
          price: data.price,
          images: data.images || [],
          description: data.description || '',
          amenities: data.amenities || [],
          maxGuests: data.maxGuests || 1,
          size: data.size || 0,
          available: data.available ?? true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load room';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [API_BASE, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-stone-600">Loading room...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Unable to load room</h2>
          <p className="text-stone-600 mb-4">{loadError}</p>
          <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Room not found</h2>
          <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
        </div>
      </div>
    );
  }

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Pool Access': Waves,
    'Parking': Car,
    'Room Service': Coffee,
    'AC': Coffee,
    'TV': Coffee,
    'Minibar': Coffee,
    'Workspace': Coffee,
    'Jacuzzi': Waves,
    'Butler Service': Coffee,
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculatePrice = () => {
    const nights = calculateNights();
    const rooms = parseInt(roomCount) || 1;
    const roomPrice = room.price * nights * rooms;
    const taxes = roomPrice * 0.12;
    const serviceCharges = roomPrice * 0.05;
    const total = roomPrice + taxes + serviceCharges;

    return { roomPrice, taxes, serviceCharges, total, nights };
  };

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    const { roomPrice, taxes, serviceCharges, total } = calculatePrice();

    setCurrentBooking({
      roomId: room.id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: parseInt(guests),
      rooms: parseInt(roomCount),
      totalPrice: total,
      roomPrice,
      taxes,
      serviceCharges,
    });

    navigate('/booking');
  };

  const pricing = calculatePrice();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/rooms')}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Rooms
        </Button>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-[500px] rounded-3xl overflow-hidden bg-stone-200">
            <img
              src={room.images[currentImageIndex]}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            
            {room.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {room.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {room.available && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full">
                Available Now
              </div>
            )}
          </div>

          {room.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {room.images.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-24 rounded-xl overflow-hidden ${
                    idx === currentImageIndex ? 'ring-2 ring-stone-900' : ''
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl mb-2">{room.name}</h1>
                  <p className="text-xl text-stone-600">{room.type} Room</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl mb-1">${room.price}</div>
                  <div className="text-stone-600">per night</div>
                </div>
              </div>

              <div className="flex gap-6 mb-6 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-2 text-stone-700">
                  <Users className="w-5 h-5" />
                  <span>Up to {room.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Maximize2 className="w-5 h-5" />
                  <span>{room.size} m²</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>4.8 Rating</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl mb-3">Description</h3>
                <p className="text-stone-600 leading-relaxed">{room.description}</p>
              </div>

              <div>
                <h3 className="text-xl mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity, idx) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-stone-700" />
                        </div>
                        <span className="text-stone-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-4">
              <h3 className="text-xl mb-6">Book This Room</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <Input
                      id="checkIn"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="pl-10 h-12"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="checkOut">Check-out Date</Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <Input
                      id="checkOut"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="pl-10 h-12"
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={room.maxGuests}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="rooms">Number of Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="1"
                    max="5"
                    value={roomCount}
                    onChange={(e) => setRoomCount(e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

              {pricing.nights > 0 && (
                <div className="mb-6 p-4 bg-stone-50 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      ${room.price} × {pricing.nights} nights × {roomCount} room(s)
                    </span>
                    <span>${pricing.roomPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Taxes (12%)</span>
                    <span>${pricing.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Service Charges (5%)</span>
                    <span>${pricing.serviceCharges.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between">
                    <span>Total</span>
                    <span className="text-xl">${pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBookNow}
                className="w-full h-12 rounded-xl text-base"
                disabled={!room.available}
              >
                {room.available ? 'Book Now' : 'Not Available'}
              </Button>

              <p className="text-xs text-stone-500 text-center mt-4">
                Free cancellation up to 24 hours before check-in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
