"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth.js";
import { AuthForm } from "@/components/auth-form.js";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleRegister = async (formData: any) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    router.push("/dashboard");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-[#fafaf5]">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        <AuthForm type="register" onSubmit={handleRegister} />
        <p className="mt-4 text-center text-[#a3a3a0] text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#d4a853] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
