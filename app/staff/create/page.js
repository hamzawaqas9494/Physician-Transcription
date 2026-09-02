"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export default function CreateStaffPage() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "doctor",
    password: "",
    confirmPassword: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // FORM CHANGE
  // =========================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================
  // INITIALS
  // =========================

  function getInitials(name) {
    if (!name) {
      return "S";
    }

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  // =========================
  // PROFILE PICTURE SELECT
  // =========================

  function handleProfilePictureChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");

      event.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Profile picture must be 2 MB or smaller.");

      event.target.value = "";
      return;
    }

    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setProfilePicture(file);
    setProfilePreview(previewUrl);
  }

  // =========================
  // REMOVE SELECTED PICTURE
  // =========================

  function removeSelectedPicture() {
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }

    setProfilePicture(null);
    setProfilePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // =========================
  // RESET FORM
  // =========================

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "doctor",
      password: "",
      confirmPassword: "",
    });

    removeSelectedPicture();
  }

  // =========================
  // SUBMIT
  // =========================

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

      const formData = new FormData();

      formData.append("name", form.name.trim());

      formData.append("email", form.email.trim().toLowerCase());

      formData.append("phone", form.phone.trim());

      formData.append("role", form.role);

      formData.append("password", form.password);

      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      const response = await fetch("/api/users/create", {
        method: "POST",
        body: formData,
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

      resetForm();
    } catch (err) {
      console.error("CREATE STAFF ERROR:", err);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* HEADER */}

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
          {/* FORM */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Staff Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the staff member&apos;s basic details, profile picture and
                login credentials.
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
              {/* PROFILE PICTURE */}

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Profile Picture
                </p>

                <div className="mt-3 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-950 text-white">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-2xl font-bold">
                        {getInitials(form.name)}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Staff photo
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Optional. JPG, PNG or WebP. Maximum 2 MB.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfilePictureChange}
                      disabled={loading}
                      className="hidden"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Choose photo
                      </button>

                      {profilePicture && (
                        <button
                          type="button"
                          onClick={removeSelectedPicture}
                          disabled={loading}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* NAME */}

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

                {/* ROLE */}

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

                {/* EMAIL */}

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

                {/* PHONE */}

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

                {/* PASSWORD */}

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

                {/* CONFIRM */}

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
                  onClick={resetForm}
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

          {/* SIDE INFO */}

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
              Profile photo is optional. Passwords are stored as bcrypt hashes,
              not plain text.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
