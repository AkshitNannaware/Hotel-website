import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  Hotel, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings,
  Bell,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  Mail,
  Phone,
  Eye,
  ClipboardList,
  Download,
  Upload
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
  guestPhone?: string;
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

type AdminService = {
  id: string;
  name: string;
  category: 'dining' | 'restaurant' | 'spa' | 'bar';
  description: string;
  image: string;
  priceRange: string;
  availableTimes: string[];
};

type AdminContact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  adminNotes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ContactStats = {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
};

type AdminServiceBooking = {
  id: string;
  serviceId: string;
  serviceName: string;
  category: 'dining' | 'restaurant' | 'spa' | 'bar';
  priceRange?: string;
  date: string | Date;
  time: string;
  guests: number;
  specialRequests?: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate?: string | Date;
};

const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [roomsState, setRoomsState] = useState<Room[]>([]);
  const [bookingsState, setBookingsState] = useState<AdminBooking[]>([]);
  const [serviceBookingsState, setServiceBookingsState] = useState<AdminServiceBooking[]>([]);
  const [usersState, setUsersState] = useState<AdminUser[]>([]);
  const [servicesState, setServicesState] = useState<AdminService[]>([]);
  const [contactsState, setContactsState] = useState<AdminContact[]>([]);
  const [contactStatsState, setContactStatsState] = useState<ContactStats | null>(null);
  const [statsState, setStatsState] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [serviceBookingStatusFilter, setServiceBookingStatusFilter] = useState('all');
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
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'dining',
    description: '',
    image: '',
    priceRange: '',
    availableTimes: '',
  });

  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [bookingIdProofFile, setBookingIdProofFile] = useState<File | null>(null);
  const [bookingIdProofType, setBookingIdProofType] = useState('passport');
  const [roomImageFiles, setRoomImageFiles] = useState<File[]>([]);
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isServiceBookingFormOpen, setIsServiceBookingFormOpen] = useState(false);
  const [expandedServiceCategories, setExpandedServiceCategories] = useState<Set<string>>(new Set(['restaurant']));
  const [expandedServiceBookingCategories, setExpandedServiceBookingCategories] = useState<Set<string>>(new Set(['restaurant']));
  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    status: 'confirmed' as const,
    totalPrice: '',
  });
  const [serviceBookingForm, setServiceBookingForm] = useState({
    serviceId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    date: '',
    time: '',
    guests: '1',
    status: 'confirmed' as const,
    specialRequests: '',
  });
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [hotelSettings, setHotelSettings] = useState({
    name: 'Grand Luxe',
    address: '',
    phone: '',
    email: '',
    checkInTime: '14:00',
    checkOutTime: '11:00',
  });
  const [billingSettings, setBillingSettings] = useState({
    razorpayKeyId: '',
    payoutAccount: '',
  });
  const [brandingSettings, setBrandingSettings] = useState({
    logoUrl: '',
    primaryColor: '#1c1917',
    accentColor: '#d6cdb8',
  });
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [settingsSavedAt, setSettingsSavedAt] = useState<string | null>(null);

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

  const fetchJson = async (path: string, options?: RequestInit & { isFormData?: boolean }) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Only set Content-Type for non-FormData requests
    if (!options?.isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...headers,
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

  const handleSaveSettings = () => {
    setSettingsSavedAt(new Date().toLocaleTimeString());
  };

  const handleSecuritySave = async () => {
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

    try {
      await fetchJson('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        }),
      });
      setSecurityError(null);
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSettingsSavedAt(new Date().toLocaleTimeString());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password';
      setSecurityError(message);
    }
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

  const normalizeService = (service: any): AdminService => ({
    id: service._id || service.id,
    name: service.name,
    category: service.category,
    description: service.description || '',
    image: service.image || '',
    priceRange: service.priceRange || '',
    availableTimes: service.availableTimes || [],
  });

  const normalizeServiceBooking = (booking: any): AdminServiceBooking => ({
    id: booking._id || booking.id,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    category: booking.category,
    priceRange: booking.priceRange,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    specialRequests: booking.specialRequests,
    userId: booking.userId,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    status: booking.status || 'confirmed',
    bookingDate: booking.bookingDate,
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

  const handleIdVerificationChange = (
    booking: AdminBooking,
    nextStatus: 'approved' | 'rejected'
  ) => {
    if (!booking.idProofUrl) {
      return;
    }

    if (booking.idVerified === 'approved' && nextStatus === 'rejected') {
      setLoadError('Approved ID verification cannot be rejected.');
      return;
    }

    if (booking.idVerified && booking.idVerified !== nextStatus) {
      const confirmed = confirm(
        `This ID is already marked as ${booking.idVerified}. Do you want to change it to ${nextStatus}?`
      );
      if (!confirmed) {
        return;
      }
    }

    updateIdVerification(booking.id, nextStatus);
  };

  const updateContactStatus = async (contactId: string, status: 'new' | 'read' | 'replied' | 'archived') => {
    try {
      const updated = await fetchJson(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setContactsState((prev) =>
        prev.map((contact) =>
          contact._id === contactId
            ? { ...contact, status: updated.contact.status, updatedAt: updated.contact.updatedAt }
            : contact
        )
      );

      // Update stats
      if (contactStatsState) {
        const oldContact = contactsState.find(c => c._id === contactId);
        if (oldContact) {
          setContactStatsState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              [oldContact.status]: Math.max(0, prev[oldContact.status] - 1),
              [status]: prev[status] + 1,
            };
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update contact status';
      setLoadError(message);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      await fetchJson(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
      });

      const deletedContact = contactsState.find(c => c._id === contactId);
      setContactsState((prev) => prev.filter((contact) => contact._id !== contactId));

      // Update stats
      if (contactStatsState && deletedContact) {
        setContactStatsState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            total: Math.max(0, prev.total - 1),
            [deletedContact.status]: Math.max(0, prev[deletedContact.status] - 1),
          };
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete contact';
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
        const [statsData, roomsData, bookingsData, usersData, contactsData, servicesData, serviceBookingsData] = await Promise.all([
          fetchJson('/api/admin/stats'),
          fetchJson('/api/admin/rooms'),
          fetchJson('/api/admin/bookings'),
          fetchJson('/api/admin/users'),
          fetchJson('/api/admin/contacts'),
          fetchJson('/api/services'),
          fetchJson('/api/admin/service-bookings'),
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
        setContactsState((contactsData as any).contacts || []);
        setContactStatsState((contactsData as any).stats || null);
        setServicesState((servicesData as any[]).map(normalizeService));
        setServiceBookingsState((serviceBookingsData as any[]).map(normalizeServiceBooking));
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
  }, [isAdmin]);

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

  const serviceCategoryLabel = (category: AdminService['category']) => {
    switch (category) {
      case 'dining':
        return 'In-room dining';
      case 'restaurant':
        return 'Restaurant';
      case 'spa':
        return 'Spa & wellness';
      case 'bar':
      default:
        return 'Bar & lounge';
    }
  };

  const serviceCategories = [
    { key: 'restaurant', label: 'Restaurant' },
    { key: 'spa', label: 'Spa & wellness' },
    { key: 'bar', label: 'Bar & lounge' },
    { key: 'dining', label: 'In-room dining' },
  ] as const;

  const recentBookings = [...bookingsState]
    .sort((a, b) => {
      const aDate = new Date(a.bookingDate || a.checkIn).getTime();
      const bDate = new Date(b.bookingDate || b.checkIn).getTime();
      return bDate - aDate;
    })
    .slice(0, 5);

  const recentServiceBookings = [...serviceBookingsState]
    .sort((a, b) => {
      const aDate = new Date(a.bookingDate || a.date).getTime();
      const bDate = new Date(b.bookingDate || b.date).getTime();
      return bDate - aDate;
    })
    .slice(0, 5);

  const filteredBookings = bookingStatusFilter === 'all'
    ? bookingsState
    : bookingsState.filter((booking) => booking.status === bookingStatusFilter);

  const filteredServiceBookings = serviceBookingStatusFilter === 'all'
    ? serviceBookingsState
    : serviceBookingsState.filter((booking) => booking.status === serviceBookingStatusFilter);

  const selectedServiceForBooking = servicesState.find(
    (service) => service.id === serviceBookingForm.serviceId
  );
  const serviceBookingTimes = selectedServiceForBooking?.availableTimes || [];

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
    setRoomImageFiles([]);
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
    setRoomImageFiles([]); // Clear any previously selected files
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
      let roomId: string;
      let updatedRoom: any;

      if (editingRoomId) {
        updatedRoom = await fetchJson(`/api/admin/rooms/${editingRoomId}`, {
          method: 'PUT',
          body: JSON.stringify(roomPayload),
        });
        roomId = editingRoomId;
        console.log(`Admin dashboard: room updated ${editingRoomId}`);
      } else {
        updatedRoom = await fetchJson('/api/admin/rooms', {
          method: 'POST',
          body: JSON.stringify(roomPayload),
        });
        roomId = updatedRoom._id || updatedRoom.id;
        console.log('Admin dashboard: room created');
      }

      // Upload images if any
      if (roomImageFiles.length > 0) {
        try {
          const formData = new FormData();
          roomImageFiles.forEach((file) => {
            formData.append('images', file);
          });

          const uploadResponse = await fetchJson(`/api/admin/rooms/${roomId}/upload-images`, {
            method: 'POST',
            body: formData,
            isFormData: true,
          });

          updatedRoom = uploadResponse.room;
          console.log('Admin dashboard: room images uploaded', uploadResponse);
        } catch (uploadError) {
          console.error('Failed to upload images:', uploadError);
          // Continue even if image upload fails
        }
      }

      // Update state
      if (editingRoomId) {
        setRoomsState((prev) =>
          prev.map((room) => (room.id === editingRoomId ? normalizeRoom(updatedRoom) : room))
        );
      } else {
        setRoomsState((prev) => [normalizeRoom(updatedRoom), ...prev]);
      }

      setIsRoomFormOpen(false);
      setEditingRoomId(null);
      resetRoomForm();
    } catch (error) {
      console.error('Admin dashboard: save room failed', error);
      setLoadError('Failed to save room');
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      category: 'dining',
      description: '',
      image: '',
      priceRange: '',
      availableTimes: '',
    });
    setServiceImageFile(null);
  };

  const handleAddServiceClick = () => {
    setEditingServiceId(null);
    resetServiceForm();
    setIsServiceFormOpen(true);
  };

  const handleEditServiceClick = (service: AdminService) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      category: service.category,
      description: service.description,
      image: service.image,
      priceRange: service.priceRange,
      availableTimes: service.availableTimes.join(', '),
    });
    setServiceImageFile(null);
    setIsServiceFormOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await fetchJson(`/api/services/${serviceId}`, { method: 'DELETE' });
      setServicesState((prev) => prev.filter((service) => service.id !== serviceId));
      if (editingServiceId === serviceId) {
        setEditingServiceId(null);
        setIsServiceFormOpen(false);
        resetServiceForm();
      }
    } catch (error) {
      console.error('Admin dashboard: delete service failed', error);
      setLoadError('Failed to delete service');
    }
  };

  const handleServiceSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const availableTimes = serviceForm.availableTimes
      .split(',')
      .map((time) => time.trim())
      .filter(Boolean);

    const payload = {
      name: serviceForm.name.trim() || 'New Service',
      category: serviceForm.category as AdminService['category'],
      description: serviceForm.description.trim(),
      image: serviceForm.image.trim(),
      priceRange: serviceForm.priceRange.trim(),
      availableTimes,
    };

    try {
      let serviceId: string;
      let updatedService: any;

      if (editingServiceId) {
        updatedService = await fetchJson(`/api/services/${editingServiceId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        serviceId = editingServiceId;
      } else {
        updatedService = await fetchJson('/api/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        serviceId = updatedService._id || updatedService.id;
      }

      if (serviceImageFile) {
        try {
          const formData = new FormData();
          formData.append('image', serviceImageFile);
          const uploadResponse = await fetchJson(`/api/services/${serviceId}/upload-image`, {
            method: 'POST',
            body: formData,
            isFormData: true,
          });
          updatedService = uploadResponse.service || updatedService;
        } catch (uploadError) {
          console.error('Admin dashboard: service image upload failed', uploadError);
        }
      }

      if (editingServiceId) {
        setServicesState((prev) =>
          prev.map((service) => (service.id === editingServiceId ? normalizeService(updatedService) : service))
        );
      } else {
        setServicesState((prev) => [normalizeService(updatedService), ...prev]);
      }

      setIsServiceFormOpen(false);
      setEditingServiceId(null);
      resetServiceForm();
    } catch (error) {
      console.error('Admin dashboard: save service failed', error);
      setLoadError('Failed to save service');
    }
  };

  const toggleServiceCategory = (categoryKey: string) => {
    const newSet = new Set(expandedServiceCategories);
    if (newSet.has(categoryKey)) {
      newSet.delete(categoryKey);
    } else {
      newSet.add(categoryKey);
    }
    setExpandedServiceCategories(newSet);
  };

  const toggleServiceBookingCategory = (categoryKey: string) => {
    const newSet = new Set(expandedServiceBookingCategories);
    if (newSet.has(categoryKey)) {
      newSet.delete(categoryKey);
    } else {
      newSet.add(categoryKey);
    }
    setExpandedServiceBookingCategories(newSet);
  };

  const handleExportBookings = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `bookings_backup_${timestamp}.json`;
    const dataStr = JSON.stringify(bookingsState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBookings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text) as AdminBooking[];

      if (!Array.isArray(importedData)) {
        alert('Invalid file format. Expected an array of bookings.');
        return;
      }

      // Validate bookings have required fields
      const valid = importedData.every(
        (booking) =>
          booking.id &&
          booking.roomId &&
          booking.guestName &&
          booking.guestEmail &&
          booking.guestPhone &&
          booking.checkIn &&
          booking.checkOut &&
          booking.status
      );

      if (!valid) {
        alert('Some bookings are missing required fields. Please check the file.');
        return;
      }

      // Send to backend to save
      const response = await fetchJson('/api/admin/bookings/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ bookings: importedData }),
      });

      if (response.success) {
        // Refresh bookings
        const bookings = await fetchJson('/api/admin/bookings');
        setBookingsState(
          (bookings as any[]).map((booking) => ({
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
        alert(`Successfully imported ${response.count} bookings!`);
      }
    } catch (error) {
      console.error('Admin dashboard: import bookings failed', error);
      const message = error instanceof Error ? error.message : 'Failed to import bookings. Please check the file format.';
      alert(message);
    }
  };

  const handleExportBookingsToExcel = async () => {
    try {
      const { utils, writeFile } = await import('xlsx');
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `bookings_${timestamp}.xlsx`;
      
      const data = bookingsState.map((booking) => ({
        'Booking ID': booking.id,
        'Guest Name': booking.guestName,
        'Guest Email': booking.guestEmail,
        'Guest Phone': booking.guestPhone || '',
        'Room ID': booking.roomId,
        'Check-In': new Date(booking.checkIn).toLocaleDateString(),
        'Check-Out': new Date(booking.checkOut).toLocaleDateString(),
        'Status': booking.status,
        'ID Verified': booking.idVerified || 'pending',
        'Total Price': booking.totalPrice,
        'Payment Status': booking.paymentStatus || 'pending',
      }));

      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Bookings');
      writeFile(wb, filename);
    } catch (error) {
      console.error('Export to Excel failed:', error);
      alert('Failed to export bookings to Excel');
    }
  };

  const handleImportBookingsFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const { read, utils } = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: 'array', cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet) as any[];

      const toIsoDate = (value: unknown) => {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
          return value.toISOString();
        }

        if (typeof value === 'number') {
          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
          const millis = excelEpoch.getTime() + value * 86400000;
          const date = new Date(millis);
          return Number.isNaN(date.getTime()) ? null : date.toISOString();
        }

        if (typeof value === 'string' && value.trim()) {
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? null : date.toISOString();
        }

        return null;
      };

      const invalidRows: number[] = [];

      const bookings = jsonData
        .map((row, index) => {
          const roomId = String(row['Room ID'] ?? '').trim();
          const guestName = String(row['Guest Name'] ?? '').trim();
          const guestEmail = String(row['Guest Email'] ?? '').trim();
          const guestPhone = String(row['Guest Phone'] ?? '').trim() || 'N/A';
          const checkIn = toIsoDate(row['Check-In']);
          const checkOut = toIsoDate(row['Check-Out']);

          if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
            invalidRows.push(index + 2);
            return null;
          }

          const rawPaymentStatus = String(row['Payment Status'] ?? '').trim().toLowerCase();
          const paymentStatus = rawPaymentStatus === 'completed' ? 'paid' : rawPaymentStatus || 'pending';

          return {
            id: row['Booking ID'] || `BOOKING-${Date.now()}-${index}`,
            roomId,
            guestName,
            guestEmail,
            guestPhone,
            checkIn,
            checkOut,
            status: row['Status'] || 'confirmed',
            idVerified: row['ID Verified'] || 'pending',
            totalPrice: parseFloat(row['Total Price']) || 0,
            paymentStatus,
          };
        })
        .filter(Boolean);

      if (invalidRows.length > 0) {
        alert(`Missing required fields in rows: ${invalidRows.join(', ')}`);
        return;
      }

      const response = await fetchJson('/api/admin/bookings/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ bookings }),
      });

      if (response.success) {
        const updatedBookings = await fetchJson('/api/admin/bookings');
        setBookingsState(
          (updatedBookings as any[]).map((booking) => ({
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
        alert(`Successfully imported ${response.count} bookings!`);
      }
    } catch (error) {
      console.error('Import from Excel failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to import bookings from Excel';
      alert(message);
    }
    event.target.value = '';
  };

  const handleAddServiceBookingClick = () => {
    setServiceBookingForm({
      serviceId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      date: '',
      time: '',
      guests: '1',
      status: 'confirmed',
      specialRequests: '',
    });
    setIsServiceBookingFormOpen(true);
  };

  const handleSaveServiceBooking = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const payload = {
        serviceId: serviceBookingForm.serviceId,
        guestName: serviceBookingForm.guestName.trim(),
        guestEmail: serviceBookingForm.guestEmail.trim(),
        guestPhone: serviceBookingForm.guestPhone.trim(),
        date: new Date(serviceBookingForm.date).toISOString(),
        time: serviceBookingForm.time.trim(),
        guests: Number(serviceBookingForm.guests) || 1,
        status: serviceBookingForm.status,
        specialRequests: serviceBookingForm.specialRequests.trim(),
      };

      const response = await fetchJson('/api/admin/service-bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response) {
        const updated = await fetchJson('/api/admin/service-bookings');
        setServiceBookingsState((updated as any[]).map(normalizeServiceBooking));
        setIsServiceBookingFormOpen(false);
        alert('Service booking created successfully!');
      }
    } catch (error) {
      console.error('Admin dashboard: save service booking failed', error);
      const message = error instanceof Error ? error.message : 'Failed to save service booking';
      alert(message);
    }
  };

  const handleExportServiceBookingsToExcel = async () => {
    try {
      const { utils, writeFile } = await import('xlsx');
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `service_bookings_${timestamp}.xlsx`;

      const data = serviceBookingsState.map((booking) => ({
        'Booking ID': booking.id,
        'Service ID': booking.serviceId,
        'Service Name': booking.serviceName,
        'Category': booking.category,
        'Date': new Date(booking.date).toLocaleDateString(),
        'Time': booking.time,
        'Guests': booking.guests,
        'Guest Name': booking.guestName,
        'Guest Email': booking.guestEmail,
        'Guest Phone': booking.guestPhone,
        'Status': booking.status,
        'Special Requests': booking.specialRequests || '',
      }));

      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'ServiceBookings');
      writeFile(wb, filename);
    } catch (error) {
      console.error('Export service bookings failed:', error);
      alert('Failed to export service bookings to Excel');
    }
  };

  const handleImportServiceBookingsFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const { read, utils } = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: 'array', cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet) as any[];

      const toIsoDate = (value: unknown) => {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
          return value.toISOString();
        }

        if (typeof value === 'number') {
          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
          const millis = excelEpoch.getTime() + value * 86400000;
          const date = new Date(millis);
          return Number.isNaN(date.getTime()) ? null : date.toISOString();
        }

        if (typeof value === 'string' && value.trim()) {
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? null : date.toISOString();
        }

        return null;
      };

      const invalidRows: number[] = [];
      const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled']);

      const bookings = jsonData
        .map((row, index) => {
          const serviceId = String(row['Service ID'] ?? '').trim();
          const serviceName = String(row['Service Name'] ?? '').trim();
          const guestName = String(row['Guest Name'] ?? '').trim();
          const guestEmail = String(row['Guest Email'] ?? '').trim();
          const guestPhone = String(row['Guest Phone'] ?? '').trim() || 'N/A';
          const date = toIsoDate(row['Date']);
          const time = String(row['Time'] ?? '').trim();
          const guests = Number(row['Guests'] ?? 1) || 1;
          const statusRaw = String(row['Status'] ?? '').trim().toLowerCase();
          const status = allowedStatuses.has(statusRaw) ? statusRaw : 'confirmed';

          if ((!serviceId && !serviceName) || !guestName || !guestEmail || !date || !time) {
            invalidRows.push(index + 2);
            return null;
          }

          return {
            id: row['Booking ID'] || `SERVICE-${Date.now()}-${index}`,
            serviceId: serviceId || undefined,
            serviceName: serviceName || undefined,
            category: row['Category'] || undefined,
            date,
            time,
            guests,
            guestName,
            guestEmail,
            guestPhone,
            status,
            specialRequests: row['Special Requests'] || '',
          };
        })
        .filter(Boolean);

      if (invalidRows.length > 0) {
        alert(`Missing required fields in rows: ${invalidRows.join(', ')}`);
        return;
      }

      const response = await fetchJson('/api/admin/service-bookings/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ bookings }),
      });

      if (response.success) {
        const updated = await fetchJson('/api/admin/service-bookings');
        setServiceBookingsState((updated as any[]).map(normalizeServiceBooking));
        alert(`Successfully imported ${response.count} service bookings!`);
      }
    } catch (error) {
      console.error('Import service bookings failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to import service bookings from Excel';
      alert(message);
    }

    event.target.value = '';
  };

  const handleAddBookingClick = () => {
    setEditingBookingId(null);
    setBookingForm({
      roomId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: '',
      checkOut: '',
      status: 'confirmed',
      totalPrice: '',
    });
    setBookingIdProofFile(null);
    setBookingIdProofType('passport');
    setIsBookingFormOpen(true);
  };

  const handleSaveBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      const payload = {
        roomId: bookingForm.roomId,
        guestName: bookingForm.guestName.trim(),
        guestEmail: bookingForm.guestEmail.trim(),
        guestPhone: bookingForm.guestPhone.trim(),
        checkIn: new Date(bookingForm.checkIn).toISOString(),
        checkOut: new Date(bookingForm.checkOut).toISOString(),
        status: bookingForm.status,
        totalPrice: parseFloat(bookingForm.totalPrice) || 0,
        guests: 1,
        rooms: 1,
        roomPrice: parseFloat(bookingForm.totalPrice) || 0,
        taxes: 0,
        serviceCharges: 0,
        userId: user?.id || '1',
        paymentStatus: 'pending',
      };

      const response = await fetchJson('/api/admin/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response) {
        if (bookingIdProofFile) {
          const bookingId = response._id || response.id;
          if (bookingId) {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('idProof', bookingIdProofFile);
            formData.append('idType', bookingIdProofType);

            const uploadResponse = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/id-proof`, {
              method: 'PATCH',
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              body: formData,
            });

            if (!uploadResponse.ok) {
              let message = `ID upload failed (${uploadResponse.status})`;
              try {
                const data = await uploadResponse.json();
                if (data?.message) {
                  message = data.message;
                }
              } catch {
                // ignore
              }
              throw new Error(message);
            }
          }
        }

        // Refresh bookings list
        const bookings = await fetchJson('/api/admin/bookings');
        setBookingsState(
          (bookings as any[]).map((booking) => ({
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
        setIsBookingFormOpen(false);
        alert('Booking created successfully!');
      }
    } catch (error) {
      console.error('Admin dashboard: save booking failed', error);
      alert('Failed to save booking');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-stone-900 text-white lg:min-h-screen p-4 sm:p-6 border-b border-stone-800 lg:border-b-0 lg:border-r lg:border-stone-800">
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
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'services' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Manage Services</span>
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
            onClick={() => setActiveTab('service-bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'service-bookings' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Service Bookings</span>
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
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'contacts' ? 'bg-white text-stone-900' : 'hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Contact Messages</span>
            {contactStatsState && contactStatsState.new > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {contactStatsState.new}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/newsletters')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-stone-800"
          >
            <Mail className="w-5 h-5" />
            <span>Newsletter</span>
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
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
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

            {/* Recent Room Bookings */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">Recent Room Bookings</h2>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('bookings')}>View All</Button>
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
                      <th className="text-left py-3 px-4 text-stone-600">Payment</th>
                      <th className="text-left py-3 px-4 text-stone-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 px-4 text-center text-stone-500">
                          No recent bookings
                        </td>
                      </tr>
                    ) : (
                      recentBookings.map((booking) => {
                        const room = roomsState.find(r => r.id === booking.roomId);
                        return (
                          <tr key={booking.id} className="border-b border-stone-100">
                            <td className="py-4 px-4">{booking.id.substring(0, 8)}...</td>
                            <td className="py-4 px-4">{booking.guestName}</td>
                            <td className="py-4 px-4">{room?.name || 'N/A'}</td>
                            <td className="py-4 px-4">{new Date(booking.checkIn).toLocaleDateString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${statusBadgeClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                booking.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : booking.paymentStatus === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {booking.paymentStatus || 'pending'}
                              </span>
                            </td>
                            <td className="py-4 px-4">${booking.totalPrice.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Service Bookings */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">Recent Service Bookings</h2>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('service-bookings')}>View All</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-4 text-stone-600">Booking ID</th>
                      <th className="text-left py-3 px-4 text-stone-600">Guest</th>
                      <th className="text-left py-3 px-4 text-stone-600">Service</th>
                      <th className="text-left py-3 px-4 text-stone-600">Date</th>
                      <th className="text-left py-3 px-4 text-stone-600">Time</th>
                      <th className="text-left py-3 px-4 text-stone-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentServiceBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 px-4 text-center text-stone-500">
                          No recent service bookings
                        </td>
                      </tr>
                    ) : (
                      recentServiceBookings.map((booking) => {
                        const service = servicesState.find(s => s.id === booking.serviceId);
                        return (
                          <tr key={booking.id} className="border-b border-stone-100">
                            <td className="py-4 px-4">{booking.id.substring(0, 8)}...</td>
                            <td className="py-4 px-4">{booking.guestName}</td>
                            <td className="py-4 px-4">{service?.name || booking.serviceName || 'N/A'}</td>
                            <td className="py-4 px-4">{new Date(booking.date).toLocaleDateString()}</td>
                            <td className="py-4 px-4">{booking.time}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${statusBadgeClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
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
                    placeholder="Image URLs (optional, comma separated)"
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
                
                {/* File Upload Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Upload Room Images (optional)
                  </label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={(event) => {
                      if (event.target.files) {
                        setRoomImageFiles(Array.from(event.target.files));
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {roomImageFiles.length > 0 && (
                    <div className="mt-2 text-sm text-stone-600">
                      <p className="font-medium">Selected files ({roomImageFiles.length}):</p>
                      <ul className="list-disc list-inside mt-1">
                        {roomImageFiles.map((file, idx) => (
                          <li key={idx}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
              {roomsState.map((room) => {
                const imageUrl = room.images[0];
                // Add API_BASE prefix for uploaded images
                const displayImage = imageUrl?.startsWith('/uploads/') 
                  ? `${API_BASE}${imageUrl}` 
                  : imageUrl;
                
                return (
                  <div key={room.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                    <img
                      src={displayImage}
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
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-stone-900">Services</h1>
                <p className="text-stone-600 mt-1 text-sm">Manage hotel offerings</p>
              </div>
              <Button onClick={handleAddServiceClick} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {isServiceFormOpen && (
              <form onSubmit={handleServiceSubmit} className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-stone-200">
                <h3 className="text-lg font-bold text-stone-900 mb-4">{editingServiceId ? 'Edit Service' : 'Add Service'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <Input
                    placeholder="Service name"
                    value={serviceForm.name}
                    onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })}
                    required
                  />
                  <select
                    className="h-9 rounded-lg border border-stone-200 px-3 text-sm"
                    value={serviceForm.category}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        category: event.target.value as AdminService['category'],
                      })
                    }
                  >
                    <option value="dining">In-room dining</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="spa">Spa & wellness</option>
                    <option value="bar">Bar & lounge</option>
                  </select>
                  <Input
                    placeholder="Price range"
                    value={serviceForm.priceRange}
                    onChange={(event) => setServiceForm({ ...serviceForm, priceRange: event.target.value })}
                  />
                  <div className="space-y-1">
                    <label className="text-xs text-stone-500">Image URL (optional)</label>
                    <Input
                      placeholder="https://..."
                      value={serviceForm.image}
                      onChange={(event) => setServiceForm({ ...serviceForm, image: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-stone-500">Upload image (optional)</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setServiceImageFile(event.target.files?.[0] || null)}
                    />
                    {serviceImageFile && (
                      <p className="text-xs text-stone-500">Selected: {serviceImageFile.name}</p>
                    )}
                  </div>
                </div>
                <Textarea
                  placeholder="Description"
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })}
                  className="mb-4"
                />
                <Input
                  placeholder="Available times (comma separated)"
                  value={serviceForm.availableTimes}
                  onChange={(event) => setServiceForm({ ...serviceForm, availableTimes: event.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsServiceFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    {editingServiceId ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            )}

            {servicesState.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                <p className="text-stone-600">No services available</p>
              </div>
            ) : (
              <div className="space-y-8">
                {serviceCategories.map((category) => {
                  const categoryServices = servicesState.filter((service) => service.category === category.key);
                  const categoryColor: Record<string, string> = {
                    restaurant: 'border-red-500',
                    spa: 'border-purple-500',
                    bar: 'border-blue-500',
                    dining: 'border-green-500',
                  };
                  const isExpanded = expandedServiceCategories.has(category.key);

                  return (
                    <div key={category.key}>
                      <button
                        onClick={() => toggleServiceCategory(category.key)}
                        className={`w-full flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 ${categoryColor[category.key] || 'border-stone-300'} hover:bg-stone-50 px-2 py-2 -mx-2 rounded transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{'🍴🧖🍹🍽️'['restaurant spa bar dining'.split(' ').indexOf(category.key)]}</div>
                          <div className="text-left">
                            <h2 className="text-lg font-bold text-stone-900">{category.label}</h2>
                            <p className="text-xs text-stone-500">{categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <>
                          {categoryServices.length === 0 ? (
                            <p className="text-sm text-stone-500 py-8">No services</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                              {categoryServices.map((service) => {
                                const displayImage = service.image?.startsWith('/uploads/')
                                  ? `${API_BASE}${service.image}`
                                  : service.image;

                                return (
                                <div key={service.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
                                  {displayImage ? (
                                    <div className="h-32 bg-stone-200 overflow-hidden">
                                      <img src={displayImage} alt={service.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="h-32 bg-gradient-to-br from-stone-100 to-stone-200" />
                                  )}
                                  <div className="p-4">
                                    <h3 className="font-bold text-stone-900 mb-1 line-clamp-1">{service.name}</h3>
                                    <p className="text-xs text-stone-500 mb-2">{service.priceRange}</p>
                                    <p className="text-xs text-stone-600 mb-3 line-clamp-2">{service.description}</p>
                                    {service.availableTimes.length > 0 && (
                                      <div className="mb-3">
                                        <div className="text-xs text-stone-500 mb-1">Times:</div>
                                        <div className="flex flex-wrap gap-1">
                                          {service.availableTimes.map((time) => (
                                            <span key={`${service.id}-${time}`} className="px-2 py-1 text-xs bg-stone-100 rounded text-stone-700">
                                              {time}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex gap-2 pt-3 border-t border-stone-100">
                                      <button
                                        onClick={() => handleEditServiceClick(service)}
                                        className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteService(service.id)}
                                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">All Bookings</h1>
              <div className="flex gap-3 items-center flex-wrap">
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
                <Button
                  onClick={handleAddBookingClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                  title="Add booking manually"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
                <Button
                  onClick={handleExportBookingsToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                  title="Download bookings as Excel"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <input
                  id="import-bookings-excel"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportBookingsFromExcel}
                  className="hidden"
                  title="Upload bookings Excel file"
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  onClick={() => document.getElementById('import-bookings-excel')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <a
                  href="/sample_bookings.xlsx"
                  download="sample_bookings.xlsx"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 font-medium text-sm shadow-sm"
                  title="Download sample bookings template"
                >
                  <Download className="w-4 h-4" />
                  Sample
                </a>
              </div>
            </div>

            {isBookingFormOpen && (
              <form onSubmit={handleSaveBooking} className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-stone-200">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Add Booking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    className="h-9 rounded-lg border border-stone-200 px-3 text-sm"
                    value={bookingForm.roomId}
                    onChange={(event) => setBookingForm({ ...bookingForm, roomId: event.target.value })}
                    required
                  >
                    <option value="">Select Room</option>
                    {roomsState.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} - ${room.price}/night
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Guest Name"
                    value={bookingForm.guestName}
                    onChange={(event) => setBookingForm({ ...bookingForm, guestName: event.target.value })}
                    required
                  />
                  <Input
                    placeholder="Guest Email"
                    type="email"
                    value={bookingForm.guestEmail}
                    onChange={(event) => setBookingForm({ ...bookingForm, guestEmail: event.target.value })}
                    required
                  />
                  <Input
                    placeholder="Guest Phone"
                    value={bookingForm.guestPhone}
                    onChange={(event) => setBookingForm({ ...bookingForm, guestPhone: event.target.value })}
                    required
                  />
                  <Input
                    placeholder="Check-In Date"
                    type="date"
                    value={bookingForm.checkIn}
                    onChange={(event) => setBookingForm({ ...bookingForm, checkIn: event.target.value })}
                    required
                  />
                  <Input
                    placeholder="Check-Out Date"
                    type="date"
                    value={bookingForm.checkOut}
                    onChange={(event) => setBookingForm({ ...bookingForm, checkOut: event.target.value })}
                    required
                  />
                  <select
                    className="h-9 rounded-lg border border-stone-200 px-3 text-sm"
                    value={bookingForm.status}
                    onChange={(event) => setBookingForm({ ...bookingForm, status: event.target.value as any })}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked-in</option>
                    <option value="checked-out">Checked-out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Input
                    placeholder="Total Amount"
                    type="number"
                    step="0.01"
                    value={bookingForm.totalPrice}
                    onChange={(event) => setBookingForm({ ...bookingForm, totalPrice: event.target.value })}
                    required
                  />
                  <select
                    className="h-9 rounded-lg border border-stone-200 px-3 text-sm"
                    value={bookingIdProofType}
                    onChange={(event) => setBookingIdProofType(event.target.value)}
                  >
                    <option value="passport">Passport</option>
                    <option value="driver-license">Driver License</option>
                    <option value="government-id">Government ID</option>
                  </select>
                  <div className="md:col-span-2">
                    <label className="text-sm text-stone-600 block mb-2">Upload ID proof (optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(event) => setBookingIdProofFile(event.target.files?.[0] || null)}
                      className="w-full text-sm text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsBookingFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Booking
                  </Button>
                </div>
              </form>
            )}

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
                      <th className="text-left py-3 px-4 text-stone-600">Payment</th>
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
                              <div className="space-y-1">
                                <a
                                  href={`${API_BASE}${booking.idProofUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  View ID
                                </a>
                                <div className="text-xs text-stone-500">
                                  {booking.idProofType ? booking.idProofType.replace(/-/g, ' ') : 'Document'}
                                </div>
                                {booking.idProofUploadedAt && (
                                  <div className="text-xs text-stone-500">
                                    {new Date(booking.idProofUploadedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-stone-500">Not uploaded</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${idVerifiedBadgeClass(booking.idVerified)}`}>
                              {booking.idVerified || 'pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              booking.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : booking.paymentStatus === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {booking.paymentStatus || 'pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4">${booking.totalPrice.toFixed(2)}</td>
                          <td className="py-4 px-4">
                            {booking.idVerified === 'approved' ? (
                              <span className="text-sm text-green-600 font-medium">✓ Approved</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleIdVerificationChange(booking, 'approved')}
                                  disabled={!booking.idProofUrl}
                                  title={!booking.idProofUrl ? 'Awaiting ID proof upload' : undefined}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleIdVerificationChange(booking, 'rejected')}
                                  disabled={!booking.idProofUrl}
                                  title={!booking.idProofUrl ? 'Awaiting ID proof upload' : undefined}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
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

        {activeTab === 'service-bookings' && (
          <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-stone-900">Service Bookings</h1>
                <p className="text-stone-600 mt-1 text-sm">Track customer reservations</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <select
                  className="px-4 py-2 border border-stone-200 rounded-xl"
                  value={serviceBookingStatusFilter}
                  onChange={(event) => setServiceBookingStatusFilter(event.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button
                  onClick={handleAddServiceBookingClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                  title="Add service booking manually"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
                <Button
                  onClick={handleExportServiceBookingsToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                  title="Download service bookings as Excel"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <input
                  id="import-service-bookings-excel"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportServiceBookingsFromExcel}
                  className="hidden"
                  title="Upload service bookings Excel file"
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  onClick={() => document.getElementById('import-service-bookings-excel')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <a
                  href="/sample_service_bookings.csv"
                  download="sample_service_bookings.csv"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 font-medium text-sm shadow-sm"
                  title="Download sample service bookings template"
                >
                  <Download className="w-4 h-4" />
                  Sample
                </a>
              </div>
            </div>

            {isServiceBookingFormOpen && (
              <form onSubmit={handleSaveServiceBooking} className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-stone-200">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Add Service Booking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    className="h-9 rounded-lg border border-stone-200 px-3 text-sm"
                    value={serviceBookingForm.serviceId}
                    onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, serviceId: event.target.value, time: '' })}
                    required
                  >
                    <option value="">Select Service</option>
                    {servicesState.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Guest Name"
                    value={serviceBookingForm.guestName}
                    onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, guestName: event.target.value })}
                    required
                  />
                  <Input
                    placeholder="Guest Email"
                    type="email"
                    value={serviceBookingForm.guestEmail}
                    onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, guestEmail: event.target.value })}
                    required
                  />
                  <Input
                    placeholder="Guest Phone"
                    value={serviceBookingForm.guestPhone}
                    onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, guestPhone: event.target.value })}
                    required
                  />
                  <Input
                    placeholder="Date"
                    type="date"
                    value={serviceBookingForm.date}
                    onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, date: event.target.value })}
                    required
                  />
                  {serviceBookingTimes.length > 0 ? (
                    <select
                      className="h-9 rounded-lg border border-stone-200 px-3 text-sm"
                      value={serviceBookingForm.time}
                      onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, time: event.target.value })}
                      required
                    >
                      <option value="">Select Time</option>
                      {serviceBookingTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      placeholder="Time (e.g., 7:00 PM)"
                      value={serviceBookingForm.time}
                      onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, time: event.target.value })}
                      required
                    />
                  )}
                  <Input
                    placeholder="Guests"
                    type="number"
                    min="1"
                    value={serviceBookingForm.guests}
                    onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, guests: event.target.value })}
                    required
                  />
                  <select
                    className="h-9 rounded-lg border border-stone-200 px-3 text-sm"
                    value={serviceBookingForm.status}
                    onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, status: event.target.value as any })}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <Textarea
                  placeholder="Special Requests"
                  value={serviceBookingForm.specialRequests}
                  onChange={(event) => setServiceBookingForm({ ...serviceBookingForm, specialRequests: event.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsServiceBookingFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Booking
                  </Button>
                </div>
              </form>
            )}

            {filteredServiceBookings.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                <p className="text-stone-600">No service bookings yet</p>
              </div>
            ) : (
              <div className="space-y-8">
                {serviceCategories.map((category) => {
                  const categoryBookings = filteredServiceBookings.filter((booking) => booking.category === category.key);
                  const categoryColor: Record<string, string> = {
                    restaurant: 'border-red-500',
                    spa: 'border-purple-500',
                    bar: 'border-blue-500',
                    dining: 'border-green-500',
                  };
                  const isExpanded = expandedServiceBookingCategories.has(category.key);

                  return (
                    <div key={category.key}>
                      <button
                        onClick={() => toggleServiceBookingCategory(category.key)}
                        className={`w-full flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 ${categoryColor[category.key] || 'border-stone-300'} hover:bg-stone-50 px-2 py-2 -mx-2 rounded transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{'🍴🧖🍹🍽️'['restaurant spa bar dining'.split(' ').indexOf(category.key)]}</div>
                          <div className="text-left">
                            <h2 className="text-lg font-bold text-stone-900">{category.label}</h2>
                            <p className="text-xs text-stone-500">{categoryBookings.length} booking{categoryBookings.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </button>

                      {isExpanded && (
                        <>
                          {categoryBookings.length === 0 ? (
                            <p className="text-sm text-stone-500 py-6">No bookings</p>
                          ) : (
                            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-8">
                              <div className="overflow-x-auto text-sm">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-stone-50 border-b border-stone-200">
                                      <th className="text-left py-3 px-4 font-semibold text-stone-700">Guest</th>
                                      <th className="text-left py-3 px-4 font-semibold text-stone-700">Service</th>
                                      <th className="text-left py-3 px-4 font-semibold text-stone-700">Date</th>
                                      <th className="text-left py-3 px-4 font-semibold text-stone-700">Time</th>
                                      <th className="text-left py-3 px-4 font-semibold text-stone-700">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {categoryBookings.map((booking) => (
                                      <tr key={booking.id} className="border-b border-stone-100 hover:bg-stone-50">
                                        <td className="py-3 px-4">
                                          <div className="font-medium text-stone-900">{booking.guestName}</div>
                                          <div className="text-xs text-stone-500">{booking.guestEmail}</div>
                                        </td>
                                        <td className="py-3 px-4 text-stone-700">{booking.serviceName}</td>
                                        <td className="py-3 px-4 text-stone-700">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td className="py-3 px-4 text-stone-700">{booking.time}</td>
                                        <td className="py-3 px-4">
                                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {booking.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

        {activeTab === 'contacts' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl mb-2">Contact Messages</h1>
                <p className="text-stone-600">Manage customer inquiries and feedback</p>
              </div>
              {contactStatsState && (
                <div className="flex gap-4">
                  <div className="bg-white rounded-2xl px-6 py-3 shadow-sm">
                    <div className="text-sm text-stone-500">Total</div>
                    <div className="text-2xl font-bold">{contactStatsState.total}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-3">
                    <div className="text-sm text-red-600">New</div>
                    <div className="text-2xl font-bold text-red-700">{contactStatsState.new}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3">
                    <div className="text-sm text-green-600">Replied</div>
                    <div className="text-2xl font-bold text-green-700">{contactStatsState.replied}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm">
              {contactsState.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-stone-400" />
                  <h3 className="text-2xl mb-2">No contact messages</h3>
                  <p className="text-stone-600">Customer inquiries will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactsState.map((contact) => {
                    const statusColors = {
                      new: 'bg-red-100 text-red-800 border-red-200',
                      read: 'bg-blue-100 text-blue-800 border-blue-200',
                      replied: 'bg-green-100 text-green-800 border-green-200',
                      archived: 'bg-stone-100 text-stone-800 border-stone-200',
                    };

                    return (
                      <div
                        key={contact._id}
                        className={`border-2 rounded-3xl p-6 transition-all ${
                          contact.status === 'new' ? 'border-red-200 bg-red-50/30' : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-6">
                          {/* Icon */}
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            contact.status === 'new' ? 'bg-red-100' : 'bg-stone-100'
                          }`}>
                            <Mail className={`w-7 h-7 ${contact.status === 'new' ? 'text-red-600' : 'text-stone-600'}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-stone-800 mb-1">{contact.name}</h3>
                                <div className="flex flex-wrap gap-3 text-sm text-stone-600">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {contact.email}
                                  </span>
                                  {contact.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {contact.phone}
                                    </span>
                                  )}
                                </div>
                                {contact.subject && (
                                  <div className="mt-2 text-sm font-semibold text-stone-700">
                                    Subject: {contact.subject}
                                  </div>
                                )}
                              </div>
                              <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[contact.status]}`}>
                                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                              </span>
                            </div>

                            <div className="bg-stone-50 rounded-2xl p-4 mb-4 border border-stone-200">
                              <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{contact.message}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-stone-500">
                                Received: {new Date(contact.createdAt).toLocaleDateString()} at{' '}
                                {new Date(contact.createdAt).toLocaleTimeString()}
                              </div>
                              <div className="flex gap-2">
                                {contact.status === 'new' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateContactStatus(contact._id, 'read')}
                                    className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Mark Read
                                  </Button>
                                )}
                                {(contact.status === 'new' || contact.status === 'read') && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateContactStatus(contact._id, 'replied')}
                                    className="rounded-xl bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Mark Replied
                                  </Button>
                                )}
                                {contact.status !== 'archived' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateContactStatus(contact._id, 'archived')}
                                    className="rounded-xl"
                                  >
                                    Archive
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteContact(contact._id)}
                                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-4xl mb-2">Settings</h1>
            <p className="text-stone-600 mb-8">Configure system settings</p>
            {settingsSavedAt && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Settings updated at {settingsSavedAt}.
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-600">Name</label>
                    <Input
                      value={profileSettings.name}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600">Email</label>
                    <Input
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600">Phone</label>
                    <Input
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <Button className="rounded-xl" onClick={handleSaveSettings}>Save Profile</Button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl mb-4">Security</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-600">Current Password</label>
                    <Input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600">New Password</label>
                    <Input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600">Confirm Password</label>
                    <Input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  {securityError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {securityError}
                    </div>
                  )}
                  <Button className="rounded-xl" onClick={handleSecuritySave}>Update Password</Button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl mb-4">Hotel Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-600">Hotel Name</label>
                    <Input
                      value={hotelSettings.name}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600">Address</label>
                    <Input
                      value={hotelSettings.address}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-stone-600">Phone</label>
                      <Input
                        value={hotelSettings.phone}
                        onChange={(e) => setHotelSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-stone-600">Email</label>
                      <Input
                        type="email"
                        value={hotelSettings.email}
                        onChange={(e) => setHotelSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-stone-600">Check-in Time</label>
                      <Input
                        type="time"
                        value={hotelSettings.checkInTime}
                        onChange={(e) => setHotelSettings(prev => ({ ...prev, checkInTime: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-stone-600">Check-out Time</label>
                      <Input
                        type="time"
                        value={hotelSettings.checkOutTime}
                        onChange={(e) => setHotelSettings(prev => ({ ...prev, checkOutTime: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button className="rounded-xl" onClick={handleSaveSettings}>Save Hotel Info</Button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl mb-4">Billing & Payments</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-600">Razorpay Key ID</label>
                    <Input
                      value={billingSettings.razorpayKeyId}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600">Payout Account</label>
                    <Input
                      value={billingSettings.payoutAccount}
                      onChange={(e) => setBillingSettings(prev => ({ ...prev, payoutAccount: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <Button className="rounded-xl" onClick={handleSaveSettings}>Save Billing</Button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl mb-4">Theme & Branding</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-600">Logo URL</label>
                    <Input
                      value={brandingSettings.logoUrl}
                      onChange={(e) => setBrandingSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-stone-600">Primary Color</label>
                      <Input
                        type="color"
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="mt-1 h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-stone-600">Accent Color</label>
                      <Input
                        type="color"
                        value={brandingSettings.accentColor}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="mt-1 h-12"
                      />
                    </div>
                  </div>
                  <Button className="rounded-xl" onClick={handleSaveSettings}>Save Branding</Button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl mb-4">Maintenance Mode</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Enable maintenance banner</p>
                      <p className="text-xs text-stone-500">Show a site-wide notice for guests.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={maintenanceEnabled}
                      onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                      className="h-5 w-5 accent-stone-700"
                    />
                  </div>
                  <Button className="rounded-xl" onClick={handleSaveSettings}>
                    {maintenanceEnabled ? 'Save & Enable' : 'Save & Disable'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;