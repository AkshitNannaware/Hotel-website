import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Lock, Clock, Smartphone, Building2, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useBooking } from '../context/BookingContext';
import { toast } from 'sonner';
import type { Room } from '../types/room';

// Razorpay integration
declare global {
  interface Window {
    Razorpay?: any;
  }
}

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, refreshBookings } = useBooking();
  const booking = bookings.find(b => b.id === bookingId);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const isCancelled = booking?.status === 'cancelled';
  const isIdApproved = booking?.idVerified === 'approved';
  const isPaymentLocked = Boolean(booking && (!isIdApproved || isCancelled));
  const paymentLockMessage = isCancelled
    ? 'This booking was cancelled. Payment is not available.'
    : 'Your ID proof must be approved by the admin before you can pay.';

  const getAuthToken = () => {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      return null;
    }
    try {
      const parsed = JSON.parse(stored);
      return parsed.token || null;
    } catch {
      return null;
    }
  };

  const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  useEffect(() => {
    refreshBookings().catch(() => {
      // ignore refresh errors
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadRoom = async () => {
      setRoomLoadError(null);
      try {
        const roomId = booking?.roomId;
        if (!roomId) {
          return;
        }
        const response = await fetch(`${API_BASE}/api/rooms/${roomId}`);
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
          <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await handlePaymentWithMethod();
  };

  // Handle UPI Payment
  const handleUPIPayment = async () => {
    await handlePaymentWithMethod('upi');
  };

  // Handle Net Banking Payment
  const handleNetBankingPayment = async () => {
    await handlePaymentWithMethod('netbanking');
  };

  // Generic payment handler with method preference
  const handlePaymentWithMethod = async (method?: string) => {
    setProcessing(true);

    if (isPaymentLocked) {
      toast.error(paymentLockMessage);
      setProcessing(false);
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      toast.error('Razorpay key is not configured');
      setProcessing(false);
      return;
    }

    if (!bookingId) {
      toast.error('Missing booking ID');
      setProcessing(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Please sign in to continue');
      setProcessing(false);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load Razorpay checkout');
      setProcessing(false);
      return;
    }

    try {
      const orderResponse = await fetch(`${API_BASE}/api/payments/razorpay/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!orderResponse.ok) {
        let message = `Failed to create order (${orderResponse.status})`;
        try {
          const data = await orderResponse.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const order = await orderResponse.json();

      const options: any = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Hotel Booking',
        description: `Booking ${booking.id}`,
        order_id: order.orderId,
        prefill: {
          name: booking.guestName,
          email: booking.guestEmail,
          contact: booking.guestPhone,
        },
        notes: {
          bookingId: booking.id,
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch(`${API_BASE}/api/payments/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            navigate(`/payment-success/${bookingId}`);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Payment verification failed';
            toast.error(message);
            navigate(`/payment-failed/${bookingId}`);
          } finally {
            setProcessing(false);
          }
        },
      };

      // Add method preference if specified
      if (method === 'upi') {
        options.method = { upi: true };
      } else if (method === 'netbanking') {
        options.method = { netbanking: true };
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        const description = response?.error?.description || 'Payment failed';
        toast.error(description);
        navigate(`/payment-failed/${bookingId}`);
        setProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      toast.error(message);
      setProcessing(false);
    }
  };

  // Handle Pay at Check-in option
  const handlePayAtCheckIn = () => {
    toast.success('Booking confirmed! Payment will be collected at check-in.');
    setTimeout(() => {
      navigate(`/payment-success/${bookingId}?payAtCheckin=true`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl mb-2">Payment</h1>
          <p className="text-stone-600">Choose your payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Options */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl mb-6">Complete Payment</h2>

              {isPaymentLocked && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {paymentLockMessage}
                </div>
              )}

              <div className="space-y-4">
                {/* Credit/Debit Card Payment */}
                <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-stone-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Credit / Debit Card</h3>
                      <p className="text-sm text-stone-600 mb-3">
                        Pay securely using your credit or debit card via Razorpay.
                      </p>
                      <form onSubmit={handlePayment}>
                        <Button
                          type="submit"
                          className="w-full h-12 rounded-xl text-base bg-stone-700 hover:bg-stone-800"
                          disabled={processing || isPaymentLocked}
                        >
                          {processing ? (
                            <>Processing...</>
                          ) : isPaymentLocked ? (
                            <>Awaiting ID Approval</>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Pay ${booking.totalPrice.toFixed(2)}
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* UPI Payment */}
                <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-stone-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">UPI</h3>
                      <p className="text-sm text-stone-600 mb-3">
                        Pay instantly using Google Pay, PhonePe, Paytm, or any UPI app.
                      </p>
                      <Button
                        onClick={handleUPIPayment}
                        className="w-full h-12 rounded-xl text-base bg-stone-700 hover:bg-stone-800"
                        disabled={processing || isPaymentLocked}
                      >
                        {processing ? (
                          <>Processing...</>
                        ) : isPaymentLocked ? (
                          <>Awaiting ID Approval</>
                        ) : (
                          <>
                            <Smartphone className="w-5 h-5 mr-2" />
                            Pay ${booking.totalPrice.toFixed(2)} via UPI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Net Banking Payment */}
                <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-stone-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Net Banking</h3>
                      <p className="text-sm text-stone-600 mb-3">
                        Pay directly from your bank account. Supports all major Indian banks.
                      </p>
                      <Button
                        onClick={handleNetBankingPayment}
                        className="w-full h-12 rounded-xl text-base bg-stone-700 hover:bg-stone-800"
                        disabled={processing || isPaymentLocked}
                      >
                        {processing ? (
                          <>Processing...</>
                        ) : isPaymentLocked ? (
                          <>Awaiting ID Approval</>
                        ) : (
                          <>
                            <Building2 className="w-5 h-5 mr-2" />
                            Pay ${booking.totalPrice.toFixed(2)} via Net Banking
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pay at Check-in Option */}
                <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-stone-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Pay at Check-in</h3>
                      <p className="text-sm text-stone-600 mb-3">
                        Reserve your room now and complete payment when you arrive at the hotel.
                      </p>
                      <ul className="text-sm text-stone-600 space-y-1.5 mb-4">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-stone-600 rounded-full"></span>
                          No payment required now
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-stone-600 rounded-full"></span>
                          Pay in cash or card at hotel
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-stone-600 rounded-full"></span>
                          Free cancellation (24 hours notice)
                        </li>
                      </ul>
                      <Button
                        onClick={handlePayAtCheckIn}
                        variant="outline"
                        className="w-full h-12 rounded-xl text-base"
                        disabled={isPaymentLocked}
                      >
                        <Clock className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-stone-600 mt-6">
                <Lock className="w-4 h-4" />
                <span>Secure payment powered by 256-bit SSL encryption</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-4">
              <h3 className="text-xl mb-6">Payment Summary</h3>

              {room && (
                <>
                  <div className="mb-6">
                    <h4 className="mb-1">{room.name}</h4>
                    <p className="text-stone-600 text-sm">{room.type} Room</p>
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Room Charges</span>
                      <span>${booking.roomPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Taxes</span>
                      <span>${booking.taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Service Charges</span>
                      <span>${booking.serviceCharges.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg">Amount to Pay</span>
                    <span className="text-3xl">${booking.totalPrice.toFixed(2)}</span>
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

export default Payment;