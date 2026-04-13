import React from 'react';
import PasswordForm from './password-form';

interface PasswordGateProps {
  onSuccess: (password: string) => Promise<void>;
  error?: string | null;
}

export default function PasswordGate({ onSuccess, error }: PasswordGateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <PasswordForm onSuccess={onSuccess} error={error} />
    </div >
  );
}
