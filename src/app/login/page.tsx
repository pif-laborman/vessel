"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleOAuth(provider: "google" | "github") {
    setLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("email");
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for the login link.");
    }
    setLoading(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center" style={{ marginBottom: 'var(--space-8)' }}>
          <Link href="/" className="inline-flex items-center gap-2" style={{ marginBottom: 'var(--space-6)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--fill-action)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontSize: 'var(--text-lg)' }}>Corix</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>Welcome back</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Sign in to your account to continue</p>
        </div>

        {error && (
          <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: '#FEE2E2', color: '#991B1B', fontSize: 'var(--text-sm)' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: '#D1FAE5', color: '#065F46', fontSize: 'var(--text-sm)' }}>
            {message}
          </div>
        )}

        <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
          <button
            onClick={() => handleOAuth("google")}
            disabled={loading !== null}
            className="btn-outline"
            style={{ width: '100%', height: 42, opacity: loading === 'google' ? 0.6 : 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>
          <button
            onClick={() => handleOAuth("github")}
            disabled={loading !== null}
            className="btn-outline"
            style={{ width: '100%', height: 42, opacity: loading === 'github' ? 0.6 : 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            {loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}
          </button>
        </div>

        <div className="flex items-center" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>or</span>
          <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleEmail} className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            style={{
              width: '100%',
              height: 42,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              padding: '0 var(--space-3)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading !== null}
            className="btn-primary"
            style={{ width: '100%', height: 42, opacity: loading === 'email' ? 0.6 : 1 }}
          >
            {loading === 'email' ? 'Sending link...' : 'Continue with email'}
          </button>
        </form>

        <p className="text-center" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-6)' }}>
          By continuing, you agree to our{" "}
          <Link href="/terms" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
