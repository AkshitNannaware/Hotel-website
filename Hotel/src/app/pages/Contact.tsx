import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const Contact = () => {
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Message sent. We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      toast.error('Unable to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl mb-2">Contact Us</h1>
          <p className="text-stone-600">
            Have a question or need help? Send a message and our team will respond soon.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-2 min-h-[160px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl" disabled={isSending}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-stone-700" />
                <h2 className="text-lg">Call Us</h2>
              </div>
              <p className="text-stone-600">+1 555 010 234</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-stone-700" />
                <h2 className="text-lg">Email</h2>
              </div>
              <p className="text-stone-600">support@grandluxe.com</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-stone-700" />
                <h2 className="text-lg">Visit Us</h2>
              </div>
              <p className="text-stone-600">123 Luxe Avenue, New York, NY</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
