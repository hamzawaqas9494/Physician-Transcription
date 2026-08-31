"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Stat from "@/components/Stat";
import Badge from "@/components/Badge";
import Icon from "@/components/Icon";

export default function CompounderDashboard() {
  const router = useRouter();

  const [compounder, setCompounder] = useState(null);

  const [stats, setStats] = useState({
    total_patients: 0,
    today_appointments: 0,
    scheduled: 0,
    checked_in: 0,
    waiting: 0,
    in_consultation: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  });

  const [queue, setQueue] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // LOAD DASHBOARD
  // =========================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/compounder/dashboard", {
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
        setError(data.message || "Unable to load dashboard.");

        return;
      }

      setCompounder(data.compounder);

      setStats(data.stats || {});

      setQueue(data.queue || []);
    } catch (error) {
      console.error("LOAD DASHBOARD ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================
  // AUTO REFRESH
  // =========================

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // HELPERS
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

  function formatDate() {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }

  // =========================
  // LOADING
  // =========================

  if (loading && !compounder) {
    return (
      <Shell
        role="compounder"
        title="Compounder Dashboard"
        subtitle="Loading clinic information"
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

  if (error && !compounder) {
    return (
      <Shell
        role="compounder"
        title="Compounder Dashboard"
        subtitle="Dashboard unavailable"
      >
        <div className="bg-white border rounded-2xl px-6 py-16 text-center">
          <h2 className="text-xl font-bold">Unable to load dashboard</h2>

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

  if (!compounder) {
    return null;
  }

  return (
    <Shell
      role="compounder"
      title={`Welcome, ${compounder.name}`}
      subtitle={formatDate()}
      user={compounder}
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
          <h2 className="text-2xl font-bold">Clinic operations</h2>

          <p className="text-sm text-slate-500 mt-1">
            Register patients and keep today's queue moving.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/compounder/appointments"
            className="border rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Book appointment
          </Link>

          <Link
            href="/compounder/patients/new"
            className="flex items-center gap-2 bg-slate-950 text-white rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <Icon name="plus" size={17} />
            Add patient
          </Link>
        </div>
      </div>

      {/* =========================
          STATS
      ========================== */}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          label="Total patients"
          value={stats.total_patients || 0}
          delta="All registered patients"
        />

        <Stat
          label="Today's appointments"
          value={stats.today_appointments || 0}
          delta="Appointments scheduled today"
        />

        <Stat
          label="Waiting"
          value={stats.waiting || 0}
          delta="Patients waiting for doctor"
        />

        <Stat
          label="Checked in"
          value={stats.checked_in || 0}
          delta="Patients currently checked in"
        />
      </div>

      {/* =========================
          EXTRA STATUS
      ========================== */}

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">In consultation</p>

          <p className="mt-2 text-2xl font-bold">
            {stats.in_consultation || 0}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">Completed today</p>

          <p className="mt-2 text-2xl font-bold">{stats.completed || 0}</p>
        </div>
      </div>

      {/* =========================
          TODAY QUEUE
      ========================== */}

      <div className="mt-7 bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
          <div>
            <b>Today's queue</b>

            <p className="text-xs text-slate-500 mt-1">
              Current appointments and patient status
            </p>
          </div>

          <Link
            href="/compounder/queue"
            className="text-sm font-medium text-blue-600"
          >
            Open queue
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-500">
              <Icon name="calendar" size={20} />
            </div>

            <h3 className="mt-4 font-semibold">No appointments today</h3>

            <p className="mt-1 text-sm text-slate-500">
              Today's booked patients will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {queue.map((appointment) => {
              const status = getStatus(appointment.status);

              return (
                <div
                  key={appointment.id}
                  className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-sm">{appointment.patient_name}</b>

                      <span className="text-xs text-slate-400">
                        {appointment.patient_code}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {appointment.token_number
                        ? `Token ${appointment.token_number}`
                        : "No token"}

                      {" · "}

                      {formatTime(appointment.appointment_time)}

                      {" · "}

                      {appointment.doctor_name}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={status.tone}>{status.label}</Badge>

                    <Link
                      href={`/compounder/patients/${appointment.patient_id}`}
                      className="border rounded-lg px-3 py-2 text-xs font-medium"
                    >
                      View patient
                    </Link>

                    {[
                      "scheduled",
                      "checked_in",
                      "waiting",
                      "in_consultation",
                    ].includes(appointment.status) && (
                      <Link
                        href="/compounder/queue"
                        className="bg-slate-950 text-white rounded-lg px-3 py-2 text-xs font-medium"
                      >
                        Manage queue
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================
          ACCOUNT INFO
      ========================== */}

      <div className="mt-7 bg-white border rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Account Information
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Full Name</p>

            <p className="mt-1 font-semibold">{compounder.name}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Email</p>

            <p className="mt-1 font-semibold">{compounder.email}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Phone</p>

            <p className="mt-1 font-semibold">
              {compounder.phone || "Not added"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Role</p>

            <Badge tone="blue">Compounder</Badge>
          </div>

          <div>
            <p className="text-xs text-slate-400">Account Status</p>

            <Badge tone={compounder.is_active ? "green" : "red"}>
              {compounder.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-slate-400">Last Login</p>

            <p className="mt-1 text-sm font-medium">
              {compounder.last_login_at
                ? new Date(compounder.last_login_at).toLocaleString()
                : "First login"}
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
