import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Phone, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Room } from '../types/room';

const Booking = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { currentBooking, confirmBooking, submitIdProof } = useBooking();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [idType, setIdType] = useState('Government ID');
  const [idProof, setIdProof] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000';
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);

  // Auto-populate from logged-in user
  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Admins cannot book rooms</h2>
          <p className="text-stone-600 mb-6">Switch to a guest account to create a booking.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/admin')} variant="outline">Go to Admin Dashboard</Button>
            <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
          </div>
        </div>
      </div>
    );
  }

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

      // Optionally save to user profile if logged in and checkbox is checked
      if (user && saveToProfile) {
        try {
          const auth = JSON.parse(localStorage.getItem('auth') || '{}');
          const token = auth.token;
          
          if (token) {
            await fetch(`${API_BASE}/api/auth/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                name: guestName,
                email: guestEmail,
                phone: guestPhone
              })
            });
            // Update user in AuthContext and localStorage
            updateUser({
              name: guestName,
              email: guestEmail,
              phone: guestPhone
            });
          }
        } catch (error) {
          console.warn('Failed to update profile:', error);
          // Don't block booking on profile update failure
        }
      }

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Complete Your Booking</h1>
          <p className="text-stone-600">Just a few more details...</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h2 className="text-xl font-semibold mb-5 text-stone-800">Guest Details</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guestName" className="text-sm font-medium">Full Name *</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                      <Input
                        id="guestName"
                        type="text"
                        placeholder="Enter your full name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guestEmail" className="text-sm font-medium">Email Address *</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guestPhone" className="text-sm font-medium">Phone Number *</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                      <Input
                        id="guestPhone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequests" className="text-sm font-medium">Special Requests (Optional)</Label>
                    <textarea
                      id="specialRequests"
                      placeholder="Any special requirements or requests?"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="mt-1.5 w-full h-28 px-4 py-3 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idType" className="text-sm font-medium">Government ID Type *</Label>
                    <select
                      id="idType"
                      value={idType}
                      onChange={(event) => setIdType(event.target.value)}
                      className="mt-1.5 w-full h-11 px-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Government ID">Government ID</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="idProof" className="text-sm font-medium">Upload Government ID *</Label>
                    <div className="mt-1.5">
                      <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
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
                              <p className="text-green-600 font-medium mb-1">✓ {idProof.name}</p>
                              <p className="text-xs text-stone-600">Click to change file</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-blue-700 font-medium mb-1">Click to upload government ID</p>
                              <p className="text-xs text-stone-600">PNG, JPG or PDF (max. 5MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <span>ℹ️</span> Your check-in is available only after admin approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="w-4 h-4 mt-1 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-stone-700">
                      I agree to the hotel's terms and conditions, cancellation policy, and privacy policy
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="marketing"
                      className="w-4 h-4 mt-1 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="marketing" className="text-sm text-stone-700">
                      Send me exclusive offers and updates via email
                    </label>
                  </div>

                  {user && (
                    <div className="flex items-start gap-3 pt-2 border-t border-stone-200">
                      <input
                        type="checkbox"
                        id="saveProfile"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="w-4 h-4 mt-1 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="saveProfile" className="text-sm text-stone-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Save these details to my profile for future bookings
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={isUploading}>
                {isUploading ? 'Uploading ID...' : 'Proceed to Payment'}
                <CreditCard className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-4">
              <h3 className="text-lg font-semibold mb-5 text-stone-800">Booking Summary</h3>

              {room && (
                <>
                  <div className="mb-5">
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-40 object-cover rounded-xl mb-3"
                    />
                    <h4 className="text-base font-semibold mb-1">{room.name}</h4>
                    <p className="text-stone-600 text-sm">{room.type} Room</p>
                  </div>

                  <div className="space-y-2.5 mb-5 pb-5 border-b border-stone-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Check-in</span>
                      <span className="font-medium">{format(currentBooking.checkIn, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Check-out</span>
                      <span className="font-medium">{format(currentBooking.checkOut, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Guests</span>
                      <span className="font-medium">{currentBooking.guests}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Rooms</span>
                      <span className="font-medium">{currentBooking.rooms}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-5 pb-5 border-b border-stone-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Room Charges</span>
                      <span className="font-medium">${currentBooking.roomPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Taxes</span>
                      <span className="font-medium">${currentBooking.taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Service Charges</span>
                      <span className="font-medium">${currentBooking.serviceCharges.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-5 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <span className="text-base font-semibold text-stone-800">Total Amount</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${currentBooking.totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="p-3.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-sm text-green-800">
                    <p className="flex items-center gap-2"><span>✓</span> Free cancellation up to 24 hours before check-in</p>
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
