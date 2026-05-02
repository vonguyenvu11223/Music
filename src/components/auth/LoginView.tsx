"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, ArrowRight } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/app/home";

  const supabase = createSupabaseBrowserClient();

  return (
    <div className="min-h-[100dvh] grid place-items-center px-4 bg-[radial-gradient(1000px_600px_at_20%_20%,rgba(30,215,96,0.14),transparent_60%),radial-gradient(900px_500px_at_80%_30%,rgba(255,255,255,0.08),transparent_55%)]">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-black/45 p-6 shadow-[var(--shadow-lift)] backdrop-blur">
        <div className="text-xl font-semibold text-white">Sign in</div>
        <div className="mt-1 text-sm text-white/60">
          Use Google or email to access your library.
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={async () => {
              setLoading("google");
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(
                    redirectTo,
                  )}`,
                },
              });
              setLoading(null);
              if (error) toast.error(error.message);
            }}
            disabled={loading != null}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition disabled:opacity-50"
          >
            {loading === "google" ? "Opening Google…" : "Continue with Google"}
          </button>

          <div className="relative py-3">
            <div className="h-px bg-white/10" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/45">
                or
              </div>
            </div>
          </div>

          <label className="block">
            <div className="mb-1 text-xs font-semibold text-white/60">Email</div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:ring-2 focus-within:ring-[var(--ring)]">
              <Mail className="h-4 w-4 text-white/45" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-semibold text-white/60">
              Password
            </div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button
            onClick={async () => {
              if (!email || !password) {
                toast.error("Please enter email and password.");
                return;
              }
              setLoading("email");
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              setLoading(null);
              if (error) {
                // Optional: guide user to sign up in Supabase dashboard if needed
                toast.error(error.message);
                return;
              }
              toast.success("Signed in");
              window.location.href = redirectTo;
            }}
            disabled={loading != null}
            className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-black hover:brightness-110 transition disabled:opacity-50"
          >
            {loading === "email" ? "Signing in…" : "Sign in"}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="mt-5 text-xs text-white/50">
          <Link href="/" className="text-white/70 hover:text-white underline">
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}

