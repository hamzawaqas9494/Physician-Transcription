"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";
import Icon from "@/components/Icon";

export default function DoctorAppointmentsPage() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // DATE HELPERS
  // ========================================

  function startOfWeek(date) {
    const result = new Date(date);

    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);

    result.setHours(0, 0, 0, 0);

    return result;
  }

  function addDays(date, amount) {
    const result = new Date(date);

    result.setDate(result.getDate() + amount);

    return result;
  }

  function toDateKey(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getAppointmentDateKey(value) {
    if (!value) {
      return "";
    }

    // PostgreSQL DATE may arrive as:
    // 2026-08-27
    // or
    // 2026-08-26T19:00:00.000Z
    //
    // We intentionally normalize through Date when possible.

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return toDateKey(date);
    }

    return String(value).split("T")[0];
  }

  function formatFullDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function formatMonthRange(start, end) {
    const startMonth = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(start);

    const endMonth = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(end);

    if (startMonth === endMonth) {
      return startMonth;
    }

    return `${startMonth} – ${endMonth}`;
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

  // ========================================
  // CURRENT WEEK
  // ========================================

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  // ========================================
  // LOAD APPOINTMENTS
  // ========================================

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const startDate = toDateKey(weekStart);
      const endDate = toDateKey(weekEnd);

      const response = await fetch(
        `/api/doctors/appointments?start_date=${encodeURIComponent(
          startDate,
        )}&end_date=${encodeURIComponent(endDate)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

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
      setStats(data.stats || null);
      setDoctor(data.doctor || null);
    } catch (error) {
      console.error("LOAD DOCTOR APPOINTMENTS ERROR:", error);

      setError(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [router, weekStart, weekEnd]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // ========================================
  // STATUS
  // ========================================

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

  // ========================================
  // APPOINTMENT CARD STYLE
  // ========================================

  function getAppointmentCardClass(status) {
    const styles = {
      scheduled: "border-slate-200 bg-slate-50 hover:bg-slate-100",

      checked_in: "border-blue-100 bg-blue-50 hover:bg-blue-100",

      waiting: "border-amber-100 bg-amber-50 hover:bg-amber-100",

      in_consultation: "border-blue-100 bg-blue-50 hover:bg-blue-100",

      completed: "border-emerald-100 bg-emerald-50 hover:bg-emerald-100",

      cancelled: "border-red-100 bg-red-50 hover:bg-red-100",

      no_show: "border-red-100 bg-red-50 hover:bg-red-100",
    };

    return styles[status] || "border-slate-200 bg-slate-50 hover:bg-slate-100";
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function previousWeek() {
    setSelectedDate((current) => addDays(current, -7));
  }

  function nextWeek() {
    setSelectedDate((current) => addDays(current, 7));
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  // ========================================
  // SELECTED DAY
  // ========================================

  const selectedDateKey = toDateKey(selectedDate);

  const selectedDayAppointments = appointments.filter(
    (appointment) =>
      getAppointmentDateKey(appointment.appointment_date) === selectedDateKey,
  );

  // ========================================
  // UI
  // ========================================

  return (
    <Shell
      role="doctor"
      title="Appointments"
      subtitle={formatFullDate(selectedDate)}
      user={doctor}
    >
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Appointment calendar
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review your patient appointments and consultation schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={previousWeek}
            disabled={loading}
            className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={goToToday}
            disabled={loading}
            className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Today
          </button>

          <button
            type="button"
            onClick={nextWeek}
            disabled={loading}
            className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}

          <button
            type="button"
            onClick={loadAppointments}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================
          STATS
      ======================================== */}

      {!loading && stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs text-slate-500">This week</p>

            <p className="mt-2 text-2xl font-bold">{stats.total || 0}</p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs text-slate-500">Waiting</p>

            <p className="mt-2 text-2xl font-bold">{stats.waiting || 0}</p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs text-slate-500">In consultation</p>

            <p className="mt-2 text-2xl font-bold">
              {stats.in_consultation || 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs text-slate-500">Completed</p>

            <p className="mt-2 text-2xl font-bold">{stats.completed || 0}</p>
          </div>
        </div>
      )}

      {/* ========================================
          WEEK TITLE
      ======================================== */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            {formatMonthRange(weekStart, weekEnd)}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Select a day to view its appointments.
          </p>
        </div>
      </div>

      {/* ========================================
          LOADING
      ======================================== */}

      {loading ? (
        <div className="rounded-2xl border bg-white px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading appointments...</p>
        </div>
      ) : (
        <>
          {/* ========================================
              WEEK CALENDAR
          ======================================== */}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {weekDays.map((day) => {
              const dateKey = toDateKey(day);

              const isSelected = dateKey === selectedDateKey;

              const isToday = dateKey === toDateKey(new Date());

              const dayAppointments = appointments.filter(
                (appointment) =>
                  getAppointmentDateKey(appointment.appointment_date) ===
                  dateKey,
              );

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-44 rounded-2xl border bg-white p-3 text-left transition ${
                    isSelected
                      ? "ring-2 ring-slate-900"
                      : "hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        {new Intl.DateTimeFormat("en-US", {
                          weekday: "short",
                        }).format(day)}
                      </div>

                      <div className="mt-1 text-lg font-bold">
                        {day.getDate()}
                      </div>
                    </div>

                    {isToday && (
                      <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayAppointments.length === 0 ? (
                      <p className="pt-2 text-xs text-slate-400">
                        No appointments
                      </p>
                    ) : (
                      dayAppointments.slice(0, 3).map((appointment) => {
                        const status = getStatus(appointment.status);

                        return (
                          <div
                            key={appointment.id}
                            className={`rounded-xl border p-2.5 ${getAppointmentCardClass(
                              appointment.status,
                            )}`}
                          >
                            <div className="truncate text-xs font-semibold text-slate-900">
                              {formatTime(appointment.appointment_time)}
                            </div>

                            <div className="mt-1 truncate text-xs text-slate-700">
                              {appointment.patient_name}
                            </div>

                            <div className="mt-1 truncate text-[10px] text-slate-500">
                              {status.label}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {dayAppointments.length > 3 && (
                      <p className="px-1 text-[11px] font-medium text-slate-500">
                        + {dayAppointments.length - 3} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ========================================
              SELECTED DAY APPOINTMENTS
          ======================================== */}

          <section className="mt-7 overflow-hidden rounded-2xl border bg-white">
            <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {formatFullDate(selectedDate)}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedDayAppointments.length} appointment
                  {selectedDayAppointments.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {selectedDayAppointments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <Icon name="calendar" size={20} />
                </div>

                <h4 className="mt-4 font-semibold">No appointments</h4>

                <p className="mt-1 text-sm text-slate-500">
                  You do not have any appointments scheduled for this day.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {selectedDayAppointments.map((appointment) => {
                  const status = getStatus(appointment.status);

                  return (
                    <div
                      key={appointment.id}
                      className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      {/* PATIENT */}

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-900">
                            {appointment.patient_name}
                          </h4>

                          <Badge tone={status.tone}>{status.label}</Badge>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatTime(appointment.appointment_time)}

                          {appointment.token_number
                            ? ` · Token ${appointment.token_number}`
                            : ""}

                          {appointment.patient_code
                            ? ` · ${appointment.patient_code}`
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
                        <Link
                          href={`/doctor/patients/${appointment.patient_id}`}
                          className="rounded-lg border px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View patient
                        </Link>

                        {["checked_in", "waiting"].includes(
                          appointment.status,
                        ) && (
                          <Link
                            href={`/doctor/consultations/new?appointment=${appointment.id}`}
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Start consultation
                          </Link>
                        )}

                        {appointment.status === "in_consultation" && (
                          <Link
                            href={`/doctor/consultations/new?appointment=${appointment.id}`}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Continue consultation
                          </Link>
                        )}

                        {appointment.status === "scheduled" && (
                          <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                            Awaiting check-in
                          </span>
                        )}

                        {appointment.status === "completed" && (
                          <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                            Consultation completed
                          </span>
                        )}

                        {appointment.status === "cancelled" && (
                          <span className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                            Appointment cancelled
                          </span>
                        )}

                        {appointment.status === "no_show" && (
                          <span className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                            Patient did not attend
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </Shell>
  );
}
