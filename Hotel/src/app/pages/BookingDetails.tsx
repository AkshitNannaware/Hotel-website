import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, CreditCard, CheckCircle, XCircle, DollarSign, MapPin, Hotel, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useBooking } from '../context/BookingContext';
import type { Room } from '../types/room';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings } = useBooking();
  const booking = bookings.find(b => b.id === bookingId);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);

  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400';
    return imageUrl.startsWith('/uploads/') ? `${API_BASE}${imageUrl}` : imageUrl;
  };

  useEffect(() => {
    const loadRoom = async () => {
      if (!booking?.roomId) return;
      
      setRoomLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms/${booking.roomId}`);
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

    loadRoom();
  }, [API_BASE, booking?.roomId]);

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

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'checked-in': return 'bg-blue-100 text-blue-800';
      case 'checked-out': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const paymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const idVerifiedColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl mb-2">Booking Details</h1>
          <p className="text-stone-600">Booking ID: {booking.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Status */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-2xl mb-4">Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-stone-600 mb-2">Booking Status</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">Payment Status</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${paymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">ID Verification</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${idVerifiedColor(booking.idVerified)}`}>
                    {booking.idVerified || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                Guest Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-stone-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-600">Name</p>
                    <p className="font-medium">{booking.guestName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-stone-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-600">Email</p>
                    <p className="font-medium">{booking.guestEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-stone-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-stone-600">Phone</p>
                    <p className="font-medium">{booking.guestPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Stay Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-stone-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-600">Check-in</p>
                      <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-stone-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-600">Check-out</p>
                      <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <User className="w-5 h-5 text-stone-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-600">Guests</p>
                      <p className="font-medium">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hotel className="w-5 h-5 text-stone-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-600">Rooms</p>
                      <p className="font-medium">{booking.rooms} Room{booking.rooms > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Information */}
            {room && (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-2xl mb-4 flex items-center gap-2">
                  <Hotel className="w-6 h-6" />
                  Room Information
                </h2>
                <div className="flex gap-4">
                  <img
                    src={resolveImageUrl(room.images?.[0] || '')}
                    alt={room.name}
                    className="w-32 h-32 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                    <p className="text-stone-600 mb-2">{room.type} Room</p>
                    <p className="text-sm text-stone-500">{room.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/room/${room.id}`)}
                      className="mt-3"
                    >
                      View Room Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ID Proof */}
            {booking.idProofUrl && (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-2xl mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  ID Proof
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-stone-600">Document Type</p>
                    <p className="font-medium capitalize">{booking.idProofType?.replace(/-/g, ' ')}</p>
                  </div>
                  {booking.idProofUploadedAt && (
                    <div>
                      <p className="text-sm text-stone-600">Uploaded On</p>
                      <p className="font-medium">{new Date(booking.idProofUploadedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  <a
                    href={`${API_BASE}${booking.idProofUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-blue-600 hover:underline text-sm"
                  >
                    View Document →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-4">
              <h3 className="text-xl mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Payment Summary
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-stone-200">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Room Charges</span>
                  <span className="font-medium">${booking.roomPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Taxes</span>
                  <span className="font-medium">${booking.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Service Charges</span>
                  <span className="font-medium">${booking.serviceCharges.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-3xl font-bold">${booking.totalPrice.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                {booking.status === 'confirmed' && booking.idVerified === 'approved' && booking.paymentStatus !== 'paid' && (
                  <Button
                    onClick={() => navigate(`/payment/${booking.id}`)}
                    className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-950"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay Now
                  </Button>
                )}
                {booking.status === 'confirmed' && booking.idVerified === 'approved' && (
                  <Button
                    onClick={() => navigate(`/checkin/${booking.id}`)}
                    className="w-full h-12 rounded-xl"
                    variant="outline"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Check In
                  </Button>
                )}
                {booking.status === 'checked-in' && (
                  <Button
                    onClick={() => navigate(`/checkout/${booking.id}`)}
                    className="w-full h-12 rounded-xl"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Check Out
                  </Button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="text-sm text-stone-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Booked on {new Date(booking.bookingDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
