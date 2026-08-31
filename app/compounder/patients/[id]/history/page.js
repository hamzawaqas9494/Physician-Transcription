"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";

export default function AddHistoryPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = params.id;

  const [form, setForm] = useState({
    previous_diseases: "",
    allergies: "",
    current_medications: "",
    previous_surgeries: "",
    family_history: "",
    additional_notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    const hasHistory =
      form.previous_diseases.trim() ||
      form.allergies.trim() ||
      form.current_medications.trim() ||
      form.previous_surgeries.trim() ||
      form.family_history.trim() ||
      form.additional_notes.trim();

    if (!hasHistory) {
      setError("Please add at least one medical history field.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/patients/${patientId}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          previous_diseases: form.previous_diseases.trim() || null,

          allergies: form.allergies.trim() || null,

          current_medications: form.current_medications.trim() || null,

          previous_surgeries: form.previous_surgeries.trim() || null,

          family_history: form.family_history.trim() || null,

          additional_notes: form.additional_notes.trim() || null,
        }),
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

      if (!response.ok) {
        setError(data.message || "Unable to add medical history.");
        return;
      }

      setSuccess("Medical history added successfully.");

      setForm({
        previous_diseases: "",
        allergies: "",
        current_medications: "",
        previous_surgeries: "",
        family_history: "",
        additional_notes: "",
      });

      setTimeout(() => {
        router.push(`/compounder/patients/${patientId}`);

        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("ADD HISTORY ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      role="compounder"
      title="Add medical history"
      subtitle={`Patient ID: ${patientId}`}
    >
      <div className="max-w-4xl">
        {/* BACK */}

        <div className="mb-5">
          <Link
            href={`/compounder/patients/${patientId}`}
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            ← Back to patient
          </Link>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div>
            <h2 className="text-xl font-bold">New medical history entry</h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a new history record. Previous history will remain saved.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium">
                Previous diseases / conditions
                <textarea
                  name="previous_diseases"
                  value={form.previous_diseases}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-32 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Diabetes, hypertension, asthma..."
                />
              </label>

              <label className="text-sm font-medium">
                Allergies
                <textarea
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-32 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Medicine, food or other allergies..."
                />
              </label>

              <label className="text-sm font-medium">
                Current medications
                <textarea
                  name="current_medications"
                  value={form.current_medications}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-32 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Current medicines..."
                />
              </label>

              <label className="text-sm font-medium">
                Previous surgeries
                <textarea
                  name="previous_surgeries"
                  value={form.previous_surgeries}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-32 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Previous surgeries..."
                />
              </label>

              <label className="text-sm font-medium">
                Family history
                <textarea
                  name="family_history"
                  value={form.family_history}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-32 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Relevant family medical history..."
                />
              </label>

              <label className="text-sm font-medium">
                Additional notes
                <textarea
                  name="additional_notes"
                  value={form.additional_notes}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-32 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Any additional information..."
                />
              </label>
            </div>

            <div className="mt-8 border-t pt-6 flex justify-end gap-3">
              <Link
                href={`/compounder/patients/${patientId}`}
                className="border rounded-xl px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="bg-slate-950 text-white rounded-xl px-5 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving history..." : "Add history"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
}
