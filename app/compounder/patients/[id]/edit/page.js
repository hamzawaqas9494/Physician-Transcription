"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Shell from "@/components/Shell";

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = params.id;

  const [form, setForm] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD PATIENT
  // GET /api/patients/[id]
  // =========================

  async function loadPatient() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/patients/${patientId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      if (response.status === 404) {
        setError("Patient not found.");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to load patient.");
        return;
      }

      const patient = data.patient;

      setForm({
        name: patient.name || "",

        date_of_birth: patient.date_of_birth
          ? patient.date_of_birth.split("T")[0]
          : "",

        gender: patient.gender || "",

        phone: patient.phone || "",

        address: patient.address || "",

        emergency_contact_name: patient.emergency_contact_name || "",

        emergency_contact_phone: patient.emergency_contact_phone || "",
      });
    } catch (error) {
      console.error("LOAD PATIENT ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  // =========================
  // HANDLE CHANGE
  // =========================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================
  // UPDATE PATIENT
  // PUT /api/patients/[id]/update
  // =========================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================
    // FRONTEND VALIDATION
    // =========================

    if (!form.name.trim()) {
      setError("Patient name is required.");
      return;
    }

    if (!form.gender) {
      setError("Patient gender is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/patients/${patientId}/update`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          name: form.name.trim(),

          date_of_birth: form.date_of_birth || null,

          gender: form.gender,

          phone: form.phone.trim() || null,

          address: form.address.trim() || null,

          emergency_contact_name: form.emergency_contact_name.trim() || null,

          emergency_contact_phone: form.emergency_contact_phone.trim() || null,
        }),
      });

      const data = await response.json();

      // =========================
      // AUTH HANDLING
      // =========================

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      if (response.status === 404) {
        setError("Patient not found.");
        return;
      }

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        setError(data.message || "Unable to update patient.");

        return;
      }

      // =========================
      // SUCCESS
      // =========================

      setSuccess(data.message || "Patient updated successfully.");

      // =========================
      // REDIRECT
      // =========================

      setTimeout(() => {
        router.push(`/compounder/patients/${patientId}`);

        router.refresh();
      }, 800);
    } catch (error) {
      console.error("UPDATE PATIENT ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Shell
        role="compounder"
        title="Edit patient"
        subtitle="Loading patient information"
      >
        <div className="max-w-4xl bg-white border rounded-2xl px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading patient...</p>
        </div>
      </Shell>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <Shell
      role="compounder"
      title="Edit patient"
      subtitle="Update patient registration information"
    >
      <div className="max-w-4xl bg-white border rounded-2xl p-6">
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* =========================
              HEADER
          ========================== */}

          <div>
            <h2 className="text-xl font-bold">Patient information</h2>

            <p className="mt-1 text-sm text-slate-500">
              Update basic registration information only. Medical history is
              managed separately.
            </p>
          </div>

          {/* =========================
              FORM
          ========================== */}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* FULL NAME */}

            <label className="text-sm font-medium">
              Full name
              <span className="ml-1 text-red-500">*</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="Enter patient name"
              />
            </label>

            {/* DATE OF BIRTH */}

            <label className="text-sm font-medium">
              Date of birth
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                disabled={submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
            </label>

            {/* GENDER */}

            <label className="text-sm font-medium">
              Gender
              <span className="ml-1 text-red-500">*</span>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">Select gender</option>

                <option value="Male">Male</option>

                <option value="Female">Female</option>

                <option value="Other">Other</option>
              </select>
            </label>

            {/* PHONE */}

            <label className="text-sm font-medium">
              Phone
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="03001234567"
              />
            </label>

            {/* ADDRESS */}

            <label className="text-sm font-medium md:col-span-2">
              Address
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={submitting}
                className="mt-2 min-h-24 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="Enter patient address"
              />
            </label>

            {/* EMERGENCY CONTACT */}

            <label className="text-sm font-medium">
              Emergency contact name
              <input
                type="text"
                name="emergency_contact_name"
                value={form.emergency_contact_name}
                onChange={handleChange}
                disabled={submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="Emergency contact name"
              />
            </label>

            {/* EMERGENCY PHONE */}

            <label className="text-sm font-medium">
              Emergency contact phone
              <input
                type="text"
                name="emergency_contact_phone"
                value={form.emergency_contact_phone}
                onChange={handleChange}
                disabled={submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="03111234567"
              />
            </label>
          </div>

          {/* =========================
              IMPORTANT NOTE
          ========================== */}

          <div className="mt-7 rounded-xl border bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Patient ID and medical history cannot be changed from this form.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Medical history should be updated by adding a new history record
              from the patient profile.
            </p>
          </div>

          {/* =========================
              ACTIONS
          ========================== */}

          <div className="mt-8 border-t pt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => router.back()}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !form.name.trim() || !form.gender}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
