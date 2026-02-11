export interface Hotel {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  description: string;
}

export const hotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Luxe Hotel',
    location: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcwNjY1NjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    description: 'Experience luxury in the heart of the city',
  },
  {
    id: '2',
    name: 'Ocean View Resort',
    location: 'Maldives',
    image: 'https://images.unsplash.com/photo-1729717949948-56b52db111dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjByZXNvcnR8ZW58MXx8fHwxNzcwNjE3NTY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    description: 'Tropical paradise awaits you',
  },
];

export interface Service {
  id: string;
  name: string;
  category: 'dining' | 'restaurant' | 'spa' | 'bar';
  description: string;
  image: string;
  priceRange: string;
  availableTimes: string[];
}

export const services: Service[] = [
  {
    id: 'dining-1',
    name: 'In-Room Dining',
    category: 'dining',
    description: '24/7 room service with international cuisine',
    image: 'https://images.unsplash.com/photo-1640108930193-76941e385e5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc3RhdXJhbnQlMjBkaW5pbmd8ZW58MXx8fHwxNzcwNjgxMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    priceRange: '$15-$50',
    availableTimes: ['24/7'],
  },
  {
    id: 'restaurant-1',
    name: 'Fine Dining Restaurant',
    category: 'restaurant',
    description: 'Michelin-starred restaurant with contemporary cuisine',
    image: 'https://images.unsplash.com/photo-1640108930193-76941e385e5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc3RhdXJhbnQlMjBkaW5pbmd8ZW58MXx8fHwxNzcwNjgxMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    priceRange: '$50-$150',
    availableTimes: ['12:00 PM', '1:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'],
  },
  {
    id: 'spa-1',
    name: 'Luxury Spa & Wellness',
    category: 'spa',
    description: 'Rejuvenate with our premium spa treatments',
    image: 'https://images.unsplash.com/photo-1604161926875-bb58f9a0d81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHNwYSUyMHdlbGxuZXNzfGVufDF8fHx8MTc3MDY3MDk1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    priceRange: '$80-$300',
    availableTimes: ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'],
  },
  {
    id: 'bar-1',
    name: 'Rooftop Bar',
    category: 'bar',
    description: 'Signature cocktails with panoramic city views',
    image: 'https://images.unsplash.com/photo-1729717949948-56b52db111dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjByZXNvcnR8ZW58MXx8fHwxNzcwNjE3NTY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    priceRange: '$12-$40',
    availableTimes: ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'],
  },
];

export const menuItems = [
  { id: '1', name: 'Grilled Salmon', price: 35, category: 'Main Course', image: 'https://images.unsplash.com/photo-1640108930193-76941e385e5e?w=400' },
  { id: '2', name: 'Caesar Salad', price: 15, category: 'Appetizers', image: 'https://images.unsplash.com/photo-1640108930193-76941e385e5e?w=400' },
  { id: '3', name: 'Chocolate Lava Cake', price: 12, category: 'Desserts', image: 'https://images.unsplash.com/photo-1640108930193-76941e385e5e?w=400' },
  { id: '4', name: 'Truffle Pasta', price: 28, category: 'Main Course', image: 'https://images.unsplash.com/photo-1640108930193-76941e385e5e?w=400' },
];
