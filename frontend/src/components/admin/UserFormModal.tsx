import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Shield, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export interface UserFormData {
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'WAREHOUSE' | 'PRODUCTION' | 'QC' | 'MECHANIC' | 'CONTROLLER';
  password?: string;
  status: 'ACTIVE' | 'DISABLED';
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: Partial<UserFormData>;
  isEditing?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      role: 'OPERATOR',
      status: 'ACTIVE',
      ...initialData
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        email: '',
        role: 'OPERATOR',
        status: 'ACTIVE', 
        ...initialData
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isEditing ? <Shield className="w-5 h-5 text-gold-500" /> : <UserIcon className="w-5 h-5 text-gold-500" />}
            {isEditing ? 'Edit User' : 'Add New User'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="p-6 space-y-4">
          <div className="space-y-4">
            
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  className={`w-full bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm`}
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  className={`w-full bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm`}
                  placeholder="john@cocoaflow.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Field (only required for new users) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                {isEditing ? 'New Password (Optional)' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  className={`w-full bg-slate-950 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-sm`}
                  placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                  {...register('password', { 
                    required: !isEditing && 'Password is required',
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Role & Status Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Role</label>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-gold-500 transition-all text-sm appearance-none"
                  {...register('role')}
                >
                  <option value="OPERATOR">Operator</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="PRODUCTION">Production</option>
                  <option value="QC">Quality Control</option>
                  <option value="MECHANIC">Mechanic</option>
                  <option value="CONTROLLER">Controller</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status</label>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-gold-500 transition-all text-sm appearance-none"
                  {...register('status')}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gold-600 hover:bg-gold-500 text-white font-bold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save User
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
