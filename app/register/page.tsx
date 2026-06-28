"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Check your email to confirm your account.");
  }

  async function handleGoogle() {
    setError("");
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <main className="graph-paper flex min-h-dvh flex-col items-center justify-center bg-bg px-5 py-10 text-t1">
      <div className="mb-8 flex items-center gap-3">
        <div className="anime-mark flex h-11 w-11 rotate-[-4deg] items-center justify-center rounded-lg border border-accent/30 bg-accent-d font-display text-sm font-bold text-accent shadow-[4px_4px_0_rgba(60,96,156,0.18)]">
          UX
        </div>
        <div>
          <p className="font-display text-base font-semibold text-t1">UX OS</p>
          <p className="text-xs text-t2">Design workspace</p>
        </div>
      </div>

      <div className="studio-panel anime-card w-full max-w-[400px] rounded-xl border border-border bg-surface p-7">
        <h1 className="font-display text-[22px] font-semibold text-t1">Create your account</h1>
        <p className="mt-1 text-sm text-t2">Start your UX workspace</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            className="focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 text-sm text-t1 outline-none transition-colors placeholder:text-t3 focus:border-accent"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 text-sm text-t1 outline-none transition-colors placeholder:text-t3 focus:border-accent"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            autoComplete="new-password"
            className="focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 text-sm text-t1 outline-none transition-colors placeholder:text-t3 focus:border-accent"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            className="focus-ring min-h-11 w-full rounded-md border border-border-s bg-card px-3 text-sm text-t1 outline-none transition-colors placeholder:text-t3 focus:border-accent"
          />

          {error && (
            <p role="alert" className="rounded-md border border-pink/20 bg-pink-d px-3 py-2 text-xs text-pink">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="rounded-md border border-mint/20 bg-mint-d px-3 py-2 text-xs text-mint">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="interactive-lift focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-t3">or continue with</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="interactive-lift focus-ring flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-border-s bg-card px-4 text-sm font-medium text-t1 transition-colors hover:bg-card-h"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-t2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent/80">
            Sign in →
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
