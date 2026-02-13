import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, Clock, Upload, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBooking } from '../context/BookingContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Room } from '../types/room';

const CheckIn = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, updateBookingStatus, submitIdProof, refreshBookings } = useBooking();
  const booking = bookings.find(b => b.id === bookingId);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);

  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400';
    return imageUrl.startsWith('/uploads/') ? `${API_BASE}${imageUrl}` : imageUrl;
  };

  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [idType, setIdType] = useState('Government ID');
  const [idProof, setIdProof] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdProof(e.target.files[0]);
    }
  };

  const handleIdSubmission = async () => {
    if (!idProof) {
      toast.error('Please upload ID proof');
      return;
    }

    setIsUploading(true);
    try {
      await submitIdProof(booking.id, idProof, idType);
      toast.success('ID proof submitted for verification');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload ID proof';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckIn = () => {
    if (!checkInDate || !checkInTime) {
      toast.error('Please select check-in date and time');
      return;
    }

    if (booking.idVerified !== 'approved') {
      toast.error('Your ID verification is still pending');
      return;
    }

    updateBookingStatus(booking.id, 'checked-in');
    setStep(2);
    toast.success('Check-in successful!');
  };

  const idStatusLabel = booking.idVerified === 'approved'
    ? 'Approved'
    : booking.idVerified === 'rejected'
      ? 'Rejected'
      : 'Pending';

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-stone-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl mb-3">Check-In Complete!</h1>
            <p className="text-xl text-stone-600 mb-8">
              Welcome to Grand Luxe Hotel
            </p>

            <div className="bg-stone-50 rounded-2xl p-6 mb-8 text-left">
              {room && (
                <>
                  <div className="mb-6">
                    <div className="text-sm text-stone-600 mb-1">Room</div>
                    <div className="text-2xl">{room.name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-stone-600 mb-1">Check-in Date</div>
                      <div className="text-lg">{format(new Date(checkInDate), 'MMM dd, yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-600 mb-1">Check-in Time</div>
                      <div className="text-lg">{checkInTime}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-stone-600 mb-1">Room Number</div>
                      <div className="text-lg">A-{Math.floor(Math.random() * 900) + 100}</div>
                    </div>
                    <div>
                      <div className="text-sm text-stone-600 mb-1">Floor</div>
                      <div className="text-lg">{Math.floor(Math.random() * 10) + 1}th Floor</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 text-left">
                <p className="mb-2"><strong>Important Information:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your key card is ready at the reception</li>
                  <li>Breakfast is served from 7:00 AM to 10:30 AM</li>
                  <li>WiFi password: GrandLuxe2024</li>
                  <li>Contact extension 100 for any assistance</li>
                </ul>
              </div>

              <Button onClick={() => navigate('/profile')} className="w-full h-12 rounded-xl">
                Back to My Bookings
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
          <h1 className="text-4xl mb-2">Check-In</h1>
          <p className="text-stone-600">Complete your check-in process</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
          <h2 className="text-2xl mb-6">Booking Details</h2>

          {room && (
            <div className="flex gap-6 mb-6 pb-6 border-b border-stone-200">
              <img
                src={resolveImageUrl(room.images?.[0] || '')}
                alt={room.name}
                className="w-32 h-32 object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400';
                }}
              />
              <div>
                <h3 className="text-xl mb-1">{room.name}</h3>
                <p className="text-stone-600 mb-2">Booking ID: {booking.id}</p>
                <p className="text-stone-600">
                  Check-in: {format(booking.checkIn, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}
          {!room && roomLoadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {roomLoadError}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl mb-6">Check-In Information</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="checkInDate">Select Check-In Date *</Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  id="checkInDate"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="pl-10 h-12"
                  min={format(booking.checkIn, 'yyyy-MM-dd')}
                  max={format(booking.checkOut, 'yyyy-MM-dd')}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="checkInTime">Select Check-In Time *</Label>
              <div className="relative mt-2">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <select
                  id="checkInTime"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full pl-10 h-12 px-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="14:00">2:00 PM (Standard)</option>
                  <option value="12:00">12:00 PM (Early Check-in - $50)</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM (Late Check-in)</option>
                </select>
              </div>
              <p className="text-sm text-stone-600 mt-2">
                Standard check-in time is 2:00 PM. Early check-in subject to availability.
              </p>
            </div>

            <div>
              <Label htmlFor="idType">ID Type *</Label>
              <select
                id="idType"
                value={idType}
                onChange={(event) => setIdType(event.target.value)}
                className="mt-2 w-full h-12 px-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
              >
                <option value="Government ID">Government ID</option>
              </select>
            </div>

            <div>
              <Label htmlFor="idProof">Upload ID Proof *</Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-stone-400 transition-colors">
                  <input
                    id="idProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdUpload}
                    className="hidden"
                  />
                  <label htmlFor="idProof" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-stone-400" />
                    {idProof ? (
                      <div>
                        <p className="text-green-600 mb-2">✓ {idProof.name}</p>
                        <p className="text-sm text-stone-600">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-stone-700 mb-2">Click to upload ID proof</p>
                        <p className="text-sm text-stone-600">PNG, JPG or PDF (max. 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleIdSubmission}
                  disabled={isUploading || !idProof}
                >
                  {isUploading ? 'Uploading...' : 'Submit ID for Verification'}
                </Button>
                <span className="text-sm text-stone-600">
                  Verification status: <strong>{idStatusLabel}</strong>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => refreshBookings()}
                >
                  Refresh Status
                </Button>
              </div>
              {booking.idVerified === 'rejected' && (
                <p className="mt-2 text-sm text-red-600">
                  Your ID was rejected. Please upload a new document.
                </p>
              )}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <p className="mb-2"><strong>Note:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Please ensure your ID is valid and clearly visible</li>
                <li>Original ID must be presented at reception</li>
                <li>Check-in is available after admin verification</li>
              </ul>
            </div>

            <Button
              onClick={handleCheckIn}
              className="w-full h-14 rounded-xl text-base"
              disabled={booking.idVerified !== 'approved'}
            >
              Complete Check-In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
