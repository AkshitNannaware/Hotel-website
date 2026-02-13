import React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { User, Mail, Phone, Calendar, LogOut, Settings, Bell, CreditCard, Edit2, Save, X, AlertCircle, CheckCircle2, Award, Star, TrendingUp, MapPin, Gift, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Room } from '../types/room';

type ServiceBooking = {
  id: string;
  serviceId: string;
  serviceName: string;
  category: 'dining' | 'restaurant' | 'spa' | 'bar';
  priceRange: string;
  date: Date;
  time: string;
  guests: number;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: Date;
};

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { bookings, cancelBooking } = useBooking();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = user?.role === 'admin';
  const allowedTabs = isAdmin
    ? ['profile']
    : ['profile', 'bookings', 'service-bookings', 'payments', 'notifications', 'settings'];
  const resolveTab = (value: string | null) => (value && allowedTabs.includes(value) ? value : 'profile');
  const [activeTab, setActiveTab] = React.useState(() => resolveTab(searchParams.get('tab')));
  const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';
  
  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400';
    return imageUrl.startsWith('/uploads/') ? `${API_BASE}${imageUrl}` : imageUrl;
  };
  
  const [roomsState, setRoomsState] = React.useState<Room[]>([]);
  const [roomsLoadError, setRoomsLoadError] = React.useState<string | null>(null);
  const [adminBookingsState, setAdminBookingsState] = React.useState<any[]>([]);
  const [adminBookingsError, setAdminBookingsError] = React.useState<string | null>(null);
  const [serviceBookingsState, setServiceBookingsState] = React.useState<ServiceBooking[]>([]);
  const [serviceBookingsError, setServiceBookingsError] = React.useState<string | null>(null);
  const [serviceBookingsLoading, setServiceBookingsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(user?.name || '');
  const [editedEmail, setEditedEmail] = React.useState(user?.email || '');
  const [editedPhone, setEditedPhone] = React.useState(user?.phone || '');
  const [isSecurityOpen, setIsSecurityOpen] = React.useState(false);
  const [isTwoFactorOpen, setIsTwoFactorOpen] = React.useState(false);
  const [securityForm, setSecurityForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityError, setSecurityError] = React.useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(Boolean(user?.twoFactorEnabled));
  const [isSavingTwoFactor, setIsSavingTwoFactor] = React.useState(false);

  React.useEffect(() => {
    const nextTab = resolveTab(searchParams.get('tab'));
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, searchParams]);

  React.useEffect(() => {
    setTwoFactorEnabled(Boolean(user?.twoFactorEnabled));
  }, [user?.twoFactorEnabled]);

  const handleTabChange = (tab: string) => {
    const nextTab = resolveTab(tab);
    setActiveTab(nextTab);
    setSearchParams({ tab: nextTab });
  };

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

  React.useEffect(() => {
    const loadAdminBookings = async () => {
      if (!isAdmin) {
        return;
      }
      setAdminBookingsError(null);
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const token = auth.token as string | undefined;
        if (!token) {
          throw new Error('Session expired. Please log in again.');
        }

        const response = await fetch(`${API_BASE}/api/admin/bookings`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load bookings (${response.status})`);
        }

        const data = await response.json();
        setAdminBookingsState(Array.isArray(data) ? data : []);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load bookings';
        setAdminBookingsError(message);
      }
    };

    loadAdminBookings();
  }, [API_BASE, isAdmin]);

  React.useEffect(() => {
    const loadServiceBookings = async () => {
      if (!user || isAdmin) {
        setServiceBookingsState([]);
        return;
      }

      setServiceBookingsLoading(true);
      setServiceBookingsError(null);
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const token = auth.token as string | undefined;
        if (!token) {
          throw new Error('Session expired. Please log in again.');
        }

        const response = await fetch(`${API_BASE}/api/service-bookings`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load service bookings (${response.status})`);
        }

        const data = await response.json();
        const normalized = (data as any[]).map((booking) => ({
          id: booking._id || booking.id,
          serviceId: booking.serviceId,
          serviceName: booking.serviceName,
          category: booking.category,
          priceRange: booking.priceRange || '',
          date: new Date(booking.date),
          time: booking.time,
          guests: booking.guests,
          specialRequests: booking.specialRequests || '',
          status: booking.status || 'confirmed',
          bookingDate: new Date(booking.bookingDate || Date.now()),
        }));
        setServiceBookingsState(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load service bookings';
        setServiceBookingsError(message);
      } finally {
        setServiceBookingsLoading(false);
      }
    };

    loadServiceBookings();
  }, [API_BASE, isAdmin, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-stone-700" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Please log in</h2>
          <p className="text-stone-600 mb-6">You need to be logged in to view your profile</p>
          <Button onClick={() => navigate('/login')} className="px-8 h-12">
            Login
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth.token;
      
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedName,
          email: editedEmail,
          phone: editedPhone
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile (${response.status})`);
      }

      const data = await response.json();
      updateUser({
        name: editedName,
        email: editedEmail,
        phone: editedPhone
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setEditedPhone(user?.phone || '');
    setIsEditing(false);
  };

  const handlePasswordUpdate = async () => {
    if (!securityForm.currentPassword) {
      setSecurityError('Please enter your current password.');
      return;
    }
    if (!securityForm.newPassword) {
      setSecurityError('Please enter a new password.');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityError('New password and confirmation must match.');
      return;
    }

    setIsSavingPassword(true);
    setSecurityError(null);
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth.token as string | undefined;
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        }),
      });

      if (!response.ok) {
        let message = `Failed to update password (${response.status})`;
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsSecurityOpen(false);
      toast.success('Password updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password.';
      setSecurityError(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    const nextValue = !twoFactorEnabled;
    setIsSavingTwoFactor(true);
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth.token as string | undefined;
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ twoFactorEnabled: nextValue }),
      });

      if (!response.ok) {
        let message = `Failed to update two-factor setting (${response.status})`;
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      setTwoFactorEnabled(nextValue);
      updateUser({ twoFactorEnabled: nextValue });
      toast.success(nextValue ? 'Two-factor enabled.' : 'Two-factor disabled.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update two-factor setting.';
      toast.error(message);
    } finally {
      setIsSavingTwoFactor(false);
    }
  };

  const statusColors = {
    'pending': 'bg-amber-100 text-amber-800',
    'confirmed': 'bg-emerald-100 text-emerald-800',
    'checked-in': 'bg-blue-100 text-blue-800',
    'checked-out': 'bg-stone-200 text-stone-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  const idStatusColors = {
    'pending': 'bg-amber-100 text-amber-800',
    'approved': 'bg-emerald-100 text-emerald-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-stone-600 mt-1">Manage your profile and bookings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-stone-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-stone-800">{user.name}</h2>
                <p className="text-sm text-stone-600 mb-2">{user.role === 'admin' ? 'Administrator' : 'User'}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1 mb-6">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-stone-800 text-white' 
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                {!isAdmin && (
                  <>
                    <button
                      onClick={() => handleTabChange('bookings')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'bookings' 
                          ? 'bg-stone-800 text-white' 
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      My Bookings
                    </button>
                    <button
                      onClick={() => handleTabChange('service-bookings')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'service-bookings'
                          ? 'bg-stone-800 text-white'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      My Service Bookings
                    </button>
                    <button
                      onClick={() => handleTabChange('payments')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'payments' 
                          ? 'bg-stone-800 text-white' 
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Payments
                    </button>
                    <button
                      onClick={() => handleTabChange('notifications')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'notifications' 
                          ? 'bg-stone-800 text-white' 
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      Notifications
                      {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {bookings.filter(b => b.status === 'confirmed').length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleTabChange('settings')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'settings' 
                          ? 'bg-stone-800 text-white' 
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </>
                )}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              {/* Admin Dashboard Link */}
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full mt-4 px-4 py-2.5 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-colors text-sm font-medium"
                >
                  Admin Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">Personal Details</h2>
                    <p className="text-sm text-stone-600 mt-1">Manage your account information</p>
                  </div>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdit}
                        className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveProfile}
                        className="rounded-xl bg-stone-800 hover:bg-stone-900 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mt-1 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-stone-400" />
                        <span className="font-medium text-stone-800">{user.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Email Address</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="mt-1 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span className="font-medium text-stone-800">{user.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Phone Number</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        className="mt-1 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span className="font-medium text-stone-800">{user.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-stone-700" />
                    {isAdmin ? 'Booking Overview' : 'Your Journey'}
                  </h3>
                  {adminBookingsError && isAdmin && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {adminBookingsError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-stone-800 p-4 rounded-xl text-white">
                      <div className="text-2xl font-bold mb-1">
                        {isAdmin ? adminBookingsState.length : bookings.length}
                      </div>
                      <p className="text-sm text-stone-300">Total Bookings</p>
                    </div>
                    <div className="bg-stone-700 p-4 rounded-xl text-white">
                      <div className="text-2xl font-bold mb-1">
                        {isAdmin
                          ? adminBookingsState.filter(b => b.status === 'confirmed').length
                          : bookings.filter(b => b.status === 'confirmed').length}
                      </div>
                      <p className="text-sm text-stone-300">Active Bookings</p>
                    </div>
                    <div className="bg-stone-600 p-4 rounded-xl text-white">
                      <div className="text-2xl font-bold mb-1">
                        {isAdmin
                          ? adminBookingsState.filter(b => b.status === 'checked-out').length
                          : bookings.filter(b => b.status === 'checked-out').length}
                      </div>
                      <p className="text-sm text-stone-300">Completed Stays</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {!isAdmin && activeTab === 'bookings' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-stone-800">My Bookings</h2>
                  <p className="text-sm text-stone-600 mt-1">Manage your reservations</p>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-stone-700" />
                    </div>
                    <h3 className="text-lg font-medium text-stone-800 mb-2">No bookings yet</h3>
                    <p className="text-stone-600 mb-6">Start your journey with us today</p>
                    <Button onClick={() => navigate('/rooms')} className="bg-stone-800 hover:bg-stone-900 text-white rounded-xl h-12 px-6">
                      <MapPin className="w-4 h-4 mr-2" />
                      Browse Rooms
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const room = roomsState.find(r => r.id === booking.roomId);
                      return (
                        <div key={booking.id} className="border border-stone-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-white">
                          <div className="flex flex-col lg:flex-row gap-4">
                            <img
                              src={resolveImageUrl(room?.images?.[0] || '')}
                              alt={room?.name || 'Room'}
                              className="w-full lg:w-48 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400';
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                <div>
                                  <h3 className="font-semibold text-stone-800">{room?.name || 'Room'}</h3>
                                  <p className="text-xs text-stone-500">ID: {booking.id.slice(0, 8)}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                                <div>
                                  <p className="text-stone-500">Check-in</p>
                                  <p className="font-medium text-stone-800">{format(booking.checkIn, 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                  <p className="text-stone-500">Check-out</p>
                                  <p className="font-medium text-stone-800">{format(booking.checkOut, 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                  <p className="text-stone-500">Guests</p>
                                  <p className="font-medium text-stone-800">{booking.guests}</p>
                                </div>
                                <div>
                                  <p className="text-stone-500">Total</p>
                                  <p className="font-bold text-emerald-600">${booking.totalPrice.toFixed(2)}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(`/checkin/${booking.id}`)}
                                    disabled={booking.idVerified !== 'approved'}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                    Check In
                                  </Button>
                                )}
                                {booking.status === 'checked-in' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => navigate(`/checkout/${booking.id}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                    Check Out
                                  </Button>
                                )}
                                {booking.idVerified === 'approved' && booking.paymentStatus !== 'paid' && booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(`/payment/${booking.id}`)}
                                    className="bg-stone-900 hover:bg-stone-950 text-white rounded-lg"
                                  >
                                    Pay Now
                                  </Button>
                                )}
                                {booking.paymentStatus === 'paid' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="rounded-lg border-emerald-200 text-emerald-700"
                                  >
                                    Paid
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/booking-details/${booking.id}`)}
                                  className="rounded-lg border-stone-300 text-stone-700 hover:bg-stone-100"
                                >
                                  View Details
                                </Button>
                                {booking.status === 'confirmed' && booking.idVerified !== 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to cancel this booking?')) {
                                        try {
                                          await cancelBooking(booking.id);
                                          toast.success('Booking cancelled successfully');
                                        } catch (error) {
                                          toast.error('Failed to cancel booking');
                                        }
                                      }
                                    }}
                                  >
                                    <X className="w-3.5 h-3.5 mr-1.5" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {roomsLoadError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {roomsLoadError}
                  </div>
                )}

              </div>
            )}

            {/* Service Bookings Tab */}
            {!isAdmin && activeTab === 'service-bookings' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-stone-800">My Service Bookings</h2>
                  <p className="text-sm text-stone-600 mt-1">Your dining, spa, and lounge reservations</p>
                </div>

                {serviceBookingsLoading ? (
                  <div className="text-sm text-stone-500">Loading service bookings...</div>
                ) : serviceBookingsState.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-stone-700" />
                    </div>
                    <h3 className="text-lg font-medium text-stone-800 mb-2">No service bookings yet</h3>
                    <p className="text-stone-600">Reserve a dining or spa experience to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceBookingsState.map((booking) => (
                      <div key={booking.id} className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-stone-800">{booking.serviceName}</h3>
                            <p className="text-xs text-stone-500">Category: {booking.category}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                          <div>
                            <p className="text-stone-500">Date</p>
                            <p className="font-medium text-stone-800">{format(booking.date, 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-stone-500">Time</p>
                            <p className="font-medium text-stone-800">{booking.time}</p>
                          </div>
                          <div>
                            <p className="text-stone-500">Guests</p>
                            <p className="font-medium text-stone-800">{booking.guests}</p>
                          </div>
                          <div>
                            <p className="text-stone-500">Price Range</p>
                            <p className="font-medium text-stone-800">{booking.priceRange || '—'}</p>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mt-3 text-sm text-stone-600">
                            <span className="font-medium text-stone-700">Special requests:</span> {booking.specialRequests}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {serviceBookingsError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {serviceBookingsError}
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {!isAdmin && activeTab === 'payments' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-stone-800">Payment History</h2>
                  <p className="text-sm text-stone-600 mt-1">View your transaction records</p>
                </div>

                {bookings.filter(b => b.paymentStatus === 'paid').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-stone-700" />
                    </div>
                    <h3 className="text-lg font-medium text-stone-800 mb-2">No payments yet</h3>
                    <p className="text-stone-600">Your payment history will appear here</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-stone-800 rounded-xl p-4 text-white mb-4">
                      <p className="text-sm text-stone-300 mb-1">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ${bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        Across {bookings.filter(b => b.paymentStatus === 'paid').length} transactions
                      </p>
                    </div>

                    <div className="space-y-3">
                      {bookings.filter(b => b.paymentStatus === 'paid').map((booking) => {
                        const room = roomsState.find(r => r.id === booking.roomId);
                        return (
                          <div key={booking.id} className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                                  <CreditCard className="w-5 h-5 text-stone-700" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-stone-800">{room?.name || 'Room Booking'}</h3>
                                  <p className="text-xs text-stone-500 mt-1">
                                    {format(booking.checkIn, 'MMM dd')} - {format(booking.checkOut, 'MMM dd, yyyy')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-emerald-600">${booking.totalPrice.toFixed(2)}</p>
                                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium mt-1">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Paid
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {!isAdmin && activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-stone-800">Notifications</h2>
                  <p className="text-sm text-stone-600 mt-1">Stay updated with your bookings</p>
                </div>

                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => {
                    const room = roomsState.find(r => r.id === booking.roomId);
                    const notificationStyles = {
                      'confirmed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
                      'checked-in': { bg: 'bg-blue-100', text: 'text-blue-700' },
                      'checked-out': { bg: 'bg-stone-200', text: 'text-stone-700' },
                      'cancelled': { bg: 'bg-red-100', text: 'text-red-700' },
                      'pending': { bg: 'bg-amber-100', text: 'text-amber-700' }
                    };
                    const style = notificationStyles[booking.status] || { bg: 'bg-stone-100', text: 'text-stone-700' };

                    return (
                      <div key={booking.id} className="flex gap-3 p-4 border border-stone-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Bell className={`w-5 h-5 ${style.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-stone-800">
                              Booking {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600 mb-1">
                            {booking.status === 'confirmed' && `Your reservation for ${room?.name} has been confirmed.`}
                            {booking.status === 'checked-in' && `Welcome to ${room?.name}. Enjoy your stay!`}
                            {booking.status === 'checked-out' && `Thank you for staying at ${room?.name}.`}
                            {booking.status === 'cancelled' && `Your booking for ${room?.name} has been cancelled.`}
                            {booking.status === 'pending' && `Your booking request for ${room?.name} is being processed.`}
                          </p>
                          <p className="text-xs text-stone-500">
                            {format(booking.bookingDate, 'MMM dd, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {bookings.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-stone-700" />
                      </div>
                      <h3 className="text-lg font-medium text-stone-800 mb-2">No notifications</h3>
                      <p className="text-stone-600">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {!isAdmin && activeTab === 'settings' && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-stone-800">Settings</h2>
                  <p className="text-sm text-stone-600 mt-1">Manage your preferences</p>
                </div>

                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="border border-stone-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="w-5 h-5 text-stone-700" />
                      <h3 className="font-semibold text-stone-800">Notification Preferences</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-stone-500" />
                          <div>
                            <p className="font-medium text-sm text-stone-800">Email Notifications</p>
                            <p className="text-xs text-stone-600">Receive updates via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-10 h-5 bg-stone-300 rounded-full peer peer-checked:bg-stone-800 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-stone-500" />
                          <div>
                            <p className="font-medium text-sm text-stone-800">SMS Notifications</p>
                            <p className="text-xs text-stone-600">Get text messages for updates</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-10 h-5 bg-stone-300 rounded-full peer peer-checked:bg-stone-800 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div className="border border-stone-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-stone-700" />
                      <h3 className="font-semibold text-stone-800">Privacy & Security</h3>
                    </div>
                    <div className="space-y-2">
                      <button
                        className="w-full text-left p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                        onClick={() => {
                          setIsSecurityOpen((prev) => !prev);
                          setSecurityError(null);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <div>
                            <p className="font-medium text-sm text-stone-800">Change Password</p>
                            <p className="text-xs text-stone-600">Update your login credentials</p>
                          </div>
                        </div>
                      </button>
                      {isSecurityOpen && (
                        <div className="rounded-lg border border-stone-200 bg-white p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                                Current Password
                              </label>
                              <Input
                                type="password"
                                value={securityForm.currentPassword}
                                onChange={(e) =>
                                  setSecurityForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                                }
                                className="mt-1 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                                New Password
                              </label>
                              <Input
                                type="password"
                                value={securityForm.newPassword}
                                onChange={(e) =>
                                  setSecurityForm((prev) => ({ ...prev, newPassword: e.target.value }))
                                }
                                className="mt-1 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                                Confirm Password
                              </label>
                              <Input
                                type="password"
                                value={securityForm.confirmPassword}
                                onChange={(e) =>
                                  setSecurityForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                }
                                className="mt-1 border-stone-300 focus:border-stone-500 focus:ring-stone-500"
                              />
                            </div>
                          </div>
                          {securityError && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                              {securityError}
                            </div>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={handlePasswordUpdate}
                              disabled={isSavingPassword}
                              className="rounded-xl bg-stone-800 hover:bg-stone-900 text-white"
                            >
                              {isSavingPassword ? 'Updating...' : 'Update Password'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsSecurityOpen(false);
                                setSecurityError(null);
                              }}
                              className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      <button
                        className="w-full text-left p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                        onClick={() => setIsTwoFactorOpen((prev) => !prev)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Settings className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="font-medium text-sm text-stone-800">Two-Factor Authentication</p>
                              <p className="text-xs text-stone-600">Add extra security layer</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            Recommended
                          </span>
                        </div>
                      </button>
                      {isTwoFactorOpen && (
                        <div className="rounded-lg border border-stone-200 bg-white p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-stone-800">
                                {twoFactorEnabled ? 'Two-factor is enabled.' : 'Two-factor is disabled.'}
                              </p>
                              <p className="text-xs text-stone-600">
                                This stores a security preference for your account.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={handleTwoFactorToggle}
                              disabled={isSavingTwoFactor}
                              className="rounded-xl bg-stone-800 hover:bg-stone-900 text-white"
                            >
                              {isSavingTwoFactor
                                ? 'Saving...'
                                : twoFactorEnabled
                                  ? 'Disable'
                                  : 'Enable'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-red-800">Danger Zone</h3>
                        <p className="text-xs text-red-600">These actions cannot be undone</p>
                      </div>
                    </div>
                    <p className="text-sm text-stone-700 mb-3 p-3 bg-white rounded-lg border border-red-200">
                      <span className="font-medium text-red-700">Warning:</span> Deleting your account will permanently remove all your data.
                    </p>
                    <button className="w-full px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                      <AlertCircle className="w-4 h-4 mr-2 inline" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;