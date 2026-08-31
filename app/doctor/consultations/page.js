"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";
import Icon from "@/components/Icon";

export default function ConsultationsPage() {
  const router = useRouter();

  const [doctor, setDoctor] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD CONSULTATIONS
  // ========================================

  const loadConsultations = useCallback(
    async (searchValue = "", statusValue = "") => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (searchValue.trim()) {
          params.set("search", searchValue.trim());
        }

        if (statusValue) {
          params.set("status", statusValue);
        }

        const query = params.toString();

        const url = query
          ? `/api/doctors/consultations?${query}`
          : "/api/doctors/consultations";

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

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
          setError(data.message || "Unable to load consultations.");

          return;
        }

        setDoctor(data.doctor || null);
        setStats(data.stats || null);
        setConsultations(data.consultations || []);
      } catch (error) {
        console.error("LOAD DOCTOR CONSULTATIONS ERROR:", error);

        setError(error.message || "Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadConsultations("", "");
  }, [loadConsultations]);

  // ========================================
  // SEARCH DEBOUNCE
  // ========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadConsultations(search, statusFilter);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, statusFilter, loadConsultations]);

  // ========================================
  // DATE
  // ========================================

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

  // ========================================
  // TIME
  // ========================================

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
  // CONSULTATION STATUS
  // ========================================

  function getConsultationStatus(status) {
    const statuses = {
      draft: {
        label: "Draft",
        tone: "gray",
      },

      recorded: {
        label: "Recorded",
        tone: "blue",
      },

      processing: {
        label: "Processing",
        tone: "amber",
      },

      transcribed: {
        label: "Transcribed",
        tone: "blue",
      },

      reviewed: {
        label: "Reviewed",
        tone: "green",
      },

      completed: {
        label: "Completed",
        tone: "green",
      },

      failed: {
        label: "Failed",
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
  // TRANSCRIPT STATUS
  // ========================================

  function getTranscriptStatus(status) {
    const statuses = {
      draft: {
        label: "Transcript draft",
        tone: "gray",
      },

      processing: {
        label: "Transcript processing",
        tone: "amber",
      },

      ready: {
        label: "Transcript ready",
        tone: "blue",
      },

      reviewed: {
        label: "Transcript reviewed",
        tone: "green",
      },

      failed: {
        label: "Transcript failed",
        tone: "red",
      },
    };

    return statuses[status] || null;
  }

  // ========================================
  // AUDIO DURATION
  // ========================================

  function formatDuration(seconds) {
    if (
      seconds === null ||
      seconds === undefined ||
      Number.isNaN(Number(seconds))
    ) {
      return null;
    }

    const totalSeconds = Math.round(Number(seconds));

    const minutes = Math.floor(totalSeconds / 60);

    const remainingSeconds = totalSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  // ========================================
  // OPEN URL
  // ========================================

  function getConsultationUrl(consultation) {
    if (consultation.appointment_id) {
      return `/doctor/consultations/new?appointment=${consultation.appointment_id}`;
    }

    return `/doctor/patients/${consultation.patient_id}`;
  }

  // ========================================
  // RESET FILTERS
  // ========================================

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
  }

  // ========================================
  // UI
  // ========================================

  return (
    <Shell
      role="doctor"
      title="Consultations"
      subtitle="All consultation records"
      user={doctor}
    >
      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-950">
          Consultation records
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Review your consultation, recording and transcript history.
        </p>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}

          <button
            type="button"
            onClick={() => loadConsultations(search, statusFilter)}
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
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs text-slate-500">Total consultations</p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {stats.total || 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs text-slate-500">Recorded</p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {stats.recorded || 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs text-slate-500">Transcribed / Reviewed</p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {(stats.transcribed || 0) + (stats.reviewed || 0)}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs text-slate-500">Completed</p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {stats.completed || 0}
            </p>
          </div>
        </div>
      )}

      {/* ========================================
          SEARCH + FILTER
      ======================================== */}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-3 text-slate-400">
            <Icon name="search" size={18} />
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Search by patient name, phone or ID"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="">All statuses</option>

            <option value="draft">Draft</option>

            <option value="recorded">Recorded</option>

            <option value="processing">Processing</option>

            <option value="transcribed">Transcribed</option>

            <option value="reviewed">Reviewed</option>

            <option value="completed">Completed</option>

            <option value="failed">Failed</option>
          </select>

          {(search || statusFilter) && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ========================================
          TABLE
      ======================================== */}

      <div className="overflow-hidden rounded-2xl border bg-white">
        {loading ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Loading consultations...
            </p>
          </div>
        ) : consultations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
              <Icon name="clipboard" size={20} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No consultations found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {search || statusFilter
                ? "No consultation records match the selected filters."
                : "Your consultation records will appear here after consultations are started."}
            </p>

            {(search || statusFilter) && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 text-left font-medium">Patient</th>

                  <th className="p-4 text-left font-medium">Appointment</th>

                  <th className="p-4 text-left font-medium">Consultation</th>

                  <th className="p-4 text-left font-medium">Recording</th>

                  <th className="p-4 text-left font-medium">Transcript</th>

                  <th className="p-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {consultations.map((consultation) => {
                  const consultationStatus = getConsultationStatus(
                    consultation.status,
                  );

                  const transcriptStatus = getTranscriptStatus(
                    consultation.transcript_status,
                  );

                  const duration = formatDuration(
                    consultation.audio_duration_seconds,
                  );

                  return (
                    <tr key={consultation.id} className="hover:bg-slate-50/50">
                      {/* PATIENT */}

                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {consultation.patient_name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {consultation.patient_code}
                        </div>
                      </td>

                      {/* APPOINTMENT */}

                      <td className="p-4">
                        {consultation.appointment_date ? (
                          <>
                            <div className="text-slate-700">
                              {formatDate(consultation.appointment_date)}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {formatTime(consultation.appointment_time)}

                              {consultation.token_number
                                ? ` · Token ${consultation.token_number}`
                                : ""}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">No appointment</span>
                        )}
                      </td>

                      {/* CONSULTATION */}

                      <td className="p-4">
                        <Badge tone={consultationStatus.tone}>
                          {consultationStatus.label}
                        </Badge>

                        {consultation.started_at && (
                          <div className="mt-2 text-xs text-slate-400">
                            Started {formatDate(consultation.started_at)}
                          </div>
                        )}
                      </td>

                      {/* RECORDING */}

                      <td className="p-4">
                        {Number(consultation.audio_count) > 0 ? (
                          <>
                            <div className="font-medium text-slate-700">
                              {Number(consultation.audio_count)} recording
                              {Number(consultation.audio_count) === 1
                                ? ""
                                : "s"}
                            </div>

                            <div className="mt-1 text-xs capitalize text-slate-500">
                              {consultation.latest_audio_status || "Uploaded"}

                              {duration ? ` · ${duration}` : ""}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">No recording</span>
                        )}
                      </td>

                      {/* TRANSCRIPT */}

                      <td className="p-4">
                        {transcriptStatus ? (
                          <>
                            <Badge tone={transcriptStatus.tone}>
                              {transcriptStatus.label}
                            </Badge>

                            {consultation.word_count && (
                              <div className="mt-2 text-xs text-slate-400">
                                {consultation.word_count} words
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">Not generated</span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/doctor/patients/${consultation.patient_id}`}
                            className="text-xs font-medium text-slate-600 hover:text-slate-950"
                          >
                            Patient
                          </Link>

                          <Link
                            href={getConsultationUrl(consultation)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Open
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

      {/* ========================================
          FOOTER COUNT
      ======================================== */}

      {!loading && consultations.length > 0 && (
        <p className="mt-4 text-xs text-slate-400">
          Showing {consultations.length} consultation
          {consultations.length === 1 ? "" : "s"}
        </p>
      )}
    </Shell>
  );
}
