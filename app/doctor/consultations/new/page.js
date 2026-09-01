"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import Badge from "@/components/Badge";

// ======================================================
// OUTER PAGE
// IMPORTANT:
// useSearchParams() is NOT used here.
// Inner component is wrapped inside Suspense.
// ======================================================

export default function NewConsultationPage() {
  return (
    <Suspense fallback={<ConsultationLoading />}>
      <NewConsultationContent />
    </Suspense>
  );
}

// ======================================================
// SUSPENSE FALLBACK
// ======================================================

function ConsultationLoading() {
  return (
    <Shell
      role="doctor"
      title="New consultation"
      subtitle="Loading consultation"
    >
      <div className="max-w-5xl">
        <div className="bg-white border rounded-2xl px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading consultation...</p>
        </div>
      </div>
    </Shell>
  );
}

// ======================================================
// INNER CLIENT COMPONENT
// useSearchParams() is safe here because parent wraps it
// in Suspense.
// ======================================================

function NewConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointment");

  // =========================
  // MAIN DATA
  // =========================

  const [appointment, setAppointment] = useState(null);

  const [patient, setPatient] = useState(null);

  const [medicalHistory, setMedicalHistory] = useState([]);

  const [consultation, setConsultation] = useState(null);

  // =========================
  // PAGE STATE
  // =========================

  const [loading, setLoading] = useState(true);

  const [starting, setStarting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================
  // RECORDING STATE
  // =========================

  const [isRecording, setIsRecording] = useState(false);

  const [isPaused, setIsPaused] = useState(false);

  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [audioBlob, setAudioBlob] = useState(null);

  const [audioUrl, setAudioUrl] = useState("");

  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [uploadedRecording, setUploadedRecording] = useState(null);

  // =========================
  // TRANSCRIPTION STATE
  // =========================

  const [transcribing, setTranscribing] = useState(false);

  const [transcript, setTranscript] = useState(null);

  // =========================
  // REFS
  // =========================

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  // =========================
  // SAFE JSON RESPONSE
  // =========================

  async function getResponseData(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();

    throw new Error(
      text
        ? `Server returned an invalid response (${response.status}).`
        : "Server returned an invalid response.",
    );
  }

  // =========================
  // LOAD CONSULTATION DATA
  // =========================

  async function loadConsultationData() {
    if (!appointmentId) {
      setError("Appointment ID is missing.");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        `/api/doctors/consultations/start?appointment=${encodeURIComponent(
          appointmentId,
        )}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        router.replace("/login");

        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");

        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to load consultation information.");

        return;
      }

      setAppointment(data.appointment || null);

      setPatient(data.patient || null);

      setMedicalHistory(data.medical_history || []);

      setConsultation(data.consultation || null);

      // If backend later returns existing audio
      if (data.audio_recording) {
        setUploadedRecording(data.audio_recording);
      }

      // If backend later returns existing transcript
      if (data.transcript) {
        setTranscript(data.transcript);
      }
    } catch (error) {
      console.error("LOAD CONSULTATION ERROR:", error);

      setError(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadConsultationData();
  }, [appointmentId]);

  // =========================
  // START CONSULTATION
  // =========================

  async function handleStartConsultation() {
    if (!appointmentId) {
      setError("Appointment ID is missing.");

      return;
    }

    try {
      setStarting(true);

      setError("");
      setSuccess("");

      const response = await fetch("/api/doctors/consultations/start", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          appointment_id: Number(appointmentId),
        }),
      });

      const data = await getResponseData(response);

      if (response.status === 401) {
        router.replace("/login");

        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");

        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to start consultation.");

        return;
      }

      setConsultation(data.consultation || null);

      setAppointment((previous) =>
        previous
          ? {
              ...previous,
              status: "in_consultation",
            }
          : previous,
      );

      setSuccess(data.message || "Consultation started successfully.");
    } catch (error) {
      console.error("START CONSULTATION ERROR:", error);

      setError(error.message || "Unable to connect to the server.");
    } finally {
      setStarting(false);
    }
  }

  // =========================
  // TIMER
  // =========================

  function startTimer() {
    stopTimer();

    timerRef.current = setInterval(() => {
      setRecordingSeconds((previous) => previous + 1);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  }

  function formatDuration(totalSeconds) {
    const safeSeconds = Number(totalSeconds) || 0;

    const minutes = Math.floor(safeSeconds / 60);

    const seconds = Math.floor(safeSeconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  // =========================
  // STOP MICROPHONE STREAM
  // =========================

  function stopMicrophoneStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  }

  // =========================
  // START RECORDING
  // =========================

  async function handleStartRecording() {
    try {
      setError("");
      setSuccess("");

      if (!consultation?.id) {
        setError("Start the consultation before recording.");

        return;
      }

      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        setError("Microphone recording is not supported in this browser.");

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      let mimeType = "";

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;

      chunksRef.current = [];

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioBlob(null);
      setAudioUrl("");

      setUploadedRecording(null);

      setTranscript(null);

      setRecordingSeconds(0);
      setIsPaused(false);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || "audio/webm";

        const blob = new Blob(chunksRef.current, {
          type: finalMimeType,
        });

        const previewUrl = URL.createObjectURL(blob);

        setAudioBlob(blob);

        setAudioUrl(previewUrl);

        setIsRecording(false);

        setIsPaused(false);

        stopTimer();

        stopMicrophoneStream();

        recorderRef.current = null;
      };

      recorder.onerror = (event) => {
        console.error("MEDIA RECORDER ERROR:", event.error);

        setError("An error occurred while recording.");

        setIsRecording(false);

        setIsPaused(false);

        stopTimer();

        stopMicrophoneStream();

        recorderRef.current = null;
      };

      recorder.start(1000);

      setIsRecording(true);

      setIsPaused(false);

      startTimer();
    } catch (error) {
      console.error("START RECORDING ERROR:", error);

      stopMicrophoneStream();

      if (error.name === "NotAllowedError") {
        setError(
          "Microphone permission was denied. Please allow microphone access.",
        );
      } else if (error.name === "NotFoundError") {
        setError("No microphone was found on this device.");
      } else {
        setError("Unable to start microphone recording.");
      }
    }
  }

  // =========================
  // PAUSE RECORDING
  // =========================

  function handlePauseRecording() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state === "recording") {
      recorder.pause();

      setIsPaused(true);

      stopTimer();
    }
  }

  // =========================
  // RESUME RECORDING
  // =========================

  function handleResumeRecording() {
    const recorder = recorderRef.current;

    if (recorder && recorder.state === "paused") {
      recorder.resume();

      setIsPaused(false);

      startTimer();
    }
  }

  // =========================
  // STOP RECORDING
  // =========================

  function handleStopRecording() {
    const recorder = recorderRef.current;

    if (
      recorder &&
      (recorder.state === "recording" || recorder.state === "paused")
    ) {
      recorder.stop();
    }
  }

  // =========================
  // RECORD AGAIN
  // =========================

  function handleRecordAgain() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);

    setAudioUrl("");

    setRecordingSeconds(0);

    setUploadedRecording(null);

    setTranscript(null);

    setError("");

    setSuccess("");
  }

  // =========================
  // UPLOAD AUDIO
  // =========================

  async function handleUploadAudio() {
    if (!audioBlob) {
      setError("Record audio before saving.");

      return;
    }

    if (!consultation?.id) {
      setError("Consultation ID is missing.");

      return;
    }

    try {
      setUploadingAudio(true);

      setError("");
      setSuccess("");

      let extension = "webm";

      if (audioBlob.type.includes("ogg")) {
        extension = "ogg";
      } else if (audioBlob.type.includes("mp4")) {
        extension = "mp4";
      } else if (audioBlob.type.includes("mpeg")) {
        extension = "mp3";
      } else if (audioBlob.type.includes("wav")) {
        extension = "wav";
      }

      const file = new File(
        [audioBlob],
        `consultation-${consultation.id}.${extension}`,
        {
          type: audioBlob.type || "audio/webm",
        },
      );

      const formData = new FormData();

      formData.append("consultation_id", String(consultation.id));

      formData.append("duration_seconds", String(recordingSeconds));

      formData.append("audio", file);

      const response = await fetch("/api/doctors/consultations/audio", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await getResponseData(response);

      if (response.status === 401) {
        router.replace("/login");

        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");

        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to save audio recording.");

        return;
      }

      setUploadedRecording(data.audio_recording || null);

      setConsultation((previous) =>
        previous
          ? {
              ...previous,
              status: "recorded",
            }
          : previous,
      );

      setSuccess(data.message || "Audio recording saved successfully.");
    } catch (error) {
      console.error("UPLOAD AUDIO ERROR:", error);

      setError(error.message || "Unable to upload audio recording.");
    } finally {
      setUploadingAudio(false);
    }
  }

  // =========================
  // GENERATE TRANSCRIPT
  // =========================

  async function handleGenerateTranscript() {
    if (!consultation?.id) {
      setError("Consultation ID is missing.");

      return;
    }

    if (!uploadedRecording?.id) {
      setError("Please save the audio recording first.");

      return;
    }

    try {
      setTranscribing(true);

      setError("");
      setSuccess("");

      const response = await fetch("/api/doctors/consultations/transcribe", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          consultation_id: consultation.id,

          audio_recording_id: uploadedRecording.id,
        }),
      });

      const data = await getResponseData(response);

      if (response.status === 401) {
        router.replace("/login");

        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");

        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to generate transcript.");

        return;
      }

      setTranscript(data.transcript || null);

      setConsultation((previous) =>
        previous
          ? {
              ...previous,
              status: "transcribed",
            }
          : previous,
      );

      setSuccess(data.message || "Transcript generated successfully.");
    } catch (error) {
      console.error("GENERATE TRANSCRIPT ERROR:", error);

      setError(error.message || "Unable to generate transcript.");
    } finally {
      setTranscribing(false);
    }
  }

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      stopTimer();

      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {}
      }

      stopMicrophoneStream();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // =========================
  // HELPERS
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

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

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

  function getAppointmentStatus(status) {
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
    return <ConsultationLoading />;
  }

  // =========================
  // ERROR STATE
  // =========================

  if (!appointmentId || (error && !patient)) {
    return (
      <Shell
        role="doctor"
        title="New consultation"
        subtitle="Consultation unavailable"
      >
        <div className="max-w-4xl">
          <div className="bg-white border rounded-2xl px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 grid place-items-center text-red-600 font-bold">
              !
            </div>

            <h2 className="mt-4 text-xl font-bold">Consultation unavailable</h2>

            <p className="mt-2 text-sm text-slate-500">
              {error || "Appointment ID is missing."}
            </p>

            <Link
              href="/doctor"
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (!patient || !appointment) {
    return null;
  }

  // =========================
  // PAGE DATA
  // =========================

  const age = calculateAge(patient.date_of_birth);

  const appointmentStatus = getAppointmentStatus(appointment.status);

  const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

  const consultationStarted = Boolean(consultation);

  // =========================
  // PAGE
  // =========================

  return (
    <Shell
      role="doctor"
      title="New consultation"
      subtitle={`${patient.name} · ${patient.patient_code}`}
    >
      <div className="max-w-5xl">
        {/* =========================
            ALERTS
        ========================== */}

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
            PATIENT
        ========================== */}

        <section className="bg-white border rounded-2xl p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Patient
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {patient.name}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {age !== null ? `${age} years` : "Age not added"}

                {" · "}

                {patient.gender || "Gender not added"}

                {" · "}

                {patient.patient_code}
              </p>

              {patient.phone && (
                <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={appointmentStatus.tone}>
                {appointmentStatus.label}
              </Badge>

              <Link
                href={`/doctor/patients/${patient.id}`}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                View patient
              </Link>
            </div>
          </div>

          {/* APPOINTMENT */}

          <div className="mt-6 border-t pt-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-400">Appointment</p>

                <p className="mt-1 text-sm font-semibold">#{appointment.id}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Date</p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDate(appointment.appointment_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Time</p>

                <p className="mt-1 text-sm font-semibold">
                  {formatTime(appointment.appointment_time)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Token</p>

                <p className="mt-1 text-sm font-semibold">
                  {appointment.token_number || "—"}
                </p>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Appointment notes</p>

                <p className="mt-1 text-sm text-slate-700">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            HISTORY
        ========================== */}

        <section className="mt-6 bg-white border rounded-2xl">
          <div className="p-5 border-b flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Patient history</h3>

              <p className="mt-1 text-xs text-slate-500">
                Latest medical information before consultation
              </p>
            </div>

            <Link
              href={`/doctor/patients/${patient.id}`}
              className="text-sm font-medium text-blue-600"
            >
              Full history
            </Link>
          </div>

          {!latestHistory ? (
            <div className="p-6">
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No medical history has been added for this patient.
              </div>
            </div>
          ) : (
            <div className="p-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Previous diseases</p>

                <p className="mt-1 text-sm font-medium">
                  {latestHistory.previous_diseases || "None reported"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Allergies</p>

                <p className="mt-1 text-sm font-medium">
                  {latestHistory.allergies || "None reported"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Current medications</p>

                <p className="mt-1 text-sm font-medium">
                  {latestHistory.current_medications || "None reported"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Previous surgeries</p>

                <p className="mt-1 text-sm font-medium">
                  {latestHistory.previous_surgeries || "None reported"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Family history</p>

                <p className="mt-1 text-sm font-medium">
                  {latestHistory.family_history || "None reported"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Additional notes</p>

                <p className="mt-1 text-sm font-medium">
                  {latestHistory.additional_notes || "No notes"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =========================
            CONSULTATION
        ========================== */}

        <section className="mt-6 bg-white border rounded-2xl p-6">
          {!consultationStarted ? (
            <div className="rounded-2xl border-2 border-dashed p-8 md:p-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 grid place-items-center">
                <Icon name="mic" size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Ready to start consultation
              </h3>

              <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
                Start the consultation when the patient is with you. The
                appointment will move from waiting to in consultation.
              </p>

              <button
                type="button"
                disabled={starting}
                onClick={handleStartConsultation}
                className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {starting ? "Starting consultation..." : "Start consultation"}
              </button>
            </div>
          ) : (
            <>
              {/* CONSULTATION INFO */}

              <div className="rounded-xl bg-slate-50 p-5">
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">Consultation ID</p>

                    <p className="mt-1 font-semibold">#{consultation.id}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Status</p>

                    <p className="mt-1 font-semibold capitalize">
                      {consultation.status?.replaceAll("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Started</p>

                    <p className="mt-1 font-semibold">
                      {consultation.started_at
                        ? new Date(consultation.started_at).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* RECORDING */}

              <div className="mt-6 rounded-2xl border-2 border-dashed p-8 md:p-10 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 grid place-items-center">
                  <Icon name="mic" size={28} />
                </div>

                <div className="mt-5 flex justify-center">
                  <Badge
                    tone={
                      isRecording ? "red" : uploadedRecording ? "green" : "blue"
                    }
                  >
                    {isRecording
                      ? isPaused
                        ? "Recording paused"
                        : "Recording"
                      : uploadedRecording
                        ? "Audio saved"
                        : "Ready to record"}
                  </Badge>
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  Consultation recording
                </h3>

                <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
                  Record the doctor and patient conversation. The audio will be
                  saved against this consultation.
                </p>

                {(isRecording || recordingSeconds > 0) && (
                  <div className="mt-6 text-3xl font-bold tabular-nums">
                    {formatDuration(recordingSeconds)}
                  </div>
                )}

                {/* START */}

                {!isRecording && !audioBlob && !uploadedRecording && (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
                  >
                    Start recording
                  </button>
                )}

                {/* CONTROLS */}

                {isRecording && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {!isPaused ? (
                      <button
                        type="button"
                        onClick={handlePauseRecording}
                        className="rounded-xl border px-5 py-3 text-sm font-semibold"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResumeRecording}
                        className="rounded-xl border px-5 py-3 text-sm font-semibold"
                      >
                        Resume
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Stop recording
                    </button>
                  </div>
                )}

                {/* PREVIEW */}

                {audioBlob && !uploadedRecording && !isRecording && (
                  <div className="mt-7">
                    <p className="text-sm font-medium">Recording complete</p>

                    <audio
                      controls
                      src={audioUrl}
                      className="mx-auto mt-4 w-full max-w-lg"
                    />

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        disabled={uploadingAudio}
                        onClick={handleUploadAudio}
                        className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {uploadingAudio ? "Saving audio..." : "Save recording"}
                      </button>

                      <button
                        type="button"
                        disabled={uploadingAudio}
                        onClick={handleRecordAgain}
                        className="rounded-xl border px-5 py-3 text-sm font-semibold disabled:opacity-50"
                      >
                        Record again
                      </button>
                    </div>
                  </div>
                )}

                {/* UPLOADED */}

                {uploadedRecording && (
                  <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-emerald-900">
                          Recording saved
                        </p>

                        <p className="mt-1 text-xs text-emerald-700">
                          Audio recording #{uploadedRecording.id}
                        </p>
                      </div>

                      <Badge tone="green">Uploaded</Badge>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-emerald-700">Duration</p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatDuration(
                            Math.round(
                              Number(
                                uploadedRecording.duration_seconds ||
                                  recordingSeconds,
                              ),
                            ),
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-emerald-700">File type</p>

                        <p className="mt-1 text-sm font-semibold">
                          {uploadedRecording.mime_type || "Audio"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-emerald-700">Status</p>

                        <p className="mt-1 text-sm font-semibold capitalize">
                          {uploadedRecording.status}
                        </p>
                      </div>
                    </div>

                    {uploadedRecording.storage_key && (
                      <audio
                        controls
                        src={uploadedRecording.storage_key}
                        className="mt-5 w-full"
                      />
                    )}

                    {/* GENERATE TRANSCRIPT */}

                    {!transcript && (
                      <div className="mt-5 border-t border-emerald-200 pt-5">
                        <button
                          type="button"
                          disabled={transcribing}
                          onClick={handleGenerateTranscript}
                          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {transcribing
                            ? "Generating transcript..."
                            : "Generate transcript"}
                        </button>

                        {transcribing && (
                          <p className="mt-3 text-xs text-slate-500">
                            Audio is being processed. Please keep this page
                            open.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* =========================
                  TRANSCRIPT
              ========================== */}

              {transcript && (
                <section className="mt-6 rounded-2xl border overflow-hidden">
                  <div className="p-5 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">AI transcript</h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Generated from consultation recording
                      </p>
                    </div>

                    <Badge tone="green">Transcript ready</Badge>
                  </div>

                  <div className="p-5">
                    <div className="rounded-xl bg-slate-50 p-5">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                        {transcript.edited_text ||
                          transcript.full_text ||
                          "Transcript is empty."}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
                      <span>Transcript #{transcript.id}</span>

                      {transcript.word_count !== null &&
                        transcript.word_count !== undefined && (
                          <span>{transcript.word_count} words</span>
                        )}

                      <span className="capitalize">
                        Status: {transcript.status}
                      </span>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* =========================
              PROCESS STEPS
          ========================== */}

          <div className="mt-6 grid md:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">01</div>

              <div className="mt-2 font-semibold">Patient history</div>

              <div className="mt-1 text-xs text-emerald-600">Available</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">02</div>

              <div className="mt-2 font-semibold">Audio recording</div>

              <div
                className={`mt-1 text-xs ${
                  uploadedRecording ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {uploadedRecording
                  ? "Recording saved"
                  : consultationStarted
                    ? "Ready"
                    : "Start consultation first"}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-400">03</div>

              <div className="mt-2 font-semibold">AI transcript</div>

              <div
                className={`mt-1 text-xs ${
                  transcript
                    ? "text-emerald-600"
                    : transcribing
                      ? "text-blue-600"
                      : "text-slate-500"
                }`}
              >
                {transcript
                  ? "Transcript ready"
                  : transcribing
                    ? "Processing..."
                    : uploadedRecording
                      ? "Ready to generate"
                      : "Available after recording"}
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            BACK
        ========================== */}

        <div className="mt-6">
          <Link
            href="/doctor"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </Shell>
  );
}
