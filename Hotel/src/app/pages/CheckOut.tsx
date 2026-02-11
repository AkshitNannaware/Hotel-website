import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useBooking } from '../context/BookingContext';
import { toast } from 'sonner';
import { format, addHours } from 'date-fns';
import type { Room } from '../types/room';

const CheckOut = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, updateBookingStatus } = useBooking();
  const booking = bookings.find(b => b.id === bookingId);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);

  const [lateCheckout, setLateCheckout] = useState(false);
  const [lateCheckoutTime, setLateCheckoutTime] = useState('14:00');
  const [step, setStep] = useState(1);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Booking not found</h2>
          <Button onClick={() => navigate('/profile')}>Back to Profile</Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadRoom = async () => {
      setRoomLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms/${booking?.roomId}`);
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

    if (booking?.roomId) {
      loadRoom();
    }
  }, [API_BASE, booking?.roomId]);

  const lateCheckoutPrices: Record<string, number> = {
    '14:00': 50,
    '16:00': 75,
    '18:00': 100,
    '20:00': 150,
  };

  const additionalCharges = lateCheckout ? lateCheckoutPrices[lateCheckoutTime] : 0;

  const handleCheckOut = () => {
    updateBookingStatus(booking.id, 'checked-out');
    setStep(2);
    toast.success('Check-out successful!');
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-stone-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl mb-3">Check-Out Complete!</h1>
            <p className="text-xl text-stone-600 mb-8">
              Thank you for staying with us
            </p>

            <div className="bg-stone-50 rounded-2xl p-6 mb-8 text-left">
              <div className="mb-6 pb-6 border-b border-stone-200">
                <div className="text-sm text-stone-600 mb-1">Booking ID</div>
                <div className="text-2xl">{booking.id}</div>
              </div>

              {room && (
                <div className="mb-6">
                  <div className="text-sm text-stone-600 mb-1">Room</div>
                  <div className="text-lg">{room.name}</div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600">Room Charges</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
                {additionalCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">Late Check-out</span>
                    <span>${additionalCharges.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-stone-200 flex justify-between items-center">
                <span className="text-lg">Total Amount</span>
                <span className="text-3xl">${(booking.totalPrice + additionalCharges).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 text-left">
                <p className="mb-2"><strong>We hope you enjoyed your stay!</strong></p>
                <p>A detailed invoice has been sent to your email. Please check your belongings before leaving.</p>
              </div>

              <Button onClick={() => navigate('/')} className="w-full h-12 rounded-xl">
                Back to Home
              </Button>

              <Button onClick={() => navigate('/profile')} variant="outline" className="w-full h-12 rounded-xl">
                View My Bookings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Check-Out</h1>
          <p className="text-stone-600">Complete your check-out process</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
          <h2 className="text-2xl mb-6">Booking Summary</h2>

          {room && (
            <div className="flex gap-6 mb-6">
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-32 h-32 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-xl mb-1">{room.name}</h3>
                <p className="text-stone-600 mb-2">Booking ID: {booking.id}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-stone-600">Check-in</div>
                    <div>{format(booking.checkIn, 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone-600">Check-out</div>
                    <div>{format(booking.checkOut, 'MMM dd, yyyy')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!room && roomLoadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {roomLoadError}
            </div>
          )}

          <div className="pt-6 border-t border-stone-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-600">Room Charges</span>
              <span className="text-lg">${booking.totalPrice.toFixed(2)}</span>
            </div>
            <div className="text-sm text-stone-600">
              Standard check-out time: 12:00 PM
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
          <h2 className="text-2xl mb-6">Late Check-Out (Optional)</h2>

          <div className="mb-6">
            <RadioGroup value={lateCheckout ? 'yes' : 'no'} onValueChange={(value) => setLateCheckout(value === 'yes')}>
              <div className="space-y-3">
                <div className="flex items-center p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 cursor-pointer transition-colors">
                  <RadioGroupItem value="no" id="no-late" className="mr-3" />
                  <Label htmlFor="no-late" className="cursor-pointer flex-1">
                    <span className="block">Standard Check-out (12:00 PM)</span>
                    <span className="text-sm text-stone-600">No additional charge</span>
                  </Label>
                  <span>$0</span>
                </div>

                <div className="flex items-center p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 cursor-pointer transition-colors">
                  <RadioGroupItem value="yes" id="yes-late" className="mr-3" />
                  <Label htmlFor="yes-late" className="cursor-pointer flex-1">
                    <span className="block">Request Late Check-out</span>
                    <span className="text-sm text-stone-600">Subject to availability</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {lateCheckout && (
            <div className="mt-6 p-6 bg-stone-50 rounded-xl">
              <Label htmlFor="lateTime">Select Late Check-out Time</Label>
              <select
                id="lateTime"
                value={lateCheckoutTime}
                onChange={(e) => setLateCheckoutTime(e.target.value)}
                className="mt-2 w-full h-12 px-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="14:00">2:00 PM - $50</option>
                <option value="16:00">4:00 PM - $75</option>
                <option value="18:00">6:00 PM - $100</option>
                <option value="20:00">8:00 PM - $150</option>
              </select>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p>Late check-out is subject to room availability and will be confirmed upon request.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
          <h2 className="text-2xl mb-6">Payment Summary</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-stone-600">Room Charges</span>
              <span>${booking.totalPrice.toFixed(2)}</span>
            </div>
            {lateCheckout && (
              <div className="flex justify-between">
                <span className="text-stone-600">Late Check-out ({lateCheckoutTime})</span>
                <span>${lateCheckoutPrices[lateCheckoutTime].toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-stone-200 flex justify-between items-center mb-6">
            <span className="text-lg">Total Amount</span>
            <span className="text-3xl">${(booking.totalPrice + additionalCharges).toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            <Button onClick={handleCheckOut} className="w-full h-14 rounded-xl text-base">
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Check-Out
            </Button>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <p className="mb-2"><strong>Before you leave:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Please return your room key card at reception</li>
                <li>Check for personal belongings in the room</li>
                <li>Settle any mini-bar or room service charges</li>
                <li>Provide feedback about your stay</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
