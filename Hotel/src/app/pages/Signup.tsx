// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router';
// import { Mail, Phone, Eye, EyeOff, User } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'sonner';

// const Signup = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isLoading, setIsLoading] = useState(false);
  
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   // Validation patterns
//   const validationPatterns = {
//     name: /^[a-zA-Z\s]{2,50}$/,
//     email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//   };

//   const validateField = (name: string, value: string): string => {
//     switch (name) {
//       case 'name':
//         if (!value.trim()) return 'Name is required';
//         if (!validationPatterns.name.test(value)) return 'Name must be 2-50 characters, letters only';
//         return '';
      
//       case 'email':
//         if (signupMethod === 'email' && !value.trim()) return 'Email is required';
//         if (value && !validationPatterns.email.test(value)) return 'Please enter a valid email';
//         return '';
      
//       case 'confirmPassword':
//         if (!value) return 'Please confirm your password';
//         if (value !== formData.password) return 'Passwords do not match';
//         return '';
      
//       default:
//         return '';
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({ ...prev, [id]: value }));
    
//     // Clear error for this field when user types
//     if (errors[id]) {
//       setErrors(prev => ({ ...prev, [id]: '' }));
//     }
//   };

//   const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     const error = validateField(id, value);
//     if (error) {
//       setErrors(prev => ({ ...prev, [id]: error }));
//     }
//   };

//   const handleSignupMethodChange = (method: 'email' | 'phone') => {
//     setSignupMethod(method);
//     // Clear related errors when switching methods
//     if (method === 'email') {
//       setErrors(prev => ({ ...prev, phone: '' }));
//     } else {
//       setErrors(prev => ({ ...prev, email: '' }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};
    
//     // Validate all fields
//     Object.keys(formData).forEach(key => {
//       const error = validateField(key, formData[key as keyof typeof formData]);
//       if (error) {
//         newErrors[key] = error;
//       }
//     });

//     // Special validation for email/phone based on method
//     if (signupMethod === 'email' && !formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     }
//     if (signupMethod === 'phone' && !formData.phone.trim()) {
//       newErrors.phone = 'Phone number is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       toast.error('Please fix the errors in the form');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Prepare data for backend
//       const signupData = {
//         name: formData.name.trim(),
//         email: signupMethod === 'email' ? formData.email.trim() : '',
//         phone: signupMethod === 'phone' ? formData.phone.trim() : '',
//         password: formData.password
//       };

//       // Call your auth context signup function
//       const success = await signup(
//         signupData.name,
//         signupData.email,
//         signupData.phone,
//         signupData.password
//       );
      
//       if (success) {
//         toast.success('Account created successfully!');
//         navigate('/login');
//       } else {
//         toast.error('Signup failed. Please try again.');
//       }
//     } catch (error: any) {
//       console.error('Signup error:', error);
      
//       // Handle specific error messages from backend
//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
        
//         // Update form errors based on backend response
//         if (error.response.data.message.includes('email')) {
//           setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
//         } else if (error.response.data.message.includes('phone')) {
//           setErrors(prev => ({ ...prev, phone: 'This phone number is already registered' }));
//         }
//       } else {
//         toast.error('An error occurred during signup');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Format phone number as user types
//   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value.replace(/\D/g, '');
    
//     // Limit to 15 digits
//     if (value.length > 15) value = value.slice(0, 15);
    
//     // Format with country code suggestion
//     if (value.length > 0 && !value.startsWith('+')) {
//       value = '+' + value;
//     }
    
//     setFormData(prev => ({ ...prev, phone: value }));
    
//     // Clear error when user types
//     if (errors.phone) {
//       setErrors(prev => ({ ...prev, phone: '' }));
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4 py-8">
//       <div className="w-full max-w-md">
//         <div className="bg-white rounded-3xl shadow-xl p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold mb-2">Create Account</h1>
//             <p className="text-stone-600">Join us for exclusive benefits</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5" noValidate>
//             <div>
//               <Label htmlFor="name">Full Name *</Label>
//               <Input
//                 id="name"
//                 type="text"
//                 placeholder="Enter your full name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 className={`mt-2 h-12 ${errors.name ? 'border-red-500' : ''}`}
//                 required
//                 disabled={isLoading}
//               />
//               {errors.name && (
//                 <p className="mt-1 text-sm text-red-500">{errors.name}</p>
//               )}
//             </div>

