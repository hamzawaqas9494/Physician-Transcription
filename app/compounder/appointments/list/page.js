"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";

export default function AppointmentListPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/appointments/list", {
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

      if (!response.ok) {
        setError(data.message || "Unable to load appointments.");
        return;
      }

      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("LOAD APPOINTMENTS ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================

  async function updateStatus(appointmentId, status) {
    try {
      setError("");
      setSuccess("");
      setStatusLoading(appointmentId);

      const response = await fetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            status,
          }),
        },
      );

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
        setError(data.message || "Unable to update appointment.");
        return;
      }

      setSuccess(data.message || "Appointment updated successfully.");

      await loadAppointments();
    } catch (error) {
      console.error("UPDATE APPOINTMENT ERROR:", error);

      setError("Unable to update appointment.");
    } finally {
      setStatusLoading(null);
    }
  }

  // =========================
  // HELPERS
  // =========================

  function formatDate(date) {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatTime(time) {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getStatus(status) {
    const statuses = {
      scheduled: {
        label: "Scheduled",
        tone: "gray",
      },

      checked_in: {
        label: "Checked in",
        tone: "blue",
      },

      waiting: {
        label: "Waiting",
        tone: "amber",
      },

      in_consultation: {
        label: "In consultation",
        tone: "blue",
      },

      completed: {
        label: "Completed",
        tone: "green",
      },

      cancelled: {
        label: "Cancelled",
        tone: "red",
      },

      no_show: {
        label: "No show",
        tone: "red",
      },
    };

    return (
      statuses[status] || {
        label: status || "Unknown",
        tone: "gray",
      }
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <Shell
      role="compounder"
      title="Appointments"
      subtitle="Manage booked consultations"
    >
      {/* TOP */}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Appointment management</h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage booked patient appointments.
          </p>
        </div>

        <Link
          href="/compounder/appointments"
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          + Book appointment
        </Link>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* TABLE */}

      <div className="bg-white border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />

            <p className="mt-4 text-sm text-slate-500">
              Loading appointments...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-semibold">No appointments found</h3>

            <p className="mt-1 text-sm text-slate-500">
              Book the first patient appointment.
            </p>

            <Link
              href="/compounder/appointments"
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              + Book appointment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left">Patient</th>

                  <th className="p-4 text-left">Doctor</th>

                  <th className="p-4 text-left">Date</th>

                  <th className="p-4 text-left">Time</th>

                  <th className="p-4 text-left">Token</th>

                  <th className="p-4 text-left">Status</th>

                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {appointments.map((appointment) => {
                  const status = getStatus(appointment.status);

                  const updating = statusLoading === appointment.id;

                  return (
                    <tr key={appointment.id} className="hover:bg-slate-50">
                      {/* PATIENT */}

                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {appointment.patient_name}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {appointment.patient_code}
                        </div>
                      </td>

                      {/* DOCTOR */}

                      <td className="p-4 text-slate-700">
                        {appointment.doctor_name}
                      </td>

                      {/* DATE */}

                      <td className="p-4 text-slate-700">
                        {formatDate(appointment.appointment_date)}
                      </td>

                      {/* TIME */}

                      <td className="p-4 text-slate-700">
                        {formatTime(appointment.appointment_time)}
                      </td>

                      {/* TOKEN */}

                      <td className="p-4 font-medium">
                        {appointment.token_number || "—"}
                      </td>

                      {/* STATUS */}

                      <td className="p-4">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>

                      {/* ACTIONS */}

                      <td className="p-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {/* SCHEDULED */}

                          {appointment.status === "scheduled" && (
                            <>
                              <button
                                type="button"
                                disabled={updating}
                                onClick={() =>
                                  updateStatus(appointment.id, "checked_in")
                                }
                                className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                              >
                                {updating ? "Updating..." : "Check in"}
                              </button>

                              <Link
                                href={`/compounder/appointments/${appointment.id}/reschedule`}
                                className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50"
                              >
                                Reschedule
                              </Link>

                              <button
                                type="button"
                                disabled={updating}
                                onClick={() =>
                                  updateStatus(appointment.id, "no_show")
                                }
                                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 disabled:opacity-50"
                              >
                                No show
                              </button>

                              <button
                                type="button"
                                disabled={updating}
                                onClick={() =>
                                  updateStatus(appointment.id, "cancelled")
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {/* CHECKED IN */}

                          {appointment.status === "checked_in" && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                updateStatus(appointment.id, "waiting")
                              }
                              className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                            >
                              {updating ? "Updating..." : "Add to queue"}
                            </button>
                          )}

                          {/* WAITING */}

                          {appointment.status === "waiting" && (
                            <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                              Waiting for doctor
                            </span>
                          )}

                          {/* IN CONSULTATION */}

                          {appointment.status === "in_consultation" && (
                            <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                              In consultation
                            </span>
                          )}

                          {/* COMPLETED */}

                          {appointment.status === "completed" && (
                            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                              Completed
                            </span>
                          )}

                          {/* CANCELLED / NO SHOW */}

                          {["cancelled", "no_show"].includes(
                            appointment.status,
                          ) && (
                            <Link
                              href={`/compounder/appointments?patient=${appointment.patient_id}`}
                              className="rounded-lg border px-3 py-2 text-xs font-medium"
                            >
                              Book new
                            </Link>
                          )}

                          {/* PATIENT */}

                          <Link
                            href={`/compounder/patients/${appointment.patient_id}`}
                            className="rounded-lg border px-3 py-2 text-xs font-medium"
                          >
                            View patient
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
