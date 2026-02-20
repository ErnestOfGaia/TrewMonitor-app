'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Monitor, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { TerminalBox, TerminalButton, TerminalInput, LoadingSpinner } from '@/components/terminal-box';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession() || {};

  useEffect(() => {
    if (status === 'authenticated') {
      router?.replace?.('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if ((password?.length ?? 0) < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response?.json?.();

      if (!response?.ok) {
        setError(data?.error ?? 'Signup failed');
        return;
      }

      // Auto-login after signup
      const result = await signIn?.('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but login failed. Please try logging in.');
      } else {
        router?.replace?.('/dashboard');
      }
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Monitor className="w-10 h-10 text-terminal-green" />
            <h1 className="text-2xl font-bold tracking-wider">TREWMONITOR</h1>
          </div>
          <p className="text-terminal-dim text-sm">
            Create New User Account
          </p>
        </div>

        <TerminalBox title="USER REGISTRATION">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm p-2 border border-red-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-terminal-dim">
                <User className="w-4 h-4" />
                <span>DISPLAY NAME</span>
              </label>
              <TerminalInput
                type="text"
                value={name}
                onChange={setName}
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-terminal-dim">
                <Mail className="w-4 h-4" />
                <span>EMAIL ADDRESS</span>
              </label>
              <TerminalInput
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="user@domain.com"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-terminal-dim">
                <Lock className="w-4 h-4" />
                <span>PASSWORD</span>
              </label>
              <TerminalInput
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Min 6 characters"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-terminal-dim">
                <Lock className="w-4 h-4" />
                <span>CONFIRM PASSWORD</span>
              </label>
              <TerminalInput
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter password"
              />
            </div>

            <TerminalButton
              disabled={loading || !email || !password || !confirmPassword}
              className="w-full"
            >
              {loading ? '[ CREATING ACCOUNT... ]' : '[ REGISTER ]'}
            </TerminalButton>
          </form>

          <div className="mt-6 pt-4 border-t border-terminal-dim text-center">
            <p className="text-sm text-terminal-dim">
              Already registered?{' '}
              <Link href="/login" className="text-terminal-green hover:text-terminal-bright underline">
                LOGIN HERE
              </Link>
            </p>
          </div>
        </TerminalBox>
      </div>
    </div>
  );
}
