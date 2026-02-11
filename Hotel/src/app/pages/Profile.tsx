import React from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Phone, Calendar, LogOut, Settings, Bell, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Room } from '../types/room';

const Profile = () => {
  const { user, logout } = useAuth();
  const { bookings, cancelBooking } = useBooking();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('profile');
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [roomsState, setRoomsState] = React.useState<Room[]>([]);
  const [roomsLoadError, setRoomsLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadRooms = async () => {
      setRoomsLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms`);
        if (!response.ok) {
          throw new Error(`Failed to load rooms (${response.status})`);
        }
        const data = await response.json();
        const normalized = (data as any[]).map((room) => ({
          id: room._id || room.id,
          name: room.name,
          type: room.type,
          price: room.price,
          images: room.images || [],
          description: room.description || '',
          amenities: room.amenities || [],
          maxGuests: room.maxGuests || 1,
          size: room.size || 0,
          available: room.available ?? true,
        }));
        setRoomsState(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load rooms';
        setRoomsLoadError(message);
      }
    };

    loadRooms();
  }, [API_BASE]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Please log in to view your profile</h2>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statusColors = {
    'pending': 'bg-amber-100 text-amber-800',
    'confirmed': 'bg-green-100 text-green-800',
    'checked-in': 'bg-blue-100 text-blue-800',
    'checked-out': 'bg-stone-200 text-stone-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  const idStatusColors = {
    'pending': 'bg-amber-100 text-amber-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl mb-1">{user.name}</h2>
                <p className="text-stone-600 text-sm">{user.role === 'admin' ? 'Admin' : 'Guest'}</p>
              </div>

              <div className="space-y-2">
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'profile' ? 'bg-stone-100 hover:bg-stone-200' : 'hover:bg-stone-100'} transition-colors`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'bookings' ? 'bg-stone-100 hover:bg-stone-200' : 'hover:bg-stone-100'} transition-colors`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <Calendar className="w-5 h-5" />
                  <span>My Bookings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-100 transition-colors">
                  <CreditCard className="w-5 h-5" />
                  <span>Payments</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-100 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>

              {user.role === 'admin' && (
                <Button
                  onClick={() => navigate('/admin')}
                  className="w-full mt-6 rounded-xl"
                  variant="default"
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Personal Details */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl">Personal Details</h2>
                  <Button variant="outline" size="sm" >Edit</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-stone-600 mb-2 block">Full Name</label>
                    <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                      <User className="w-5 h-5 text-stone-400" />
                      <span>{user.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-stone-600 mb-2 block">Email Address</label>
                    <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                      <Mail className="w-5 h-5 text-stone-400" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-stone-600 mb-2 block">Phone Number</label>
                    <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                      <Phone className="w-5 h-5 text-stone-400" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-stone-600 mb-2 block">Member Since</label>
                    <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-stone-400" />
                      <span>January 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking History */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl mb-6">Booking History</h2>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl mb-2">No bookings yet</h3>
                    <p className="text-stone-600 mb-6">Start your journey by booking a room</p>
                    <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const room = roomsState.find(r => r.id === booking.roomId);
                      return (
                        <div
                          key={booking.id}
                          className="border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {room && (
                              <img
                                src={room.images[0]}
                                alt={room.name}
                                className="w-full md:w-48 h-32 object-cover rounded-xl"
                              />
                            )}

                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="text-xl mb-1">{room?.name}</h3>
                                  <p className="text-stone-600">Booking ID: {booking.id}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[booking.status]}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm ${idStatusColors[booking.idVerified]}`}>
                                    ID: {booking.idVerified}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <div className="text-sm text-stone-600">Check-in</div>
                                  <div>{format(booking.checkIn, 'MMM dd')}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-stone-600">Check-out</div>
                                  <div>{format(booking.checkOut, 'MMM dd')}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-stone-600">Guests</div>
                                  <div>{booking.guests}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-stone-600">Total</div>
                                  <div>${booking.totalPrice.toFixed(2)}</div>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/checkin/${booking.id}`)}
                                    disabled={booking.idVerified !== 'approved'}
                                  >
                                    Check In
                                  </Button>
                                )}
                                {booking.status === 'checked-in' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => navigate(`/checkout/${booking.id}`)}
                                  >
                                    Check Out
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to cancel this booking?')) {
                                        try {
                                          await cancelBooking(booking.id);
                                          toast.success('Booking cancelled');
                                        } catch (error) {
                                          const message = error instanceof Error
                                            ? error.message
                                            : 'Failed to cancel booking';
                                          toast.error(message);
                                        }
                                      }
                                    }}
                                  >
                                    Cancel Booking
                                  </Button>
                                )}
                                {roomsLoadError && (
                                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {roomsLoadError}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Saved Preferences */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl mb-6">Saved Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl">
                  <div>
                    <h4 className="mb-1">Room Preferences</h4>
                    <p className="text-sm text-stone-600">High floor, King bed, City view</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl">
                  <div>
                    <h4 className="mb-1">Dietary Preferences</h4>
                    <p className="text-sm text-stone-600">Vegetarian</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl">
                  <div>
                    <h4 className="mb-1">Special Requests</h4>
                    <p className="text-sm text-stone-600">Extra pillows, Late check-out preferred</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;