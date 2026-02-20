'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Monitor, Lock, Mail, AlertCircle } from 'lucide-react';
import { TerminalBox, TerminalButton, TerminalInput, LoadingSpinner } from '@/components/terminal-box';
import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);

    try {
      const result = await signIn?.('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        router?.replace?.('/dashboard');
      }
    } catch {
      setError('Login failed. Please try again.');
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
            TrewMonitor v1.0
          </p>
        </div>

        <TerminalBox title="SYSTEM LOGIN">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm p-2 border border-red-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

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
                placeholder="********"
              />
            </div>

            <TerminalButton
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? '[ AUTHENTICATING... ]' : '[ LOGIN ]'}
            </TerminalButton>
          </form>

          <div className="mt-6 pt-4 border-t border-terminal-dim text-center">
            <p className="text-sm text-terminal-dim">
              No account?{' '}
              <Link href="/signup" className="text-terminal-green hover:text-terminal-bright underline">
                REGISTER NEW USER
              </Link>
            </p>
          </div>
        </TerminalBox>

        <div className="mt-4 text-center text-xs text-terminal-dim">
          <p>─── SECURE CONNECTION ESTABLISHED ───</p>
        </div>
      </div>
    </div>
  );
}
