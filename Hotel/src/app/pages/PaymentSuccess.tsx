import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, Download, Home, Clock, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0f1210] text-[#efece6]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(86,98,85,0.35), transparent 60%), radial-gradient(circle at 80% 70%, rgba(74,92,80,0.35), transparent 60%), linear-gradient(180deg, rgba(10,12,10,0.9), rgba(10,12,10,0.6))',
          }}
        />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:220px_100%]" />

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="rounded-[2rem] border border-[#4b5246] bg-[#3a4035]/95 shadow-2xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#4b5246]">
              <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-[#c9c3b6]">
                {[
                  'Select Dates & Guests',
                  'Choose Your Room',
                  'Guest Information',
                  'Payment',
                ].map((label, index) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full border border-[#9aa191] text-[#9aa191] text-[9px] flex items-center justify-center">
                      OK
                    </div>
                    <span>{label}</span>
                    {index < 3 && <span className="h-px w-8 bg-[#5b6255]" />}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="h-9 w-9 rounded-full border border-[#5b6255] text-[#d7d0bf] hover:bg-white/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-10 text-center">
              <div className="w-14 h-14 bg-[#d7d0bf] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#1f241f]" />
              </div>
              <h1 className="text-2xl sm:text-3xl text-[#efece6] mb-2">
                Congrats! Your booking is confirmed.
              </h1>
              <p className="text-sm text-[#c9c3b6] mb-8">
                {payAtCheckin
                  ? 'Payment will be collected at check-in.'
                  : 'Your payment was successful. Check your email for the invoice.'}
              </p>

              <div className="max-w-2xl mx-auto rounded-2xl border border-[#4b5246] bg-[#343a30] p-6 text-left">
                <div className="text-xs uppercase tracking-[0.2em] text-[#c9c3b6] mb-3">Confirmation summary</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#d7d0bf]">
                  <div>
                    <div className="text-xs text-[#9aa191]">Booking ID</div>
                    <div>{booking.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9aa191]">Guest Name</div>
                    <div>{booking.guestName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9aa191]">Check-in</div>
                    <div>{format(booking.checkIn, 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9aa191]">Check-out</div>
                    <div>{format(booking.checkOut, 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9aa191]">Room Type</div>
                    <div>{room?.type || 'Suite'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9aa191]">Room Count</div>
                    <div>{booking.rooms}</div>
                  </div>
                </div>
                {roomLoadError && !room && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                    {roomLoadError}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-[#4b5246] flex items-center justify-between text-[#efece6]">
                  <span>Total Payment</span>
                  <span className="text-xl">${booking.totalPrice.toFixed(2)}</span>
                </div>
                {payAtCheckin && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#c9c3b6]">
                    <Clock className="w-4 h-4" />
                    Pay at hotel reception with cash or card.
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleDownloadInvoice}
                  className="rounded-xl border border-[#5b6255] bg-transparent text-[#d7d0bf] hover:bg-white/10"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipts
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  className="rounded-xl border border-[#5b6255] bg-transparent text-[#d7d0bf] hover:bg-white/10"
                  variant="outline"
                >
                  View My Booking
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="rounded-xl border border-[#5b6255] bg-[#d7d0bf] text-[#1f241f] hover:bg-[#e5ddca]"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentSuccess;
