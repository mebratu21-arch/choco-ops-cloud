import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Candy, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { UserRole } from '../../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { useRegister } = useAuth();
  const registerMutation = useRegister();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'production_worker' as UserRole, // Default role
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await registerMutation.mutateAsync(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-chocolate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-chocolate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-8">
          <div className="text-center mb-6">
            <Link to="/login" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
              <Candy className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Join the CocoaFlow team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50/50 hover:bg-white focus:bg-white outline-none text-sm"
                placeholder="John Doe"
                disabled={registerMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50/50 hover:bg-white focus:bg-white outline-none text-sm"
                placeholder="you@cocoaflow.com"
                disabled={registerMutation.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50/50 hover:bg-white focus:bg-white outline-none text-sm"
                placeholder="Create a strong password"
                disabled={registerMutation.isPending}
              />
            </div>

             <div className="space-y-1.5">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role (Demo Only)
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-gray-50/50 hover:bg-white focus:bg-white outline-none text-sm"
                disabled={registerMutation.isPending}
              >
                <option value="production_worker">Production Worker</option>
                <option value="warehouse_worker">Warehouse Worker</option>
                <option value="quality_controller">Quality Controller</option>
                <option value="mechanic">Mechanic</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-400">In production, roles are assigned by admin.</p>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