//             <div className="flex gap-2 p-1 bg-stone-100 rounded-xl">
//               <button
//                 type="button"
//                 onClick={() => handleSignupMethodChange('email')}
//                 disabled={isLoading}
//                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
//                   signupMethod === 'email'
//                     ? 'bg-white shadow-sm'
//                     : 'text-stone-600 hover:text-stone-900 disabled:hover:text-stone-600'
//                 }`}
//               >
//                 <Mail className="w-4 h-4" />
//                 Email
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleSignupMethodChange('phone')}
//                 disabled={isLoading}
//                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all ${
//                   signupMethod === 'phone'
//                     ? 'bg-white shadow-sm'
//                     : 'text-stone-600 hover:text-stone-900 disabled:hover:text-stone-600'
//                 }`}
//               >
//                 <Phone className="w-4 h-4" />
//                 Phone
//               </button>
//             </div>

//             {signupMethod === 'email' ? (
//               <div>
//                 <Label htmlFor="email">Email Address *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="example@domain.com"
//                   value={formData.email}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   className={`mt-2 h-12 ${errors.email ? 'border-red-500' : ''}`}
//                   required
//                   disabled={isLoading}
//                 />
//                 {errors.email && (
//                   <p className="mt-1 text-sm text-red-500">{errors.email}</p>
//                 )}
//               </div>
//             ) : (
//               <div>
//                 <Label htmlFor="phone">Phone Number *</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="+1234567890"
//                   value={formData.phone}
//                   onChange={handlePhoneChange}
//                   onBlur={handleBlur}
//                   className={`mt-2 h-12 ${errors.phone ? 'border-red-500' : ''}`}
//                   required
//                   disabled={isLoading}
//                 />
//                 {errors.phone && (
//                   <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
//                 )}
//               </div>
//             )}

//             <div>
//               <Label htmlFor="password">Password *</Label>
//               <div className="relative mt-2">
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   className={`h-12 pr-12 ${errors.password ? 'border-red-500' : ''}`}
//                   required
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
//                   disabled={isLoading}
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-500">{errors.password}</p>
//               )}
//               <p className="mt-1 text-xs text-stone-500">
//                 Must include uppercase, lowercase, number, and special character
//               </p>
//             </div>

//             <div>
//               <Label htmlFor="confirmPassword">Confirm Password *</Label>
//               <Input
//                 id="confirmPassword"
//                 type="password"
//                 placeholder="Re-enter your password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 className={`mt-2 h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
//                 required
//                 disabled={isLoading}
//               />
//               {errors.confirmPassword && (
//                 <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
//               )}
//             </div>

//             <div className="flex items-start gap-2 text-sm">
//               <input 
//                 type="checkbox" 
//                 className="w-4 h-4 mt-0.5 rounded border-stone-300" 
//                 required 
//                 disabled={isLoading}
//               />
//               <span className="text-stone-600">
//                 I agree to the{' '}
//                 <Link to="/terms" className="text-stone-900 hover:underline">
//                   Terms & Conditions
//                 </Link>{' '}
//                 and{' '}
//                 <Link to="/privacy" className="text-stone-900 hover:underline">
//                   Privacy Policy
//                 </Link>
//               </span>
//             </div>

//             <Button 
//               type="submit" 
//               className="w-full h-12 rounded-xl text-base"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating Account...
//                 </span>
//               ) : (
//                 'Create Account'
//               )}
//             </Button>
//           </form>

//           <div className="mt-6 text-center text-sm text-stone-600">
//             Already have an account?{' '}
//             <Link to="/login" className="text-stone-900 hover:underline font-medium">
//               Sign in
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;




import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validationPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!validationPatterns.name.test(value))
          return 'Name must be 2-50 characters, letters only';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validationPatterns.email.test(value))
          return 'Please enter a valid email';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (value.length < 8) return 'Invalid phone number';
        return '';

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 15) value = value.slice(0, 15);
    setFormData(prev => ({ ...prev, phone: value }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const error = validateField(id, value);
    if (error) setErrors(prev => ({ ...prev, [id]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(
        formData.name.trim(),
        formData.email.trim(),
        formData.phone.trim(),
        formData.password
      );

      if (success) {
        toast.success('Account created successfully!');
        navigate('/login');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-stone-600 mb-8">
          Join us for exclusive benefits
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-2 h-12 ${errors.name ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-2 h-12 ${errors.email ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              className={`mt-2 h-12 ${errors.phone ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="h-12 pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-2 h-12 ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-stone-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-stone-900">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
