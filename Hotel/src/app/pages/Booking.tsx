import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBooking } from '../context/BookingContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Room } from '../types/room';

const Booking = () => {
  const navigate = useNavigate();
  const { currentBooking, confirmBooking, submitIdProof } = useBooking();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [idType, setIdType] = useState('Government ID');
  const [idProof, setIdProof] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);

  if (!currentBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">No booking selected</h2>
          <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadRoom = async () => {
      setRoomLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms/${currentBooking.roomId}`);
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
        setRoomLoadError(message);
      }
    };

    if (currentBooking?.roomId) {
      loadRoom();
    }
  }, [API_BASE, currentBooking?.roomId]);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProof) {
      toast.error('Please upload a government ID');
      return;
    }
    try {
      const booking = await confirmBooking({
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
      });

      setIsUploading(true);
      await submitIdProof(booking.id, idProof, idType);

      toast.success('Booking details saved!');
      navigate(`/payment/${booking.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create booking';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Complete Your Booking</h1>
          <p className="text-stone-600">Just a few more details...</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl mb-6">Guest Details</h2>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="guestName">Full Name *</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="guestName"
                        type="text"
                        placeholder="Enter your full name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guestEmail">Email Address *</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guestPhone">Phone Number *</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="guestPhone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <textarea
                      id="specialRequests"
                      placeholder="Any special requirements or requests?"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="mt-2 w-full h-32 px-4 py-3 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idType">Government ID Type *</Label>
                    <select
                      id="idType"
                      value={idType}
                      onChange={(event) => setIdType(event.target.value)}
                      className="mt-2 w-full h-12 px-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
                      required
                    >
                      <option value="Government ID">Government ID</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="idProof">Upload Government ID *</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-stone-400 transition-colors">
                        <input
                          id="idProof"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleIdUpload}
                          className="hidden"
                          required
                        />
                        <label htmlFor="idProof" className="cursor-pointer">
                          {idProof ? (
                            <div>
                              <p className="text-green-600 mb-2">✓ {idProof.name}</p>
                              <p className="text-sm text-stone-600">Click to change file</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-stone-700 mb-2">Click to upload government ID</p>
                              <p className="text-sm text-stone-600">PNG, JPG or PDF (max. 5MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                      <p className="text-xs text-stone-500 mt-2">
                        Your check-in is available only after admin approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="w-5 h-5 mt-1 rounded border-stone-300"
                      required
                    />
                    <label htmlFor="terms" className="text-stone-700">
                      I agree to the hotel's terms and conditions, cancellation policy, and privacy policy
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="marketing"
                      className="w-5 h-5 mt-1 rounded border-stone-300"
                    />
                    <label htmlFor="marketing" className="text-stone-700">
                      Send me exclusive offers and updates via email
                    </label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-xl text-base" disabled={isUploading}>
                {isUploading ? 'Uploading ID...' : 'Proceed to Payment'}
                <CreditCard className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-4">
              <h3 className="text-xl mb-6">Booking Summary</h3>

              {room && (
                <>
                  <div className="mb-6">
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />
                    <h4 className="text-lg mb-1">{room.name}</h4>
                    <p className="text-stone-600 text-sm">{room.type} Room</p>
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Check-in</span>
                      <span>{format(currentBooking.checkIn, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Check-out</span>
                      <span>{format(currentBooking.checkOut, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Guests</span>
                      <span>{currentBooking.guests}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Rooms</span>
                      <span>{currentBooking.rooms}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Room Charges</span>
                      <span>${currentBooking.roomPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Taxes</span>
                      <span>${currentBooking.taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Service Charges</span>
                      <span>${currentBooking.serviceCharges.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg">Total Amount</span>
                    <span className="text-3xl">${currentBooking.totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                    <p>✓ Free cancellation up to 24 hours before check-in</p>
                  </div>
                </>
              )}
              {!room && roomLoadError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {roomLoadError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
