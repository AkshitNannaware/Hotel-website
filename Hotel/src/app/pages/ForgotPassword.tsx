import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Password reset link sent. Check your email.');
      setEmail('');
    } catch {
      toast.error('Unable to send reset link. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/login')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <h1 className="text-3xl mb-2">Forgot Password</h1>
        <p className="text-stone-600 mb-6">
          Enter the email address linked to your account to receive a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
