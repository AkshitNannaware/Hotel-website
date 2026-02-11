import React from 'react';
import { Link } from 'react-router';
import { Clock, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { services } from '../data/mockData';

const Services = () => {
  const categories = {
    dining: 'In-Room Dining',
    restaurant: 'Restaurant',
    spa: 'Spa & Wellness',
    bar: 'Bar & Lounge',
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Hotel Services</h1>
          <p className="text-stone-600">Enhance your stay with our premium services</p>
        </div>

        {Object.entries(categories).map(([category, title]) => {
          const categoryServices = services.filter(s => s.category === category);
          
          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl mb-6">{title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-sm">
                        {service.priceRange}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl mb-2">{service.name}</h3>
                      <p className="text-stone-600 mb-4">{service.description}</p>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>Available Times</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {service.availableTimes.map((time, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-stone-100 rounded-full text-sm"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link to={`/book-service/${service.id}`}>
                        <Button className="w-full rounded-xl">Book Now</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Services;
