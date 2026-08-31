"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Stat from "@/components/Stat";
import Badge from "@/components/Badge";
import Icon from "@/components/Icon";

export default function DoctorDashboard() {
  const router = useRouter();

  // =========================
  // STATE
  // =========================

  const [doctor, setDoctor] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    checked_in: 0,
    waiting: 0,
    in_consultation: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  });

  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOAD DASHBOARD
  // =========================

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/doctors/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      // =========================
      // AUTH
      // =========================

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      // =========================
      // ERROR
      // =========================

      if (!response.ok) {
        setError(data.message || "Unable to load dashboard.");
        return;
      }

      // =========================
      // SET DATA
      // =========================

      setDoctor(data.doctor);

      setStats({
        total: data.stats?.total || 0,
        scheduled: data.stats?.scheduled || 0,
        checked_in: data.stats?.checked_in || 0,
        waiting: data.stats?.waiting || 0,
        in_consultation: data.stats?.in_consultation || 0,
        completed: data.stats?.completed || 0,
        cancelled: data.stats?.cancelled || 0,
        no_show: data.stats?.no_show || 0,
      });

      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("LOAD DOCTOR DASHBOARD ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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
  // FORMAT TIME
  // =========================

  function formatTime(time) {
    if (!time) {
      return "—";
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

  // =========================
  // INITIALS
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

  // =========================
  // DATE
  // =========================

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Shell
        role="doctor"
        title="Doctor dashboard"
        subtitle="Loading dashboard"
      >
        <div className="bg-white border rounded-2xl px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </Shell>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !doctor) {
    return (
      <Shell role="doctor" title="Doctor dashboard" subtitle={today}>
        <div className="bg-white border rounded-2xl px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  if (!doctor) {
    return null;
  }

  // =========================
  // FRONTEND
  // =========================

  return (
    <Shell
      role="doctor"
      title={`Good morning, ${doctor.name}`}
      subtitle={today}
      user={doctor}
    >
      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================
          HEADER
      ========================== */}

      <div className="flex flex-wrap justify-between gap-4 mb-7">
        <div>
          <h2 className="text-2xl font-bold">Today's overview</h2>

          <p className="text-sm text-slate-500 mt-1">
            Your clinic activity at a glance.
          </p>
        </div>
      </div>

      {/* =========================
          STATS
      ========================== */}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          label="Today's patients"
          value={stats.total}
          delta="Total appointments today"
        />

        <Stat label="Waiting" value={stats.waiting} delta="Patients waiting" />

        <Stat
          label="In consultation"
          value={stats.in_consultation}
          delta="Currently consulting"
        />

        <Stat
          label="Completed"
          value={stats.completed}
          delta="Consultations completed"
        />
      </div>

      {/* =========================
          MAIN GRID
      ========================== */}

      <div className="mt-7 grid xl:grid-cols-[1fr_340px] gap-5">
        {/* =========================
            APPOINTMENTS
        ========================== */}

        <section className="bg-white border rounded-2xl overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between gap-4">
            <div>
              <b>Today's appointments</b>

              <p className="text-xs text-slate-500 mt-1">
                Your scheduled consultations
              </p>
            </div>

            <Link
              href="/doctor/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View calendar
            </Link>
          </div>

          {/* EMPTY */}

          {appointments.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-500">
                <Icon name="calendar" size={20} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No appointments today
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Today's appointments will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((appointment) => {
                const status = getStatus(appointment.status);

                return (
                  <div
                    key={appointment.id}
                    className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* PATIENT */}

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 grid place-items-center font-semibold text-slate-700">
                        {getInitials(appointment.patient_name)}
                      </div>

                      <div>
                        <div className="font-medium text-slate-900">
                          {appointment.patient_name}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {formatTime(appointment.appointment_time)}

                          {appointment.token_number && (
                            <>
                              {" · "}
                              Token {appointment.token_number}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone={status.tone}>{status.label}</Badge>

                      <Link
                        href={`/doctor/patients/${appointment.patient_id}`}
                        className="text-sm font-medium text-slate-700 hover:text-slate-950"
                      >
                        View patient
                      </Link>

                      {/* =========================
                          START CONSULTATION
                      ========================== */}

                      {appointment.status === "waiting" && (
                        <Link
                          href={`/doctor/consultations/new?appointment=${appointment.id}`}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Start
                        </Link>
                      )}

                      {/* =========================
                          CONTINUE CONSULTATION
                      ========================== */}

                      {appointment.status === "in_consultation" && (
                        <Link
                          href={`/doctor/consultations/new?appointment=${appointment.id}`}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Continue
                        </Link>
                      )}

                      {/* COMPLETED */}

                      {appointment.status === "completed" && (
                        <span className="text-xs font-medium text-emerald-700">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================
            DOCTOR CARD
        ========================== */}

        <section className="bg-slate-950 text-white rounded-2xl p-6">
          <div className="text-sm text-slate-400">Doctor account</div>

          <h3 className="mt-2 text-xl font-bold">{doctor.name}</h3>

          <p className="mt-2 text-sm text-slate-400">{doctor.email}</p>

          {doctor.phone && (
            <p className="mt-1 text-sm text-slate-400">{doctor.phone}</p>
          )}

          {/* STATS */}

          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Today's patients</span>

              <span className="font-semibold">{stats.total}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-slate-400">Waiting</span>

              <span className="font-semibold">{stats.waiting}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-slate-400">In consultation</span>

              <span className="font-semibold">{stats.in_consultation}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-slate-400">Completed</span>

              <span className="font-semibold">{stats.completed}</span>
            </div>
          </div>

          {/* APPOINTMENTS */}

          <Link
            href="/doctor/appointments"
            className="mt-6 flex items-center justify-center gap-2 bg-white text-slate-950 rounded-xl py-3 font-semibold text-sm hover:bg-slate-100"
          >
            <Icon name="arrow" size={17} />
            View appointments
          </Link>
        </section>
      </div>
    </Shell>
  );
}
