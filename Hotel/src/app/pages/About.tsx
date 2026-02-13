import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const About = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What defines the Grand Luxe experience?',
      answer: 'Thoughtful design, calm service, and a pace that lets you feel fully present. We focus on the details that make a stay feel effortless.',
    },
    {
      question: 'Do you offer curated experiences?',
      answer: 'Yes. From dining reservations to spa sessions and private tours, we tailor experiences around your schedule and preferences.',
    },
    {
      question: 'Can I request special arrangements?',
      answer: 'Absolutely. Let us know in advance and we will handle the details from room setup to celebration planning.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#c9a35d] font-semibold">
                About Grand Luxe
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-stone-900 leading-[1.05]">
                A calm, curated stay
                <br />
                in the heart of the city.
              </h1>
              <p className="text-stone-600 text-base md:text-lg max-w-xl">
                We design every moment to feel intentional. From the way the light falls in your suite
                to the pace of service, Grand Luxe is built for guests who value quiet luxury.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Suites</p>
                <p className="text-2xl font-semibold text-stone-900 mt-2">120+</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Culinary</p>
                <p className="text-2xl font-semibold text-stone-900 mt-2">4 Concepts</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Wellness</p>
                <p className="text-2xl font-semibold text-stone-900 mt-2">Spa + Lounge</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-200/60 blur-2xl" />
            <div className="relative rounded-[28px] overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop"
                alt="Grand Luxe interiors"
                className="w-full h-[320px] md:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Signature Calm</p>
                <h2 className="text-2xl md:text-3xl font-semibold mt-2">Designed for slow mornings.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div className="rounded-[24px] bg-white border border-stone-200 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Our Values</p>
            <h3 className="text-2xl md:text-3xl font-semibold text-stone-900 mt-3">
              Quiet luxury, always.
            </h3>
            <p className="text-stone-600 mt-3">
              We focus on understated elegance, intuitive service, and spaces that help you breathe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Personalized care', copy: 'Your preferences shape every detail, from check-in to late checkout.' },
              { title: 'Thoughtful design', copy: 'Material choices and lighting create a calm, warm atmosphere.' },
              { title: 'Cuisine with character', copy: 'Seasonal menus celebrate craft, flavor, and local sourcing.' },
              { title: 'Wellness first', copy: 'Spa rituals and quiet spaces help you reset and recharge.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-5">
                <h4 className="text-base font-semibold text-stone-900">{item.title}</h4>
                <p className="text-sm text-stone-600 mt-2">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10">
          <div className="space-y-4">
            <p className="text-[11px] tracking-[0.35em] uppercase text-[#c9a35d] font-semibold">
              The Experience
            </p>
            <h3 className="text-3xl md:text-4xl font-semibold text-stone-900">A simple rhythm to every stay.</h3>
            <p className="text-stone-600">
              We built our experience around a gentle flow that keeps your time flexible and unhurried.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Arrive', copy: 'A warm welcome and a seamless arrival, any time of day.' },
              { title: 'Unwind', copy: 'Light-filled suites and quiet corners designed for rest.' },
              { title: 'Explore', copy: 'Dining, spa, and curated experiences on your schedule.' },
              { title: 'Return', copy: 'A calm space that feels familiar from the first night.' },
            ].map((step, index) => (
              <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5">
                <span className="text-sm font-semibold text-stone-500">0{index + 1}</span>
                <div>
                  <h4 className="text-base font-semibold text-stone-900">{step.title}</h4>
                  <p className="text-sm text-stone-600 mt-1">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <div className="rounded-[28px] bg-white border border-stone-200 p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#c9a35d] font-semibold">
                FAQ
              </p>
              <h3 className="text-3xl md:text-4xl font-semibold text-stone-900 mt-3">
                Quick questions, clear answers.
              </h3>
            </div>
            <p className="text-stone-600 max-w-xl">
              We keep it simple. If you need anything else, our concierge is here to help.
            </p>
          </div>

          <div className="mt-8 space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-stone-200/80 py-3">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left gap-4"
                >
                  <span className="text-base md:text-lg font-medium text-stone-900">
                    {faq.question}
                  </span>
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-600">
                    {openFaq === index ? <X className="w-4.5 h-4.5" /> : <Plus className="w-4.5 h-4.5" />}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="pt-3 pb-4 pr-10">
                    <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
