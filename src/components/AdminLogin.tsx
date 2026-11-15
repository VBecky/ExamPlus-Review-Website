import { useState, type FormEvent } from 'react';
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

type LoginState = 'idle' | 'loading' | 'error';

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginState('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoginState('error');
      setErrorMsg(
        error.message.includes('Invalid login')
          ? 'Invalid email or password.'
          : 'Unable to sign in. Please try again.'
      );
      return;
    }

    // Check if the user is an admin
    const { data: adminCheck } = await supabase.rpc('is_admin');

    if (!adminCheck) {
      await supabase.auth.signOut();
      setLoginState('error');
      setErrorMsg('This account does not have admin access.');
      return;
    }

    onSuccess();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-5 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Reviews
        </button>

        <div className="animate-fade-in-up rounded-2xl border border-ink-800 bg-ink-900/80 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <Logo size="sm" className="justify-center" />
            <h1 className="mt-4 font-display text-xl font-bold text-white">Admin Access</h1>
            <p className="mt-1.5 text-sm text-ink-400">
              Sign in to moderate reviews
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@examplus.com"
                  className="w-full rounded-xl border border-ink-700 bg-ink-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-ink-500 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-ink-700 bg-ink-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-ink-500 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {loginState === 'error' && (
              <div className="animate-slide-down flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginState === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginState === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
