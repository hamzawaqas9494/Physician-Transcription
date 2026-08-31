"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";

export default function AddPatient() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    date_of_birth: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    gender: "",
  });

  const [medicalHistory, setMedicalHistory] = useState({
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

  function handleHistoryChange(e) {
    const { name, value } = e.target;

    setMedicalHistory((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function clearForm() {
    setForm({
      name: "",
      date_of_birth: "",
      phone: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      gender: "",
    });

    setMedicalHistory({
      previous_diseases: "",
      allergies: "",
      current_medications: "",
      previous_surgeries: "",
      family_history: "",
      additional_notes: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Patient full name is required.");
      return;
    }

    if (!form.gender) {
      setError("Please select patient gender.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/patients", {
        method: "POST",

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

          // =========================
          // MEDICAL HISTORY
          // =========================

          medical_history: {
            previous_diseases: medicalHistory.previous_diseases.trim() || null,

            allergies: medicalHistory.allergies.trim() || null,

            current_medications:
              medicalHistory.current_medications.trim() || null,

            previous_surgeries:
              medicalHistory.previous_surgeries.trim() || null,

            family_history: medicalHistory.family_history.trim() || null,

            additional_notes: medicalHistory.additional_notes.trim() || null,
          },
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
        setError(data.message || "Unable to create patient.");

        return;
      }

      const patient = data.patient;

      setSuccess(
        data.medical_history
          ? `Patient ${patient.name} and medical history registered successfully. Patient ID: ${patient.patient_code}`
          : `Patient ${patient.name} registered successfully. Patient ID: ${patient.patient_code}`,
      );

      clearForm();

      setTimeout(() => {
        router.push(`/compounder/patients/${patient.id}`);

        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("CREATE PATIENT ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push("/compounder/patients");
  }

  return (
    <Shell
      role="compounder"
      title="Register patient"
      subtitle="Create a new patient record"
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
              PATIENT INFORMATION
          ========================== */}

          <div>
            <h3 className="font-semibold">Patient information</h3>

            <p className="text-xs text-slate-500 mt-1">
              Enter the patient's basic registration information.
            </p>
          </div>

          <div className="mt-5 grid md:grid-cols-2 gap-5">
            {/* FULL NAME */}

            <label className="text-sm font-medium">
              Full name
              <span className="text-red-500 ml-1">*</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="Enter full name"
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
                disabled={loading}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              />
            </label>

            {/* PHONE */}

            <label className="text-sm font-medium">
              Phone
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="03001234567"
              />
            </label>

            {/* GENDER */}

            <label className="text-sm font-medium">
              Gender
              <span className="text-red-500 ml-1">*</span>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              >
                <option value="">Select gender</option>

                <option value="Male">Male</option>

                <option value="Female">Female</option>

                <option value="Other">Other</option>
              </select>
            </label>

            {/* ADDRESS */}

            <label className="text-sm font-medium md:col-span-2">
              Address
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full border rounded-xl px-4 py-3 min-h-24 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
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
                disabled={loading}
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
                disabled={loading}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="03111234567"
              />
            </label>
          </div>

          {/* =========================
              MEDICAL HISTORY
          ========================== */}

          <div className="mt-8 border-t pt-7">
            <div>
              <h3 className="font-semibold">Initial medical history</h3>

              <p className="text-xs text-slate-500 mt-1">
                Add available medical history before the patient's consultation.
              </p>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-5">
              <label className="text-sm font-medium">
                Previous diseases / conditions
                <textarea
                  name="previous_diseases"
                  value={medicalHistory.previous_diseases}
                  onChange={handleHistoryChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-28 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Diabetes, blood pressure, asthma..."
                />
              </label>

              <label className="text-sm font-medium">
                Allergies
                <textarea
                  name="allergies"
                  value={medicalHistory.allergies}
                  onChange={handleHistoryChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-28 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Medicine or food allergies..."
                />
              </label>

              <label className="text-sm font-medium">
                Current medications
                <textarea
                  name="current_medications"
                  value={medicalHistory.current_medications}
                  onChange={handleHistoryChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-28 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Current medicines..."
                />
              </label>

              <label className="text-sm font-medium">
                Previous surgeries
                <textarea
                  name="previous_surgeries"
                  value={medicalHistory.previous_surgeries}
                  onChange={handleHistoryChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-28 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Previous surgeries..."
                />
              </label>

              <label className="text-sm font-medium">
                Family history
                <textarea
                  name="family_history"
                  value={medicalHistory.family_history}
                  onChange={handleHistoryChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-28 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Relevant family medical history..."
                />
              </label>

              <label className="text-sm font-medium">
                Additional notes
                <textarea
                  name="additional_notes"
                  value={medicalHistory.additional_notes}
                  onChange={handleHistoryChange}
                  disabled={loading}
                  className="mt-2 w-full border rounded-xl p-4 min-h-28 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  placeholder="Any additional information..."
                />
              </label>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Medical history is optional and can also be updated later from the
              patient profile.
            </p>
          </div>

          {/* =========================
              ACTIONS
          ========================== */}

          <div className="mt-8 border-t pt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="border rounded-xl px-4 py-2.5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-slate-950 text-white rounded-xl px-5 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating patient..." : "Create patient"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
