import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { useBooking } from '../context/BookingContext';

const BookNowFooterButton = () => {
  const navigate = useNavigate();
  const { setCurrentBooking } = useBooking();

  const handleBookNow = () => {
    navigate('/date-select');
  };

  return (
    <Button
      className="w-full bg-transparent border border-[#efece6] text-[#efece6] hover:bg-white/10 rounded-full px-6 py-2 text-xs uppercase tracking-wider mt-2"
      onClick={handleBookNow}
    >
      Book Now
    </Button>
  );
};

export default BookNowFooterButton;