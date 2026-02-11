import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginMethod === 'email' ? email : phone;
    const success = await login(identifier, password);
    
    if (success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">Welcome Back</h1>
            <p className="text-stone-600">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
                  loginMethod === 'phone'
                    ? 'bg-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
            </div>

            {loginMethod === 'email' ? (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-12"
                  required
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 h-12"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-stone-300" />
                <span className="text-stone-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-stone-900 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-stone-900 hover:underline">
              Sign up
            </Link>
          </div>

          {/* <div className="mt-6 pt-6 border-t border-stone-200 text-center text-xs text-stone-500">
            Demo credentials: admin@hotel.com / admin (for admin access)
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
