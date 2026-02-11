import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CreditCard, Smartphone, Building2, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useBooking } from '../context/BookingContext';
import { toast } from 'sonner';
import type { Room } from '../types/room';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings } = useBooking();
  const booking = bookings.find(b => b.id === bookingId);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

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

  useEffect(() => {
    const loadRoom = async () => {
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

    if (booking?.roomId) {
      loadRoom();
    }
  }, [API_BASE, booking?.roomId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        navigate(`/payment-success/${bookingId}`);
      } else {
        navigate(`/payment-failed/${bookingId}`);
      }
      setProcessing(false);
    }, 2000);
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
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl mb-6">Payment Method</h2>

              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} className="mb-8">
                <div className="space-y-3">
                  <div className="flex items-center p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 cursor-pointer transition-colors">
                    <RadioGroupItem value="card" id="card" className="mr-3" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5" />
                      <span>Credit / Debit Card</span>
                    </Label>
                  </div>

                  <div className="flex items-center p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 cursor-pointer transition-colors">
                    <RadioGroupItem value="upi" id="upi" className="mr-3" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Smartphone className="w-5 h-5" />
                      <span>UPI</span>
                    </Label>
                  </div>

                  <div className="flex items-center p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 cursor-pointer transition-colors">
                    <RadioGroupItem value="netbanking" id="netbanking" className="mr-3" />
                    <Label htmlFor="netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="w-5 h-5" />
                      <span>Net Banking</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <form onSubmit={handlePayment} className="space-y-5">
                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="mt-2 h-12"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        type="text"
                        placeholder="Name on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="mt-2 h-12"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          maxLength={5}
                          className="mt-2 h-12"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={3}
                          className="mt-2 h-12"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'upi' && (
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="mt-2 h-12"
                      required
                    />
                    <p className="text-sm text-stone-600 mt-2">
                      You will receive a payment request on your UPI app
                    </p>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <Label htmlFor="bank">Select Your Bank</Label>
                    <select
                      id="bank"
                      className="mt-2 w-full h-12 px-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
                      required
                    >
                      <option value="">Choose your bank</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-xl text-base"
                    disabled={processing}
                  >
                    {processing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Pay ${booking.totalPrice.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
                  <Lock className="w-4 h-4" />
                  <span>Secure payment powered by 256-bit SSL encryption</span>
                </div>
              </form>
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
