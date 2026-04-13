import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth.js';
import type { RushUser } from '@/lib/types.js';

export default function AuthForm({ 
  type, 
  onSubmit, 
  isLoading 
}: { 
  type: 'login' | 'register', 
  onSubmit: (data: any) => Promise<void>,
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (type === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (type === 'register' && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="w-full max-w-md p-8 mx-auto rounded-lg" style={{ backgroundColor: '#141414', border: '1px solid #262626' }}>
      <h1 className="mb-6 text-2xl font-bold text-center" style={{ color: '#fafaf5' }}>
        {type === 'login' ? 'Login' : 'Create Account'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <div>
            <label className="block mb-1 text-sm" style={{ color: '#a3a3a0' }}>Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] focus:outline-none focus:border-[#d4a853]"
            />
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm" style={{ color: '#a3a3a0' }}>Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] focus:outline-none focus:border-[#d4a853]"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm" style={{ color: '#a3a3a0' }}>Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] focus:outline-none focus:border-[#d4a853]"
          />
        </div>

        {type === 'register' && (
          <div>
            <label className="block mb-1 text-sm" style={{ color: '#a3a3a0' }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] focus:outline-none focus:border-[#d4a853]"
            />
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded border border-red-500/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 mt-4 font-semibold rounded transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#d4a853', color: '#0a0a0a' }}
        >
          {isLoading ? 'Processing...' : type === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
