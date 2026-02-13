import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

type Service = {
  id: string;
  name: string;
  category: 'dining' | 'restaurant' | 'spa' | 'bar';
  description: string;
  image: string;
  priceRange: string;
  availableTimes: string[];
};

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000';

  const categories = {
    dining: 'In-Room Dining',
    restaurant: 'Restaurant',
    spa: 'Spa & Wellness',
    bar: 'Bar & Lounge',
  };

  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    const trimmed = imageUrl.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/uploads/')) {
      return `${API_BASE}${trimmed}`;
    }
    if (trimmed.startsWith('uploads/')) {
      return `${API_BASE}/${trimmed}`;
    }
    if (trimmed.startsWith('/')) {
      return `${API_BASE}${trimmed}`;
    }
    return `${API_BASE}/${trimmed}`;
  };

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/services`);
        if (!response.ok) {
          throw new Error(`Failed to load services (${response.status})`);
        }
        const data = (await response.json()) as any[];
        const normalized = data.map((service) => ({
          id: service._id || service.id,
          name: service.name,
          category: String(service.category || '').toLowerCase(),
          description: service.description || '',
          image: service.image || '',
          priceRange: service.priceRange || '',
          availableTimes: service.availableTimes || [],
        }));
        setServices(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load services';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-stone-500 mb-3">
                Hotel Services
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 leading-tight">
                Simple comforts, crafted for a remarkable stay.
              </h1>
              <p className="text-stone-600 mt-4 max-w-2xl">
                Discover dining, wellness, and lounge experiences tailored for every pace.
                Reserve instantly and make every hour feel effortless.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {Object.entries(categories).map(([key, label]) => (
                  <span
                    key={key}
                    className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-xs uppercase tracking-wider text-stone-500">Categories</p>
                  <p className="text-2xl font-semibold text-stone-900">{Object.keys(categories).length}</p>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-xs uppercase tracking-wider text-stone-500">Total Services</p>
                  <p className="text-2xl font-semibold text-stone-900">{services.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-dashed border-stone-200 p-4 text-sm text-stone-600">
                  Open daily. Bookings are confirmed instantly and can be managed from your profile.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-14">

        {isLoading && (
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
            Loading services...
          </div>
        )}
        {loadError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && services.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-6 text-center text-stone-600">
            No services are available yet.
          </div>
        )}

        {!isLoading && !loadError && services.length > 0 &&
          Object.entries(categories).map(([category, title]) => {
            const categoryServices = services.filter((service) => service.category === category);
            if (categoryServices.length === 0) {
              return null;
            }
            return (
              <div key={category} id={`services-${category}`} className="mb-14 scroll-mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
                  <div className="rounded-3xl border border-stone-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                      {title}
                    </p>
                    <h2 className="text-2xl font-semibold text-stone-900 mt-3">
                      {categoryServices.length} option{categoryServices.length > 1 ? 's' : ''}
                    </h2>
                    <p className="text-sm text-stone-600 mt-2">
                      Curated experiences designed to fit your schedule.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {categoryServices.map((service) => {
                      const imageUrl = resolveImageUrl(service.image);
                      return (
                        <div
                          key={service.id}
                          className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                          {imageUrl ? (
                            <div className="relative h-40 overflow-hidden rounded-2xl">
                              <img
                                src={imageUrl}
                                alt={service.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(event) => {
                                  const target = event.currentTarget;
                                  target.style.display = 'none';
                                }}
                              />
                              <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs text-stone-700">
                                {service.priceRange || 'Pricing varies'}
                              </div>
                            </div>
                          ) : (
                            <div className="h-40 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200" />
                          )}

                          <div className="mt-4">
                            <h3 className="text-lg font-semibold text-stone-900">{service.name}</h3>
                            <p className="text-sm text-stone-600 mt-2 line-clamp-3">
                              {service.description || 'A tailored service experience for your stay.'}
                            </p>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <Clock className="w-4 h-4" />
                              <span>Available</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {service.availableTimes.length > 0 ? (
                                service.availableTimes.map((time, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                                  >
                                    {time}
                                  </span>
                                ))
                              ) : (
                                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                                  Daily
                                </span>
                              )}
                            </div>
                          </div>

                          <Link to={`/book-service/${service.id}`}>
                            <Button className="mt-5 w-full rounded-xl">Book Now</Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Services;
