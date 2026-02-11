import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  Hotel, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import type { Room } from '../types/room';

type AdminStats = {
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  occupancyRate: number;
};

type AdminBooking = {
  id: string;
  roomId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  checkIn: string | Date;
  checkOut: string | Date;
  bookingDate?: string | Date;
  status: string;
  paymentStatus?: string;
  idVerified?: 'pending' | 'approved' | 'rejected';
  idProofUrl?: string;
  idProofType?: string;
  idProofUploadedAt?: string | Date;
  totalPrice: number;
};

type AdminUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [roomsState, setRoomsState] = useState<Room[]>([]);
  const [bookingsState, setBookingsState] = useState<AdminBooking[]>([]);
  const [usersState, setUsersState] = useState<AdminUser[]>([]);
  const [statsState, setStatsState] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [roomForm, setRoomForm] = useState({
    name: '',
    type: 'Single',
    price: '',
    images: '',
    description: '',
    amenities: '',
    maxGuests: '1',
    size: '20',
    available: true,
  });

  const getAuthToken = () => {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      return null;
    }
    try {
      const parsed = JSON.parse(stored);
      return parsed.token as string | undefined;
    } catch {
      return null;
    }
  };

  const fetchJson = async (path: string, options?: RequestInit) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;
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

    return response.json();
  };

  const normalizeRoom = (room: any): Room => ({
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
  });

  const updateIdVerification = async (bookingId: string, idVerified: 'pending' | 'approved' | 'rejected') => {
    try {
      const updated = await fetchJson(`/api/admin/bookings/${bookingId}/id-verified`, {
        method: 'PATCH',
        body: JSON.stringify({ idVerified }),
      });

      setBookingsState((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                idVerified: updated.idVerified,
                idProofUrl: updated.idProofUrl,
                idProofType: updated.idProofType,
                idProofUploadedAt: updated.idProofUploadedAt,
              }
            : booking
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update ID status';
      setLoadError(message);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadAdminData = async () => {
      setIsLoading(true);
      setLoadError(null);
      console.log('Admin dashboard: loading data...');
      try {
        const [statsData, roomsData, bookingsData, usersData] = await Promise.all([
          fetchJson('/api/admin/stats'),
          fetchJson('/api/admin/rooms'),
          fetchJson('/api/admin/bookings'),
          fetchJson('/api/admin/users'),
        ]);

        setStatsState(statsData as AdminStats);
        setRoomsState((roomsData as any[]).map(normalizeRoom));
        setBookingsState(
          (bookingsData as any[]).map((booking) => ({
            id: booking._id || booking.id,
            roomId: booking.roomId,
            userId: booking.userId,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            bookingDate: booking.bookingDate,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            idVerified: booking.idVerified || 'pending',
            idProofUrl: booking.idProofUrl,
            idProofType: booking.idProofType,
            idProofUploadedAt: booking.idProofUploadedAt,
            totalPrice: booking.totalPrice,
          }))
        );
        setUsersState(
          (usersData as any[]).map((user) => ({
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          }))
        );
        console.log('Admin dashboard: data loaded');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load admin data';
        setLoadError(message);
        console.error('Admin dashboard: load failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [API_BASE, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Access Denied</h2>
          <p className="text-stone-600 mb-6">You don't have permission to access this page</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const stats = statsState || {
    totalRooms: roomsState.length,
    availableRooms: roomsState.filter(r => r.available).length,
    totalBookings: bookingsState.length,
    confirmedBookings: bookingsState.filter(b => b.status === 'confirmed').length,
    totalRevenue: bookingsState.reduce((sum, b) => sum + b.totalPrice, 0),
    occupancyRate: roomsState.length
      ? Number(((bookingsState.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length / roomsState.length) * 100).toFixed(1))
      : 0,
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800';
      case 'checked-out':
        return 'bg-stone-200 text-stone-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const idVerifiedBadgeClass = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const recentBookings = [...bookingsState]
    .sort((a, b) => {
      const aDate = new Date(a.bookingDate || a.checkIn).getTime();
      const bDate = new Date(b.bookingDate || b.checkIn).getTime();
      return bDate - aDate;
    })
    .slice(0, 5);

  const filteredBookings = bookingStatusFilter === 'all'
    ? bookingsState
    : bookingsState.filter((booking) => booking.status === bookingStatusFilter);

  const resetRoomForm = () => {
    setRoomForm({
      name: '',
      type: 'Single',
      price: '',
      images: '',
      description: '',
      amenities: '',
      maxGuests: '1',
      size: '20',
      available: true,
    });
  };

  const handleAddRoomClick = () => {
    setEditingRoomId(null);
    resetRoomForm();
    setIsRoomFormOpen(true);
  };

  const handleEditRoomClick = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomForm({
      name: room.name,
      type: room.type,
      price: room.price.toString(),
      images: room.images.join(', '),
      description: room.description,
      amenities: room.amenities.join(', '),
      maxGuests: room.maxGuests.toString(),
      size: room.size.toString(),
      available: room.available,
    });
    setIsRoomFormOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await fetchJson(`/api/admin/rooms/${roomId}`, { method: 'DELETE' });
      setRoomsState((prev) => prev.filter((room) => room.id !== roomId));
      console.log(`Admin dashboard: room deleted ${roomId}`);
      if (editingRoomId === roomId) {
        setEditingRoomId(null);
        setIsRoomFormOpen(false);
        resetRoomForm();
      }
    } catch (error) {
      console.error('Admin dashboard: delete room failed', error);
      setLoadError('Failed to delete room');
    }
  };

  const handleRoomSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const images = roomForm.images
      .split(',')
      .map((image) => image.trim())
      .filter(Boolean);

    const amenities = roomForm.amenities
      .split(',')
      .map((amenity) => amenity.trim())
      .filter(Boolean);

    const roomPayload = {
      name: roomForm.name.trim() || 'New Room',
      type: roomForm.type as Room['type'],
      price: Number(roomForm.price) || 0,
      images: images.length
        ? images
        : ['https://images.unsplash.com/photo-1655292912612-bb5b1bda9355?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
      description: roomForm.description.trim(),
      amenities,
      maxGuests: Number(roomForm.maxGuests) || 1,
      size: Number(roomForm.size) || 0,
      available: roomForm.available,
    };

    try {
      if (editingRoomId) {
        const updated = await fetchJson(`/api/admin/rooms/${editingRoomId}`, {
          method: 'PUT',
          body: JSON.stringify(roomPayload),
        });
        setRoomsState((prev) =>
          prev.map((room) => (room.id === editingRoomId ? normalizeRoom(updated) : room))
        );
        console.log(`Admin dashboard: room updated ${editingRoomId}`);
      } else {
        const created = await fetchJson('/api/admin/rooms', {
          method: 'POST',
          body: JSON.stringify(roomPayload),
        });
        setRoomsState((prev) => [normalizeRoom(created), ...prev]);
        console.log('Admin dashboard: room created');
      }

      setIsRoomFormOpen(false);
      setEditingRoomId(null);
      resetRoomForm();
    } catch (error) {
      console.error('Admin dashboard: save room failed', error);
      setLoadError('Failed to save room');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-stone-900 text-white min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-2xl mb-1">Admin Panel</h2>
            <p className="text-stone-400 text-sm">{user?.name}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'dashboard' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'rooms' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
              }`}
            >
              <Hotel className="w-5 h-5" />
              <span>Manage Rooms</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'bookings' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Bookings</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'payments' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('guests')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'guests' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Guests</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'settings' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>

          <div className="mt-8 pt-8 border-t border-stone-800">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Back to Website
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {isLoading && (
            <div className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
              Loading admin data...
            </div>
          )}
          {loadError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-4xl mb-8">Dashboard Overview</h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Hotel className="w-6 h-6 text-slate-700" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl mb-1">{stats.totalRooms}</div>
                  <div className="text-stone-600 text-sm">Total Rooms</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Hotel className="w-6 h-6 text-blue-600" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl mb-1">{stats.availableRooms}</div>
                  <div className="text-stone-600 text-sm">Available Rooms</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl mb-1">{stats.totalBookings}</div>
                  <div className="text-stone-600 text-sm">Total Bookings</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl mb-1">${stats.totalRevenue.toFixed(0)}</div>
                  <div className="text-stone-600 text-sm">Total Revenue</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl mb-1">{stats.occupancyRate}%</div>
                  <div className="text-stone-600 text-sm">Occupancy Rate</div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl">Recent Bookings</h2>
                  <Button size="sm" variant="outline">View All</Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-3 px-4 text-stone-600">Booking ID</th>
                        <th className="text-left py-3 px-4 text-stone-600">Guest</th>
                        <th className="text-left py-3 px-4 text-stone-600">Room</th>
                        <th className="text-left py-3 px-4 text-stone-600">Check-in</th>
                        <th className="text-left py-3 px-4 text-stone-600">Status</th>
                        <th className="text-left py-3 px-4 text-stone-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => {
                        const room = roomsState.find(r => r.id === booking.roomId);
                        return (
                          <tr key={booking.id} className="border-b border-stone-100">
                            <td className="py-4 px-4">{booking.id}</td>
                            <td className="py-4 px-4">{booking.guestName}</td>
                            <td className="py-4 px-4">{room?.name}</td>
                            <td className="py-4 px-4">{new Date(booking.checkIn).toLocaleDateString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${statusBadgeClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">${booking.totalPrice.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl">Manage Rooms</h1>
                <Button onClick={handleAddRoomClick}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Room
                </Button>
              </div>

              {isRoomFormOpen && (
                <form onSubmit={handleRoomSubmit} className="bg-white rounded-3xl p-6 shadow-sm mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder="Room name"
                      value={roomForm.name}
                      onChange={(event) => setRoomForm({ ...roomForm, name: event.target.value })}
                      required
                    />
                    <select
                      className="h-9 rounded-md border border-stone-200 px-3 text-sm"
                      value={roomForm.type}
                      onChange={(event) => setRoomForm({ ...roomForm, type: event.target.value })}
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Suite">Suite</option>
                      <option value="Deluxe">Deluxe</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Price per night"
                      value={roomForm.price}
                      onChange={(event) => setRoomForm({ ...roomForm, price: event.target.value })}
                      required
                    />
                    <Input
                      placeholder="Image URLs (comma separated)"
                      value={roomForm.images}
                      onChange={(event) => setRoomForm({ ...roomForm, images: event.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max guests"
                      value={roomForm.maxGuests}
                      onChange={(event) => setRoomForm({ ...roomForm, maxGuests: event.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Size (sqm)"
                      value={roomForm.size}
                      onChange={(event) => setRoomForm({ ...roomForm, size: event.target.value })}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={roomForm.description}
                    onChange={(event) => setRoomForm({ ...roomForm, description: event.target.value })}
                    className="mb-4"
                  />
                  <Input
                    placeholder="Amenities (comma separated)"
                    value={roomForm.amenities}
                    onChange={(event) => setRoomForm({ ...roomForm, amenities: event.target.value })}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={roomForm.available}
                        onChange={(event) =>
                          setRoomForm({ ...roomForm, available: event.target.checked })
                        }
                      />
                      Available
                    </label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsRoomFormOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingRoomId ? 'Update Room' : 'Add Room'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomsState.map((room) => (
                  <div key={room.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl mb-1">{room.name}</h3>
                          <p className="text-stone-600">{room.type}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {room.available ? 'Available' : 'Occupied'}
                        </span>
                      </div>

                      <div className="text-2xl mb-4">${room.price}/night</div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditRoomClick(room)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl">All Bookings</h1>
                <div className="flex gap-3">
                  <select
                    className="px-4 py-2 border border-stone-200 rounded-xl"
                    value={bookingStatusFilter}
                    onChange={(event) => setBookingStatusFilter(event.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked-in</option>
                    <option value="checked-out">Checked-out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-3 px-4 text-stone-600">Booking ID</th>
                        <th className="text-left py-3 px-4 text-stone-600">Guest Details</th>
                        <th className="text-left py-3 px-4 text-stone-600">Room</th>
                        <th className="text-left py-3 px-4 text-stone-600">Dates</th>
                        <th className="text-left py-3 px-4 text-stone-600">Status</th>
                        <th className="text-left py-3 px-4 text-stone-600">ID Proof</th>
                        <th className="text-left py-3 px-4 text-stone-600">ID Status</th>
                        <th className="text-left py-3 px-4 text-stone-600">Amount</th>
                        <th className="text-left py-3 px-4 text-stone-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const room = roomsState.find(r => r.id === booking.roomId);
                        return (
                          <tr key={booking.id} className="border-b border-stone-100 hover:bg-stone-50">
                            <td className="py-4 px-4">{booking.id}</td>
                            <td className="py-4 px-4">
                              <div>{booking.guestName}</div>
                              <div className="text-sm text-stone-600">{booking.guestEmail}</div>
                            </td>
                            <td className="py-4 px-4">{room?.name}</td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                {new Date(booking.checkIn).toLocaleDateString()} -
                              </div>
                              <div className="text-sm">
                                {new Date(booking.checkOut).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${statusBadgeClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {booking.idProofUrl ? (
                                <a
                                  href={`${API_BASE}${booking.idProofUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  View ID
                                </a>
                              ) : (
                                <span className="text-sm text-stone-500">Not uploaded</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${idVerifiedBadgeClass(booking.idVerified)}`}>
                                {booking.idVerified || 'pending'}
                              </span>
                            </td>
                            <td className="py-4 px-4">${booking.totalPrice.toFixed(2)}</td>
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateIdVerification(booking.id, 'approved')}
                                  disabled={!booking.idProofUrl}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateIdVerification(booking.id, 'rejected')}
                                  disabled={!booking.idProofUrl}
                                >
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h1 className="text-4xl mb-8">Payment Management</h1>
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                {bookingsState.length === 0 ? (
                  <div className="text-center py-16 text-stone-600">No payment records yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stone-200">
                          <th className="text-left py-3 px-4 text-stone-600">Booking ID</th>
                          <th className="text-left py-3 px-4 text-stone-600">Guest</th>
                          <th className="text-left py-3 px-4 text-stone-600">Amount</th>
                          <th className="text-left py-3 px-4 text-stone-600">Status</th>
                          <th className="text-left py-3 px-4 text-stone-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingsState.map((booking) => (
                          <tr key={booking.id} className="border-b border-stone-100">
                            <td className="py-4 px-4">{booking.id}</td>
                            <td className="py-4 px-4">{booking.guestName}</td>
                            <td className="py-4 px-4">${booking.totalPrice.toFixed(2)}</td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 bg-stone-100 text-stone-800 rounded-full text-sm">
                                {booking.paymentStatus || 'pending'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {new Date(booking.bookingDate || booking.checkIn).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div>
              <h1 className="text-4xl mb-8">Guest Management</h1>
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                {usersState.length === 0 ? (
                  <div className="text-center py-16 text-stone-600">No guests found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stone-200">
                          <th className="text-left py-3 px-4 text-stone-600">Name</th>
                          <th className="text-left py-3 px-4 text-stone-600">Email</th>
                          <th className="text-left py-3 px-4 text-stone-600">Phone</th>
                          <th className="text-left py-3 px-4 text-stone-600">Role</th>
                          <th className="text-left py-3 px-4 text-stone-600">Bookings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersState.map((guest) => {
                          const bookingCount = bookingsState.filter(
                            (booking) => booking.userId && booking.userId === guest.id
                          ).length;
                          return (
                            <tr key={guest.id} className="border-b border-stone-100">
                              <td className="py-4 px-4">{guest.name}</td>
                              <td className="py-4 px-4">{guest.email || '—'}</td>
                              <td className="py-4 px-4">{guest.phone || '—'}</td>
                              <td className="py-4 px-4">{guest.role}</td>
                              <td className="py-4 px-4">{bookingCount}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 className="text-4xl mb-8">Settings</h1>
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center py-16">
                <Settings className="w-16 h-16 mx-auto mb-4 text-stone-400" />
                <h3 className="text-2xl mb-2">Settings</h3>
                <p className="text-stone-600">Configure system settings</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
