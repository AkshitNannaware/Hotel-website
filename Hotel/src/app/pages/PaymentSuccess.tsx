import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, Download, Home, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import type { Room } from '../types/room';

const PaymentSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const payAtCheckin = searchParams.get('payAtCheckin') === 'true';
  const { bookings, updateBookingStatus, updatePaymentStatus } = useBooking();
  const booking = bookings.find(b => b.id === bookingId);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = React.useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!booking) {
      return;
    }

    const syncStatuses = async () => {
      if (booking.status !== 'confirmed') {
        await updateBookingStatus(booking.id, 'confirmed');
      }

      // Update payment status based on payment method
      if (payAtCheckin) {
        if (booking.paymentStatus !== 'pending') {
          await updatePaymentStatus(booking.id, 'pending');
        }
      } else {
        if (booking.paymentStatus !== 'paid') {
          await updatePaymentStatus(booking.id, 'paid');
        }
      }
    };

    syncStatuses().catch(() => {
      // ignore status sync errors
    });
  }, [booking?.id, booking?.status, booking?.paymentStatus, payAtCheckin, updateBookingStatus, updatePaymentStatus]);

  React.useEffect(() => {
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

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Booking not found</h2>
          <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    // Simulate invoice download
    alert('Invoice download started (demo)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-stone-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl mb-3">
            {payAtCheckin ? 'Booking Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className="text-xl text-stone-600 mb-8">
            {payAtCheckin 
              ? 'Your room is reserved. Payment will be collected at check-in'
              : 'Your booking has been confirmed'
            }
          </p>

          <div className="bg-stone-50 rounded-2xl p-6 mb-8 text-left">
            <div className="mb-6 pb-6 border-b border-stone-200">
              <div className="text-sm text-stone-600 mb-1">Booking ID</div>
              <div className="text-2xl">{booking.id}</div>
            </div>

            {room && (
              <>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-stone-600 mb-1">Room</div>
                    <div className="text-lg">{room.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone-600 mb-1">Room Type</div>
                    <div className="text-lg">{room.type}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-stone-600 mb-1">Check-in</div>
                    <div className="text-lg">{format(booking.checkIn, 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone-600 mb-1">Check-out</div>
                    <div className="text-lg">{format(booking.checkOut, 'MMM dd, yyyy')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-stone-600 mb-1">Guests</div>
                    <div className="text-lg">{booking.guests}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone-600 mb-1">Rooms</div>
                    <div className="text-lg">{booking.rooms}</div>
                  </div>
                </div>
              </>
            )}
            {!room && roomLoadError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {roomLoadError}
              </div>
            )}

            <div className="pt-6 border-t border-stone-200">
              <div className="flex justify-between items-center">
                <span className="text-lg text-stone-600">
                  {payAtCheckin ? 'Amount Due at Check-in' : 'Total Amount Paid'}
                </span>
                <span className="text-3xl">${booking.totalPrice.toFixed(2)}</span>
              </div>
              {payAtCheckin && (
                <div className="mt-4 flex items-center gap-2 text-sm text-stone-600">
                  <Clock className="w-4 h-4" />
                  <span>Payment can be made in cash or card at the hotel reception</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              onClick={handleDownloadInvoice}
              className="w-full h-12 rounded-xl"
              variant="outline"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Invoice
            </Button>

            <Button
              onClick={() => navigate('/profile')}
              className="w-full h-12 rounded-xl"
              variant="outline"
            >
              View My Bookings
            </Button>

            <Button
              onClick={() => navigate('/')}
              className="w-full h-12 rounded-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <p className="mb-2">
              <strong>Confirmation email sent!</strong>
            </p>
            <p>
              A confirmation email has been sent to {booking.guestEmail} with your booking details.
              {payAtCheckin && ' Please bring a valid ID and payment method for check-in.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
