"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Shell from "@/components/Shell";

export default function RescheduleAppointmentPage() {
  const params = useParams();
  const router = useRouter();

  const appointmentId = params.id;

  const [appointment, setAppointment] = useState(null);

  const [slots, setSlots] = useState([]);

  const [form, setForm] = useState({
    appointment_date: "",
    appointment_time: "",
  });

  const [loading, setLoading] = useState(true);

  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  async function loadAppointment() {
    try {
      setLoading(true);

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load appointment.");

        return;
      }

      setAppointment(data.appointment);

      setForm({
        appointment_date: data.appointment.appointment_date?.slice(0, 10) || "",

        appointment_time: data.appointment.appointment_time || "",
      });
    } catch (error) {
      setError("Unable to load appointment.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots() {
    if (!appointment?.doctor_id || !form.appointment_date) {
      return;
    }

    try {
      setLoadingSlots(true);

      const response = await fetch(
        `/api/appointments/slots?doctor_id=${appointment.doctor_id}&date=${form.appointment_date}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load slots.");

        return;
      }

      setSlots(data.slots || []);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    loadAppointment();
  }, []);

  useEffect(() => {
    if (appointment && form.appointment_date) {
      loadSlots();
    }
  }, [appointment, form.appointment_date]);

  function formatTime(time) {
    if (!time) return "";

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.appointment_date || !form.appointment_time) {
      setError("Please select date and time.");

      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          appointment_date: form.appointment_date,

          appointment_time: form.appointment_time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to reschedule appointment.");

        return;
      }

      router.push("/compounder/appointments/list");

      router.refresh();
    } catch (error) {
      setError("Unable to reschedule appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Shell
        role="compounder"
        title="Reschedule appointment"
        subtitle="Loading appointment"
      >
        <div className="bg-white border rounded-2xl p-10 text-center">
          Loading appointment...
        </div>
      </Shell>
    );
  }

  if (!appointment) {
    return (
      <Shell
        role="compounder"
        title="Reschedule appointment"
        subtitle="Appointment"
      >
        <div className="bg-white border rounded-2xl p-10 text-center">
          {error || "Appointment unavailable."}
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      role="compounder"
      title="Reschedule appointment"
      subtitle={`${appointment.patient_name} · ${appointment.patient_code}`}
    >
      <div className="max-w-3xl bg-white border rounded-2xl p-6">
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold">Choose new appointment slot</h2>

          <p className="mt-1 text-sm text-slate-500">
            Doctor: {appointment.doctor_name}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            New date
            <input
              type="date"
              value={form.appointment_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  appointment_date: e.target.value,
                  appointment_time: "",
                }))
              }
              className="mt-2 w-full border rounded-xl px-4 py-3"
            />
          </label>

          <div className="mt-6">
            <p className="text-sm font-medium">Available slots</p>

            {loadingSlots ? (
              <p className="mt-3 text-sm text-slate-500">Loading slots...</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        appointment_time: slot.time,
                      }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      form.appointment_time === slot.time
                        ? "bg-slate-950 text-white"
                        : slot.available
                          ? "bg-white"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="border rounded-xl px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !form.appointment_time}
              className="bg-slate-950 text-white rounded-xl px-5 py-3 font-semibold disabled:opacity-50"
            >
              {submitting ? "Rescheduling..." : "Confirm reschedule"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
