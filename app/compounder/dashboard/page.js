"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Stat from "@/components/Stat";
import Badge from "@/components/Badge";
import Icon from "@/components/Icon";

export default function CompounderDashboard() {
  const router = useRouter();

  // ======================================================
  // COMPOUNDER
  // ======================================================

  const [compounder, setCompounder] = useState(null);

  // ======================================================
  // STATS
  // ======================================================

  const [stats, setStats] = useState({
    total_patients: 0,
    active_appointments: 0,
    today_appointments: 0,
    scheduled: 0,
    checked_in: 0,
    waiting: 0,
    in_consultation: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
    upcoming_appointments: 0,
    total_queue: 0,
  });

  // ======================================================
  // QUEUE
  // ======================================================

  const [queue, setQueue] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  // ======================================================
  // CLINIC DATE
  // ======================================================

  const [clinicDate, setClinicDate] = useState("");

  // ======================================================
  // PAGE STATES
  // ======================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  const loadDashboard = useCallback(
    async (showInitialLoader = false) => {
      try {
        if (showInitialLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          `/api/compounder/dashboard?time=${Date.now()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          },
        );

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
        // COMPOUNDER
        // =========================

        setCompounder(data.compounder || null);

        // =========================
        // CLINIC DATE
        // =========================

        setClinicDate(data.clinic_date || "");

        // =========================
        // STATS
        // =========================

        setStats({
          total_patients: Number(data.stats?.total_patients) || 0,

          active_appointments: Number(data.stats?.active_appointments) || 0,

          today_appointments: Number(data.stats?.today_appointments) || 0,

          scheduled: Number(data.stats?.scheduled) || 0,

          checked_in: Number(data.stats?.checked_in) || 0,

          waiting: Number(data.stats?.waiting) || 0,

          in_consultation: Number(data.stats?.in_consultation) || 0,

          completed: Number(data.stats?.completed) || 0,

          cancelled: Number(data.stats?.cancelled) || 0,

          no_show: Number(data.stats?.no_show) || 0,

          upcoming_appointments: Number(data.stats?.upcoming_appointments) || 0,

          total_queue: Number(data.stats?.total_queue) || 0,
        });

        // =========================
        // QUEUE
        // =========================

        setQueue(Array.isArray(data.queue) ? data.queue : []);

        // =========================
        // UPCOMING
        // =========================

        setUpcomingAppointments(
          Array.isArray(data.upcoming_appointments)
            ? data.upcoming_appointments
            : [],
        );
      } catch (error) {
        console.error("LOAD COMPOUNDER DASHBOARD ERROR:", error);

        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  // ======================================================
  // INITIAL LOAD ONLY
  // ======================================================

  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  // ======================================================
  // STATUS
  // ======================================================

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

  // ======================================================
  // TIME FORMAT
  // ======================================================

  function formatTime(time) {
    if (!time) {
      return "—";
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

  // ======================================================
  // APPOINTMENT DATE FORMAT
  // ======================================================

  function formatAppointmentDate(dateString) {
    if (!dateString) {
      return "—";
    }

    const [year, month, day] = dateString.split("-");

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  // ======================================================
  // CLINIC DATE FORMAT
  // ======================================================

  function formatClinicDate() {
    if (!clinicDate) {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    }

    const [year, month, day] = clinicDate.split("-");

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading && !compounder) {
    return (
      <Shell
        role="compounder"
        title="Compounder Dashboard"
        subtitle="Loading clinic information"
      >
        <div className="rounded-2xl border bg-white px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </Shell>
    );
  }

  // ======================================================
  // FATAL ERROR
  // ======================================================

  if (error && !compounder) {
    return (
      <Shell
        role="compounder"
        title="Compounder Dashboard"
        subtitle="Dashboard unavailable"
      >
        <div className="rounded-2xl border bg-white px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-950">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  if (!compounder) {
    return null;
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <Shell
      role="compounder"
      title={`Welcome, ${compounder.name}`}
      subtitle={formatClinicDate()}
      user={compounder}
    >
      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Clinic operations
            </h2>

            {refreshing && (
              <span className="text-xs font-medium text-slate-400">
                Updating...
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage patients, appointments and the active clinic queue.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* MANUAL REFRESH */}

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadDashboard(false)}
            className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {/* APPOINTMENT */}

          <Link
            href="/compounder/appointments"
            className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Book appointment
          </Link>

          {/* PATIENT */}

          <Link
            href="/compounder/patients/new"
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Icon name="plus" size={17} />
            Add patient
          </Link>
        </div>
      </div>

      {/* =================================================
          PRIMARY STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total patients"
          value={stats.total_patients}
          delta="All registered patients"
        />

        <Stat
          label="Active appointments"
          value={stats.active_appointments}
          delta="Today and upcoming"
        />

        <Stat
          label="Checked in"
          value={stats.checked_in}
          delta="Active checked-in patients"
        />

        <Stat
          label="Waiting"
          value={stats.waiting}
          delta="Patients waiting for doctor"
        />
      </div>

      {/* =================================================
          SECONDARY STATS
      ================================================= */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TODAY */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Today's appointments</p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {stats.today_appointments}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Clinic appointments today
          </p>
        </div>

        {/* UPCOMING */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Upcoming</p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {stats.upcoming_appointments}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Future active appointments
          </p>
        </div>

        {/* IN CONSULTATION */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">In consultation</p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {stats.in_consultation}
          </p>

          <p className="mt-1 text-xs text-slate-400">Currently with doctor</p>
        </div>

        {/* COMPLETED */}

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Completed today</p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {stats.completed}
          </p>

          <p className="mt-1 text-xs text-slate-400">Finished consultations</p>
        </div>
      </div>

      {/* =================================================
          ACTIVE QUEUE
      ================================================= */}

      <section className="mt-7 overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Active appointment queue
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Today's and upcoming active appointments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge tone="blue">{stats.total_queue} active</Badge>

            <Link
              href="/compounder/queue"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Open queue
            </Link>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
              <Icon name="calendar" size={20} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No active appointments
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Today and future active appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {queue.map((appointment) => {
              const status = getStatus(appointment.status);

              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* PATIENT */}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">
                        {appointment.patient_name}
                      </p>

                      <span className="text-xs text-slate-400">
                        {appointment.patient_code}
                      </span>

                      {appointment.is_today && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>
                        {formatAppointmentDate(appointment.appointment_date)}
                      </span>

                      <span>·</span>

                      <span>{formatTime(appointment.appointment_time)}</span>

                      <span>·</span>

                      <span>
                        {appointment.token_number
                          ? `Token ${appointment.token_number}`
                          : "No token"}
                      </span>

                      <span>·</span>

                      <span>{appointment.doctor_name}</span>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={status.tone}>{status.label}</Badge>

                    <Link
                      href={`/compounder/patients/${appointment.patient_id}`}
                      className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View patient
                    </Link>

                    <Link
                      href="/compounder/queue"
                      className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Manage queue
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =================================================
          ACCOUNT INFORMATION
      ================================================= */}

      <section className="mt-7 rounded-2xl border bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Account information
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {/* NAME */}

          <div>
            <p className="text-xs text-slate-400">Full name</p>

            <p className="mt-1 font-semibold">{compounder.name}</p>
          </div>

          {/* EMAIL */}

          <div>
            <p className="text-xs text-slate-400">Email</p>

            <p className="mt-1 font-semibold">{compounder.email}</p>
          </div>

          {/* PHONE */}

          <div>
            <p className="text-xs text-slate-400">Phone</p>

            <p className="mt-1 font-semibold">
              {compounder.phone || "Not added"}
            </p>
          </div>

          {/* ROLE */}

          <div>
            <p className="text-xs text-slate-400">Role</p>

            <div className="mt-2">
              <Badge tone="blue">Compounder</Badge>
            </div>
          </div>

          {/* STATUS */}

          <div>
            <p className="text-xs text-slate-400">Account status</p>

            <div className="mt-2">
              <Badge tone={compounder.is_active ? "green" : "red"}>
                {compounder.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* LAST LOGIN */}

          <div>
            <p className="text-xs text-slate-400">Last login</p>

            <p className="mt-1 text-sm font-medium">
              {compounder.last_login_at
                ? new Date(compounder.last_login_at).toLocaleString()
                : "First login"}
            </p>
          </div>
        </div>
      </section>
    </Shell>
  );
}
