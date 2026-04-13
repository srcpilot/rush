"use client";

import { useState } from "react";

interface AuthFormProps {
  type: "login" | "register";
  onSubmit: (data: any) => Promise<void>;
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (type === "register" && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto p-6 bg-[#141414] border border-[#262626] rounded-lg">
      <h2 className="text-2xl font-bold text-[#fafaf5] capitalize">{type} to Rush</h2>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {type === "register" && (
        <div>
          <label className="block text-[#a3a3a0] text-sm mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] rounded focus:outline-none focus:border-[#d4a853]"
          />
        </div>
      )}

      <div>
        <label className="block text-[#a3a3a0] text-sm mb-1">Email</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] rounded focus:outline-none focus:border-[#d4a853]"
        />
      </div>

      <div>
        <label className="block text-[#a3a3a0] text-sm mb-1">Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] rounded focus:outline-none focus:border-[#d4a853]"
        />
      </div>

      {type === "register" && (
        <div>
          <label className="block text-[#a3a3a0] text-sm mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] rounded focus:outline-none focus:border-[#d4a853]"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-[#d4a853] hover:bg-[#b89345] text-[#0a0a0a] font-bold rounded transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : type === "login" ? "Login" : "Create Account"}
      </button>
    </form>
  );
}
