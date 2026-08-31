"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";

export default function DoctorPatientProfilePage() {
  const params = useParams();
  const router = useRouter();

  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOAD PATIENT
  // =========================

  async function loadPatient() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/doctors/patients/${patientId}`, {
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
        setError(data.message || "Unable to load patient profile.");
        return;
      }

      setPatient(data.patient);

      setMedicalHistory(data.medical_history || []);

      setAppointments(data.appointments || []);

      setActiveAppointment(data.active_appointment || null);
    } catch (error) {
      console.error("LOAD DOCTOR PATIENT ERROR:", error);

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
  // AGE
  // =========================

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

  // =========================
  // DATE
  // =========================

  function formatDate(date) {
    if (!date) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  // =========================
  // TIME
  // =========================

  function formatTime(time) {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // =========================
  // STATUS
  // =========================

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
  // LOADING
  // =========================

  if (loading) {
    return (
      <Shell
        role="doctor"
        title="Patient profile"
        subtitle="Loading patient record"
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

  if (error || !patient) {
    return (
      <Shell role="doctor" title="Patient profile" subtitle="Patient record">
        <div className="bg-white border rounded-2xl px-6 py-16 text-center">
          <h2 className="text-xl font-bold">Patient unavailable</h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Patient not found."}
          </p>

          <Link
            href="/doctor/patients"
            className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to patients
          </Link>
        </div>
      </Shell>
    );
  }

  // =========================
  // DATA
  // =========================

  const age = calculateAge(patient.date_of_birth);

  // Latest history because API returns DESC
  const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

  return (
    <Shell
      role="doctor"
      title="Patient profile"
      subtitle={patient.patient_code}
    >
      {/* =========================
          PROFILE HEADER
      ========================== */}

      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{patient.name}</h2>

          <p className="text-sm text-slate-500 mt-1">
            {age !== null ? `${age} years` : "Age not available"}

            {" · "}

            {patient.gender || "Gender not available"}

            {" · "}

            {patient.patient_code}

            {patient.phone && (
              <>
                {" · "}
                {patient.phone}
              </>
            )}
          </p>
        </div>

        {/* =========================
            START CONSULTATION
        ========================== */}

        {activeAppointment &&
          ["checked_in", "waiting"].includes(activeAppointment.status) && (
            <Link
              href={`/doctor/consultations/new?appointment=${activeAppointment.id}`}
              className="bg-slate-950 text-white rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              Start consultation
            </Link>
          )}

        {/* ALREADY IN CONSULTATION */}

        {activeAppointment?.status === "in_consultation" && (
          <Link
            href={`/doctor/consultations/new?appointment=${activeAppointment.id}`}
            className="bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Continue consultation
          </Link>
        )}
      </div>

      {/* =========================
          QUICK MEDICAL INFO
      ========================== */}

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <div className="text-xs text-slate-500">Allergies</div>

          <div className="mt-2 font-semibold">
            {latestHistory?.allergies || "None reported"}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <div className="text-xs text-slate-500">Current medication</div>

          <div className="mt-2 font-semibold">
            {latestHistory?.current_medications || "None reported"}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <div className="text-xs text-slate-500">
            Last medical history update
          </div>

          <div className="mt-2 font-semibold">
            {latestHistory
              ? formatDate(latestHistory.created_at)
              : "No history"}
          </div>
        </div>
      </div>

      {/* =========================
          MEDICAL HISTORY
      ========================== */}

      <div className="mt-6 bg-white border rounded-2xl">
        <div className="p-5 border-b">
          <div className="font-semibold">Medical history</div>

          <p className="mt-1 text-xs text-slate-500">
            Latest recorded medical information
          </p>
        </div>

        {!latestHistory ? (
          <div className="p-8 text-center">
            <p className="font-medium">No medical history recorded</p>

            <p className="mt-1 text-sm text-slate-500">
              Medical history has not been added for this patient yet.
            </p>
          </div>
        ) : (
          <div className="p-5 grid md:grid-cols-2 gap-5 text-sm">
            <div>
              <div className="text-xs text-slate-400">Previous diseases</div>

              <p className="mt-2">
                {latestHistory.previous_diseases || "None reported"}
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400">Allergies</div>

              <p className="mt-2">
                {latestHistory.allergies || "None reported"}
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400">Current medications</div>

              <p className="mt-2">
                {latestHistory.current_medications || "None reported"}
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400">Previous surgeries</div>

              <p className="mt-2">
                {latestHistory.previous_surgeries || "None reported"}
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400">Family history</div>

              <p className="mt-2">
                {latestHistory.family_history || "None reported"}
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400">Notes</div>

              <p className="mt-2">
                {latestHistory.additional_notes || "No additional notes"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          MEDICAL HISTORY TIMELINE
      ========================== */}

      {medicalHistory.length > 1 && (
        <div className="mt-6 bg-white border rounded-2xl">
          <div className="p-5 border-b">
            <b>Medical history timeline</b>

            <p className="mt-1 text-xs text-slate-500">
              Previous medical history records
            </p>
          </div>

          <div className="divide-y">
            {medicalHistory.map((history, index) => (
              <div key={history.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Medical history record</p>

                      {index === 0 && <Badge tone="blue">Latest</Badge>}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(history.created_at)}

                      {history.created_by_name
                        ? ` · Added by ${history.created_by_name}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">
                      Previous diseases
                    </span>

                    <p className="mt-1">
                      {history.previous_diseases || "None reported"}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Allergies</span>

                    <p className="mt-1">
                      {history.allergies || "None reported"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================
          CONSULTATION / APPOINTMENT HISTORY
      ========================== */}

      <div className="mt-6 bg-white border rounded-2xl">
        <div className="p-5 border-b flex justify-between items-center gap-4">
          <div>
            <b>Consultation history</b>

            <p className="mt-1 text-xs text-slate-500">
              Patient appointments with you
            </p>
          </div>

          <Badge tone="gray">{appointments.length} records</Badge>
        </div>

        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">No consultation history</p>

            <p className="mt-1 text-sm text-slate-500">
              This patient has no appointments with you yet.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((appointment) => {
              const status = getStatus(appointment.status);

              return (
                <div
                  key={appointment.id}
                  className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {formatDate(appointment.appointment_date)}

                      {appointment.appointment_time && (
                        <>
                          {" · "}
                          {formatTime(appointment.appointment_time)}
                        </>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {appointment.token_number
                        ? `Token ${appointment.token_number}`
                        : "No token"}

                      {appointment.notes ? ` · ${appointment.notes}` : ""}
                    </p>
                  </div>

                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================
          PATIENT INFORMATION
      ========================== */}

      <div className="mt-6 bg-white border rounded-2xl">
        <div className="p-5 border-b font-semibold">Patient information</div>

        <div className="p-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="text-xs text-slate-400">Patient ID</div>

            <p className="mt-1 font-medium">{patient.patient_code}</p>
          </div>

          <div>
            <div className="text-xs text-slate-400">Phone</div>

            <p className="mt-1 font-medium">{patient.phone || "Not added"}</p>
          </div>

          <div>
            <div className="text-xs text-slate-400">Date of birth</div>

            <p className="mt-1 font-medium">
              {formatDate(patient.date_of_birth)}
            </p>
          </div>

          <div>
            <div className="text-xs text-slate-400">Gender</div>

            <p className="mt-1 font-medium">{patient.gender || "Not added"}</p>
          </div>

          <div>
            <div className="text-xs text-slate-400">Emergency contact</div>

            <p className="mt-1 font-medium">
              {patient.emergency_contact_name || "Not added"}
            </p>
          </div>

          <div>
            <div className="text-xs text-slate-400">Emergency phone</div>

            <p className="mt-1 font-medium">
              {patient.emergency_contact_phone || "Not added"}
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="text-xs text-slate-400">Address</div>

            <p className="mt-1 font-medium">{patient.address || "Not added"}</p>
          </div>
        </div>
      </div>

      {/* =========================
          BACK
      ========================== */}

      <div className="mt-6">
        <Link
          href="/doctor/patients"
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          ← Back to patients
        </Link>
      </div>
    </Shell>
  );
}
