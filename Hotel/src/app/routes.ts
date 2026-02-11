import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RoomListing from './pages/RoomListing';
import RoomDetails from './pages/RoomDetails';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Services from './pages/Services';
import ServiceBooking from './pages/ServiceBooking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CheckIn from './pages/CheckIn';
import CheckOut from './pages/CheckOut';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'rooms', Component: RoomListing },
      { path: 'room/:id', Component: RoomDetails },
      { path: 'booking', Component: Booking },
      { path: 'payment/:bookingId', Component: Payment },
      { path: 'services', Component: Services },
      { path: 'book-service/:serviceId', Component: ServiceBooking },
      { path: 'profile', Component: Profile },
      { path: 'checkin/:bookingId', Component: CheckIn },
      { path: 'checkout/:bookingId', Component: CheckOut },
      { path: 'contact', Component: Contact },
    ],
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
  {
    path: '/forgot-password',
    Component: ForgotPassword,
  },
  {
    path: '/payment-success/:bookingId',
    Component: PaymentSuccess,
  },
  {
    path: '/payment-failed/:bookingId',
    Component: PaymentFailed,
  },
  {
    path: '/admin',
    Component: AdminDashboard,
  },
]);