import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { services } from '../data/mockData';
import { toast } from 'sonner';

const ServiceBooking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = services.find(s => s.id === serviceId);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [step, setStep] = useState(1);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Service not found</h2>
          <Button onClick={() => navigate('/services')}>Back to Services</Button>
        </div>
      </div>
    );
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error('Please select date and time');
      return;
    }

    setStep(2);
    toast.success('Service booked successfully!');
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-stone-50 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl mb-3">Booking Confirmed!</h1>
            <p className="text-xl text-stone-600 mb-8">
              Your {service.name.toLowerCase()} reservation is confirmed
            </p>

            <div className="bg-stone-50 rounded-2xl p-6 mb-8 text-left">
              <div className="mb-6">
                <div className="text-sm text-stone-600 mb-1">Service</div>
                <div className="text-2xl">{service.name}</div>
                <div className="text-stone-600">{service.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-stone-600 mb-1">Date</div>
                  <div className="text-lg">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">Time</div>
                  <div className="text-lg">{time}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-stone-600 mb-1">Number of Guests</div>
                  <div className="text-lg">{guests}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">Booking ID</div>
                  <div className="text-lg">SRV{Date.now().toString().slice(-6)}</div>
                </div>
              </div>

              {specialRequests && (
                <div className="pt-6 border-t border-stone-200">
                  <div className="text-sm text-stone-600 mb-1">Special Requests</div>
                  <div>{specialRequests}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 text-left">
                <p className="mb-2"><strong>Confirmation sent!</strong></p>
                <p>A confirmation email has been sent with all the details. Please arrive 10 minutes before your reservation time.</p>
              </div>

              <Button onClick={() => navigate('/services')} className="w-full h-12 rounded-xl">
                Browse More Services
              </Button>

              <Button onClick={() => navigate('/')} variant="outline" className="w-full h-12 rounded-xl">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/services')} className="mb-4">
            ← Back to Services
          </Button>
          <h1 className="text-4xl mb-2">Book {service.name}</h1>
          <p className="text-stone-600">{service.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl mb-6">Reservation Details</h2>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="date">Select Date *</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10 h-12"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="time">Select Time *</Label>
                    <div className="relative mt-2">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <select
                        id="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-10 h-12 px-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                      >
                        <option value="">Choose a time slot</option>
                        {service.availableTimes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests">Number of Guests *</Label>
                    <div className="relative mt-2">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max="10"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requests">Special Requests (Optional)</Label>
                    <textarea
                      id="requests"
                      placeholder="Any dietary restrictions, preferences, or special requests?"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="mt-2 w-full h-32 px-4 py-3 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-start gap-3 mb-6">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-5 h-5 mt-1 rounded border-stone-300"
                    required
                  />
                  <label htmlFor="terms" className="text-stone-700">
                    I agree to the cancellation policy. Cancellations must be made at least 24 hours in advance.
                  </label>
                </div>

                <Button type="submit" className="w-full h-14 rounded-xl text-base">
                  Confirm Reservation
                </Button>
              </div>
            </form>
          </div>

          {/* Service Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-4">
              <h3 className="text-xl mb-6">Service Details</h3>

              <div className="mb-6">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover rounded-2xl"
                />
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-stone-600 mb-1">Service</div>
                  <div className="text-lg">{service.name}</div>
                </div>

                <div>
                  <div className="text-sm text-stone-600 mb-1">Category</div>
                  <div className="capitalize">{service.category}</div>
                </div>

                <div>
                  <div className="text-sm text-stone-600 mb-1">Price Range</div>
                  <div className="text-lg">{service.priceRange}</div>
                </div>

                <div>
                  <div className="text-sm text-stone-600 mb-1">Available Times</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {service.availableTimes.map((t) => (
                      <span key={t} className="px-3 py-1 bg-stone-100 rounded-full text-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                <p>✓ Free cancellation up to 24 hours before reservation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBooking;
