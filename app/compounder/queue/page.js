"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";

export default function Queue() {
  const router = useRouter();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD QUEUE
  // =========================

  async function loadQueue() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/queue", {
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
        setError(data.message || "Unable to load queue.");
        return;
      }

      setQueue(data.queue || []);
    } catch (error) {
      console.error("LOAD QUEUE ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================

  async function updateStatus(appointmentId, status) {
    try {
      setError("");
      setSuccess("");
      setActionLoading(appointmentId);

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
        setError(data.message || "Unable to update patient status.");
        return;
      }

      setSuccess(data.message || "Queue updated successfully.");

      await loadQueue();
    } catch (error) {
      console.error("QUEUE STATUS ERROR:", error);

      setError("Unable to update queue.");
    } finally {
      setActionLoading(null);
    }
  }

  // =========================
  // HELPERS
  // =========================

  function formatTime(time) {
    if (!time) return "";

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

  function getInitials(name) {
    if (!name) return "P";

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
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
    };

    return (
      statuses[status] || {
        label: status || "Unknown",
        tone: "gray",
      }
    );
  }

  const waitingCount = queue.filter((item) => item.status === "waiting").length;

  return (
    <Shell
      role="compounder"
      title="Today's Queue"
      subtitle="Manage today's clinic waiting room"
    >
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

      <div className="max-w-4xl bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center gap-4">
          <div>
            <b>Waiting room</b>

            <p className="text-xs text-slate-500 mt-1">
              Check patients in and move them to the doctor queue.
            </p>
          </div>

          <Badge tone="amber">{waitingCount} waiting</Badge>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />

            <p className="mt-4 text-sm text-slate-500">Loading queue...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-semibold">Queue is empty</h3>

            <p className="mt-1 text-sm text-slate-500">
              There are no active appointments in today's queue.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {queue.map((item) => {
              const status = getStatus(item.status);

              const updating = actionLoading === item.id;

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center font-semibold">
                      {getInitials(item.patient_name)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <b>{item.patient_name}</b>

                        <span className="text-xs text-slate-400">
                          {item.patient_code}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        {item.token_number
                          ? `Token ${item.token_number} · `
                          : ""}

                        {formatTime(item.appointment_time)}

                        {" · "}

                        {item.doctor_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <Badge tone={status.tone}>{status.label}</Badge>

                    {item.status === "scheduled" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updateStatus(item.id, "checked_in")}
                        className="border rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Check in"}
                      </button>
                    )}

                    {item.status === "checked_in" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updateStatus(item.id, "waiting")}
                        className="bg-slate-950 text-white rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Add to queue"}
                      </button>
                    )}

                    {item.status === "waiting" && (
                      <span className="text-xs font-medium text-amber-700">
                        Waiting for doctor
                      </span>
                    )}

                    {item.status === "in_consultation" && (
                      <span className="text-xs font-medium text-blue-700">
                        With doctor
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
