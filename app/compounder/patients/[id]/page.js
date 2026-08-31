"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";
import Icon from "@/components/Icon";

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();

  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD PATIENT
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

      setPatient(data.patient);
      setMedicalHistory(data.medical_history || []);
      setAppointments(data.appointments || []);
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
  // UPDATE APPOINTMENT STATUS
  // =========================

  async function updateAppointmentStatus(appointmentId, status) {
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
        setError(data.message || "Unable to update appointment status.");
        return;
      }

      setSuccess(data.message || "Appointment updated successfully.");

      await loadPatient();
    } catch (error) {
      console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

      setError("Unable to update appointment.");
    } finally {
      setStatusLoading(null);
    }
  }

  // =========================
  // HELPERS
  // =========================

  function getInitials(name) {
    if (!name) {
      return "P";
    }

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function calculateAge(dateOfBirth) {
    if (!dateOfBirth) {
      return null;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  function formatDate(date) {
    if (!date) {
      return "Not added";
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

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    date.setSeconds(0);

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
  // APPOINTMENT TIMING
  // =========================

  function getAppointmentTiming(appointment) {
    if (!appointment.appointment_date || !appointment.appointment_time) {
      return {
        isToday: false,
        isFutureDate: false,
        isPastDate: false,
        isPastTime: false,
        canCheckIn: false,
      };
    }

    const datePart = appointment.appointment_date.split("T")[0];
    const timePart = appointment.appointment_time.slice(0, 5);

    const appointmentDateTime = new Date(`${datePart}T${timePart}:00`);

    const now = new Date();

    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const isToday = datePart === today;

    const todayStart = new Date(`${today}T00:00:00`);
    const appointmentDay = new Date(`${datePart}T00:00:00`);

    const isFutureDate = appointmentDay > todayStart;
    const isPastDate = appointmentDay < todayStart;
    const isPastTime = isToday && appointmentDateTime < now;

    return {
      isToday,
      isFutureDate,
      isPastDate,
      isPastTime,
      canCheckIn: isToday && !isPastDate,
    };
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Shell
        role="compounder"
        title="Patient profile"
        subtitle="Loading patient information"
      >
        <div className="bg-white border rounded-2xl px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading patient...</p>
        </div>
      </Shell>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !patient) {
    return (
      <Shell
        role="compounder"
        title="Patient profile"
        subtitle="Patient record"
      >
        <div className="bg-white border rounded-2xl px-6 py-16 text-center">
          <h2 className="text-xl font-bold">Patient unavailable</h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <Link
            href="/compounder/patients"
            className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to patients
          </Link>
        </div>
      </Shell>
    );
  }

  if (!patient) {
    return null;
  }

  const age = calculateAge(patient.date_of_birth);

  return (
    <Shell
      role="compounder"
      title="Patient profile"
      subtitle={patient.patient_code}
    >
      {/* ALERTS */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* =========================
          TOP PROFILE
      ========================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white grid place-items-center text-xl font-bold">
            {getInitials(patient.name)}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              {patient.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {age !== null ? `${age} years` : "Age not added"}
              {" · "}
              {patient.gender || "Gender not added"}
              {" · "}
              {patient.patient_code}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/compounder/appointments?patient=${patient.id}`}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Book appointment
          </Link>
        </div>
      </div>

      {/* =========================
          PATIENT INFORMATION
      ========================== */}

      <section className="mt-7 bg-white border rounded-2xl">
        <div className="p-5 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Patient information</h3>

            <p className="text-xs text-slate-500 mt-1">
              Basic registration information
            </p>
          </div>

          {/* EDIT PATIENT */}

          <Link
            href={`/compounder/patients/${patient.id}/edit`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit patient
          </Link>
        </div>

        <div className="p-5 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Patient ID</p>

            <p className="mt-1 font-semibold">{patient.patient_code}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Date of birth</p>

            <p className="mt-1 font-semibold">
              {formatDate(patient.date_of_birth)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Phone</p>

            <p className="mt-1 font-semibold">{patient.phone || "Not added"}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Gender</p>

            <p className="mt-1 font-semibold">
              {patient.gender || "Not added"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs text-slate-400">Address</p>

            <p className="mt-1 font-semibold">
              {patient.address || "Not added"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Emergency contact</p>

            <p className="mt-1 font-semibold">
              {patient.emergency_contact_name || "Not added"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Emergency phone</p>

            <p className="mt-1 font-semibold">
              {patient.emergency_contact_phone || "Not added"}
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          MEDICAL HISTORY
      ========================== */}

      <section className="mt-6 bg-white border rounded-2xl">
        <div className="p-5 border-b flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Medical history</h3>

            <p className="text-xs text-slate-500 mt-1">
              Complete medical history timeline for this patient
            </p>
          </div>

          {medicalHistory.length > 0 && (
            <Link
              href={`/compounder/patients/${patient.id}/history`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              + Add history
            </Link>
          )}
        </div>

        {medicalHistory.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-500">
              <Icon name="clipboard" size={20} />
            </div>

            <h4 className="mt-4 font-semibold">No medical history added</h4>

            <p className="mt-1 text-sm text-slate-500">
              Add the patient's first medical history record.
            </p>

            <Link
              href={`/compounder/patients/${patient.id}/history`}
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              + Add medical history
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {medicalHistory.map((history, index) => (
              <div key={history.id} className="p-5">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {index === medicalHistory.length - 1
                          ? "Initial medical history"
                          : "Medical history entry"}
                      </h4>

                      {index === 0 && <Badge tone="blue">Latest</Badge>}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Added {formatDate(history.created_at)}
                      {history.created_by_name
                        ? ` by ${history.created_by_name}`
                        : ""}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    Record #{history.id}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">Previous diseases</p>

                    <p className="mt-1 text-sm font-medium">
                      {history.previous_diseases || "None reported"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Allergies</p>

                    <p className="mt-1 text-sm font-medium">
                      {history.allergies || "None reported"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Current medications
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {history.current_medications || "None reported"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Previous surgeries</p>

                    <p className="mt-1 text-sm font-medium">
                      {history.previous_surgeries || "None reported"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Family history</p>

                    <p className="mt-1 text-sm font-medium">
                      {history.family_history || "None reported"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Additional notes</p>

                    <p className="mt-1 text-sm font-medium">
                      {history.additional_notes || "No notes"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================
          APPOINTMENTS
      ========================== */}

      <section className="mt-6 bg-white border rounded-2xl">
        <div className="p-5 border-b flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Appointments</h3>

            <p className="text-xs text-slate-500 mt-1">
              Patient appointment history and current status
            </p>
          </div>

          {appointments.length > 0 && (
            <Link
              href={`/compounder/appointments?patient=${patient.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Book appointment
            </Link>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-500">
              <Icon name="calendar" size={20} />
            </div>

            <h4 className="mt-4 font-semibold">No appointments yet</h4>

            <p className="mt-1 text-sm text-slate-500">
              Book this patient's first appointment.
            </p>

            <Link
              href={`/compounder/appointments?patient=${patient.id}`}
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Book appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((appointment) => {
              const status = getStatus(appointment.status);

              const updating = statusLoading === appointment.id;

              const timing = getAppointmentTiming(appointment);

              const canPrintReceipt = [
                "checked_in",
                "waiting",
                "in_consultation",
                "completed",
              ].includes(appointment.status);

              return (
                <div
                  key={appointment.id}
                  className="p-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* INFO */}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {appointment.doctor_name}
                      </p>

                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {formatDate(appointment.appointment_date)}

                      {" · "}

                      {formatTime(appointment.appointment_time)}

                      {appointment.token_number
                        ? ` · Token ${appointment.token_number}`
                        : ""}
                    </p>

                    {appointment.notes && (
                      <p className="mt-2 max-w-xl text-sm text-slate-500">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap items-center gap-2">
                    {/* PRINT RECEIPT */}

                    {canPrintReceipt && (
                      <Link
                        href={`/compounder/appointments/${appointment.id}/receipt`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Print receipt
                      </Link>
                    )}

                    {/* SCHEDULED */}

                    {appointment.status === "scheduled" && (
                      <>
                        {timing.isToday && !timing.isPastTime && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "checked_in",
                              )
                            }
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                          >
                            {updating ? "Updating..." : "Check in"}
                          </button>
                        )}

                        {!timing.isPastDate && !timing.isPastTime && (
                          <Link
                            href={`/compounder/appointments/${appointment.id}/reschedule`}
                            className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50"
                          >
                            Reschedule
                          </Link>
                        )}

                        {!timing.isPastDate && !timing.isPastTime && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "cancelled",
                              )
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}

                        {(timing.isPastDate || timing.isPastTime) && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              updateAppointmentStatus(appointment.id, "no_show")
                            }
                            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 disabled:opacity-50"
                          >
                            {updating ? "Updating..." : "No show"}
                          </button>
                        )}
                      </>
                    )}

                    {/* CHECKED IN */}

                    {appointment.status === "checked_in" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                          updateAppointmentStatus(appointment.id, "waiting")
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
                        Consultation in progress
                      </span>
                    )}

                    {/* COMPLETED */}

                    {appointment.status === "completed" && (
                      <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                        Consultation completed
                      </span>
                    )}

                    {/* CANCELLED */}

                    {appointment.status === "cancelled" && (
                      <Link
                        href={`/compounder/appointments?patient=${patient.id}`}
                        className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50"
                      >
                        Book new appointment
                      </Link>
                    )}

                    {/* NO SHOW */}

                    {appointment.status === "no_show" && (
                      <Link
                        href={`/compounder/appointments?patient=${patient.id}`}
                        className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50"
                      >
                        Book new appointment
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BACK */}

      <div className="mt-6">
        <Link
          href="/compounder/patients"
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          ← Back to patients
        </Link>
      </div>
    </Shell>
  );
}
