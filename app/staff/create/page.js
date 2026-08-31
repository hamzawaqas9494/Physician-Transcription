"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateStaffPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "doctor",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.role ||
      !form.password
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          role: form.role,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create staff account.");
        return;
      }

      setMessage(
        `${
          form.role === "doctor" ? "Doctor" : "Compounder"
        } account created successfully.`,
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        role: "doctor",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Create staff error:", err);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Staff Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Add Staff Member
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create a Doctor or Compounder account for your clinic.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to Login
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Staff Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the staff member's basic details and login credentials.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Name */}
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                  <span className="ml-1 text-red-500">*</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Dr. Ahmed Khan"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </label>

                {/* Role */}
                <label className="block text-sm font-medium text-slate-700">
                  Role
                  <span className="ml-1 text-red-500">*</span>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="compounder">Compounder</option>
                  </select>
                </label>

                {/* Email */}
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                  <span className="ml-1 text-red-500">*</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="doctor@clinic.com"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </label>

                {/* Phone */}
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="03001234567"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </label>

                {/* Password */}
                <label className="block text-sm font-medium text-slate-700">
                  Password
                  <span className="ml-1 text-red-500">*</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    disabled={loading}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </label>

                {/* Confirm Password */}
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                  <span className="ml-1 text-red-500">*</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    disabled={loading}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                      role: "doctor",
                      password: "",
                      confirmPassword: "",
                    })
                  }
                  disabled={loading}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </section>

          {/* Side Info */}
          <aside className="rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              Account Roles
            </p>

            <h3 className="mt-3 text-xl font-bold">
              Staff access is role based.
            </h3>

            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="font-semibold">Doctor</p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Access patients, appointments, consultations, audio recording
                  and transcripts.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="font-semibold">Compounder</p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Register patients, add medical history, book appointments and
                  manage the clinic queue.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-500">
              Passwords are sent to the backend and stored as bcrypt hashes, not
              plain text.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
