'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context.js';
import { cn } from '@/lib/utils.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { token?: string; user?: any; message?: string };

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      await login(data.token!, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Sign in</h2>
        <p className="text-sm text-zinc-400">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-zinc-400">Don't have an account? </span>
        <Link href="/register" className="text-amber-500 hover:text-amber-400 font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
}
