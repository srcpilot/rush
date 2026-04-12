"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils.js";

interface PasswordFormProps {
  token: string;
}

export function PasswordForm({ token }: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/shares/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // In a real app, we might set a cookie or session here.
        // For this task, we'll just refresh to show the content.
        router.refresh();
      } else {
        const data = await res.json() as { message?: string };
        setError(data.message || "Invalid password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
      <div className="space-y-4 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-6 w-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Password Protected</h2>
          <p className="text-sm text-muted-foreground">
            This share is protected by a password. Please enter it to access the content.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "bg-primary text-primary-foreground hover:bg-primary/90 h-10"
          )}
        >
          {isLoading ? "Verifying..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
