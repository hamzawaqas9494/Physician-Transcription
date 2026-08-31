"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      router.replace(data.redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function loginAsDoctor() {
    setEmail("doctor@clinic.com");
    setPassword("Password@123");
    setError("");
  }

  function loginAsCompounder() {
    setEmail("compounder@clinic.com");
    setPassword("Password@123");
    setError("");
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* LEFT SIDE */}
      <section className="hidden lg:flex bg-slate-950 text-white p-14 flex-col justify-between">
        <div>
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-950 grid place-items-center font-bold">
              M
            </div>

            <b>MedTranscript</b>
          </div>

          {/* HERO CONTENT */}
          <div className="mt-24 max-w-lg">
            <div className="text-sm text-blue-300 font-semibold">
              CLINICAL WORKFLOW
            </div>

            <h2 className="mt-4 text-5xl font-bold tracking-tight">
              From consultation to a clean medical transcript.
            </h2>

            <p className="mt-5 text-slate-300">
              Manage patients, appointments and consultations in one secure
              workspace.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-sm text-slate-500">
          Designed for clinic teams · Doctor + Compounder
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-md">
          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
              M
            </div>

            <b>MedTranscript</b>
          </div>

          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>

            <p className="mt-2 text-slate-500">
              Sign in to your clinic workspace.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            {/* EMAIL */}
            <label className="block text-sm font-medium">
              Email
              <input
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                type="email"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </label>

            {/* PASSWORD */}
            <label className="block text-sm font-medium">
              Password
              <input
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </label>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <Link
                className="text-sm text-blue-600 hover:text-blue-700"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 text-white py-3 font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* DEMO ACCOUNTS */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={loginAsDoctor}
              disabled={loading}
              className="rounded-xl border py-3 text-center text-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Doctor demo
            </button>

            <button
              type="button"
              onClick={loginAsCompounder}
              disabled={loading}
              className="rounded-xl border py-3 text-center text-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Compounder demo
            </button>
          </div>

          {/* FOOTER */}
          <p className="mt-8 text-center text-xs text-slate-400">
            Authorized clinic personnel only.
          </p>
        </div>
      </section>
    </main>
  );
}
