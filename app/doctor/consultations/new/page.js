// // // // // // "use client";

// // // // // // import { Suspense, useEffect, useRef, useState } from "react";

// // // // // // import { useRouter, useSearchParams } from "next/navigation";

// // // // // // import Link from "next/link";

// // // // // // import Shell from "@/components/Shell";
// // // // // // import Icon from "@/components/Icon";
// // // // // // import Badge from "@/components/Badge";

// // // // // // // ======================================================
// // // // // // // OUTER PAGE
// // // // // // // IMPORTANT:
// // // // // // // useSearchParams() is NOT used here.
// // // // // // // Inner component is wrapped inside Suspense.
// // // // // // // ======================================================

// // // // // // export default function NewConsultationPage() {
// // // // // //   return (
// // // // // //     <Suspense fallback={<ConsultationLoading />}>
// // // // // //       <NewConsultationContent />
// // // // // //     </Suspense>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // SUSPENSE FALLBACK
// // // // // // // ======================================================

// // // // // // function ConsultationLoading() {
// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle="Loading consultation"
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         <div className="bg-white border rounded-2xl px-6 py-20 text-center">
// // // // // //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

// // // // // //           <p className="mt-4 text-sm text-slate-500">Loading consultation...</p>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // INNER CLIENT COMPONENT
// // // // // // // useSearchParams() is safe here because parent wraps it
// // // // // // // in Suspense.
// // // // // // // ======================================================

// // // // // // function NewConsultationContent() {
// // // // // //   const router = useRouter();
// // // // // //   const searchParams = useSearchParams();

// // // // // //   const appointmentId = searchParams.get("appointment");

// // // // // //   // =========================
// // // // // //   // MAIN DATA
// // // // // //   // =========================

// // // // // //   const [appointment, setAppointment] = useState(null);

// // // // // //   const [patient, setPatient] = useState(null);

// // // // // //   const [medicalHistory, setMedicalHistory] = useState([]);

// // // // // //   const [consultation, setConsultation] = useState(null);

// // // // // //   // =========================
// // // // // //   // PAGE STATE
// // // // // //   // =========================

// // // // // //   const [loading, setLoading] = useState(true);

// // // // // //   const [starting, setStarting] = useState(false);

// // // // // //   const [error, setError] = useState("");

// // // // // //   const [success, setSuccess] = useState("");

// // // // // //   // =========================
// // // // // //   // RECORDING STATE
// // // // // //   // =========================

// // // // // //   const [isRecording, setIsRecording] = useState(false);

// // // // // //   const [isPaused, setIsPaused] = useState(false);

// // // // // //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// // // // // //   const [audioBlob, setAudioBlob] = useState(null);

// // // // // //   const [audioUrl, setAudioUrl] = useState("");

// // // // // //   const [uploadingAudio, setUploadingAudio] = useState(false);

// // // // // //   const [uploadedRecording, setUploadedRecording] = useState(null);

// // // // // //   // =========================
// // // // // //   // TRANSCRIPTION STATE
// // // // // //   // =========================

// // // // // //   const [transcribing, setTranscribing] = useState(false);

// // // // // //   const [transcript, setTranscript] = useState(null);

// // // // // //   // =========================
// // // // // //   // REFS
// // // // // //   // =========================

// // // // // //   const recorderRef = useRef(null);
// // // // // //   const streamRef = useRef(null);
// // // // // //   const timerRef = useRef(null);
// // // // // //   const chunksRef = useRef([]);

// // // // // //   // =========================
// // // // // //   // SAFE JSON RESPONSE
// // // // // //   // =========================

// // // // // //   async function getResponseData(response) {
// // // // // //     const contentType = response.headers.get("content-type") || "";

// // // // // //     if (contentType.includes("application/json")) {
// // // // // //       return await response.json();
// // // // // //     }

// // // // // //     const text = await response.text();

// // // // // //     throw new Error(
// // // // // //       text
// // // // // //         ? `Server returned an invalid response (${response.status}).`
// // // // // //         : "Server returned an invalid response.",
// // // // // //     );
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // LOAD CONSULTATION DATA
// // // // // //   // =========================

// // // // // //   async function loadConsultationData() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");

// // // // // //       setLoading(false);

// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setLoading(true);

// // // // // //       setError("");

// // // // // //       const response = await fetch(
// // // // // //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// // // // // //           appointmentId,
// // // // // //         )}`,
// // // // // //         {
// // // // // //           method: "GET",
// // // // // //           credentials: "include",
// // // // // //           cache: "no-store",
// // // // // //         },
// // // // // //       );

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to load consultation information.");

// // // // // //         return;
// // // // // //       }

// // // // // //       setAppointment(data.appointment || null);

// // // // // //       setPatient(data.patient || null);

// // // // // //       setMedicalHistory(data.medical_history || []);

// // // // // //       setConsultation(data.consultation || null);

// // // // // //       // If backend later returns existing audio
// // // // // //       if (data.audio_recording) {
// // // // // //         setUploadedRecording(data.audio_recording);
// // // // // //       }

// // // // // //       // If backend later returns existing transcript
// // // // // //       if (data.transcript) {
// // // // // //         setTranscript(data.transcript);
// // // // // //       }
// // // // // //     } catch (error) {
// // // // // //       console.error("LOAD CONSULTATION ERROR:", error);

// // // // // //       setError(error.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // INITIAL LOAD
// // // // // //   // =========================

// // // // // //   useEffect(() => {
// // // // // //     loadConsultationData();
// // // // // //   }, [appointmentId]);

// // // // // //   // =========================
// // // // // //   // START CONSULTATION
// // // // // //   // =========================

// // // // // //   async function handleStartConsultation() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");

// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setStarting(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       const response = await fetch("/api/doctors/consultations/start", {
// // // // // //         method: "POST",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",

// // // // // //         body: JSON.stringify({
// // // // // //           appointment_id: Number(appointmentId),
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to start consultation.");

// // // // // //         return;
// // // // // //       }

// // // // // //       setConsultation(data.consultation || null);

// // // // // //       setAppointment((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "in_consultation",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(data.message || "Consultation started successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("START CONSULTATION ERROR:", error);

// // // // // //       setError(error.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setStarting(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // TIMER
// // // // // //   // =========================

// // // // // //   function startTimer() {
// // // // // //     stopTimer();

// // // // // //     timerRef.current = setInterval(() => {
// // // // // //       setRecordingSeconds((previous) => previous + 1);
// // // // // //     }, 1000);
// // // // // //   }

// // // // // //   function stopTimer() {
// // // // // //     if (timerRef.current) {
// // // // // //       clearInterval(timerRef.current);

// // // // // //       timerRef.current = null;
// // // // // //     }
// // // // // //   }

// // // // // //   function formatDuration(totalSeconds) {
// // // // // //     const safeSeconds = Number(totalSeconds) || 0;

// // // // // //     const minutes = Math.floor(safeSeconds / 60);

// // // // // //     const seconds = Math.floor(safeSeconds % 60);

// // // // // //     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
// // // // // //       2,
// // // // // //       "0",
// // // // // //     )}`;
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // STOP MICROPHONE STREAM
// // // // // //   // =========================

// // // // // //   function stopMicrophoneStream() {
// // // // // //     if (streamRef.current) {
// // // // // //       streamRef.current.getTracks().forEach((track) => {
// // // // // //         track.stop();
// // // // // //       });

// // // // // //       streamRef.current = null;
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // START RECORDING
// // // // // //   // =========================

// // // // // //   async function handleStartRecording() {
// // // // // //     try {
// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       if (!consultation?.id) {
// // // // // //         setError("Start the consultation before recording.");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (
// // // // // //         typeof window === "undefined" ||
// // // // // //         !navigator.mediaDevices ||
// // // // // //         !navigator.mediaDevices.getUserMedia ||
// // // // // //         typeof MediaRecorder === "undefined"
// // // // // //       ) {
// // // // // //         setError("Microphone recording is not supported in this browser.");

// // // // // //         return;
// // // // // //       }

// // // // // //       const stream = await navigator.mediaDevices.getUserMedia({
// // // // // //         audio: true,
// // // // // //       });

// // // // // //       streamRef.current = stream;

// // // // // //       let mimeType = "";

// // // // // //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// // // // // //         mimeType = "audio/webm;codecs=opus";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// // // // // //         mimeType = "audio/webm";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
// // // // // //         mimeType = "audio/ogg";
// // // // // //       }

// // // // // //       const recorder = mimeType
// // // // // //         ? new MediaRecorder(stream, {
// // // // // //             mimeType,
// // // // // //           })
// // // // // //         : new MediaRecorder(stream);

// // // // // //       recorderRef.current = recorder;

// // // // // //       chunksRef.current = [];

// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }

// // // // // //       setAudioBlob(null);
// // // // // //       setAudioUrl("");

// // // // // //       setUploadedRecording(null);

// // // // // //       setTranscript(null);

// // // // // //       setRecordingSeconds(0);
// // // // // //       setIsPaused(false);

// // // // // //       recorder.ondataavailable = (event) => {
// // // // // //         if (event.data && event.data.size > 0) {
// // // // // //           chunksRef.current.push(event.data);
// // // // // //         }
// // // // // //       };

// // // // // //       recorder.onstop = () => {
// // // // // //         const finalMimeType = recorder.mimeType || "audio/webm";

// // // // // //         const blob = new Blob(chunksRef.current, {
// // // // // //           type: finalMimeType,
// // // // // //         });

// // // // // //         const previewUrl = URL.createObjectURL(blob);

// // // // // //         setAudioBlob(blob);

// // // // // //         setAudioUrl(previewUrl);

// // // // // //         setIsRecording(false);

// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();

// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.onerror = (event) => {
// // // // // //         console.error("MEDIA RECORDER ERROR:", event.error);

// // // // // //         setError("An error occurred while recording.");

// // // // // //         setIsRecording(false);

// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();

// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.start(1000);

// // // // // //       setIsRecording(true);

// // // // // //       setIsPaused(false);

// // // // // //       startTimer();
// // // // // //     } catch (error) {
// // // // // //       console.error("START RECORDING ERROR:", error);

// // // // // //       stopMicrophoneStream();

// // // // // //       if (error.name === "NotAllowedError") {
// // // // // //         setError(
// // // // // //           "Microphone permission was denied. Please allow microphone access.",
// // // // // //         );
// // // // // //       } else if (error.name === "NotFoundError") {
// // // // // //         setError("No microphone was found on this device.");
// // // // // //       } else {
// // // // // //         setError("Unable to start microphone recording.");
// // // // // //       }
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // PAUSE RECORDING
// // // // // //   // =========================

// // // // // //   function handlePauseRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "recording") {
// // // // // //       recorder.pause();

// // // // // //       setIsPaused(true);

// // // // // //       stopTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // RESUME RECORDING
// // // // // //   // =========================

// // // // // //   function handleResumeRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "paused") {
// // // // // //       recorder.resume();

// // // // // //       setIsPaused(false);

// // // // // //       startTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // STOP RECORDING
// // // // // //   // =========================

// // // // // //   function handleStopRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (
// // // // // //       recorder &&
// // // // // //       (recorder.state === "recording" || recorder.state === "paused")
// // // // // //     ) {
// // // // // //       recorder.stop();
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // RECORD AGAIN
// // // // // //   // =========================

// // // // // //   function handleRecordAgain() {
// // // // // //     if (audioUrl) {
// // // // // //       URL.revokeObjectURL(audioUrl);
// // // // // //     }

// // // // // //     setAudioBlob(null);

// // // // // //     setAudioUrl("");

// // // // // //     setRecordingSeconds(0);

// // // // // //     setUploadedRecording(null);

// // // // // //     setTranscript(null);

// // // // // //     setError("");

// // // // // //     setSuccess("");
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // UPLOAD AUDIO
// // // // // //   // =========================

// // // // // //   async function handleUploadAudio() {
// // // // // //     if (!audioBlob) {
// // // // // //       setError("Record audio before saving.");

// // // // // //       return;
// // // // // //     }

// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");

// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setUploadingAudio(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       let extension = "webm";

// // // // // //       if (audioBlob.type.includes("ogg")) {
// // // // // //         extension = "ogg";
// // // // // //       } else if (audioBlob.type.includes("mp4")) {
// // // // // //         extension = "mp4";
// // // // // //       } else if (audioBlob.type.includes("mpeg")) {
// // // // // //         extension = "mp3";
// // // // // //       } else if (audioBlob.type.includes("wav")) {
// // // // // //         extension = "wav";
// // // // // //       }

// // // // // //       const file = new File(
// // // // // //         [audioBlob],
// // // // // //         `consultation-${consultation.id}.${extension}`,
// // // // // //         {
// // // // // //           type: audioBlob.type || "audio/webm",
// // // // // //         },
// // // // // //       );

// // // // // //       const formData = new FormData();

// // // // // //       formData.append("consultation_id", String(consultation.id));

// // // // // //       formData.append("duration_seconds", String(recordingSeconds));

// // // // // //       formData.append("audio", file);

// // // // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // // // //         method: "POST",
// // // // // //         credentials: "include",
// // // // // //         body: formData,
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to save audio recording.");

// // // // // //         return;
// // // // // //       }

// // // // // //       setUploadedRecording(data.audio_recording || null);

// // // // // //       setConsultation((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "recorded",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(data.message || "Audio recording saved successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("UPLOAD AUDIO ERROR:", error);

// // // // // //       setError(error.message || "Unable to upload audio recording.");
// // // // // //     } finally {
// // // // // //       setUploadingAudio(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // GENERATE TRANSCRIPT
// // // // // //   // =========================

// // // // // //   async function handleGenerateTranscript() {
// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");

// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.id) {
// // // // // //       setError("Please save the audio recording first.");

// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setTranscribing(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       const response = await fetch("/api/doctors/consultations/transcribe", {
// // // // // //         method: "POST",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",

// // // // // //         body: JSON.stringify({
// // // // // //           consultation_id: consultation.id,

// // // // // //           audio_recording_id: uploadedRecording.id,
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");

// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to generate transcript.");

// // // // // //         return;
// // // // // //       }

// // // // // //       setTranscript(data.transcript || null);

// // // // // //       setConsultation((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "transcribed",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(data.message || "Transcript generated successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("GENERATE TRANSCRIPT ERROR:", error);

// // // // // //       setError(error.message || "Unable to generate transcript.");
// // // // // //     } finally {
// // // // // //       setTranscribing(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // CLEANUP
// // // // // //   // =========================

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       stopTimer();

// // // // // //       if (recorderRef.current && recorderRef.current.state !== "inactive") {
// // // // // //         try {
// // // // // //           recorderRef.current.stop();
// // // // // //         } catch {}
// // // // // //       }

// // // // // //       stopMicrophoneStream();
// // // // // //     };
// // // // // //   }, []);

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }
// // // // // //     };
// // // // // //   }, [audioUrl]);

// // // // // //   // =========================
// // // // // //   // HELPERS
// // // // // //   // =========================

// // // // // //   function calculateAge(dateOfBirth) {
// // // // // //     if (!dateOfBirth) {
// // // // // //       return null;
// // // // // //     }

// // // // // //     const birthDate = new Date(dateOfBirth);

// // // // // //     const today = new Date();

// // // // // //     let age = today.getFullYear() - birthDate.getFullYear();

// // // // // //     const monthDifference = today.getMonth() - birthDate.getMonth();

// // // // // //     if (
// // // // // //       monthDifference < 0 ||
// // // // // //       (monthDifference === 0 && today.getDate() < birthDate.getDate())
// // // // // //     ) {
// // // // // //       age--;
// // // // // //     }

// // // // // //     return age;
// // // // // //   }

// // // // // //   function formatDate(date) {
// // // // // //     if (!date) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     return new Intl.DateTimeFormat("en-GB", {
// // // // // //       day: "2-digit",
// // // // // //       month: "short",
// // // // // //       year: "numeric",
// // // // // //     }).format(new Date(date));
// // // // // //   }

// // // // // //   function formatTime(time) {
// // // // // //     if (!time) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     const [hours, minutes] = time.split(":");

// // // // // //     const date = new Date();

// // // // // //     date.setHours(Number(hours));

// // // // // //     date.setMinutes(Number(minutes));

// // // // // //     date.setSeconds(0);

// // // // // //     return date.toLocaleTimeString("en-US", {
// // // // // //       hour: "numeric",
// // // // // //       minute: "2-digit",
// // // // // //       hour12: true,
// // // // // //     });
// // // // // //   }

// // // // // //   function getAppointmentStatus(status) {
// // // // // //     const statuses = {
// // // // // //       scheduled: {
// // // // // //         label: "Scheduled",
// // // // // //         tone: "gray",
// // // // // //       },

// // // // // //       checked_in: {
// // // // // //         label: "Checked in",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       waiting: {
// // // // // //         label: "Waiting",
// // // // // //         tone: "amber",
// // // // // //       },

// // // // // //       in_consultation: {
// // // // // //         label: "In consultation",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       completed: {
// // // // // //         label: "Completed",
// // // // // //         tone: "green",
// // // // // //       },

// // // // // //       cancelled: {
// // // // // //         label: "Cancelled",
// // // // // //         tone: "red",
// // // // // //       },

// // // // // //       no_show: {
// // // // // //         label: "No show",
// // // // // //         tone: "red",
// // // // // //       },
// // // // // //     };

// // // // // //     return (
// // // // // //       statuses[status] || {
// // // // // //         label: status || "Unknown",

// // // // // //         tone: "gray",
// // // // // //       }
// // // // // //     );
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // LOADING
// // // // // //   // =========================

// // // // // //   if (loading) {
// // // // // //     return <ConsultationLoading />;
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // ERROR STATE
// // // // // //   // =========================

// // // // // //   if (!appointmentId || (error && !patient)) {
// // // // // //     return (
// // // // // //       <Shell
// // // // // //         role="doctor"
// // // // // //         title="New consultation"
// // // // // //         subtitle="Consultation unavailable"
// // // // // //       >
// // // // // //         <div className="max-w-4xl">
// // // // // //           <div className="bg-white border rounded-2xl px-6 py-16 text-center">
// // // // // //             <div className="mx-auto w-12 h-12 rounded-full bg-red-50 grid place-items-center text-red-600 font-bold">
// // // // // //               !
// // // // // //             </div>

// // // // // //             <h2 className="mt-4 text-xl font-bold">Consultation unavailable</h2>

// // // // // //             <p className="mt-2 text-sm text-slate-500">
// // // // // //               {error || "Appointment ID is missing."}
// // // // // //             </p>

// // // // // //             <Link
// // // // // //               href="/doctor"
// // // // // //               className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
// // // // // //             >
// // // // // //               Back to dashboard
// // // // // //             </Link>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </Shell>
// // // // // //     );
// // // // // //   }

// // // // // //   if (!patient || !appointment) {
// // // // // //     return null;
// // // // // //   }

// // // // // //   // =========================
// // // // // //   // PAGE DATA
// // // // // //   // =========================

// // // // // //   const age = calculateAge(patient.date_of_birth);

// // // // // //   const appointmentStatus = getAppointmentStatus(appointment.status);

// // // // // //   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

// // // // // //   const consultationStarted = Boolean(consultation);

// // // // // //   // =========================
// // // // // //   // PAGE
// // // // // //   // =========================

// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle={`${patient.name} · ${patient.patient_code}`}
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         {/* =========================
// // // // // //             ALERTS
// // // // // //         ========================== */}

// // // // // //         {error && (
// // // // // //           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// // // // // //             {error}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {success && (
// // // // // //           <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
// // // // // //             {success}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {/* =========================
// // // // // //             PATIENT
// // // // // //         ========================== */}

// // // // // //         <section className="bg-white border rounded-2xl p-6">
// // // // // //           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
// // // // // //             <div>
// // // // // //               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// // // // // //                 Patient
// // // // // //               </p>

// // // // // //               <h2 className="mt-2 text-2xl font-bold text-slate-950">
// // // // // //                 {patient.name}
// // // // // //               </h2>

// // // // // //               <p className="mt-2 text-sm text-slate-500">
// // // // // //                 {age !== null ? `${age} years` : "Age not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.gender || "Gender not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.patient_code}
// // // // // //               </p>

// // // // // //               {patient.phone && (
// // // // // //                 <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
// // // // // //               )}
// // // // // //             </div>

// // // // // //             <div className="flex flex-wrap items-center gap-3">
// // // // // //               <Badge tone={appointmentStatus.tone}>
// // // // // //                 {appointmentStatus.label}
// // // // // //               </Badge>

// // // // // //               <Link
// // // // // //                 href={`/doctor/patients/${patient.id}`}
// // // // // //                 className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
// // // // // //               >
// // // // // //                 View patient
// // // // // //               </Link>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           {/* APPOINTMENT */}

// // // // // //           <div className="mt-6 border-t pt-5">
// // // // // //             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Appointment</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">#{appointment.id}</p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Date</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatDate(appointment.appointment_date)}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Time</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatTime(appointment.appointment_time)}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Token</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {appointment.token_number || "—"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             {appointment.notes && (
// // // // // //               <div className="mt-5 rounded-xl bg-slate-50 p-4">
// // // // // //                 <p className="text-xs text-slate-400">Appointment notes</p>

// // // // // //                 <p className="mt-1 text-sm text-slate-700">
// // // // // //                   {appointment.notes}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* =========================
// // // // // //             HISTORY
// // // // // //         ========================== */}

// // // // // //         <section className="mt-6 bg-white border rounded-2xl">
// // // // // //           <div className="p-5 border-b flex items-center justify-between gap-4">
// // // // // //             <div>
// // // // // //               <h3 className="font-semibold">Patient history</h3>

// // // // // //               <p className="mt-1 text-xs text-slate-500">
// // // // // //                 Latest medical information before consultation
// // // // // //               </p>
// // // // // //             </div>

// // // // // //             <Link
// // // // // //               href={`/doctor/patients/${patient.id}`}
// // // // // //               className="text-sm font-medium text-blue-600"
// // // // // //             >
// // // // // //               Full history
// // // // // //             </Link>
// // // // // //           </div>

// // // // // //           {!latestHistory ? (
// // // // // //             <div className="p-6">
// // // // // //               <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
// // // // // //                 No medical history has been added for this patient.
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <div className="p-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Previous diseases</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_diseases || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Allergies</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.allergies || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Current medications</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.current_medications || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Previous surgeries</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_surgeries || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Family history</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.family_history || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Additional notes</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.additional_notes || "No notes"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </section>

// // // // // //         {/* =========================
// // // // // //             CONSULTATION
// // // // // //         ========================== */}

// // // // // //         <section className="mt-6 bg-white border rounded-2xl p-6">
// // // // // //           {!consultationStarted ? (
// // // // // //             <div className="rounded-2xl border-2 border-dashed p-8 md:p-10 text-center">
// // // // // //               <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 grid place-items-center">
// // // // // //                 <Icon name="mic" size={28} />
// // // // // //               </div>

// // // // // //               <h3 className="mt-5 text-xl font-bold">
// // // // // //                 Ready to start consultation
// // // // // //               </h3>

// // // // // //               <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
// // // // // //                 Start the consultation when the patient is with you. The
// // // // // //                 appointment will move from waiting to in consultation.
// // // // // //               </p>

// // // // // //               <button
// // // // // //                 type="button"
// // // // // //                 disabled={starting}
// // // // // //                 onClick={handleStartConsultation}
// // // // // //                 className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //               >
// // // // // //                 {starting ? "Starting consultation..." : "Start consultation"}
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <>
// // // // // //               {/* CONSULTATION INFO */}

// // // // // //               <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                 <div className="grid gap-5 sm:grid-cols-3">
// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Consultation ID</p>

// // // // // //                     <p className="mt-1 font-semibold">#{consultation.id}</p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Status</p>

// // // // // //                     <p className="mt-1 font-semibold capitalize">
// // // // // //                       {consultation.status?.replaceAll("_", " ")}
// // // // // //                     </p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Started</p>

// // // // // //                     <p className="mt-1 font-semibold">
// // // // // //                       {consultation.started_at
// // // // // //                         ? new Date(consultation.started_at).toLocaleString()
// // // // // //                         : "—"}
// // // // // //                     </p>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               {/* RECORDING */}

// // // // // //               <div className="mt-6 rounded-2xl border-2 border-dashed p-8 md:p-10 text-center">
// // // // // //                 <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 grid place-items-center">
// // // // // //                   <Icon name="mic" size={28} />
// // // // // //                 </div>

// // // // // //                 <div className="mt-5 flex justify-center">
// // // // // //                   <Badge
// // // // // //                     tone={
// // // // // //                       isRecording ? "red" : uploadedRecording ? "green" : "blue"
// // // // // //                     }
// // // // // //                   >
// // // // // //                     {isRecording
// // // // // //                       ? isPaused
// // // // // //                         ? "Recording paused"
// // // // // //                         : "Recording"
// // // // // //                       : uploadedRecording
// // // // // //                         ? "Audio saved"
// // // // // //                         : "Ready to record"}
// // // // // //                   </Badge>
// // // // // //                 </div>

// // // // // //                 <h3 className="mt-4 text-xl font-bold">
// // // // // //                   Consultation recording
// // // // // //                 </h3>

// // // // // //                 <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
// // // // // //                   Record the doctor and patient conversation. The audio will be
// // // // // //                   saved against this consultation.
// // // // // //                 </p>

// // // // // //                 {(isRecording || recordingSeconds > 0) && (
// // // // // //                   <div className="mt-6 text-3xl font-bold tabular-nums">
// // // // // //                     {formatDuration(recordingSeconds)}
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* START */}

// // // // // //                 {!isRecording && !audioBlob && !uploadedRecording && (
// // // // // //                   <button
// // // // // //                     type="button"
// // // // // //                     onClick={handleStartRecording}
// // // // // //                     className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
// // // // // //                   >
// // // // // //                     Start recording
// // // // // //                   </button>
// // // // // //                 )}

// // // // // //                 {/* CONTROLS */}

// // // // // //                 {isRecording && (
// // // // // //                   <div className="mt-6 flex flex-wrap justify-center gap-3">
// // // // // //                     {!isPaused ? (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handlePauseRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Pause
// // // // // //                       </button>
// // // // // //                     ) : (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handleResumeRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Resume
// // // // // //                       </button>
// // // // // //                     )}

// // // // // //                     <button
// // // // // //                       type="button"
// // // // // //                       onClick={handleStopRecording}
// // // // // //                       className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
// // // // // //                     >
// // // // // //                       Stop recording
// // // // // //                     </button>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* PREVIEW */}

// // // // // //                 {audioBlob && !uploadedRecording && !isRecording && (
// // // // // //                   <div className="mt-7">
// // // // // //                     <p className="text-sm font-medium">Recording complete</p>

// // // // // //                     <audio
// // // // // //                       controls
// // // // // //                       src={audioUrl}
// // // // // //                       className="mx-auto mt-4 w-full max-w-lg"
// // // // // //                     />

// // // // // //                     <div className="mt-5 flex flex-wrap justify-center gap-3">
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         disabled={uploadingAudio}
// // // // // //                         onClick={handleUploadAudio}
// // // // // //                         className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
// // // // // //                       >
// // // // // //                         {uploadingAudio ? "Saving audio..." : "Save recording"}
// // // // // //                       </button>

// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         disabled={uploadingAudio}
// // // // // //                         onClick={handleRecordAgain}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold disabled:opacity-50"
// // // // // //                       >
// // // // // //                         Record again
// // // // // //                       </button>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* UPLOADED */}

// // // // // //                 {uploadedRecording && (
// // // // // //                   <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
// // // // // //                     <div className="flex flex-wrap items-center justify-between gap-3">
// // // // // //                       <div>
// // // // // //                         <p className="font-semibold text-emerald-900">
// // // // // //                           Recording saved
// // // // // //                         </p>

// // // // // //                         <p className="mt-1 text-xs text-emerald-700">
// // // // // //                           Audio recording #{uploadedRecording.id}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <Badge tone="green">Uploaded</Badge>
// // // // // //                     </div>

// // // // // //                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">Duration</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {formatDuration(
// // // // // //                             Math.round(
// // // // // //                               Number(
// // // // // //                                 uploadedRecording.duration_seconds ||
// // // // // //                                   recordingSeconds,
// // // // // //                               ),
// // // // // //                             ),
// // // // // //                           )}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">File type</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {uploadedRecording.mime_type || "Audio"}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">Status</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold capitalize">
// // // // // //                           {uploadedRecording.status}
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     </div>

// // // // // //                     {uploadedRecording.storage_key && (
// // // // // //                       <audio
// // // // // //                         controls
// // // // // //                         src={uploadedRecording.storage_key}
// // // // // //                         className="mt-5 w-full"
// // // // // //                       />
// // // // // //                     )}

// // // // // //                     {/* GENERATE TRANSCRIPT */}

// // // // // //                     {!transcript && (
// // // // // //                       <div className="mt-5 border-t border-emerald-200 pt-5">
// // // // // //                         <button
// // // // // //                           type="button"
// // // // // //                           disabled={transcribing}
// // // // // //                           onClick={handleGenerateTranscript}
// // // // // //                           className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //                         >
// // // // // //                           {transcribing
// // // // // //                             ? "Generating transcript..."
// // // // // //                             : "Generate transcript"}
// // // // // //                         </button>

// // // // // //                         {transcribing && (
// // // // // //                           <p className="mt-3 text-xs text-slate-500">
// // // // // //                             Audio is being processed. Please keep this page
// // // // // //                             open.
// // // // // //                           </p>
// // // // // //                         )}
// // // // // //                       </div>
// // // // // //                     )}
// // // // // //                   </div>
// // // // // //                 )}
// // // // // //               </div>

// // // // // //               {/* =========================
// // // // // //                   TRANSCRIPT
// // // // // //               ========================== */}

// // // // // //               {transcript && (
// // // // // //                 <section className="mt-6 rounded-2xl border overflow-hidden">
// // // // // //                   <div className="p-5 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// // // // // //                     <div>
// // // // // //                       <h3 className="font-semibold">AI transcript</h3>

// // // // // //                       <p className="mt-1 text-xs text-slate-500">
// // // // // //                         Generated from consultation recording
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <Badge tone="green">Transcript ready</Badge>
// // // // // //                   </div>

// // // // // //                   <div className="p-5">
// // // // // //                     <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                       <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // // // // //                         {transcript.edited_text ||
// // // // // //                           transcript.full_text ||
// // // // // //                           "Transcript is empty."}
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
// // // // // //                       <span>Transcript #{transcript.id}</span>

// // // // // //                       {transcript.word_count !== null &&
// // // // // //                         transcript.word_count !== undefined && (
// // // // // //                           <span>{transcript.word_count} words</span>
// // // // // //                         )}

// // // // // //                       <span className="capitalize">
// // // // // //                         Status: {transcript.status}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </section>
// // // // // //               )}
// // // // // //             </>
// // // // // //           )}

// // // // // //           {/* =========================
// // // // // //               PROCESS STEPS
// // // // // //           ========================== */}

// // // // // //           <div className="mt-6 grid md:grid-cols-3 gap-3">
// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">01</div>

// // // // // //               <div className="mt-2 font-semibold">Patient history</div>

// // // // // //               <div className="mt-1 text-xs text-emerald-600">Available</div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">02</div>

// // // // // //               <div className="mt-2 font-semibold">Audio recording</div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   uploadedRecording ? "text-emerald-600" : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {uploadedRecording
// // // // // //                   ? "Recording saved"
// // // // // //                   : consultationStarted
// // // // // //                     ? "Ready"
// // // // // //                     : "Start consultation first"}
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">03</div>

// // // // // //               <div className="mt-2 font-semibold">AI transcript</div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   transcript
// // // // // //                     ? "text-emerald-600"
// // // // // //                     : transcribing
// // // // // //                       ? "text-blue-600"
// // // // // //                       : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {transcript
// // // // // //                   ? "Transcript ready"
// // // // // //                   : transcribing
// // // // // //                     ? "Processing..."
// // // // // //                     : uploadedRecording
// // // // // //                       ? "Ready to generate"
// // // // // //                       : "Available after recording"}
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* =========================
// // // // // //             BACK
// // // // // //         ========================== */}

// // // // // //         <div className="mt-6">
// // // // // //           <Link
// // // // // //             href="/doctor"
// // // // // //             className="text-sm font-medium text-slate-600 hover:text-slate-950"
// // // // // //           >
// // // // // //             ← Back to dashboard
// // // // // //           </Link>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // // "use client";

// // // // // // import { Suspense, useEffect, useRef, useState } from "react";
// // // // // // import { useRouter, useSearchParams } from "next/navigation";
// // // // // // import Link from "next/link";

// // // // // // import Shell from "@/components/Shell";
// // // // // // import Icon from "@/components/Icon";
// // // // // // import Badge from "@/components/Badge";

// // // // // // // ======================================================
// // // // // // // OUTER PAGE
// // // // // // // ======================================================

// // // // // // export default function NewConsultationPage() {
// // // // // //   return (
// // // // // //     <Suspense fallback={<ConsultationLoading />}>
// // // // // //       <NewConsultationContent />
// // // // // //     </Suspense>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // LOADING
// // // // // // // ======================================================

// // // // // // function ConsultationLoading() {
// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle="Loading consultation"
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         <div className="rounded-2xl border bg-white px-6 py-20 text-center">
// // // // // //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

// // // // // //           <p className="mt-4 text-sm text-slate-500">
// // // // // //             Loading consultation...
// // // // // //           </p>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // MAIN COMPONENT
// // // // // // // ======================================================

// // // // // // function NewConsultationContent() {
// // // // // //   const router = useRouter();
// // // // // //   const searchParams = useSearchParams();

// // // // // //   const appointmentId = searchParams.get("appointment");

// // // // // //   // ======================================================
// // // // // //   // MAIN DATA
// // // // // //   // ======================================================

// // // // // //   const [appointment, setAppointment] = useState(null);
// // // // // //   const [patient, setPatient] = useState(null);
// // // // // //   const [medicalHistory, setMedicalHistory] = useState([]);
// // // // // //   const [consultation, setConsultation] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // PAGE STATE
// // // // // //   // ======================================================

// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [starting, setStarting] = useState(false);

// // // // // //   const [error, setError] = useState("");
// // // // // //   const [success, setSuccess] = useState("");

// // // // // //   // ======================================================
// // // // // //   // RECORDING
// // // // // //   // ======================================================

// // // // // //   const [isRecording, setIsRecording] = useState(false);
// // // // // //   const [isPaused, setIsPaused] = useState(false);

// // // // // //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// // // // // //   const [audioBlob, setAudioBlob] = useState(null);
// // // // // //   const [audioUrl, setAudioUrl] = useState("");

// // // // // //   const [uploadingAudio, setUploadingAudio] = useState(false);
// // // // // //   const [uploadedRecording, setUploadedRecording] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // TRANSCRIPTION
// // // // // //   // ======================================================

// // // // // //   const [transcribing, setTranscribing] = useState(false);
// // // // // //   const [transcript, setTranscript] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // REFS
// // // // // //   // ======================================================

// // // // // //   const recorderRef = useRef(null);
// // // // // //   const streamRef = useRef(null);
// // // // // //   const timerRef = useRef(null);
// // // // // //   const chunksRef = useRef([]);

// // // // // //   // ======================================================
// // // // // //   // SAFE RESPONSE
// // // // // //   // ======================================================

// // // // // //   async function getResponseData(response) {
// // // // // //     const contentType = response.headers.get("content-type") || "";

// // // // // //     if (contentType.includes("application/json")) {
// // // // // //       return await response.json();
// // // // // //     }

// // // // // //     const text = await response.text();

// // // // // //     throw new Error(
// // // // // //       text
// // // // // //         ? `Server returned an invalid response (${response.status}).`
// // // // // //         : "Server returned an invalid response.",
// // // // // //     );
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // LOAD CONSULTATION
// // // // // //   // ======================================================

// // // // // //   async function loadConsultationData() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");
// // // // // //       setLoading(false);
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setLoading(true);
// // // // // //       setError("");

// // // // // //       const response = await fetch(
// // // // // //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// // // // // //           appointmentId,
// // // // // //         )}`,
// // // // // //         {
// // // // // //           method: "GET",
// // // // // //           credentials: "include",
// // // // // //           cache: "no-store",
// // // // // //         },
// // // // // //       );

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to load consultation information.");
// // // // // //         return;
// // // // // //       }

// // // // // //       setAppointment(data.appointment || null);
// // // // // //       setPatient(data.patient || null);
// // // // // //       setMedicalHistory(data.medical_history || []);
// // // // // //       setConsultation(data.consultation || null);

// // // // // //       if (data.audio_recording) {
// // // // // //         setUploadedRecording(data.audio_recording);
// // // // // //       }

// // // // // //       if (data.transcript) {
// // // // // //         setTranscript(data.transcript);
// // // // // //       }
// // // // // //     } catch (error) {
// // // // // //       console.error("LOAD CONSULTATION ERROR:", error);

// // // // // //       setError(error.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   }

// // // // // //   useEffect(() => {
// // // // // //     loadConsultationData();
// // // // // //   }, [appointmentId]);

// // // // // //   // ======================================================
// // // // // //   // START CONSULTATION
// // // // // //   // ======================================================

// // // // // //   async function handleStartConsultation() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setStarting(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       const response = await fetch("/api/doctors/consultations/start", {
// // // // // //         method: "POST",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",

// // // // // //         body: JSON.stringify({
// // // // // //           appointment_id: Number(appointmentId),
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to start consultation.");
// // // // // //         return;
// // // // // //       }

// // // // // //       setConsultation(data.consultation || null);

// // // // // //       setAppointment((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "in_consultation",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(data.message || "Consultation started successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("START CONSULTATION ERROR:", error);

// // // // // //       setError(error.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setStarting(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // TIMER
// // // // // //   // ======================================================

// // // // // //   function startTimer() {
// // // // // //     stopTimer();

// // // // // //     timerRef.current = setInterval(() => {
// // // // // //       setRecordingSeconds((previous) => previous + 1);
// // // // // //     }, 1000);
// // // // // //   }

// // // // // //   function stopTimer() {
// // // // // //     if (timerRef.current) {
// // // // // //       clearInterval(timerRef.current);
// // // // // //       timerRef.current = null;
// // // // // //     }
// // // // // //   }

// // // // // //   function formatDuration(totalSeconds) {
// // // // // //     const safeSeconds = Number(totalSeconds) || 0;

// // // // // //     const minutes = Math.floor(safeSeconds / 60);
// // // // // //     const seconds = Math.floor(safeSeconds % 60);

// // // // // //     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
// // // // // //       2,
// // // // // //       "0",
// // // // // //     )}`;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // MICROPHONE
// // // // // //   // ======================================================

// // // // // //   function stopMicrophoneStream() {
// // // // // //     if (streamRef.current) {
// // // // // //       streamRef.current.getTracks().forEach((track) => {
// // // // // //         track.stop();
// // // // // //       });

// // // // // //       streamRef.current = null;
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // START RECORDING
// // // // // //   // ======================================================

// // // // // //   async function handleStartRecording() {
// // // // // //     try {
// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       if (!consultation?.id) {
// // // // // //         setError("Start the consultation before recording.");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (
// // // // // //         typeof window === "undefined" ||
// // // // // //         !navigator.mediaDevices ||
// // // // // //         !navigator.mediaDevices.getUserMedia ||
// // // // // //         typeof MediaRecorder === "undefined"
// // // // // //       ) {
// // // // // //         setError("Microphone recording is not supported in this browser.");
// // // // // //         return;
// // // // // //       }

// // // // // //       const stream = await navigator.mediaDevices.getUserMedia({
// // // // // //         audio: true,
// // // // // //       });

// // // // // //       streamRef.current = stream;

// // // // // //       let mimeType = "";

// // // // // //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// // // // // //         mimeType = "audio/webm;codecs=opus";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// // // // // //         mimeType = "audio/webm";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
// // // // // //         mimeType = "audio/ogg";
// // // // // //       }

// // // // // //       const recorder = mimeType
// // // // // //         ? new MediaRecorder(stream, { mimeType })
// // // // // //         : new MediaRecorder(stream);

// // // // // //       recorderRef.current = recorder;
// // // // // //       chunksRef.current = [];

// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }

// // // // // //       setAudioBlob(null);
// // // // // //       setAudioUrl("");

// // // // // //       setUploadedRecording(null);
// // // // // //       setTranscript(null);

// // // // // //       setRecordingSeconds(0);
// // // // // //       setIsPaused(false);

// // // // // //       recorder.ondataavailable = (event) => {
// // // // // //         if (event.data && event.data.size > 0) {
// // // // // //           chunksRef.current.push(event.data);
// // // // // //         }
// // // // // //       };

// // // // // //       recorder.onstop = () => {
// // // // // //         const finalMimeType = recorder.mimeType || "audio/webm";

// // // // // //         const blob = new Blob(chunksRef.current, {
// // // // // //           type: finalMimeType,
// // // // // //         });

// // // // // //         const previewUrl = URL.createObjectURL(blob);

// // // // // //         setAudioBlob(blob);
// // // // // //         setAudioUrl(previewUrl);

// // // // // //         setIsRecording(false);
// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();
// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.onerror = (event) => {
// // // // // //         console.error("MEDIA RECORDER ERROR:", event.error);

// // // // // //         setError("An error occurred while recording.");

// // // // // //         setIsRecording(false);
// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();
// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.start(1000);

// // // // // //       setIsRecording(true);
// // // // // //       setIsPaused(false);

// // // // // //       startTimer();
// // // // // //     } catch (error) {
// // // // // //       console.error("START RECORDING ERROR:", error);

// // // // // //       stopMicrophoneStream();

// // // // // //       if (error.name === "NotAllowedError") {
// // // // // //         setError(
// // // // // //           "Microphone permission was denied. Please allow microphone access.",
// // // // // //         );
// // // // // //       } else if (error.name === "NotFoundError") {
// // // // // //         setError("No microphone was found on this device.");
// // // // // //       } else {
// // // // // //         setError("Unable to start microphone recording.");
// // // // // //       }
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // PAUSE
// // // // // //   // ======================================================

// // // // // //   function handlePauseRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "recording") {
// // // // // //       recorder.pause();

// // // // // //       setIsPaused(true);

// // // // // //       stopTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // RESUME
// // // // // //   // ======================================================

// // // // // //   function handleResumeRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "paused") {
// // // // // //       recorder.resume();

// // // // // //       setIsPaused(false);

// // // // // //       startTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // STOP
// // // // // //   // ======================================================

// // // // // //   function handleStopRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (
// // // // // //       recorder &&
// // // // // //       (recorder.state === "recording" || recorder.state === "paused")
// // // // // //     ) {
// // // // // //       recorder.stop();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // RECORD AGAIN
// // // // // //   // ======================================================

// // // // // //   function handleRecordAgain() {
// // // // // //     if (audioUrl) {
// // // // // //       URL.revokeObjectURL(audioUrl);
// // // // // //     }

// // // // // //     setAudioBlob(null);
// // // // // //     setAudioUrl("");

// // // // // //     setRecordingSeconds(0);

// // // // // //     setUploadedRecording(null);
// // // // // //     setTranscript(null);

// // // // // //     setError("");
// // // // // //     setSuccess("");
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // UPLOAD AUDIO TO S3
// // // // // //   // ======================================================

// // // // // //   async function handleUploadAudio() {
// // // // // //     if (!audioBlob) {
// // // // // //       setError("Record audio before saving.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setUploadingAudio(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       let extension = "webm";

// // // // // //       if (audioBlob.type.includes("ogg")) {
// // // // // //         extension = "ogg";
// // // // // //       } else if (audioBlob.type.includes("mp4")) {
// // // // // //         extension = "mp4";
// // // // // //       } else if (audioBlob.type.includes("mpeg")) {
// // // // // //         extension = "mp3";
// // // // // //       } else if (audioBlob.type.includes("wav")) {
// // // // // //         extension = "wav";
// // // // // //       }

// // // // // //       const file = new File(
// // // // // //         [audioBlob],
// // // // // //         `consultation-${consultation.id}.${extension}`,
// // // // // //         {
// // // // // //           type: audioBlob.type || "audio/webm",
// // // // // //         },
// // // // // //       );

// // // // // //       const formData = new FormData();

// // // // // //       formData.append("consultation_id", String(consultation.id));
// // // // // //       formData.append("duration_seconds", String(recordingSeconds));
// // // // // //       formData.append("audio", file);

// // // // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // // // //         method: "POST",
// // // // // //         credentials: "include",
// // // // // //         body: formData,
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to save audio recording.");
// // // // // //         return;
// // // // // //       }

// // // // // //       setUploadedRecording(data.audio_recording || null);

// // // // // //       setConsultation((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "recorded",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(data.message || "Audio recording saved successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("UPLOAD AUDIO ERROR:", error);

// // // // // //       setError(error.message || "Unable to upload audio recording.");
// // // // // //     } finally {
// // // // // //       setUploadingAudio(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // GENERATE TRANSCRIPT WITH PUTER
// // // // // //   // ======================================================

// // // // // //   async function handleGenerateTranscript() {
// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.id) {
// // // // // //       setError("Please save the audio recording first.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.audio_url) {
// // // // // //       setError(
// // // // // //         "Audio URL is missing. Please reload the consultation or save the recording again.",
// // // // // //       );
// // // // // //       return;
// // // // // //     }

// // // // // //     if (
// // // // // //       typeof window === "undefined" ||
// // // // // //       !window.puter ||
// // // // // //       !window.puter.ai ||
// // // // // //       typeof window.puter.ai.speech2txt !== "function"
// // // // // //     ) {
// // // // // //       setError(
// // // // // //         "Speech-to-text service is not available yet. Please try again.",
// // // // // //       );
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setTranscribing(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       // ==================================================
// // // // // //       // PUTER TRANSCRIPTION
// // // // // //       // ==================================================

// // // // // //       const puterResult = await window.puter.ai.speech2txt(
// // // // // //         uploadedRecording.audio_url,
// // // // // //         {
// // // // // //           model: "gpt-4o-transcribe",
// // // // // //           response_format: "json",
// // // // // //         },
// // // // // //       );

// // // // // //       console.log("PUTER TRANSCRIPTION RESULT:", puterResult);

// // // // // //       // ==================================================
// // // // // //       // EXTRACT TEXT
// // // // // //       // ==================================================

// // // // // //       let transcriptText = "";

// // // // // //       if (typeof puterResult === "string") {
// // // // // //         transcriptText = puterResult.trim();
// // // // // //       } else if (
// // // // // //         puterResult &&
// // // // // //         typeof puterResult.text === "string"
// // // // // //       ) {
// // // // // //         transcriptText = puterResult.text.trim();
// // // // // //       }

// // // // // //       if (!transcriptText) {
// // // // // //         throw new Error(
// // // // // //           "Speech-to-text service returned an empty transcript.",
// // // // // //         );
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // SAVE TO OUR BACKEND
// // // // // //       // ==================================================

// // // // // //       const response = await fetch(
// // // // // //         "/api/doctors/consultations/transcribe",
// // // // // //         {
// // // // // //           method: "POST",

// // // // // //           headers: {
// // // // // //             "Content-Type": "application/json",
// // // // // //           },

// // // // // //           credentials: "include",

// // // // // //           body: JSON.stringify({
// // // // // //             consultation_id: consultation.id,

// // // // // //             audio_recording_id: uploadedRecording.id,

// // // // // //             transcript_text: transcriptText,

// // // // // //             provider: "puter",

// // // // // //             model: "gpt-4o-transcribe",
// // // // // //           }),
// // // // // //         },
// // // // // //       );

// // // // // //       const data = await getResponseData(response);

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message ||
// // // // // //             "Transcript was generated but could not be saved.",
// // // // // //         );
// // // // // //         return;
// // // // // //       }

// // // // // //       setTranscript(data.transcript || null);

// // // // // //       setConsultation((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "transcribed",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(
// // // // // //         data.message || "Transcript generated successfully.",
// // // // // //       );
// // // // // //     } catch (error) {
// // // // // //       console.error("GENERATE TRANSCRIPT ERROR:", error);

// // // // // //       setError(
// // // // // //         error?.message || "Unable to generate transcript.",
// // // // // //       );
// // // // // //     } finally {
// // // // // //       setTranscribing(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // CLEANUP
// // // // // //   // ======================================================

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       stopTimer();

// // // // // //       if (
// // // // // //         recorderRef.current &&
// // // // // //         recorderRef.current.state !== "inactive"
// // // // // //       ) {
// // // // // //         try {
// // // // // //           recorderRef.current.stop();
// // // // // //         } catch {}
// // // // // //       }

// // // // // //       stopMicrophoneStream();
// // // // // //     };
// // // // // //   }, []);

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }
// // // // // //     };
// // // // // //   }, [audioUrl]);

// // // // // //   // ======================================================
// // // // // //   // HELPERS
// // // // // //   // ======================================================

// // // // // //   function calculateAge(dateOfBirth) {
// // // // // //     if (!dateOfBirth) {
// // // // // //       return null;
// // // // // //     }

// // // // // //     const birthDate = new Date(dateOfBirth);
// // // // // //     const today = new Date();

// // // // // //     let age = today.getFullYear() - birthDate.getFullYear();

// // // // // //     const monthDifference =
// // // // // //       today.getMonth() - birthDate.getMonth();

// // // // // //     if (
// // // // // //       monthDifference < 0 ||
// // // // // //       (monthDifference === 0 &&
// // // // // //         today.getDate() < birthDate.getDate())
// // // // // //     ) {
// // // // // //       age--;
// // // // // //     }

// // // // // //     return age;
// // // // // //   }

// // // // // //   function formatDate(date) {
// // // // // //     if (!date) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     return new Intl.DateTimeFormat("en-GB", {
// // // // // //       day: "2-digit",
// // // // // //       month: "short",
// // // // // //       year: "numeric",
// // // // // //     }).format(new Date(date));
// // // // // //   }

// // // // // //   function formatTime(time) {
// // // // // //     if (!time) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     const [hours, minutes] = time.split(":");

// // // // // //     const date = new Date();

// // // // // //     date.setHours(Number(hours));
// // // // // //     date.setMinutes(Number(minutes));
// // // // // //     date.setSeconds(0);

// // // // // //     return date.toLocaleTimeString("en-US", {
// // // // // //       hour: "numeric",
// // // // // //       minute: "2-digit",
// // // // // //       hour12: true,
// // // // // //     });
// // // // // //   }

// // // // // //   function getAppointmentStatus(status) {
// // // // // //     const statuses = {
// // // // // //       scheduled: {
// // // // // //         label: "Scheduled",
// // // // // //         tone: "gray",
// // // // // //       },

// // // // // //       checked_in: {
// // // // // //         label: "Checked in",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       waiting: {
// // // // // //         label: "Waiting",
// // // // // //         tone: "amber",
// // // // // //       },

// // // // // //       in_consultation: {
// // // // // //         label: "In consultation",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       completed: {
// // // // // //         label: "Completed",
// // // // // //         tone: "green",
// // // // // //       },

// // // // // //       cancelled: {
// // // // // //         label: "Cancelled",
// // // // // //         tone: "red",
// // // // // //       },

// // // // // //       no_show: {
// // // // // //         label: "No show",
// // // // // //         tone: "red",
// // // // // //       },
// // // // // //     };

// // // // // //     return (
// // // // // //       statuses[status] || {
// // // // // //         label: status || "Unknown",
// // // // // //         tone: "gray",
// // // // // //       }
// // // // // //     );
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // LOADING
// // // // // //   // ======================================================

// // // // // //   if (loading) {
// // // // // //     return <ConsultationLoading />;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // ERROR PAGE
// // // // // //   // ======================================================

// // // // // //   if (!appointmentId || (error && !patient)) {
// // // // // //     return (
// // // // // //       <Shell
// // // // // //         role="doctor"
// // // // // //         title="New consultation"
// // // // // //         subtitle="Consultation unavailable"
// // // // // //       >
// // // // // //         <div className="max-w-4xl">
// // // // // //           <div className="rounded-2xl border bg-white px-6 py-16 text-center">
// // // // // //             <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 font-bold text-red-600">
// // // // // //               !
// // // // // //             </div>

// // // // // //             <h2 className="mt-4 text-xl font-bold">
// // // // // //               Consultation unavailable
// // // // // //             </h2>

// // // // // //             <p className="mt-2 text-sm text-slate-500">
// // // // // //               {error || "Appointment ID is missing."}
// // // // // //             </p>

// // // // // //             <Link
// // // // // //               href="/doctor"
// // // // // //               className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
// // // // // //             >
// // // // // //               Back to dashboard
// // // // // //             </Link>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </Shell>
// // // // // //     );
// // // // // //   }

// // // // // //   if (!patient || !appointment) {
// // // // // //     return null;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // PAGE DATA
// // // // // //   // ======================================================

// // // // // //   const age = calculateAge(patient.date_of_birth);

// // // // // //   const appointmentStatus =
// // // // // //     getAppointmentStatus(appointment.status);

// // // // // //   const latestHistory =
// // // // // //     medicalHistory.length > 0
// // // // // //       ? medicalHistory[0]
// // // // // //       : null;

// // // // // //   const consultationStarted =
// // // // // //     Boolean(consultation);

// // // // // //   // ======================================================
// // // // // //   // PAGE
// // // // // //   // ======================================================

// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle={`${patient.name} · ${patient.patient_code}`}
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         {/* ALERTS */}

// // // // // //         {error && (
// // // // // //           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// // // // // //             {error}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {success && (
// // // // // //           <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
// // // // // //             {success}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {/* PATIENT */}

// // // // // //         <section className="rounded-2xl border bg-white p-6">
// // // // // //           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
// // // // // //             <div>
// // // // // //               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// // // // // //                 Patient
// // // // // //               </p>

// // // // // //               <h2 className="mt-2 text-2xl font-bold text-slate-950">
// // // // // //                 {patient.name}
// // // // // //               </h2>

// // // // // //               <p className="mt-2 text-sm text-slate-500">
// // // // // //                 {age !== null
// // // // // //                   ? `${age} years`
// // // // // //                   : "Age not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.gender || "Gender not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.patient_code}
// // // // // //               </p>

// // // // // //               {patient.phone && (
// // // // // //                 <p className="mt-1 text-sm text-slate-500">
// // // // // //                   {patient.phone}
// // // // // //                 </p>
// // // // // //               )}
// // // // // //             </div>

// // // // // //             <div className="flex flex-wrap items-center gap-3">
// // // // // //               <Badge tone={appointmentStatus.tone}>
// // // // // //                 {appointmentStatus.label}
// // // // // //               </Badge>

// // // // // //               <Link
// // // // // //                 href={`/doctor/patients/${patient.id}`}
// // // // // //                 className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
// // // // // //               >
// // // // // //                 View patient
// // // // // //               </Link>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           <div className="mt-6 border-t pt-5">
// // // // // //             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Appointment
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   #{appointment.id}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Date
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatDate(
// // // // // //                     appointment.appointment_date,
// // // // // //                   )}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Time
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatTime(
// // // // // //                     appointment.appointment_time,
// // // // // //                   )}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Token
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {appointment.token_number || "—"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             {appointment.notes && (
// // // // // //               <div className="mt-5 rounded-xl bg-slate-50 p-4">
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Appointment notes
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm text-slate-700">
// // // // // //                   {appointment.notes}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* HISTORY */}

// // // // // //         <section className="mt-6 rounded-2xl border bg-white">
// // // // // //           <div className="flex items-center justify-between gap-4 border-b p-5">
// // // // // //             <div>
// // // // // //               <h3 className="font-semibold">
// // // // // //                 Patient history
// // // // // //               </h3>

// // // // // //               <p className="mt-1 text-xs text-slate-500">
// // // // // //                 Latest medical information before consultation
// // // // // //               </p>
// // // // // //             </div>

// // // // // //             <Link
// // // // // //               href={`/doctor/patients/${patient.id}`}
// // // // // //               className="text-sm font-medium text-blue-600"
// // // // // //             >
// // // // // //               Full history
// // // // // //             </Link>
// // // // // //           </div>

// // // // // //           {!latestHistory ? (
// // // // // //             <div className="p-6">
// // // // // //               <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
// // // // // //                 No medical history has been added for this patient.
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Previous diseases
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_diseases ||
// // // // // //                     "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Allergies
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.allergies ||
// // // // // //                     "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Current medications
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.current_medications ||
// // // // // //                     "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Previous surgeries
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_surgeries ||
// // // // // //                     "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Family history
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.family_history ||
// // // // // //                     "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">
// // // // // //                   Additional notes
// // // // // //                 </p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.additional_notes ||
// // // // // //                     "No notes"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </section>

// // // // // //         {/* CONSULTATION */}

// // // // // //         <section className="mt-6 rounded-2xl border bg-white p-6">
// // // // // //           {!consultationStarted ? (
// // // // // //             <div className="rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // // //               <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // // //                 <Icon name="mic" size={28} />
// // // // // //               </div>

// // // // // //               <h3 className="mt-5 text-xl font-bold">
// // // // // //                 Ready to start consultation
// // // // // //               </h3>

// // // // // //               <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // // //                 Start the consultation when the patient is with you.
// // // // // //                 The appointment will move from waiting to in consultation.
// // // // // //               </p>

// // // // // //               <button
// // // // // //                 type="button"
// // // // // //                 disabled={starting}
// // // // // //                 onClick={handleStartConsultation}
// // // // // //                 className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //               >
// // // // // //                 {starting
// // // // // //                   ? "Starting consultation..."
// // // // // //                   : "Start consultation"}
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <>
// // // // // //               {/* CONSULTATION INFO */}

// // // // // //               <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                 <div className="grid gap-5 sm:grid-cols-3">
// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">
// // // // // //                       Consultation ID
// // // // // //                     </p>

// // // // // //                     <p className="mt-1 font-semibold">
// // // // // //                       #{consultation.id}
// // // // // //                     </p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">
// // // // // //                       Status
// // // // // //                     </p>

// // // // // //                     <p className="mt-1 font-semibold capitalize">
// // // // // //                       {consultation.status?.replaceAll(
// // // // // //                         "_",
// // // // // //                         " ",
// // // // // //                       )}
// // // // // //                     </p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">
// // // // // //                       Started
// // // // // //                     </p>

// // // // // //                     <p className="mt-1 font-semibold">
// // // // // //                       {consultation.started_at
// // // // // //                         ? new Date(
// // // // // //                             consultation.started_at,
// // // // // //                           ).toLocaleString()
// // // // // //                         : "—"}
// // // // // //                     </p>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               {/* RECORDING */}

// // // // // //               <div className="mt-6 rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // // //                 <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // // //                   <Icon name="mic" size={28} />
// // // // // //                 </div>

// // // // // //                 <div className="mt-5 flex justify-center">
// // // // // //                   <Badge
// // // // // //                     tone={
// // // // // //                       isRecording
// // // // // //                         ? "red"
// // // // // //                         : uploadedRecording
// // // // // //                           ? "green"
// // // // // //                           : "blue"
// // // // // //                     }
// // // // // //                   >
// // // // // //                     {isRecording
// // // // // //                       ? isPaused
// // // // // //                         ? "Recording paused"
// // // // // //                         : "Recording"
// // // // // //                       : uploadedRecording
// // // // // //                         ? "Audio saved"
// // // // // //                         : "Ready to record"}
// // // // // //                   </Badge>
// // // // // //                 </div>

// // // // // //                 <h3 className="mt-4 text-xl font-bold">
// // // // // //                   Consultation recording
// // // // // //                 </h3>

// // // // // //                 <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // // //                   Record the doctor and patient conversation.
// // // // // //                   The audio will be saved securely against this consultation.
// // // // // //                 </p>

// // // // // //                 {(isRecording ||
// // // // // //                   recordingSeconds > 0) && (
// // // // // //                   <div className="mt-6 text-3xl font-bold tabular-nums">
// // // // // //                     {formatDuration(recordingSeconds)}
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* START */}

// // // // // //                 {!isRecording &&
// // // // // //                   !audioBlob &&
// // // // // //                   !uploadedRecording && (
// // // // // //                     <button
// // // // // //                       type="button"
// // // // // //                       onClick={handleStartRecording}
// // // // // //                       className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
// // // // // //                     >
// // // // // //                       Start recording
// // // // // //                     </button>
// // // // // //                   )}

// // // // // //                 {/* RECORD CONTROLS */}

// // // // // //                 {isRecording && (
// // // // // //                   <div className="mt-6 flex flex-wrap justify-center gap-3">
// // // // // //                     {!isPaused ? (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handlePauseRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Pause
// // // // // //                       </button>
// // // // // //                     ) : (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handleResumeRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Resume
// // // // // //                       </button>
// // // // // //                     )}

// // // // // //                     <button
// // // // // //                       type="button"
// // // // // //                       onClick={handleStopRecording}
// // // // // //                       className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
// // // // // //                     >
// // // // // //                       Stop recording
// // // // // //                     </button>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* LOCAL PREVIEW */}

// // // // // //                 {audioBlob &&
// // // // // //                   !uploadedRecording &&
// // // // // //                   !isRecording && (
// // // // // //                     <div className="mt-7">
// // // // // //                       <p className="text-sm font-medium">
// // // // // //                         Recording complete
// // // // // //                       </p>

// // // // // //                       <audio
// // // // // //                         controls
// // // // // //                         src={audioUrl}
// // // // // //                         className="mx-auto mt-4 w-full max-w-lg"
// // // // // //                       />

// // // // // //                       <div className="mt-5 flex flex-wrap justify-center gap-3">
// // // // // //                         <button
// // // // // //                           type="button"
// // // // // //                           disabled={uploadingAudio}
// // // // // //                           onClick={handleUploadAudio}
// // // // // //                           className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
// // // // // //                         >
// // // // // //                           {uploadingAudio
// // // // // //                             ? "Saving audio..."
// // // // // //                             : "Save recording"}
// // // // // //                         </button>

// // // // // //                         <button
// // // // // //                           type="button"
// // // // // //                           disabled={uploadingAudio}
// // // // // //                           onClick={handleRecordAgain}
// // // // // //                           className="rounded-xl border px-5 py-3 text-sm font-semibold disabled:opacity-50"
// // // // // //                         >
// // // // // //                           Record again
// // // // // //                         </button>
// // // // // //                       </div>
// // // // // //                     </div>
// // // // // //                   )}

// // // // // //                 {/* S3 UPLOADED */}

// // // // // //                 {uploadedRecording && (
// // // // // //                   <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
// // // // // //                     <div className="flex flex-wrap items-center justify-between gap-3">
// // // // // //                       <div>
// // // // // //                         <p className="font-semibold text-emerald-900">
// // // // // //                           Recording saved
// // // // // //                         </p>

// // // // // //                         <p className="mt-1 text-xs text-emerald-700">
// // // // // //                           Audio recording #{uploadedRecording.id}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <Badge tone="green">
// // // // // //                         Uploaded
// // // // // //                       </Badge>
// // // // // //                     </div>

// // // // // //                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">
// // // // // //                           Duration
// // // // // //                         </p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {formatDuration(
// // // // // //                             Math.round(
// // // // // //                               Number(
// // // // // //                                 uploadedRecording.duration_seconds ||
// // // // // //                                   recordingSeconds,
// // // // // //                               ),
// // // // // //                             ),
// // // // // //                           )}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">
// // // // // //                           File type
// // // // // //                         </p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {uploadedRecording.mime_type ||
// // // // // //                             "Audio"}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">
// // // // // //                           Status
// // // // // //                         </p>

// // // // // //                         <p className="mt-1 text-sm font-semibold capitalize">
// // // // // //                           {uploadedRecording.status}
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     </div>

// // // // // //                     {/* IMPORTANT:
// // // // // //                         signed S3 URL, not storage_key */}

// // // // // //                     {uploadedRecording.audio_url && (
// // // // // //                       <audio
// // // // // //                         controls
// // // // // //                         src={
// // // // // //                           uploadedRecording.audio_url
// // // // // //                         }
// // // // // //                         className="mt-5 w-full"
// // // // // //                       />
// // // // // //                     )}

// // // // // //                     {/* TRANSCRIBE */}

// // // // // //                     {!transcript && (
// // // // // //                       <div className="mt-5 border-t border-emerald-200 pt-5">
// // // // // //                         <button
// // // // // //                           type="button"
// // // // // //                           disabled={transcribing}
// // // // // //                           onClick={
// // // // // //                             handleGenerateTranscript
// // // // // //                           }
// // // // // //                           className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //                         >
// // // // // //                           {transcribing
// // // // // //                             ? "Generating transcript..."
// // // // // //                             : "Generate transcript"}
// // // // // //                         </button>

// // // // // //                         {transcribing && (
// // // // // //                           <p className="mt-3 text-xs text-slate-500">
// // // // // //                             Audio is being transcribed.
// // // // // //                             Please keep this page open.
// // // // // //                           </p>
// // // // // //                         )}
// // // // // //                       </div>
// // // // // //                     )}
// // // // // //                   </div>
// // // // // //                 )}
// // // // // //               </div>

// // // // // //               {/* TRANSCRIPT */}

// // // // // //               {transcript && (
// // // // // //                 <section className="mt-6 overflow-hidden rounded-2xl border">
// // // // // //                   <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
// // // // // //                     <div>
// // // // // //                       <h3 className="font-semibold">
// // // // // //                         AI transcript
// // // // // //                       </h3>

// // // // // //                       <p className="mt-1 text-xs text-slate-500">
// // // // // //                         Generated from consultation recording
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <Badge tone="green">
// // // // // //                       Transcript ready
// // // // // //                     </Badge>
// // // // // //                   </div>

// // // // // //                   <div className="p-5">
// // // // // //                     <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                       <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // // // // //                         {transcript.edited_text ||
// // // // // //                           transcript.full_text ||
// // // // // //                           "Transcript is empty."}
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
// // // // // //                       <span>
// // // // // //                         Transcript #{transcript.id}
// // // // // //                       </span>

// // // // // //                       {transcript.word_count !==
// // // // // //                         null &&
// // // // // //                         transcript.word_count !==
// // // // // //                           undefined && (
// // // // // //                           <span>
// // // // // //                             {transcript.word_count} words
// // // // // //                           </span>
// // // // // //                         )}

// // // // // //                       <span className="capitalize">
// // // // // //                         Status: {transcript.status}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </section>
// // // // // //               )}
// // // // // //             </>
// // // // // //           )}

// // // // // //           {/* PROCESS STEPS */}

// // // // // //           <div className="mt-6 grid gap-3 md:grid-cols-3">
// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">
// // // // // //                 01
// // // // // //               </div>

// // // // // //               <div className="mt-2 font-semibold">
// // // // // //                 Patient history
// // // // // //               </div>

// // // // // //               <div className="mt-1 text-xs text-emerald-600">
// // // // // //                 Available
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">
// // // // // //                 02
// // // // // //               </div>

// // // // // //               <div className="mt-2 font-semibold">
// // // // // //                 Audio recording
// // // // // //               </div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   uploadedRecording
// // // // // //                     ? "text-emerald-600"
// // // // // //                     : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {uploadedRecording
// // // // // //                   ? "Recording saved"
// // // // // //                   : consultationStarted
// // // // // //                     ? "Ready"
// // // // // //                     : "Start consultation first"}
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">
// // // // // //                 03
// // // // // //               </div>

// // // // // //               <div className="mt-2 font-semibold">
// // // // // //                 AI transcript
// // // // // //               </div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   transcript
// // // // // //                     ? "text-emerald-600"
// // // // // //                     : transcribing
// // // // // //                       ? "text-blue-600"
// // // // // //                       : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {transcript
// // // // // //                   ? "Transcript ready"
// // // // // //                   : transcribing
// // // // // //                     ? "Processing..."
// // // // // //                     : uploadedRecording
// // // // // //                       ? "Ready to generate"
// // // // // //                       : "Available after recording"}
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* BACK */}

// // // // // //         <div className="mt-6">
// // // // // //           <Link
// // // // // //             href="/doctor"
// // // // // //             className="text-sm font-medium text-slate-600 hover:text-slate-950"
// // // // // //           >
// // // // // //             ← Back to dashboard
// // // // // //           </Link>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // // "use client";

// // // // // // import { Suspense, useEffect, useRef, useState } from "react";
// // // // // // import { useRouter, useSearchParams } from "next/navigation";
// // // // // // import Link from "next/link";

// // // // // // import Shell from "@/components/Shell";
// // // // // // import Icon from "@/components/Icon";
// // // // // // import Badge from "@/components/Badge";

// // // // // // // ======================================================
// // // // // // // OUTER PAGE
// // // // // // // ======================================================

// // // // // // export default function NewConsultationPage() {
// // // // // //   return (
// // // // // //     <Suspense fallback={<ConsultationLoading />}>
// // // // // //       <NewConsultationContent />
// // // // // //     </Suspense>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // LOADING
// // // // // // // ======================================================

// // // // // // function ConsultationLoading() {
// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle="Loading consultation"
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         <div className="rounded-2xl border bg-white px-6 py-20 text-center">
// // // // // //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

// // // // // //           <p className="mt-4 text-sm text-slate-500">Loading consultation...</p>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // MAIN
// // // // // // // ======================================================

// // // // // // function NewConsultationContent() {
// // // // // //   const router = useRouter();
// // // // // //   const searchParams = useSearchParams();

// // // // // //   const appointmentId = searchParams.get("appointment");

// // // // // //   // ======================================================
// // // // // //   // DATA
// // // // // //   // ======================================================

// // // // // //   const [appointment, setAppointment] = useState(null);
// // // // // //   const [patient, setPatient] = useState(null);
// // // // // //   const [medicalHistory, setMedicalHistory] = useState([]);
// // // // // //   const [consultation, setConsultation] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // PAGE STATE
// // // // // //   // ======================================================

// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [starting, setStarting] = useState(false);

// // // // // //   const [error, setError] = useState("");
// // // // // //   const [success, setSuccess] = useState("");

// // // // // //   // ======================================================
// // // // // //   // RECORDING STATE
// // // // // //   // ======================================================

// // // // // //   const [isRecording, setIsRecording] = useState(false);
// // // // // //   const [isPaused, setIsPaused] = useState(false);

// // // // // //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// // // // // //   const [audioBlob, setAudioBlob] = useState(null);
// // // // // //   const [audioUrl, setAudioUrl] = useState("");

// // // // // //   const [uploadingAudio, setUploadingAudio] = useState(false);
// // // // // //   const [uploadedRecording, setUploadedRecording] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // TRANSCRIPTION
// // // // // //   // ======================================================

// // // // // //   const [transcribing, setTranscribing] = useState(false);
// // // // // //   const [transcript, setTranscript] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // REFS
// // // // // //   // ======================================================

// // // // // //   const recorderRef = useRef(null);
// // // // // //   const streamRef = useRef(null);
// // // // // //   const timerRef = useRef(null);
// // // // // //   const chunksRef = useRef([]);

// // // // // //   // ======================================================
// // // // // //   // SAFE API RESPONSE
// // // // // //   // ======================================================

// // // // // //   async function getResponseData(response) {
// // // // // //     const contentType = response.headers.get("content-type") || "";

// // // // // //     if (contentType.includes("application/json")) {
// // // // // //       return await response.json();
// // // // // //     }

// // // // // //     const text = await response.text();

// // // // // //     throw new Error(
// // // // // //       text
// // // // // //         ? `Server returned an invalid response (${response.status}).`
// // // // // //         : "Server returned an invalid response.",
// // // // // //     );
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // LOAD CONSULTATION
// // // // // //   // ======================================================

// // // // // //   async function loadConsultationData() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");
// // // // // //       setLoading(false);
// // // // // //       return;
// // // // // //     }

// // // // // //     const numericAppointmentId = Number(appointmentId);

// // // // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // // // //       setError("Invalid appointment ID.");
// // // // // //       setLoading(false);
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setLoading(true);
// // // // // //       setError("");

// // // // // //       const response = await fetch(
// // // // // //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// // // // // //           numericAppointmentId,
// // // // // //         )}`,
// // // // // //         {
// // // // // //           method: "GET",
// // // // // //           credentials: "include",
// // // // // //           cache: "no-store",
// // // // // //         },
// // // // // //       );

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("LOAD CONSULTATION RESPONSE:", {
// // // // // //         status: response.status,
// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to load consultation information.");
// // // // // //         return;
// // // // // //       }

// // // // // //       setAppointment(data.appointment || null);
// // // // // //       setPatient(data.patient || null);
// // // // // //       setMedicalHistory(
// // // // // //         Array.isArray(data.medical_history) ? data.medical_history : [],
// // // // // //       );

// // // // // //       setConsultation(data.consultation || null);

// // // // // //       if (data.audio_recording) {
// // // // // //         setUploadedRecording(data.audio_recording);
// // // // // //       } else {
// // // // // //         setUploadedRecording(null);
// // // // // //       }

// // // // // //       if (data.transcript) {
// // // // // //         setTranscript(data.transcript);
// // // // // //       } else {
// // // // // //         setTranscript(null);
// // // // // //       }
// // // // // //     } catch (error) {
// // // // // //       console.error("LOAD CONSULTATION ERROR:", error);

// // // // // //       setError(error?.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   }

// // // // // //   useEffect(() => {
// // // // // //     loadConsultationData();
// // // // // //   }, [appointmentId]);

// // // // // //   // ======================================================
// // // // // //   // START CONSULTATION
// // // // // //   // ======================================================

// // // // // //   async function handleStartConsultation() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     const numericAppointmentId = Number(appointmentId);

// // // // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // // // //       setError("Invalid appointment ID.");
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setStarting(true);
// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       console.log("START CONSULTATION REQUEST:", {
// // // // // //         appointment_id: numericAppointmentId,
// // // // // //       });

// // // // // //       const response = await fetch("/api/doctors/consultations/start", {
// // // // // //         method: "POST",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",
// // // // // //         cache: "no-store",

// // // // // //         body: JSON.stringify({
// // // // // //           appointment_id: numericAppointmentId,
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("START CONSULTATION RESPONSE:", {
// // // // // //         status: response.status,
// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message || `Unable to start consultation (${response.status}).`,
// // // // // //         );
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!data.consultation?.id) {
// // // // // //         setError(
// // // // // //           "Consultation started but server did not return consultation information.",
// // // // // //         );
// // // // // //         return;
// // // // // //       }

// // // // // //       setConsultation(data.consultation);

// // // // // //       if (data.appointment) {
// // // // // //         setAppointment(data.appointment);
// // // // // //       } else {
// // // // // //         setAppointment((previous) =>
// // // // // //           previous
// // // // // //             ? {
// // // // // //                 ...previous,
// // // // // //                 status:
// // // // // //                   previous.status === "completed"
// // // // // //                     ? previous.status
// // // // // //                     : "in_consultation",
// // // // // //               }
// // // // // //             : previous,
// // // // // //         );
// // // // // //       }

// // // // // //       if (data.audio_recording) {
// // // // // //         setUploadedRecording(data.audio_recording);
// // // // // //       }

// // // // // //       if (data.transcript) {
// // // // // //         setTranscript(data.transcript);
// // // // // //       }

// // // // // //       setSuccess(data.message || "Consultation started successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("START CONSULTATION ERROR:", error);

// // // // // //       setError(error?.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setStarting(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // TIMER
// // // // // //   // ======================================================

// // // // // //   function stopTimer() {
// // // // // //     if (timerRef.current) {
// // // // // //       clearInterval(timerRef.current);
// // // // // //       timerRef.current = null;
// // // // // //     }
// // // // // //   }

// // // // // //   function startTimer() {
// // // // // //     stopTimer();

// // // // // //     timerRef.current = setInterval(() => {
// // // // // //       setRecordingSeconds((previous) => previous + 1);
// // // // // //     }, 1000);
// // // // // //   }

// // // // // //   function formatDuration(totalSeconds) {
// // // // // //     const safeSeconds = Number(totalSeconds) || 0;

// // // // // //     const minutes = Math.floor(safeSeconds / 60);

// // // // // //     const seconds = Math.floor(safeSeconds % 60);

// // // // // //     return `${String(minutes).padStart(
// // // // // //       2,
// // // // // //       "0",
// // // // // //     )}:${String(seconds).padStart(2, "0")}`;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // MICROPHONE
// // // // // //   // ======================================================

// // // // // //   function stopMicrophoneStream() {
// // // // // //     if (!streamRef.current) {
// // // // // //       return;
// // // // // //     }

// // // // // //     streamRef.current.getTracks().forEach((track) => {
// // // // // //       track.stop();
// // // // // //     });

// // // // // //     streamRef.current = null;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // START RECORDING
// // // // // //   // ======================================================

// // // // // //   async function handleStartRecording() {
// // // // // //     try {
// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       if (!consultation?.id) {
// // // // // //         setError("Start the consultation before recording.");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (
// // // // // //         typeof window === "undefined" ||
// // // // // //         !navigator.mediaDevices ||
// // // // // //         !navigator.mediaDevices.getUserMedia ||
// // // // // //         typeof MediaRecorder === "undefined"
// // // // // //       ) {
// // // // // //         setError("Microphone recording is not supported in this browser.");
// // // // // //         return;
// // // // // //       }

// // // // // //       const stream = await navigator.mediaDevices.getUserMedia({
// // // // // //         audio: true,
// // // // // //       });

// // // // // //       streamRef.current = stream;

// // // // // //       let mimeType = "";

// // // // // //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// // // // // //         mimeType = "audio/webm;codecs=opus";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// // // // // //         mimeType = "audio/webm";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
// // // // // //         mimeType = "audio/ogg;codecs=opus";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
// // // // // //         mimeType = "audio/ogg";
// // // // // //       }

// // // // // //       const recorder = mimeType
// // // // // //         ? new MediaRecorder(stream, {
// // // // // //             mimeType,
// // // // // //           })
// // // // // //         : new MediaRecorder(stream);

// // // // // //       recorderRef.current = recorder;
// // // // // //       chunksRef.current = [];

// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }

// // // // // //       setAudioBlob(null);
// // // // // //       setAudioUrl("");

// // // // // //       setUploadedRecording(null);
// // // // // //       setTranscript(null);

// // // // // //       setRecordingSeconds(0);
// // // // // //       setIsPaused(false);

// // // // // //       recorder.ondataavailable = (event) => {
// // // // // //         if (event.data && event.data.size > 0) {
// // // // // //           chunksRef.current.push(event.data);
// // // // // //         }
// // // // // //       };

// // // // // //       recorder.onstop = () => {
// // // // // //         const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

// // // // // //         const blob = new Blob(chunksRef.current, {
// // // // // //           type: finalMimeType,
// // // // // //         });

// // // // // //         if (blob.size <= 0) {
// // // // // //           setError("Recording is empty. Please record again.");

// // // // // //           setIsRecording(false);
// // // // // //           setIsPaused(false);

// // // // // //           stopTimer();
// // // // // //           stopMicrophoneStream();

// // // // // //           recorderRef.current = null;
// // // // // //           return;
// // // // // //         }

// // // // // //         const previewUrl = URL.createObjectURL(blob);

// // // // // //         setAudioBlob(blob);
// // // // // //         setAudioUrl(previewUrl);

// // // // // //         setIsRecording(false);
// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();
// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.onerror = (event) => {
// // // // // //         console.error("MEDIA RECORDER ERROR:", event.error);

// // // // // //         setError("An error occurred while recording.");

// // // // // //         setIsRecording(false);
// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();
// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.start(1000);

// // // // // //       setIsRecording(true);
// // // // // //       setIsPaused(false);

// // // // // //       startTimer();
// // // // // //     } catch (error) {
// // // // // //       console.error("START RECORDING ERROR:", error);

// // // // // //       stopMicrophoneStream();

// // // // // //       if (error?.name === "NotAllowedError") {
// // // // // //         setError(
// // // // // //           "Microphone permission was denied. Please allow microphone access.",
// // // // // //         );
// // // // // //       } else if (error?.name === "NotFoundError") {
// // // // // //         setError("No microphone was found on this device.");
// // // // // //       } else {
// // // // // //         setError(error?.message || "Unable to start microphone recording.");
// // // // // //       }
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // PAUSE
// // // // // //   // ======================================================

// // // // // //   function handlePauseRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "recording") {
// // // // // //       recorder.pause();

// // // // // //       setIsPaused(true);
// // // // // //       stopTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // RESUME
// // // // // //   // ======================================================

// // // // // //   function handleResumeRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "paused") {
// // // // // //       recorder.resume();

// // // // // //       setIsPaused(false);
// // // // // //       startTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // STOP
// // // // // //   // ======================================================

// // // // // //   function handleStopRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (
// // // // // //       recorder &&
// // // // // //       (recorder.state === "recording" || recorder.state === "paused")
// // // // // //     ) {
// // // // // //       recorder.stop();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // RECORD AGAIN
// // // // // //   // ======================================================

// // // // // //   function handleRecordAgain() {
// // // // // //     if (audioUrl) {
// // // // // //       URL.revokeObjectURL(audioUrl);
// // // // // //     }

// // // // // //     setAudioBlob(null);
// // // // // //     setAudioUrl("");

// // // // // //     setRecordingSeconds(0);

// // // // // //     setUploadedRecording(null);
// // // // // //     setTranscript(null);

// // // // // //     setError("");
// // // // // //     setSuccess("");
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // UPLOAD AUDIO
// // // // // //   // ======================================================

// // // // // //   async function handleUploadAudio() {
// // // // // //     if (!audioBlob) {
// // // // // //       setError("Record audio before saving.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setUploadingAudio(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       let extension = "webm";

// // // // // //       const blobType = audioBlob.type || "audio/webm";

// // // // // //       if (blobType.includes("ogg")) {
// // // // // //         extension = "ogg";
// // // // // //       } else if (blobType.includes("mp4")) {
// // // // // //         extension = "mp4";
// // // // // //       } else if (blobType.includes("mpeg")) {
// // // // // //         extension = "mp3";
// // // // // //       } else if (blobType.includes("wav")) {
// // // // // //         extension = "wav";
// // // // // //       } else if (blobType.includes("m4a")) {
// // // // // //         extension = "m4a";
// // // // // //       }

// // // // // //       const file = new File(
// // // // // //         [audioBlob],
// // // // // //         `consultation-${consultation.id}.${extension}`,
// // // // // //         {
// // // // // //           type: blobType,
// // // // // //         },
// // // // // //       );

// // // // // //       const formData = new FormData();

// // // // // //       formData.append("consultation_id", String(consultation.id));

// // // // // //       formData.append("duration_seconds", String(recordingSeconds));

// // // // // //       formData.append("audio", file);

// // // // // //       console.log("AUDIO UPLOAD REQUEST:", {
// // // // // //         consultationId: consultation.id,

// // // // // //         appointmentId,

// // // // // //         fileName: file.name,

// // // // // //         fileSize: file.size,

// // // // // //         mimeType: file.type,

// // // // // //         duration: recordingSeconds,
// // // // // //       });

// // // // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // // // //         method: "POST",

// // // // // //         credentials: "include",

// // // // // //         cache: "no-store",

// // // // // //         body: formData,
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("AUDIO UPLOAD RESPONSE:", {
// // // // // //         status: response.status,

// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message ||
// // // // // //             `Unable to save audio recording (${response.status}).`,
// // // // // //         );
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!data.audio_recording?.id) {
// // // // // //         setError(
// // // // // //           "Audio uploaded but server did not return recording information.",
// // // // // //         );
// // // // // //         return;
// // // // // //       }

// // // // // //       setUploadedRecording(data.audio_recording);

// // // // // //       if (data.consultation) {
// // // // // //         setConsultation((previous) => ({
// // // // // //           ...(previous || {}),
// // // // // //           ...data.consultation,
// // // // // //         }));
// // // // // //       } else {
// // // // // //         setConsultation((previous) =>
// // // // // //           previous
// // // // // //             ? {
// // // // // //                 ...previous,
// // // // // //                 status: "recorded",
// // // // // //               }
// // // // // //             : previous,
// // // // // //         );
// // // // // //       }

// // // // // //       setSuccess(data.message || "Audio recording saved successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("UPLOAD AUDIO ERROR:", error);

// // // // // //       setError(error?.message || "Unable to upload audio recording.");
// // // // // //     } finally {
// // // // // //       setUploadingAudio(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // GENERATE TRANSCRIPT
// // // // // //   // ======================================================

// // // // // //   async function handleGenerateTranscript() {
// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.id) {
// // // // // //       setError("Please save the audio recording first.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.audio_url) {
// // // // // //       setError(
// // // // // //         "Audio URL is missing. Please reload the consultation or save the recording again.",
// // // // // //       );
// // // // // //       return;
// // // // // //     }

// // // // // //     if (
// // // // // //       typeof window === "undefined" ||
// // // // // //       !window.puter ||
// // // // // //       !window.puter.ai ||
// // // // // //       typeof window.puter.ai.speech2txt !== "function"
// // // // // //     ) {
// // // // // //       setError(
// // // // // //         "Speech-to-text service is not available yet. Please try again.",
// // // // // //       );
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setTranscribing(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       // ==================================================
// // // // // //       // FETCH ACTUAL S3 AUDIO
// // // // // //       // ==================================================

// // // // // //       const audioResponse = await fetch(uploadedRecording.audio_url, {
// // // // // //         method: "GET",
// // // // // //         cache: "no-store",
// // // // // //       });

// // // // // //       if (!audioResponse.ok) {
// // // // // //         throw new Error(
// // // // // //           `Unable to load saved audio (${audioResponse.status}).`,
// // // // // //         );
// // // // // //       }

// // // // // //       const fetchedBlob = await audioResponse.blob();

// // // // // //       console.log("S3 AUDIO FOR TRANSCRIPTION:", {
// // // // // //         size: fetchedBlob.size,

// // // // // //         type: fetchedBlob.type,

// // // // // //         recordingId: uploadedRecording.id,

// // // // // //         storageKey: uploadedRecording.storage_key,
// // // // // //       });

// // // // // //       if (!fetchedBlob.size || fetchedBlob.size <= 0) {
// // // // // //         throw new Error("Saved audio file is empty.");
// // // // // //       }

// // // // // //       if (fetchedBlob.size < 1000) {
// // // // // //         throw new Error("Saved audio recording is too small to transcribe.");
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // MIME TYPE
// // // // // //       // ==================================================

// // // // // //       const rawMimeType =
// // // // // //         uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

// // // // // //       const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

// // // // // //       let extension = "webm";

// // // // // //       if (mimeType.includes("ogg")) {
// // // // // //         extension = "ogg";
// // // // // //       } else if (mimeType.includes("mp4")) {
// // // // // //         extension = "mp4";
// // // // // //       } else if (mimeType.includes("mpeg")) {
// // // // // //         extension = "mp3";
// // // // // //       } else if (mimeType.includes("wav")) {
// // // // // //         extension = "wav";
// // // // // //       } else if (mimeType.includes("m4a")) {
// // // // // //         extension = "m4a";
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // CREATE REAL FILE
// // // // // //       // ==================================================

// // // // // //       const transcriptionFile = new File(
// // // // // //         [fetchedBlob],
// // // // // //         `consultation-${consultation.id}.${extension}`,
// // // // // //         {
// // // // // //           type: mimeType,
// // // // // //         },
// // // // // //       );

// // // // // //       console.log("PUTER TRANSCRIPTION FILE:", {
// // // // // //         name: transcriptionFile.name,

// // // // // //         size: transcriptionFile.size,

// // // // // //         type: transcriptionFile.type,
// // // // // //       });

// // // // // //       // ==================================================
// // // // // //       // PUTER
// // // // // //       // ==================================================

// // // // // //       const puterResult = await window.puter.ai.speech2txt(transcriptionFile, {
// // // // // //         model: "gpt-4o-transcribe",

// // // // // //         response_format: "json",

// // // // // //         prompt:
// // // // // //           "This is a medical consultation between a doctor and patient. Transcribe exactly what is spoken. Preserve English, Urdu, Roman Urdu, medicine names, symptoms, diagnoses and medical terminology. Do not summarize. Do not add words that were not spoken.",
// // // // // //       });

// // // // // //       console.log("PUTER RAW RESULT:", puterResult);

// // // // // //       // ==================================================
// // // // // //       // EXTRACT TEXT
// // // // // //       // ==================================================

// // // // // //       let transcriptText = "";

// // // // // //       if (typeof puterResult === "string") {
// // // // // //         transcriptText = puterResult.trim();
// // // // // //       } else if (puterResult && typeof puterResult.text === "string") {
// // // // // //         transcriptText = puterResult.text.trim();
// // // // // //       } else if (puterResult && typeof puterResult.transcript === "string") {
// // // // // //         transcriptText = puterResult.transcript.trim();
// // // // // //       } else if (
// // // // // //         puterResult?.result &&
// // // // // //         typeof puterResult.result.text === "string"
// // // // // //       ) {
// // // // // //         transcriptText = puterResult.result.text.trim();
// // // // // //       }

// // // // // //       console.log("FINAL PUTER TRANSCRIPT:", transcriptText);

// // // // // //       if (!transcriptText) {
// // // // // //         throw new Error("Speech-to-text service returned an empty transcript.");
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // BAD RESULT PROTECTION
// // // // // //       // ==================================================

// // // // // //       const normalizedTranscript = transcriptText
// // // // // //         .toLowerCase()
// // // // // //         .replace(/[.!?,،؟'"]/g, "")
// // // // // //         .trim();

// // // // // //       const suspiciousResults = [
// // // // // //         // "thank you",
// // // // // //         // "thanks",
// // // // // //         // "thankyou",
// // // // // //         // "thank you very much",
// // // // // //       ];

// // // // // //       if (
// // // // // //         transcriptionFile.size > 10000 &&
// // // // // //         suspiciousResults.includes(normalizedTranscript)
// // // // // //       ) {
// // // // // //         throw new Error(
// // // // // //           `Transcription returned only "${transcriptText}". The result was not saved. Please verify the uploaded audio and try again.`,
// // // // // //         );
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // SAVE TRANSCRIPT
// // // // // //       // ==================================================

// // // // // //       const response = await fetch("/api/doctors/consultations/transcribe", {
// // // // // //         method: "POST",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",

// // // // // //         cache: "no-store",

// // // // // //         body: JSON.stringify({
// // // // // //           consultation_id: consultation.id,

// // // // // //           audio_recording_id: uploadedRecording.id,

// // // // // //           transcript_text: transcriptText,

// // // // // //           provider: "puter",

// // // // // //           model: "gpt-4o-transcribe",
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("TRANSCRIPT SAVE RESPONSE:", {
// // // // // //         status: response.status,

// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message || "Transcript was generated but could not be saved.",
// // // // // //         );
// // // // // //         return;
// // // // // //       }

// // // // // //       setTranscript(data.transcript || null);

// // // // // //       setUploadedRecording((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "completed",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setConsultation((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "transcribed",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(data.message || "Transcript generated successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("GENERATE TRANSCRIPT ERROR:", error);

// // // // // //       setError(error?.message || "Unable to generate transcript.");
// // // // // //     } finally {
// // // // // //       setTranscribing(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // CLEANUP
// // // // // //   // ======================================================

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       stopTimer();

// // // // // //       if (recorderRef.current && recorderRef.current.state !== "inactive") {
// // // // // //         try {
// // // // // //           recorderRef.current.stop();
// // // // // //         } catch {}
// // // // // //       }

// // // // // //       stopMicrophoneStream();
// // // // // //     };
// // // // // //   }, []);

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }
// // // // // //     };
// // // // // //   }, [audioUrl]);

// // // // // //   // ======================================================
// // // // // //   // HELPERS
// // // // // //   // ======================================================

// // // // // //   function calculateAge(dateOfBirth) {
// // // // // //     if (!dateOfBirth) {
// // // // // //       return null;
// // // // // //     }

// // // // // //     const birthDate = new Date(dateOfBirth);

// // // // // //     const today = new Date();

// // // // // //     let age = today.getFullYear() - birthDate.getFullYear();

// // // // // //     const monthDifference = today.getMonth() - birthDate.getMonth();

// // // // // //     if (
// // // // // //       monthDifference < 0 ||
// // // // // //       (monthDifference === 0 && today.getDate() < birthDate.getDate())
// // // // // //     ) {
// // // // // //       age--;
// // // // // //     }

// // // // // //     return age;
// // // // // //   }

// // // // // //   function formatDate(date) {
// // // // // //     if (!date) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     return new Intl.DateTimeFormat("en-GB", {
// // // // // //       day: "2-digit",
// // // // // //       month: "short",
// // // // // //       year: "numeric",
// // // // // //     }).format(new Date(date));
// // // // // //   }

// // // // // //   function formatTime(time) {
// // // // // //     if (!time) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     const [hours, minutes] = time.split(":");

// // // // // //     const date = new Date();

// // // // // //     date.setHours(Number(hours));
// // // // // //     date.setMinutes(Number(minutes));
// // // // // //     date.setSeconds(0);

// // // // // //     return date.toLocaleTimeString("en-US", {
// // // // // //       hour: "numeric",
// // // // // //       minute: "2-digit",
// // // // // //       hour12: true,
// // // // // //     });
// // // // // //   }

// // // // // //   function getAppointmentStatus(status) {
// // // // // //     const statuses = {
// // // // // //       scheduled: {
// // // // // //         label: "Scheduled",
// // // // // //         tone: "gray",
// // // // // //       },

// // // // // //       checked_in: {
// // // // // //         label: "Checked in",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       waiting: {
// // // // // //         label: "Waiting",
// // // // // //         tone: "amber",
// // // // // //       },

// // // // // //       in_consultation: {
// // // // // //         label: "In consultation",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       completed: {
// // // // // //         label: "Completed",
// // // // // //         tone: "green",
// // // // // //       },

// // // // // //       cancelled: {
// // // // // //         label: "Cancelled",
// // // // // //         tone: "red",
// // // // // //       },

// // // // // //       no_show: {
// // // // // //         label: "No show",
// // // // // //         tone: "red",
// // // // // //       },
// // // // // //     };

// // // // // //     return (
// // // // // //       statuses[status] || {
// // // // // //         label: status || "Unknown",

// // // // // //         tone: "gray",
// // // // // //       }
// // // // // //     );
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // LOADING
// // // // // //   // ======================================================

// // // // // //   if (loading) {
// // // // // //     return <ConsultationLoading />;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // FATAL ERROR
// // // // // //   // ======================================================

// // // // // //   if (!appointmentId || (error && !patient)) {
// // // // // //     return (
// // // // // //       <Shell
// // // // // //         role="doctor"
// // // // // //         title="New consultation"
// // // // // //         subtitle="Consultation unavailable"
// // // // // //       >
// // // // // //         <div className="max-w-4xl">
// // // // // //           <div className="rounded-2xl border bg-white px-6 py-16 text-center">
// // // // // //             <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 font-bold text-red-600">
// // // // // //               !
// // // // // //             </div>

// // // // // //             <h2 className="mt-4 text-xl font-bold">Consultation unavailable</h2>

// // // // // //             <p className="mt-2 text-sm text-slate-500">
// // // // // //               {error || "Appointment ID is missing."}
// // // // // //             </p>

// // // // // //             <Link
// // // // // //               href="/doctor"
// // // // // //               className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
// // // // // //             >
// // // // // //               Back to dashboard
// // // // // //             </Link>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </Shell>
// // // // // //     );
// // // // // //   }

// // // // // //   if (!patient || !appointment) {
// // // // // //     return null;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // PAGE DATA
// // // // // //   // ======================================================

// // // // // //   const age = calculateAge(patient.date_of_birth);

// // // // // //   const appointmentStatus = getAppointmentStatus(appointment.status);

// // // // // //   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

// // // // // //   const consultationStarted = Boolean(consultation?.id);

// // // // // //   const consultationLocked =
// // // // // //     consultation?.status === "completed" || appointment?.status === "completed";

// // // // // //   // ======================================================
// // // // // //   // PAGE
// // // // // //   // ======================================================

// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle={`${patient.name} · ${patient.patient_code}`}
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         {/* =================================================
// // // // // //             ALERTS
// // // // // //         ================================================= */}

// // // // // //         {error && (
// // // // // //           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// // // // // //             {error}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {success && (
// // // // // //           <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
// // // // // //             {success}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {/* =================================================
// // // // // //             PATIENT
// // // // // //         ================================================= */}

// // // // // //         <section className="rounded-2xl border bg-white p-6">
// // // // // //           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
// // // // // //             <div>
// // // // // //               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// // // // // //                 Patient
// // // // // //               </p>

// // // // // //               <h2 className="mt-2 text-2xl font-bold text-slate-950">
// // // // // //                 {patient.name}
// // // // // //               </h2>

// // // // // //               <p className="mt-2 text-sm text-slate-500">
// // // // // //                 {age !== null ? `${age} years` : "Age not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.gender || "Gender not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.patient_code}
// // // // // //               </p>

// // // // // //               {patient.phone && (
// // // // // //                 <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
// // // // // //               )}
// // // // // //             </div>

// // // // // //             <div className="flex flex-wrap items-center gap-3">
// // // // // //               <Badge tone={appointmentStatus.tone}>
// // // // // //                 {appointmentStatus.label}
// // // // // //               </Badge>

// // // // // //               <Link
// // // // // //                 href={`/doctor/patients/${patient.id}`}
// // // // // //                 className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
// // // // // //               >
// // // // // //                 View patient
// // // // // //               </Link>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           <div className="mt-6 border-t pt-5">
// // // // // //             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Appointment</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">#{appointment.id}</p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Date</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatDate(appointment.appointment_date)}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Time</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatTime(appointment.appointment_time)}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Token</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {appointment.token_number || "—"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             {appointment.notes && (
// // // // // //               <div className="mt-5 rounded-xl bg-slate-50 p-4">
// // // // // //                 <p className="text-xs text-slate-400">Appointment notes</p>

// // // // // //                 <p className="mt-1 text-sm text-slate-700">
// // // // // //                   {appointment.notes}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* =================================================
// // // // // //             HISTORY
// // // // // //         ================================================= */}

// // // // // //         <section className="mt-6 rounded-2xl border bg-white">
// // // // // //           <div className="flex items-center justify-between gap-4 border-b p-5">
// // // // // //             <div>
// // // // // //               <h3 className="font-semibold">Patient history</h3>

// // // // // //               <p className="mt-1 text-xs text-slate-500">
// // // // // //                 Latest medical information before consultation
// // // // // //               </p>
// // // // // //             </div>

// // // // // //             <Link
// // // // // //               href={`/doctor/patients/${patient.id}`}
// // // // // //               className="text-sm font-medium text-blue-600"
// // // // // //             >
// // // // // //               Full history
// // // // // //             </Link>
// // // // // //           </div>

// // // // // //           {!latestHistory ? (
// // // // // //             <div className="p-6">
// // // // // //               <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
// // // // // //                 No medical history has been added for this patient.
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Previous diseases</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_diseases || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Allergies</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.allergies || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Current medications</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.current_medications || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Previous surgeries</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_surgeries || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Family history</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.family_history || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Additional notes</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.additional_notes || "No notes"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </section>

// // // // // //         {/* =================================================
// // // // // //             CONSULTATION
// // // // // //         ================================================= */}

// // // // // //         <section className="mt-6 rounded-2xl border bg-white p-6">
// // // // // //           {!consultationStarted ? (
// // // // // //             <div className="rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // // //               <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // // //                 <Icon name="mic" size={28} />
// // // // // //               </div>

// // // // // //               <h3 className="mt-5 text-xl font-bold">
// // // // // //                 Ready to start consultation
// // // // // //               </h3>

// // // // // //               <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // // //                 Start the consultation when the patient is with you. The
// // // // // //                 appointment will move to in consultation.
// // // // // //               </p>

// // // // // //               <button
// // // // // //                 type="button"
// // // // // //                 disabled={starting}
// // // // // //                 onClick={handleStartConsultation}
// // // // // //                 className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //               >
// // // // // //                 {starting ? "Starting consultation..." : "Start consultation"}
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <>
// // // // // //               {/* CONSULTATION INFO */}

// // // // // //               <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                 <div className="grid gap-5 sm:grid-cols-3">
// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Consultation ID</p>

// // // // // //                     <p className="mt-1 font-semibold">#{consultation.id}</p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Status</p>

// // // // // //                     <p className="mt-1 font-semibold capitalize">
// // // // // //                       {consultation.status?.replaceAll("_", " ")}
// // // // // //                     </p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Started</p>

// // // // // //                     <p className="mt-1 font-semibold">
// // // // // //                       {consultation.started_at
// // // // // //                         ? new Date(consultation.started_at).toLocaleString()
// // // // // //                         : "—"}
// // // // // //                     </p>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               {/* RECORDING */}

// // // // // //               <div className="mt-6 rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // // //                 <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // // //                   <Icon name="mic" size={28} />
// // // // // //                 </div>

// // // // // //                 <div className="mt-5 flex justify-center">
// // // // // //                   <Badge
// // // // // //                     tone={
// // // // // //                       isRecording ? "red" : uploadedRecording ? "green" : "blue"
// // // // // //                     }
// // // // // //                   >
// // // // // //                     {isRecording
// // // // // //                       ? isPaused
// // // // // //                         ? "Recording paused"
// // // // // //                         : "Recording"
// // // // // //                       : uploadedRecording
// // // // // //                         ? "Audio saved"
// // // // // //                         : "Ready to record"}
// // // // // //                   </Badge>
// // // // // //                 </div>

// // // // // //                 <h3 className="mt-4 text-xl font-bold">
// // // // // //                   Consultation recording
// // // // // //                 </h3>

// // // // // //                 <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // // //                   Record the doctor and patient conversation. Audio will be
// // // // // //                   stored securely against this consultation.
// // // // // //                 </p>

// // // // // //                 {(isRecording || recordingSeconds > 0) && (
// // // // // //                   <div className="mt-6 text-3xl font-bold tabular-nums">
// // // // // //                     {formatDuration(recordingSeconds)}
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {!isRecording &&
// // // // // //                   !audioBlob &&
// // // // // //                   !uploadedRecording &&
// // // // // //                   !consultationLocked && (
// // // // // //                     <button
// // // // // //                       type="button"
// // // // // //                       onClick={handleStartRecording}
// // // // // //                       className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
// // // // // //                     >
// // // // // //                       Start recording
// // // // // //                     </button>
// // // // // //                   )}

// // // // // //                 {consultationLocked && (
// // // // // //                   <p className="mt-6 text-sm font-medium text-slate-500">
// // // // // //                     This consultation is completed and cannot be recorded again.
// // // // // //                   </p>
// // // // // //                 )}

// // // // // //                 {isRecording && (
// // // // // //                   <div className="mt-6 flex flex-wrap justify-center gap-3">
// // // // // //                     {!isPaused ? (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handlePauseRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Pause
// // // // // //                       </button>
// // // // // //                     ) : (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handleResumeRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Resume
// // // // // //                       </button>
// // // // // //                     )}

// // // // // //                     <button
// // // // // //                       type="button"
// // // // // //                       onClick={handleStopRecording}
// // // // // //                       className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
// // // // // //                     >
// // // // // //                       Stop recording
// // // // // //                     </button>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* LOCAL PREVIEW */}

// // // // // //                 {audioBlob && !uploadedRecording && !isRecording && (
// // // // // //                   <div className="mt-7">
// // // // // //                     <p className="text-sm font-medium">Recording complete</p>

// // // // // //                     <audio
// // // // // //                       controls
// // // // // //                       src={audioUrl}
// // // // // //                       className="mx-auto mt-4 w-full max-w-lg"
// // // // // //                     />

// // // // // //                     <div className="mt-5 flex flex-wrap justify-center gap-3">
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         disabled={uploadingAudio}
// // // // // //                         onClick={handleUploadAudio}
// // // // // //                         className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
// // // // // //                       >
// // // // // //                         {uploadingAudio ? "Saving audio..." : "Save recording"}
// // // // // //                       </button>

// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         disabled={uploadingAudio}
// // // // // //                         onClick={handleRecordAgain}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold disabled:opacity-50"
// // // // // //                       >
// // // // // //                         Record again
// // // // // //                       </button>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* S3 RECORDING */}

// // // // // //                 {uploadedRecording && (
// // // // // //                   <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
// // // // // //                     <div className="flex flex-wrap items-center justify-between gap-3">
// // // // // //                       <div>
// // // // // //                         <p className="font-semibold text-emerald-900">
// // // // // //                           Recording saved
// // // // // //                         </p>

// // // // // //                         <p className="mt-1 text-xs text-emerald-700">
// // // // // //                           Audio recording #{uploadedRecording.id}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <Badge tone="green">Uploaded</Badge>
// // // // // //                     </div>

// // // // // //                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">Duration</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {formatDuration(
// // // // // //                             Math.round(
// // // // // //                               Number(
// // // // // //                                 uploadedRecording.duration_seconds ||
// // // // // //                                   recordingSeconds,
// // // // // //                               ),
// // // // // //                             ),
// // // // // //                           )}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">File type</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {uploadedRecording.mime_type || "Audio"}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">Status</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold capitalize">
// // // // // //                           {uploadedRecording.status}
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     </div>

// // // // // //                     {uploadedRecording.audio_url && (
// // // // // //                       <audio
// // // // // //                         controls
// // // // // //                         src={uploadedRecording.audio_url}
// // // // // //                         className="mt-5 w-full"
// // // // // //                       />
// // // // // //                     )}

// // // // // //                     {!transcript && (
// // // // // //                       <div className="mt-5 border-t border-emerald-200 pt-5">
// // // // // //                         <button
// // // // // //                           type="button"
// // // // // //                           disabled={transcribing}
// // // // // //                           onClick={handleGenerateTranscript}
// // // // // //                           className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //                         >
// // // // // //                           {transcribing
// // // // // //                             ? "Generating transcript..."
// // // // // //                             : "Generate transcript"}
// // // // // //                         </button>

// // // // // //                         {transcribing && (
// // // // // //                           <p className="mt-3 text-xs text-slate-500">
// // // // // //                             Audio is being transcribed. Please keep this page
// // // // // //                             open.
// // // // // //                           </p>
// // // // // //                         )}
// // // // // //                       </div>
// // // // // //                     )}
// // // // // //                   </div>
// // // // // //                 )}
// // // // // //               </div>

// // // // // //               {/* TRANSCRIPT */}

// // // // // //               {transcript && (
// // // // // //                 <section className="mt-6 overflow-hidden rounded-2xl border">
// // // // // //                   <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
// // // // // //                     <div>
// // // // // //                       <h3 className="font-semibold">AI transcript</h3>

// // // // // //                       <p className="mt-1 text-xs text-slate-500">
// // // // // //                         Generated from consultation recording
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <Badge tone="green">Transcript ready</Badge>
// // // // // //                   </div>

// // // // // //                   <div className="p-5">
// // // // // //                     <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                       <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // // // // //                         {transcript.edited_text ||
// // // // // //                           transcript.full_text ||
// // // // // //                           "Transcript is empty."}
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
// // // // // //                       <span>Transcript #{transcript.id}</span>

// // // // // //                       {transcript.word_count !== null &&
// // // // // //                         transcript.word_count !== undefined && (
// // // // // //                           <span>{transcript.word_count} words</span>
// // // // // //                         )}

// // // // // //                       <span className="capitalize">
// // // // // //                         Status: {transcript.status}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </section>
// // // // // //               )}
// // // // // //             </>
// // // // // //           )}

// // // // // //           {/* =================================================
// // // // // //               PROCESS STEPS
// // // // // //           ================================================= */}

// // // // // //           <div className="mt-6 grid gap-3 md:grid-cols-3">
// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">01</div>

// // // // // //               <div className="mt-2 font-semibold">Patient history</div>

// // // // // //               <div className="mt-1 text-xs text-emerald-600">Available</div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">02</div>

// // // // // //               <div className="mt-2 font-semibold">Audio recording</div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   uploadedRecording ? "text-emerald-600" : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {uploadedRecording
// // // // // //                   ? "Recording saved"
// // // // // //                   : consultationStarted
// // // // // //                     ? "Ready"
// // // // // //                     : "Start consultation first"}
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">03</div>

// // // // // //               <div className="mt-2 font-semibold">AI transcript</div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   transcript
// // // // // //                     ? "text-emerald-600"
// // // // // //                     : transcribing
// // // // // //                       ? "text-blue-600"
// // // // // //                       : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {transcript
// // // // // //                   ? "Transcript ready"
// // // // // //                   : transcribing
// // // // // //                     ? "Processing..."
// // // // // //                     : uploadedRecording
// // // // // //                       ? "Ready to generate"
// // // // // //                       : "Available after recording"}
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* =================================================
// // // // // //             BACK
// // // // // //         ================================================= */}

// // // // // //         <div className="mt-6">
// // // // // //           <Link
// // // // // //             href="/doctor"
// // // // // //             className="text-sm font-medium text-slate-600 hover:text-slate-950"
// // // // // //           >
// // // // // //             ← Back to dashboard
// // // // // //           </Link>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // // "use client";

// // // // // // import { Suspense, useEffect, useRef, useState } from "react";
// // // // // // import { useRouter, useSearchParams } from "next/navigation";
// // // // // // import Link from "next/link";

// // // // // // import Shell from "@/components/Shell";
// // // // // // import Icon from "@/components/Icon";
// // // // // // import Badge from "@/components/Badge";

// // // // // // // ======================================================
// // // // // // // OUTER PAGE
// // // // // // // ======================================================

// // // // // // export default function NewConsultationPage() {
// // // // // //   return (
// // // // // //     <Suspense fallback={<ConsultationLoading />}>
// // // // // //       <NewConsultationContent />
// // // // // //     </Suspense>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // LOADING
// // // // // // // ======================================================

// // // // // // function ConsultationLoading() {
// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle="Loading consultation"
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         <div className="rounded-2xl border bg-white px-6 py-20 text-center">
// // // // // //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

// // // // // //           <p className="mt-4 text-sm text-slate-500">Loading consultation...</p>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // // // ======================================================
// // // // // // // MAIN
// // // // // // // ======================================================

// // // // // // function NewConsultationContent() {
// // // // // //   const router = useRouter();
// // // // // //   const searchParams = useSearchParams();

// // // // // //   const appointmentId = searchParams.get("appointment");

// // // // // //   // ======================================================
// // // // // //   // DATA
// // // // // //   // ======================================================

// // // // // //   const [appointment, setAppointment] = useState(null);
// // // // // //   const [patient, setPatient] = useState(null);
// // // // // //   const [medicalHistory, setMedicalHistory] = useState([]);
// // // // // //   const [consultation, setConsultation] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // PAGE STATE
// // // // // //   // ======================================================

// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [starting, setStarting] = useState(false);

// // // // // //   const [error, setError] = useState("");
// // // // // //   const [success, setSuccess] = useState("");

// // // // // //   // ======================================================
// // // // // //   // RECORDING STATE
// // // // // //   // ======================================================

// // // // // //   const [isRecording, setIsRecording] = useState(false);
// // // // // //   const [isPaused, setIsPaused] = useState(false);

// // // // // //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// // // // // //   const [audioBlob, setAudioBlob] = useState(null);
// // // // // //   const [audioUrl, setAudioUrl] = useState("");

// // // // // //   const [uploadingAudio, setUploadingAudio] = useState(false);
// // // // // //   const [deletingRecording, setDeletingRecording] = useState(false);

// // // // // //   const [uploadedRecording, setUploadedRecording] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // TRANSCRIPTION
// // // // // //   // ======================================================

// // // // // //   const [transcribing, setTranscribing] = useState(false);
// // // // // //   const [transcript, setTranscript] = useState(null);

// // // // // //   // ======================================================
// // // // // //   // REFS
// // // // // //   // ======================================================

// // // // // //   const recorderRef = useRef(null);
// // // // // //   const streamRef = useRef(null);
// // // // // //   const timerRef = useRef(null);
// // // // // //   const chunksRef = useRef([]);

// // // // // //   // ======================================================
// // // // // //   // SAFE API RESPONSE
// // // // // //   // ======================================================

// // // // // //   async function getResponseData(response) {
// // // // // //     const contentType = response.headers.get("content-type") || "";

// // // // // //     if (contentType.includes("application/json")) {
// // // // // //       return await response.json();
// // // // // //     }

// // // // // //     const text = await response.text();

// // // // // //     throw new Error(
// // // // // //       text
// // // // // //         ? `Server returned an invalid response (${response.status}).`
// // // // // //         : "Server returned an invalid response.",
// // // // // //     );
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // LOAD CONSULTATION
// // // // // //   // ======================================================

// // // // // //   async function loadConsultationData() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");
// // // // // //       setLoading(false);
// // // // // //       return;
// // // // // //     }

// // // // // //     const numericAppointmentId = Number(appointmentId);

// // // // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // // // //       setError("Invalid appointment ID.");
// // // // // //       setLoading(false);
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setLoading(true);
// // // // // //       setError("");

// // // // // //       const response = await fetch(
// // // // // //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// // // // // //           numericAppointmentId,
// // // // // //         )}`,
// // // // // //         {
// // // // // //           method: "GET",
// // // // // //           credentials: "include",
// // // // // //           cache: "no-store",
// // // // // //         },
// // // // // //       );

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("LOAD CONSULTATION RESPONSE:", {
// // // // // //         status: response.status,
// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(data.message || "Unable to load consultation information.");
// // // // // //         return;
// // // // // //       }

// // // // // //       setAppointment(data.appointment || null);
// // // // // //       setPatient(data.patient || null);

// // // // // //       setMedicalHistory(
// // // // // //         Array.isArray(data.medical_history) ? data.medical_history : [],
// // // // // //       );

// // // // // //       setConsultation(data.consultation || null);

// // // // // //       if (data.audio_recording) {
// // // // // //         setUploadedRecording(data.audio_recording);
// // // // // //       } else {
// // // // // //         setUploadedRecording(null);
// // // // // //       }

// // // // // //       if (data.transcript) {
// // // // // //         setTranscript(data.transcript);
// // // // // //       } else {
// // // // // //         setTranscript(null);
// // // // // //       }
// // // // // //     } catch (error) {
// // // // // //       console.error("LOAD CONSULTATION ERROR:", error);

// // // // // //       setError(error?.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   }

// // // // // //   useEffect(() => {
// // // // // //     loadConsultationData();
// // // // // //   }, [appointmentId]);

// // // // // //   // ======================================================
// // // // // //   // START CONSULTATION
// // // // // //   // ======================================================

// // // // // //   async function handleStartConsultation() {
// // // // // //     if (!appointmentId) {
// // // // // //       setError("Appointment ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     const numericAppointmentId = Number(appointmentId);

// // // // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // // // //       setError("Invalid appointment ID.");
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setStarting(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       console.log("START CONSULTATION REQUEST:", {
// // // // // //         appointment_id: numericAppointmentId,
// // // // // //       });

// // // // // //       const response = await fetch("/api/doctors/consultations/start", {
// // // // // //         method: "POST",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",
// // // // // //         cache: "no-store",

// // // // // //         body: JSON.stringify({
// // // // // //           appointment_id: numericAppointmentId,
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("START CONSULTATION RESPONSE:", {
// // // // // //         status: response.status,
// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message || `Unable to start consultation (${response.status}).`,
// // // // // //         );

// // // // // //         return;
// // // // // //       }

// // // // // //       if (!data.consultation?.id) {
// // // // // //         setError(
// // // // // //           "Consultation started but server did not return consultation information.",
// // // // // //         );

// // // // // //         return;
// // // // // //       }

// // // // // //       setConsultation(data.consultation);

// // // // // //       if (data.appointment) {
// // // // // //         setAppointment(data.appointment);
// // // // // //       } else {
// // // // // //         setAppointment((previous) =>
// // // // // //           previous
// // // // // //             ? {
// // // // // //                 ...previous,

// // // // // //                 status:
// // // // // //                   previous.status === "completed"
// // // // // //                     ? previous.status
// // // // // //                     : "in_consultation",
// // // // // //               }
// // // // // //             : previous,
// // // // // //         );
// // // // // //       }

// // // // // //       if (data.audio_recording) {
// // // // // //         setUploadedRecording(data.audio_recording);
// // // // // //       }

// // // // // //       if (data.transcript) {
// // // // // //         setTranscript(data.transcript);
// // // // // //       }

// // // // // //       setSuccess(data.message || "Consultation started successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("START CONSULTATION ERROR:", error);

// // // // // //       setError(error?.message || "Unable to connect to the server.");
// // // // // //     } finally {
// // // // // //       setStarting(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // TIMER
// // // // // //   // ======================================================

// // // // // //   function stopTimer() {
// // // // // //     if (timerRef.current) {
// // // // // //       clearInterval(timerRef.current);

// // // // // //       timerRef.current = null;
// // // // // //     }
// // // // // //   }

// // // // // //   function startTimer() {
// // // // // //     stopTimer();

// // // // // //     timerRef.current = setInterval(() => {
// // // // // //       setRecordingSeconds((previous) => previous + 1);
// // // // // //     }, 1000);
// // // // // //   }

// // // // // //   function formatDuration(totalSeconds) {
// // // // // //     const safeSeconds = Number(totalSeconds) || 0;

// // // // // //     const minutes = Math.floor(safeSeconds / 60);

// // // // // //     const seconds = Math.floor(safeSeconds % 60);

// // // // // //     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
// // // // // //       2,
// // // // // //       "0",
// // // // // //     )}`;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // MICROPHONE
// // // // // //   // ======================================================

// // // // // //   function stopMicrophoneStream() {
// // // // // //     if (!streamRef.current) {
// // // // // //       return;
// // // // // //     }

// // // // // //     streamRef.current.getTracks().forEach((track) => {
// // // // // //       track.stop();
// // // // // //     });

// // // // // //     streamRef.current = null;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // START RECORDING
// // // // // //   // ======================================================

// // // // // //   async function handleStartRecording() {
// // // // // //     try {
// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       if (!consultation?.id) {
// // // // // //         setError("Start the consultation before recording.");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (
// // // // // //         typeof window === "undefined" ||
// // // // // //         !navigator.mediaDevices ||
// // // // // //         !navigator.mediaDevices.getUserMedia ||
// // // // // //         typeof MediaRecorder === "undefined"
// // // // // //       ) {
// // // // // //         setError("Microphone recording is not supported in this browser.");
// // // // // //         return;
// // // // // //       }

// // // // // //       const stream = await navigator.mediaDevices.getUserMedia({
// // // // // //         audio: true,
// // // // // //       });

// // // // // //       streamRef.current = stream;

// // // // // //       let mimeType = "";

// // // // // //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// // // // // //         mimeType = "audio/webm;codecs=opus";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// // // // // //         mimeType = "audio/webm";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
// // // // // //         mimeType = "audio/ogg;codecs=opus";
// // // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
// // // // // //         mimeType = "audio/ogg";
// // // // // //       }

// // // // // //       const recorder = mimeType
// // // // // //         ? new MediaRecorder(stream, {
// // // // // //             mimeType,
// // // // // //           })
// // // // // //         : new MediaRecorder(stream);

// // // // // //       recorderRef.current = recorder;

// // // // // //       chunksRef.current = [];

// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }

// // // // // //       setAudioBlob(null);
// // // // // //       setAudioUrl("");

// // // // // //       setUploadedRecording(null);
// // // // // //       setTranscript(null);

// // // // // //       setRecordingSeconds(0);
// // // // // //       setIsPaused(false);

// // // // // //       recorder.ondataavailable = (event) => {
// // // // // //         if (event.data && event.data.size > 0) {
// // // // // //           chunksRef.current.push(event.data);
// // // // // //         }
// // // // // //       };

// // // // // //       recorder.onstop = () => {
// // // // // //         const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

// // // // // //         const blob = new Blob(chunksRef.current, {
// // // // // //           type: finalMimeType,
// // // // // //         });

// // // // // //         if (blob.size <= 0) {
// // // // // //           setError("Recording is empty. Please record again.");

// // // // // //           setIsRecording(false);
// // // // // //           setIsPaused(false);

// // // // // //           stopTimer();
// // // // // //           stopMicrophoneStream();

// // // // // //           recorderRef.current = null;

// // // // // //           return;
// // // // // //         }

// // // // // //         const previewUrl = URL.createObjectURL(blob);

// // // // // //         setAudioBlob(blob);
// // // // // //         setAudioUrl(previewUrl);

// // // // // //         setIsRecording(false);
// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();
// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.onerror = (event) => {
// // // // // //         console.error("MEDIA RECORDER ERROR:", event.error);

// // // // // //         setError("An error occurred while recording.");

// // // // // //         setIsRecording(false);
// // // // // //         setIsPaused(false);

// // // // // //         stopTimer();
// // // // // //         stopMicrophoneStream();

// // // // // //         recorderRef.current = null;
// // // // // //       };

// // // // // //       recorder.start(1000);

// // // // // //       setIsRecording(true);
// // // // // //       setIsPaused(false);

// // // // // //       startTimer();
// // // // // //     } catch (error) {
// // // // // //       console.error("START RECORDING ERROR:", error);

// // // // // //       stopMicrophoneStream();

// // // // // //       if (error?.name === "NotAllowedError") {
// // // // // //         setError(
// // // // // //           "Microphone permission was denied. Please allow microphone access.",
// // // // // //         );
// // // // // //       } else if (error?.name === "NotFoundError") {
// // // // // //         setError("No microphone was found on this device.");
// // // // // //       } else {
// // // // // //         setError(error?.message || "Unable to start microphone recording.");
// // // // // //       }
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // PAUSE
// // // // // //   // ======================================================

// // // // // //   function handlePauseRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "recording") {
// // // // // //       recorder.pause();

// // // // // //       setIsPaused(true);

// // // // // //       stopTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // RESUME
// // // // // //   // ======================================================

// // // // // //   function handleResumeRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (recorder && recorder.state === "paused") {
// // // // // //       recorder.resume();

// // // // // //       setIsPaused(false);

// // // // // //       startTimer();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // STOP
// // // // // //   // ======================================================

// // // // // //   function handleStopRecording() {
// // // // // //     const recorder = recorderRef.current;

// // // // // //     if (
// // // // // //       recorder &&
// // // // // //       (recorder.state === "recording" || recorder.state === "paused")
// // // // // //     ) {
// // // // // //       recorder.stop();
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // RECORD AGAIN
// // // // // //   // ======================================================

// // // // // //   function handleRecordAgain() {
// // // // // //     if (audioUrl) {
// // // // // //       URL.revokeObjectURL(audioUrl);
// // // // // //     }

// // // // // //     setAudioBlob(null);
// // // // // //     setAudioUrl("");

// // // // // //     setRecordingSeconds(0);

// // // // // //     setUploadedRecording(null);
// // // // // //     setTranscript(null);

// // // // // //     setError("");
// // // // // //     setSuccess("");
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // UPLOAD AUDIO
// // // // // //   // ======================================================

// // // // // //   async function handleUploadAudio() {
// // // // // //     if (!audioBlob) {
// // // // // //       setError("Record audio before saving.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setUploadingAudio(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       let extension = "webm";

// // // // // //       const blobType = audioBlob.type || "audio/webm";

// // // // // //       if (blobType.includes("ogg")) {
// // // // // //         extension = "ogg";
// // // // // //       } else if (blobType.includes("mp4")) {
// // // // // //         extension = "mp4";
// // // // // //       } else if (blobType.includes("mpeg")) {
// // // // // //         extension = "mp3";
// // // // // //       } else if (blobType.includes("wav")) {
// // // // // //         extension = "wav";
// // // // // //       } else if (blobType.includes("m4a")) {
// // // // // //         extension = "m4a";
// // // // // //       }

// // // // // //       const file = new File(
// // // // // //         [audioBlob],
// // // // // //         `consultation-${consultation.id}.${extension}`,
// // // // // //         {
// // // // // //           type: blobType,
// // // // // //         },
// // // // // //       );

// // // // // //       const formData = new FormData();

// // // // // //       formData.append("consultation_id", String(consultation.id));

// // // // // //       formData.append("duration_seconds", String(recordingSeconds));

// // // // // //       formData.append("audio", file);

// // // // // //       console.log("AUDIO UPLOAD REQUEST:", {
// // // // // //         consultationId: consultation.id,
// // // // // //         appointmentId,
// // // // // //         fileName: file.name,
// // // // // //         fileSize: file.size,
// // // // // //         mimeType: file.type,
// // // // // //         duration: recordingSeconds,
// // // // // //       });

// // // // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // // // //         method: "POST",

// // // // // //         credentials: "include",

// // // // // //         cache: "no-store",

// // // // // //         body: formData,
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("AUDIO UPLOAD RESPONSE:", {
// // // // // //         status: response.status,
// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message ||
// // // // // //             `Unable to save audio recording (${response.status}).`,
// // // // // //         );

// // // // // //         return;
// // // // // //       }

// // // // // //       if (!data.audio_recording?.id) {
// // // // // //         setError(
// // // // // //           "Audio uploaded but server did not return recording information.",
// // // // // //         );

// // // // // //         return;
// // // // // //       }

// // // // // //       setUploadedRecording(data.audio_recording);

// // // // // //       if (data.consultation) {
// // // // // //         setConsultation((previous) => ({
// // // // // //           ...(previous || {}),
// // // // // //           ...data.consultation,
// // // // // //         }));
// // // // // //       } else {
// // // // // //         setConsultation((previous) =>
// // // // // //           previous
// // // // // //             ? {
// // // // // //                 ...previous,
// // // // // //                 status: "recorded",
// // // // // //               }
// // // // // //             : previous,
// // // // // //         );
// // // // // //       }

// // // // // //       setSuccess(data.message || "Audio recording saved successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("UPLOAD AUDIO ERROR:", error);

// // // // // //       setError(error?.message || "Unable to upload audio recording.");
// // // // // //     } finally {
// // // // // //       setUploadingAudio(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // DELETE SAVED RECORDING
// // // // // //   // ======================================================

// // // // // //   async function handleDeleteRecording() {
// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.id) {
// // // // // //       setError("Audio recording ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     const hasTranscript = Boolean(transcript?.id);

// // // // // //     const confirmationMessage = hasTranscript
// // // // // //       ? "Delete this recording? The generated transcript for this recording will also be removed. This action cannot be undone."
// // // // // //       : "Delete this recording? The audio will be removed permanently and cannot be recovered.";

// // // // // //     const confirmed = window.confirm(confirmationMessage);

// // // // // //     if (!confirmed) {
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setDeletingRecording(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // // // //         method: "DELETE",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",

// // // // // //         cache: "no-store",

// // // // // //         body: JSON.stringify({
// // // // // //           consultation_id: consultation.id,

// // // // // //           audio_recording_id: uploadedRecording.id,
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("DELETE AUDIO RESPONSE:", {
// // // // // //         status: response.status,
// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message || `Unable to delete recording (${response.status}).`,
// // // // // //         );

// // // // // //         return;
// // // // // //       }

// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }

// // // // // //       setAudioBlob(null);
// // // // // //       setAudioUrl("");

// // // // // //       setRecordingSeconds(0);

// // // // // //       // Transcript for deleted audio is also removed
// // // // // //       setTranscript(null);

// // // // // //       // Backend may return an older recording if one exists
// // // // // //       setUploadedRecording(data.remaining_audio_recording || null);

// // // // // //       if (data.consultation) {
// // // // // //         setConsultation((previous) => ({
// // // // // //           ...(previous || {}),
// // // // // //           ...data.consultation,
// // // // // //         }));
// // // // // //       } else {
// // // // // //         setConsultation((previous) =>
// // // // // //           previous
// // // // // //             ? {
// // // // // //                 ...previous,

// // // // // //                 status: data.remaining_audio_recording ? "recorded" : "draft",
// // // // // //               }
// // // // // //             : previous,
// // // // // //         );
// // // // // //       }

// // // // // //       setSuccess(
// // // // // //         data.message || "Recording deleted successfully. You can record again.",
// // // // // //       );
// // // // // //     } catch (error) {
// // // // // //       console.error("DELETE RECORDING ERROR:", error);

// // // // // //       setError(error?.message || "Unable to delete recording.");
// // // // // //     } finally {
// // // // // //       setDeletingRecording(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // GENERATE TRANSCRIPT
// // // // // //   // ======================================================

// // // // // //   async function handleGenerateTranscript() {
// // // // // //     if (!consultation?.id) {
// // // // // //       setError("Consultation ID is missing.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.id) {
// // // // // //       setError("Please save the audio recording first.");
// // // // // //       return;
// // // // // //     }

// // // // // //     if (!uploadedRecording?.audio_url) {
// // // // // //       setError(
// // // // // //         "Audio URL is missing. Please reload the consultation or save the recording again.",
// // // // // //       );

// // // // // //       return;
// // // // // //     }

// // // // // //     if (
// // // // // //       typeof window === "undefined" ||
// // // // // //       !window.puter ||
// // // // // //       !window.puter.ai ||
// // // // // //       typeof window.puter.ai.speech2txt !== "function"
// // // // // //     ) {
// // // // // //       setError(
// // // // // //         "Speech-to-text service is not available yet. Please try again.",
// // // // // //       );

// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       setTranscribing(true);

// // // // // //       setError("");
// // // // // //       setSuccess("");

// // // // // //       // ==================================================
// // // // // //       // FETCH SAVED S3 AUDIO
// // // // // //       // ==================================================

// // // // // //       const audioResponse = await fetch(uploadedRecording.audio_url, {
// // // // // //         method: "GET",
// // // // // //         cache: "no-store",
// // // // // //       });

// // // // // //       if (!audioResponse.ok) {
// // // // // //         throw new Error(
// // // // // //           `Unable to load saved audio (${audioResponse.status}).`,
// // // // // //         );
// // // // // //       }

// // // // // //       const fetchedBlob = await audioResponse.blob();

// // // // // //       console.log("S3 AUDIO FOR TRANSCRIPTION:", {
// // // // // //         size: fetchedBlob.size,
// // // // // //         type: fetchedBlob.type,
// // // // // //         recordingId: uploadedRecording.id,
// // // // // //         storageKey: uploadedRecording.storage_key,
// // // // // //       });

// // // // // //       if (!fetchedBlob.size || fetchedBlob.size <= 0) {
// // // // // //         throw new Error("Saved audio file is empty.");
// // // // // //       }

// // // // // //       if (fetchedBlob.size < 1000) {
// // // // // //         throw new Error("Saved audio recording is too small to transcribe.");
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // MIME TYPE
// // // // // //       // ==================================================

// // // // // //       const rawMimeType =
// // // // // //         uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

// // // // // //       const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

// // // // // //       let extension = "webm";

// // // // // //       if (mimeType.includes("ogg")) {
// // // // // //         extension = "ogg";
// // // // // //       } else if (mimeType.includes("mp4")) {
// // // // // //         extension = "mp4";
// // // // // //       } else if (mimeType.includes("mpeg")) {
// // // // // //         extension = "mp3";
// // // // // //       } else if (mimeType.includes("wav")) {
// // // // // //         extension = "wav";
// // // // // //       } else if (mimeType.includes("m4a")) {
// // // // // //         extension = "m4a";
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // CREATE AUDIO FILE
// // // // // //       // ==================================================

// // // // // //       const transcriptionFile = new File(
// // // // // //         [fetchedBlob],
// // // // // //         `consultation-${consultation.id}.${extension}`,
// // // // // //         {
// // // // // //           type: mimeType,
// // // // // //         },
// // // // // //       );

// // // // // //       console.log("PUTER TRANSCRIPTION FILE:", {
// // // // // //         name: transcriptionFile.name,
// // // // // //         size: transcriptionFile.size,
// // // // // //         type: transcriptionFile.type,
// // // // // //       });

// // // // // //       // ==================================================
// // // // // //       // PUTER
// // // // // //       // ==================================================

// // // // // //       const puterResult = await window.puter.ai.speech2txt(transcriptionFile, {
// // // // // //         model: "gpt-4o-transcribe",

// // // // // //         response_format: "json",

// // // // // //         prompt:
// // // // // //           "This is a medical consultation between a doctor and patient. Transcribe exactly what is spoken. Preserve English, Urdu, Roman Urdu, medicine names, symptoms, diagnoses and medical terminology. Do not summarize. Do not add words that were not spoken.",
// // // // // //       });

// // // // // //       console.log("PUTER RAW RESULT:", puterResult);

// // // // // //       // ==================================================
// // // // // //       // EXTRACT TEXT
// // // // // //       // ==================================================

// // // // // //       let transcriptText = "";

// // // // // //       if (typeof puterResult === "string") {
// // // // // //         transcriptText = puterResult.trim();
// // // // // //       } else if (puterResult && typeof puterResult.text === "string") {
// // // // // //         transcriptText = puterResult.text.trim();
// // // // // //       } else if (puterResult && typeof puterResult.transcript === "string") {
// // // // // //         transcriptText = puterResult.transcript.trim();
// // // // // //       } else if (
// // // // // //         puterResult?.result &&
// // // // // //         typeof puterResult.result.text === "string"
// // // // // //       ) {
// // // // // //         transcriptText = puterResult.result.text.trim();
// // // // // //       }

// // // // // //       console.log("FINAL PUTER TRANSCRIPT:", transcriptText);

// // // // // //       if (!transcriptText) {
// // // // // //         throw new Error("Speech-to-text service returned an empty transcript.");
// // // // // //       }

// // // // // //       // ==================================================
// // // // // //       // SAVE TRANSCRIPT
// // // // // //       // ==================================================

// // // // // //       const response = await fetch("/api/doctors/consultations/transcribe", {
// // // // // //         method: "POST",

// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },

// // // // // //         credentials: "include",

// // // // // //         cache: "no-store",

// // // // // //         body: JSON.stringify({
// // // // // //           consultation_id: consultation.id,

// // // // // //           audio_recording_id: uploadedRecording.id,

// // // // // //           transcript_text: transcriptText,

// // // // // //           provider: "puter",

// // // // // //           model: "gpt-4o-transcribe",
// // // // // //         }),
// // // // // //       });

// // // // // //       const data = await getResponseData(response);

// // // // // //       console.log("TRANSCRIPT SAVE RESPONSE:", {
// // // // // //         status: response.status,
// // // // // //         data,
// // // // // //       });

// // // // // //       if (response.status === 401) {
// // // // // //         router.replace("/login");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (response.status === 403) {
// // // // // //         router.replace("/unauthorized");
// // // // // //         return;
// // // // // //       }

// // // // // //       if (!response.ok) {
// // // // // //         setError(
// // // // // //           data.message || "Transcript was generated but could not be saved.",
// // // // // //         );

// // // // // //         return;
// // // // // //       }

// // // // // //       setTranscript(data.transcript || null);

// // // // // //       setUploadedRecording((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "completed",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setConsultation((previous) =>
// // // // // //         previous
// // // // // //           ? {
// // // // // //               ...previous,
// // // // // //               status: "transcribed",
// // // // // //             }
// // // // // //           : previous,
// // // // // //       );

// // // // // //       setSuccess(data.message || "Transcript generated successfully.");
// // // // // //     } catch (error) {
// // // // // //       console.error("GENERATE TRANSCRIPT ERROR:", error);

// // // // // //       setError(error?.message || "Unable to generate transcript.");
// // // // // //     } finally {
// // // // // //       setTranscribing(false);
// // // // // //     }
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // CLEANUP
// // // // // //   // ======================================================

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       stopTimer();

// // // // // //       if (recorderRef.current && recorderRef.current.state !== "inactive") {
// // // // // //         try {
// // // // // //           recorderRef.current.stop();
// // // // // //         } catch {}
// // // // // //       }

// // // // // //       stopMicrophoneStream();
// // // // // //     };
// // // // // //   }, []);

// // // // // //   useEffect(() => {
// // // // // //     return () => {
// // // // // //       if (audioUrl) {
// // // // // //         URL.revokeObjectURL(audioUrl);
// // // // // //       }
// // // // // //     };
// // // // // //   }, [audioUrl]);

// // // // // //   // ======================================================
// // // // // //   // HELPERS
// // // // // //   // ======================================================

// // // // // //   function calculateAge(dateOfBirth) {
// // // // // //     if (!dateOfBirth) {
// // // // // //       return null;
// // // // // //     }

// // // // // //     const birthDate = new Date(dateOfBirth);

// // // // // //     const today = new Date();

// // // // // //     let age = today.getFullYear() - birthDate.getFullYear();

// // // // // //     const monthDifference = today.getMonth() - birthDate.getMonth();

// // // // // //     if (
// // // // // //       monthDifference < 0 ||
// // // // // //       (monthDifference === 0 && today.getDate() < birthDate.getDate())
// // // // // //     ) {
// // // // // //       age--;
// // // // // //     }

// // // // // //     return age;
// // // // // //   }

// // // // // //   function formatDate(date) {
// // // // // //     if (!date) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     return new Intl.DateTimeFormat("en-GB", {
// // // // // //       day: "2-digit",
// // // // // //       month: "short",
// // // // // //       year: "numeric",
// // // // // //     }).format(new Date(date));
// // // // // //   }

// // // // // //   function formatTime(time) {
// // // // // //     if (!time) {
// // // // // //       return "—";
// // // // // //     }

// // // // // //     const [hours, minutes] = time.split(":");

// // // // // //     const date = new Date();

// // // // // //     date.setHours(Number(hours));
// // // // // //     date.setMinutes(Number(minutes));
// // // // // //     date.setSeconds(0);

// // // // // //     return date.toLocaleTimeString("en-US", {
// // // // // //       hour: "numeric",
// // // // // //       minute: "2-digit",
// // // // // //       hour12: true,
// // // // // //     });
// // // // // //   }

// // // // // //   function getAppointmentStatus(status) {
// // // // // //     const statuses = {
// // // // // //       scheduled: {
// // // // // //         label: "Scheduled",
// // // // // //         tone: "gray",
// // // // // //       },

// // // // // //       checked_in: {
// // // // // //         label: "Checked in",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       waiting: {
// // // // // //         label: "Waiting",
// // // // // //         tone: "amber",
// // // // // //       },

// // // // // //       in_consultation: {
// // // // // //         label: "In consultation",
// // // // // //         tone: "blue",
// // // // // //       },

// // // // // //       completed: {
// // // // // //         label: "Completed",
// // // // // //         tone: "green",
// // // // // //       },

// // // // // //       cancelled: {
// // // // // //         label: "Cancelled",
// // // // // //         tone: "red",
// // // // // //       },

// // // // // //       no_show: {
// // // // // //         label: "No show",
// // // // // //         tone: "red",
// // // // // //       },
// // // // // //     };

// // // // // //     return (
// // // // // //       statuses[status] || {
// // // // // //         label: status || "Unknown",
// // // // // //         tone: "gray",
// // // // // //       }
// // // // // //     );
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // LOADING
// // // // // //   // ======================================================

// // // // // //   if (loading) {
// // // // // //     return <ConsultationLoading />;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // FATAL ERROR
// // // // // //   // ======================================================

// // // // // //   if (!appointmentId || (error && !patient)) {
// // // // // //     return (
// // // // // //       <Shell
// // // // // //         role="doctor"
// // // // // //         title="New consultation"
// // // // // //         subtitle="Consultation unavailable"
// // // // // //       >
// // // // // //         <div className="max-w-4xl">
// // // // // //           <div className="rounded-2xl border bg-white px-6 py-16 text-center">
// // // // // //             <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 font-bold text-red-600">
// // // // // //               !
// // // // // //             </div>

// // // // // //             <h2 className="mt-4 text-xl font-bold">Consultation unavailable</h2>

// // // // // //             <p className="mt-2 text-sm text-slate-500">
// // // // // //               {error || "Appointment ID is missing."}
// // // // // //             </p>

// // // // // //             <Link
// // // // // //               href="/doctor"
// // // // // //               className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
// // // // // //             >
// // // // // //               Back to dashboard
// // // // // //             </Link>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </Shell>
// // // // // //     );
// // // // // //   }

// // // // // //   if (!patient || !appointment) {
// // // // // //     return null;
// // // // // //   }

// // // // // //   // ======================================================
// // // // // //   // PAGE DATA
// // // // // //   // ======================================================

// // // // // //   const age = calculateAge(patient.date_of_birth);

// // // // // //   const appointmentStatus = getAppointmentStatus(appointment.status);

// // // // // //   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

// // // // // //   const consultationStarted = Boolean(consultation?.id);

// // // // // //   const consultationLocked =
// // // // // //     consultation?.status === "completed" || appointment?.status === "completed";

// // // // // //   // ======================================================
// // // // // //   // PAGE
// // // // // //   // ======================================================

// // // // // //   return (
// // // // // //     <Shell
// // // // // //       role="doctor"
// // // // // //       title="New consultation"
// // // // // //       subtitle={`${patient.name} · ${patient.patient_code}`}
// // // // // //     >
// // // // // //       <div className="max-w-5xl">
// // // // // //         {/* =================================================
// // // // // //             ALERTS
// // // // // //         ================================================= */}

// // // // // //         {error && (
// // // // // //           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// // // // // //             {error}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {success && (
// // // // // //           <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
// // // // // //             {success}
// // // // // //           </div>
// // // // // //         )}

// // // // // //         {/* =================================================
// // // // // //             PATIENT
// // // // // //         ================================================= */}

// // // // // //         <section className="rounded-2xl border bg-white p-6">
// // // // // //           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
// // // // // //             <div>
// // // // // //               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// // // // // //                 Patient
// // // // // //               </p>

// // // // // //               <h2 className="mt-2 text-2xl font-bold text-slate-950">
// // // // // //                 {patient.name}
// // // // // //               </h2>

// // // // // //               <p className="mt-2 text-sm text-slate-500">
// // // // // //                 {age !== null ? `${age} years` : "Age not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.gender || "Gender not added"}

// // // // // //                 {" · "}

// // // // // //                 {patient.patient_code}
// // // // // //               </p>

// // // // // //               {patient.phone && (
// // // // // //                 <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
// // // // // //               )}
// // // // // //             </div>

// // // // // //             <div className="flex flex-wrap items-center gap-3">
// // // // // //               <Badge tone={appointmentStatus.tone}>
// // // // // //                 {appointmentStatus.label}
// // // // // //               </Badge>

// // // // // //               <Link
// // // // // //                 href={`/doctor/patients/${patient.id}`}
// // // // // //                 className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
// // // // // //               >
// // // // // //                 View patient
// // // // // //               </Link>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           <div className="mt-6 border-t pt-5">
// // // // // //             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Appointment</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">#{appointment.id}</p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Date</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatDate(appointment.appointment_date)}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Time</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {formatTime(appointment.appointment_time)}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Token</p>

// // // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // // //                   {appointment.token_number || "—"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             {appointment.notes && (
// // // // // //               <div className="mt-5 rounded-xl bg-slate-50 p-4">
// // // // // //                 <p className="text-xs text-slate-400">Appointment notes</p>

// // // // // //                 <p className="mt-1 text-sm text-slate-700">
// // // // // //                   {appointment.notes}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* =================================================
// // // // // //             HISTORY
// // // // // //         ================================================= */}

// // // // // //         <section className="mt-6 rounded-2xl border bg-white">
// // // // // //           <div className="flex items-center justify-between gap-4 border-b p-5">
// // // // // //             <div>
// // // // // //               <h3 className="font-semibold">Patient history</h3>

// // // // // //               <p className="mt-1 text-xs text-slate-500">
// // // // // //                 Latest medical information before consultation
// // // // // //               </p>
// // // // // //             </div>

// // // // // //             <Link
// // // // // //               href={`/doctor/patients/${patient.id}`}
// // // // // //               className="text-sm font-medium text-blue-600"
// // // // // //             >
// // // // // //               Full history
// // // // // //             </Link>
// // // // // //           </div>

// // // // // //           {!latestHistory ? (
// // // // // //             <div className="p-6">
// // // // // //               <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
// // // // // //                 No medical history has been added for this patient.
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Previous diseases</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_diseases || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Allergies</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.allergies || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Current medications</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.current_medications || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Previous surgeries</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.previous_surgeries || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Family history</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.family_history || "None reported"}
// // // // // //                 </p>
// // // // // //               </div>

// // // // // //               <div>
// // // // // //                 <p className="text-xs text-slate-400">Additional notes</p>

// // // // // //                 <p className="mt-1 text-sm font-medium">
// // // // // //                   {latestHistory.additional_notes || "No notes"}
// // // // // //                 </p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </section>

// // // // // //         {/* =================================================
// // // // // //             CONSULTATION
// // // // // //         ================================================= */}

// // // // // //         <section className="mt-6 rounded-2xl border bg-white p-6">
// // // // // //           {!consultationStarted ? (
// // // // // //             <div className="rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // // //               <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // // //                 <Icon name="mic" size={28} />
// // // // // //               </div>

// // // // // //               <h3 className="mt-5 text-xl font-bold">
// // // // // //                 Ready to start consultation
// // // // // //               </h3>

// // // // // //               <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // // //                 Start the consultation when the patient is with you. The
// // // // // //                 appointment will move to in consultation.
// // // // // //               </p>

// // // // // //               <button
// // // // // //                 type="button"
// // // // // //                 disabled={starting}
// // // // // //                 onClick={handleStartConsultation}
// // // // // //                 className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //               >
// // // // // //                 {starting ? "Starting consultation..." : "Start consultation"}
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <>
// // // // // //               {/* =================================================
// // // // // //                   CONSULTATION INFO
// // // // // //               ================================================= */}

// // // // // //               <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                 <div className="grid gap-5 sm:grid-cols-3">
// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Consultation ID</p>

// // // // // //                     <p className="mt-1 font-semibold">#{consultation.id}</p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Status</p>

// // // // // //                     <p className="mt-1 font-semibold capitalize">
// // // // // //                       {consultation.status?.replaceAll("_", " ")}
// // // // // //                     </p>
// // // // // //                   </div>

// // // // // //                   <div>
// // // // // //                     <p className="text-xs text-slate-400">Started</p>

// // // // // //                     <p className="mt-1 font-semibold">
// // // // // //                       {consultation.started_at
// // // // // //                         ? new Date(consultation.started_at).toLocaleString()
// // // // // //                         : "—"}
// // // // // //                     </p>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               {/* =================================================
// // // // // //                   RECORDING
// // // // // //               ================================================= */}

// // // // // //               <div className="mt-6 rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // // //                 <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // // //                   <Icon name="mic" size={28} />
// // // // // //                 </div>

// // // // // //                 <div className="mt-5 flex justify-center">
// // // // // //                   <Badge
// // // // // //                     tone={
// // // // // //                       isRecording ? "red" : uploadedRecording ? "green" : "blue"
// // // // // //                     }
// // // // // //                   >
// // // // // //                     {isRecording
// // // // // //                       ? isPaused
// // // // // //                         ? "Recording paused"
// // // // // //                         : "Recording"
// // // // // //                       : uploadedRecording
// // // // // //                         ? "Audio saved"
// // // // // //                         : "Ready to record"}
// // // // // //                   </Badge>
// // // // // //                 </div>

// // // // // //                 <h3 className="mt-4 text-xl font-bold">
// // // // // //                   Consultation recording
// // // // // //                 </h3>

// // // // // //                 <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // // //                   Record the doctor and patient conversation. Audio will be
// // // // // //                   stored securely against this consultation.
// // // // // //                 </p>

// // // // // //                 {(isRecording || recordingSeconds > 0) && (
// // // // // //                   <div className="mt-6 text-3xl font-bold tabular-nums">
// // // // // //                     {formatDuration(recordingSeconds)}
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* START */}

// // // // // //                 {!isRecording &&
// // // // // //                   !audioBlob &&
// // // // // //                   !uploadedRecording &&
// // // // // //                   !consultationLocked && (
// // // // // //                     <button
// // // // // //                       type="button"
// // // // // //                       onClick={handleStartRecording}
// // // // // //                       className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
// // // // // //                     >
// // // // // //                       Start recording
// // // // // //                     </button>
// // // // // //                   )}

// // // // // //                 {consultationLocked && (
// // // // // //                   <p className="mt-6 text-sm font-medium text-slate-500">
// // // // // //                     This consultation is completed and cannot be recorded again.
// // // // // //                   </p>
// // // // // //                 )}

// // // // // //                 {/* RECORD CONTROLS */}

// // // // // //                 {isRecording && (
// // // // // //                   <div className="mt-6 flex flex-wrap justify-center gap-3">
// // // // // //                     {!isPaused ? (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handlePauseRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Pause
// // // // // //                       </button>
// // // // // //                     ) : (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         onClick={handleResumeRecording}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // // //                       >
// // // // // //                         Resume
// // // // // //                       </button>
// // // // // //                     )}

// // // // // //                     <button
// // // // // //                       type="button"
// // // // // //                       onClick={handleStopRecording}
// // // // // //                       className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
// // // // // //                     >
// // // // // //                       Stop recording
// // // // // //                     </button>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* =================================================
// // // // // //                     LOCAL PREVIEW
// // // // // //                 ================================================= */}

// // // // // //                 {audioBlob && !uploadedRecording && !isRecording && (
// // // // // //                   <div className="mt-7">
// // // // // //                     <p className="text-sm font-medium">Recording complete</p>

// // // // // //                     <audio
// // // // // //                       controls
// // // // // //                       src={audioUrl}
// // // // // //                       className="mx-auto mt-4 w-full max-w-lg"
// // // // // //                     />

// // // // // //                     <div className="mt-5 flex flex-wrap justify-center gap-3">
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         disabled={uploadingAudio}
// // // // // //                         onClick={handleUploadAudio}
// // // // // //                         className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //                       >
// // // // // //                         {uploadingAudio ? "Saving audio..." : "Save recording"}
// // // // // //                       </button>

// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         disabled={uploadingAudio}
// // // // // //                         onClick={handleRecordAgain}
// // // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //                       >
// // // // // //                         Record again
// // // // // //                       </button>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 {/* =================================================
// // // // // //                     SAVED S3 RECORDING
// // // // // //                 ================================================= */}

// // // // // //                 {uploadedRecording && (
// // // // // //                   <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
// // // // // //                     <div className="flex flex-wrap items-center justify-between gap-3">
// // // // // //                       <div>
// // // // // //                         <p className="font-semibold text-emerald-900">
// // // // // //                           Recording saved
// // // // // //                         </p>

// // // // // //                         <p className="mt-1 text-xs text-emerald-700">
// // // // // //                           Audio recording #{uploadedRecording.id}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <Badge tone="green">Uploaded</Badge>
// // // // // //                     </div>

// // // // // //                     {/* INFORMATION */}

// // // // // //                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">Duration</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {formatDuration(
// // // // // //                             Math.round(
// // // // // //                               Number(
// // // // // //                                 uploadedRecording.duration_seconds ||
// // // // // //                                   recordingSeconds,
// // // // // //                               ),
// // // // // //                             ),
// // // // // //                           )}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">File type</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // // //                           {uploadedRecording.mime_type || "Audio"}
// // // // // //                         </p>
// // // // // //                       </div>

// // // // // //                       <div>
// // // // // //                         <p className="text-xs text-emerald-700">Status</p>

// // // // // //                         <p className="mt-1 text-sm font-semibold capitalize">
// // // // // //                           {uploadedRecording.status || "uploaded"}
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     </div>

// // // // // //                     {/* AUDIO PLAYER */}

// // // // // //                     {uploadedRecording.audio_url && (
// // // // // //                       <audio
// // // // // //                         controls
// // // // // //                         src={uploadedRecording.audio_url}
// // // // // //                         className="mt-5 w-full"
// // // // // //                       />
// // // // // //                     )}

// // // // // //                     {/* =================================================
// // // // // //                         RECORDING ACTIONS
// // // // // //                     ================================================= */}

// // // // // //                     <div className="mt-5 border-t border-emerald-200 pt-5">
// // // // // //                       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
// // // // // //                         {/* TRANSCRIBE */}

// // // // // //                         {!transcript && (
// // // // // //                           <div>
// // // // // //                             <button
// // // // // //                               type="button"
// // // // // //                               disabled={transcribing || deletingRecording}
// // // // // //                               onClick={handleGenerateTranscript}
// // // // // //                               className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //                             >
// // // // // //                               {transcribing
// // // // // //                                 ? "Generating transcript..."
// // // // // //                                 : "Generate transcript"}
// // // // // //                             </button>

// // // // // //                             {transcribing && (
// // // // // //                               <p className="mt-3 text-xs text-slate-500">
// // // // // //                                 Audio is being transcribed. Please keep this
// // // // // //                                 page open.
// // // // // //                               </p>
// // // // // //                             )}
// // // // // //                           </div>
// // // // // //                         )}

// // // // // //                         {/* DELETE */}

// // // // // //                         <button
// // // // // //                           type="button"
// // // // // //                           disabled={deletingRecording || transcribing}
// // // // // //                           onClick={handleDeleteRecording}
// // // // // //                           className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
// // // // // //                         >
// // // // // //                           {deletingRecording
// // // // // //                             ? "Deleting recording..."
// // // // // //                             : "Delete recording"}
// // // // // //                         </button>
// // // // // //                       </div>

// // // // // //                       {transcript && (
// // // // // //                         <p className="mt-3 text-xs text-red-600">
// // // // // //                           Deleting this recording will also remove its generated
// // // // // //                           transcript.
// // // // // //                         </p>
// // // // // //                       )}
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 )}
// // // // // //               </div>

// // // // // //               {/* =================================================
// // // // // //                   TRANSCRIPT
// // // // // //               ================================================= */}

// // // // // //               {transcript && (
// // // // // //                 <section className="mt-6 overflow-hidden rounded-2xl border">
// // // // // //                   <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
// // // // // //                     <div>
// // // // // //                       <h3 className="font-semibold">AI transcript</h3>

// // // // // //                       <p className="mt-1 text-xs text-slate-500">
// // // // // //                         Generated from consultation recording
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <Badge tone="green">Transcript ready</Badge>
// // // // // //                   </div>

// // // // // //                   <div className="p-5">
// // // // // //                     <div className="rounded-xl bg-slate-50 p-5">
// // // // // //                       <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // // // // //                         {transcript.edited_text ||
// // // // // //                           transcript.full_text ||
// // // // // //                           "Transcript is empty."}
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
// // // // // //                       <span>Transcript #{transcript.id}</span>

// // // // // //                       {transcript.word_count !== null &&
// // // // // //                         transcript.word_count !== undefined && (
// // // // // //                           <span>{transcript.word_count} words</span>
// // // // // //                         )}

// // // // // //                       <span className="capitalize">
// // // // // //                         Status: {transcript.status}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </section>
// // // // // //               )}
// // // // // //             </>
// // // // // //           )}

// // // // // //           {/* =================================================
// // // // // //               PROCESS STEPS
// // // // // //           ================================================= */}

// // // // // //           <div className="mt-6 grid gap-3 md:grid-cols-3">
// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">01</div>

// // // // // //               <div className="mt-2 font-semibold">Patient history</div>

// // // // // //               <div className="mt-1 text-xs text-emerald-600">Available</div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">02</div>

// // // // // //               <div className="mt-2 font-semibold">Audio recording</div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   uploadedRecording ? "text-emerald-600" : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {uploadedRecording
// // // // // //                   ? "Recording saved"
// // // // // //                   : consultationStarted
// // // // // //                     ? "Ready"
// // // // // //                     : "Start consultation first"}
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // // //               <div className="text-xs text-slate-400">03</div>

// // // // // //               <div className="mt-2 font-semibold">AI transcript</div>

// // // // // //               <div
// // // // // //                 className={`mt-1 text-xs ${
// // // // // //                   transcript
// // // // // //                     ? "text-emerald-600"
// // // // // //                     : transcribing
// // // // // //                       ? "text-blue-600"
// // // // // //                       : "text-slate-500"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 {transcript
// // // // // //                   ? "Transcript ready"
// // // // // //                   : transcribing
// // // // // //                     ? "Processing..."
// // // // // //                     : uploadedRecording
// // // // // //                       ? "Ready to generate"
// // // // // //                       : "Available after recording"}
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </section>

// // // // // //         {/* =================================================
// // // // // //             BACK
// // // // // //         ================================================= */}

// // // // // //         <div className="mt-6">
// // // // // //           <Link
// // // // // //             href="/doctor"
// // // // // //             className="text-sm font-medium text-slate-600 hover:text-slate-950"
// // // // // //           >
// // // // // //             ← Back to dashboard
// // // // // //           </Link>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </Shell>
// // // // // //   );
// // // // // // }

// // // // // "use client";

// // // // // import { Suspense, useEffect, useRef, useState } from "react";
// // // // // import { useRouter, useSearchParams } from "next/navigation";
// // // // // import Link from "next/link";

// // // // // import Shell from "@/components/Shell";
// // // // // import Icon from "@/components/Icon";
// // // // // import Badge from "@/components/Badge";

// // // // // // ======================================================
// // // // // // TRANSCRIPTION LANGUAGES
// // // // // // ======================================================

// // // // // const TRANSCRIPTION_LANGUAGES = [
// // // // //   {
// // // // //     value: "auto",
// // // // //     label: "Auto detect",
// // // // //     instruction:
// // // // //       "Transcribe the complete conversation in the same language and script in which it was spoken. Do not translate it.",
// // // // //   },

// // // // //   {
// // // // //     value: "en",
// // // // //     label: "English",
// // // // //     instruction:
// // // // //       "Return the complete transcript in English. If another language is spoken, accurately translate the spoken meaning into natural English while preserving medical terminology.",
// // // // //   },

// // // // //   {
// // // // //     value: "ur",
// // // // //     label: "Urdu",
// // // // //     instruction:
// // // // //       "Return the complete transcript in Urdu script. If another language is spoken, accurately translate the spoken meaning into Urdu while preserving medical terminology.",
// // // // //   },

// // // // //   {
// // // // //     value: "roman-ur",
// // // // //     label: "Roman Urdu",
// // // // //     instruction:
// // // // //       "Return the complete transcript in Roman Urdu using English letters. Do not use Urdu script. Preserve English medical terms, medicine names and technical terms where appropriate.",
// // // // //   },

// // // // //   {
// // // // //     value: "hi",
// // // // //     label: "Hindi",
// // // // //     instruction:
// // // // //       "Return the complete transcript in Hindi using Devanagari script. Preserve medicine names and medical terminology accurately.",
// // // // //   },

// // // // //   {
// // // // //     value: "ar",
// // // // //     label: "Arabic",
// // // // //     instruction:
// // // // //       "Return the complete transcript in Arabic. Preserve medicine names and medical terminology accurately.",
// // // // //   },

// // // // //   {
// // // // //     value: "pa",
// // // // //     label: "Punjabi",
// // // // //     instruction:
// // // // //       "Return the complete transcript in Punjabi. Preserve medicine names and medical terminology accurately.",
// // // // //   },
// // // // // ];

// // // // // // ======================================================
// // // // // // OUTER PAGE
// // // // // // ======================================================

// // // // // export default function NewConsultationPage() {
// // // // //   return (
// // // // //     <Suspense fallback={<ConsultationLoading />}>
// // // // //       <NewConsultationContent />
// // // // //     </Suspense>
// // // // //   );
// // // // // }

// // // // // // ======================================================
// // // // // // LOADING
// // // // // // ======================================================

// // // // // function ConsultationLoading() {
// // // // //   return (
// // // // //     <Shell
// // // // //       role="doctor"
// // // // //       title="New consultation"
// // // // //       subtitle="Loading consultation"
// // // // //     >
// // // // //       <div className="max-w-5xl">
// // // // //         <div className="rounded-2xl border bg-white px-6 py-20 text-center">
// // // // //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

// // // // //           <p className="mt-4 text-sm text-slate-500">Loading consultation...</p>
// // // // //         </div>
// // // // //       </div>
// // // // //     </Shell>
// // // // //   );
// // // // // }

// // // // // // ======================================================
// // // // // // MAIN
// // // // // // ======================================================

// // // // // function NewConsultationContent() {
// // // // //   const router = useRouter();
// // // // //   const searchParams = useSearchParams();

// // // // //   const appointmentId = searchParams.get("appointment");

// // // // //   // ======================================================
// // // // //   // DATA
// // // // //   // ======================================================

// // // // //   const [appointment, setAppointment] = useState(null);
// // // // //   const [patient, setPatient] = useState(null);
// // // // //   const [medicalHistory, setMedicalHistory] = useState([]);
// // // // //   const [consultation, setConsultation] = useState(null);

// // // // //   // ======================================================
// // // // //   // PAGE STATE
// // // // //   // ======================================================

// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [starting, setStarting] = useState(false);

// // // // //   const [error, setError] = useState("");
// // // // //   const [success, setSuccess] = useState("");

// // // // //   // ======================================================
// // // // //   // RECORDING STATE
// // // // //   // ======================================================

// // // // //   const [isRecording, setIsRecording] = useState(false);
// // // // //   const [isPaused, setIsPaused] = useState(false);

// // // // //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// // // // //   const [audioBlob, setAudioBlob] = useState(null);
// // // // //   const [audioUrl, setAudioUrl] = useState("");

// // // // //   const [uploadingAudio, setUploadingAudio] = useState(false);
// // // // //   const [deletingRecording, setDeletingRecording] = useState(false);

// // // // //   const [uploadedRecording, setUploadedRecording] = useState(null);

// // // // //   // ======================================================
// // // // //   // TRANSCRIPTION
// // // // //   // ======================================================

// // // // //   const [transcribing, setTranscribing] = useState(false);

// // // // //   const [selectedLanguage, setSelectedLanguage] = useState("auto");

// // // // //   const [transcript, setTranscript] = useState(null);

// // // // //   // ======================================================
// // // // //   // REFS
// // // // //   // ======================================================

// // // // //   const recorderRef = useRef(null);
// // // // //   const streamRef = useRef(null);
// // // // //   const timerRef = useRef(null);
// // // // //   const chunksRef = useRef([]);

// // // // //   // ======================================================
// // // // //   // SAFE API RESPONSE
// // // // //   // ======================================================

// // // // //   async function getResponseData(response) {
// // // // //     const contentType = response.headers.get("content-type") || "";

// // // // //     if (contentType.includes("application/json")) {
// // // // //       return await response.json();
// // // // //     }

// // // // //     const text = await response.text();

// // // // //     throw new Error(
// // // // //       text
// // // // //         ? `Server returned an invalid response (${response.status}).`
// // // // //         : "Server returned an invalid response.",
// // // // //     );
// // // // //   }

// // // // //   // ======================================================
// // // // //   // LOAD CONSULTATION
// // // // //   // ======================================================

// // // // //   async function loadConsultationData() {
// // // // //     if (!appointmentId) {
// // // // //       setError("Appointment ID is missing.");
// // // // //       setLoading(false);
// // // // //       return;
// // // // //     }

// // // // //     const numericAppointmentId = Number(appointmentId);

// // // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // // //       setError("Invalid appointment ID.");
// // // // //       setLoading(false);
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setLoading(true);
// // // // //       setError("");

// // // // //       const response = await fetch(
// // // // //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// // // // //           numericAppointmentId,
// // // // //         )}`,
// // // // //         {
// // // // //           method: "GET",
// // // // //           credentials: "include",
// // // // //           cache: "no-store",
// // // // //         },
// // // // //       );

// // // // //       const data = await getResponseData(response);

// // // // //       console.log("LOAD CONSULTATION RESPONSE:", {
// // // // //         status: response.status,
// // // // //         data,
// // // // //       });

// // // // //       if (response.status === 401) {
// // // // //         router.replace("/login");
// // // // //         return;
// // // // //       }

// // // // //       if (response.status === 403) {
// // // // //         router.replace("/unauthorized");
// // // // //         return;
// // // // //       }

// // // // //       if (!response.ok) {
// // // // //         setError(data.message || "Unable to load consultation information.");
// // // // //         return;
// // // // //       }

// // // // //       setAppointment(data.appointment || null);

// // // // //       setPatient(data.patient || null);

// // // // //       setMedicalHistory(
// // // // //         Array.isArray(data.medical_history) ? data.medical_history : [],
// // // // //       );

// // // // //       setConsultation(data.consultation || null);

// // // // //       if (data.audio_recording) {
// // // // //         setUploadedRecording(data.audio_recording);
// // // // //       } else {
// // // // //         setUploadedRecording(null);
// // // // //       }

// // // // //       if (data.transcript) {
// // // // //         setTranscript(data.transcript);

// // // // //         if (
// // // // //           typeof data.transcript.language === "string" &&
// // // // //           TRANSCRIPTION_LANGUAGES.some(
// // // // //             (item) => item.value === data.transcript.language,
// // // // //           )
// // // // //         ) {
// // // // //           setSelectedLanguage(data.transcript.language);
// // // // //         }
// // // // //       } else {
// // // // //         setTranscript(null);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.error("LOAD CONSULTATION ERROR:", error);

// // // // //       setError(error?.message || "Unable to connect to the server.");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   }

// // // // //   useEffect(() => {
// // // // //     loadConsultationData();
// // // // //   }, [appointmentId]);

// // // // //   // ======================================================
// // // // //   // START CONSULTATION
// // // // //   // ======================================================

// // // // //   async function handleStartConsultation() {
// // // // //     if (!appointmentId) {
// // // // //       setError("Appointment ID is missing.");
// // // // //       return;
// // // // //     }

// // // // //     const numericAppointmentId = Number(appointmentId);

// // // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // // //       setError("Invalid appointment ID.");
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setStarting(true);

// // // // //       setError("");
// // // // //       setSuccess("");

// // // // //       console.log("START CONSULTATION REQUEST:", {
// // // // //         appointment_id: numericAppointmentId,
// // // // //       });

// // // // //       const response = await fetch("/api/doctors/consultations/start", {
// // // // //         method: "POST",

// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //         },

// // // // //         credentials: "include",

// // // // //         cache: "no-store",

// // // // //         body: JSON.stringify({
// // // // //           appointment_id: numericAppointmentId,
// // // // //         }),
// // // // //       });

// // // // //       const data = await getResponseData(response);

// // // // //       console.log("START CONSULTATION RESPONSE:", {
// // // // //         status: response.status,
// // // // //         data,
// // // // //       });

// // // // //       if (response.status === 401) {
// // // // //         router.replace("/login");
// // // // //         return;
// // // // //       }

// // // // //       if (response.status === 403) {
// // // // //         router.replace("/unauthorized");
// // // // //         return;
// // // // //       }

// // // // //       if (!response.ok) {
// // // // //         setError(
// // // // //           data.message || `Unable to start consultation (${response.status}).`,
// // // // //         );

// // // // //         return;
// // // // //       }

// // // // //       if (!data.consultation?.id) {
// // // // //         setError(
// // // // //           "Consultation started but server did not return consultation information.",
// // // // //         );

// // // // //         return;
// // // // //       }

// // // // //       setConsultation(data.consultation);

// // // // //       if (data.appointment) {
// // // // //         setAppointment(data.appointment);
// // // // //       } else {
// // // // //         setAppointment((previous) =>
// // // // //           previous
// // // // //             ? {
// // // // //                 ...previous,

// // // // //                 status:
// // // // //                   previous.status === "completed"
// // // // //                     ? previous.status
// // // // //                     : "in_consultation",
// // // // //               }
// // // // //             : previous,
// // // // //         );
// // // // //       }

// // // // //       if (data.audio_recording) {
// // // // //         setUploadedRecording(data.audio_recording);
// // // // //       }

// // // // //       if (data.transcript) {
// // // // //         setTranscript(data.transcript);

// // // // //         if (
// // // // //           typeof data.transcript.language === "string" &&
// // // // //           TRANSCRIPTION_LANGUAGES.some(
// // // // //             (item) => item.value === data.transcript.language,
// // // // //           )
// // // // //         ) {
// // // // //           setSelectedLanguage(data.transcript.language);
// // // // //         }
// // // // //       }

// // // // //       setSuccess(data.message || "Consultation started successfully.");
// // // // //     } catch (error) {
// // // // //       console.error("START CONSULTATION ERROR:", error);

// // // // //       setError(error?.message || "Unable to connect to the server.");
// // // // //     } finally {
// // // // //       setStarting(false);
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // TIMER
// // // // //   // ======================================================

// // // // //   function stopTimer() {
// // // // //     if (timerRef.current) {
// // // // //       clearInterval(timerRef.current);

// // // // //       timerRef.current = null;
// // // // //     }
// // // // //   }

// // // // //   function startTimer() {
// // // // //     stopTimer();

// // // // //     timerRef.current = setInterval(() => {
// // // // //       setRecordingSeconds((previous) => previous + 1);
// // // // //     }, 1000);
// // // // //   }

// // // // //   function formatDuration(totalSeconds) {
// // // // //     const safeSeconds = Number(totalSeconds) || 0;

// // // // //     const minutes = Math.floor(safeSeconds / 60);

// // // // //     const seconds = Math.floor(safeSeconds % 60);

// // // // //     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
// // // // //       2,
// // // // //       "0",
// // // // //     )}`;
// // // // //   }

// // // // //   // ======================================================
// // // // //   // MICROPHONE
// // // // //   // ======================================================

// // // // //   function stopMicrophoneStream() {
// // // // //     if (!streamRef.current) {
// // // // //       return;
// // // // //     }

// // // // //     streamRef.current.getTracks().forEach((track) => {
// // // // //       track.stop();
// // // // //     });

// // // // //     streamRef.current = null;
// // // // //   }

// // // // //   // ======================================================
// // // // //   // START RECORDING
// // // // //   // ======================================================

// // // // //   async function handleStartRecording() {
// // // // //     try {
// // // // //       setError("");
// // // // //       setSuccess("");

// // // // //       if (!consultation?.id) {
// // // // //         setError("Start the consultation before recording.");
// // // // //         return;
// // // // //       }

// // // // //       if (
// // // // //         typeof window === "undefined" ||
// // // // //         !navigator.mediaDevices ||
// // // // //         !navigator.mediaDevices.getUserMedia ||
// // // // //         typeof MediaRecorder === "undefined"
// // // // //       ) {
// // // // //         setError("Microphone recording is not supported in this browser.");
// // // // //         return;
// // // // //       }

// // // // //       const stream = await navigator.mediaDevices.getUserMedia({
// // // // //         audio: true,
// // // // //       });

// // // // //       streamRef.current = stream;

// // // // //       let mimeType = "";

// // // // //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// // // // //         mimeType = "audio/webm;codecs=opus";
// // // // //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// // // // //         mimeType = "audio/webm";
// // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
// // // // //         mimeType = "audio/ogg;codecs=opus";
// // // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
// // // // //         mimeType = "audio/ogg";
// // // // //       }

// // // // //       const recorder = mimeType
// // // // //         ? new MediaRecorder(stream, {
// // // // //             mimeType,
// // // // //           })
// // // // //         : new MediaRecorder(stream);

// // // // //       recorderRef.current = recorder;

// // // // //       chunksRef.current = [];

// // // // //       if (audioUrl) {
// // // // //         URL.revokeObjectURL(audioUrl);
// // // // //       }

// // // // //       setAudioBlob(null);
// // // // //       setAudioUrl("");

// // // // //       setUploadedRecording(null);
// // // // //       setTranscript(null);

// // // // //       setRecordingSeconds(0);
// // // // //       setIsPaused(false);

// // // // //       setSelectedLanguage("auto");

// // // // //       recorder.ondataavailable = (event) => {
// // // // //         if (event.data && event.data.size > 0) {
// // // // //           chunksRef.current.push(event.data);
// // // // //         }
// // // // //       };

// // // // //       recorder.onstop = () => {
// // // // //         const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

// // // // //         const blob = new Blob(chunksRef.current, {
// // // // //           type: finalMimeType,
// // // // //         });

// // // // //         if (blob.size <= 0) {
// // // // //           setError("Recording is empty. Please record again.");

// // // // //           setIsRecording(false);
// // // // //           setIsPaused(false);

// // // // //           stopTimer();

// // // // //           stopMicrophoneStream();

// // // // //           recorderRef.current = null;

// // // // //           return;
// // // // //         }

// // // // //         const previewUrl = URL.createObjectURL(blob);

// // // // //         setAudioBlob(blob);

// // // // //         setAudioUrl(previewUrl);

// // // // //         setIsRecording(false);
// // // // //         setIsPaused(false);

// // // // //         stopTimer();

// // // // //         stopMicrophoneStream();

// // // // //         recorderRef.current = null;
// // // // //       };

// // // // //       recorder.onerror = (event) => {
// // // // //         console.error("MEDIA RECORDER ERROR:", event.error);

// // // // //         setError("An error occurred while recording.");

// // // // //         setIsRecording(false);
// // // // //         setIsPaused(false);

// // // // //         stopTimer();

// // // // //         stopMicrophoneStream();

// // // // //         recorderRef.current = null;
// // // // //       };

// // // // //       recorder.start(1000);

// // // // //       setIsRecording(true);

// // // // //       setIsPaused(false);

// // // // //       startTimer();
// // // // //     } catch (error) {
// // // // //       console.error("START RECORDING ERROR:", error);

// // // // //       stopMicrophoneStream();

// // // // //       if (error?.name === "NotAllowedError") {
// // // // //         setError(
// // // // //           "Microphone permission was denied. Please allow microphone access.",
// // // // //         );
// // // // //       } else if (error?.name === "NotFoundError") {
// // // // //         setError("No microphone was found on this device.");
// // // // //       } else {
// // // // //         setError(error?.message || "Unable to start microphone recording.");
// // // // //       }
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // PAUSE
// // // // //   // ======================================================

// // // // //   function handlePauseRecording() {
// // // // //     const recorder = recorderRef.current;

// // // // //     if (recorder && recorder.state === "recording") {
// // // // //       recorder.pause();

// // // // //       setIsPaused(true);

// // // // //       stopTimer();
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // RESUME
// // // // //   // ======================================================

// // // // //   function handleResumeRecording() {
// // // // //     const recorder = recorderRef.current;

// // // // //     if (recorder && recorder.state === "paused") {
// // // // //       recorder.resume();

// // // // //       setIsPaused(false);

// // // // //       startTimer();
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // STOP
// // // // //   // ======================================================

// // // // //   function handleStopRecording() {
// // // // //     const recorder = recorderRef.current;

// // // // //     if (
// // // // //       recorder &&
// // // // //       (recorder.state === "recording" || recorder.state === "paused")
// // // // //     ) {
// // // // //       recorder.stop();
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // RECORD AGAIN
// // // // //   // ======================================================

// // // // //   function handleRecordAgain() {
// // // // //     if (audioUrl) {
// // // // //       URL.revokeObjectURL(audioUrl);
// // // // //     }

// // // // //     setAudioBlob(null);
// // // // //     setAudioUrl("");

// // // // //     setRecordingSeconds(0);

// // // // //     setUploadedRecording(null);
// // // // //     setTranscript(null);

// // // // //     setSelectedLanguage("auto");

// // // // //     setError("");
// // // // //     setSuccess("");
// // // // //   }

// // // // //   // ======================================================
// // // // //   // UPLOAD AUDIO
// // // // //   // ======================================================

// // // // //   async function handleUploadAudio() {
// // // // //     if (!audioBlob) {
// // // // //       setError("Record audio before saving.");
// // // // //       return;
// // // // //     }

// // // // //     if (!consultation?.id) {
// // // // //       setError("Consultation ID is missing.");
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setUploadingAudio(true);

// // // // //       setError("");
// // // // //       setSuccess("");

// // // // //       let extension = "webm";

// // // // //       const blobType = audioBlob.type || "audio/webm";

// // // // //       if (blobType.includes("ogg")) {
// // // // //         extension = "ogg";
// // // // //       } else if (blobType.includes("mp4")) {
// // // // //         extension = "mp4";
// // // // //       } else if (blobType.includes("mpeg")) {
// // // // //         extension = "mp3";
// // // // //       } else if (blobType.includes("wav")) {
// // // // //         extension = "wav";
// // // // //       } else if (blobType.includes("m4a")) {
// // // // //         extension = "m4a";
// // // // //       }

// // // // //       const file = new File(
// // // // //         [audioBlob],

// // // // //         `consultation-${consultation.id}.${extension}`,

// // // // //         {
// // // // //           type: blobType,
// // // // //         },
// // // // //       );

// // // // //       const formData = new FormData();

// // // // //       formData.append("consultation_id", String(consultation.id));

// // // // //       formData.append("duration_seconds", String(recordingSeconds));

// // // // //       formData.append("audio", file);

// // // // //       console.log("AUDIO UPLOAD REQUEST:", {
// // // // //         consultationId: consultation.id,

// // // // //         appointmentId,

// // // // //         fileName: file.name,

// // // // //         fileSize: file.size,

// // // // //         mimeType: file.type,

// // // // //         duration: recordingSeconds,
// // // // //       });

// // // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // // //         method: "POST",

// // // // //         credentials: "include",

// // // // //         cache: "no-store",

// // // // //         body: formData,
// // // // //       });

// // // // //       const data = await getResponseData(response);

// // // // //       console.log("AUDIO UPLOAD RESPONSE:", {
// // // // //         status: response.status,
// // // // //         data,
// // // // //       });

// // // // //       if (response.status === 401) {
// // // // //         router.replace("/login");
// // // // //         return;
// // // // //       }

// // // // //       if (response.status === 403) {
// // // // //         router.replace("/unauthorized");
// // // // //         return;
// // // // //       }

// // // // //       if (!response.ok) {
// // // // //         setError(
// // // // //           data.message ||
// // // // //             `Unable to save audio recording (${response.status}).`,
// // // // //         );

// // // // //         return;
// // // // //       }

// // // // //       if (!data.audio_recording?.id) {
// // // // //         setError(
// // // // //           "Audio uploaded but server did not return recording information.",
// // // // //         );

// // // // //         return;
// // // // //       }

// // // // //       setUploadedRecording(data.audio_recording);

// // // // //       setSelectedLanguage("auto");

// // // // //       if (data.consultation) {
// // // // //         setConsultation((previous) => ({
// // // // //           ...(previous || {}),
// // // // //           ...data.consultation,
// // // // //         }));
// // // // //       } else {
// // // // //         setConsultation((previous) =>
// // // // //           previous
// // // // //             ? {
// // // // //                 ...previous,
// // // // //                 status: "recorded",
// // // // //               }
// // // // //             : previous,
// // // // //         );
// // // // //       }

// // // // //       setSuccess(data.message || "Audio recording saved successfully.");
// // // // //     } catch (error) {
// // // // //       console.error("UPLOAD AUDIO ERROR:", error);

// // // // //       setError(error?.message || "Unable to upload audio recording.");
// // // // //     } finally {
// // // // //       setUploadingAudio(false);
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // DELETE SAVED RECORDING
// // // // //   // ======================================================

// // // // //   async function handleDeleteRecording() {
// // // // //     if (!consultation?.id) {
// // // // //       setError("Consultation ID is missing.");
// // // // //       return;
// // // // //     }

// // // // //     if (!uploadedRecording?.id) {
// // // // //       setError("Audio recording ID is missing.");
// // // // //       return;
// // // // //     }

// // // // //     const hasTranscript = Boolean(transcript?.id);

// // // // //     const confirmationMessage = hasTranscript
// // // // //       ? "Delete this recording? The generated transcript for this recording will also be removed. This action cannot be undone."
// // // // //       : "Delete this recording? The audio will be removed permanently and cannot be recovered.";

// // // // //     const confirmed = window.confirm(confirmationMessage);

// // // // //     if (!confirmed) {
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       setDeletingRecording(true);

// // // // //       setError("");
// // // // //       setSuccess("");

// // // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // // //         method: "DELETE",

// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //         },

// // // // //         credentials: "include",

// // // // //         cache: "no-store",

// // // // //         body: JSON.stringify({
// // // // //           consultation_id: consultation.id,

// // // // //           audio_recording_id: uploadedRecording.id,
// // // // //         }),
// // // // //       });

// // // // //       const data = await getResponseData(response);

// // // // //       console.log("DELETE AUDIO RESPONSE:", {
// // // // //         status: response.status,
// // // // //         data,
// // // // //       });

// // // // //       if (response.status === 401) {
// // // // //         router.replace("/login");
// // // // //         return;
// // // // //       }

// // // // //       if (response.status === 403) {
// // // // //         router.replace("/unauthorized");
// // // // //         return;
// // // // //       }

// // // // //       if (!response.ok) {
// // // // //         setError(
// // // // //           data.message || `Unable to delete recording (${response.status}).`,
// // // // //         );

// // // // //         return;
// // // // //       }

// // // // //       if (audioUrl) {
// // // // //         URL.revokeObjectURL(audioUrl);
// // // // //       }

// // // // //       setAudioBlob(null);
// // // // //       setAudioUrl("");

// // // // //       setRecordingSeconds(0);

// // // // //       setTranscript(null);

// // // // //       setSelectedLanguage("auto");

// // // // //       setUploadedRecording(data.remaining_audio_recording || null);

// // // // //       if (data.consultation) {
// // // // //         setConsultation((previous) => ({
// // // // //           ...(previous || {}),
// // // // //           ...data.consultation,
// // // // //         }));
// // // // //       } else {
// // // // //         setConsultation((previous) =>
// // // // //           previous
// // // // //             ? {
// // // // //                 ...previous,

// // // // //                 status: data.remaining_audio_recording ? "recorded" : "draft",
// // // // //               }
// // // // //             : previous,
// // // // //         );
// // // // //       }

// // // // //       setSuccess(
// // // // //         data.message || "Recording deleted successfully. You can record again.",
// // // // //       );
// // // // //     } catch (error) {
// // // // //       console.error("DELETE RECORDING ERROR:", error);

// // // // //       setError(error?.message || "Unable to delete recording.");
// // // // //     } finally {
// // // // //       setDeletingRecording(false);
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // GENERATE TRANSCRIPT
// // // // //   // ======================================================

// // // // //   async function handleGenerateTranscript() {
// // // // //     if (!consultation?.id) {
// // // // //       setError("Consultation ID is missing.");
// // // // //       return;
// // // // //     }

// // // // //     if (!uploadedRecording?.id) {
// // // // //       setError("Please save the audio recording first.");
// // // // //       return;
// // // // //     }

// // // // //     if (!uploadedRecording?.audio_url) {
// // // // //       setError(
// // // // //         "Audio URL is missing. Please reload the consultation or save the recording again.",
// // // // //       );

// // // // //       return;
// // // // //     }

// // // // //     if (
// // // // //       typeof window === "undefined" ||
// // // // //       !window.puter ||
// // // // //       !window.puter.ai ||
// // // // //       typeof window.puter.ai.speech2txt !== "function"
// // // // //     ) {
// // // // //       setError(
// // // // //         "Speech-to-text service is not available yet. Please try again.",
// // // // //       );

// // // // //       return;
// // // // //     }

// // // // //     const selectedLanguageConfig =
// // // // //       TRANSCRIPTION_LANGUAGES.find((item) => item.value === selectedLanguage) ||
// // // // //       TRANSCRIPTION_LANGUAGES[0];

// // // // //     try {
// // // // //       setTranscribing(true);

// // // // //       setError("");
// // // // //       setSuccess("");

// // // // //       // ==================================================
// // // // //       // FETCH SAVED S3 AUDIO
// // // // //       // ==================================================

// // // // //       const audioResponse = await fetch(uploadedRecording.audio_url, {
// // // // //         method: "GET",
// // // // //         cache: "no-store",
// // // // //       });

// // // // //       if (!audioResponse.ok) {
// // // // //         throw new Error(
// // // // //           `Unable to load saved audio (${audioResponse.status}).`,
// // // // //         );
// // // // //       }

// // // // //       const fetchedBlob = await audioResponse.blob();

// // // // //       console.log("S3 AUDIO FOR TRANSCRIPTION:", {
// // // // //         size: fetchedBlob.size,
// // // // //         type: fetchedBlob.type,

// // // // //         recordingId: uploadedRecording.id,

// // // // //         storageKey: uploadedRecording.storage_key,

// // // // //         selectedLanguage,

// // // // //         selectedLanguageLabel: selectedLanguageConfig.label,
// // // // //       });

// // // // //       if (!fetchedBlob.size || fetchedBlob.size <= 0) {
// // // // //         throw new Error("Saved audio file is empty.");
// // // // //       }

// // // // //       if (fetchedBlob.size < 1000) {
// // // // //         throw new Error("Saved audio recording is too small to transcribe.");
// // // // //       }

// // // // //       // ==================================================
// // // // //       // MIME TYPE
// // // // //       // ==================================================

// // // // //       const rawMimeType =
// // // // //         uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

// // // // //       const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

// // // // //       let extension = "webm";

// // // // //       if (mimeType.includes("ogg")) {
// // // // //         extension = "ogg";
// // // // //       } else if (mimeType.includes("mp4")) {
// // // // //         extension = "mp4";
// // // // //       } else if (mimeType.includes("mpeg")) {
// // // // //         extension = "mp3";
// // // // //       } else if (mimeType.includes("wav")) {
// // // // //         extension = "wav";
// // // // //       } else if (mimeType.includes("m4a")) {
// // // // //         extension = "m4a";
// // // // //       }

// // // // //       // ==================================================
// // // // //       // CREATE AUDIO FILE
// // // // //       // ==================================================

// // // // //       const transcriptionFile = new File(
// // // // //         [fetchedBlob],

// // // // //         `consultation-${consultation.id}.${extension}`,

// // // // //         {
// // // // //           type: mimeType,
// // // // //         },
// // // // //       );

// // // // //       console.log("PUTER TRANSCRIPTION FILE:", {
// // // // //         name: transcriptionFile.name,

// // // // //         size: transcriptionFile.size,

// // // // //         type: transcriptionFile.type,
// // // // //       });

// // // // //       // ==================================================
// // // // //       // TRANSCRIPTION PROMPT
// // // // //       // ==================================================

// // // // //       const transcriptionPrompt = `
// // // // // This is a medical consultation between a doctor and a patient.

// // // // // Transcribe the COMPLETE audio from beginning to end.

// // // // // Important requirements:

// // // // // - Do not summarize.
// // // // // - Do not shorten the conversation.
// // // // // - Do not omit spoken sentences.
// // // // // - Do not invent information.
// // // // // - Preserve symptoms, diagnoses, medicine names, dosages, numbers and medical terminology accurately.
// // // // // - Preserve the meaning of everything spoken.
// // // // // - Include all meaningful spoken content from both doctor and patient.

// // // // // OUTPUT LANGUAGE:
// // // // // ${selectedLanguageConfig.instruction}
// // // // //       `.trim();

// // // // //       // ==================================================
// // // // //       // PUTER TRANSCRIPTION
// // // // //       // ==================================================

// // // // //       const puterResult = await window.puter.ai.speech2txt(transcriptionFile, {
// // // // //         model: "gpt-4o-transcribe",

// // // // //         response_format: "json",

// // // // //         prompt: transcriptionPrompt,
// // // // //       });

// // // // //       console.log("PUTER RAW RESULT:", puterResult);

// // // // //       // ==================================================
// // // // //       // EXTRACT TEXT
// // // // //       // ==================================================

// // // // //       let transcriptText = "";

// // // // //       if (typeof puterResult === "string") {
// // // // //         transcriptText = puterResult.trim();
// // // // //       } else if (puterResult && typeof puterResult.text === "string") {
// // // // //         transcriptText = puterResult.text.trim();
// // // // //       } else if (puterResult && typeof puterResult.transcript === "string") {
// // // // //         transcriptText = puterResult.transcript.trim();
// // // // //       } else if (
// // // // //         puterResult?.result &&
// // // // //         typeof puterResult.result.text === "string"
// // // // //       ) {
// // // // //         transcriptText = puterResult.result.text.trim();
// // // // //       }

// // // // //       console.log("FINAL PUTER TRANSCRIPT:", {
// // // // //         language: selectedLanguage,

// // // // //         text: transcriptText,
// // // // //       });

// // // // //       if (!transcriptText) {
// // // // //         throw new Error("Speech-to-text service returned an empty transcript.");
// // // // //       }

// // // // //       // ==================================================
// // // // //       // SAVE TRANSCRIPT
// // // // //       // ==================================================

// // // // //       const response = await fetch("/api/doctors/consultations/transcribe", {
// // // // //         method: "POST",

// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //         },

// // // // //         credentials: "include",

// // // // //         cache: "no-store",

// // // // //         body: JSON.stringify({
// // // // //           consultation_id: consultation.id,

// // // // //           audio_recording_id: uploadedRecording.id,

// // // // //           transcript_text: transcriptText,

// // // // //           provider: "puter",

// // // // //           model: "gpt-4o-transcribe",

// // // // //           language: selectedLanguage,
// // // // //         }),
// // // // //       });

// // // // //       const data = await getResponseData(response);

// // // // //       console.log("TRANSCRIPT SAVE RESPONSE:", {
// // // // //         status: response.status,
// // // // //         data,
// // // // //       });

// // // // //       if (response.status === 401) {
// // // // //         router.replace("/login");
// // // // //         return;
// // // // //       }

// // // // //       if (response.status === 403) {
// // // // //         router.replace("/unauthorized");
// // // // //         return;
// // // // //       }

// // // // //       if (!response.ok) {
// // // // //         setError(
// // // // //           data.message || "Transcript was generated but could not be saved.",
// // // // //         );

// // // // //         return;
// // // // //       }

// // // // //       setTranscript(data.transcript || null);

// // // // //       setUploadedRecording((previous) =>
// // // // //         previous
// // // // //           ? {
// // // // //               ...previous,
// // // // //               status: "completed",
// // // // //             }
// // // // //           : previous,
// // // // //       );

// // // // //       setConsultation((previous) =>
// // // // //         previous
// // // // //           ? {
// // // // //               ...previous,
// // // // //               status: "transcribed",
// // // // //             }
// // // // //           : previous,
// // // // //       );

// // // // //       setSuccess(
// // // // //         data.message ||
// // // // //           `Transcript generated successfully in ${selectedLanguageConfig.label}.`,
// // // // //       );
// // // // //     } catch (error) {
// // // // //       console.error("GENERATE TRANSCRIPT ERROR:", error);

// // // // //       setError(error?.message || "Unable to generate transcript.");
// // // // //     } finally {
// // // // //       setTranscribing(false);
// // // // //     }
// // // // //   }

// // // // //   // ======================================================
// // // // //   // CLEANUP
// // // // //   // ======================================================

// // // // //   useEffect(() => {
// // // // //     return () => {
// // // // //       stopTimer();

// // // // //       if (recorderRef.current && recorderRef.current.state !== "inactive") {
// // // // //         try {
// // // // //           recorderRef.current.stop();
// // // // //         } catch {}
// // // // //       }

// // // // //       stopMicrophoneStream();
// // // // //     };
// // // // //   }, []);

// // // // //   useEffect(() => {
// // // // //     return () => {
// // // // //       if (audioUrl) {
// // // // //         URL.revokeObjectURL(audioUrl);
// // // // //       }
// // // // //     };
// // // // //   }, [audioUrl]);

// // // // //   // ======================================================
// // // // //   // HELPERS
// // // // //   // ======================================================

// // // // //   function calculateAge(dateOfBirth) {
// // // // //     if (!dateOfBirth) {
// // // // //       return null;
// // // // //     }

// // // // //     const birthDate = new Date(dateOfBirth);

// // // // //     const today = new Date();

// // // // //     let age = today.getFullYear() - birthDate.getFullYear();

// // // // //     const monthDifference = today.getMonth() - birthDate.getMonth();

// // // // //     if (
// // // // //       monthDifference < 0 ||
// // // // //       (monthDifference === 0 && today.getDate() < birthDate.getDate())
// // // // //     ) {
// // // // //       age--;
// // // // //     }

// // // // //     return age;
// // // // //   }

// // // // //   function formatDate(date) {
// // // // //     if (!date) {
// // // // //       return "—";
// // // // //     }

// // // // //     return new Intl.DateTimeFormat("en-GB", {
// // // // //       day: "2-digit",
// // // // //       month: "short",
// // // // //       year: "numeric",
// // // // //     }).format(new Date(date));
// // // // //   }

// // // // //   function formatTime(time) {
// // // // //     if (!time) {
// // // // //       return "—";
// // // // //     }

// // // // //     const [hours, minutes] = time.split(":");

// // // // //     const date = new Date();

// // // // //     date.setHours(Number(hours));

// // // // //     date.setMinutes(Number(minutes));

// // // // //     date.setSeconds(0);

// // // // //     return date.toLocaleTimeString("en-US", {
// // // // //       hour: "numeric",
// // // // //       minute: "2-digit",
// // // // //       hour12: true,
// // // // //     });
// // // // //   }

// // // // //   function getAppointmentStatus(status) {
// // // // //     const statuses = {
// // // // //       scheduled: {
// // // // //         label: "Scheduled",
// // // // //         tone: "gray",
// // // // //       },

// // // // //       checked_in: {
// // // // //         label: "Checked in",
// // // // //         tone: "blue",
// // // // //       },

// // // // //       waiting: {
// // // // //         label: "Waiting",
// // // // //         tone: "amber",
// // // // //       },

// // // // //       in_consultation: {
// // // // //         label: "In consultation",
// // // // //         tone: "blue",
// // // // //       },

// // // // //       completed: {
// // // // //         label: "Completed",
// // // // //         tone: "green",
// // // // //       },

// // // // //       cancelled: {
// // // // //         label: "Cancelled",
// // // // //         tone: "red",
// // // // //       },

// // // // //       no_show: {
// // // // //         label: "No show",
// // // // //         tone: "red",
// // // // //       },
// // // // //     };

// // // // //     return (
// // // // //       statuses[status] || {
// // // // //         label: status || "Unknown",

// // // // //         tone: "gray",
// // // // //       }
// // // // //     );
// // // // //   }

// // // // //   function getLanguageLabel(language) {
// // // // //     return (
// // // // //       TRANSCRIPTION_LANGUAGES.find((item) => item.value === language)?.label ||
// // // // //       language ||
// // // // //       "Auto detect"
// // // // //     );
// // // // //   }

// // // // //   // ======================================================
// // // // //   // LOADING
// // // // //   // ======================================================

// // // // //   if (loading) {
// // // // //     return <ConsultationLoading />;
// // // // //   }

// // // // //   // ======================================================
// // // // //   // FATAL ERROR
// // // // //   // ======================================================

// // // // //   if (!appointmentId || (error && !patient)) {
// // // // //     return (
// // // // //       <Shell
// // // // //         role="doctor"
// // // // //         title="New consultation"
// // // // //         subtitle="Consultation unavailable"
// // // // //       >
// // // // //         <div className="max-w-4xl">
// // // // //           <div className="rounded-2xl border bg-white px-6 py-16 text-center">
// // // // //             <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 font-bold text-red-600">
// // // // //               !
// // // // //             </div>

// // // // //             <h2 className="mt-4 text-xl font-bold">Consultation unavailable</h2>

// // // // //             <p className="mt-2 text-sm text-slate-500">
// // // // //               {error || "Appointment ID is missing."}
// // // // //             </p>

// // // // //             <Link
// // // // //               href="/doctor"
// // // // //               className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
// // // // //             >
// // // // //               Back to dashboard
// // // // //             </Link>
// // // // //           </div>
// // // // //         </div>
// // // // //       </Shell>
// // // // //     );
// // // // //   }

// // // // //   if (!patient || !appointment) {
// // // // //     return null;
// // // // //   }

// // // // //   // ======================================================
// // // // //   // PAGE DATA
// // // // //   // ======================================================

// // // // //   const age = calculateAge(patient.date_of_birth);

// // // // //   const appointmentStatus = getAppointmentStatus(appointment.status);

// // // // //   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

// // // // //   const consultationStarted = Boolean(consultation?.id);

// // // // //   const consultationLocked =
// // // // //     consultation?.status === "completed" || appointment?.status === "completed";

// // // // //   // ======================================================
// // // // //   // PAGE
// // // // //   // ======================================================

// // // // //   return (
// // // // //     <Shell
// // // // //       role="doctor"
// // // // //       title="New consultation"
// // // // //       subtitle={`${patient.name} · ${patient.patient_code}`}
// // // // //     >
// // // // //       <div className="max-w-5xl">
// // // // //         {/* =================================================
// // // // //             ALERTS
// // // // //         ================================================= */}

// // // // //         {error && (
// // // // //           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// // // // //             {error}
// // // // //           </div>
// // // // //         )}

// // // // //         {success && (
// // // // //           <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
// // // // //             {success}
// // // // //           </div>
// // // // //         )}

// // // // //         {/* =================================================
// // // // //             PATIENT
// // // // //         ================================================= */}

// // // // //         <section className="rounded-2xl border bg-white p-6">
// // // // //           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
// // // // //             <div>
// // // // //               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// // // // //                 Patient
// // // // //               </p>

// // // // //               <h2 className="mt-2 text-2xl font-bold text-slate-950">
// // // // //                 {patient.name}
// // // // //               </h2>

// // // // //               <p className="mt-2 text-sm text-slate-500">
// // // // //                 {age !== null ? `${age} years` : "Age not added"}

// // // // //                 {" · "}

// // // // //                 {patient.gender || "Gender not added"}

// // // // //                 {" · "}

// // // // //                 {patient.patient_code}
// // // // //               </p>

// // // // //               {patient.phone && (
// // // // //                 <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
// // // // //               )}
// // // // //             </div>

// // // // //             <div className="flex flex-wrap items-center gap-3">
// // // // //               <Badge tone={appointmentStatus.tone}>
// // // // //                 {appointmentStatus.label}
// // // // //               </Badge>

// // // // //               <Link
// // // // //                 href={`/doctor/patients/${patient.id}`}
// // // // //                 className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
// // // // //               >
// // // // //                 View patient
// // // // //               </Link>
// // // // //             </div>
// // // // //           </div>

// // // // //           <div className="mt-6 border-t pt-5">
// // // // //             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Appointment</p>

// // // // //                 <p className="mt-1 text-sm font-semibold">#{appointment.id}</p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Date</p>

// // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // //                   {formatDate(appointment.appointment_date)}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Time</p>

// // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // //                   {formatTime(appointment.appointment_time)}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Token</p>

// // // // //                 <p className="mt-1 text-sm font-semibold">
// // // // //                   {appointment.token_number || "—"}
// // // // //                 </p>
// // // // //               </div>
// // // // //             </div>

// // // // //             {appointment.notes && (
// // // // //               <div className="mt-5 rounded-xl bg-slate-50 p-4">
// // // // //                 <p className="text-xs text-slate-400">Appointment notes</p>

// // // // //                 <p className="mt-1 text-sm text-slate-700">
// // // // //                   {appointment.notes}
// // // // //                 </p>
// // // // //               </div>
// // // // //             )}
// // // // //           </div>
// // // // //         </section>

// // // // //         {/* =================================================
// // // // //             HISTORY
// // // // //         ================================================= */}

// // // // //         <section className="mt-6 rounded-2xl border bg-white">
// // // // //           <div className="flex items-center justify-between gap-4 border-b p-5">
// // // // //             <div>
// // // // //               <h3 className="font-semibold">Patient history</h3>

// // // // //               <p className="mt-1 text-xs text-slate-500">
// // // // //                 Latest medical information before consultation
// // // // //               </p>
// // // // //             </div>

// // // // //             <Link
// // // // //               href={`/doctor/patients/${patient.id}`}
// // // // //               className="text-sm font-medium text-blue-600"
// // // // //             >
// // // // //               Full history
// // // // //             </Link>
// // // // //           </div>

// // // // //           {!latestHistory ? (
// // // // //             <div className="p-6">
// // // // //               <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
// // // // //                 No medical history has been added for this patient.
// // // // //               </div>
// // // // //             </div>
// // // // //           ) : (
// // // // //             <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Previous diseases</p>

// // // // //                 <p className="mt-1 text-sm font-medium">
// // // // //                   {latestHistory.previous_diseases || "None reported"}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Allergies</p>

// // // // //                 <p className="mt-1 text-sm font-medium">
// // // // //                   {latestHistory.allergies || "None reported"}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Current medications</p>

// // // // //                 <p className="mt-1 text-sm font-medium">
// // // // //                   {latestHistory.current_medications || "None reported"}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Previous surgeries</p>

// // // // //                 <p className="mt-1 text-sm font-medium">
// // // // //                   {latestHistory.previous_surgeries || "None reported"}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Family history</p>

// // // // //                 <p className="mt-1 text-sm font-medium">
// // // // //                   {latestHistory.family_history || "None reported"}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div>
// // // // //                 <p className="text-xs text-slate-400">Additional notes</p>

// // // // //                 <p className="mt-1 text-sm font-medium">
// // // // //                   {latestHistory.additional_notes || "No notes"}
// // // // //                 </p>
// // // // //               </div>
// // // // //             </div>
// // // // //           )}
// // // // //         </section>

// // // // //         {/* =================================================
// // // // //             CONSULTATION
// // // // //         ================================================= */}

// // // // //         <section className="mt-6 rounded-2xl border bg-white p-6">
// // // // //           {!consultationStarted ? (
// // // // //             <div className="rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // //               <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // //                 <Icon name="mic" size={28} />
// // // // //               </div>

// // // // //               <h3 className="mt-5 text-xl font-bold">
// // // // //                 Ready to start consultation
// // // // //               </h3>

// // // // //               <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // //                 Start the consultation when the patient is with you. The
// // // // //                 appointment will move to in consultation.
// // // // //               </p>

// // // // //               <button
// // // // //                 type="button"
// // // // //                 disabled={starting}
// // // // //                 onClick={handleStartConsultation}
// // // // //                 className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // //               >
// // // // //                 {starting ? "Starting consultation..." : "Start consultation"}
// // // // //               </button>
// // // // //             </div>
// // // // //           ) : (
// // // // //             <>
// // // // //               {/* =================================================
// // // // //                   CONSULTATION INFO
// // // // //               ================================================= */}

// // // // //               <div className="rounded-xl bg-slate-50 p-5">
// // // // //                 <div className="grid gap-5 sm:grid-cols-3">
// // // // //                   <div>
// // // // //                     <p className="text-xs text-slate-400">Consultation ID</p>

// // // // //                     <p className="mt-1 font-semibold">#{consultation.id}</p>
// // // // //                   </div>

// // // // //                   <div>
// // // // //                     <p className="text-xs text-slate-400">Status</p>

// // // // //                     <p className="mt-1 font-semibold capitalize">
// // // // //                       {consultation.status?.replaceAll("_", " ")}
// // // // //                     </p>
// // // // //                   </div>

// // // // //                   <div>
// // // // //                     <p className="text-xs text-slate-400">Started</p>

// // // // //                     <p className="mt-1 font-semibold">
// // // // //                       {consultation.started_at
// // // // //                         ? new Date(consultation.started_at).toLocaleString()
// // // // //                         : "—"}
// // // // //                     </p>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>

// // // // //               {/* =================================================
// // // // //                   RECORDING
// // // // //               ================================================= */}

// // // // //               <div className="mt-6 rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // // // //                 <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // // // //                   <Icon name="mic" size={28} />
// // // // //                 </div>

// // // // //                 <div className="mt-5 flex justify-center">
// // // // //                   <Badge
// // // // //                     tone={
// // // // //                       isRecording ? "red" : uploadedRecording ? "green" : "blue"
// // // // //                     }
// // // // //                   >
// // // // //                     {isRecording
// // // // //                       ? isPaused
// // // // //                         ? "Recording paused"
// // // // //                         : "Recording"
// // // // //                       : uploadedRecording
// // // // //                         ? "Audio saved"
// // // // //                         : "Ready to record"}
// // // // //                   </Badge>
// // // // //                 </div>

// // // // //                 <h3 className="mt-4 text-xl font-bold">
// // // // //                   Consultation recording
// // // // //                 </h3>

// // // // //                 <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // // // //                   Record the doctor and patient conversation. Audio will be
// // // // //                   stored securely against this consultation.
// // // // //                 </p>

// // // // //                 {(isRecording || recordingSeconds > 0) && (
// // // // //                   <div className="mt-6 text-3xl font-bold tabular-nums">
// // // // //                     {formatDuration(recordingSeconds)}
// // // // //                   </div>
// // // // //                 )}

// // // // //                 {/* START */}

// // // // //                 {!isRecording &&
// // // // //                   !audioBlob &&
// // // // //                   !uploadedRecording &&
// // // // //                   !consultationLocked && (
// // // // //                     <button
// // // // //                       type="button"
// // // // //                       onClick={handleStartRecording}
// // // // //                       className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
// // // // //                     >
// // // // //                       Start recording
// // // // //                     </button>
// // // // //                   )}

// // // // //                 {consultationLocked && (
// // // // //                   <p className="mt-6 text-sm font-medium text-slate-500">
// // // // //                     This consultation is completed and cannot be recorded again.
// // // // //                   </p>
// // // // //                 )}

// // // // //                 {/* RECORD CONTROLS */}

// // // // //                 {isRecording && (
// // // // //                   <div className="mt-6 flex flex-wrap justify-center gap-3">
// // // // //                     {!isPaused ? (
// // // // //                       <button
// // // // //                         type="button"
// // // // //                         onClick={handlePauseRecording}
// // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // //                       >
// // // // //                         Pause
// // // // //                       </button>
// // // // //                     ) : (
// // // // //                       <button
// // // // //                         type="button"
// // // // //                         onClick={handleResumeRecording}
// // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // // //                       >
// // // // //                         Resume
// // // // //                       </button>
// // // // //                     )}

// // // // //                     <button
// // // // //                       type="button"
// // // // //                       onClick={handleStopRecording}
// // // // //                       className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
// // // // //                     >
// // // // //                       Stop recording
// // // // //                     </button>
// // // // //                   </div>
// // // // //                 )}

// // // // //                 {/* =================================================
// // // // //                     LOCAL PREVIEW
// // // // //                 ================================================= */}

// // // // //                 {audioBlob && !uploadedRecording && !isRecording && (
// // // // //                   <div className="mt-7">
// // // // //                     <p className="text-sm font-medium">Recording complete</p>

// // // // //                     <audio
// // // // //                       controls
// // // // //                       src={audioUrl}
// // // // //                       className="mx-auto mt-4 w-full max-w-lg"
// // // // //                     />

// // // // //                     <div className="mt-5 flex flex-wrap justify-center gap-3">
// // // // //                       <button
// // // // //                         type="button"
// // // // //                         disabled={uploadingAudio}
// // // // //                         onClick={handleUploadAudio}
// // // // //                         className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // //                       >
// // // // //                         {uploadingAudio ? "Saving audio..." : "Save recording"}
// // // // //                       </button>

// // // // //                       <button
// // // // //                         type="button"
// // // // //                         disabled={uploadingAudio}
// // // // //                         onClick={handleRecordAgain}
// // // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
// // // // //                       >
// // // // //                         Record again
// // // // //                       </button>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 )}

// // // // //                 {/* =================================================
// // // // //                     SAVED S3 RECORDING
// // // // //                 ================================================= */}

// // // // //                 {uploadedRecording && (
// // // // //                   <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
// // // // //                     <div className="flex flex-wrap items-center justify-between gap-3">
// // // // //                       <div>
// // // // //                         <p className="font-semibold text-emerald-900">
// // // // //                           Recording saved
// // // // //                         </p>

// // // // //                         <p className="mt-1 text-xs text-emerald-700">
// // // // //                           Audio recording #{uploadedRecording.id}
// // // // //                         </p>
// // // // //                       </div>

// // // // //                       <Badge tone="green">Uploaded</Badge>
// // // // //                     </div>

// // // // //                     {/* INFORMATION */}

// // // // //                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
// // // // //                       <div>
// // // // //                         <p className="text-xs text-emerald-700">Duration</p>

// // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // //                           {formatDuration(
// // // // //                             Math.round(
// // // // //                               Number(
// // // // //                                 uploadedRecording.duration_seconds ||
// // // // //                                   recordingSeconds,
// // // // //                               ),
// // // // //                             ),
// // // // //                           )}
// // // // //                         </p>
// // // // //                       </div>

// // // // //                       <div>
// // // // //                         <p className="text-xs text-emerald-700">File type</p>

// // // // //                         <p className="mt-1 text-sm font-semibold">
// // // // //                           {uploadedRecording.mime_type || "Audio"}
// // // // //                         </p>
// // // // //                       </div>

// // // // //                       <div>
// // // // //                         <p className="text-xs text-emerald-700">Status</p>

// // // // //                         <p className="mt-1 text-sm font-semibold capitalize">
// // // // //                           {uploadedRecording.status || "uploaded"}
// // // // //                         </p>
// // // // //                       </div>
// // // // //                     </div>

// // // // //                     {/* AUDIO PLAYER */}

// // // // //                     {uploadedRecording.audio_url && (
// // // // //                       <audio
// // // // //                         controls
// // // // //                         src={uploadedRecording.audio_url}
// // // // //                         className="mt-5 w-full"
// // // // //                       />
// // // // //                     )}

// // // // //                     {/* =================================================
// // // // //                         TRANSCRIPTION ACTIONS
// // // // //                     ================================================= */}

// // // // //                     <div className="mt-5 border-t border-emerald-200 pt-5">
// // // // //                       <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
// // // // //                         {!transcript && (
// // // // //                           <div>
// // // // //                             <label
// // // // //                               htmlFor="transcription-language"
// // // // //                               className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-800"
// // // // //                             >
// // // // //                               Output language
// // // // //                             </label>

// // // // //                             <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
// // // // //                               <select
// // // // //                                 id="transcription-language"
// // // // //                                 value={selectedLanguage}
// // // // //                                 disabled={transcribing || deletingRecording}
// // // // //                                 onChange={(event) =>
// // // // //                                   setSelectedLanguage(event.target.value)
// // // // //                                 }
// // // // //                                 className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[220px]"
// // // // //                               >
// // // // //                                 {TRANSCRIPTION_LANGUAGES.map((language) => (
// // // // //                                   <option
// // // // //                                     key={language.value}
// // // // //                                     value={language.value}
// // // // //                                   >
// // // // //                                     {language.label}
// // // // //                                   </option>
// // // // //                                 ))}
// // // // //                               </select>

// // // // //                               <button
// // // // //                                 type="button"
// // // // //                                 disabled={transcribing || deletingRecording}
// // // // //                                 onClick={handleGenerateTranscript}
// // // // //                                 className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // // // //                               >
// // // // //                                 {transcribing
// // // // //                                   ? "Generating transcript..."
// // // // //                                   : "Generate transcript"}
// // // // //                               </button>
// // // // //                             </div>

// // // // //                             <p className="mt-2 text-xs text-emerald-700">
// // // // //                               {selectedLanguage === "auto"
// // // // //                                 ? "The spoken language will be detected automatically."
// // // // //                                 : `Transcript will be generated in ${getLanguageLabel(
// // // // //                                     selectedLanguage,
// // // // //                                   )}.`}
// // // // //                             </p>

// // // // //                             {transcribing && (
// // // // //                               <p className="mt-3 text-xs text-slate-500">
// // // // //                                 Audio is being transcribed in{" "}
// // // // //                                 {getLanguageLabel(selectedLanguage)}. Please
// // // // //                                 keep this page open.
// // // // //                               </p>
// // // // //                             )}
// // // // //                           </div>
// // // // //                         )}

// // // // //                         {/* DELETE */}

// // // // //                         <button
// // // // //                           type="button"
// // // // //                           disabled={deletingRecording || transcribing}
// // // // //                           onClick={handleDeleteRecording}
// // // // //                           className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
// // // // //                         >
// // // // //                           {deletingRecording
// // // // //                             ? "Deleting recording..."
// // // // //                             : "Delete recording"}
// // // // //                         </button>
// // // // //                       </div>

// // // // //                       {transcript && (
// // // // //                         <p className="mt-3 text-xs text-red-600">
// // // // //                           Deleting this recording will also remove its generated
// // // // //                           transcript.
// // // // //                         </p>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 )}
// // // // //               </div>

// // // // //               {/* =================================================
// // // // //                   TRANSCRIPT
// // // // //               ================================================= */}

// // // // //               {transcript && (
// // // // //                 <section className="mt-6 overflow-hidden rounded-2xl border">
// // // // //                   <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
// // // // //                     <div>
// // // // //                       <h3 className="font-semibold">AI transcript</h3>

// // // // //                       <p className="mt-1 text-xs text-slate-500">
// // // // //                         Generated from consultation recording
// // // // //                       </p>
// // // // //                     </div>

// // // // //                     <Badge tone="green">Transcript ready</Badge>
// // // // //                   </div>

// // // // //                   <div className="p-5">
// // // // //                     <div className="rounded-xl bg-slate-50 p-5">
// // // // //                       <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // // // //                         {transcript.edited_text ||
// // // // //                           transcript.full_text ||
// // // // //                           "Transcript is empty."}
// // // // //                       </p>
// // // // //                     </div>

// // // // //                     <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
// // // // //                       <span>Transcript #{transcript.id}</span>

// // // // //                       {transcript.word_count !== null &&
// // // // //                         transcript.word_count !== undefined && (
// // // // //                           <span>{transcript.word_count} words</span>
// // // // //                         )}

// // // // //                       <span>
// // // // //                         Language:{" "}
// // // // //                         {getLanguageLabel(
// // // // //                           transcript.language || selectedLanguage,
// // // // //                         )}
// // // // //                       </span>

// // // // //                       <span className="capitalize">
// // // // //                         Status: {transcript.status}
// // // // //                       </span>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </section>
// // // // //               )}
// // // // //             </>
// // // // //           )}

// // // // //           {/* =================================================
// // // // //               PROCESS STEPS
// // // // //           ================================================= */}

// // // // //           <div className="mt-6 grid gap-3 md:grid-cols-3">
// // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // //               <div className="text-xs text-slate-400">01</div>

// // // // //               <div className="mt-2 font-semibold">Patient history</div>

// // // // //               <div className="mt-1 text-xs text-emerald-600">Available</div>
// // // // //             </div>

// // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // //               <div className="text-xs text-slate-400">02</div>

// // // // //               <div className="mt-2 font-semibold">Audio recording</div>

// // // // //               <div
// // // // //                 className={`mt-1 text-xs ${
// // // // //                   uploadedRecording ? "text-emerald-600" : "text-slate-500"
// // // // //                 }`}
// // // // //               >
// // // // //                 {uploadedRecording
// // // // //                   ? "Recording saved"
// // // // //                   : consultationStarted
// // // // //                     ? "Ready"
// // // // //                     : "Start consultation first"}
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // // //               <div className="text-xs text-slate-400">03</div>

// // // // //               <div className="mt-2 font-semibold">AI transcript</div>

// // // // //               <div
// // // // //                 className={`mt-1 text-xs ${
// // // // //                   transcript
// // // // //                     ? "text-emerald-600"
// // // // //                     : transcribing
// // // // //                       ? "text-blue-600"
// // // // //                       : "text-slate-500"
// // // // //                 }`}
// // // // //               >
// // // // //                 {transcript
// // // // //                   ? `Transcript ready · ${getLanguageLabel(
// // // // //                       transcript.language || selectedLanguage,
// // // // //                     )}`
// // // // //                   : transcribing
// // // // //                     ? "Processing..."
// // // // //                     : uploadedRecording
// // // // //                       ? "Ready to generate"
// // // // //                       : "Available after recording"}
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </section>

// // // // //         {/* =================================================
// // // // //             BACK
// // // // //         ================================================= */}

// // // // //         <div className="mt-6">
// // // // //           <Link
// // // // //             href="/doctor"
// // // // //             className="text-sm font-medium text-slate-600 hover:text-slate-950"
// // // // //           >
// // // // //             ← Back to dashboard
// // // // //           </Link>
// // // // //         </div>
// // // // //       </div>
// // // // //     </Shell>
// // // // //   );
// // // // // }

// // // // "use client";

// // // // import { Suspense, useEffect, useRef, useState } from "react";
// // // // import { useRouter, useSearchParams } from "next/navigation";
// // // // import Link from "next/link";

// // // // import Shell from "@/components/Shell";
// // // // import Icon from "@/components/Icon";
// // // // import Badge from "@/components/Badge";

// // // // // ======================================================
// // // // // TRANSCRIPTION LANGUAGES
// // // // // ======================================================

// // // // const TRANSCRIPTION_LANGUAGES = [
// // // //   { value: "auto", label: "Auto detect" },
// // // //   { value: "en", label: "English" },
// // // //   { value: "ur", label: "Urdu" },
// // // //   { value: "roman-ur", label: "Roman Urdu" },
// // // //   { value: "hi", label: "Hindi" },
// // // //   { value: "ar", label: "Arabic" },
// // // //   { value: "pa", label: "Punjabi" },
// // // // ];

// // // // // ======================================================
// // // // // OUTER
// // // // // ======================================================

// // // // export default function NewConsultationPage() {
// // // //   return (
// // // //     <Suspense fallback={<ConsultationLoading />}>
// // // //       <NewConsultationContent />
// // // //     </Suspense>
// // // //   );
// // // // }

// // // // // ======================================================
// // // // // LOADING
// // // // // ======================================================

// // // // function ConsultationLoading() {
// // // //   return (
// // // //     <Shell
// // // //       role="doctor"
// // // //       title="New consultation"
// // // //       subtitle="Loading consultation"
// // // //     >
// // // //       <div className="max-w-5xl">
// // // //         <div className="rounded-2xl border bg-white px-6 py-20 text-center">
// // // //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

// // // //           <p className="mt-4 text-sm text-slate-500">Loading consultation...</p>
// // // //         </div>
// // // //       </div>
// // // //     </Shell>
// // // //   );
// // // // }

// // // // // ======================================================
// // // // // MAIN
// // // // // ======================================================

// // // // function NewConsultationContent() {
// // // //   const router = useRouter();
// // // //   const searchParams = useSearchParams();

// // // //   const appointmentId = searchParams.get("appointment");

// // // //   // ======================================================
// // // //   // DATA
// // // //   // ======================================================

// // // //   const [appointment, setAppointment] = useState(null);
// // // //   const [patient, setPatient] = useState(null);
// // // //   const [medicalHistory, setMedicalHistory] = useState([]);
// // // //   const [consultation, setConsultation] = useState(null);

// // // //   // ======================================================
// // // //   // PAGE STATE
// // // //   // ======================================================

// // // //   const [loading, setLoading] = useState(true);
// // // //   const [starting, setStarting] = useState(false);

// // // //   const [error, setError] = useState("");
// // // //   const [success, setSuccess] = useState("");

// // // //   // ======================================================
// // // //   // RECORDING
// // // //   // ======================================================

// // // //   const [isRecording, setIsRecording] = useState(false);
// // // //   const [isPaused, setIsPaused] = useState(false);

// // // //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// // // //   const [audioBlob, setAudioBlob] = useState(null);
// // // //   const [audioUrl, setAudioUrl] = useState("");

// // // //   const [uploadingAudio, setUploadingAudio] = useState(false);
// // // //   const [deletingRecording, setDeletingRecording] = useState(false);

// // // //   const [uploadedRecording, setUploadedRecording] = useState(null);

// // // //   // ======================================================
// // // //   // TRANSCRIPTION
// // // //   // ======================================================

// // // //   const [transcribing, setTranscribing] = useState(false);

// // // //   const [selectedLanguage, setSelectedLanguage] = useState("auto");

// // // //   const [transcript, setTranscript] = useState(null);

// // // //   const [transcriptSegments, setTranscriptSegments] = useState([]);

// // // //   // ======================================================
// // // //   // REFS
// // // //   // ======================================================

// // // //   const recorderRef = useRef(null);
// // // //   const streamRef = useRef(null);
// // // //   const timerRef = useRef(null);
// // // //   const chunksRef = useRef([]);

// // // //   // ======================================================
// // // //   // RESPONSE
// // // //   // ======================================================

// // // //   async function getResponseData(response) {
// // // //     const contentType = response.headers.get("content-type") || "";

// // // //     if (contentType.includes("application/json")) {
// // // //       return await response.json();
// // // //     }

// // // //     const text = await response.text();

// // // //     throw new Error(
// // // //       text
// // // //         ? `Server returned an invalid response (${response.status}).`
// // // //         : "Server returned an invalid response.",
// // // //     );
// // // //   }

// // // //   // ======================================================
// // // //   // LOAD
// // // //   // ======================================================

// // // //   async function loadConsultationData() {
// // // //     if (!appointmentId) {
// // // //       setError("Appointment ID is missing.");
// // // //       setLoading(false);
// // // //       return;
// // // //     }

// // // //     const numericAppointmentId = Number(appointmentId);

// // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // //       setError("Invalid appointment ID.");
// // // //       setLoading(false);
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setLoading(true);
// // // //       setError("");

// // // //       const response = await fetch(
// // // //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// // // //           numericAppointmentId,
// // // //         )}`,
// // // //         {
// // // //           method: "GET",
// // // //           credentials: "include",
// // // //           cache: "no-store",
// // // //         },
// // // //       );

// // // //       const data = await getResponseData(response);

// // // //       if (response.status === 401) {
// // // //         router.replace("/login");
// // // //         return;
// // // //       }

// // // //       if (response.status === 403) {
// // // //         router.replace("/unauthorized");
// // // //         return;
// // // //       }

// // // //       if (!response.ok) {
// // // //         setError(data.message || "Unable to load consultation.");
// // // //         return;
// // // //       }

// // // //       setAppointment(data.appointment || null);
// // // //       setPatient(data.patient || null);

// // // //       setMedicalHistory(
// // // //         Array.isArray(data.medical_history) ? data.medical_history : [],
// // // //       );

// // // //       setConsultation(data.consultation || null);

// // // //       setUploadedRecording(data.audio_recording || null);

// // // //       setTranscript(data.transcript || null);

// // // //       setTranscriptSegments(
// // // //         Array.isArray(data.transcript_segments) ? data.transcript_segments : [],
// // // //       );

// // // //       if (data.transcript?.language) {
// // // //         const exists = TRANSCRIPTION_LANGUAGES.some(
// // // //           (item) => item.value === data.transcript.language,
// // // //         );

// // // //         if (exists) {
// // // //           setSelectedLanguage(data.transcript.language);
// // // //         }
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("LOAD CONSULTATION ERROR:", error);

// // // //       setError(error?.message || "Unable to connect to the server.");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }

// // // //   useEffect(() => {
// // // //     loadConsultationData();
// // // //   }, [appointmentId]);

// // // //   // ======================================================
// // // //   // START CONSULTATION
// // // //   // ======================================================

// // // //   async function handleStartConsultation() {
// // // //     const numericAppointmentId = Number(appointmentId);

// // // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // // //       setError("Valid appointment ID is required.");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setStarting(true);

// // // //       setError("");
// // // //       setSuccess("");

// // // //       const response = await fetch("/api/doctors/consultations/start", {
// // // //         method: "POST",

// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //         },

// // // //         credentials: "include",

// // // //         cache: "no-store",

// // // //         body: JSON.stringify({
// // // //           appointment_id: numericAppointmentId,
// // // //         }),
// // // //       });

// // // //       const data = await getResponseData(response);

// // // //       if (response.status === 401) {
// // // //         router.replace("/login");
// // // //         return;
// // // //       }

// // // //       if (response.status === 403) {
// // // //         router.replace("/unauthorized");
// // // //         return;
// // // //       }

// // // //       if (!response.ok) {
// // // //         setError(data.message || "Unable to start consultation.");
// // // //         return;
// // // //       }

// // // //       setConsultation(data.consultation || null);

// // // //       if (data.appointment) {
// // // //         setAppointment((previous) => ({
// // // //           ...(previous || {}),
// // // //           ...data.appointment,
// // // //         }));
// // // //       } else {
// // // //         setAppointment((previous) =>
// // // //           previous
// // // //             ? {
// // // //                 ...previous,
// // // //                 status: "in_consultation",
// // // //               }
// // // //             : previous,
// // // //         );
// // // //       }

// // // //       if (data.audio_recording) {
// // // //         setUploadedRecording(data.audio_recording);
// // // //       }

// // // //       if (data.transcript) {
// // // //         setTranscript(data.transcript);
// // // //       }

// // // //       if (Array.isArray(data.transcript_segments)) {
// // // //         setTranscriptSegments(data.transcript_segments);
// // // //       }

// // // //       setSuccess(data.message || "Consultation started successfully.");
// // // //     } catch (error) {
// // // //       console.error("START CONSULTATION ERROR:", error);

// // // //       setError(error?.message || "Unable to connect to the server.");
// // // //     } finally {
// // // //       setStarting(false);
// // // //     }
// // // //   }

// // // //   // ======================================================
// // // //   // TIMER
// // // //   // ======================================================

// // // //   function stopTimer() {
// // // //     if (timerRef.current) {
// // // //       clearInterval(timerRef.current);
// // // //       timerRef.current = null;
// // // //     }
// // // //   }

// // // //   function startTimer() {
// // // //     stopTimer();

// // // //     timerRef.current = setInterval(() => {
// // // //       setRecordingSeconds((previous) => previous + 1);
// // // //     }, 1000);
// // // //   }

// // // //   function formatDuration(totalSeconds) {
// // // //     const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

// // // //     const minutes = Math.floor(safeSeconds / 60);
// // // //     const seconds = Math.floor(safeSeconds % 60);

// // // //     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
// // // //       2,
// // // //       "0",
// // // //     )}`;
// // // //   }

// // // //   function formatTranscriptTime(value) {
// // // //     const seconds = Math.max(0, Math.floor(Number(value) || 0));

// // // //     const hours = Math.floor(seconds / 3600);
// // // //     const minutes = Math.floor((seconds % 3600) / 60);
// // // //     const remaining = seconds % 60;

// // // //     if (hours > 0) {
// // // //       return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
// // // //         2,
// // // //         "0",
// // // //       )}:${String(remaining).padStart(2, "0")}`;
// // // //     }

// // // //     return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
// // // //       2,
// // // //       "0",
// // // //     )}`;
// // // //   }

// // // //   // ======================================================
// // // //   // MICROPHONE
// // // //   // ======================================================

// // // //   function stopMicrophoneStream() {
// // // //     if (!streamRef.current) {
// // // //       return;
// // // //     }

// // // //     streamRef.current.getTracks().forEach((track) => track.stop());

// // // //     streamRef.current = null;
// // // //   }

// // // //   // ======================================================
// // // //   // START RECORDING
// // // //   // ======================================================

// // // //   async function handleStartRecording() {
// // // //     try {
// // // //       setError("");
// // // //       setSuccess("");

// // // //       if (!consultation?.id) {
// // // //         setError("Start the consultation before recording.");
// // // //         return;
// // // //       }

// // // //       if (
// // // //         !navigator.mediaDevices?.getUserMedia ||
// // // //         typeof MediaRecorder === "undefined"
// // // //       ) {
// // // //         setError("Microphone recording is not supported.");
// // // //         return;
// // // //       }

// // // //       const stream = await navigator.mediaDevices.getUserMedia({
// // // //         audio: true,
// // // //       });

// // // //       streamRef.current = stream;

// // // //       let mimeType = "";

// // // //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// // // //         mimeType = "audio/webm;codecs=opus";
// // // //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// // // //         mimeType = "audio/webm";
// // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
// // // //         mimeType = "audio/ogg;codecs=opus";
// // // //       } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
// // // //         mimeType = "audio/ogg";
// // // //       }

// // // //       const recorder = mimeType
// // // //         ? new MediaRecorder(stream, { mimeType })
// // // //         : new MediaRecorder(stream);

// // // //       recorderRef.current = recorder;
// // // //       chunksRef.current = [];

// // // //       if (audioUrl) {
// // // //         URL.revokeObjectURL(audioUrl);
// // // //       }

// // // //       setAudioBlob(null);
// // // //       setAudioUrl("");

// // // //       setUploadedRecording(null);

// // // //       setTranscript(null);
// // // //       setTranscriptSegments([]);

// // // //       setRecordingSeconds(0);
// // // //       setIsPaused(false);

// // // //       recorder.ondataavailable = (event) => {
// // // //         if (event.data?.size > 0) {
// // // //           chunksRef.current.push(event.data);
// // // //         }
// // // //       };

// // // //       recorder.onstop = () => {
// // // //         const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

// // // //         const blob = new Blob(chunksRef.current, {
// // // //           type: finalMimeType,
// // // //         });

// // // //         if (!blob.size) {
// // // //           setError("Recording is empty.");
// // // //           stopTimer();
// // // //           stopMicrophoneStream();

// // // //           setIsRecording(false);
// // // //           setIsPaused(false);

// // // //           recorderRef.current = null;
// // // //           return;
// // // //         }

// // // //         const previewUrl = URL.createObjectURL(blob);

// // // //         setAudioBlob(blob);
// // // //         setAudioUrl(previewUrl);

// // // //         setIsRecording(false);
// // // //         setIsPaused(false);

// // // //         stopTimer();
// // // //         stopMicrophoneStream();

// // // //         recorderRef.current = null;
// // // //       };

// // // //       recorder.onerror = (event) => {
// // // //         console.error("MEDIA RECORDER ERROR:", event.error);

// // // //         setError("Recording failed.");

// // // //         setIsRecording(false);
// // // //         setIsPaused(false);

// // // //         stopTimer();
// // // //         stopMicrophoneStream();

// // // //         recorderRef.current = null;
// // // //       };

// // // //       recorder.start(1000);

// // // //       setIsRecording(true);
// // // //       setIsPaused(false);

// // // //       startTimer();
// // // //     } catch (error) {
// // // //       console.error("START RECORDING ERROR:", error);

// // // //       stopMicrophoneStream();

// // // //       if (error?.name === "NotAllowedError") {
// // // //         setError("Microphone permission was denied.");
// // // //       } else if (error?.name === "NotFoundError") {
// // // //         setError("No microphone was found.");
// // // //       } else {
// // // //         setError(error?.message || "Unable to start recording.");
// // // //       }
// // // //     }
// // // //   }

// // // //   function handlePauseRecording() {
// // // //     const recorder = recorderRef.current;

// // // //     if (recorder?.state === "recording") {
// // // //       recorder.pause();

// // // //       setIsPaused(true);

// // // //       stopTimer();
// // // //     }
// // // //   }

// // // //   function handleResumeRecording() {
// // // //     const recorder = recorderRef.current;

// // // //     if (recorder?.state === "paused") {
// // // //       recorder.resume();

// // // //       setIsPaused(false);

// // // //       startTimer();
// // // //     }
// // // //   }

// // // //   function handleStopRecording() {
// // // //     const recorder = recorderRef.current;

// // // //     if (recorder && ["recording", "paused"].includes(recorder.state)) {
// // // //       recorder.stop();
// // // //     }
// // // //   }

// // // //   function handleRecordAgain() {
// // // //     if (audioUrl) {
// // // //       URL.revokeObjectURL(audioUrl);
// // // //     }

// // // //     setAudioBlob(null);
// // // //     setAudioUrl("");

// // // //     setRecordingSeconds(0);

// // // //     setUploadedRecording(null);

// // // //     setTranscript(null);
// // // //     setTranscriptSegments([]);

// // // //     setError("");
// // // //     setSuccess("");
// // // //   }

// // // //   // ======================================================
// // // //   // UPLOAD
// // // //   // ======================================================

// // // //   async function handleUploadAudio() {
// // // //     if (!audioBlob) {
// // // //       setError("Record audio before saving.");
// // // //       return;
// // // //     }

// // // //     if (!consultation?.id) {
// // // //       setError("Consultation ID is missing.");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setUploadingAudio(true);

// // // //       setError("");
// // // //       setSuccess("");

// // // //       const blobType = audioBlob.type || "audio/webm";

// // // //       let extension = "webm";

// // // //       if (blobType.includes("ogg")) extension = "ogg";
// // // //       else if (blobType.includes("mp4")) extension = "mp4";
// // // //       else if (blobType.includes("mpeg")) extension = "mp3";
// // // //       else if (blobType.includes("wav")) extension = "wav";
// // // //       else if (blobType.includes("m4a")) extension = "m4a";

// // // //       const file = new File(
// // // //         [audioBlob],
// // // //         `consultation-${consultation.id}.${extension}`,
// // // //         {
// // // //           type: blobType,
// // // //         },
// // // //       );

// // // //       const formData = new FormData();

// // // //       formData.append("consultation_id", String(consultation.id));

// // // //       formData.append("duration_seconds", String(recordingSeconds));

// // // //       formData.append("audio", file);

// // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // //         method: "POST",
// // // //         credentials: "include",
// // // //         cache: "no-store",
// // // //         body: formData,
// // // //       });

// // // //       const data = await getResponseData(response);

// // // //       if (response.status === 401) {
// // // //         router.replace("/login");
// // // //         return;
// // // //       }

// // // //       if (response.status === 403) {
// // // //         router.replace("/unauthorized");
// // // //         return;
// // // //       }

// // // //       if (!response.ok) {
// // // //         setError(data.message || "Unable to save audio.");
// // // //         return;
// // // //       }

// // // //       setUploadedRecording(data.audio_recording || null);

// // // //       setTranscript(null);
// // // //       setTranscriptSegments([]);

// // // //       setConsultation((previous) =>
// // // //         previous
// // // //           ? {
// // // //               ...previous,
// // // //               status: "recorded",
// // // //             }
// // // //           : previous,
// // // //       );

// // // //       setSuccess(data.message || "Recording saved successfully.");
// // // //     } catch (error) {
// // // //       console.error("UPLOAD AUDIO ERROR:", error);

// // // //       setError(error?.message || "Unable to upload audio.");
// // // //     } finally {
// // // //       setUploadingAudio(false);
// // // //     }
// // // //   }

// // // //   // ======================================================
// // // //   // DELETE
// // // //   // ======================================================

// // // //   async function handleDeleteRecording() {
// // // //     if (!consultation?.id || !uploadedRecording?.id) {
// // // //       setError("Recording information is missing.");
// // // //       return;
// // // //     }

// // // //     const confirmed = window.confirm(
// // // //       transcript?.id
// // // //         ? "Delete this recording and its transcript?"
// // // //         : "Delete this recording?",
// // // //     );

// // // //     if (!confirmed) {
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setDeletingRecording(true);

// // // //       setError("");
// // // //       setSuccess("");

// // // //       const response = await fetch("/api/doctors/consultations/audio", {
// // // //         method: "DELETE",

// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //         },

// // // //         credentials: "include",

// // // //         cache: "no-store",

// // // //         body: JSON.stringify({
// // // //           consultation_id: consultation.id,
// // // //           audio_recording_id: uploadedRecording.id,
// // // //         }),
// // // //       });

// // // //       const data = await getResponseData(response);

// // // //       if (!response.ok) {
// // // //         setError(data.message || "Unable to delete recording.");
// // // //         return;
// // // //       }

// // // //       setAudioBlob(null);
// // // //       setAudioUrl("");

// // // //       setRecordingSeconds(0);

// // // //       setUploadedRecording(data.remaining_audio_recording || null);

// // // //       setTranscript(null);
// // // //       setTranscriptSegments([]);

// // // //       if (data.consultation) {
// // // //         setConsultation(data.consultation);
// // // //       } else {
// // // //         setConsultation((previous) =>
// // // //           previous
// // // //             ? {
// // // //                 ...previous,
// // // //                 status: data.remaining_audio_recording ? "recorded" : "draft",
// // // //               }
// // // //             : previous,
// // // //         );
// // // //       }

// // // //       setSuccess(data.message || "Recording deleted.");
// // // //     } catch (error) {
// // // //       console.error("DELETE RECORDING ERROR:", error);

// // // //       setError(error?.message || "Unable to delete recording.");
// // // //     } finally {
// // // //       setDeletingRecording(false);
// // // //     }
// // // //   }

// // // //   // ======================================================
// // // //   // PUTER RESULT HELPERS
// // // //   // ======================================================

// // // //   function findRawSegments(result) {
// // // //     const candidates = [
// // // //       result?.segments,
// // // //       result?.data?.segments,
// // // //       result?.result?.segments,
// // // //       result?.output?.segments,
// // // //       result?.transcript?.segments,
// // // //     ];

// // // //     for (const candidate of candidates) {
// // // //       if (Array.isArray(candidate) && candidate.length > 0) {
// // // //         return candidate;
// // // //       }
// // // //     }

// // // //     return [];
// // // //   }

// // // //   function findTranscriptText(result) {
// // // //     const candidates = [
// // // //       result?.text,
// // // //       result?.data?.text,
// // // //       result?.result?.text,
// // // //       result?.output?.text,
// // // //       result?.transcript?.text,
// // // //     ];

// // // //     for (const candidate of candidates) {
// // // //       if (typeof candidate === "string" && candidate.trim()) {
// // // //         return candidate.trim();
// // // //       }
// // // //     }

// // // //     return "";
// // // //   }

// // // //   function normalizePuterSegments(rawSegments) {
// // // //     if (!Array.isArray(rawSegments)) {
// // // //       return [];
// // // //     }

// // // //     return rawSegments
// // // //       .map((segment, index) => {
// // // //         const start =
// // // //           Number(
// // // //             segment?.start ?? segment?.start_time ?? segment?.startTime ?? 0,
// // // //           ) || 0;

// // // //         const end =
// // // //           Number(
// // // //             segment?.end ?? segment?.end_time ?? segment?.endTime ?? start,
// // // //           ) || start;

// // // //         const speakerRaw =
// // // //           segment?.speaker ??
// // // //           segment?.speaker_id ??
// // // //           segment?.speakerId ??
// // // //           segment?.label;

// // // //         const speaker =
// // // //           typeof speakerRaw === "string" && speakerRaw.trim()
// // // //             ? speakerRaw.trim()
// // // //             : `speaker_${index}`;

// // // //         const textRaw =
// // // //           segment?.text ?? segment?.transcript ?? segment?.content;

// // // //         const text = typeof textRaw === "string" ? textRaw.trim() : "";

// // // //         return {
// // // //           segment_index: index,
// // // //           speaker,
// // // //           speaker_role: null,
// // // //           start_time: start,
// // // //           end_time: Math.max(start, end),
// // // //           text,
// // // //         };
// // // //       })
// // // //       .filter((segment) => segment.text);
// // // //   }

// // // //   function getPuterChatText(result) {
// // // //     if (typeof result === "string") {
// // // //       return result.trim();
// // // //     }

// // // //     if (typeof result?.message?.content === "string") {
// // // //       return result.message.content.trim();
// // // //     }

// // // //     if (Array.isArray(result?.message?.content)) {
// // // //       return result.message.content
// // // //         .map((item) => {
// // // //           if (typeof item === "string") return item;
// // // //           if (typeof item?.text === "string") return item.text;

// // // //           return "";
// // // //         })
// // // //         .join("")
// // // //         .trim();
// // // //     }

// // // //     if (typeof result?.text === "string") {
// // // //       return result.text.trim();
// // // //     }

// // // //     return "";
// // // //   }

// // // //   function cleanJsonText(value) {
// // // //     return String(value || "")
// // // //       .trim()
// // // //       .replace(/^```(?:json)?\s*/i, "")
// // // //       .replace(/\s*```$/i, "")
// // // //       .trim();
// // // //   }

// // // //   // ======================================================
// // // //   // SPEAKER ROLE
// // // //   // ======================================================

// // // //   async function identifySpeakerRoles(segments) {
// // // //     const speakers = [...new Set(segments.map((segment) => segment.speaker))];

// // // //     if (speakers.length < 2) {
// // // //       return Object.fromEntries(
// // // //         speakers.map((speaker) => [speaker, "unknown"]),
// // // //       );
// // // //     }

// // // //     const conversation = segments
// // // //       .map((segment) => `${segment.speaker}: ${segment.text}`)
// // // //       .join("\n");

// // // //     const prompt = `
// // // // This is a medical consultation between a doctor and a patient.

// // // // Identify which diarized speaker is the doctor and which speaker is the patient.

// // // // Do not rewrite or summarize anything.

// // // // Speakers:
// // // // ${speakers.join(", ")}

// // // // Return ONLY valid JSON:

// // // // {
// // // //   "doctor": "speaker_name",
// // // //   "patient": "speaker_name"
// // // // }

// // // // Conversation:
// // // // ${conversation}
// // // //     `.trim();

// // // //     try {
// // // //       const result = await window.puter.ai.chat(prompt);

// // // //       const rawText = cleanJsonText(getPuterChatText(result));

// // // //       const parsed = JSON.parse(rawText);

// // // //       const roles = {};

// // // //       if (speakers.includes(parsed?.doctor)) {
// // // //         roles[parsed.doctor] = "doctor";
// // // //       }

// // // //       if (
// // // //         speakers.includes(parsed?.patient) &&
// // // //         parsed.patient !== parsed.doctor
// // // //       ) {
// // // //         roles[parsed.patient] = "patient";
// // // //       }

// // // //       speakers.forEach((speaker) => {
// // // //         if (!roles[speaker]) {
// // // //           roles[speaker] = "unknown";
// // // //         }
// // // //       });

// // // //       return roles;
// // // //     } catch (error) {
// // // //       console.error("SPEAKER ROLE IDENTIFICATION ERROR:", error);

// // // //       return Object.fromEntries(
// // // //         speakers.map((speaker) => [speaker, "unknown"]),
// // // //       );
// // // //     }
// // // //   }

// // // //   // ======================================================
// // // //   // DIARIZATION CALL
// // // //   // ======================================================

// // // //   async function callPuterDiarization(transcriptionFile) {
// // // //     const options = {
// // // //       model: "gpt-4o-transcribe-diarize",
// // // //       response_format: "diarized_json",
// // // //       chunking_strategy: "auto",
// // // //     };

// // // //     // Puter language is input-audio language hint.
// // // //     // Roman Urdu is not a standard language code,
// // // //     // so don't send it directly.
// // // //     if (selectedLanguage !== "auto" && selectedLanguage !== "roman-ur") {
// // // //       options.language = selectedLanguage;
// // // //     }

// // // //     // Preferred documented signature:
// // // //     // speech2txt(source, options)
// // // //     let result = await window.puter.ai.speech2txt(transcriptionFile, options);

// // // //     let segments = findRawSegments(result);

// // // //     // Fallback to object style, also documented by Puter.
// // // //     if (segments.length === 0) {
// // // //       console.warn("FIRST PUTER DIARIZATION RESPONSE HAD NO SEGMENTS:", result);

// // // //       result = await window.puter.ai.speech2txt({
// // // //         file: transcriptionFile,
// // // //         ...options,
// // // //       });

// // // //       segments = findRawSegments(result);
// // // //     }

// // // //     return {
// // // //       result,
// // // //       segments,
// // // //     };
// // // //   }

// // // //   // ======================================================
// // // //   // GENERATE
// // // //   // ======================================================

// // // //   async function handleGenerateTranscript() {
// // // //     if (!consultation?.id) {
// // // //       setError("Consultation ID is missing.");
// // // //       return;
// // // //     }

// // // //     if (!uploadedRecording?.id) {
// // // //       setError("Please save the audio recording first.");
// // // //       return;
// // // //     }

// // // //     if (!uploadedRecording?.audio_url) {
// // // //       setError("Saved audio URL is missing.");
// // // //       return;
// // // //     }

// // // //     if (!window.puter?.ai || typeof window.puter.ai.speech2txt !== "function") {
// // // //       setError("Speech-to-text service is not available.");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       setTranscribing(true);

// // // //       setError("");
// // // //       setSuccess("");

// // // //       // ==================================================
// // // //       // LOAD S3 AUDIO
// // // //       // ==================================================

// // // //       const audioResponse = await fetch(uploadedRecording.audio_url, {
// // // //         method: "GET",
// // // //         cache: "no-store",
// // // //       });

// // // //       if (!audioResponse.ok) {
// // // //         throw new Error(
// // // //           `Unable to load saved audio (${audioResponse.status}).`,
// // // //         );
// // // //       }

// // // //       const fetchedBlob = await audioResponse.blob();

// // // //       if (!fetchedBlob.size) {
// // // //         throw new Error("Saved audio is empty.");
// // // //       }

// // // //       const rawMimeType =
// // // //         uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

// // // //       const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

// // // //       let extension = "webm";

// // // //       if (mimeType.includes("ogg")) extension = "ogg";
// // // //       else if (mimeType.includes("mp4")) extension = "mp4";
// // // //       else if (mimeType.includes("mpeg")) extension = "mp3";
// // // //       else if (mimeType.includes("wav")) extension = "wav";
// // // //       else if (mimeType.includes("m4a")) extension = "m4a";

// // // //       const transcriptionFile = new File(
// // // //         [fetchedBlob],
// // // //         `consultation-${consultation.id}.${extension}`,
// // // //         {
// // // //           type: mimeType,
// // // //         },
// // // //       );

// // // //       console.log("TRANSCRIPTION FILE:", {
// // // //         size: transcriptionFile.size,
// // // //         type: transcriptionFile.type,
// // // //         name: transcriptionFile.name,
// // // //       });

// // // //       // ==================================================
// // // //       // DIARIZATION
// // // //       // ==================================================

// // // //       const { result: puterResult, segments: rawSegments } =
// // // //         await callPuterDiarization(transcriptionFile);

// // // //       console.log("FINAL PUTER DIARIZATION RESPONSE:", puterResult);

// // // //       console.log("RAW DIARIZATION SEGMENTS:", rawSegments);

// // // //       const normalizedSegments = normalizePuterSegments(rawSegments);

// // // //       if (normalizedSegments.length === 0) {
// // // //         const fallbackText = findTranscriptText(puterResult);

// // // //         if (fallbackText) {
// // // //           throw new Error(
// // // //             "Audio was transcribed, but Puter did not return speaker diarization segments. Check the browser console for FINAL PUTER DIARIZATION RESPONSE.",
// // // //           );
// // // //         }

// // // //         throw new Error(
// // // //           "Puter returned neither transcript text nor speaker segments.",
// // // //         );
// // // //       }

// // // //       // ==================================================
// // // //       // DOCTOR / PATIENT
// // // //       // ==================================================

// // // //       const roles = await identifySpeakerRoles(normalizedSegments);

// // // //       const finalSegments = normalizedSegments.map((segment) => ({
// // // //         ...segment,

// // // //         speaker_role:
// // // //           roles[segment.speaker] === "doctor" ||
// // // //           roles[segment.speaker] === "patient"
// // // //             ? roles[segment.speaker]
// // // //             : null,
// // // //       }));

// // // //       // ==================================================
// // // //       // FULL TEXT
// // // //       // ==================================================

// // // //       let transcriptText = findTranscriptText(puterResult);

// // // //       if (!transcriptText) {
// // // //         transcriptText = finalSegments
// // // //           .map((segment) => segment.text)
// // // //           .join(" ")
// // // //           .trim();
// // // //       }

// // // //       if (!transcriptText) {
// // // //         throw new Error("Transcription returned empty text.");
// // // //       }

// // // //       // ==================================================
// // // //       // SAVE
// // // //       // ==================================================

// // // //       const response = await fetch("/api/doctors/consultations/transcribe", {
// // // //         method: "POST",

// // // //         headers: {
// // // //           "Content-Type": "application/json",
// // // //         },

// // // //         credentials: "include",

// // // //         cache: "no-store",

// // // //         body: JSON.stringify({
// // // //           consultation_id: consultation.id,

// // // //           audio_recording_id: uploadedRecording.id,

// // // //           transcript_text: transcriptText,

// // // //           segments: finalSegments,

// // // //           provider: "puter",

// // // //           model: "gpt-4o-transcribe-diarize",

// // // //           language: selectedLanguage,
// // // //         }),
// // // //       });

// // // //       const data = await getResponseData(response);

// // // //       if (response.status === 401) {
// // // //         router.replace("/login");
// // // //         return;
// // // //       }

// // // //       if (response.status === 403) {
// // // //         router.replace("/unauthorized");
// // // //         return;
// // // //       }

// // // //       if (!response.ok) {
// // // //         setError(
// // // //           data.message || "Transcript generated but could not be saved.",
// // // //         );

// // // //         return;
// // // //       }

// // // //       setTranscript(data.transcript || null);

// // // //       setTranscriptSegments(
// // // //         Array.isArray(data.transcript_segments)
// // // //           ? data.transcript_segments
// // // //           : finalSegments,
// // // //       );

// // // //       setUploadedRecording((previous) =>
// // // //         previous
// // // //           ? {
// // // //               ...previous,
// // // //               status: "completed",
// // // //             }
// // // //           : previous,
// // // //       );

// // // //       setConsultation((previous) =>
// // // //         previous
// // // //           ? {
// // // //               ...previous,
// // // //               status: "transcribed",
// // // //             }
// // // //           : previous,
// // // //       );

// // // //       setSuccess(data.message || "Speaker transcript generated successfully.");
// // // //     } catch (error) {
// // // //       console.error("GENERATE DIARIZED TRANSCRIPT ERROR:", error);

// // // //       setError(error?.message || "Unable to generate speaker transcript.");
// // // //     } finally {
// // // //       setTranscribing(false);
// // // //     }
// // // //   }

// // // //   // ======================================================
// // // //   // CLEANUP
// // // //   // ======================================================

// // // //   useEffect(() => {
// // // //     return () => {
// // // //       stopTimer();

// // // //       if (recorderRef.current && recorderRef.current.state !== "inactive") {
// // // //         try {
// // // //           recorderRef.current.stop();
// // // //         } catch {}
// // // //       }

// // // //       stopMicrophoneStream();
// // // //     };
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     return () => {
// // // //       if (audioUrl) {
// // // //         URL.revokeObjectURL(audioUrl);
// // // //       }
// // // //     };
// // // //   }, [audioUrl]);

// // // //   // ======================================================
// // // //   // UI HELPERS
// // // //   // ======================================================

// // // //   function calculateAge(dateOfBirth) {
// // // //     if (!dateOfBirth) return null;

// // // //     const birthDate = new Date(dateOfBirth);
// // // //     const today = new Date();

// // // //     let age = today.getFullYear() - birthDate.getFullYear();

// // // //     const monthDifference = today.getMonth() - birthDate.getMonth();

// // // //     if (
// // // //       monthDifference < 0 ||
// // // //       (monthDifference === 0 && today.getDate() < birthDate.getDate())
// // // //     ) {
// // // //       age--;
// // // //     }

// // // //     return age;
// // // //   }

// // // //   function formatDate(date) {
// // // //     if (!date) return "—";

// // // //     return new Intl.DateTimeFormat("en-GB", {
// // // //       day: "2-digit",
// // // //       month: "short",
// // // //       year: "numeric",
// // // //     }).format(new Date(date));
// // // //   }

// // // //   function formatTime(time) {
// // // //     if (!time) return "—";

// // // //     const [hours, minutes] = time.split(":");

// // // //     const date = new Date();

// // // //     date.setHours(Number(hours));
// // // //     date.setMinutes(Number(minutes));
// // // //     date.setSeconds(0);

// // // //     return date.toLocaleTimeString("en-US", {
// // // //       hour: "numeric",
// // // //       minute: "2-digit",
// // // //       hour12: true,
// // // //     });
// // // //   }

// // // //   function getAppointmentStatus(status) {
// // // //     const statuses = {
// // // //       scheduled: {
// // // //         label: "Scheduled",
// // // //         tone: "gray",
// // // //       },

// // // //       checked_in: {
// // // //         label: "Checked in",
// // // //         tone: "blue",
// // // //       },

// // // //       waiting: {
// // // //         label: "Waiting",
// // // //         tone: "amber",
// // // //       },

// // // //       in_consultation: {
// // // //         label: "In consultation",
// // // //         tone: "blue",
// // // //       },

// // // //       completed: {
// // // //         label: "Completed",
// // // //         tone: "green",
// // // //       },

// // // //       cancelled: {
// // // //         label: "Cancelled",
// // // //         tone: "red",
// // // //       },

// // // //       no_show: {
// // // //         label: "No show",
// // // //         tone: "red",
// // // //       },
// // // //     };

// // // //     return (
// // // //       statuses[status] || {
// // // //         label: status || "Unknown",
// // // //         tone: "gray",
// // // //       }
// // // //     );
// // // //   }

// // // //   function getLanguageLabel(value) {
// // // //     return (
// // // //       TRANSCRIPTION_LANGUAGES.find((language) => language.value === value)
// // // //         ?.label ||
// // // //       value ||
// // // //       "Auto detect"
// // // //     );
// // // //   }

// // // //   function getSpeakerLabel(segment) {
// // // //     if (segment.speaker_role === "doctor") {
// // // //       return "Doctor";
// // // //     }

// // // //     if (segment.speaker_role === "patient") {
// // // //       return "Patient";
// // // //     }

// // // //     return segment.speaker || "Unknown speaker";
// // // //   }

// // // //   function getSpeakerTone(segment) {
// // // //     if (segment.speaker_role === "doctor") {
// // // //       return "blue";
// // // //     }

// // // //     if (segment.speaker_role === "patient") {
// // // //       return "green";
// // // //     }

// // // //     return "gray";
// // // //   }

// // // //   // ======================================================
// // // //   // LOADING
// // // //   // ======================================================

// // // //   if (loading) {
// // // //     return <ConsultationLoading />;
// // // //   }

// // // //   // ======================================================
// // // //   // ERROR PAGE
// // // //   // ======================================================

// // // //   if (!appointmentId || (error && !patient)) {
// // // //     return (
// // // //       <Shell
// // // //         role="doctor"
// // // //         title="New consultation"
// // // //         subtitle="Consultation unavailable"
// // // //       >
// // // //         <div className="max-w-4xl">
// // // //           <div className="rounded-2xl border bg-white px-6 py-16 text-center">
// // // //             <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 font-bold text-red-600">
// // // //               !
// // // //             </div>

// // // //             <h2 className="mt-4 text-xl font-bold">Consultation unavailable</h2>

// // // //             <p className="mt-2 text-sm text-slate-500">
// // // //               {error || "Appointment ID is missing."}
// // // //             </p>

// // // //             <Link
// // // //               href="/doctor"
// // // //               className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
// // // //             >
// // // //               Back to dashboard
// // // //             </Link>
// // // //           </div>
// // // //         </div>
// // // //       </Shell>
// // // //     );
// // // //   }

// // // //   if (!patient || !appointment) {
// // // //     return null;
// // // //   }

// // // //   // ======================================================
// // // //   // PAGE DATA
// // // //   // ======================================================

// // // //   const age = calculateAge(patient.date_of_birth);

// // // //   const appointmentStatus = getAppointmentStatus(appointment.status);

// // // //   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

// // // //   const consultationStarted = Boolean(consultation?.id);

// // // //   const consultationLocked =
// // // //     consultation?.status === "completed" || appointment?.status === "completed";

// // // //   // ======================================================
// // // //   // UI
// // // //   // ======================================================

// // // //   return (
// // // //     <Shell
// // // //       role="doctor"
// // // //       title="New consultation"
// // // //       subtitle={`${patient.name} · ${patient.patient_code}`}
// // // //     >
// // // //       <div className="max-w-5xl">
// // // //         {error && (
// // // //           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// // // //             {error}
// // // //           </div>
// // // //         )}

// // // //         {success && (
// // // //           <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
// // // //             {success}
// // // //           </div>
// // // //         )}

// // // //         {/* PATIENT */}

// // // //         <section className="rounded-2xl border bg-white p-6">
// // // //           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
// // // //             <div>
// // // //               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// // // //                 Patient
// // // //               </p>

// // // //               <h2 className="mt-2 text-2xl font-bold">{patient.name}</h2>

// // // //               <p className="mt-2 text-sm text-slate-500">
// // // //                 {age !== null ? `${age} years` : "Age not added"}

// // // //                 {" · "}

// // // //                 {patient.gender || "Gender not added"}

// // // //                 {" · "}

// // // //                 {patient.patient_code}
// // // //               </p>

// // // //               {patient.phone && (
// // // //                 <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
// // // //               )}
// // // //             </div>

// // // //             <div className="flex flex-wrap gap-3">
// // // //               <Badge tone={appointmentStatus.tone}>
// // // //                 {appointmentStatus.label}
// // // //               </Badge>

// // // //               <Link
// // // //                 href={`/doctor/patients/${patient.id}`}
// // // //                 className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
// // // //               >
// // // //                 View patient
// // // //               </Link>
// // // //             </div>
// // // //           </div>

// // // //           <div className="mt-6 border-t pt-5">
// // // //             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Appointment</p>

// // // //                 <p className="mt-1 text-sm font-semibold">#{appointment.id}</p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Date</p>

// // // //                 <p className="mt-1 text-sm font-semibold">
// // // //                   {formatDate(appointment.appointment_date)}
// // // //                 </p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Time</p>

// // // //                 <p className="mt-1 text-sm font-semibold">
// // // //                   {formatTime(appointment.appointment_time)}
// // // //                 </p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Token</p>

// // // //                 <p className="mt-1 text-sm font-semibold">
// // // //                   {appointment.token_number || "—"}
// // // //                 </p>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </section>

// // // //         {/* HISTORY */}

// // // //         <section className="mt-6 rounded-2xl border bg-white">
// // // //           <div className="flex items-center justify-between border-b p-5">
// // // //             <div>
// // // //               <h3 className="font-semibold">Patient history</h3>

// // // //               <p className="mt-1 text-xs text-slate-500">
// // // //                 Latest medical information
// // // //               </p>
// // // //             </div>

// // // //             <Link
// // // //               href={`/doctor/patients/${patient.id}`}
// // // //               className="text-sm font-medium text-blue-600"
// // // //             >
// // // //               Full history
// // // //             </Link>
// // // //           </div>

// // // //           {!latestHistory ? (
// // // //             <div className="p-6 text-sm text-slate-500">
// // // //               No medical history added.
// // // //             </div>
// // // //           ) : (
// // // //             <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Previous diseases</p>

// // // //                 <p className="mt-1 text-sm font-medium">
// // // //                   {latestHistory.previous_diseases || "None reported"}
// // // //                 </p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Allergies</p>

// // // //                 <p className="mt-1 text-sm font-medium">
// // // //                   {latestHistory.allergies || "None reported"}
// // // //                 </p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Current medications</p>

// // // //                 <p className="mt-1 text-sm font-medium">
// // // //                   {latestHistory.current_medications || "None reported"}
// // // //                 </p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Previous surgeries</p>

// // // //                 <p className="mt-1 text-sm font-medium">
// // // //                   {latestHistory.previous_surgeries || "None reported"}
// // // //                 </p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Family history</p>

// // // //                 <p className="mt-1 text-sm font-medium">
// // // //                   {latestHistory.family_history || "None reported"}
// // // //                 </p>
// // // //               </div>

// // // //               <div>
// // // //                 <p className="text-xs text-slate-400">Additional notes</p>

// // // //                 <p className="mt-1 text-sm font-medium">
// // // //                   {latestHistory.additional_notes || "No notes"}
// // // //                 </p>
// // // //               </div>
// // // //             </div>
// // // //           )}
// // // //         </section>

// // // //         {/* CONSULTATION */}

// // // //         <section className="mt-6 rounded-2xl border bg-white p-6">
// // // //           {!consultationStarted ? (
// // // //             <div className="rounded-2xl border-2 border-dashed p-10 text-center">
// // // //               <Icon name="mic" size={28} />

// // // //               <h3 className="mt-4 text-xl font-bold">
// // // //                 Ready to start consultation
// // // //               </h3>

// // // //               <button
// // // //                 type="button"
// // // //                 disabled={starting}
// // // //                 onClick={handleStartConsultation}
// // // //                 className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
// // // //               >
// // // //                 {starting ? "Starting..." : "Start consultation"}
// // // //               </button>
// // // //             </div>
// // // //           ) : (
// // // //             <>
// // // //               <div className="rounded-xl bg-slate-50 p-5">
// // // //                 <div className="grid gap-5 sm:grid-cols-3">
// // // //                   <div>
// // // //                     <p className="text-xs text-slate-400">Consultation ID</p>

// // // //                     <p className="mt-1 font-semibold">#{consultation.id}</p>
// // // //                   </div>

// // // //                   <div>
// // // //                     <p className="text-xs text-slate-400">Status</p>

// // // //                     <p className="mt-1 font-semibold capitalize">
// // // //                       {consultation.status?.replaceAll("_", " ")}
// // // //                     </p>
// // // //                   </div>

// // // //                   <div>
// // // //                     <p className="text-xs text-slate-400">Started</p>

// // // //                     <p className="mt-1 font-semibold">
// // // //                       {consultation.started_at
// // // //                         ? new Date(consultation.started_at).toLocaleString()
// // // //                         : "—"}
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>
// // // //               </div>

// // // //               {/* RECORDING */}

// // // //               <div className="mt-6 rounded-2xl border-2 border-dashed p-8 text-center">
// // // //                 <Icon name="mic" size={28} />

// // // //                 <div className="mt-4">
// // // //                   <Badge
// // // //                     tone={
// // // //                       isRecording ? "red" : uploadedRecording ? "green" : "blue"
// // // //                     }
// // // //                   >
// // // //                     {isRecording
// // // //                       ? isPaused
// // // //                         ? "Recording paused"
// // // //                         : "Recording"
// // // //                       : uploadedRecording
// // // //                         ? "Audio saved"
// // // //                         : "Ready to record"}
// // // //                   </Badge>
// // // //                 </div>

// // // //                 {(isRecording || recordingSeconds > 0) && (
// // // //                   <div className="mt-5 text-3xl font-bold tabular-nums">
// // // //                     {formatDuration(recordingSeconds)}
// // // //                   </div>
// // // //                 )}

// // // //                 {!isRecording &&
// // // //                   !audioBlob &&
// // // //                   !uploadedRecording &&
// // // //                   !consultationLocked && (
// // // //                     <button
// // // //                       type="button"
// // // //                       onClick={handleStartRecording}
// // // //                       className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
// // // //                     >
// // // //                       Start recording
// // // //                     </button>
// // // //                   )}

// // // //                 {isRecording && (
// // // //                   <div className="mt-6 flex justify-center gap-3">
// // // //                     {!isPaused ? (
// // // //                       <button
// // // //                         onClick={handlePauseRecording}
// // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // //                       >
// // // //                         Pause
// // // //                       </button>
// // // //                     ) : (
// // // //                       <button
// // // //                         onClick={handleResumeRecording}
// // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // //                       >
// // // //                         Resume
// // // //                       </button>
// // // //                     )}

// // // //                     <button
// // // //                       onClick={handleStopRecording}
// // // //                       className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
// // // //                     >
// // // //                       Stop
// // // //                     </button>
// // // //                   </div>
// // // //                 )}

// // // //                 {audioBlob && !uploadedRecording && !isRecording && (
// // // //                   <div className="mt-7">
// // // //                     <audio
// // // //                       controls
// // // //                       src={audioUrl}
// // // //                       className="mx-auto w-full max-w-lg"
// // // //                     />

// // // //                     <div className="mt-4 flex justify-center gap-3">
// // // //                       <button
// // // //                         disabled={uploadingAudio}
// // // //                         onClick={handleUploadAudio}
// // // //                         className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
// // // //                       >
// // // //                         {uploadingAudio ? "Saving..." : "Save recording"}
// // // //                       </button>

// // // //                       <button
// // // //                         disabled={uploadingAudio}
// // // //                         onClick={handleRecordAgain}
// // // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // // //                       >
// // // //                         Record again
// // // //                       </button>
// // // //                     </div>
// // // //                   </div>
// // // //                 )}

// // // //                 {uploadedRecording && (
// // // //                   <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
// // // //                     <div className="flex items-center justify-between">
// // // //                       <div>
// // // //                         <p className="font-semibold text-emerald-900">
// // // //                           Recording saved
// // // //                         </p>

// // // //                         <p className="text-xs text-emerald-700">
// // // //                           #{uploadedRecording.id}
// // // //                         </p>
// // // //                       </div>

// // // //                       <Badge tone="green">Uploaded</Badge>
// // // //                     </div>

// // // //                     {uploadedRecording.audio_url && (
// // // //                       <audio
// // // //                         controls
// // // //                         src={uploadedRecording.audio_url}
// // // //                         className="mt-5 w-full"
// // // //                       />
// // // //                     )}

// // // //                     <div className="mt-5 border-t border-emerald-200 pt-5">
// // // //                       <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
// // // //                         <div>
// // // //                           <label className="mb-2 block text-xs font-semibold text-emerald-800">
// // // //                             Transcript language
// // // //                           </label>

// // // //                           <div className="flex flex-col gap-3 sm:flex-row">
// // // //                             <select
// // // //                               value={selectedLanguage}
// // // //                               onChange={(event) =>
// // // //                                 setSelectedLanguage(event.target.value)
// // // //                               }
// // // //                               disabled={transcribing || deletingRecording}
// // // //                               className="rounded-xl border bg-white px-4 py-3 text-sm"
// // // //                             >
// // // //                               {TRANSCRIPTION_LANGUAGES.map((language) => (
// // // //                                 <option
// // // //                                   key={language.value}
// // // //                                   value={language.value}
// // // //                                 >
// // // //                                   {language.label}
// // // //                                 </option>
// // // //                               ))}
// // // //                             </select>

// // // //                             <button
// // // //                               type="button"
// // // //                               disabled={transcribing || deletingRecording}
// // // //                               onClick={handleGenerateTranscript}
// // // //                               className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
// // // //                             >
// // // //                               {transcribing
// // // //                                 ? "Detecting speakers..."
// // // //                                 : transcript
// // // //                                   ? "Regenerate speaker transcript"
// // // //                                   : "Generate speaker transcript"}
// // // //                             </button>
// // // //                           </div>
// // // //                         </div>

// // // //                         <button
// // // //                           type="button"
// // // //                           disabled={deletingRecording || transcribing}
// // // //                           onClick={handleDeleteRecording}
// // // //                           className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600"
// // // //                         >
// // // //                           {deletingRecording
// // // //                             ? "Deleting..."
// // // //                             : "Delete recording"}
// // // //                         </button>
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>
// // // //                 )}
// // // //               </div>

// // // //               {/* TRANSCRIPT */}

// // // //               {transcript && (
// // // //                 <section className="mt-6 overflow-hidden rounded-2xl border">
// // // //                   <div className="flex items-center justify-between border-b p-5">
// // // //                     <div>
// // // //                       <h3 className="font-semibold">Consultation transcript</h3>

// // // //                       <p className="mt-1 text-xs text-slate-500">
// // // //                         Speaker-separated timeline
// // // //                       </p>
// // // //                     </div>

// // // //                     <Badge tone="green">Transcript ready</Badge>
// // // //                   </div>

// // // //                   <div className="p-5">
// // // //                     {transcriptSegments.length > 0 ? (
// // // //                       <div className="space-y-4">
// // // //                         {transcriptSegments.map((segment, index) => (
// // // //                           <article
// // // //                             key={
// // // //                               segment.id || `${segment.segment_index}-${index}`
// // // //                             }
// // // //                             className={`rounded-2xl border p-5 ${
// // // //                               segment.speaker_role === "doctor"
// // // //                                 ? "bg-blue-50/50"
// // // //                                 : segment.speaker_role === "patient"
// // // //                                   ? "bg-emerald-50/50"
// // // //                                   : "bg-slate-50"
// // // //                             }`}
// // // //                           >
// // // //                             <div className="flex items-center justify-between gap-3">
// // // //                               <div className="flex items-center gap-2">
// // // //                                 <Badge tone={getSpeakerTone(segment)}>
// // // //                                   {getSpeakerLabel(segment)}
// // // //                                 </Badge>

// // // //                                 <span className="text-xs text-slate-400">
// // // //                                   {segment.speaker}
// // // //                                 </span>
// // // //                               </div>

// // // //                               <span className="text-xs font-semibold text-slate-500">
// // // //                                 {formatTranscriptTime(segment.start_time)}
// // // //                                 {" – "}
// // // //                                 {formatTranscriptTime(segment.end_time)}
// // // //                               </span>
// // // //                             </div>

// // // //                             <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // // //                               {segment.text}
// // // //                             </p>
// // // //                           </article>
// // // //                         ))}
// // // //                       </div>
// // // //                     ) : (
// // // //                       <div className="rounded-xl bg-slate-50 p-5">
// // // //                         <p className="whitespace-pre-wrap text-sm leading-7">
// // // //                           {transcript.edited_text ||
// // // //                             transcript.full_text ||
// // // //                             "Transcript is empty."}
// // // //                         </p>
// // // //                       </div>
// // // //                     )}

// // // //                     <div className="mt-6 flex flex-wrap gap-5 border-t pt-5 text-xs text-slate-400">
// // // //                       <span>Transcript #{transcript.id}</span>

// // // //                       <span>{transcriptSegments.length} segments</span>

// // // //                       <span>
// // // //                         Language:{" "}
// // // //                         {getLanguageLabel(
// // // //                           transcript.language || selectedLanguage,
// // // //                         )}
// // // //                       </span>

// // // //                       <span className="capitalize">
// // // //                         Status: {transcript.status}
// // // //                       </span>
// // // //                     </div>
// // // //                   </div>
// // // //                 </section>
// // // //               )}
// // // //             </>
// // // //           )}

// // // //           {/* PROCESS */}

// // // //           <div className="mt-6 grid gap-3 md:grid-cols-3">
// // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // //               <div className="text-xs text-slate-400">01</div>

// // // //               <div className="mt-2 font-semibold">Patient history</div>

// // // //               <div className="mt-1 text-xs text-emerald-600">Available</div>
// // // //             </div>

// // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // //               <div className="text-xs text-slate-400">02</div>

// // // //               <div className="mt-2 font-semibold">Audio recording</div>

// // // //               <div className="mt-1 text-xs text-slate-500">
// // // //                 {uploadedRecording ? "Recording saved" : "Ready"}
// // // //               </div>
// // // //             </div>

// // // //             <div className="rounded-xl bg-slate-50 p-4">
// // // //               <div className="text-xs text-slate-400">03</div>

// // // //               <div className="mt-2 font-semibold">Speaker transcript</div>

// // // //               <div className="mt-1 text-xs text-slate-500">
// // // //                 {transcript
// // // //                   ? `${transcriptSegments.length} segments ready`
// // // //                   : transcribing
// // // //                     ? "Processing..."
// // // //                     : "Ready to generate"}
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </section>

// // // //         <div className="mt-6">
// // // //           <Link
// // // //             href="/doctor"
// // // //             className="text-sm font-medium text-slate-600 hover:text-slate-950"
// // // //           >
// // // //             ← Back to dashboard
// // // //           </Link>
// // // //         </div>
// // // //       </div>
// // // //     </Shell>
// // // //   );
// // // // }

// // // "use client";

// // // import { Suspense, useEffect, useRef, useState } from "react";
// // // import { useRouter, useSearchParams } from "next/navigation";
// // // import Link from "next/link";

// // // import Shell from "@/components/Shell";
// // // import Icon from "@/components/Icon";
// // // import Badge from "@/components/Badge";

// // // // ======================================================
// // // // LANGUAGES
// // // // ======================================================

// // // const TRANSCRIPTION_LANGUAGES = [
// // //   {
// // //     value: "auto",
// // //     label: "Auto detect",
// // //   },
// // //   {
// // //     value: "en",
// // //     label: "English",
// // //   },
// // //   {
// // //     value: "ur",
// // //     label: "Urdu",
// // //   },
// // //   {
// // //     value: "roman-ur",
// // //     label: "Roman Urdu",
// // //   },
// // //   {
// // //     value: "hi",
// // //     label: "Hindi",
// // //   },
// // //   {
// // //     value: "ar",
// // //     label: "Arabic",
// // //   },
// // //   {
// // //     value: "pa",
// // //     label: "Punjabi",
// // //   },
// // // ];

// // // // Languages we are willing to pass directly to STT provider.
// // // // Punjabi / Roman Urdu are intentionally omitted because
// // // // upstream rejected "pa", and "roman-ur" isn't an ISO STT code.
// // // const PROVIDER_LANGUAGE_CODES = {
// // //   en: "en",
// // //   ur: "ur",
// // //   hi: "hi",
// // //   ar: "ar",
// // // };

// // // // ======================================================
// // // // PAGE
// // // // ======================================================

// // // export default function NewConsultationPage() {
// // //   return (
// // //     <Suspense fallback={<ConsultationLoading />}>
// // //       <NewConsultationContent />
// // //     </Suspense>
// // //   );
// // // }

// // // // ======================================================
// // // // LOADING
// // // // ======================================================

// // // function ConsultationLoading() {
// // //   return (
// // //     <Shell
// // //       role="doctor"
// // //       title="New consultation"
// // //       subtitle="Loading consultation"
// // //     >
// // //       <div className="max-w-5xl">
// // //         <div className="rounded-2xl border bg-white px-6 py-20 text-center">
// // //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

// // //           <p className="mt-4 text-sm text-slate-500">Loading consultation...</p>
// // //         </div>
// // //       </div>
// // //     </Shell>
// // //   );
// // // }

// // // // ======================================================
// // // // MAIN
// // // // ======================================================

// // // function NewConsultationContent() {
// // //   const router = useRouter();
// // //   const searchParams = useSearchParams();

// // //   const appointmentId = searchParams.get("appointment");

// // //   // ======================================================
// // //   // MAIN DATA
// // //   // ======================================================

// // //   const [appointment, setAppointment] = useState(null);

// // //   const [patient, setPatient] = useState(null);

// // //   const [medicalHistory, setMedicalHistory] = useState([]);

// // //   const [consultation, setConsultation] = useState(null);

// // //   // ======================================================
// // //   // PAGE STATE
// // //   // ======================================================

// // //   const [loading, setLoading] = useState(true);

// // //   const [starting, setStarting] = useState(false);

// // //   const [error, setError] = useState("");

// // //   const [success, setSuccess] = useState("");

// // //   // ======================================================
// // //   // RECORDING
// // //   // ======================================================

// // //   const [isRecording, setIsRecording] = useState(false);

// // //   const [isPaused, setIsPaused] = useState(false);

// // //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// // //   const [audioBlob, setAudioBlob] = useState(null);

// // //   const [audioUrl, setAudioUrl] = useState("");

// // //   const [uploadingAudio, setUploadingAudio] = useState(false);

// // //   const [deletingRecording, setDeletingRecording] = useState(false);

// // //   const [uploadedRecording, setUploadedRecording] = useState(null);

// // //   // ======================================================
// // //   // TRANSCRIPTION
// // //   // ======================================================

// // //   const [transcribing, setTranscribing] = useState(false);

// // //   const [selectedLanguage, setSelectedLanguage] = useState("auto");

// // //   const [transcript, setTranscript] = useState(null);

// // //   const [transcriptSegments, setTranscriptSegments] = useState([]);

// // //   // ======================================================
// // //   // REFS
// // //   // ======================================================

// // //   const recorderRef = useRef(null);

// // //   const streamRef = useRef(null);

// // //   const timerRef = useRef(null);

// // //   const chunksRef = useRef([]);

// // //   // ======================================================
// // //   // SAFE RESPONSE
// // //   // ======================================================

// // //   async function getResponseData(response) {
// // //     const contentType = response.headers.get("content-type") || "";

// // //     if (contentType.includes("application/json")) {
// // //       return await response.json();
// // //     }

// // //     const text = await response.text();

// // //     throw new Error(
// // //       text
// // //         ? `Server returned an invalid response (${response.status}).`
// // //         : "Server returned an invalid response.",
// // //     );
// // //   }

// // //   // ======================================================
// // //   // LOAD CONSULTATION
// // //   // ======================================================

// // //   async function loadConsultationData() {
// // //     if (!appointmentId) {
// // //       setError("Appointment ID is missing.");

// // //       setLoading(false);

// // //       return;
// // //     }

// // //     const numericAppointmentId = Number(appointmentId);

// // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // //       setError("Invalid appointment ID.");

// // //       setLoading(false);

// // //       return;
// // //     }

// // //     try {
// // //       setLoading(true);

// // //       setError("");

// // //       const response = await fetch(
// // //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// // //           numericAppointmentId,
// // //         )}`,
// // //         {
// // //           method: "GET",

// // //           credentials: "include",

// // //           cache: "no-store",
// // //         },
// // //       );

// // //       const data = await getResponseData(response);

// // //       console.log("LOAD CONSULTATION RESPONSE:", {
// // //         status: response.status,
// // //         data,
// // //       });

// // //       if (response.status === 401) {
// // //         router.replace("/login");

// // //         return;
// // //       }

// // //       if (response.status === 403) {
// // //         router.replace("/unauthorized");

// // //         return;
// // //       }

// // //       if (!response.ok) {
// // //         setError(data.message || "Unable to load consultation information.");

// // //         return;
// // //       }

// // //       setAppointment(data.appointment || null);

// // //       setPatient(data.patient || null);

// // //       setMedicalHistory(
// // //         Array.isArray(data.medical_history) ? data.medical_history : [],
// // //       );

// // //       setConsultation(data.consultation || null);

// // //       setUploadedRecording(data.audio_recording || null);

// // //       setTranscript(data.transcript || null);

// // //       setTranscriptSegments(
// // //         Array.isArray(data.transcript_segments) ? data.transcript_segments : [],
// // //       );

// // //       if (data.transcript?.language) {
// // //         const savedLanguage = data.transcript.language;

// // //         const valid = TRANSCRIPTION_LANGUAGES.some(
// // //           (item) => item.value === savedLanguage,
// // //         );

// // //         if (valid) {
// // //           setSelectedLanguage(savedLanguage);
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.error("LOAD CONSULTATION ERROR:", error);

// // //       setError(error?.message || "Unable to connect to the server.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }

// // //   useEffect(() => {
// // //     loadConsultationData();
// // //   }, [appointmentId]);

// // //   // ======================================================
// // //   // START CONSULTATION
// // //   // ======================================================

// // //   async function handleStartConsultation() {
// // //     const numericAppointmentId = Number(appointmentId);

// // //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// // //       setError("Valid appointment ID is required.");

// // //       return;
// // //     }

// // //     try {
// // //       setStarting(true);

// // //       setError("");

// // //       setSuccess("");

// // //       const response = await fetch("/api/doctors/consultations/start", {
// // //         method: "POST",

// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },

// // //         credentials: "include",

// // //         cache: "no-store",

// // //         body: JSON.stringify({
// // //           appointment_id: numericAppointmentId,
// // //         }),
// // //       });

// // //       const data = await getResponseData(response);

// // //       if (response.status === 401) {
// // //         router.replace("/login");

// // //         return;
// // //       }

// // //       if (response.status === 403) {
// // //         router.replace("/unauthorized");

// // //         return;
// // //       }

// // //       if (!response.ok) {
// // //         setError(data.message || "Unable to start consultation.");

// // //         return;
// // //       }

// // //       if (!data.consultation?.id) {
// // //         setError("Server did not return consultation information.");

// // //         return;
// // //       }

// // //       setConsultation(data.consultation);

// // //       if (data.appointment) {
// // //         setAppointment((previous) => ({
// // //           ...(previous || {}),
// // //           ...data.appointment,
// // //         }));
// // //       } else {
// // //         setAppointment((previous) =>
// // //           previous
// // //             ? {
// // //                 ...previous,
// // //                 status: "in_consultation",
// // //               }
// // //             : previous,
// // //         );
// // //       }

// // //       if (data.audio_recording) {
// // //         setUploadedRecording(data.audio_recording);
// // //       }

// // //       if (data.transcript) {
// // //         setTranscript(data.transcript);
// // //       }

// // //       if (Array.isArray(data.transcript_segments)) {
// // //         setTranscriptSegments(data.transcript_segments);
// // //       }

// // //       setSuccess(data.message || "Consultation started successfully.");
// // //     } catch (error) {
// // //       console.error("START CONSULTATION ERROR:", error);

// // //       setError(error?.message || "Unable to connect to the server.");
// // //     } finally {
// // //       setStarting(false);
// // //     }
// // //   }

// // //   // ======================================================
// // //   // TIMER
// // //   // ======================================================

// // //   function stopTimer() {
// // //     if (timerRef.current) {
// // //       clearInterval(timerRef.current);

// // //       timerRef.current = null;
// // //     }
// // //   }

// // //   function startTimer() {
// // //     stopTimer();

// // //     timerRef.current = setInterval(() => {
// // //       setRecordingSeconds((previous) => previous + 1);
// // //     }, 1000);
// // //   }

// // //   function formatDuration(totalSeconds) {
// // //     const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

// // //     const minutes = Math.floor(safeSeconds / 60);

// // //     const seconds = Math.floor(safeSeconds % 60);

// // //     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
// // //       2,
// // //       "0",
// // //     )}`;
// // //   }

// // //   function formatTranscriptTime(value) {
// // //     const seconds = Math.max(0, Math.floor(Number(value) || 0));

// // //     const hours = Math.floor(seconds / 3600);

// // //     const minutes = Math.floor((seconds % 3600) / 60);

// // //     const remainingSeconds = seconds % 60;

// // //     if (hours > 0) {
// // //       return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
// // //         2,
// // //         "0",
// // //       )}:${String(remainingSeconds).padStart(2, "0")}`;
// // //     }

// // //     return `${String(minutes).padStart(2, "0")}:${String(
// // //       remainingSeconds,
// // //     ).padStart(2, "0")}`;
// // //   }

// // //   // ======================================================
// // //   // MICROPHONE
// // //   // ======================================================

// // //   function stopMicrophoneStream() {
// // //     if (!streamRef.current) {
// // //       return;
// // //     }

// // //     streamRef.current.getTracks().forEach((track) => {
// // //       track.stop();
// // //     });

// // //     streamRef.current = null;
// // //   }

// // //   // ======================================================
// // //   // START RECORDING
// // //   // ======================================================

// // //   async function handleStartRecording() {
// // //     try {
// // //       setError("");

// // //       setSuccess("");

// // //       if (!consultation?.id) {
// // //         setError("Start the consultation before recording.");

// // //         return;
// // //       }

// // //       if (
// // //         typeof window === "undefined" ||
// // //         !navigator.mediaDevices ||
// // //         !navigator.mediaDevices.getUserMedia ||
// // //         typeof MediaRecorder === "undefined"
// // //       ) {
// // //         setError("Microphone recording is not supported in this browser.");

// // //         return;
// // //       }

// // //       const stream = await navigator.mediaDevices.getUserMedia({
// // //         audio: {
// // //           echoCancellation: true,
// // //           noiseSuppression: true,
// // //           autoGainControl: true,
// // //         },
// // //       });

// // //       streamRef.current = stream;

// // //       let mimeType = "";

// // //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// // //         mimeType = "audio/webm;codecs=opus";
// // //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// // //         mimeType = "audio/webm";
// // //       } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
// // //         mimeType = "audio/ogg;codecs=opus";
// // //       } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
// // //         mimeType = "audio/ogg";
// // //       }

// // //       const recorder = mimeType
// // //         ? new MediaRecorder(stream, {
// // //             mimeType,
// // //           })
// // //         : new MediaRecorder(stream);

// // //       recorderRef.current = recorder;

// // //       chunksRef.current = [];

// // //       if (audioUrl) {
// // //         URL.revokeObjectURL(audioUrl);
// // //       }

// // //       setAudioBlob(null);

// // //       setAudioUrl("");

// // //       setUploadedRecording(null);

// // //       setTranscript(null);

// // //       setTranscriptSegments([]);

// // //       setRecordingSeconds(0);

// // //       setIsPaused(false);

// // //       recorder.ondataavailable = (event) => {
// // //         if (event.data && event.data.size > 0) {
// // //           chunksRef.current.push(event.data);
// // //         }
// // //       };

// // //       recorder.onstop = () => {
// // //         const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

// // //         const blob = new Blob(chunksRef.current, {
// // //           type: finalMimeType,
// // //         });

// // //         if (blob.size <= 0) {
// // //           setError("Recording is empty. Please record again.");

// // //           setIsRecording(false);

// // //           setIsPaused(false);

// // //           stopTimer();

// // //           stopMicrophoneStream();

// // //           recorderRef.current = null;

// // //           return;
// // //         }

// // //         const previewUrl = URL.createObjectURL(blob);

// // //         setAudioBlob(blob);

// // //         setAudioUrl(previewUrl);

// // //         setIsRecording(false);

// // //         setIsPaused(false);

// // //         stopTimer();

// // //         stopMicrophoneStream();

// // //         recorderRef.current = null;
// // //       };

// // //       recorder.onerror = (event) => {
// // //         console.error("MEDIA RECORDER ERROR:", event.error);

// // //         setError("An error occurred while recording.");

// // //         setIsRecording(false);

// // //         setIsPaused(false);

// // //         stopTimer();

// // //         stopMicrophoneStream();

// // //         recorderRef.current = null;
// // //       };

// // //       recorder.start(1000);

// // //       setIsRecording(true);

// // //       setIsPaused(false);

// // //       startTimer();
// // //     } catch (error) {
// // //       console.error("START RECORDING ERROR:", error);

// // //       stopMicrophoneStream();

// // //       if (error?.name === "NotAllowedError") {
// // //         setError(
// // //           "Microphone permission was denied. Please allow microphone access.",
// // //         );
// // //       } else if (error?.name === "NotFoundError") {
// // //         setError("No microphone was found on this device.");
// // //       } else {
// // //         setError(error?.message || "Unable to start microphone recording.");
// // //       }
// // //     }
// // //   }

// // //   // ======================================================
// // //   // PAUSE
// // //   // ======================================================

// // //   function handlePauseRecording() {
// // //     const recorder = recorderRef.current;

// // //     if (recorder && recorder.state === "recording") {
// // //       recorder.pause();

// // //       setIsPaused(true);

// // //       stopTimer();
// // //     }
// // //   }

// // //   // ======================================================
// // //   // RESUME
// // //   // ======================================================

// // //   function handleResumeRecording() {
// // //     const recorder = recorderRef.current;

// // //     if (recorder && recorder.state === "paused") {
// // //       recorder.resume();

// // //       setIsPaused(false);

// // //       startTimer();
// // //     }
// // //   }

// // //   // ======================================================
// // //   // STOP
// // //   // ======================================================

// // //   function handleStopRecording() {
// // //     const recorder = recorderRef.current;

// // //     if (
// // //       recorder &&
// // //       (recorder.state === "recording" || recorder.state === "paused")
// // //     ) {
// // //       recorder.stop();
// // //     }
// // //   }

// // //   // ======================================================
// // //   // RECORD AGAIN
// // //   // ======================================================

// // //   function handleRecordAgain() {
// // //     if (audioUrl) {
// // //       URL.revokeObjectURL(audioUrl);
// // //     }

// // //     setAudioBlob(null);

// // //     setAudioUrl("");

// // //     setRecordingSeconds(0);

// // //     setUploadedRecording(null);

// // //     setTranscript(null);

// // //     setTranscriptSegments([]);

// // //     setError("");

// // //     setSuccess("");
// // //   }

// // //   // ======================================================
// // //   // UPLOAD AUDIO
// // //   // ======================================================

// // //   async function handleUploadAudio() {
// // //     if (!audioBlob) {
// // //       setError("Record audio before saving.");

// // //       return;
// // //     }

// // //     if (!consultation?.id) {
// // //       setError("Consultation ID is missing.");

// // //       return;
// // //     }

// // //     try {
// // //       setUploadingAudio(true);

// // //       setError("");

// // //       setSuccess("");

// // //       const blobType = audioBlob.type || "audio/webm";

// // //       let extension = "webm";

// // //       if (blobType.includes("ogg")) {
// // //         extension = "ogg";
// // //       } else if (blobType.includes("mp4")) {
// // //         extension = "mp4";
// // //       } else if (blobType.includes("mpeg")) {
// // //         extension = "mp3";
// // //       } else if (blobType.includes("wav")) {
// // //         extension = "wav";
// // //       } else if (blobType.includes("m4a")) {
// // //         extension = "m4a";
// // //       }

// // //       const file = new File(
// // //         [audioBlob],

// // //         `consultation-${consultation.id}.${extension}`,

// // //         {
// // //           type: blobType,
// // //         },
// // //       );

// // //       const formData = new FormData();

// // //       formData.append("consultation_id", String(consultation.id));

// // //       formData.append("duration_seconds", String(recordingSeconds));

// // //       formData.append("audio", file);

// // //       const response = await fetch("/api/doctors/consultations/audio", {
// // //         method: "POST",

// // //         credentials: "include",

// // //         cache: "no-store",

// // //         body: formData,
// // //       });

// // //       const data = await getResponseData(response);

// // //       if (response.status === 401) {
// // //         router.replace("/login");

// // //         return;
// // //       }

// // //       if (response.status === 403) {
// // //         router.replace("/unauthorized");

// // //         return;
// // //       }

// // //       if (!response.ok) {
// // //         setError(data.message || "Unable to save audio recording.");

// // //         return;
// // //       }

// // //       if (!data.audio_recording?.id) {
// // //         setError(
// // //           "Audio uploaded but server did not return recording information.",
// // //         );

// // //         return;
// // //       }

// // //       setUploadedRecording(data.audio_recording);

// // //       setTranscript(null);

// // //       setTranscriptSegments([]);

// // //       setConsultation((previous) =>
// // //         previous
// // //           ? {
// // //               ...previous,
// // //               status: "recorded",
// // //             }
// // //           : previous,
// // //       );

// // //       setSuccess(data.message || "Audio recording saved successfully.");
// // //     } catch (error) {
// // //       console.error("UPLOAD AUDIO ERROR:", error);

// // //       setError(error?.message || "Unable to upload audio recording.");
// // //     } finally {
// // //       setUploadingAudio(false);
// // //     }
// // //   }

// // //   // ======================================================
// // //   // DELETE RECORDING
// // //   // ======================================================

// // //   async function handleDeleteRecording() {
// // //     if (!consultation?.id) {
// // //       setError("Consultation ID is missing.");

// // //       return;
// // //     }

// // //     if (!uploadedRecording?.id) {
// // //       setError("Audio recording ID is missing.");

// // //       return;
// // //     }

// // //     const confirmed = window.confirm(
// // //       transcript?.id
// // //         ? "Delete this recording? Its transcript and speaker segments will also be removed. This action cannot be undone."
// // //         : "Delete this recording? This action cannot be undone.",
// // //     );

// // //     if (!confirmed) {
// // //       return;
// // //     }

// // //     try {
// // //       setDeletingRecording(true);

// // //       setError("");

// // //       setSuccess("");

// // //       const response = await fetch("/api/doctors/consultations/audio", {
// // //         method: "DELETE",

// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },

// // //         credentials: "include",

// // //         cache: "no-store",

// // //         body: JSON.stringify({
// // //           consultation_id: consultation.id,

// // //           audio_recording_id: uploadedRecording.id,
// // //         }),
// // //       });

// // //       const data = await getResponseData(response);

// // //       if (response.status === 401) {
// // //         router.replace("/login");

// // //         return;
// // //       }

// // //       if (response.status === 403) {
// // //         router.replace("/unauthorized");

// // //         return;
// // //       }

// // //       if (!response.ok) {
// // //         setError(data.message || "Unable to delete recording.");

// // //         return;
// // //       }

// // //       if (audioUrl) {
// // //         URL.revokeObjectURL(audioUrl);
// // //       }

// // //       setAudioBlob(null);

// // //       setAudioUrl("");

// // //       setRecordingSeconds(0);

// // //       setTranscript(null);

// // //       setTranscriptSegments([]);

// // //       setUploadedRecording(data.remaining_audio_recording || null);

// // //       if (data.consultation) {
// // //         setConsultation((previous) => ({
// // //           ...(previous || {}),
// // //           ...data.consultation,
// // //         }));
// // //       } else {
// // //         setConsultation((previous) =>
// // //           previous
// // //             ? {
// // //                 ...previous,

// // //                 status: data.remaining_audio_recording ? "recorded" : "draft",
// // //               }
// // //             : previous,
// // //         );
// // //       }

// // //       setSuccess(data.message || "Recording deleted successfully.");
// // //     } catch (error) {
// // //       console.error("DELETE RECORDING ERROR:", error);

// // //       setError(error?.message || "Unable to delete recording.");
// // //     } finally {
// // //       setDeletingRecording(false);
// // //     }
// // //   }

// // //   // ======================================================
// // //   // PUTER RESPONSE HELPERS
// // //   // ======================================================

// // //   function findTranscriptText(result) {
// // //     const candidates = [
// // //       result?.text,

// // //       result?.data?.text,

// // //       result?.result?.text,

// // //       result?.output?.text,

// // //       result?.transcript?.text,
// // //     ];

// // //     for (const candidate of candidates) {
// // //       if (typeof candidate === "string" && candidate.trim()) {
// // //         return candidate.trim();
// // //       }
// // //     }

// // //     if (typeof result === "string" && result.trim()) {
// // //       return result.trim();
// // //     }

// // //     return "";
// // //   }

// // //   function findRawSegments(result) {
// // //     const candidates = [
// // //       result?.segments,

// // //       result?.data?.segments,

// // //       result?.result?.segments,

// // //       result?.output?.segments,

// // //       result?.transcript?.segments,
// // //     ];

// // //     for (const candidate of candidates) {
// // //       if (Array.isArray(candidate) && candidate.length > 0) {
// // //         return candidate;
// // //       }
// // //     }

// // //     return [];
// // //   }

// // //   function findWords(result) {
// // //     const candidates = [
// // //       result?.words,

// // //       result?.data?.words,

// // //       result?.result?.words,

// // //       result?.output?.words,
// // //     ];

// // //     for (const candidate of candidates) {
// // //       if (Array.isArray(candidate) && candidate.length > 0) {
// // //         return candidate;
// // //       }
// // //     }

// // //     return [];
// // //   }

// // //   // ======================================================
// // //   // NORMALIZE OPENAI SEGMENTS
// // //   // ======================================================

// // //   function normalizePuterSegments(rawSegments) {
// // //     if (!Array.isArray(rawSegments)) {
// // //       return [];
// // //     }

// // //     return rawSegments
// // //       .map((segment, index) => {
// // //         const start =
// // //           Number(
// // //             segment?.start ?? segment?.start_time ?? segment?.startTime ?? 0,
// // //           ) || 0;

// // //         const end =
// // //           Number(
// // //             segment?.end ?? segment?.end_time ?? segment?.endTime ?? start,
// // //           ) || start;

// // //         const speakerValue =
// // //           segment?.speaker ??
// // //           segment?.speaker_id ??
// // //           segment?.speakerId ??
// // //           segment?.label;

// // //         const speaker =
// // //           typeof speakerValue === "string" && speakerValue.trim()
// // //             ? speakerValue.trim()
// // //             : `speaker_${index}`;

// // //         const textValue =
// // //           segment?.text ?? segment?.transcript ?? segment?.content;

// // //         const text = typeof textValue === "string" ? textValue.trim() : "";

// // //         return {
// // //           segment_index: index,

// // //           speaker,

// // //           speaker_role: null,

// // //           start_time: start,

// // //           end_time: Math.max(start, end),

// // //           text,
// // //         };
// // //       })
// // //       .filter((segment) => Boolean(segment.text));
// // //   }

// // //   // ======================================================
// // //   // XAI WORDS -> SPEAKER SEGMENTS
// // //   // ======================================================

// // //   function buildSegmentsFromWords(words) {
// // //     if (!Array.isArray(words) || words.length === 0) {
// // //       return [];
// // //     }

// // //     const segments = [];

// // //     let current = null;

// // //     for (const word of words) {
// // //       const wordText = typeof word?.text === "string" ? word.text.trim() : "";

// // //       if (!wordText) {
// // //         continue;
// // //       }

// // //       const rawSpeaker = word?.speaker ?? word?.speaker_id ?? word?.speakerId;

// // //       const speaker =
// // //         rawSpeaker !== undefined &&
// // //         rawSpeaker !== null &&
// // //         String(rawSpeaker).trim()
// // //           ? String(rawSpeaker).trim()
// // //           : "speaker_unknown";

// // //       const start = Number(word?.start) || 0;

// // //       const end = Number(word?.end) || start;

// // //       if (!current || current.speaker !== speaker) {
// // //         if (current) {
// // //           segments.push(current);
// // //         }

// // //         current = {
// // //           segment_index: segments.length,

// // //           speaker,

// // //           speaker_role: null,

// // //           start_time: start,

// // //           end_time: end,

// // //           text: wordText,
// // //         };
// // //       } else {
// // //         current.text = `${current.text} ${wordText}`;

// // //         current.end_time = end;
// // //       }
// // //     }

// // //     if (current) {
// // //       segments.push(current);
// // //     }

// // //     return segments.map((segment, index) => ({
// // //       ...segment,

// // //       segment_index: index,
// // //     }));
// // //   }

// // //   // ======================================================
// // //   // PUTER CHAT HELPERS
// // //   // ======================================================

// // //   function getPuterChatText(result) {
// // //     if (typeof result === "string") {
// // //       return result.trim();
// // //     }

// // //     if (typeof result?.message?.content === "string") {
// // //       return result.message.content.trim();
// // //     }

// // //     if (Array.isArray(result?.message?.content)) {
// // //       return result.message.content
// // //         .map((item) => {
// // //           if (typeof item === "string") {
// // //             return item;
// // //           }

// // //           if (typeof item?.text === "string") {
// // //             return item.text;
// // //           }

// // //           return "";
// // //         })
// // //         .join("")
// // //         .trim();
// // //     }

// // //     if (typeof result?.text === "string") {
// // //       return result.text.trim();
// // //     }

// // //     return "";
// // //   }

// // //   function cleanJsonText(value) {
// // //     return String(value || "")
// // //       .trim()
// // //       .replace(/^```(?:json)?\s*/i, "")
// // //       .replace(/\s*```$/i, "")
// // //       .trim();
// // //   }

// // //   // ======================================================
// // //   // IDENTIFY DOCTOR / PATIENT
// // //   // ======================================================

// // //   async function identifySpeakerRoles(segments) {
// // //     const uniqueSpeakers = [
// // //       ...new Set(segments.map((segment) => segment.speaker)),
// // //     ];

// // //     if (uniqueSpeakers.length === 0) {
// // //       return {};
// // //     }

// // //     if (uniqueSpeakers.length === 1) {
// // //       return {
// // //         [uniqueSpeakers[0]]: "unknown",
// // //       };
// // //     }

// // //     const conversation = segments
// // //       .map((segment) => `${segment.speaker}: ${segment.text}`)
// // //       .join("\n");

// // //     const prompt = `
// // // This is a medical consultation between one doctor and one patient.

// // // Determine which diarized speaker is the doctor and which is the patient.

// // // Use the content of the conversation:
// // // - Doctor normally asks about symptoms, history, medication, diagnosis and treatment.
// // // - Patient normally describes symptoms, answers questions and reports concerns.
// // // - Do not rewrite the conversation.
// // // - Do not summarize it.
// // // - Do not add medical information.

// // // Possible speakers:
// // // ${uniqueSpeakers.join(", ")}

// // // Return ONLY valid JSON exactly like this:

// // // {
// // //   "doctor": "speaker_name",
// // //   "patient": "speaker_name"
// // // }

// // // Conversation:
// // // ${conversation}
// // //     `.trim();

// // //     try {
// // //       const roleResult = await window.puter.ai.chat(prompt);

// // //       const roleText = cleanJsonText(getPuterChatText(roleResult));

// // //       const parsed = JSON.parse(roleText);

// // //       const roles = {};

// // //       if (uniqueSpeakers.includes(parsed?.doctor)) {
// // //         roles[parsed.doctor] = "doctor";
// // //       }

// // //       if (
// // //         uniqueSpeakers.includes(parsed?.patient) &&
// // //         parsed.patient !== parsed.doctor
// // //       ) {
// // //         roles[parsed.patient] = "patient";
// // //       }

// // //       uniqueSpeakers.forEach((speaker) => {
// // //         if (!roles[speaker]) {
// // //           roles[speaker] = "unknown";
// // //         }
// // //       });

// // //       return roles;
// // //     } catch (error) {
// // //       console.error("SPEAKER ROLE IDENTIFICATION ERROR:", error);

// // //       return Object.fromEntries(
// // //         uniqueSpeakers.map((speaker) => [speaker, "unknown"]),
// // //       );
// // //     }
// // //   }

// // //   // ======================================================
// // //   // OPENAI DIARIZATION
// // //   // ======================================================

// // //   async function tryOpenAIDiarization(transcriptionFile) {
// // //     const options = {
// // //       provider: "openai",

// // //       model: "gpt-4o-transcribe-diarize",

// // //       response_format: "diarized_json",

// // //       chunking_strategy: "auto",
// // //     };

// // //     const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

// // //     if (providerLanguage) {
// // //       options.language = providerLanguage;
// // //     }

// // //     const result = await window.puter.ai.speech2txt(transcriptionFile, options);

// // //     console.log("OPENAI DIARIZATION RESPONSE:", result);

// // //     const rawSegments = findRawSegments(result);

// // //     const segments = normalizePuterSegments(rawSegments);

// // //     const text = findTranscriptText(result);

// // //     return {
// // //       provider: "openai",

// // //       result,

// // //       segments,

// // //       text,
// // //     };
// // //   }

// // //   // ======================================================
// // //   // XAI DIARIZATION
// // //   // ======================================================

// // //   async function tryXAIDiarization(transcriptionFile) {
// // //     const options = {
// // //       audio: transcriptionFile,

// // //       provider: "xai",

// // //       diarize: true,
// // //     };

// // //     const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

// // //     if (providerLanguage) {
// // //       options.language = providerLanguage;

// // //       options.format = true;
// // //     }

// // //     const result = await window.puter.ai.speech2txt(options);

// // //     console.log("XAI DIARIZATION RESPONSE:", result);

// // //     const words = findWords(result);

// // //     const segments = buildSegmentsFromWords(words);

// // //     const text = findTranscriptText(result);

// // //     return {
// // //       provider: "xai",

// // //       result,

// // //       segments,

// // //       text,
// // //     };
// // //   }

// // //   // ======================================================
// // //   // TRANSCRIPTION ENGINE
// // //   // ======================================================

// // //   async function callPuterDiarization(transcriptionFile) {
// // //     let openAIResult = null;

// // //     // ------------------------------------------------------
// // //     // 1. OPENAI
// // //     // ------------------------------------------------------

// // //     try {
// // //       openAIResult = await tryOpenAIDiarization(transcriptionFile);

// // //       if (openAIResult.segments.length > 0) {
// // //         return openAIResult;
// // //       }

// // //       console.warn(
// // //         "OpenAI returned no speaker segments. Trying xAI fallback.",
// // //         openAIResult.result,
// // //       );
// // //     } catch (error) {
// // //       console.error("OPENAI DIARIZATION ERROR:", error);
// // //     }

// // //     // ------------------------------------------------------
// // //     // 2. XAI FALLBACK
// // //     // ------------------------------------------------------

// // //     try {
// // //       const xaiResult = await tryXAIDiarization(transcriptionFile);

// // //       if (xaiResult.segments.length > 0) {
// // //         return xaiResult;
// // //       }

// // //       throw new Error("xAI returned no speaker-separated words.");
// // //     } catch (error) {
// // //       console.error("XAI DIARIZATION ERROR:", error);

// // //       // If OpenAI at least returned regular text,
// // //       // don't silently save it as diarized data.
// // //       if (openAIResult?.text) {
// // //         throw new Error(
// // //           "Audio was transcribed, but speaker separation could not be generated.",
// // //         );
// // //       }

// // //       throw new Error(
// // //         "The saved recording could not be transcribed with speaker separation.",
// // //       );
// // //     }
// // //   }

// // //   // ======================================================
// // //   // GENERATE TRANSCRIPT
// // //   // ======================================================

// // //   async function handleGenerateTranscript() {
// // //     if (!consultation?.id) {
// // //       setError("Consultation ID is missing.");

// // //       return;
// // //     }

// // //     if (!uploadedRecording?.id) {
// // //       setError("Please save the audio recording first.");

// // //       return;
// // //     }

// // //     if (!uploadedRecording?.audio_url) {
// // //       setError("Audio URL is missing. Please reload the consultation.");

// // //       return;
// // //     }

// // //     if (
// // //       typeof window === "undefined" ||
// // //       !window.puter ||
// // //       !window.puter.ai ||
// // //       typeof window.puter.ai.speech2txt !== "function"
// // //     ) {
// // //       setError("Speech-to-text service is not available.");

// // //       return;
// // //     }

// // //     try {
// // //       setTranscribing(true);

// // //       setError("");

// // //       setSuccess("");

// // //       // ==================================================
// // //       // LOAD EXACT S3 AUDIO
// // //       // ==================================================

// // //       const audioResponse = await fetch(uploadedRecording.audio_url, {
// // //         method: "GET",

// // //         cache: "no-store",
// // //       });

// // //       if (!audioResponse.ok) {
// // //         throw new Error(
// // //           `Unable to load saved audio (${audioResponse.status}).`,
// // //         );
// // //       }

// // //       const fetchedBlob = await audioResponse.blob();

// // //       if (fetchedBlob.size <= 0) {
// // //         throw new Error("Saved audio file is empty.");
// // //       }

// // //       if (fetchedBlob.size < 1000) {
// // //         throw new Error("Saved audio recording is too small to transcribe.");
// // //       }

// // //       // ==================================================
// // //       // MIME
// // //       // ==================================================

// // //       const rawMimeType =
// // //         uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

// // //       const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

// // //       let extension = "webm";

// // //       if (mimeType.includes("ogg")) {
// // //         extension = "ogg";
// // //       } else if (mimeType.includes("mp4")) {
// // //         extension = "mp4";
// // //       } else if (mimeType.includes("mpeg")) {
// // //         extension = "mp3";
// // //       } else if (mimeType.includes("wav")) {
// // //         extension = "wav";
// // //       } else if (mimeType.includes("m4a")) {
// // //         extension = "m4a";
// // //       }

// // //       const transcriptionFile = new File(
// // //         [fetchedBlob],

// // //         `consultation-${consultation.id}.${extension}`,

// // //         {
// // //           type: mimeType,
// // //         },
// // //       );

// // //       console.log("TRANSCRIPTION FILE:", {
// // //         name: transcriptionFile.name,

// // //         size: transcriptionFile.size,

// // //         type: transcriptionFile.type,

// // //         selectedLanguage,
// // //       });

// // //       // ==================================================
// // //       // DIARIZATION
// // //       // ==================================================

// // //       const diarization = await callPuterDiarization(transcriptionFile);

// // //       console.log("FINAL DIARIZATION:", diarization);

// // //       if (
// // //         !Array.isArray(diarization.segments) ||
// // //         diarization.segments.length === 0
// // //       ) {
// // //         throw new Error("Speaker-separated transcript was not returned.");
// // //       }

// // //       // ==================================================
// // //       // DOCTOR / PATIENT MAPPING
// // //       // ==================================================

// // //       const speakerRoles = await identifySpeakerRoles(diarization.segments);

// // //       const finalSegments = diarization.segments.map((segment, index) => {
// // //         const role = speakerRoles[segment.speaker];

// // //         return {
// // //           ...segment,

// // //           segment_index: index,

// // //           speaker_role: role === "doctor" || role === "patient" ? role : null,
// // //         };
// // //       });

// // //       // ==================================================
// // //       // FULL TEXT
// // //       // ==================================================

// // //       let transcriptText = diarization.text?.trim() || "";

// // //       if (!transcriptText) {
// // //         transcriptText = finalSegments
// // //           .map((segment) => segment.text)
// // //           .join(" ")
// // //           .trim();
// // //       }

// // //       if (!transcriptText) {
// // //         throw new Error("Transcription returned empty text.");
// // //       }

// // //       // ==================================================
// // //       // SAVE TO OUR BACKEND
// // //       // ==================================================

// // //       const response = await fetch("/api/doctors/consultations/transcribe", {
// // //         method: "POST",

// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },

// // //         credentials: "include",

// // //         cache: "no-store",

// // //         body: JSON.stringify({
// // //           consultation_id: consultation.id,

// // //           audio_recording_id: uploadedRecording.id,

// // //           transcript_text: transcriptText,

// // //           segments: finalSegments,

// // //           provider: "puter",

// // //           // Keep compatible with your current backend
// // //           // ALLOWED_MODELS list.
// // //           model: "gpt-4o-transcribe-diarize",

// // //           language: selectedLanguage,
// // //         }),
// // //       });

// // //       const data = await getResponseData(response);

// // //       console.log("SAVE TRANSCRIPT RESPONSE:", {
// // //         status: response.status,
// // //         data,
// // //         actualSpeechProvider: diarization.provider,
// // //       });

// // //       if (response.status === 401) {
// // //         router.replace("/login");

// // //         return;
// // //       }

// // //       if (response.status === 403) {
// // //         router.replace("/unauthorized");

// // //         return;
// // //       }

// // //       if (!response.ok) {
// // //         setError(
// // //           data.message || "Transcript was generated but could not be saved.",
// // //         );

// // //         return;
// // //       }

// // //       setTranscript(data.transcript || null);

// // //       setTranscriptSegments(
// // //         Array.isArray(data.transcript_segments)
// // //           ? data.transcript_segments
// // //           : finalSegments,
// // //       );

// // //       setUploadedRecording((previous) =>
// // //         previous
// // //           ? {
// // //               ...previous,
// // //               status: "completed",
// // //             }
// // //           : previous,
// // //       );

// // //       setConsultation((previous) =>
// // //         previous
// // //           ? {
// // //               ...previous,
// // //               status: "transcribed",
// // //             }
// // //           : previous,
// // //       );

// // //       setSuccess(data.message || "Speaker transcript generated successfully.");
// // //     } catch (error) {
// // //       console.error("GENERATE DIARIZED TRANSCRIPT ERROR:", error);

// // //       setError(error?.message || "Unable to generate speaker transcript.");
// // //     } finally {
// // //       setTranscribing(false);
// // //     }
// // //   }

// // //   // ======================================================
// // //   // DOWNLOAD TRANSCRIPT
// // //   //
// // //   // Downloads a TXT file directly from browser.
// // //   // No backend route required.
// // //   // ======================================================

// // //   function handleDownloadTranscript() {
// // //     if (!transcript?.id) {
// // //       setError("No transcript is available to download.");

// // //       return;
// // //     }

// // //     const lines = [];

// // //     lines.push("MEDICAL CONSULTATION TRANSCRIPT");

// // //     lines.push("================================");

// // //     lines.push("");

// // //     lines.push(`Patient: ${patient?.name || "—"}`);

// // //     lines.push(`Patient Code: ${patient?.patient_code || "—"}`);

// // //     lines.push(`Appointment ID: ${appointment?.id || "—"}`);

// // //     lines.push(`Consultation ID: ${consultation?.id || "—"}`);

// // //     lines.push(`Transcript ID: ${transcript?.id || "—"}`);

// // //     lines.push(
// // //       `Language: ${getLanguageLabel(transcript?.language || selectedLanguage)}`,
// // //     );

// // //     lines.push(`Date: ${formatDate(appointment?.appointment_date)}`);

// // //     lines.push(`Time: ${formatTime(appointment?.appointment_time)}`);

// // //     lines.push("");

// // //     lines.push("--------------------------------");

// // //     lines.push("CONVERSATION");

// // //     lines.push("--------------------------------");

// // //     lines.push("");

// // //     if (transcriptSegments.length > 0) {
// // //       transcriptSegments.forEach((segment) => {
// // //         const speaker = getSpeakerLabel(segment);

// // //         const start = formatTranscriptTime(segment.start_time);

// // //         const end = formatTranscriptTime(segment.end_time);

// // //         lines.push(`${speaker}  [${start} - ${end}]`);

// // //         lines.push(segment.text || "");

// // //         lines.push("");
// // //       });
// // //     } else {
// // //       lines.push(transcript.edited_text || transcript.full_text || "");
// // //     }

// // //     lines.push("");

// // //     lines.push("================================");

// // //     lines.push("Generated by MedTranscript");

// // //     const content = lines.join("\n");

// // //     const blob = new Blob([content], {
// // //       type: "text/plain;charset=utf-8",
// // //     });

// // //     const downloadUrl = URL.createObjectURL(blob);

// // //     const anchor = document.createElement("a");

// // //     const safePatientName =
// // //       String(patient?.name || "patient")
// // //         .trim()
// // //         .replace(/[^a-zA-Z0-9_-]+/g, "-")
// // //         .replace(/^-+|-+$/g, "") || "patient";

// // //     anchor.href = downloadUrl;

// // //     anchor.download = `consultation-${consultation?.id || "transcript"}-${safePatientName}.txt`;

// // //     document.body.appendChild(anchor);

// // //     anchor.click();

// // //     anchor.remove();

// // //     URL.revokeObjectURL(downloadUrl);

// // //     setSuccess("Transcript downloaded successfully.");
// // //   }

// // //   // ======================================================
// // //   // CLEANUP
// // //   // ======================================================

// // //   useEffect(() => {
// // //     return () => {
// // //       stopTimer();

// // //       if (recorderRef.current && recorderRef.current.state !== "inactive") {
// // //         try {
// // //           recorderRef.current.stop();
// // //         } catch {}
// // //       }

// // //       stopMicrophoneStream();
// // //     };
// // //   }, []);

// // //   useEffect(() => {
// // //     return () => {
// // //       if (audioUrl) {
// // //         URL.revokeObjectURL(audioUrl);
// // //       }
// // //     };
// // //   }, [audioUrl]);

// // //   // ======================================================
// // //   // HELPERS
// // //   // ======================================================

// // //   function calculateAge(dateOfBirth) {
// // //     if (!dateOfBirth) {
// // //       return null;
// // //     }

// // //     const birthDate = new Date(dateOfBirth);

// // //     const today = new Date();

// // //     let age = today.getFullYear() - birthDate.getFullYear();

// // //     const monthDifference = today.getMonth() - birthDate.getMonth();

// // //     if (
// // //       monthDifference < 0 ||
// // //       (monthDifference === 0 && today.getDate() < birthDate.getDate())
// // //     ) {
// // //       age--;
// // //     }

// // //     return age;
// // //   }

// // //   function formatDate(date) {
// // //     if (!date) {
// // //       return "—";
// // //     }

// // //     return new Intl.DateTimeFormat("en-GB", {
// // //       day: "2-digit",

// // //       month: "short",

// // //       year: "numeric",
// // //     }).format(new Date(date));
// // //   }

// // //   function formatTime(time) {
// // //     if (!time) {
// // //       return "—";
// // //     }

// // //     const [hours, minutes] = String(time).split(":");

// // //     const date = new Date();

// // //     date.setHours(Number(hours));

// // //     date.setMinutes(Number(minutes));

// // //     date.setSeconds(0);

// // //     return date.toLocaleTimeString("en-US", {
// // //       hour: "numeric",

// // //       minute: "2-digit",

// // //       hour12: true,
// // //     });
// // //   }

// // //   function getAppointmentStatus(status) {
// // //     const statuses = {
// // //       scheduled: {
// // //         label: "Scheduled",
// // //         tone: "gray",
// // //       },

// // //       checked_in: {
// // //         label: "Checked in",
// // //         tone: "blue",
// // //       },

// // //       waiting: {
// // //         label: "Waiting",
// // //         tone: "amber",
// // //       },

// // //       in_consultation: {
// // //         label: "In consultation",
// // //         tone: "blue",
// // //       },

// // //       completed: {
// // //         label: "Completed",
// // //         tone: "green",
// // //       },

// // //       cancelled: {
// // //         label: "Cancelled",
// // //         tone: "red",
// // //       },

// // //       no_show: {
// // //         label: "No show",
// // //         tone: "red",
// // //       },
// // //     };

// // //     return (
// // //       statuses[status] || {
// // //         label: status || "Unknown",

// // //         tone: "gray",
// // //       }
// // //     );
// // //   }

// // //   function getLanguageLabel(value) {
// // //     return (
// // //       TRANSCRIPTION_LANGUAGES.find((item) => item.value === value)?.label ||
// // //       value ||
// // //       "Auto detect"
// // //     );
// // //   }

// // //   function getSpeakerLabel(segment) {
// // //     if (segment?.speaker_role === "doctor") {
// // //       return "Doctor";
// // //     }

// // //     if (segment?.speaker_role === "patient") {
// // //       return "Patient";
// // //     }

// // //     return segment?.speaker || "Unknown speaker";
// // //   }

// // //   function getSpeakerTone(segment) {
// // //     if (segment?.speaker_role === "doctor") {
// // //       return "blue";
// // //     }

// // //     if (segment?.speaker_role === "patient") {
// // //       return "green";
// // //     }

// // //     return "gray";
// // //   }

// // //   // ======================================================
// // //   // LOADING
// // //   // ======================================================

// // //   if (loading) {
// // //     return <ConsultationLoading />;
// // //   }

// // //   // ======================================================
// // //   // ERROR PAGE
// // //   // ======================================================

// // //   if (!appointmentId || (error && !patient)) {
// // //     return (
// // //       <Shell
// // //         role="doctor"
// // //         title="New consultation"
// // //         subtitle="Consultation unavailable"
// // //       >
// // //         <div className="max-w-4xl">
// // //           <div className="rounded-2xl border bg-white px-6 py-16 text-center">
// // //             <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 font-bold text-red-600">
// // //               !
// // //             </div>

// // //             <h2 className="mt-4 text-xl font-bold">Consultation unavailable</h2>

// // //             <p className="mt-2 text-sm text-slate-500">
// // //               {error || "Appointment ID is missing."}
// // //             </p>

// // //             <Link
// // //               href="/doctor"
// // //               className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
// // //             >
// // //               Back to dashboard
// // //             </Link>
// // //           </div>
// // //         </div>
// // //       </Shell>
// // //     );
// // //   }

// // //   if (!patient || !appointment) {
// // //     return null;
// // //   }

// // //   // ======================================================
// // //   // PAGE DATA
// // //   // ======================================================

// // //   const age = calculateAge(patient.date_of_birth);

// // //   const appointmentStatus = getAppointmentStatus(appointment.status);

// // //   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

// // //   const consultationStarted = Boolean(consultation?.id);

// // //   const consultationLocked =
// // //     consultation?.status === "completed" || appointment?.status === "completed";

// // //   // ======================================================
// // //   // UI
// // //   // ======================================================

// // //   return (
// // //     <Shell
// // //       role="doctor"
// // //       title="New consultation"
// // //       subtitle={`${patient.name} · ${patient.patient_code}`}
// // //     >
// // //       <div className="max-w-5xl">
// // //         {/* =================================================
// // //             ALERTS
// // //         ================================================= */}

// // //         {error && (
// // //           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
// // //             {error}
// // //           </div>
// // //         )}

// // //         {success && (
// // //           <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
// // //             {success}
// // //           </div>
// // //         )}

// // //         {/* =================================================
// // //             PATIENT
// // //         ================================================= */}

// // //         <section className="rounded-2xl border bg-white p-6">
// // //           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
// // //             <div>
// // //               <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// // //                 Patient
// // //               </p>

// // //               <h2 className="mt-2 text-2xl font-bold text-slate-950">
// // //                 {patient.name}
// // //               </h2>

// // //               <p className="mt-2 text-sm text-slate-500">
// // //                 {age !== null ? `${age} years` : "Age not added"}

// // //                 {" · "}

// // //                 {patient.gender || "Gender not added"}

// // //                 {" · "}

// // //                 {patient.patient_code}
// // //               </p>

// // //               {patient.phone && (
// // //                 <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
// // //               )}
// // //             </div>

// // //             <div className="flex flex-wrap items-center gap-3">
// // //               <Badge tone={appointmentStatus.tone}>
// // //                 {appointmentStatus.label}
// // //               </Badge>

// // //               <Link
// // //                 href={`/doctor/patients/${patient.id}`}
// // //                 className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
// // //               >
// // //                 View patient
// // //               </Link>
// // //             </div>
// // //           </div>

// // //           <div className="mt-6 border-t pt-5">
// // //             <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// // //               <div>
// // //                 <p className="text-xs text-slate-400">Appointment</p>

// // //                 <p className="mt-1 text-sm font-semibold">#{appointment.id}</p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Date</p>

// // //                 <p className="mt-1 text-sm font-semibold">
// // //                   {formatDate(appointment.appointment_date)}
// // //                 </p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Time</p>

// // //                 <p className="mt-1 text-sm font-semibold">
// // //                   {formatTime(appointment.appointment_time)}
// // //                 </p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Token</p>

// // //                 <p className="mt-1 text-sm font-semibold">
// // //                   {appointment.token_number || "—"}
// // //                 </p>
// // //               </div>
// // //             </div>

// // //             {appointment.notes && (
// // //               <div className="mt-5 rounded-xl bg-slate-50 p-4">
// // //                 <p className="text-xs text-slate-400">Appointment notes</p>

// // //                 <p className="mt-1 text-sm text-slate-700">
// // //                   {appointment.notes}
// // //                 </p>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </section>

// // //         {/* =================================================
// // //             HISTORY
// // //         ================================================= */}

// // //         <section className="mt-6 rounded-2xl border bg-white">
// // //           <div className="flex items-center justify-between gap-4 border-b p-5">
// // //             <div>
// // //               <h3 className="font-semibold">Patient history</h3>

// // //               <p className="mt-1 text-xs text-slate-500">
// // //                 Latest medical information before consultation
// // //               </p>
// // //             </div>

// // //             <Link
// // //               href={`/doctor/patients/${patient.id}`}
// // //               className="text-sm font-medium text-blue-600"
// // //             >
// // //               Full history
// // //             </Link>
// // //           </div>

// // //           {!latestHistory ? (
// // //             <div className="p-6">
// // //               <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
// // //                 No medical history has been added for this patient.
// // //               </div>
// // //             </div>
// // //           ) : (
// // //             <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
// // //               <div>
// // //                 <p className="text-xs text-slate-400">Previous diseases</p>

// // //                 <p className="mt-1 text-sm font-medium">
// // //                   {latestHistory.previous_diseases || "None reported"}
// // //                 </p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Allergies</p>

// // //                 <p className="mt-1 text-sm font-medium">
// // //                   {latestHistory.allergies || "None reported"}
// // //                 </p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Current medications</p>

// // //                 <p className="mt-1 text-sm font-medium">
// // //                   {latestHistory.current_medications || "None reported"}
// // //                 </p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Previous surgeries</p>

// // //                 <p className="mt-1 text-sm font-medium">
// // //                   {latestHistory.previous_surgeries || "None reported"}
// // //                 </p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Family history</p>

// // //                 <p className="mt-1 text-sm font-medium">
// // //                   {latestHistory.family_history || "None reported"}
// // //                 </p>
// // //               </div>

// // //               <div>
// // //                 <p className="text-xs text-slate-400">Additional notes</p>

// // //                 <p className="mt-1 text-sm font-medium">
// // //                   {latestHistory.additional_notes || "No notes"}
// // //                 </p>
// // //               </div>
// // //             </div>
// // //           )}
// // //         </section>

// // //         {/* =================================================
// // //             CONSULTATION
// // //         ================================================= */}

// // //         <section className="mt-6 rounded-2xl border bg-white p-6">
// // //           {!consultationStarted ? (
// // //             <div className="rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // //               <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // //                 <Icon name="mic" size={28} />
// // //               </div>

// // //               <h3 className="mt-5 text-xl font-bold">
// // //                 Ready to start consultation
// // //               </h3>

// // //               <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // //                 Start the consultation when the patient is with you.
// // //               </p>

// // //               <button
// // //                 type="button"
// // //                 disabled={starting}
// // //                 onClick={handleStartConsultation}
// // //                 className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // //               >
// // //                 {starting ? "Starting consultation..." : "Start consultation"}
// // //               </button>
// // //             </div>
// // //           ) : (
// // //             <>
// // //               {/* =============================================
// // //                   CONSULTATION INFO
// // //               ============================================= */}

// // //               <div className="rounded-xl bg-slate-50 p-5">
// // //                 <div className="grid gap-5 sm:grid-cols-3">
// // //                   <div>
// // //                     <p className="text-xs text-slate-400">Consultation ID</p>

// // //                     <p className="mt-1 font-semibold">#{consultation.id}</p>
// // //                   </div>

// // //                   <div>
// // //                     <p className="text-xs text-slate-400">Status</p>

// // //                     <p className="mt-1 font-semibold capitalize">
// // //                       {consultation.status?.replaceAll("_", " ")}
// // //                     </p>
// // //                   </div>

// // //                   <div>
// // //                     <p className="text-xs text-slate-400">Started</p>

// // //                     <p className="mt-1 font-semibold">
// // //                       {consultation.started_at
// // //                         ? new Date(consultation.started_at).toLocaleString()
// // //                         : "—"}
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //               </div>

// // //               {/* =============================================
// // //                   RECORDING
// // //               ============================================= */}

// // //               <div className="mt-6 rounded-2xl border-2 border-dashed p-8 text-center md:p-10">
// // //                 <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100">
// // //                   <Icon name="mic" size={28} />
// // //                 </div>

// // //                 <div className="mt-5 flex justify-center">
// // //                   <Badge
// // //                     tone={
// // //                       isRecording ? "red" : uploadedRecording ? "green" : "blue"
// // //                     }
// // //                   >
// // //                     {isRecording
// // //                       ? isPaused
// // //                         ? "Recording paused"
// // //                         : "Recording"
// // //                       : uploadedRecording
// // //                         ? "Audio saved"
// // //                         : "Ready to record"}
// // //                   </Badge>
// // //                 </div>

// // //                 <h3 className="mt-4 text-xl font-bold">
// // //                   Consultation recording
// // //                 </h3>

// // //                 <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
// // //                   Record the doctor and patient conversation clearly.
// // //                 </p>

// // //                 {(isRecording || recordingSeconds > 0) && (
// // //                   <div className="mt-6 text-3xl font-bold tabular-nums">
// // //                     {formatDuration(recordingSeconds)}
// // //                   </div>
// // //                 )}

// // //                 {/* START */}

// // //                 {!isRecording &&
// // //                   !audioBlob &&
// // //                   !uploadedRecording &&
// // //                   !consultationLocked && (
// // //                     <button
// // //                       type="button"
// // //                       onClick={handleStartRecording}
// // //                       className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
// // //                     >
// // //                       Start recording
// // //                     </button>
// // //                   )}

// // //                 {/* RECORDING CONTROLS */}

// // //                 {isRecording && (
// // //                   <div className="mt-6 flex flex-wrap justify-center gap-3">
// // //                     {!isPaused ? (
// // //                       <button
// // //                         type="button"
// // //                         onClick={handlePauseRecording}
// // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // //                       >
// // //                         Pause
// // //                       </button>
// // //                     ) : (
// // //                       <button
// // //                         type="button"
// // //                         onClick={handleResumeRecording}
// // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold"
// // //                       >
// // //                         Resume
// // //                       </button>
// // //                     )}

// // //                     <button
// // //                       type="button"
// // //                       onClick={handleStopRecording}
// // //                       className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
// // //                     >
// // //                       Stop recording
// // //                     </button>
// // //                   </div>
// // //                 )}

// // //                 {/* LOCAL PREVIEW */}

// // //                 {audioBlob && !uploadedRecording && !isRecording && (
// // //                   <div className="mt-7">
// // //                     <p className="text-sm font-medium">Recording complete</p>

// // //                     <audio
// // //                       controls
// // //                       src={audioUrl}
// // //                       className="mx-auto mt-4 w-full max-w-lg"
// // //                     />

// // //                     <div className="mt-5 flex flex-wrap justify-center gap-3">
// // //                       <button
// // //                         type="button"
// // //                         disabled={uploadingAudio}
// // //                         onClick={handleUploadAudio}
// // //                         className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
// // //                       >
// // //                         {uploadingAudio ? "Saving audio..." : "Save recording"}
// // //                       </button>

// // //                       <button
// // //                         type="button"
// // //                         disabled={uploadingAudio}
// // //                         onClick={handleRecordAgain}
// // //                         className="rounded-xl border px-5 py-3 text-sm font-semibold disabled:opacity-50"
// // //                       >
// // //                         Record again
// // //                       </button>
// // //                     </div>
// // //                   </div>
// // //                 )}

// // //                 {/* =============================================
// // //                     SAVED AUDIO
// // //                 ============================================= */}

// // //                 {uploadedRecording && (
// // //                   <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-left">
// // //                     <div className="flex flex-wrap items-center justify-between gap-3">
// // //                       <div>
// // //                         <p className="font-semibold text-emerald-900">
// // //                           Recording saved
// // //                         </p>

// // //                         <p className="mt-1 text-xs text-emerald-700">
// // //                           Audio recording #{uploadedRecording.id}
// // //                         </p>
// // //                       </div>

// // //                       <Badge tone="green">Uploaded</Badge>
// // //                     </div>

// // //                     <div className="mt-4 grid gap-4 sm:grid-cols-3">
// // //                       <div>
// // //                         <p className="text-xs text-emerald-700">Duration</p>

// // //                         <p className="mt-1 text-sm font-semibold">
// // //                           {formatDuration(
// // //                             Math.round(
// // //                               Number(
// // //                                 uploadedRecording.duration_seconds ||
// // //                                   recordingSeconds,
// // //                               ),
// // //                             ),
// // //                           )}
// // //                         </p>
// // //                       </div>

// // //                       <div>
// // //                         <p className="text-xs text-emerald-700">File type</p>

// // //                         <p className="mt-1 text-sm font-semibold">
// // //                           {uploadedRecording.mime_type || "Audio"}
// // //                         </p>
// // //                       </div>

// // //                       <div>
// // //                         <p className="text-xs text-emerald-700">Status</p>

// // //                         <p className="mt-1 text-sm font-semibold capitalize">
// // //                           {uploadedRecording.status || "uploaded"}
// // //                         </p>
// // //                       </div>
// // //                     </div>

// // //                     {uploadedRecording.audio_url && (
// // //                       <audio
// // //                         controls
// // //                         src={uploadedRecording.audio_url}
// // //                         className="mt-5 w-full"
// // //                       />
// // //                     )}

// // //                     {/* =========================================
// // //                         TRANSCRIPTION CONTROLS
// // //                     ========================================= */}

// // //                     <div className="mt-5 border-t border-emerald-200 pt-5">
// // //                       <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
// // //                         <div>
// // //                           <label
// // //                             htmlFor="transcript-language"
// // //                             className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-800"
// // //                           >
// // //                             Transcript language
// // //                           </label>

// // //                           <div className="flex flex-col gap-3 sm:flex-row">
// // //                             <select
// // //                               id="transcript-language"
// // //                               value={selectedLanguage}
// // //                               onChange={(event) =>
// // //                                 setSelectedLanguage(event.target.value)
// // //                               }
// // //                               disabled={transcribing || deletingRecording}
// // //                               className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium sm:w-[220px]"
// // //                             >
// // //                               {TRANSCRIPTION_LANGUAGES.map((language) => (
// // //                                 <option
// // //                                   key={language.value}
// // //                                   value={language.value}
// // //                                 >
// // //                                   {language.label}
// // //                                 </option>
// // //                               ))}
// // //                             </select>

// // //                             <button
// // //                               type="button"
// // //                               disabled={transcribing || deletingRecording}
// // //                               onClick={handleGenerateTranscript}
// // //                               className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
// // //                             >
// // //                               {transcribing
// // //                                 ? "Detecting speakers..."
// // //                                 : transcript
// // //                                   ? "Regenerate transcript"
// // //                                   : "Generate transcript"}
// // //                             </button>
// // //                           </div>

// // //                           {selectedLanguage === "pa" && (
// // //                             <p className="mt-2 text-xs text-emerald-800">
// // //                               Punjabi will use automatic language detection to
// // //                               avoid the unsupported "pa" provider code.
// // //                             </p>
// // //                           )}

// // //                           {selectedLanguage === "roman-ur" && (
// // //                             <p className="mt-2 text-xs text-emerald-800">
// // //                               Roman Urdu uses automatic speech detection. The
// // //                               selected value is stored with your transcript.
// // //                             </p>
// // //                           )}

// // //                           {transcribing && (
// // //                             <p className="mt-3 text-xs text-slate-500">
// // //                               Transcribing audio, detecting speakers and
// // //                               identifying Doctor / Patient. Please keep this
// // //                               page open.
// // //                             </p>
// // //                           )}
// // //                         </div>

// // //                         <button
// // //                           type="button"
// // //                           disabled={deletingRecording || transcribing}
// // //                           onClick={handleDeleteRecording}
// // //                           className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
// // //                         >
// // //                           {deletingRecording
// // //                             ? "Deleting recording..."
// // //                             : "Delete recording"}
// // //                         </button>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               {/* =============================================
// // //                   TRANSCRIPT
// // //               ============================================= */}

// // //               {transcript && (
// // //                 <section className="mt-6 overflow-hidden rounded-2xl border">
// // //                   <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
// // //                     <div>
// // //                       <h3 className="font-semibold">Consultation transcript</h3>

// // //                       <p className="mt-1 text-xs text-slate-500">
// // //                         Speaker-separated transcript with recording timestamps
// // //                       </p>
// // //                     </div>

// // //                     <div className="flex flex-wrap items-center gap-3">
// // //                       <Badge tone="green">Transcript ready</Badge>

// // //                       {/* DOWNLOAD BUTTON */}

// // //                       <button
// // //                         type="button"
// // //                         onClick={handleDownloadTranscript}
// // //                         className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
// // //                       >
// // //                         Download transcript
// // //                       </button>
// // //                     </div>
// // //                   </div>

// // //                   <div className="p-5">
// // //                     {/* =======================================
// // //                         SPEAKER SEGMENTS
// // //                     ======================================= */}

// // //                     {transcriptSegments.length > 0 ? (
// // //                       <div className="space-y-4">
// // //                         {transcriptSegments.map((segment, index) => (
// // //                           <article
// // //                             key={
// // //                               segment.id || `${segment.segment_index}-${index}`
// // //                             }
// // //                             className={`rounded-2xl border p-5 ${
// // //                               segment.speaker_role === "doctor"
// // //                                 ? "bg-blue-50/50"
// // //                                 : segment.speaker_role === "patient"
// // //                                   ? "bg-emerald-50/50"
// // //                                   : "bg-slate-50"
// // //                             }`}
// // //                           >
// // //                             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// // //                               <div className="flex items-center gap-2">
// // //                                 <Badge tone={getSpeakerTone(segment)}>
// // //                                   {getSpeakerLabel(segment)}
// // //                                 </Badge>

// // //                                 <span className="text-xs text-slate-400">
// // //                                   {segment.speaker}
// // //                                 </span>
// // //                               </div>

// // //                               <div className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-500 shadow-sm">
// // //                                 {formatTranscriptTime(segment.start_time)}

// // //                                 {" – "}

// // //                                 {formatTranscriptTime(segment.end_time)}
// // //                               </div>
// // //                             </div>

// // //                             <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // //                               {segment.text}
// // //                             </p>
// // //                           </article>
// // //                         ))}
// // //                       </div>
// // //                     ) : (
// // //                       <div className="rounded-xl bg-slate-50 p-5">
// // //                         <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
// // //                           {transcript.edited_text ||
// // //                             transcript.full_text ||
// // //                             "Transcript is empty."}
// // //                         </p>
// // //                       </div>
// // //                     )}

// // //                     {/* =======================================
// // //                         TRANSCRIPT META
// // //                     ======================================= */}

// // //                     <div className="mt-6 flex flex-wrap gap-5 border-t pt-5 text-xs text-slate-400">
// // //                       <span>Transcript #{transcript.id}</span>

// // //                       {transcript.word_count !== null &&
// // //                         transcript.word_count !== undefined && (
// // //                           <span>{transcript.word_count} words</span>
// // //                         )}

// // //                       <span>{transcriptSegments.length} segments</span>

// // //                       <span>
// // //                         Language:{" "}
// // //                         {getLanguageLabel(
// // //                           transcript.language || selectedLanguage,
// // //                         )}
// // //                       </span>

// // //                       <span className="capitalize">
// // //                         Status: {transcript.status}
// // //                       </span>
// // //                     </div>

// // //                     {transcriptSegments.some(
// // //                       (segment) => !segment.speaker_role,
// // //                     ) && (
// // //                       <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
// // //                         Some speakers could not be confidently identified as
// // //                         Doctor or Patient. Their detected speaker label is shown
// // //                         instead.
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 </section>
// // //               )}
// // //             </>
// // //           )}

// // //           {/* =================================================
// // //               PROCESS
// // //           ================================================= */}

// // //           <div className="mt-6 grid gap-3 md:grid-cols-3">
// // //             <div className="rounded-xl bg-slate-50 p-4">
// // //               <div className="text-xs text-slate-400">01</div>

// // //               <div className="mt-2 font-semibold">Patient history</div>

// // //               <div className="mt-1 text-xs text-emerald-600">Available</div>
// // //             </div>

// // //             <div className="rounded-xl bg-slate-50 p-4">
// // //               <div className="text-xs text-slate-400">02</div>

// // //               <div className="mt-2 font-semibold">Audio recording</div>

// // //               <div
// // //                 className={`mt-1 text-xs ${
// // //                   uploadedRecording ? "text-emerald-600" : "text-slate-500"
// // //                 }`}
// // //               >
// // //                 {uploadedRecording
// // //                   ? "Recording saved"
// // //                   : consultationStarted
// // //                     ? "Ready"
// // //                     : "Start consultation first"}
// // //               </div>
// // //             </div>

// // //             <div className="rounded-xl bg-slate-50 p-4">
// // //               <div className="text-xs text-slate-400">03</div>

// // //               <div className="mt-2 font-semibold">Speaker transcript</div>

// // //               <div
// // //                 className={`mt-1 text-xs ${
// // //                   transcript
// // //                     ? "text-emerald-600"
// // //                     : transcribing
// // //                       ? "text-blue-600"
// // //                       : "text-slate-500"
// // //                 }`}
// // //               >
// // //                 {transcript
// // //                   ? `${transcriptSegments.length} segments ready`
// // //                   : transcribing
// // //                     ? "Detecting speakers..."
// // //                     : uploadedRecording
// // //                       ? "Ready to generate"
// // //                       : "Available after recording"}
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </section>

// // //         {/* =================================================
// // //             BACK
// // //         ================================================= */}

// // //         <div className="mt-6">
// // //           <Link
// // //             href="/doctor"
// // //             className="text-sm font-medium text-slate-600 hover:text-slate-950"
// // //           >
// // //             ← Back to dashboard
// // //           </Link>
// // //         </div>
// // //       </div>
// // //     </Shell>
// // //   );
// // // }

// // "use client";

// // import { Suspense, useEffect, useRef, useState } from "react";

// // import { useRouter, useSearchParams } from "next/navigation";

// // import Link from "next/link";

// // import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

// // import Shell from "@/components/Shell";
// // import Icon from "@/components/Icon";
// // import Badge from "@/components/Badge";

// // // ======================================================
// // // LANGUAGES
// // // ======================================================

// // const TRANSCRIPTION_LANGUAGES = [
// //   {
// //     value: "auto",
// //     label: "Auto detect",
// //   },
// //   {
// //     value: "en",
// //     label: "English",
// //   },
// //   {
// //     value: "ur",
// //     label: "Urdu",
// //   },
// //   {
// //     value: "roman-ur",
// //     label: "Roman Urdu",
// //   },
// //   {
// //     value: "hi",
// //     label: "Hindi",
// //   },
// //   {
// //     value: "ar",
// //     label: "Arabic",
// //   },
// //   {
// //     value: "pa",
// //     label: "Punjabi",
// //   },
// // ];

// // // ======================================================
// // // PROVIDER LANGUAGE CODES
// // //
// // // Punjabi / Roman Urdu are intentionally excluded.
// // // They stay as application metadata but aren't passed
// // // as unsupported provider language codes.
// // // ======================================================

// // const PROVIDER_LANGUAGE_CODES = {
// //   en: "en",
// //   ur: "ur",
// //   hi: "hi",
// //   ar: "ar",
// // };

// // // ======================================================
// // // PAGE
// // // ======================================================

// // export default function NewConsultationPage() {
// //   return (
// //     <Suspense fallback={<ConsultationLoading />}>
// //       <NewConsultationContent />
// //     </Suspense>
// //   );
// // }

// // // ======================================================
// // // LOADING
// // // ======================================================

// // function ConsultationLoading() {
// //   return (
// //     <Shell
// //       role="doctor"
// //       title="New consultation"
// //       subtitle="Loading consultation"
// //     >
// //       <div className="mx-auto max-w-6xl">
// //         <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
// //           <div className="px-6 py-24 text-center md:px-10">
// //             <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950">
// //               <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
// //             </div>

// //             <h2 className="mt-5 text-lg font-bold text-slate-950">
// //               Loading consultation
// //             </h2>

// //             <p className="mt-2 text-sm text-slate-500">
// //               Preparing patient information, recording and transcript data.
// //             </p>
// //           </div>
// //         </div>
// //       </div>
// //     </Shell>
// //   );
// // }

// // // ======================================================
// // // MAIN
// // // ======================================================

// // function NewConsultationContent() {
// //   const router = useRouter();
// //   const searchParams = useSearchParams();

// //   const appointmentId = searchParams.get("appointment");

// //   // ======================================================
// //   // DATA
// //   // ======================================================

// //   const [appointment, setAppointment] = useState(null);

// //   const [patient, setPatient] = useState(null);

// //   const [medicalHistory, setMedicalHistory] = useState([]);

// //   const [consultation, setConsultation] = useState(null);

// //   // ======================================================
// //   // LOADING STATES
// //   // ======================================================

// //   const [loading, setLoading] = useState(true);

// //   const [starting, setStarting] = useState(false);

// //   // ======================================================
// //   // TOAST
// //   // ======================================================

// //   const [toast, setToast] = useState(null);

// //   const toastTimerRef = useRef(null);

// //   // ======================================================
// //   // DELETE MODAL
// //   // ======================================================

// //   const [deleteModalOpen, setDeleteModalOpen] = useState(false);

// //   // ======================================================
// //   // RECORDING
// //   // ======================================================

// //   const [isRecording, setIsRecording] = useState(false);

// //   const [isPaused, setIsPaused] = useState(false);

// //   const [recordingSeconds, setRecordingSeconds] = useState(0);

// //   const [audioBlob, setAudioBlob] = useState(null);

// //   const [audioUrl, setAudioUrl] = useState("");

// //   const [uploadingAudio, setUploadingAudio] = useState(false);

// //   const [deletingRecording, setDeletingRecording] = useState(false);

// //   const [uploadedRecording, setUploadedRecording] = useState(null);

// //   // ======================================================
// //   // TRANSCRIPTION
// //   // ======================================================

// //   const [transcribing, setTranscribing] = useState(false);

// //   const [selectedLanguage, setSelectedLanguage] = useState("auto");

// //   const [transcript, setTranscript] = useState(null);

// //   const [transcriptSegments, setTranscriptSegments] = useState([]);

// //   // ======================================================
// //   // DOWNLOAD
// //   // ======================================================

// //   const [downloadingFormat, setDownloadingFormat] = useState("");

// //   // ======================================================
// //   // REFS
// //   // ======================================================

// //   const recorderRef = useRef(null);

// //   const streamRef = useRef(null);

// //   const timerRef = useRef(null);

// //   const chunksRef = useRef([]);

// //   const transcriptExportRef = useRef(null);

// //   // ======================================================
// //   // TOAST
// //   // ======================================================

// //   function showToast(type, message, duration = 4500) {
// //     if (toastTimerRef.current) {
// //       clearTimeout(toastTimerRef.current);
// //     }

// //     setToast({
// //       type,
// //       message,
// //     });

// //     toastTimerRef.current = setTimeout(() => {
// //       setToast(null);

// //       toastTimerRef.current = null;
// //     }, duration);
// //   }

// //   function showSuccess(message) {
// //     showToast("success", message);
// //   }

// //   function showError(message) {
// //     showToast("error", message, 6000);
// //   }

// //   // ======================================================
// //   // RESPONSE
// //   // ======================================================

// //   async function getResponseData(response) {
// //     const contentType = response.headers.get("content-type") || "";

// //     if (contentType.includes("application/json")) {
// //       return await response.json();
// //     }

// //     const text = await response.text();

// //     throw new Error(
// //       text
// //         ? `Server returned an invalid response (${response.status}).`
// //         : "Server returned an invalid response.",
// //     );
// //   }

// //   // ======================================================
// //   // LOAD CONSULTATION
// //   // ======================================================

// //   async function loadConsultationData() {
// //     if (!appointmentId) {
// //       setLoading(false);

// //       showError("Appointment ID is missing.");

// //       return;
// //     }

// //     const numericAppointmentId = Number(appointmentId);

// //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// //       setLoading(false);

// //       showError("Invalid appointment ID.");

// //       return;
// //     }

// //     try {
// //       setLoading(true);

// //       const response = await fetch(
// //         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
// //           numericAppointmentId,
// //         )}`,
// //         {
// //           method: "GET",

// //           credentials: "include",

// //           cache: "no-store",
// //         },
// //       );

// //       const data = await getResponseData(response);

// //       if (response.status === 401) {
// //         router.replace("/login");

// //         return;
// //       }

// //       if (response.status === 403) {
// //         router.replace("/unauthorized");

// //         return;
// //       }

// //       if (!response.ok) {
// //         showError(data.message || "Unable to load consultation.");

// //         return;
// //       }

// //       setAppointment(data.appointment || null);

// //       setPatient(data.patient || null);

// //       setMedicalHistory(
// //         Array.isArray(data.medical_history) ? data.medical_history : [],
// //       );

// //       setConsultation(data.consultation || null);

// //       setUploadedRecording(data.audio_recording || null);

// //       setTranscript(data.transcript || null);

// //       setTranscriptSegments(
// //         Array.isArray(data.transcript_segments) ? data.transcript_segments : [],
// //       );

// //       if (data.transcript?.language) {
// //         const validLanguage = TRANSCRIPTION_LANGUAGES.some(
// //           (item) => item.value === data.transcript.language,
// //         );

// //         if (validLanguage) {
// //           setSelectedLanguage(data.transcript.language);
// //         }
// //       }
// //     } catch (error) {
// //       console.error("LOAD CONSULTATION ERROR:", error);

// //       showError(error?.message || "Unable to connect to the server.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   useEffect(() => {
// //     loadConsultationData();
// //   }, [appointmentId]);

// //   // ======================================================
// //   // START CONSULTATION
// //   // ======================================================

// //   async function handleStartConsultation() {
// //     const numericAppointmentId = Number(appointmentId);

// //     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
// //       showError("Valid appointment ID is required.");

// //       return;
// //     }

// //     try {
// //       setStarting(true);

// //       const response = await fetch("/api/doctors/consultations/start", {
// //         method: "POST",

// //         headers: {
// //           "Content-Type": "application/json",
// //         },

// //         credentials: "include",

// //         cache: "no-store",

// //         body: JSON.stringify({
// //           appointment_id: numericAppointmentId,
// //         }),
// //       });

// //       const data = await getResponseData(response);

// //       if (response.status === 401) {
// //         router.replace("/login");

// //         return;
// //       }

// //       if (response.status === 403) {
// //         router.replace("/unauthorized");

// //         return;
// //       }

// //       if (!response.ok) {
// //         showError(data.message || "Unable to start consultation.");

// //         return;
// //       }

// //       if (!data.consultation?.id) {
// //         showError("Consultation information was not returned.");

// //         return;
// //       }

// //       setConsultation(data.consultation);

// //       if (data.appointment) {
// //         setAppointment((previous) => ({
// //           ...(previous || {}),
// //           ...data.appointment,
// //         }));
// //       } else {
// //         setAppointment((previous) =>
// //           previous
// //             ? {
// //                 ...previous,

// //                 status: "in_consultation",
// //               }
// //             : previous,
// //         );
// //       }

// //       if (data.audio_recording) {
// //         setUploadedRecording(data.audio_recording);
// //       }

// //       if (data.transcript) {
// //         setTranscript(data.transcript);
// //       }

// //       if (Array.isArray(data.transcript_segments)) {
// //         setTranscriptSegments(data.transcript_segments);
// //       }

// //       showSuccess(data.message || "Consultation started successfully.");
// //     } catch (error) {
// //       console.error("START CONSULTATION ERROR:", error);

// //       showError(error?.message || "Unable to start consultation.");
// //     } finally {
// //       setStarting(false);
// //     }
// //   }

// //   // ======================================================
// //   // TIMER
// //   // ======================================================

// //   function stopTimer() {
// //     if (timerRef.current) {
// //       clearInterval(timerRef.current);

// //       timerRef.current = null;
// //     }
// //   }

// //   function startTimer() {
// //     stopTimer();

// //     timerRef.current = setInterval(() => {
// //       setRecordingSeconds((previous) => previous + 1);
// //     }, 1000);
// //   }

// //   function formatDuration(totalSeconds) {
// //     const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

// //     const minutes = Math.floor(safeSeconds / 60);

// //     const seconds = Math.floor(safeSeconds % 60);

// //     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
// //       2,
// //       "0",
// //     )}`;
// //   }

// //   function formatTranscriptTime(value) {
// //     const seconds = Math.max(0, Math.floor(Number(value) || 0));

// //     const hours = Math.floor(seconds / 3600);

// //     const minutes = Math.floor((seconds % 3600) / 60);

// //     const remaining = seconds % 60;

// //     if (hours > 0) {
// //       return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
// //         2,
// //         "0",
// //       )}:${String(remaining).padStart(2, "0")}`;
// //     }

// //     return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
// //       2,
// //       "0",
// //     )}`;
// //   }

// //   // ======================================================
// //   // MICROPHONE
// //   // ======================================================

// //   function stopMicrophoneStream() {
// //     if (!streamRef.current) {
// //       return;
// //     }

// //     streamRef.current.getTracks().forEach((track) => {
// //       track.stop();
// //     });

// //     streamRef.current = null;
// //   }

// //   // ======================================================
// //   // START RECORDING
// //   // ======================================================

// //   async function handleStartRecording() {
// //     try {
// //       if (!consultation?.id) {
// //         showError("Start the consultation before recording.");

// //         return;
// //       }

// //       if (
// //         typeof window === "undefined" ||
// //         !navigator.mediaDevices?.getUserMedia ||
// //         typeof MediaRecorder === "undefined"
// //       ) {
// //         showError("Microphone recording is not supported in this browser.");

// //         return;
// //       }

// //       const stream = await navigator.mediaDevices.getUserMedia({
// //         audio: {
// //           echoCancellation: true,

// //           noiseSuppression: true,

// //           autoGainControl: true,
// //         },
// //       });

// //       streamRef.current = stream;

// //       let mimeType = "";

// //       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
// //         mimeType = "audio/webm;codecs=opus";
// //       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
// //         mimeType = "audio/webm";
// //       } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
// //         mimeType = "audio/ogg;codecs=opus";
// //       }

// //       const recorder = mimeType
// //         ? new MediaRecorder(stream, {
// //             mimeType,
// //           })
// //         : new MediaRecorder(stream);

// //       recorderRef.current = recorder;

// //       chunksRef.current = [];

// //       if (audioUrl) {
// //         URL.revokeObjectURL(audioUrl);
// //       }

// //       setAudioBlob(null);

// //       setAudioUrl("");

// //       setUploadedRecording(null);

// //       setTranscript(null);

// //       setTranscriptSegments([]);

// //       setRecordingSeconds(0);

// //       setIsPaused(false);

// //       recorder.ondataavailable = (event) => {
// //         if (event.data && event.data.size > 0) {
// //           chunksRef.current.push(event.data);
// //         }
// //       };

// //       recorder.onstop = () => {
// //         const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

// //         const blob = new Blob(chunksRef.current, {
// //           type: finalMimeType,
// //         });

// //         if (!blob.size) {
// //           showError("Recording is empty. Please record again.");

// //           setIsRecording(false);

// //           setIsPaused(false);

// //           stopTimer();

// //           stopMicrophoneStream();

// //           recorderRef.current = null;

// //           return;
// //         }

// //         const previewUrl = URL.createObjectURL(blob);

// //         setAudioBlob(blob);

// //         setAudioUrl(previewUrl);

// //         setIsRecording(false);

// //         setIsPaused(false);

// //         stopTimer();

// //         stopMicrophoneStream();

// //         recorderRef.current = null;

// //         showSuccess("Recording completed. Review it before saving.");
// //       };

// //       recorder.onerror = (event) => {
// //         console.error("MEDIA RECORDER ERROR:", event.error);

// //         setIsRecording(false);

// //         setIsPaused(false);

// //         stopTimer();

// //         stopMicrophoneStream();

// //         recorderRef.current = null;

// //         showError("An error occurred while recording.");
// //       };

// //       recorder.start(1000);

// //       setIsRecording(true);

// //       setIsPaused(false);

// //       startTimer();
// //     } catch (error) {
// //       console.error("START RECORDING ERROR:", error);

// //       stopMicrophoneStream();

// //       if (error?.name === "NotAllowedError") {
// //         showError("Microphone permission was denied.");
// //       } else if (error?.name === "NotFoundError") {
// //         showError("No microphone was found.");
// //       } else {
// //         showError(error?.message || "Unable to start recording.");
// //       }
// //     }
// //   }

// //   function handlePauseRecording() {
// //     const recorder = recorderRef.current;

// //     if (recorder?.state === "recording") {
// //       recorder.pause();

// //       setIsPaused(true);

// //       stopTimer();
// //     }
// //   }

// //   function handleResumeRecording() {
// //     const recorder = recorderRef.current;

// //     if (recorder?.state === "paused") {
// //       recorder.resume();

// //       setIsPaused(false);

// //       startTimer();
// //     }
// //   }

// //   function handleStopRecording() {
// //     const recorder = recorderRef.current;

// //     if (recorder && ["recording", "paused"].includes(recorder.state)) {
// //       recorder.stop();
// //     }
// //   }

// //   function handleRecordAgain() {
// //     if (audioUrl) {
// //       URL.revokeObjectURL(audioUrl);
// //     }

// //     setAudioBlob(null);

// //     setAudioUrl("");

// //     setRecordingSeconds(0);

// //     setUploadedRecording(null);

// //     setTranscript(null);

// //     setTranscriptSegments([]);
// //   }

// //   // ======================================================
// //   // UPLOAD AUDIO
// //   // ======================================================

// //   async function handleUploadAudio() {
// //     if (!audioBlob) {
// //       showError("Record audio before saving.");

// //       return;
// //     }

// //     if (!consultation?.id) {
// //       showError("Consultation ID is missing.");

// //       return;
// //     }

// //     try {
// //       setUploadingAudio(true);

// //       const blobType = audioBlob.type || "audio/webm";

// //       let extension = "webm";

// //       if (blobType.includes("ogg")) {
// //         extension = "ogg";
// //       } else if (blobType.includes("mp4")) {
// //         extension = "mp4";
// //       } else if (blobType.includes("mpeg")) {
// //         extension = "mp3";
// //       } else if (blobType.includes("wav")) {
// //         extension = "wav";
// //       }

// //       const file = new File(
// //         [audioBlob],

// //         `consultation-${consultation.id}.${extension}`,

// //         {
// //           type: blobType,
// //         },
// //       );

// //       const formData = new FormData();

// //       formData.append("consultation_id", String(consultation.id));

// //       formData.append("duration_seconds", String(recordingSeconds));

// //       formData.append("audio", file);

// //       const response = await fetch("/api/doctors/consultations/audio", {
// //         method: "POST",

// //         credentials: "include",

// //         cache: "no-store",

// //         body: formData,
// //       });

// //       const data = await getResponseData(response);

// //       if (response.status === 401) {
// //         router.replace("/login");

// //         return;
// //       }

// //       if (response.status === 403) {
// //         router.replace("/unauthorized");

// //         return;
// //       }

// //       if (!response.ok) {
// //         showError(data.message || "Unable to save recording.");

// //         return;
// //       }

// //       setUploadedRecording(data.audio_recording || null);

// //       setTranscript(null);

// //       setTranscriptSegments([]);

// //       setConsultation((previous) =>
// //         previous
// //           ? {
// //               ...previous,

// //               status: "recorded",
// //             }
// //           : previous,
// //       );

// //       showSuccess(data.message || "Recording saved successfully.");
// //     } catch (error) {
// //       console.error("UPLOAD AUDIO ERROR:", error);

// //       showError(error?.message || "Unable to upload recording.");
// //     } finally {
// //       setUploadingAudio(false);
// //     }
// //   }

// //   // ======================================================
// //   // DELETE MODAL
// //   // ======================================================

// //   function openDeleteRecordingModal() {
// //     if (!uploadedRecording?.id) {
// //       showError("No recording is available to delete.");

// //       return;
// //     }

// //     setDeleteModalOpen(true);
// //   }

// //   function closeDeleteRecordingModal() {
// //     if (deletingRecording) {
// //       return;
// //     }

// //     setDeleteModalOpen(false);
// //   }

// //   // ======================================================
// //   // DELETE RECORDING
// //   // ======================================================

// //   async function handleDeleteRecording() {
// //     if (!consultation?.id || !uploadedRecording?.id) {
// //       showError("Recording information is missing.");

// //       return;
// //     }

// //     try {
// //       setDeletingRecording(true);

// //       const response = await fetch("/api/doctors/consultations/audio", {
// //         method: "DELETE",

// //         headers: {
// //           "Content-Type": "application/json",
// //         },

// //         credentials: "include",

// //         cache: "no-store",

// //         body: JSON.stringify({
// //           consultation_id: consultation.id,

// //           audio_recording_id: uploadedRecording.id,
// //         }),
// //       });

// //       const data = await getResponseData(response);

// //       if (response.status === 401) {
// //         router.replace("/login");

// //         return;
// //       }

// //       if (response.status === 403) {
// //         router.replace("/unauthorized");

// //         return;
// //       }

// //       if (!response.ok) {
// //         showError(data.message || "Unable to delete recording.");

// //         return;
// //       }

// //       if (audioUrl) {
// //         URL.revokeObjectURL(audioUrl);
// //       }

// //       setAudioBlob(null);

// //       setAudioUrl("");

// //       setRecordingSeconds(0);

// //       setTranscript(null);

// //       setTranscriptSegments([]);

// //       setUploadedRecording(data.remaining_audio_recording || null);

// //       if (data.consultation) {
// //         setConsultation((previous) => ({
// //           ...(previous || {}),
// //           ...data.consultation,
// //         }));
// //       }

// //       setDeleteModalOpen(false);

// //       showSuccess(data.message || "Recording deleted successfully.");
// //     } catch (error) {
// //       console.error("DELETE RECORDING ERROR:", error);

// //       showError(error?.message || "Unable to delete recording.");
// //     } finally {
// //       setDeletingRecording(false);
// //     }
// //   }

// //   // ======================================================
// //   // PUTER HELPERS
// //   // ======================================================

// //   function findTranscriptText(result) {
// //     const candidates = [
// //       result?.text,
// //       result?.data?.text,
// //       result?.result?.text,
// //       result?.output?.text,
// //     ];

// //     for (const candidate of candidates) {
// //       if (typeof candidate === "string" && candidate.trim()) {
// //         return candidate.trim();
// //       }
// //     }

// //     return "";
// //   }

// //   function findRawSegments(result) {
// //     const candidates = [
// //       result?.segments,
// //       result?.data?.segments,
// //       result?.result?.segments,
// //       result?.output?.segments,
// //     ];

// //     for (const candidate of candidates) {
// //       if (Array.isArray(candidate) && candidate.length) {
// //         return candidate;
// //       }
// //     }

// //     return [];
// //   }

// //   function findWords(result) {
// //     const candidates = [
// //       result?.words,
// //       result?.data?.words,
// //       result?.result?.words,
// //       result?.output?.words,
// //     ];

// //     for (const candidate of candidates) {
// //       if (Array.isArray(candidate) && candidate.length) {
// //         return candidate;
// //       }
// //     }

// //     return [];
// //   }

// //   function normalizePuterSegments(segments) {
// //     return (Array.isArray(segments) ? segments : [])
// //       .map((segment, index) => {
// //         const start = Number(segment?.start ?? segment?.start_time ?? 0) || 0;

// //         const end = Number(segment?.end ?? segment?.end_time ?? start) || start;

// //         const rawSpeaker =
// //           segment?.speaker ?? segment?.speaker_id ?? `speaker_${index}`;

// //         const text =
// //           typeof segment?.text === "string" ? segment.text.trim() : "";

// //         return {
// //           segment_index: index,

// //           speaker: String(rawSpeaker),

// //           speaker_role: null,

// //           start_time: start,

// //           end_time: Math.max(start, end),

// //           text,
// //         };
// //       })
// //       .filter((segment) => segment.text);
// //   }

// //   function buildSegmentsFromWords(words) {
// //     const segments = [];

// //     let current = null;

// //     for (const word of words) {
// //       const text = typeof word?.text === "string" ? word.text.trim() : "";

// //       if (!text) {
// //         continue;
// //       }

// //       const rawSpeaker = word?.speaker ?? word?.speaker_id ?? "speaker_unknown";

// //       const speaker = String(rawSpeaker);

// //       const start = Number(word?.start) || 0;

// //       const end = Number(word?.end) || start;

// //       if (!current || current.speaker !== speaker) {
// //         if (current) {
// //           segments.push(current);
// //         }

// //         current = {
// //           segment_index: segments.length,

// //           speaker,

// //           speaker_role: null,

// //           start_time: start,

// //           end_time: end,

// //           text,
// //         };
// //       } else {
// //         current.text = `${current.text} ${text}`;

// //         current.end_time = end;
// //       }
// //     }

// //     if (current) {
// //       segments.push(current);
// //     }

// //     return segments;
// //   }

// //   function cleanJsonText(value) {
// //     return String(value || "")
// //       .trim()
// //       .replace(/^```(?:json)?\s*/i, "")
// //       .replace(/\s*```$/i, "")
// //       .trim();
// //   }

// //   function getPuterChatText(result) {
// //     if (typeof result === "string") {
// //       return result.trim();
// //     }

// //     if (typeof result?.message?.content === "string") {
// //       return result.message.content.trim();
// //     }

// //     if (Array.isArray(result?.message?.content)) {
// //       return result.message.content
// //         .map((item) => (typeof item?.text === "string" ? item.text : ""))
// //         .join("")
// //         .trim();
// //     }

// //     return "";
// //   }

// //   // ======================================================
// //   // DOCTOR / PATIENT IDENTIFICATION
// //   // ======================================================

// //   async function identifySpeakerRoles(segments) {
// //     const speakers = [...new Set(segments.map((segment) => segment.speaker))];

// //     if (speakers.length < 2) {
// //       return Object.fromEntries(
// //         speakers.map((speaker) => [speaker, "unknown"]),
// //       );
// //     }

// //     const conversation = segments
// //       .map((segment) => `${segment.speaker}: ${segment.text}`)
// //       .join("\n");

// //     const prompt = `
// // This is a medical consultation between one doctor and one patient.

// // Identify which diarized speaker is the doctor and which is the patient.

// // The doctor normally asks about symptoms, medication, history, diagnosis or treatment.
// // The patient normally reports symptoms and answers the doctor's questions.

// // Return ONLY valid JSON:

// // {
// //   "doctor": "speaker_name",
// //   "patient": "speaker_name"
// // }

// // Speakers:
// // ${speakers.join(", ")}

// // Conversation:
// // ${conversation}
// //     `.trim();

// //     try {
// //       const result = await window.puter.ai.chat(prompt);

// //       const text = cleanJsonText(getPuterChatText(result));

// //       const parsed = JSON.parse(text);

// //       const roles = {};

// //       if (speakers.includes(parsed?.doctor)) {
// //         roles[parsed.doctor] = "doctor";
// //       }

// //       if (speakers.includes(parsed?.patient)) {
// //         roles[parsed.patient] = "patient";
// //       }

// //       speakers.forEach((speaker) => {
// //         if (!roles[speaker]) {
// //           roles[speaker] = "unknown";
// //         }
// //       });

// //       return roles;
// //     } catch (error) {
// //       console.error("SPEAKER IDENTIFICATION ERROR:", error);

// //       return Object.fromEntries(
// //         speakers.map((speaker) => [speaker, "unknown"]),
// //       );
// //     }
// //   }

// //   // ======================================================
// //   // OPENAI DIARIZATION
// //   // ======================================================

// //   async function tryOpenAIDiarization(file) {
// //     const options = {
// //       provider: "openai",

// //       model: "gpt-4o-transcribe-diarize",

// //       response_format: "diarized_json",

// //       chunking_strategy: "auto",
// //     };

// //     const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

// //     if (providerLanguage) {
// //       options.language = providerLanguage;
// //     }

// //     const result = await window.puter.ai.speech2txt(file, options);

// //     console.log("OPENAI DIARIZATION RESPONSE:", result);

// //     return {
// //       provider: "openai",

// //       result,

// //       text: findTranscriptText(result),

// //       segments: normalizePuterSegments(findRawSegments(result)),
// //     };
// //   }

// //   // ======================================================
// //   // XAI FALLBACK
// //   // ======================================================

// //   async function tryXAIDiarization(file) {
// //     const options = {
// //       audio: file,

// //       provider: "xai",

// //       diarize: true,
// //     };

// //     const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

// //     if (providerLanguage) {
// //       options.language = providerLanguage;

// //       options.format = true;
// //     }

// //     const result = await window.puter.ai.speech2txt(options);

// //     console.log("XAI DIARIZATION RESPONSE:", result);

// //     return {
// //       provider: "xai",

// //       result,

// //       text: findTranscriptText(result),

// //       segments: buildSegmentsFromWords(findWords(result)),
// //     };
// //   }

// //   // ======================================================
// //   // DIARIZATION ENGINE
// //   // ======================================================

// //   async function callPuterDiarization(file) {
// //     let openAIResult = null;

// //     try {
// //       openAIResult = await tryOpenAIDiarization(file);

// //       if (openAIResult.segments.length > 0) {
// //         return openAIResult;
// //       }
// //     } catch (error) {
// //       console.error("OPENAI DIARIZATION ERROR:", error);
// //     }

// //     try {
// //       const xaiResult = await tryXAIDiarization(file);

// //       if (xaiResult.segments.length > 0) {
// //         return xaiResult;
// //       }
// //     } catch (error) {
// //       console.error("XAI DIARIZATION ERROR:", error);
// //     }

// //     if (openAIResult?.text) {
// //       throw new Error(
// //         "Speech was detected, but speaker separation could not be generated.",
// //       );
// //     }

// //     throw new Error(
// //       "The saved recording could not be transcribed with speaker separation.",
// //     );
// //   }

// //   // ======================================================
// //   // GENERATE TRANSCRIPT
// //   // ======================================================

// //   async function handleGenerateTranscript() {
// //     if (!consultation?.id) {
// //       showError("Consultation ID is missing.");

// //       return;
// //     }

// //     if (!uploadedRecording?.id) {
// //       showError("Please save the recording first.");

// //       return;
// //     }

// //     if (!uploadedRecording?.audio_url) {
// //       showError("Audio URL is missing. Reload the consultation.");

// //       return;
// //     }

// //     if (!window.puter?.ai || typeof window.puter.ai.speech2txt !== "function") {
// //       showError("Speech-to-text service is unavailable.");

// //       return;
// //     }

// //     try {
// //       setTranscribing(true);

// //       const audioResponse = await fetch(uploadedRecording.audio_url, {
// //         method: "GET",

// //         cache: "no-store",
// //       });

// //       if (!audioResponse.ok) {
// //         throw new Error(
// //           `Unable to load saved audio (${audioResponse.status}).`,
// //         );
// //       }

// //       const fetchedBlob = await audioResponse.blob();

// //       if (fetchedBlob.size < 1000) {
// //         throw new Error("Saved audio is too small to transcribe.");
// //       }

// //       const rawMimeType =
// //         uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

// //       const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

// //       let extension = "webm";

// //       if (mimeType.includes("ogg")) {
// //         extension = "ogg";
// //       } else if (mimeType.includes("mp4")) {
// //         extension = "mp4";
// //       } else if (mimeType.includes("mpeg")) {
// //         extension = "mp3";
// //       } else if (mimeType.includes("wav")) {
// //         extension = "wav";
// //       }

// //       const file = new File(
// //         [fetchedBlob],

// //         `consultation-${consultation.id}.${extension}`,

// //         {
// //           type: mimeType,
// //         },
// //       );

// //       const diarization = await callPuterDiarization(file);

// //       if (!diarization.segments.length) {
// //         throw new Error("Speaker-separated transcript was not returned.");
// //       }

// //       const roles = await identifySpeakerRoles(diarization.segments);

// //       const finalSegments = diarization.segments.map((segment, index) => ({
// //         ...segment,

// //         segment_index: index,

// //         speaker_role:
// //           roles[segment.speaker] === "doctor" ||
// //           roles[segment.speaker] === "patient"
// //             ? roles[segment.speaker]
// //             : null,
// //       }));

// //       let transcriptText = diarization.text || "";

// //       if (!transcriptText) {
// //         transcriptText = finalSegments
// //           .map((segment) => segment.text)
// //           .join(" ")
// //           .trim();
// //       }

// //       if (!transcriptText) {
// //         throw new Error("Transcript is empty.");
// //       }

// //       const response = await fetch("/api/doctors/consultations/transcribe", {
// //         method: "POST",

// //         headers: {
// //           "Content-Type": "application/json",
// //         },

// //         credentials: "include",

// //         cache: "no-store",

// //         body: JSON.stringify({
// //           consultation_id: consultation.id,

// //           audio_recording_id: uploadedRecording.id,

// //           transcript_text: transcriptText,

// //           segments: finalSegments,

// //           provider: "puter",

// //           model: "gpt-4o-transcribe-diarize",

// //           language: selectedLanguage,
// //         }),
// //       });

// //       const data = await getResponseData(response);

// //       if (response.status === 401) {
// //         router.replace("/login");

// //         return;
// //       }

// //       if (response.status === 403) {
// //         router.replace("/unauthorized");

// //         return;
// //       }

// //       if (!response.ok) {
// //         showError(
// //           data.message || "Transcript generated but could not be saved.",
// //         );

// //         return;
// //       }

// //       setTranscript(data.transcript || null);

// //       setTranscriptSegments(
// //         Array.isArray(data.transcript_segments)
// //           ? data.transcript_segments
// //           : finalSegments,
// //       );

// //       setUploadedRecording((previous) =>
// //         previous
// //           ? {
// //               ...previous,

// //               status: "completed",
// //             }
// //           : previous,
// //       );

// //       setConsultation((previous) =>
// //         previous
// //           ? {
// //               ...previous,

// //               status: "transcribed",
// //             }
// //           : previous,
// //       );

// //       showSuccess(data.message || "Transcript generated successfully.");
// //     } catch (error) {
// //       console.error("GENERATE DIARIZED TRANSCRIPT ERROR:", error);

// //       showError(error?.message || "Unable to generate transcript.");
// //     } finally {
// //       setTranscribing(false);
// //     }
// //   }

// //   // ======================================================
// //   // GENERAL DOWNLOAD HELPERS
// //   // ======================================================

// //   function getSafeFileName() {
// //     const patientName =
// //       String(patient?.name || "patient")
// //         .trim()
// //         .replace(/[^a-zA-Z0-9_-]+/g, "-")
// //         .replace(/^-+|-+$/g, "") || "patient";

// //     return `consultation-${consultation?.id || "transcript"}-${patientName}`;
// //   }

// //   function triggerBlobDownload(blob, fileName) {
// //     const url = URL.createObjectURL(blob);

// //     const anchor = document.createElement("a");

// //     anchor.href = url;

// //     anchor.download = fileName;

// //     document.body.appendChild(anchor);

// //     anchor.click();

// //     anchor.remove();

// //     setTimeout(() => {
// //       URL.revokeObjectURL(url);
// //     }, 1000);
// //   }

// //   function getExportConversation() {
// //     if (transcriptSegments.length > 0) {
// //       return transcriptSegments.map((segment) => ({
// //         speaker: getSpeakerLabel(segment),

// //         detected_speaker: segment.speaker,

// //         start_time: Number(segment.start_time) || 0,

// //         end_time: Number(segment.end_time) || 0,

// //         text: segment.text || "",
// //       }));
// //     }

// //     return [
// //       {
// //         speaker: "Transcript",

// //         detected_speaker: null,

// //         start_time: 0,

// //         end_time: Number(uploadedRecording?.duration_seconds) || 0,

// //         text: transcript?.edited_text || transcript?.full_text || "",
// //       },
// //     ];
// //   }

// //   function getExportMetadata() {
// //     return {
// //       patient: patient?.name || "—",

// //       patient_code: patient?.patient_code || "—",

// //       appointment_id: appointment?.id || null,

// //       consultation_id: consultation?.id || null,

// //       transcript_id: transcript?.id || null,

// //       language: getLanguageLabel(transcript?.language || selectedLanguage),

// //       appointment_date: appointment?.appointment_date || null,

// //       appointment_time: appointment?.appointment_time || null,

// //       duration_seconds: uploadedRecording?.duration_seconds || null,

// //       word_count: transcript?.word_count || null,
// //     };
// //   }

// //   // ======================================================
// //   // TXT DOWNLOAD
// //   // ======================================================

// //   async function handleDownloadTxt() {
// //     if (!transcript) {
// //       showError("No transcript is available.");

// //       return;
// //     }

// //     try {
// //       setDownloadingFormat("txt");

// //       const metadata = getExportMetadata();

// //       const conversation = getExportConversation();

// //       const lines = [
// //         "MEDTRANSCRIPT",
// //         "Medical Consultation Transcript",
// //         "==========================================",
// //         "",
// //         `Patient: ${metadata.patient}`,
// //         `Patient Code: ${metadata.patient_code}`,
// //         `Appointment ID: ${metadata.appointment_id ?? "—"}`,
// //         `Consultation ID: ${metadata.consultation_id ?? "—"}`,
// //         `Transcript ID: ${metadata.transcript_id ?? "—"}`,
// //         `Language: ${metadata.language}`,
// //         `Date: ${formatDate(metadata.appointment_date)}`,
// //         `Time: ${formatTime(metadata.appointment_time)}`,
// //         `Duration: ${formatDuration(metadata.duration_seconds)}`,
// //         "",
// //         "==========================================",
// //         "CONVERSATION",
// //         "==========================================",
// //         "",
// //       ];

// //       conversation.forEach((segment) => {
// //         lines.push(
// //           `${segment.speaker}  [${formatTranscriptTime(
// //             segment.start_time,
// //           )} - ${formatTranscriptTime(segment.end_time)}]`,
// //         );

// //         lines.push(segment.text);

// //         lines.push("");
// //       });

// //       const blob = new Blob([lines.join("\n")], {
// //         type: "text/plain;charset=utf-8",
// //       });

// //       triggerBlobDownload(blob, `${getSafeFileName()}.txt`);

// //       showSuccess("TXT transcript downloaded.");
// //     } catch (error) {
// //       console.error("TXT DOWNLOAD ERROR:", error);

// //       showError("Unable to download TXT transcript.");
// //     } finally {
// //       setDownloadingFormat("");
// //     }
// //   }

// //   // ======================================================
// //   // JSON DOWNLOAD
// //   // ======================================================

// //   async function handleDownloadJson() {
// //     if (!transcript) {
// //       showError("No transcript is available.");

// //       return;
// //     }

// //     try {
// //       setDownloadingFormat("json");

// //       const data = {
// //         metadata: getExportMetadata(),

// //         consultation,

// //         transcript,

// //         segments: getExportConversation(),
// //       };

// //       const blob = new Blob([JSON.stringify(data, null, 2)], {
// //         type: "application/json;charset=utf-8",
// //       });

// //       triggerBlobDownload(blob, `${getSafeFileName()}.json`);

// //       showSuccess("JSON transcript downloaded.");
// //     } catch (error) {
// //       console.error("JSON DOWNLOAD ERROR:", error);

// //       showError("Unable to download JSON transcript.");
// //     } finally {
// //       setDownloadingFormat("");
// //     }
// //   }

// //   // ======================================================
// //   // DOCX DOWNLOAD
// //   // ======================================================

// //   async function handleDownloadDocx() {
// //     if (!transcript) {
// //       showError("No transcript is available.");

// //       return;
// //     }

// //     try {
// //       setDownloadingFormat("docx");

// //       const metadata = getExportMetadata();

// //       const conversation = getExportConversation();

// //       const children = [
// //         new Paragraph({
// //           text: "Medical Consultation Transcript",

// //           heading: HeadingLevel.TITLE,
// //         }),

// //         new Paragraph({
// //           children: [
// //             new TextRun({
// //               text: "MedTranscript",

// //               bold: true,
// //             }),
// //           ],
// //         }),

// //         new Paragraph({
// //           text: "",
// //         }),

// //         new Paragraph({
// //           children: [
// //             new TextRun({
// //               text: "Patient: ",

// //               bold: true,
// //             }),

// //             new TextRun(metadata.patient),
// //           ],
// //         }),

// //         new Paragraph({
// //           children: [
// //             new TextRun({
// //               text: "Patient Code: ",

// //               bold: true,
// //             }),

// //             new TextRun(String(metadata.patient_code)),
// //           ],
// //         }),

// //         new Paragraph({
// //           children: [
// //             new TextRun({
// //               text: "Consultation ID: ",

// //               bold: true,
// //             }),

// //             new TextRun(String(metadata.consultation_id ?? "—")),
// //           ],
// //         }),

// //         new Paragraph({
// //           children: [
// //             new TextRun({
// //               text: "Appointment: ",

// //               bold: true,
// //             }),

// //             new TextRun(
// //               `${formatDate(metadata.appointment_date)} · ${formatTime(
// //                 metadata.appointment_time,
// //               )}`,
// //             ),
// //           ],
// //         }),

// //         new Paragraph({
// //           children: [
// //             new TextRun({
// //               text: "Language: ",

// //               bold: true,
// //             }),

// //             new TextRun(metadata.language),
// //           ],
// //         }),

// //         new Paragraph({
// //           text: "",
// //         }),

// //         new Paragraph({
// //           text: "Conversation",

// //           heading: HeadingLevel.HEADING_1,
// //         }),
// //       ];

// //       conversation.forEach((segment) => {
// //         children.push(
// //           new Paragraph({
// //             spacing: {
// //               before: 250,
// //             },

// //             children: [
// //               new TextRun({
// //                 text: segment.speaker,

// //                 bold: true,
// //               }),

// //               new TextRun({
// //                 text: `   ${formatTranscriptTime(
// //                   segment.start_time,
// //                 )} – ${formatTranscriptTime(segment.end_time)}`,

// //                 color: "64748B",
// //               }),
// //             ],
// //           }),
// //         );

// //         children.push(
// //           new Paragraph({
// //             children: [
// //               new TextRun({
// //                 text: segment.text,
// //               }),
// //             ],
// //           }),
// //         );
// //       });

// //       const document = new Document({
// //         sections: [
// //           {
// //             properties: {},

// //             children,
// //           },
// //         ],
// //       });

// //       const blob = await Packer.toBlob(document);

// //       triggerBlobDownload(blob, `${getSafeFileName()}.docx`);

// //       showSuccess("DOCX transcript downloaded.");
// //     } catch (error) {
// //       console.error("DOCX DOWNLOAD ERROR:", error);

// //       showError("Unable to generate DOCX transcript.");
// //     } finally {
// //       setDownloadingFormat("");
// //     }
// //   }

// //   // ======================================================
// //   // PDF DOWNLOAD
// //   //
// //   // Uses rendered HTML so Urdu / Arabic / mixed-language
// //   // text is handled much better than jsPDF's default fonts.
// //   // ======================================================

// //   async function handleDownloadPdf() {
// //     if (!transcript || !transcriptExportRef.current) {
// //       showError("Transcript is not ready for PDF export.");

// //       return;
// //     }

// //     try {
// //       setDownloadingFormat("pdf");

// //       const html2pdfModule = await import("html2pdf.js");

// //       const html2pdf = html2pdfModule.default || html2pdfModule;

// //       await html2pdf()
// //         .set({
// //           margin: [12, 12, 12, 12],

// //           filename: `${getSafeFileName()}.pdf`,

// //           image: {
// //             type: "jpeg",

// //             quality: 0.98,
// //           },

// //           html2canvas: {
// //             scale: 2,

// //             useCORS: true,

// //             backgroundColor: "#ffffff",
// //           },

// //           jsPDF: {
// //             unit: "mm",

// //             format: "a4",

// //             orientation: "portrait",
// //           },

// //           pagebreak: {
// //             mode: ["avoid-all", "css", "legacy"],
// //           },
// //         })
// //         .from(transcriptExportRef.current)
// //         .save();

// //       showSuccess("PDF transcript downloaded.");
// //     } catch (error) {
// //       console.error("PDF DOWNLOAD ERROR:", error);

// //       showError("Unable to generate PDF transcript.");
// //     } finally {
// //       setDownloadingFormat("");
// //     }
// //   }

// //   // ======================================================
// //   // CLEANUP
// //   // ======================================================

// //   useEffect(() => {
// //     return () => {
// //       stopTimer();

// //       if (recorderRef.current && recorderRef.current.state !== "inactive") {
// //         try {
// //           recorderRef.current.stop();
// //         } catch {}
// //       }

// //       stopMicrophoneStream();

// //       if (toastTimerRef.current) {
// //         clearTimeout(toastTimerRef.current);
// //       }
// //     };
// //   }, []);

// //   useEffect(() => {
// //     return () => {
// //       if (audioUrl) {
// //         URL.revokeObjectURL(audioUrl);
// //       }
// //     };
// //   }, [audioUrl]);

// //   // ======================================================
// //   // UI HELPERS
// //   // ======================================================

// //   function calculateAge(dateOfBirth) {
// //     if (!dateOfBirth) {
// //       return null;
// //     }

// //     const birthDate = new Date(dateOfBirth);

// //     const today = new Date();

// //     let age = today.getFullYear() - birthDate.getFullYear();

// //     const monthDifference = today.getMonth() - birthDate.getMonth();

// //     if (
// //       monthDifference < 0 ||
// //       (monthDifference === 0 && today.getDate() < birthDate.getDate())
// //     ) {
// //       age--;
// //     }

// //     return age;
// //   }

// //   function formatDate(date) {
// //     if (!date) {
// //       return "—";
// //     }

// //     return new Intl.DateTimeFormat("en-GB", {
// //       day: "2-digit",

// //       month: "short",

// //       year: "numeric",
// //     }).format(new Date(date));
// //   }

// //   function formatTime(time) {
// //     if (!time) {
// //       return "—";
// //     }

// //     const [hours, minutes] = String(time).split(":");

// //     const date = new Date();

// //     date.setHours(Number(hours));

// //     date.setMinutes(Number(minutes));

// //     date.setSeconds(0);

// //     return date.toLocaleTimeString("en-US", {
// //       hour: "numeric",

// //       minute: "2-digit",

// //       hour12: true,
// //     });
// //   }

// //   function getAppointmentStatus(status) {
// //     const statuses = {
// //       scheduled: {
// //         label: "Scheduled",
// //         tone: "gray",
// //       },

// //       checked_in: {
// //         label: "Checked in",
// //         tone: "blue",
// //       },

// //       waiting: {
// //         label: "Waiting",
// //         tone: "amber",
// //       },

// //       in_consultation: {
// //         label: "In consultation",
// //         tone: "blue",
// //       },

// //       completed: {
// //         label: "Completed",
// //         tone: "green",
// //       },

// //       cancelled: {
// //         label: "Cancelled",
// //         tone: "red",
// //       },

// //       no_show: {
// //         label: "No show",
// //         tone: "red",
// //       },
// //     };

// //     return (
// //       statuses[status] || {
// //         label: status || "Unknown",

// //         tone: "gray",
// //       }
// //     );
// //   }

// //   function getLanguageLabel(value) {
// //     return (
// //       TRANSCRIPTION_LANGUAGES.find((item) => item.value === value)?.label ||
// //       value ||
// //       "Auto detect"
// //     );
// //   }

// //   function getSpeakerLabel(segment) {
// //     if (segment?.speaker_role === "doctor") {
// //       return "Doctor";
// //     }

// //     if (segment?.speaker_role === "patient") {
// //       return "Patient";
// //     }

// //     return segment?.speaker || "Unknown speaker";
// //   }

// //   function getSpeakerTone(segment) {
// //     if (segment?.speaker_role === "doctor") {
// //       return "blue";
// //     }

// //     if (segment?.speaker_role === "patient") {
// //       return "green";
// //     }

// //     return "gray";
// //   }

// //   // ======================================================
// //   // LOADING
// //   // ======================================================

// //   if (loading) {
// //     return <ConsultationLoading />;
// //   }

// //   // ======================================================
// //   // UNAVAILABLE
// //   // ======================================================

// //   if (!appointmentId || !patient || !appointment) {
// //     return (
// //       <Shell
// //         role="doctor"
// //         title="New consultation"
// //         subtitle="Consultation unavailable"
// //       >
// //         <div className="mx-auto max-w-4xl">
// //           <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
// //             <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
// //               !
// //             </div>

// //             <h2 className="mt-5 text-xl font-bold text-slate-950">
// //               Consultation unavailable
// //             </h2>

// //             <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
// //               We couldn't load the requested consultation.
// //             </p>

// //             <Link
// //               href="/doctor"
// //               className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
// //             >
// //               Back to dashboard
// //             </Link>
// //           </div>
// //         </div>
// //       </Shell>
// //     );
// //   }

// //   // ======================================================
// //   // PAGE DATA
// //   // ======================================================

// //   const age = calculateAge(patient.date_of_birth);

// //   const appointmentStatus = getAppointmentStatus(appointment.status);

// //   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

// //   const consultationStarted = Boolean(consultation?.id);

// //   const consultationLocked =
// //     consultation?.status === "completed" || appointment?.status === "completed";

// //   // ======================================================
// //   // UI
// //   // ======================================================

// //   return (
// //     <>
// //       <Shell
// //         role="doctor"
// //         title="New consultation"
// //         subtitle={`${patient.name} · ${patient.patient_code}`}
// //       >
// //         <div className="mx-auto max-w-6xl space-y-6">
// //           {/* ===============================================
// //               PATIENT HERO
// //           =============================================== */}

// //           <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
// //             <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6 md:px-8">
// //               <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
// //                 <div className="flex items-start gap-4">
// //                   <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-sm">
// //                     {String(patient.name || "P")
// //                       .charAt(0)
// //                       .toUpperCase()}
// //                   </div>

// //                   <div>
// //                     <div className="flex flex-wrap items-center gap-2">
// //                       <h2 className="text-2xl font-bold tracking-tight text-slate-950">
// //                         {patient.name}
// //                       </h2>

// //                       <Badge tone={appointmentStatus.tone}>
// //                         {appointmentStatus.label}
// //                       </Badge>
// //                     </div>

// //                     <p className="mt-2 text-sm text-slate-500">
// //                       {patient.patient_code}

// //                       {" · "}

// //                       {age !== null ? `${age} years` : "Age not added"}

// //                       {" · "}

// //                       {patient.gender || "Gender not added"}
// //                     </p>

// //                     {patient.phone && (
// //                       <p className="mt-1 text-sm text-slate-500">
// //                         {patient.phone}
// //                       </p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <Link
// //                   href={`/doctor/patients/${patient.id}`}
// //                   className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
// //                 >
// //                   View patient profile
// //                 </Link>
// //               </div>
// //             </div>

// //             <div className="grid divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">
// //               <InfoCell label="Appointment" value={`#${appointment.id}`} />

// //               <InfoCell
// //                 label="Date"
// //                 value={formatDate(appointment.appointment_date)}
// //               />

// //               <InfoCell
// //                 label="Time"
// //                 value={formatTime(appointment.appointment_time)}
// //               />

// //               <InfoCell label="Token" value={appointment.token_number || "—"} />
// //             </div>

// //             {appointment.notes && (
// //               <div className="border-t border-slate-100 px-6 py-5 md:px-8">
// //                 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
// //                   Appointment notes
// //                 </p>

// //                 <p className="mt-2 text-sm leading-6 text-slate-700">
// //                   {appointment.notes}
// //                 </p>
// //               </div>
// //             )}
// //           </section>

// //           {/* ===============================================
// //               HISTORY
// //           =============================================== */}

// //           <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
// //             <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 md:px-8">
// //               <div>
// //                 <h3 className="text-base font-bold text-slate-950">
// //                   Patient history
// //                 </h3>

// //                 <p className="mt-1 text-xs text-slate-500">
// //                   Latest medical information available before consultation.
// //                 </p>
// //               </div>

// //               <Link
// //                 href={`/doctor/patients/${patient.id}`}
// //                 className="text-sm font-semibold text-blue-600 hover:text-blue-700"
// //               >
// //                 Full history
// //               </Link>
// //             </div>

// //             {!latestHistory ? (
// //               <div className="px-6 py-8 md:px-8">
// //                 <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
// //                   <p className="text-sm font-medium text-slate-600">
// //                     No medical history has been added for this patient.
// //                   </p>
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8 lg:grid-cols-3">
// //                 <HistoryCard
// //                   label="Previous diseases"
// //                   value={latestHistory.previous_diseases || "None reported"}
// //                 />

// //                 <HistoryCard
// //                   label="Allergies"
// //                   value={latestHistory.allergies || "None reported"}
// //                 />

// //                 <HistoryCard
// //                   label="Current medications"
// //                   value={latestHistory.current_medications || "None reported"}
// //                 />

// //                 <HistoryCard
// //                   label="Previous surgeries"
// //                   value={latestHistory.previous_surgeries || "None reported"}
// //                 />

// //                 <HistoryCard
// //                   label="Family history"
// //                   value={latestHistory.family_history || "None reported"}
// //                 />

// //                 <HistoryCard
// //                   label="Additional notes"
// //                   value={latestHistory.additional_notes || "No notes"}
// //                 />
// //               </div>
// //             )}
// //           </section>

// //           {/* ===============================================
// //               CONSULTATION WORKSPACE
// //           =============================================== */}

// //           <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
// //             <div className="border-b border-slate-100 px-6 py-5 md:px-8">
// //               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// //                 <div>
// //                   <h3 className="text-lg font-bold text-slate-950">
// //                     Consultation workspace
// //                   </h3>

// //                   <p className="mt-1 text-sm text-slate-500">
// //                     Record, review and transcribe the consultation.
// //                   </p>
// //                 </div>

// //                 {consultationStarted && (
// //                   <div className="flex items-center gap-2">
// //                     <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
// //                       Consultation #{consultation.id}
// //                     </span>

// //                     <Badge
// //                       tone={
// //                         consultation.status === "transcribed" ? "green" : "blue"
// //                       }
// //                     >
// //                       {String(consultation.status || "draft").replaceAll(
// //                         "_",
// //                         " ",
// //                       )}
// //                     </Badge>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             <div className="p-6 md:p-8">
// //               {!consultationStarted ? (
// //                 <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center">
// //                   <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200">
// //                     <Icon name="mic" size={27} />
// //                   </div>

// //                   <h3 className="mt-5 text-xl font-bold text-slate-950">
// //                     Ready to start consultation
// //                   </h3>

// //                   <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
// //                     Start when the patient is present. Recording and AI
// //                     transcription will become available immediately.
// //                   </p>

// //                   <button
// //                     type="button"
// //                     disabled={starting}
// //                     onClick={handleStartConsultation}
// //                     className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
// //                   >
// //                     {starting
// //                       ? "Starting consultation..."
// //                       : "Start consultation"}
// //                   </button>
// //                 </div>
// //               ) : (
// //                 <>
// //                   {/* =======================================
// //                       RECORDING PANEL
// //                   ======================================= */}

// //                   <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5 md:p-7">
// //                     <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
// //                       <div className="flex items-start gap-4">
// //                         <div
// //                           className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
// //                             isRecording
// //                               ? "bg-red-100 text-red-600"
// //                               : uploadedRecording
// //                                 ? "bg-emerald-100 text-emerald-700"
// //                                 : "bg-white text-slate-900"
// //                           } shadow-sm`}
// //                         >
// //                           <Icon name="mic" size={24} />
// //                         </div>

// //                         <div>
// //                           <div className="flex flex-wrap items-center gap-2">
// //                             <h4 className="font-bold text-slate-950">
// //                               Consultation recording
// //                             </h4>

// //                             <Badge
// //                               tone={
// //                                 isRecording
// //                                   ? "red"
// //                                   : uploadedRecording
// //                                     ? "green"
// //                                     : "blue"
// //                               }
// //                             >
// //                               {isRecording
// //                                 ? isPaused
// //                                   ? "Paused"
// //                                   : "Recording"
// //                                 : uploadedRecording
// //                                   ? "Saved"
// //                                   : "Ready"}
// //                             </Badge>
// //                           </div>

// //                           <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
// //                             Keep the device close enough to both speakers for
// //                             better transcription and speaker separation.
// //                           </p>
// //                         </div>
// //                       </div>

// //                       {(isRecording || recordingSeconds > 0) && (
// //                         <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
// //                           <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
// //                             Recording time
// //                           </p>

// //                           <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">
// //                             {formatDuration(recordingSeconds)}
// //                           </p>
// //                         </div>
// //                       )}
// //                     </div>

// //                     {/* START */}

// //                     {!isRecording &&
// //                       !audioBlob &&
// //                       !uploadedRecording &&
// //                       !consultationLocked && (
// //                         <div className="mt-6 border-t border-slate-200 pt-6">
// //                           <button
// //                             type="button"
// //                             onClick={handleStartRecording}
// //                             className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
// //                           >
// //                             Start recording
// //                           </button>
// //                         </div>
// //                       )}

// //                     {/* ACTIVE RECORDING */}

// //                     {isRecording && (
// //                       <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
// //                         {!isPaused ? (
// //                           <button
// //                             type="button"
// //                             onClick={handlePauseRecording}
// //                             className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
// //                           >
// //                             Pause recording
// //                           </button>
// //                         ) : (
// //                           <button
// //                             type="button"
// //                             onClick={handleResumeRecording}
// //                             className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
// //                           >
// //                             Resume recording
// //                           </button>
// //                         )}

// //                         <button
// //                           type="button"
// //                           onClick={handleStopRecording}
// //                           className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
// //                         >
// //                           Stop recording
// //                         </button>
// //                       </div>
// //                     )}

// //                     {/* LOCAL PREVIEW */}

// //                     {audioBlob && !uploadedRecording && !isRecording && (
// //                       <div className="mt-6 border-t border-slate-200 pt-6">
// //                         <div className="rounded-2xl border border-slate-200 bg-white p-5">
// //                           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
// //                             <div>
// //                               <p className="font-semibold text-slate-950">
// //                                 Recording ready to review
// //                               </p>

// //                               <p className="mt-1 text-xs text-slate-500">
// //                                 Play the audio before saving it permanently.
// //                               </p>
// //                             </div>

// //                             <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
// //                               {formatDuration(recordingSeconds)}
// //                             </span>
// //                           </div>

// //                           <audio
// //                             controls
// //                             src={audioUrl}
// //                             className="mt-5 w-full"
// //                           />

// //                           <div className="mt-5 flex flex-wrap gap-3">
// //                             <button
// //                               type="button"
// //                               disabled={uploadingAudio}
// //                               onClick={handleUploadAudio}
// //                               className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
// //                             >
// //                               {uploadingAudio
// //                                 ? "Saving recording..."
// //                                 : "Save recording"}
// //                             </button>

// //                             <button
// //                               type="button"
// //                               disabled={uploadingAudio}
// //                               onClick={handleRecordAgain}
// //                               className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
// //                             >
// //                               Record again
// //                             </button>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     )}

// //                     {/* SAVED AUDIO */}

// //                     {uploadedRecording && (
// //                       <div className="mt-6 border-t border-slate-200 pt-6">
// //                         <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">
// //                           <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-4">
// //                             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// //                               <div>
// //                                 <p className="font-bold text-emerald-950">
// //                                   Recording saved securely
// //                                 </p>

// //                                 <p className="mt-1 text-xs text-emerald-700">
// //                                   Recording #{uploadedRecording.id}
// //                                 </p>
// //                               </div>

// //                               <div className="flex flex-wrap gap-2">
// //                                 <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
// //                                   {formatDuration(
// //                                     uploadedRecording.duration_seconds ||
// //                                       recordingSeconds,
// //                                   )}
// //                                 </span>

// //                                 <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
// //                                   {uploadedRecording.mime_type || "Audio"}
// //                                 </span>
// //                               </div>
// //                             </div>
// //                           </div>

// //                           <div className="p-5">
// //                             {uploadedRecording.audio_url && (
// //                               <audio
// //                                 controls
// //                                 src={uploadedRecording.audio_url}
// //                                 className="w-full"
// //                               />
// //                             )}

// //                             <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-[1fr_auto] lg:items-end">
// //                               <div>
// //                                 <label
// //                                   htmlFor="transcription-language"
// //                                   className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
// //                                 >
// //                                   Transcription language
// //                                 </label>

// //                                 <div className="mt-2 flex flex-col gap-3 sm:flex-row">
// //                                   <select
// //                                     id="transcription-language"
// //                                     value={selectedLanguage}
// //                                     onChange={(event) =>
// //                                       setSelectedLanguage(event.target.value)
// //                                     }
// //                                     disabled={transcribing || deletingRecording}
// //                                     className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 disabled:bg-slate-50"
// //                                   >
// //                                     {TRANSCRIPTION_LANGUAGES.map((language) => (
// //                                       <option
// //                                         key={language.value}
// //                                         value={language.value}
// //                                       >
// //                                         {language.label}
// //                                       </option>
// //                                     ))}
// //                                   </select>

// //                                   <button
// //                                     type="button"
// //                                     disabled={transcribing || deletingRecording}
// //                                     onClick={handleGenerateTranscript}
// //                                     className="min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
// //                                   >
// //                                     {transcribing
// //                                       ? "Detecting speakers..."
// //                                       : transcript
// //                                         ? "Regenerate transcript"
// //                                         : "Generate transcript"}
// //                                   </button>
// //                                 </div>

// //                                 {transcribing && (
// //                                   <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600">
// //                                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
// //                                     Processing speech, timestamps and
// //                                     speakers...
// //                                   </div>
// //                                 )}
// //                               </div>

// //                               <button
// //                                 type="button"
// //                                 disabled={transcribing || deletingRecording}
// //                                 onClick={openDeleteRecordingModal}
// //                                 className="min-h-12 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
// //                               >
// //                                 Delete recording
// //                               </button>
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>

// //                   {/* =======================================
// //                       TRANSCRIPT
// //                   ======================================= */}

// //                   {transcript && (
// //                     <section
// //                       ref={transcriptExportRef}
// //                       className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white"
// //                     >
// //                       <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 md:px-6">
// //                         <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
// //                           <div>
// //                             <div className="flex flex-wrap items-center gap-2">
// //                               <h3 className="text-base font-bold text-slate-950">
// //                                 Consultation transcript
// //                               </h3>

// //                               <Badge tone="green">Ready</Badge>
// //                             </div>

// //                             <p className="mt-1 text-xs text-slate-500">
// //                               Speaker-separated conversation with recording
// //                               timestamps.
// //                             </p>
// //                           </div>

// //                           {/* DOWNLOAD BUTTONS */}

// //                           <div
// //                             className="flex flex-wrap gap-2"
// //                             data-html2canvas-ignore="true"
// //                           >
// //                             <ExportButton
// //                               label="TXT"
// //                               loading={downloadingFormat === "txt"}
// //                               onClick={handleDownloadTxt}
// //                             />

// //                             <ExportButton
// //                               label="DOCX"
// //                               loading={downloadingFormat === "docx"}
// //                               onClick={handleDownloadDocx}
// //                             />

// //                             <ExportButton
// //                               label="PDF"
// //                               loading={downloadingFormat === "pdf"}
// //                               onClick={handleDownloadPdf}
// //                             />

// //                             <ExportButton
// //                               label="JSON"
// //                               loading={downloadingFormat === "json"}
// //                               onClick={handleDownloadJson}
// //                             />
// //                           </div>
// //                         </div>
// //                       </div>

// //                       {/* PDF HEADER */}

// //                       <div className="hidden print:block">
// //                         <h1>Medical Consultation Transcript</h1>
// //                       </div>

// //                       <div className="p-5 md:p-6">
// //                         {/* EXPORT META */}

// //                         <div className="mb-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
// //                           <MiniMeta label="Patient" value={patient.name} />

// //                           <MiniMeta
// //                             label="Patient code"
// //                             value={patient.patient_code}
// //                           />

// //                           <MiniMeta
// //                             label="Language"
// //                             value={getLanguageLabel(
// //                               transcript.language || selectedLanguage,
// //                             )}
// //                           />

// //                           <MiniMeta
// //                             label="Segments"
// //                             value={String(transcriptSegments.length)}
// //                           />
// //                         </div>

// //                         {/* SEGMENTS */}

// //                         {transcriptSegments.length > 0 ? (
// //                           <div className="space-y-4">
// //                             {transcriptSegments.map((segment, index) => {
// //                               const isDoctor =
// //                                 segment.speaker_role === "doctor";

// //                               const isPatient =
// //                                 segment.speaker_role === "patient";

// //                               return (
// //                                 <article
// //                                   key={
// //                                     segment.id ||
// //                                     `${segment.segment_index}-${index}`
// //                                   }
// //                                   className={`break-inside-avoid rounded-2xl border p-5 ${
// //                                     isDoctor
// //                                       ? "border-blue-100 bg-blue-50/50"
// //                                       : isPatient
// //                                         ? "border-emerald-100 bg-emerald-50/50"
// //                                         : "border-slate-200 bg-slate-50"
// //                                   }`}
// //                                 >
// //                                   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// //                                     <div className="flex flex-wrap items-center gap-2">
// //                                       <Badge tone={getSpeakerTone(segment)}>
// //                                         {getSpeakerLabel(segment)}
// //                                       </Badge>

// //                                       <span className="text-xs font-medium text-slate-400">
// //                                         {segment.speaker}
// //                                       </span>
// //                                     </div>

// //                                     <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-500 shadow-sm">
// //                                       {formatTranscriptTime(segment.start_time)}

// //                                       {" – "}

// //                                       {formatTranscriptTime(segment.end_time)}
// //                                     </span>
// //                                   </div>

// //                                   <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-800">
// //                                     {segment.text}
// //                                   </p>
// //                                 </article>
// //                               );
// //                             })}
// //                           </div>
// //                         ) : (
// //                           <div className="rounded-2xl bg-slate-50 p-5">
// //                             <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
// //                               {transcript.edited_text ||
// //                                 transcript.full_text ||
// //                                 "Transcript is empty."}
// //                             </p>
// //                           </div>
// //                         )}

// //                         <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
// //                           <span>Transcript #{transcript.id}</span>

// //                           {transcript.word_count !== null &&
// //                             transcript.word_count !== undefined && (
// //                               <span>{transcript.word_count} words</span>
// //                             )}

// //                           <span>
// //                             {transcriptSegments.length} speaker segments
// //                           </span>

// //                           <span className="capitalize">
// //                             Status: {transcript.status}
// //                           </span>
// //                         </div>
// //                       </div>
// //                     </section>
// //                   )}

// //                   {/* =======================================
// //                       PROGRESS
// //                   ======================================= */}

// //                   <div className="mt-7 grid gap-3 md:grid-cols-3">
// //                     <ProcessCard
// //                       number="01"
// //                       title="Patient history"
// //                       value="Available"
// //                       active
// //                     />

// //                     <ProcessCard
// //                       number="02"
// //                       title="Audio recording"
// //                       value={
// //                         uploadedRecording
// //                           ? "Recording saved"
// //                           : "Ready to record"
// //                       }
// //                       active={Boolean(uploadedRecording)}
// //                     />

// //                     <ProcessCard
// //                       number="03"
// //                       title="AI transcript"
// //                       value={
// //                         transcript
// //                           ? `${transcriptSegments.length} segments ready`
// //                           : transcribing
// //                             ? "Processing..."
// //                             : "Ready to generate"
// //                       }
// //                       active={Boolean(transcript)}
// //                       loading={transcribing}
// //                     />
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </section>

// //           <div className="pb-4">
// //             <Link
// //               href="/doctor"
// //               className="inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-slate-950"
// //             >
// //               ← Back to dashboard
// //             </Link>
// //           </div>
// //         </div>
// //       </Shell>

// //       {/* =================================================
// //           TOAST
// //       ================================================= */}

// //       {toast && (
// //         <Toast
// //           type={toast.type}
// //           message={toast.message}
// //           onClose={() => setToast(null)}
// //         />
// //       )}

// //       {/* =================================================
// //           DELETE CONFIRMATION MODAL
// //       ================================================= */}

// //       {deleteModalOpen && (
// //         <DeleteRecordingModal
// //           hasTranscript={Boolean(transcript?.id)}
// //           deleting={deletingRecording}
// //           onCancel={closeDeleteRecordingModal}
// //           onConfirm={handleDeleteRecording}
// //         />
// //       )}
// //     </>
// //   );
// // }

// // // ======================================================
// // // INFO CELL
// // // ======================================================

// // function InfoCell({ label, value }) {
// //   return (
// //     <div className="px-6 py-5">
// //       <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
// //         {label}
// //       </p>

// //       <p className="mt-1.5 text-sm font-bold text-slate-900">{value}</p>
// //     </div>
// //   );
// // }

// // // ======================================================
// // // HISTORY CARD
// // // ======================================================

// // function HistoryCard({ label, value }) {
// //   return (
// //     <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
// //       <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
// //         {label}
// //       </p>

// //       <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
// //         {value}
// //       </p>
// //     </div>
// //   );
// // }

// // // ======================================================
// // // MINI META
// // // ======================================================

// // function MiniMeta({ label, value }) {
// //   return (
// //     <div>
// //       <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
// //         {label}
// //       </p>

// //       <p className="mt-1 text-sm font-semibold text-slate-800">
// //         {value || "—"}
// //       </p>
// //     </div>
// //   );
// // }

// // // ======================================================
// // // EXPORT BUTTON
// // // ======================================================

// // function ExportButton({ label, loading, onClick }) {
// //   return (
// //     <button
// //       type="button"
// //       disabled={loading}
// //       onClick={onClick}
// //       className="min-w-[72px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
// //     >
// //       {loading ? "..." : label}
// //     </button>
// //   );
// // }

// // // ======================================================
// // // PROCESS CARD
// // // ======================================================

// // function ProcessCard({ number, title, value, active, loading }) {
// //   return (
// //     <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
// //       <div className="flex items-center justify-between">
// //         <span className="text-xs font-bold text-slate-300">{number}</span>

// //         <span
// //           className={`h-2.5 w-2.5 rounded-full ${
// //             loading
// //               ? "animate-pulse bg-blue-500"
// //               : active
// //                 ? "bg-emerald-500"
// //                 : "bg-slate-300"
// //           }`}
// //         />
// //       </div>

// //       <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>

// //       <p
// //         className={`mt-1 text-xs font-medium ${
// //           loading
// //             ? "text-blue-600"
// //             : active
// //               ? "text-emerald-600"
// //               : "text-slate-500"
// //         }`}
// //       >
// //         {value}
// //       </p>
// //     </div>
// //   );
// // }

// // // ======================================================
// // // TOAST
// // // ======================================================

// // function Toast({ type, message, onClose }) {
// //   const success = type === "success";

// //   return (
// //     <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md animate-[toastIn_.2s_ease-out] sm:right-6 sm:top-6">
// //       <div
// //         className={`overflow-hidden rounded-2xl border bg-white shadow-2xl ${
// //           success ? "border-emerald-200" : "border-red-200"
// //         }`}
// //       >
// //         <div className="flex items-start gap-3 p-4">
// //           <div
// //             className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${
// //               success
// //                 ? "bg-emerald-50 text-emerald-700"
// //                 : "bg-red-50 text-red-700"
// //             }`}
// //           >
// //             {success ? "✓" : "!"}
// //           </div>

// //           <div className="min-w-0 flex-1">
// //             <p
// //               className={`text-sm font-bold ${
// //                 success ? "text-emerald-950" : "text-red-950"
// //               }`}
// //             >
// //               {success ? "Success" : "Something went wrong"}
// //             </p>

// //             <p className="mt-1 text-sm leading-5 text-slate-600">{message}</p>
// //           </div>

// //           <button
// //             type="button"
// //             onClick={onClose}
// //             className="grid h-8 w-8 place-items-center rounded-lg text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
// //             aria-label="Close notification"
// //           >
// //             ×
// //           </button>
// //         </div>

// //         <div className={`h-1 ${success ? "bg-emerald-500" : "bg-red-500"}`} />
// //       </div>
// //     </div>
// //   );
// // }

// // // ======================================================
// // // DELETE MODAL
// // // ======================================================

// // function DeleteRecordingModal({
// //   hasTranscript,
// //   deleting,
// //   onCancel,
// //   onConfirm,
// // }) {
// //   useEffect(() => {
// //     function handleKeyDown(event) {
// //       if (event.key === "Escape") {
// //         onCancel();
// //       }
// //     }

// //     document.addEventListener("keydown", handleKeyDown);

// //     const previousOverflow = document.body.style.overflow;

// //     document.body.style.overflow = "hidden";

// //     return () => {
// //       document.removeEventListener("keydown", handleKeyDown);

// //       document.body.style.overflow = previousOverflow;
// //     };
// //   }, [onCancel]);

// //   return (
// //     <div
// //       className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
// //       onMouseDown={(event) => {
// //         if (event.target === event.currentTarget) {
// //           onCancel();
// //         }
// //       }}
// //     >
// //       <div className="w-full max-w-md overflow-hidden rounded-[26px] border border-white/20 bg-white shadow-2xl">
// //         <div className="p-6">
// //           <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-lg font-black text-red-600">
// //             !
// //           </div>

// //           <h3 className="mt-5 text-xl font-bold text-slate-950">
// //             Delete recording?
// //           </h3>

// //           <p className="mt-2 text-sm leading-6 text-slate-500">
// //             This recording will be removed from the database and S3 storage.
// //           </p>

// //           {hasTranscript && (
// //             <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
// //               A transcript exists for this recording. Your delete API should
// //               also remove its transcript and speaker segments.
// //             </div>
// //           )}
// //         </div>

// //         <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
// //           <button
// //             type="button"
// //             disabled={deleting}
// //             onClick={onCancel}
// //             className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
// //           >
// //             Cancel
// //           </button>

// //           <button
// //             type="button"
// //             disabled={deleting}
// //             onClick={onConfirm}
// //             className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
// //           >
// //             {deleting ? "Deleting..." : "Delete permanently"}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { Suspense, useEffect, useRef, useState } from "react";

// import { useRouter, useSearchParams } from "next/navigation";

// import Link from "next/link";

// import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

// import Shell from "@/components/Shell";
// import Icon from "@/components/Icon";
// import Badge from "@/components/Badge";

// // ======================================================
// // LANGUAGES
// // ======================================================

// const TRANSCRIPTION_LANGUAGES = [
//   {
//     value: "auto",
//     label: "Auto detect",
//   },
//   {
//     value: "en",
//     label: "English",
//   },
//   {
//     value: "ur",
//     label: "Urdu",
//   },
//   {
//     value: "roman-ur",
//     label: "Roman Urdu",
//   },
//   {
//     value: "hi",
//     label: "Hindi",
//   },
//   {
//     value: "ar",
//     label: "Arabic",
//   },
//   {
//     value: "pa",
//     label: "Punjabi",
//   },
// ];

// // ======================================================
// // PROVIDER LANGUAGE CODES
// // ======================================================

// const PROVIDER_LANGUAGE_CODES = {
//   en: "en",
//   ur: "ur",
//   hi: "hi",
//   ar: "ar",
// };

// // ======================================================
// // PAGE
// // ======================================================

// export default function NewConsultationPage() {
//   return (
//     <Suspense fallback={<ConsultationLoading />}>
//       <NewConsultationContent />
//     </Suspense>
//   );
// }

// // ======================================================
// // LOADING
// // ======================================================

// function ConsultationLoading() {
//   return (
//     <Shell
//       role="doctor"
//       title="New consultation"
//       subtitle="Loading consultation"
//     >
//       <div className="mx-auto max-w-6xl">
//         <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
//           <div className="px-6 py-24 text-center md:px-10">
//             <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950">
//               <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//             </div>

//             <h2 className="mt-5 text-lg font-bold text-slate-950">
//               Loading consultation
//             </h2>

//             <p className="mt-2 text-sm text-slate-500">
//               Preparing consultation information...
//             </p>
//           </div>
//         </div>
//       </div>
//     </Shell>
//   );
// }

// // ======================================================
// // MAIN
// // ======================================================

// function NewConsultationContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const appointmentId = searchParams.get("appointment");

//   // ======================================================
//   // MAIN DATA
//   // ======================================================

//   const [doctor, setDoctor] = useState(null);

//   const [appointment, setAppointment] = useState(null);
//   const [patient, setPatient] = useState(null);
//   const [medicalHistory, setMedicalHistory] = useState([]);
//   const [consultation, setConsultation] = useState(null);

//   // ======================================================
//   // LOADING
//   // ======================================================

//   const [loading, setLoading] = useState(true);
//   const [starting, setStarting] = useState(false);

//   // ======================================================
//   // TOAST
//   // ======================================================

//   const [toast, setToast] = useState(null);
//   const toastTimerRef = useRef(null);

//   // ======================================================
//   // RECORDING
//   // ======================================================

//   const [isRecording, setIsRecording] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);

//   const [recordingSeconds, setRecordingSeconds] = useState(0);

//   const [audioBlob, setAudioBlob] = useState(null);
//   const [audioUrl, setAudioUrl] = useState("");

//   const [uploadingAudio, setUploadingAudio] = useState(false);
//   const [deletingRecording, setDeletingRecording] = useState(false);

//   const [uploadedRecording, setUploadedRecording] = useState(null);

//   // ======================================================
//   // DELETE MODAL
//   // ======================================================

//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);

//   // ======================================================
//   // COMPLETE MODAL
//   // ======================================================

//   const [completeModalOpen, setCompleteModalOpen] = useState(false);

//   const [completingConsultation, setCompletingConsultation] = useState(false);

//   // ======================================================
//   // TRANSCRIPTION
//   // ======================================================

//   const [transcribing, setTranscribing] = useState(false);

//   const [selectedLanguage, setSelectedLanguage] = useState("auto");

//   const [transcript, setTranscript] = useState(null);

//   const [transcriptSegments, setTranscriptSegments] = useState([]);

//   // ======================================================
//   // DOWNLOAD
//   // ======================================================

//   const [downloadingFormat, setDownloadingFormat] = useState("");

//   // ======================================================
//   // REFS
//   // ======================================================

//   const recorderRef = useRef(null);
//   const streamRef = useRef(null);
//   const timerRef = useRef(null);
//   const chunksRef = useRef([]);

//   // const transcriptExportRef = useRef(null);

//   // ======================================================
//   // TOAST
//   // ======================================================

//   function showToast(type, message, duration = 4500) {
//     if (toastTimerRef.current) {
//       clearTimeout(toastTimerRef.current);
//     }

//     setToast({
//       type,
//       message,
//     });

//     toastTimerRef.current = setTimeout(() => {
//       setToast(null);
//       toastTimerRef.current = null;
//     }, duration);
//   }

//   function showSuccess(message) {
//     showToast("success", message);
//   }

//   function showError(message) {
//     showToast("error", message, 6000);
//   }

//   // ======================================================
//   // SAFE RESPONSE
//   // ======================================================

//   async function getResponseData(response) {
//     const contentType = response.headers.get("content-type") || "";

//     if (contentType.includes("application/json")) {
//       return await response.json();
//     }

//     const text = await response.text();

//     throw new Error(
//       text
//         ? `Server returned an invalid response (${response.status}).`
//         : "Server returned an invalid response.",
//     );
//   }

//   // ======================================================
//   // LOAD DOCTOR
//   // ======================================================

//   async function loadDoctorInformation() {
//     try {
//       const response = await fetch("/api/doctors/settings", {
//         method: "GET",
//         credentials: "include",
//         cache: "no-store",
//       });

//       const data = await getResponseData(response);

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         console.error("LOAD DOCTOR INFORMATION ERROR:", data.message);

//         return;
//       }

//       setDoctor(data.doctor || data.profile || data.user || null);
//     } catch (error) {
//       console.error("LOAD DOCTOR INFORMATION ERROR:", error);
//     }
//   }

//   // ======================================================
//   // LOAD CONSULTATION
//   // ======================================================

//   async function loadConsultationData() {
//     if (!appointmentId) {
//       setLoading(false);

//       showError("Appointment ID is missing.");

//       return;
//     }

//     const numericAppointmentId = Number(appointmentId);

//     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
//       setLoading(false);

//       showError("Invalid appointment ID.");

//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await fetch(
//         `/api/doctors/consultations/start?appointment=${encodeURIComponent(
//           numericAppointmentId,
//         )}`,
//         {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         },
//       );

//       const data = await getResponseData(response);

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         showError(data.message || "Unable to load consultation.");

//         return;
//       }

//       setAppointment(data.appointment || null);
//       setPatient(data.patient || null);

//       setMedicalHistory(
//         Array.isArray(data.medical_history) ? data.medical_history : [],
//       );

//       setConsultation(data.consultation || null);

//       setUploadedRecording(data.audio_recording || null);

//       setTranscript(data.transcript || null);

//       setTranscriptSegments(
//         Array.isArray(data.transcript_segments) ? data.transcript_segments : [],
//       );

//       if (data.transcript?.language) {
//         const validLanguage = TRANSCRIPTION_LANGUAGES.some(
//           (item) => item.value === data.transcript.language,
//         );

//         if (validLanguage) {
//           setSelectedLanguage(data.transcript.language);
//         }
//       }
//     } catch (error) {
//       console.error("LOAD CONSULTATION ERROR:", error);

//       showError(error?.message || "Unable to connect to server.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ======================================================
//   // INITIAL LOAD
//   // ======================================================

//   useEffect(() => {
//     loadConsultationData();
//     loadDoctorInformation();
//   }, [appointmentId]);

//   // ======================================================
//   // START CONSULTATION
//   // ======================================================

//   async function handleStartConsultation() {
//     const numericAppointmentId = Number(appointmentId);

//     if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
//       showError("Valid appointment ID is required.");
//       return;
//     }

//     try {
//       setStarting(true);

//       const response = await fetch("/api/doctors/consultations/start", {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         credentials: "include",
//         cache: "no-store",

//         body: JSON.stringify({
//           appointment_id: numericAppointmentId,
//         }),
//       });

//       const data = await getResponseData(response);

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         showError(data.message || "Unable to start consultation.");

//         return;
//       }

//       setConsultation(data.consultation || null);

//       if (data.appointment) {
//         setAppointment((previous) => ({
//           ...(previous || {}),
//           ...data.appointment,
//         }));
//       } else {
//         setAppointment((previous) =>
//           previous
//             ? {
//                 ...previous,
//                 status: "in_consultation",
//               }
//             : previous,
//         );
//       }

//       if (data.audio_recording) {
//         setUploadedRecording(data.audio_recording);
//       }

//       if (data.transcript) {
//         setTranscript(data.transcript);
//       }

//       if (Array.isArray(data.transcript_segments)) {
//         setTranscriptSegments(data.transcript_segments);
//       }

//       showSuccess(data.message || "Consultation started successfully.");
//     } catch (error) {
//       console.error("START CONSULTATION ERROR:", error);

//       showError(error?.message || "Unable to start consultation.");
//     } finally {
//       setStarting(false);
//     }
//   }

//   // ======================================================
//   // COMPLETE CONSULTATION
//   // ======================================================

//   function openCompleteConsultationModal() {
//     if (!consultation?.id) {
//       showError("Consultation ID is missing.");
//       return;
//     }

//     if (consultation.status === "completed") {
//       showSuccess("Consultation is already completed.");
//       return;
//     }

//     setCompleteModalOpen(true);
//   }

//   function closeCompleteConsultationModal() {
//     if (completingConsultation) {
//       return;
//     }

//     setCompleteModalOpen(false);
//   }

//   async function handleCompleteConsultation() {
//     if (!consultation?.id) {
//       showError("Consultation ID is missing.");
//       return;
//     }

//     try {
//       setCompletingConsultation(true);

//       const response = await fetch("/api/doctors/consultations/start", {
//         method: "PATCH",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         credentials: "include",
//         cache: "no-store",

//         body: JSON.stringify({
//           consultation_id: consultation.id,
//           action: "complete",
//         }),
//       });

//       const data = await getResponseData(response);

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         showError(data.message || "Unable to complete consultation.");

//         return;
//       }

//       if (data.consultation) {
//         setConsultation((previous) => ({
//           ...(previous || {}),
//           ...data.consultation,
//         }));
//       }

//       if (data.appointment) {
//         setAppointment((previous) => ({
//           ...(previous || {}),
//           ...data.appointment,
//         }));
//       } else {
//         setAppointment((previous) =>
//           previous
//             ? {
//                 ...previous,
//                 status: "completed",
//               }
//             : previous,
//         );
//       }

//       if (data.audio_recording) {
//         setUploadedRecording(data.audio_recording);
//       }

//       if (data.transcript) {
//         setTranscript(data.transcript);
//       }

//       if (Array.isArray(data.transcript_segments)) {
//         setTranscriptSegments(data.transcript_segments);
//       }

//       setCompleteModalOpen(false);

//       showSuccess(data.message || "Consultation completed successfully.");
//     } catch (error) {
//       console.error("COMPLETE CONSULTATION ERROR:", error);

//       showError(error?.message || "Unable to complete consultation.");
//     } finally {
//       setCompletingConsultation(false);
//     }
//   }

//   // ======================================================
//   // TIMER
//   // ======================================================

//   function stopTimer() {
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }
//   }

//   function startTimer() {
//     stopTimer();

//     timerRef.current = setInterval(() => {
//       setRecordingSeconds((previous) => previous + 1);
//     }, 1000);
//   }

//   function formatDuration(totalSeconds) {
//     const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

//     const minutes = Math.floor(safeSeconds / 60);
//     const seconds = Math.floor(safeSeconds % 60);

//     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
//       2,
//       "0",
//     )}`;
//   }

//   function formatTranscriptTime(value) {
//     const seconds = Math.max(0, Math.floor(Number(value) || 0));

//     const hours = Math.floor(seconds / 3600);

//     const minutes = Math.floor((seconds % 3600) / 60);

//     const remaining = seconds % 60;

//     if (hours > 0) {
//       return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
//         2,
//         "0",
//       )}:${String(remaining).padStart(2, "0")}`;
//     }

//     return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
//       2,
//       "0",
//     )}`;
//   }

//   // ======================================================
//   // MICROPHONE
//   // ======================================================

//   function stopMicrophoneStream() {
//     if (!streamRef.current) {
//       return;
//     }

//     streamRef.current.getTracks().forEach((track) => {
//       track.stop();
//     });

//     streamRef.current = null;
//   }

//   // ======================================================
//   // START RECORDING
//   // ======================================================

//   async function handleStartRecording() {
//     try {
//       if (!consultation?.id) {
//         showError("Start consultation before recording.");
//         return;
//       }

//       if (
//         consultation.status === "completed" ||
//         appointment?.status === "completed"
//       ) {
//         showError("Completed consultation cannot be recorded again.");
//         return;
//       }

//       if (
//         typeof window === "undefined" ||
//         !navigator.mediaDevices?.getUserMedia ||
//         typeof MediaRecorder === "undefined"
//       ) {
//         showError("Microphone recording is not supported in this browser.");

//         return;
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });

//       streamRef.current = stream;

//       let mimeType = "";

//       if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
//         mimeType = "audio/webm;codecs=opus";
//       } else if (MediaRecorder.isTypeSupported("audio/webm")) {
//         mimeType = "audio/webm";
//       } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
//         mimeType = "audio/ogg;codecs=opus";
//       }

//       const recorder = mimeType
//         ? new MediaRecorder(stream, {
//             mimeType,
//           })
//         : new MediaRecorder(stream);

//       recorderRef.current = recorder;
//       chunksRef.current = [];

//       if (audioUrl) {
//         URL.revokeObjectURL(audioUrl);
//       }

//       setAudioBlob(null);
//       setAudioUrl("");

//       setUploadedRecording(null);
//       setTranscript(null);
//       setTranscriptSegments([]);

//       setRecordingSeconds(0);
//       setIsPaused(false);

//       recorder.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           chunksRef.current.push(event.data);
//         }
//       };

//       recorder.onstop = () => {
//         const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

//         const blob = new Blob(chunksRef.current, {
//           type: finalMimeType,
//         });

//         if (!blob.size) {
//           showError("Recording is empty. Please record again.");

//           setIsRecording(false);
//           setIsPaused(false);

//           stopTimer();
//           stopMicrophoneStream();

//           recorderRef.current = null;

//           return;
//         }

//         const previewUrl = URL.createObjectURL(blob);

//         setAudioBlob(blob);
//         setAudioUrl(previewUrl);

//         setIsRecording(false);
//         setIsPaused(false);

//         stopTimer();
//         stopMicrophoneStream();

//         recorderRef.current = null;

//         showSuccess("Recording completed. Review it before saving.");
//       };

//       recorder.onerror = (event) => {
//         console.error("MEDIA RECORDER ERROR:", event.error);

//         setIsRecording(false);
//         setIsPaused(false);

//         stopTimer();
//         stopMicrophoneStream();

//         recorderRef.current = null;

//         showError("An error occurred while recording.");
//       };

//       recorder.start(1000);

//       setIsRecording(true);
//       setIsPaused(false);

//       startTimer();
//     } catch (error) {
//       console.error("START RECORDING ERROR:", error);

//       stopMicrophoneStream();

//       if (error?.name === "NotAllowedError") {
//         showError("Microphone permission was denied.");
//       } else if (error?.name === "NotFoundError") {
//         showError("No microphone was found.");
//       } else {
//         showError(error?.message || "Unable to start recording.");
//       }
//     }
//   }

//   // ======================================================
//   // RECORDING CONTROLS
//   // ======================================================

//   function handlePauseRecording() {
//     const recorder = recorderRef.current;

//     if (recorder?.state === "recording") {
//       recorder.pause();
//       setIsPaused(true);
//       stopTimer();
//     }
//   }

//   function handleResumeRecording() {
//     const recorder = recorderRef.current;

//     if (recorder?.state === "paused") {
//       recorder.resume();
//       setIsPaused(false);
//       startTimer();
//     }
//   }

//   function handleStopRecording() {
//     const recorder = recorderRef.current;

//     if (recorder && ["recording", "paused"].includes(recorder.state)) {
//       recorder.stop();
//     }
//   }

//   function handleRecordAgain() {
//     if (audioUrl) {
//       URL.revokeObjectURL(audioUrl);
//     }

//     setAudioBlob(null);
//     setAudioUrl("");
//     setRecordingSeconds(0);

//     setUploadedRecording(null);
//     setTranscript(null);
//     setTranscriptSegments([]);
//   }

//   // ======================================================
//   // UPLOAD AUDIO
//   // ======================================================

//   async function handleUploadAudio() {
//     if (!audioBlob) {
//       showError("Record audio before saving.");
//       return;
//     }

//     if (!consultation?.id) {
//       showError("Consultation ID is missing.");
//       return;
//     }

//     try {
//       setUploadingAudio(true);

//       const blobType = audioBlob.type || "audio/webm";

//       let extension = "webm";

//       if (blobType.includes("ogg")) {
//         extension = "ogg";
//       } else if (blobType.includes("mp4")) {
//         extension = "mp4";
//       } else if (blobType.includes("mpeg")) {
//         extension = "mp3";
//       } else if (blobType.includes("wav")) {
//         extension = "wav";
//       }

//       const file = new File(
//         [audioBlob],
//         `consultation-${consultation.id}.${extension}`,
//         {
//           type: blobType,
//         },
//       );

//       const formData = new FormData();

//       formData.append("consultation_id", String(consultation.id));

//       formData.append("duration_seconds", String(recordingSeconds));

//       formData.append("audio", file);

//       const response = await fetch("/api/doctors/consultations/audio", {
//         method: "POST",
//         credentials: "include",
//         cache: "no-store",
//         body: formData,
//       });

//       const data = await getResponseData(response);

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         showError(data.message || "Unable to save recording.");

//         return;
//       }

//       setUploadedRecording(data.audio_recording || null);

//       setTranscript(null);
//       setTranscriptSegments([]);

//       setConsultation((previous) =>
//         previous
//           ? {
//               ...previous,
//               status: "recorded",
//             }
//           : previous,
//       );

//       showSuccess(data.message || "Recording saved successfully.");
//     } catch (error) {
//       console.error("UPLOAD AUDIO ERROR:", error);

//       showError(error?.message || "Unable to upload recording.");
//     } finally {
//       setUploadingAudio(false);
//     }
//   }

//   // ======================================================
//   // DELETE MODAL
//   // ======================================================

//   function openDeleteRecordingModal() {
//     if (!uploadedRecording?.id) {
//       showError("No recording is available to delete.");
//       return;
//     }

//     setDeleteModalOpen(true);
//   }

//   function closeDeleteRecordingModal() {
//     if (deletingRecording) {
//       return;
//     }

//     setDeleteModalOpen(false);
//   }

//   // ======================================================
//   // DELETE RECORDING
//   // ======================================================

//   async function handleDeleteRecording() {
//     if (!consultation?.id || !uploadedRecording?.id) {
//       showError("Recording information is missing.");

//       return;
//     }

//     try {
//       setDeletingRecording(true);

//       const response = await fetch("/api/doctors/consultations/audio", {
//         method: "DELETE",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         credentials: "include",
//         cache: "no-store",

//         body: JSON.stringify({
//           consultation_id: consultation.id,
//           audio_recording_id: uploadedRecording.id,
//         }),
//       });

//       const data = await getResponseData(response);

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         showError(data.message || "Unable to delete recording.");

//         return;
//       }

//       if (audioUrl) {
//         URL.revokeObjectURL(audioUrl);
//       }

//       setAudioBlob(null);
//       setAudioUrl("");

//       setRecordingSeconds(0);

//       setTranscript(null);
//       setTranscriptSegments([]);

//       setUploadedRecording(data.remaining_audio_recording || null);

//       if (data.consultation) {
//         setConsultation((previous) => ({
//           ...(previous || {}),
//           ...data.consultation,
//         }));
//       }

//       setDeleteModalOpen(false);

//       showSuccess(data.message || "Recording deleted successfully.");
//     } catch (error) {
//       console.error("DELETE RECORDING ERROR:", error);

//       showError(error?.message || "Unable to delete recording.");
//     } finally {
//       setDeletingRecording(false);
//     }
//   }

//   // ======================================================
//   // PUTER RESULT HELPERS
//   // ======================================================

//   function findTranscriptText(result) {
//     const candidates = [
//       result?.text,
//       result?.data?.text,
//       result?.result?.text,
//       result?.output?.text,
//     ];

//     for (const candidate of candidates) {
//       if (typeof candidate === "string" && candidate.trim()) {
//         return candidate.trim();
//       }
//     }

//     return "";
//   }

//   function findRawSegments(result) {
//     const candidates = [
//       result?.segments,
//       result?.data?.segments,
//       result?.result?.segments,
//       result?.output?.segments,
//     ];

//     for (const candidate of candidates) {
//       if (Array.isArray(candidate) && candidate.length) {
//         return candidate;
//       }
//     }

//     return [];
//   }

//   function findWords(result) {
//     const candidates = [
//       result?.words,
//       result?.data?.words,
//       result?.result?.words,
//       result?.output?.words,
//     ];

//     for (const candidate of candidates) {
//       if (Array.isArray(candidate) && candidate.length) {
//         return candidate;
//       }
//     }

//     return [];
//   }

//   function normalizePuterSegments(segments) {
//     return (Array.isArray(segments) ? segments : [])
//       .map((segment, index) => {
//         const start = Number(segment?.start ?? segment?.start_time ?? 0) || 0;

//         const end = Number(segment?.end ?? segment?.end_time ?? start) || start;

//         const rawSpeaker =
//           segment?.speaker ?? segment?.speaker_id ?? `speaker_${index}`;

//         const text =
//           typeof segment?.text === "string" ? segment.text.trim() : "";

//         return {
//           segment_index: index,

//           speaker: String(rawSpeaker),

//           speaker_role: null,

//           start_time: start,

//           end_time: Math.max(start, end),

//           text,
//         };
//       })
//       .filter((segment) => segment.text);
//   }

//   function buildSegmentsFromWords(words) {
//     const segments = [];

//     let current = null;

//     for (const word of words) {
//       const text = typeof word?.text === "string" ? word.text.trim() : "";

//       if (!text) {
//         continue;
//       }

//       const rawSpeaker = word?.speaker ?? word?.speaker_id ?? "speaker_unknown";

//       const speaker = String(rawSpeaker);

//       const start = Number(word?.start) || 0;
//       const end = Number(word?.end) || start;

//       if (!current || current.speaker !== speaker) {
//         if (current) {
//           segments.push(current);
//         }

//         current = {
//           segment_index: segments.length,
//           speaker,
//           speaker_role: null,
//           start_time: start,
//           end_time: end,
//           text,
//         };
//       } else {
//         current.text = `${current.text} ${text}`;
//         current.end_time = end;
//       }
//     }

//     if (current) {
//       segments.push(current);
//     }

//     return segments;
//   }

//   function cleanJsonText(value) {
//     return String(value || "")
//       .trim()
//       .replace(/^```(?:json)?\s*/i, "")
//       .replace(/\s*```$/i, "")
//       .trim();
//   }

//   function getPuterChatText(result) {
//     if (typeof result === "string") {
//       return result.trim();
//     }

//     if (typeof result?.message?.content === "string") {
//       return result.message.content.trim();
//     }

//     if (Array.isArray(result?.message?.content)) {
//       return result.message.content
//         .map((item) => (typeof item?.text === "string" ? item.text : ""))
//         .join("")
//         .trim();
//     }

//     return "";
//   }

//   // ======================================================
//   // SPEAKER ROLE IDENTIFICATION
//   // ======================================================

//   async function identifySpeakerRoles(segments) {
//     const speakers = [...new Set(segments.map((segment) => segment.speaker))];

//     if (speakers.length < 2) {
//       return Object.fromEntries(
//         speakers.map((speaker) => [speaker, "unknown"]),
//       );
//     }

//     const conversation = segments
//       .map((segment) => `${segment.speaker}: ${segment.text}`)
//       .join("\n");

//     const prompt = `
// This is a medical consultation between one doctor and one patient.

// Identify which diarized speaker is the doctor and which is the patient.

// The doctor normally asks about symptoms, medications, history, diagnosis or treatment.
// The patient normally reports symptoms and answers the doctor's questions.

// Return ONLY valid JSON:

// {
//   "doctor": "speaker_name",
//   "patient": "speaker_name"
// }

// Speakers:
// ${speakers.join(", ")}

// Conversation:
// ${conversation}
//     `.trim();

//     try {
//       const result = await window.puter.ai.chat(prompt);

//       const text = cleanJsonText(getPuterChatText(result));

//       const parsed = JSON.parse(text);

//       const roles = {};

//       if (speakers.includes(parsed?.doctor)) {
//         roles[parsed.doctor] = "doctor";
//       }

//       if (speakers.includes(parsed?.patient)) {
//         roles[parsed.patient] = "patient";
//       }

//       speakers.forEach((speaker) => {
//         if (!roles[speaker]) {
//           roles[speaker] = "unknown";
//         }
//       });

//       return roles;
//     } catch (error) {
//       console.error("SPEAKER IDENTIFICATION ERROR:", error);

//       return Object.fromEntries(
//         speakers.map((speaker) => [speaker, "unknown"]),
//       );
//     }
//   }

//   // ======================================================
//   // OPENAI DIARIZATION THROUGH PUTER
//   // ======================================================

//   async function tryOpenAIDiarization(file) {
//     const options = {
//       provider: "openai",

//       model: "gpt-4o-transcribe-diarize",

//       response_format: "diarized_json",

//       chunking_strategy: "auto",
//     };

//     const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

//     if (providerLanguage) {
//       options.language = providerLanguage;
//     }

//     const result = await window.puter.ai.speech2txt(file, options);

//     console.log("OPENAI DIARIZATION RESPONSE:", result);

//     return {
//       provider: "openai",

//       result,

//       text: findTranscriptText(result),

//       segments: normalizePuterSegments(findRawSegments(result)),
//     };
//   }

//   // ======================================================
//   // XAI DIARIZATION FALLBACK
//   // ======================================================

//   async function tryXAIDiarization(file) {
//     const options = {
//       audio: file,

//       provider: "xai",

//       diarize: true,
//     };

//     const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

//     if (providerLanguage) {
//       options.language = providerLanguage;
//       options.format = true;
//     }

//     const result = await window.puter.ai.speech2txt(options);

//     console.log("XAI DIARIZATION RESPONSE:", result);

//     return {
//       provider: "xai",

//       result,

//       text: findTranscriptText(result),

//       segments: buildSegmentsFromWords(findWords(result)),
//     };
//   }

//   // ======================================================
//   // DIARIZATION ENGINE
//   // ======================================================

//   async function callPuterDiarization(file) {
//     let openAIResult = null;

//     try {
//       openAIResult = await tryOpenAIDiarization(file);

//       if (openAIResult.segments.length > 0) {
//         return openAIResult;
//       }
//     } catch (error) {
//       console.error("OPENAI DIARIZATION ERROR:", error);
//     }

//     try {
//       const xaiResult = await tryXAIDiarization(file);

//       if (xaiResult.segments.length > 0) {
//         return xaiResult;
//       }
//     } catch (error) {
//       console.error("XAI DIARIZATION ERROR:", error);
//     }

//     if (openAIResult?.text) {
//       throw new Error(
//         "Speech was detected but speaker separation could not be generated.",
//       );
//     }

//     throw new Error(
//       "The recording could not be transcribed with speaker separation.",
//     );
//   }

//   // ======================================================
//   // GENERATE TRANSCRIPT
//   // ======================================================

//   async function handleGenerateTranscript() {
//     if (!consultation?.id) {
//       showError("Consultation ID is missing.");
//       return;
//     }

//     if (!uploadedRecording?.id) {
//       showError("Please save recording first.");
//       return;
//     }

//     if (!uploadedRecording?.audio_url) {
//       showError("Audio URL is missing. Reload consultation.");
//       return;
//     }

//     if (!window.puter?.ai || typeof window.puter.ai.speech2txt !== "function") {
//       showError("Speech-to-text service is unavailable.");

//       return;
//     }

//     try {
//       setTranscribing(true);

//       const audioResponse = await fetch(uploadedRecording.audio_url, {
//         method: "GET",
//         cache: "no-store",
//       });

//       if (!audioResponse.ok) {
//         throw new Error(
//           `Unable to load saved audio (${audioResponse.status}).`,
//         );
//       }

//       const fetchedBlob = await audioResponse.blob();

//       if (fetchedBlob.size < 1000) {
//         throw new Error("Saved audio is too small to transcribe.");
//       }

//       const rawMimeType =
//         uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

//       const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

//       let extension = "webm";

//       if (mimeType.includes("ogg")) {
//         extension = "ogg";
//       } else if (mimeType.includes("mp4")) {
//         extension = "mp4";
//       } else if (mimeType.includes("mpeg")) {
//         extension = "mp3";
//       } else if (mimeType.includes("wav")) {
//         extension = "wav";
//       }

//       const file = new File(
//         [fetchedBlob],
//         `consultation-${consultation.id}.${extension}`,
//         {
//           type: mimeType,
//         },
//       );

//       const diarization = await callPuterDiarization(file);

//       if (!diarization.segments.length) {
//         throw new Error("Speaker-separated transcript was not returned.");
//       }

//       const roles = await identifySpeakerRoles(diarization.segments);

//       const finalSegments = diarization.segments.map((segment, index) => ({
//         ...segment,

//         segment_index: index,

//         speaker_role:
//           roles[segment.speaker] === "doctor" ||
//           roles[segment.speaker] === "patient"
//             ? roles[segment.speaker]
//             : null,
//       }));

//       let transcriptText = diarization.text || "";

//       if (!transcriptText) {
//         transcriptText = finalSegments
//           .map((segment) => segment.text)
//           .join(" ")
//           .trim();
//       }

//       if (!transcriptText) {
//         throw new Error("Transcript is empty.");
//       }

//       const response = await fetch("/api/doctors/consultations/transcribe", {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         credentials: "include",
//         cache: "no-store",

//         body: JSON.stringify({
//           consultation_id: consultation.id,

//           audio_recording_id: uploadedRecording.id,

//           transcript_text: transcriptText,

//           segments: finalSegments,

//           provider: "puter",

//           model: "gpt-4o-transcribe-diarize",

//           language: selectedLanguage,
//         }),
//       });

//       const data = await getResponseData(response);

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         showError(
//           data.message || "Transcript generated but could not be saved.",
//         );

//         return;
//       }

//       setTranscript(data.transcript || null);

//       setTranscriptSegments(
//         Array.isArray(data.transcript_segments)
//           ? data.transcript_segments
//           : finalSegments,
//       );

//       setUploadedRecording((previous) =>
//         previous
//           ? {
//               ...previous,
//               status: "completed",
//             }
//           : previous,
//       );

//       setConsultation((previous) =>
//         previous
//           ? {
//               ...previous,
//               status: "transcribed",
//             }
//           : previous,
//       );

//       showSuccess(data.message || "Transcript generated successfully.");
//     } catch (error) {
//       console.error("GENERATE DIARIZED TRANSCRIPT ERROR:", error);

//       showError(error?.message || "Unable to generate transcript.");
//     } finally {
//       setTranscribing(false);
//     }
//   }

//   // ======================================================
//   // DOWNLOAD HELPERS
//   // ======================================================

//   function getSafeFileName() {
//     const patientName =
//       String(patient?.name || "patient")
//         .trim()
//         .replace(/[^a-zA-Z0-9_-]+/g, "-")
//         .replace(/^-+|-+$/g, "") || "patient";

//     return `consultation-${consultation?.id || "transcript"}-${patientName}`;
//   }

//   function triggerBlobDownload(blob, fileName) {
//     const url = URL.createObjectURL(blob);

//     const anchor = document.createElement("a");

//     anchor.href = url;
//     anchor.download = fileName;

//     document.body.appendChild(anchor);

//     anchor.click();

//     anchor.remove();

//     setTimeout(() => {
//       URL.revokeObjectURL(url);
//     }, 1000);
//   }

//   function getExportConversation() {
//     if (transcriptSegments.length > 0) {
//       return transcriptSegments.map((segment) => ({
//         speaker: getSpeakerLabel(segment),

//         detected_speaker: segment.speaker,

//         start_time: Number(segment.start_time) || 0,

//         end_time: Number(segment.end_time) || 0,

//         text: segment.text || "",
//       }));
//     }

//     return [
//       {
//         speaker: "Transcript",

//         detected_speaker: null,

//         start_time: 0,

//         end_time: Number(uploadedRecording?.duration_seconds) || 0,

//         text: transcript?.edited_text || transcript?.full_text || "",
//       },
//     ];
//   }

//   function getDoctorName() {
//     return doctor?.name || doctor?.full_name || doctor?.user?.name || "—";
//   }

//   function getDoctorEmail() {
//     return doctor?.email || doctor?.user?.email || "—";
//   }

//   function getDoctorPhone() {
//     return doctor?.phone || doctor?.phone_number || doctor?.user?.phone || "—";
//   }

//   function getDoctorSpecialization() {
//     return (
//       doctor?.specialization || doctor?.speciality || doctor?.specialty || "—"
//     );
//   }

//   function getDoctorQualification() {
//     return doctor?.qualification || doctor?.qualifications || "—";
//   }

//   function getDoctorLicenseNumber() {
//     return doctor?.license_number || doctor?.license_no || "—";
//   }

//   function getExportMetadata() {
//     return {
//       doctor: {
//         name: getDoctorName(),
//         email: getDoctorEmail(),
//         phone: getDoctorPhone(),
//         specialization: getDoctorSpecialization(),
//         qualification: getDoctorQualification(),
//         license_number: getDoctorLicenseNumber(),
//       },

//       patient: {
//         name: patient?.name || "—",

//         patient_code: patient?.patient_code || "—",

//         phone: patient?.phone || "—",

//         gender: patient?.gender || "—",

//         date_of_birth: patient?.date_of_birth || null,

//         age: calculateAge(patient?.date_of_birth),

//         address: patient?.address || "—",

//         emergency_contact_name: patient?.emergency_contact_name || "—",

//         emergency_contact_phone: patient?.emergency_contact_phone || "—",
//       },

//       appointment: {
//         id: appointment?.id || null,

//         date: appointment?.appointment_date || null,

//         time: appointment?.appointment_time || null,

//         token: appointment?.token_number || "—",
//       },

//       consultation: {
//         id: consultation?.id || null,

//         started_at: consultation?.started_at || null,

//         ended_at: consultation?.ended_at || null,

//         status: consultation?.status || "—",
//       },

//       transcript: {
//         id: transcript?.id || null,

//         language: getLanguageLabel(transcript?.language || selectedLanguage),

//         word_count: transcript?.word_count ?? null,

//         status: transcript?.status || "—",
//       },

//       recording: {
//         duration_seconds: uploadedRecording?.duration_seconds ?? null,
//       },
//     };
//   }

//   // ======================================================
//   // TXT DOWNLOAD
//   // ======================================================

//   async function handleDownloadTxt() {
//     if (!transcript) {
//       showError("No transcript is available.");
//       return;
//     }

//     try {
//       setDownloadingFormat("txt");

//       const metadata = getExportMetadata();

//       const conversation = getExportConversation();

//       const lines = [
//         "MEDTRANSCRIPT",
//         "MEDICAL CONSULTATION REPORT",
//         "==================================================",
//         "",

//         "DOCTOR INFORMATION",
//         "--------------------------------------------------",
//         `Name: ${metadata.doctor.name}`,
//         `Email: ${metadata.doctor.email}`,
//         `Phone: ${metadata.doctor.phone}`,
//         `Specialization: ${metadata.doctor.specialization}`,
//         `Qualification: ${metadata.doctor.qualification}`,
//         `License Number: ${metadata.doctor.license_number}`,
//         "",

//         "PATIENT INFORMATION",
//         "--------------------------------------------------",
//         `Name: ${metadata.patient.name}`,
//         `Patient Code: ${metadata.patient.patient_code}`,
//         `Age: ${
//           metadata.patient.age !== null ? `${metadata.patient.age} years` : "—"
//         }`,
//         `Gender: ${metadata.patient.gender}`,
//         `Phone: ${metadata.patient.phone}`,
//         `Address: ${metadata.patient.address}`,
//         "",

//         "CONSULTATION INFORMATION",
//         "--------------------------------------------------",
//         `Appointment ID: ${metadata.appointment.id ?? "—"}`,
//         `Consultation ID: ${metadata.consultation.id ?? "—"}`,
//         `Date: ${formatDate(metadata.appointment.date)}`,
//         `Time: ${formatTime(metadata.appointment.time)}`,
//         `Token: ${metadata.appointment.token}`,
//         `Status: ${metadata.consultation.status}`,
//         `Language: ${metadata.transcript.language}`,
//         `Recording Duration: ${formatDuration(
//           metadata.recording.duration_seconds,
//         )}`,
//         "",
//         "",
//         "==================================================",
//         "PAGE 2 - CONSULTATION TRANSCRIPTION",
//         "==================================================",
//         "",
//       ];

//       conversation.forEach((segment) => {
//         lines.push(
//           `${segment.speaker} [${formatTranscriptTime(
//             segment.start_time,
//           )} - ${formatTranscriptTime(segment.end_time)}]`,
//         );

//         lines.push(segment.text);
//         lines.push("");
//       });

//       const blob = new Blob([lines.join("\n")], {
//         type: "text/plain;charset=utf-8",
//       });

//       triggerBlobDownload(blob, `${getSafeFileName()}.txt`);

//       showSuccess("TXT transcript downloaded.");
//     } catch (error) {
//       console.error("TXT DOWNLOAD ERROR:", error);

//       showError("Unable to download TXT transcript.");
//     } finally {
//       setDownloadingFormat("");
//     }
//   }

//   // ======================================================
//   // JSON DOWNLOAD
//   // ======================================================

//   async function handleDownloadJson() {
//     if (!transcript) {
//       showError("No transcript is available.");
//       return;
//     }

//     try {
//       setDownloadingFormat("json");

//       const data = {
//         metadata: getExportMetadata(),

//         consultation,

//         transcript,

//         segments: getExportConversation(),
//       };

//       const blob = new Blob([JSON.stringify(data, null, 2)], {
//         type: "application/json;charset=utf-8",
//       });

//       triggerBlobDownload(blob, `${getSafeFileName()}.json`);

//       showSuccess("JSON transcript downloaded.");
//     } catch (error) {
//       console.error("JSON DOWNLOAD ERROR:", error);

//       showError("Unable to download JSON transcript.");
//     } finally {
//       setDownloadingFormat("");
//     }
//   }

//   // ======================================================
//   // DOCX FIELD
//   // ======================================================

//   function createDocxField(label, value) {
//     return new Paragraph({
//       spacing: {
//         after: 100,
//       },

//       children: [
//         new TextRun({
//           text: `${label}: `,
//           bold: true,
//         }),

//         new TextRun({
//           text: String(value ?? "—"),
//         }),
//       ],
//     });
//   }

//   // ======================================================
//   // DOCX DOWNLOAD
//   // ======================================================

//   async function handleDownloadDocx() {
//     if (!transcript) {
//       showError("No transcript is available.");

//       return;
//     }

//     try {
//       setDownloadingFormat("docx");

//       const metadata = getExportMetadata();

//       const conversation = getExportConversation();

//       const firstPage = [
//         new Paragraph({
//           text: "Medical Consultation Report",

//           heading: HeadingLevel.TITLE,
//         }),

//         new Paragraph({
//           children: [
//             new TextRun({
//               text: "MedTranscript",
//               bold: true,
//             }),
//           ],
//         }),

//         new Paragraph({
//           text: "",
//         }),

//         new Paragraph({
//           text: "Doctor Information",

//           heading: HeadingLevel.HEADING_1,
//         }),

//         createDocxField("Doctor Name", metadata.doctor.name),

//         createDocxField("Email", metadata.doctor.email),

//         createDocxField("Phone", metadata.doctor.phone),

//         createDocxField("Specialization", metadata.doctor.specialization),

//         createDocxField("Qualification", metadata.doctor.qualification),

//         createDocxField("License Number", metadata.doctor.license_number),

//         new Paragraph({
//           text: "",
//         }),

//         new Paragraph({
//           text: "Patient Information",

//           heading: HeadingLevel.HEADING_1,
//         }),

//         createDocxField("Patient Name", metadata.patient.name),

//         createDocxField("Patient Code", metadata.patient.patient_code),

//         createDocxField(
//           "Age",
//           metadata.patient.age !== null ? `${metadata.patient.age} years` : "—",
//         ),

//         createDocxField("Gender", metadata.patient.gender),

//         createDocxField("Phone", metadata.patient.phone),

//         createDocxField("Address", metadata.patient.address),

//         new Paragraph({
//           text: "",
//         }),

//         new Paragraph({
//           text: "Consultation Information",

//           heading: HeadingLevel.HEADING_1,
//         }),

//         createDocxField("Appointment ID", metadata.appointment.id ?? "—"),

//         createDocxField("Consultation ID", metadata.consultation.id ?? "—"),

//         createDocxField(
//           "Appointment Date",
//           formatDate(metadata.appointment.date),
//         ),

//         createDocxField(
//           "Appointment Time",
//           formatTime(metadata.appointment.time),
//         ),

//         createDocxField("Token", metadata.appointment.token),

//         createDocxField("Consultation Status", metadata.consultation.status),

//         createDocxField("Language", metadata.transcript.language),

//         createDocxField(
//           "Recording Duration",
//           formatDuration(metadata.recording.duration_seconds),
//         ),
//       ];

//       const transcriptPage = [
//         new Paragraph({
//           text: "Consultation Transcription",

//           heading: HeadingLevel.HEADING_1,

//           pageBreakBefore: true,
//         }),

//         new Paragraph({
//           children: [
//             new TextRun({
//               text: `Patient: ${metadata.patient.name}`,
//               bold: true,
//             }),

//             new TextRun({
//               text: `    •    ${metadata.transcript.language}`,
//               color: "64748B",
//             }),
//           ],
//         }),

//         new Paragraph({
//           text: "",
//         }),
//       ];

//       conversation.forEach((segment) => {
//         transcriptPage.push(
//           new Paragraph({
//             spacing: {
//               before: 280,
//               after: 80,
//             },

//             children: [
//               new TextRun({
//                 text: segment.speaker,
//                 bold: true,
//               }),

//               new TextRun({
//                 text: `    ${formatTranscriptTime(
//                   segment.start_time,
//                 )} – ${formatTranscriptTime(segment.end_time)}`,
//                 color: "64748B",
//               }),
//             ],
//           }),
//         );

//         transcriptPage.push(
//           new Paragraph({
//             spacing: {
//               after: 180,
//             },

//             children: [
//               new TextRun({
//                 text: segment.text,
//               }),
//             ],
//           }),
//         );
//       });

//       const document = new Document({
//         sections: [
//           {
//             properties: {},

//             children: [...firstPage, ...transcriptPage],
//           },
//         ],
//       });

//       const blob = await Packer.toBlob(document);

//       triggerBlobDownload(blob, `${getSafeFileName()}.docx`);

//       showSuccess("DOCX transcript downloaded.");
//     } catch (error) {
//       console.error("DOCX DOWNLOAD ERROR:", error);

//       showError("Unable to generate DOCX transcript.");
//     } finally {
//       setDownloadingFormat("");
//     }
//   }

//   // ======================================================
//   // PDF DOWNLOAD
//   // ======================================================

//   async function handleDownloadPdf() {
//     if (!transcript || !transcriptExportRef.current) {
//       showError("Transcript is not ready for PDF export.");

//       return;
//     }

//     try {
//       setDownloadingFormat("pdf");

//       const html2pdfModule = await import("html2pdf.js");

//       const html2pdf = html2pdfModule.default || html2pdfModule;

//       await html2pdf()
//         .set({
//           margin: 0,

//           filename: `${getSafeFileName()}.pdf`,

//           image: {
//             type: "jpeg",
//             quality: 0.98,
//           },

//           html2canvas: {
//             scale: 2,
//             useCORS: true,
//             backgroundColor: "#ffffff",
//           },

//           jsPDF: {
//             unit: "px",

//             format: [794, 1123],

//             orientation: "portrait",

//             hotfixes: ["px_scaling"],
//           },

//           pagebreak: {
//             mode: ["css", "legacy"],

//             before: ".html2pdf__page-break",
//           },
//         })
//         .from(transcriptExportRef.current)
//         .save();

//       showSuccess("PDF transcript downloaded.");
//     } catch (error) {
//       console.error("PDF DOWNLOAD ERROR:", error);

//       showError("Unable to generate PDF transcript.");
//     } finally {
//       setDownloadingFormat("");
//     }
//   }

//   // ======================================================
//   // CLEANUP
//   // ======================================================

//   useEffect(() => {
//     return () => {
//       stopTimer();

//       if (recorderRef.current && recorderRef.current.state !== "inactive") {
//         try {
//           recorderRef.current.stop();
//         } catch {}
//       }

//       stopMicrophoneStream();

//       if (toastTimerRef.current) {
//         clearTimeout(toastTimerRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (audioUrl) {
//         URL.revokeObjectURL(audioUrl);
//       }
//     };
//   }, [audioUrl]);

//   // ======================================================
//   // HELPERS
//   // ======================================================

//   function calculateAge(dateOfBirth) {
//     if (!dateOfBirth) {
//       return null;
//     }

//     const birthDate = new Date(dateOfBirth);

//     const today = new Date();

//     let age = today.getFullYear() - birthDate.getFullYear();

//     const monthDifference = today.getMonth() - birthDate.getMonth();

//     if (
//       monthDifference < 0 ||
//       (monthDifference === 0 && today.getDate() < birthDate.getDate())
//     ) {
//       age--;
//     }

//     return age;
//   }

//   function formatDate(date) {
//     if (!date) {
//       return "—";
//     }

//     return new Intl.DateTimeFormat("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     }).format(new Date(date));
//   }

//   function formatTime(time) {
//     if (!time) {
//       return "—";
//     }

//     const [hours, minutes] = String(time).split(":");

//     const date = new Date();

//     date.setHours(Number(hours));
//     date.setMinutes(Number(minutes));
//     date.setSeconds(0);

//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   function getAppointmentStatus(status) {
//     const statuses = {
//       scheduled: {
//         label: "Scheduled",
//         tone: "gray",
//       },

//       checked_in: {
//         label: "Checked in",
//         tone: "blue",
//       },

//       waiting: {
//         label: "Waiting",
//         tone: "amber",
//       },

//       in_consultation: {
//         label: "In consultation",
//         tone: "blue",
//       },

//       completed: {
//         label: "Completed",
//         tone: "green",
//       },

//       cancelled: {
//         label: "Cancelled",
//         tone: "red",
//       },

//       no_show: {
//         label: "No show",
//         tone: "red",
//       },
//     };

//     return (
//       statuses[status] || {
//         label: status || "Unknown",
//         tone: "gray",
//       }
//     );
//   }

//   function getLanguageLabel(value) {
//     return (
//       TRANSCRIPTION_LANGUAGES.find((item) => item.value === value)?.label ||
//       value ||
//       "Auto detect"
//     );
//   }

//   function getSpeakerLabel(segment) {
//     if (segment?.speaker_role === "doctor") {
//       return "Doctor";
//     }

//     if (segment?.speaker_role === "patient") {
//       return "Patient";
//     }

//     return segment?.speaker || "Unknown speaker";
//   }

//   function getSpeakerTone(segment) {
//     if (segment?.speaker_role === "doctor") {
//       return "blue";
//     }

//     if (segment?.speaker_role === "patient") {
//       return "green";
//     }

//     return "gray";
//   }

//   // ======================================================
//   // LOADING
//   // ======================================================

//   if (loading) {
//     return <ConsultationLoading />;
//   }

//   // ======================================================
//   // UNAVAILABLE
//   // ======================================================

//   if (!appointmentId || !patient || !appointment) {
//     return (
//       <Shell
//         role="doctor"
//         title="New consultation"
//         subtitle="Consultation unavailable"
//       >
//         <div className="mx-auto max-w-4xl">
//           <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//             <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
//               !
//             </div>

//             <h2 className="mt-5 text-xl font-bold text-slate-950">
//               Consultation unavailable
//             </h2>

//             <p className="mt-2 text-sm text-slate-500">
//               We couldn't load this consultation.
//             </p>

//             <Link
//               href="/doctor"
//               className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
//             >
//               Back to dashboard
//             </Link>
//           </div>
//         </div>
//       </Shell>
//     );
//   }

//   // ======================================================
//   // PAGE DATA
//   // ======================================================

//   const age = calculateAge(patient.date_of_birth);

//   const appointmentStatus = getAppointmentStatus(appointment.status);

//   const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

//   const consultationStarted = Boolean(consultation?.id);

//   const consultationLocked =
//     consultation?.status === "completed" || appointment?.status === "completed";

//   // ======================================================
//   // PAGE
//   // ======================================================

//   return (
//     <>
//       <Shell
//         role="doctor"
//         title="New consultation"
//         subtitle={`${patient.name} · ${patient.patient_code}`}
//       >
//         <div className="mx-auto max-w-6xl space-y-6">
//           {/* ==================================================
//               PATIENT
//           ================================================== */}

//           <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6 md:px-8">
//               <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//                 <div className="flex items-start gap-4">
//                   <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
//                     {String(patient.name || "P")
//                       .charAt(0)
//                       .toUpperCase()}
//                   </div>

//                   <div>
//                     <div className="flex flex-wrap items-center gap-2">
//                       <h2 className="text-2xl font-bold text-slate-950">
//                         {patient.name}
//                       </h2>

//                       <Badge tone={appointmentStatus.tone}>
//                         {appointmentStatus.label}
//                       </Badge>
//                     </div>

//                     <p className="mt-2 text-sm text-slate-500">
//                       {patient.patient_code}

//                       {" · "}

//                       {age !== null ? `${age} years` : "Age not added"}

//                       {" · "}

//                       {patient.gender || "Gender not added"}
//                     </p>

//                     {patient.phone && (
//                       <p className="mt-1 text-sm text-slate-500">
//                         {patient.phone}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <Link
//                   href={`/doctor/patients/${patient.id}`}
//                   className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
//                 >
//                   View patient profile
//                 </Link>
//               </div>
//             </div>

//             <div className="grid divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">
//               <InfoCell label="Appointment" value={`#${appointment.id}`} />

//               <InfoCell
//                 label="Date"
//                 value={formatDate(appointment.appointment_date)}
//               />

//               <InfoCell
//                 label="Time"
//                 value={formatTime(appointment.appointment_time)}
//               />

//               <InfoCell label="Token" value={appointment.token_number || "—"} />
//             </div>

//             {appointment.notes && (
//               <div className="border-t border-slate-100 px-6 py-5 md:px-8">
//                 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//                   Appointment notes
//                 </p>

//                 <p className="mt-2 text-sm leading-6 text-slate-700">
//                   {appointment.notes}
//                 </p>
//               </div>
//             )}
//           </section>

//           {/* ==================================================
//               HISTORY
//           ================================================== */}

//           <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
//             <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 md:px-8">
//               <div>
//                 <h3 className="font-bold text-slate-950">Patient history</h3>

//                 <p className="mt-1 text-xs text-slate-500">
//                   Latest medical information before consultation.
//                 </p>
//               </div>

//               <Link
//                 href={`/doctor/patients/${patient.id}`}
//                 className="text-sm font-semibold text-blue-600"
//               >
//                 Full history
//               </Link>
//             </div>

//             {!latestHistory ? (
//               <div className="p-6 md:p-8">
//                 <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
//                   No medical history has been added.
//                 </div>
//               </div>
//             ) : (
//               <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8 lg:grid-cols-3">
//                 <HistoryCard
//                   label="Previous diseases"
//                   value={latestHistory.previous_diseases || "None reported"}
//                 />

//                 <HistoryCard
//                   label="Allergies"
//                   value={latestHistory.allergies || "None reported"}
//                 />

//                 <HistoryCard
//                   label="Current medications"
//                   value={latestHistory.current_medications || "None reported"}
//                 />

//                 <HistoryCard
//                   label="Previous surgeries"
//                   value={latestHistory.previous_surgeries || "None reported"}
//                 />

//                 <HistoryCard
//                   label="Family history"
//                   value={latestHistory.family_history || "None reported"}
//                 />

//                 <HistoryCard
//                   label="Additional notes"
//                   value={latestHistory.additional_notes || "No notes"}
//                 />
//               </div>
//             )}
//           </section>

//           {/* ==================================================
//               CONSULTATION WORKSPACE
//           ================================================== */}

//           <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-100 px-6 py-5 md:px-8">
//               <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
//                 <div>
//                   <h3 className="text-lg font-bold text-slate-950">
//                     Consultation workspace
//                   </h3>

//                   <p className="mt-1 text-sm text-slate-500">
//                     Record, transcribe and complete the consultation.
//                   </p>
//                 </div>

//                 {consultationStarted && (
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
//                       Consultation #{consultation.id}
//                     </span>

//                     <Badge
//                       tone={
//                         consultation.status === "completed" ||
//                         consultation.status === "transcribed"
//                           ? "green"
//                           : "blue"
//                       }
//                     >
//                       {String(consultation.status || "draft").replaceAll(
//                         "_",
//                         " ",
//                       )}
//                     </Badge>

//                     {!consultationLocked ? (
//                       <button
//                         type="button"
//                         disabled={
//                           completingConsultation ||
//                           isRecording ||
//                           uploadingAudio ||
//                           transcribing ||
//                           deletingRecording
//                         }
//                         onClick={openCompleteConsultationModal}
//                         className="ml-1 inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         Complete consultation
//                       </button>
//                     ) : (
//                       <span className="inline-flex min-h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
//                         ✓ Consultation completed
//                       </span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="p-6 md:p-8">
//               {!consultationStarted ? (
//                 <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center">
//                   <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-white">
//                     <Icon name="mic" size={27} />
//                   </div>

//                   <h3 className="mt-5 text-xl font-bold text-slate-950">
//                     Ready to start consultation
//                   </h3>

//                   <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
//                     Start when the patient is present.
//                   </p>

//                   <button
//                     type="button"
//                     disabled={starting}
//                     onClick={handleStartConsultation}
//                     className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
//                   >
//                     {starting
//                       ? "Starting consultation..."
//                       : "Start consultation"}
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   {/* ========================================
//                       COMPLETED NOTICE
//                   ======================================== */}

//                   {consultationLocked && (
//                     <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
//                       <div className="flex items-start gap-3">
//                         <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 font-bold text-white">
//                           ✓
//                         </div>

//                         <div>
//                           <p className="font-bold text-emerald-950">
//                             Consultation completed
//                           </p>

//                           <p className="mt-1 text-sm leading-6 text-emerald-800">
//                             Recording and transcription actions are now locked.
//                             Existing audio and transcript remain available for
//                             review and download.
//                           </p>

//                           {consultation.ended_at && (
//                             <p className="mt-2 text-xs font-medium text-emerald-700">
//                               Completed{" "}
//                               {new Date(consultation.ended_at).toLocaleString()}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* ========================================
//                       RECORDING PANEL
//                   ======================================== */}

//                   <div className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5 md:p-7">
//                     <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
//                       <div className="flex items-start gap-4">
//                         <div
//                           className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
//                             isRecording
//                               ? "bg-red-100 text-red-600"
//                               : uploadedRecording
//                                 ? "bg-emerald-100 text-emerald-700"
//                                 : "bg-white text-slate-900"
//                           }`}
//                         >
//                           <Icon name="mic" size={24} />
//                         </div>

//                         <div>
//                           <div className="flex flex-wrap items-center gap-2">
//                             <h4 className="font-bold text-slate-950">
//                               Consultation recording
//                             </h4>

//                             <Badge
//                               tone={
//                                 isRecording
//                                   ? "red"
//                                   : uploadedRecording
//                                     ? "green"
//                                     : "blue"
//                               }
//                             >
//                               {isRecording
//                                 ? isPaused
//                                   ? "Paused"
//                                   : "Recording"
//                                 : uploadedRecording
//                                   ? "Saved"
//                                   : "Ready"}
//                             </Badge>
//                           </div>

//                           <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
//                             Keep the microphone close enough to both speakers.
//                           </p>
//                         </div>
//                       </div>

//                       {(isRecording || recordingSeconds > 0) && (
//                         <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center">
//                           <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//                             Recording time
//                           </p>

//                           <p className="mt-1 text-2xl font-bold tabular-nums">
//                             {formatDuration(recordingSeconds)}
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     {!isRecording &&
//                       !audioBlob &&
//                       !uploadedRecording &&
//                       !consultationLocked && (
//                         <div className="mt-6 border-t border-slate-200 pt-6">
//                           <button
//                             type="button"
//                             onClick={handleStartRecording}
//                             className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
//                           >
//                             Start recording
//                           </button>
//                         </div>
//                       )}

//                     {isRecording && (
//                       <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
//                         {!isPaused ? (
//                           <button
//                             type="button"
//                             onClick={handlePauseRecording}
//                             className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
//                           >
//                             Pause recording
//                           </button>
//                         ) : (
//                           <button
//                             type="button"
//                             onClick={handleResumeRecording}
//                             className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
//                           >
//                             Resume recording
//                           </button>
//                         )}

//                         <button
//                           type="button"
//                           onClick={handleStopRecording}
//                           className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
//                         >
//                           Stop recording
//                         </button>
//                       </div>
//                     )}

//                     {audioBlob && !uploadedRecording && !isRecording && (
//                       <div className="mt-6 border-t border-slate-200 pt-6">
//                         <div className="rounded-2xl border bg-white p-5">
//                           <p className="font-semibold">
//                             Recording ready to review
//                           </p>

//                           <audio
//                             controls
//                             src={audioUrl}
//                             className="mt-5 w-full"
//                           />

//                           <div className="mt-5 flex flex-wrap gap-3">
//                             <button
//                               type="button"
//                               disabled={uploadingAudio || consultationLocked}
//                               onClick={handleUploadAudio}
//                               className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
//                             >
//                               {uploadingAudio
//                                 ? "Saving recording..."
//                                 : "Save recording"}
//                             </button>

//                             <button
//                               type="button"
//                               disabled={uploadingAudio || consultationLocked}
//                               onClick={handleRecordAgain}
//                               className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold disabled:opacity-50"
//                             >
//                               Record again
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {uploadedRecording && (
//                       <div className="mt-6 border-t border-slate-200 pt-6">
//                         <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">
//                           <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
//                             <div className="flex flex-wrap items-center justify-between gap-3">
//                               <div>
//                                 <p className="font-bold text-emerald-950">
//                                   Recording saved
//                                 </p>

//                                 <p className="mt-1 text-xs text-emerald-700">
//                                   Recording #{uploadedRecording.id}
//                                 </p>
//                               </div>

//                               <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800">
//                                 {formatDuration(
//                                   uploadedRecording.duration_seconds ||
//                                     recordingSeconds,
//                                 )}
//                               </span>
//                             </div>
//                           </div>

//                           <div className="p-5">
//                             {uploadedRecording.audio_url && (
//                               <audio
//                                 controls
//                                 src={uploadedRecording.audio_url}
//                                 className="w-full"
//                               />
//                             )}

//                             {!consultationLocked && (
//                               <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-[1fr_auto] lg:items-end">
//                                 <div>
//                                   <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
//                                     Transcription language
//                                   </label>

//                                   <div className="mt-2 flex flex-col gap-3 sm:flex-row">
//                                     <select
//                                       value={selectedLanguage}
//                                       onChange={(event) =>
//                                         setSelectedLanguage(event.target.value)
//                                       }
//                                       disabled={
//                                         transcribing ||
//                                         deletingRecording ||
//                                         consultationLocked
//                                       }
//                                       className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium"
//                                     >
//                                       {TRANSCRIPTION_LANGUAGES.map(
//                                         (language) => (
//                                           <option
//                                             key={language.value}
//                                             value={language.value}
//                                           >
//                                             {language.label}
//                                           </option>
//                                         ),
//                                       )}
//                                     </select>

//                                     <button
//                                       type="button"
//                                       disabled={
//                                         transcribing ||
//                                         deletingRecording ||
//                                         consultationLocked
//                                       }
//                                       onClick={handleGenerateTranscript}
//                                       className="min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-50"
//                                     >
//                                       {transcribing
//                                         ? "Detecting speakers..."
//                                         : transcript
//                                           ? "Regenerate transcript"
//                                           : "Generate transcript"}
//                                     </button>
//                                   </div>

//                                   {transcribing && (
//                                     <p className="mt-3 text-xs font-medium text-blue-600">
//                                       Processing speech, timestamps and
//                                       speakers...
//                                     </p>
//                                   )}
//                                 </div>

//                                 <button
//                                   type="button"
//                                   disabled={
//                                     transcribing ||
//                                     deletingRecording ||
//                                     consultationLocked
//                                   }
//                                   onClick={openDeleteRecordingModal}
//                                   className="min-h-12 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 disabled:opacity-50"
//                                 >
//                                   Delete recording
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* ========================================
//                       TRANSCRIPT
//                   ======================================== */}

//                   {transcript && (
//                     <section className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
//                       <div className="border-b border-slate-100 bg-slate-50 px-5 py-5 md:px-6">
//                         <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
//                           <div>
//                             <div className="flex flex-wrap items-center gap-2">
//                               <h3 className="font-bold text-slate-950">
//                                 Consultation transcript
//                               </h3>

//                               <Badge tone="green">Ready</Badge>
//                             </div>

//                             <p className="mt-1 text-xs text-slate-500">
//                               Speaker-separated conversation with timestamps.
//                             </p>
//                           </div>

//                           <div className="flex flex-wrap gap-2">
//                             <ExportButton
//                               label="TXT"
//                               loading={downloadingFormat === "txt"}
//                               onClick={handleDownloadTxt}
//                             />

//                             <ExportButton
//                               label="DOCX"
//                               loading={downloadingFormat === "docx"}
//                               onClick={handleDownloadDocx}
//                             />

//                             <ExportButton
//                               label="PDF"
//                               loading={downloadingFormat === "pdf"}
//                               onClick={handleDownloadPdf}
//                             />

//                             <ExportButton
//                               label="JSON"
//                               loading={downloadingFormat === "json"}
//                               onClick={handleDownloadJson}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="p-5 md:p-6">
//                         <div className="mb-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
//                           <MiniMeta label="Patient" value={patient.name} />

//                           <MiniMeta
//                             label="Patient code"
//                             value={patient.patient_code}
//                           />

//                           <MiniMeta
//                             label="Language"
//                             value={getLanguageLabel(
//                               transcript.language || selectedLanguage,
//                             )}
//                           />

//                           <MiniMeta
//                             label="Segments"
//                             value={String(transcriptSegments.length)}
//                           />
//                         </div>

//                         {transcriptSegments.length > 0 ? (
//                           <div className="space-y-4">
//                             {transcriptSegments.map((segment, index) => {
//                               const isDoctor =
//                                 segment.speaker_role === "doctor";

//                               const isPatient =
//                                 segment.speaker_role === "patient";

//                               return (
//                                 <article
//                                   key={
//                                     segment.id ||
//                                     `${segment.segment_index}-${index}`
//                                   }
//                                   className={`rounded-2xl border p-5 ${
//                                     isDoctor
//                                       ? "border-blue-100 bg-blue-50/50"
//                                       : isPatient
//                                         ? "border-emerald-100 bg-emerald-50/50"
//                                         : "border-slate-200 bg-slate-50"
//                                   }`}
//                                 >
//                                   <div className="flex flex-wrap items-center justify-between gap-3">
//                                     <div className="flex items-center gap-2">
//                                       <Badge tone={getSpeakerTone(segment)}>
//                                         {getSpeakerLabel(segment)}
//                                       </Badge>

//                                       <span className="text-xs text-slate-400">
//                                         {segment.speaker}
//                                       </span>
//                                     </div>

//                                     <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-500">
//                                       {formatTranscriptTime(segment.start_time)}

//                                       {" – "}

//                                       {formatTranscriptTime(segment.end_time)}
//                                     </span>
//                                   </div>

//                                   <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-800">
//                                     {segment.text}
//                                   </p>
//                                 </article>
//                               );
//                             })}
//                           </div>
//                         ) : (
//                           <div className="rounded-2xl bg-slate-50 p-5">
//                             <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
//                               {transcript.edited_text ||
//                                 transcript.full_text ||
//                                 "Transcript is empty."}
//                             </p>
//                           </div>
//                         )}

//                         <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
//                           <span>Transcript #{transcript.id}</span>

//                           {transcript.word_count !== null &&
//                             transcript.word_count !== undefined && (
//                               <span>{transcript.word_count} words</span>
//                             )}

//                           <span>{transcriptSegments.length} segments</span>

//                           <span className="capitalize">
//                             Status: {transcript.status}
//                           </span>
//                         </div>
//                       </div>
//                     </section>
//                   )}

//                   {/* ========================================
//                       PROGRESS
//                   ======================================== */}

//                   <div className="mt-7 grid gap-3 md:grid-cols-4">
//                     <ProcessCard
//                       number="01"
//                       title="Patient history"
//                       value="Available"
//                       active
//                     />

//                     <ProcessCard
//                       number="02"
//                       title="Audio recording"
//                       value={
//                         uploadedRecording
//                           ? "Recording saved"
//                           : "Ready to record"
//                       }
//                       active={Boolean(uploadedRecording)}
//                     />

//                     <ProcessCard
//                       number="03"
//                       title="AI transcript"
//                       value={
//                         transcript
//                           ? `${transcriptSegments.length} segments ready`
//                           : transcribing
//                             ? "Processing..."
//                             : "Ready to generate"
//                       }
//                       active={Boolean(transcript)}
//                       loading={transcribing}
//                     />

//                     <ProcessCard
//                       number="04"
//                       title="Consultation"
//                       value={consultationLocked ? "Completed" : "In progress"}
//                       active={consultationLocked}
//                     />
//                   </div>
//                 </>
//               )}
//             </div>
//           </section>

//           <div className="pb-4">
//             <Link
//               href="/doctor"
//               className="text-sm font-semibold text-slate-500 hover:text-slate-950"
//             >
//               ← Back to dashboard
//             </Link>
//           </div>

//           {/* ==================================================
//               HIDDEN PDF EXPORT DOCUMENT
//           ================================================== */}

//           {transcript && (
//             <div
//               ref={transcriptExportRef}
//               style={{
//                 position: "absolute",
//                 left: "0",
//                 top: "0",
//                 width: "794px",
//                 backgroundColor: "#ffffff",
//                 color: "#0f172a",
//                 zIndex: "-9999",
//                 pointerEvents: "none",
//               }}
//             >
//               {/* PAGE 1 */}

//               <section
//                 style={{
//                   minHeight: "1123px",
//                   padding: "56px",
//                   background: "#ffffff",
//                 }}
//               >
//                 <div
//                   style={{
//                     borderBottom: "2px solid #0f172a",
//                     paddingBottom: "24px",
//                   }}
//                 >
//                   <p
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 700,
//                       letterSpacing: "0.12em",
//                       textTransform: "uppercase",
//                       color: "#64748b",
//                     }}
//                   >
//                     MedTranscript
//                   </p>

//                   <h1
//                     style={{
//                       marginTop: "10px",
//                       fontSize: "30px",
//                       fontWeight: 800,
//                     }}
//                   >
//                     Medical Consultation Report
//                   </h1>

//                   <p
//                     style={{
//                       marginTop: "8px",
//                       fontSize: "14px",
//                       color: "#64748b",
//                     }}
//                   >
//                     Consultation #{consultation.id}
//                   </p>
//                 </div>

//                 <PdfInformationSection
//                   title="Doctor Information"
//                   fields={[
//                     ["Doctor Name", getDoctorName()],

//                     ["Email", getDoctorEmail()],

//                     ["Phone", getDoctorPhone()],

//                     ["Specialization", getDoctorSpecialization()],

//                     ["Qualification", getDoctorQualification()],

//                     ["License Number", getDoctorLicenseNumber()],
//                   ]}
//                 />

//                 <PdfInformationSection
//                   title="Patient Information"
//                   fields={[
//                     ["Patient Name", patient?.name || "—"],

//                     ["Patient Code", patient?.patient_code || "—"],

//                     ["Age", age !== null ? `${age} years` : "—"],

//                     ["Gender", patient?.gender || "—"],

//                     ["Phone", patient?.phone || "—"],

//                     ["Address", patient?.address || "—"],
//                   ]}
//                 />

//                 <PdfInformationSection
//                   title="Consultation Information"
//                   fields={[
//                     ["Appointment ID", `#${appointment.id}`],

//                     ["Consultation ID", `#${consultation.id}`],

//                     ["Date", formatDate(appointment.appointment_date)],

//                     ["Time", formatTime(appointment.appointment_time)],

//                     ["Token", appointment.token_number || "—"],

//                     [
//                       "Status",
//                       String(consultation.status || "—").replaceAll("_", " "),
//                     ],

//                     [
//                       "Language",
//                       getLanguageLabel(transcript.language || selectedLanguage),
//                     ],

//                     [
//                       "Recording Duration",
//                       formatDuration(uploadedRecording?.duration_seconds),
//                     ],
//                   ]}
//                 />

//                 <div
//                   style={{
//                     marginTop: "40px",
//                     paddingTop: "20px",
//                     borderTop: "1px solid #e2e8f0",
//                     fontSize: "11px",
//                     color: "#94a3b8",
//                   }}
//                 >
//                   Generated by MedTranscript
//                 </div>
//               </section>

//               {/* PAGE BREAK */}

//               <div
//                 className="html2pdf__page-break"
//                 style={{
//                   pageBreakBefore: "always",
//                   breakBefore: "page",
//                 }}
//               />

//               {/* PAGE 2 */}

//               <section
//                 style={{
//                   minHeight: "1123px",
//                   padding: "56px",
//                   background: "#ffffff",
//                 }}
//               >
//                 <div
//                   style={{
//                     borderBottom: "2px solid #0f172a",
//                     paddingBottom: "20px",
//                   }}
//                 >
//                   <p
//                     style={{
//                       fontSize: "12px",
//                       fontWeight: 700,
//                       color: "#64748b",
//                     }}
//                   >
//                     Consultation #{consultation.id}
//                   </p>

//                   <h2
//                     style={{
//                       marginTop: "8px",
//                       fontSize: "27px",
//                       fontWeight: 800,
//                     }}
//                   >
//                     Consultation Transcription
//                   </h2>

//                   <p
//                     style={{
//                       marginTop: "8px",
//                       fontSize: "13px",
//                       color: "#64748b",
//                     }}
//                   >
//                     {patient.name} ·{" "}
//                     {getLanguageLabel(transcript.language || selectedLanguage)}
//                   </p>
//                 </div>

//                 <div
//                   style={{
//                     marginTop: "28px",
//                   }}
//                 >
//                   {transcriptSegments.length > 0 ? (
//                     transcriptSegments.map((segment, index) => (
//                       <div
//                         key={segment.id || index}
//                         style={{
//                           marginBottom: "18px",

//                           padding: "18px",

//                           border: "1px solid #e2e8f0",

//                           borderRadius: "12px",

//                           pageBreakInside: "avoid",

//                           breakInside: "avoid",
//                         }}
//                       >
//                         <div
//                           style={{
//                             display: "flex",

//                             justifyContent: "space-between",

//                             gap: "20px",

//                             fontSize: "12px",
//                           }}
//                         >
//                           <strong>{getSpeakerLabel(segment)}</strong>

//                           <span
//                             style={{
//                               color: "#64748b",
//                             }}
//                           >
//                             {formatTranscriptTime(segment.start_time)} –{" "}
//                             {formatTranscriptTime(segment.end_time)}
//                           </span>
//                         </div>

//                         <p
//                           style={{
//                             marginTop: "12px",

//                             fontSize: "14px",

//                             lineHeight: "1.8",

//                             whiteSpace: "pre-wrap",
//                           }}
//                         >
//                           {segment.text}
//                         </p>
//                       </div>
//                     ))
//                   ) : (
//                     <p
//                       style={{
//                         fontSize: "14px",
//                         lineHeight: "1.8",
//                         whiteSpace: "pre-wrap",
//                       }}
//                     >
//                       {transcript.edited_text || transcript.full_text || ""}
//                     </p>
//                   )}
//                 </div>
//               </section>
//             </div>
//           )}
//         </div>
//       </Shell>

//       {/* ==================================================
//           TOAST
//       ================================================== */}

//       {toast && (
//         <Toast
//           type={toast.type}
//           message={toast.message}
//           onClose={() => setToast(null)}
//         />
//       )}

//       {/* ==================================================
//           DELETE MODAL
//       ================================================== */}

//       {deleteModalOpen && (
//         <DeleteRecordingModal
//           hasTranscript={Boolean(transcript?.id)}
//           deleting={deletingRecording}
//           onCancel={closeDeleteRecordingModal}
//           onConfirm={handleDeleteRecording}
//         />
//       )}

//       {/* ==================================================
//           COMPLETE MODAL
//       ================================================== */}

//       {completeModalOpen && (
//         <CompleteConsultationModal
//           patientName={patient?.name}
//           hasTranscript={Boolean(transcript?.id)}
//           completing={completingConsultation}
//           onCancel={closeCompleteConsultationModal}
//           onConfirm={handleCompleteConsultation}
//         />
//       )}
//     </>
//   );
// }

// // ======================================================
// // INFO CELL
// // ======================================================

// function InfoCell({ label, value }) {
//   return (
//     <div className="px-6 py-5">
//       <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1.5 text-sm font-bold text-slate-900">{value}</p>
//     </div>
//   );
// }

// // ======================================================
// // HISTORY CARD
// // ======================================================

// function HistoryCard({ label, value }) {
//   return (
//     <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
//       <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
//         {label}
//       </p>

//       <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
//         {value}
//       </p>
//     </div>
//   );
// }

// // ======================================================
// // MINI META
// // ======================================================

// function MiniMeta({ label, value }) {
//   return (
//     <div>
//       <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1 text-sm font-semibold text-slate-800">
//         {value || "—"}
//       </p>
//     </div>
//   );
// }

// // ======================================================
// // EXPORT BUTTON
// // ======================================================

// function ExportButton({ label, loading, onClick }) {
//   return (
//     <button
//       type="button"
//       disabled={loading}
//       onClick={onClick}
//       className="min-w-[72px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
//     >
//       {loading ? "..." : label}
//     </button>
//   );
// }

// // ======================================================
// // PROCESS CARD
// // ======================================================

// function ProcessCard({ number, title, value, active, loading }) {
//   return (
//     <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
//       <div className="flex items-center justify-between">
//         <span className="text-xs font-bold text-slate-300">{number}</span>

//         <span
//           className={`h-2.5 w-2.5 rounded-full ${
//             loading
//               ? "animate-pulse bg-blue-500"
//               : active
//                 ? "bg-emerald-500"
//                 : "bg-slate-300"
//           }`}
//         />
//       </div>

//       <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>

//       <p
//         className={`mt-1 text-xs font-medium ${
//           loading
//             ? "text-blue-600"
//             : active
//               ? "text-emerald-600"
//               : "text-slate-500"
//         }`}
//       >
//         {value}
//       </p>
//     </div>
//   );
// }

// // ======================================================
// // PDF INFO SECTION
// // ======================================================

// function PdfInformationSection({ title, fields }) {
//   return (
//     <section
//       style={{
//         marginTop: "34px",
//       }}
//     >
//       <h2
//         style={{
//           fontSize: "18px",
//           fontWeight: 800,
//           marginBottom: "15px",
//         }}
//       >
//         {title}
//       </h2>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 1fr",
//           gap: "12px",
//         }}
//       >
//         {fields.map(([label, value]) => (
//           <div
//             key={label}
//             style={{
//               padding: "14px",
//               border: "1px solid #e2e8f0",
//               borderRadius: "10px",
//             }}
//           >
//             <p
//               style={{
//                 fontSize: "10px",

//                 fontWeight: 700,

//                 textTransform: "uppercase",

//                 color: "#94a3b8",

//                 letterSpacing: "0.08em",
//               }}
//             >
//               {label}
//             </p>

//             <p
//               style={{
//                 marginTop: "6px",

//                 fontSize: "13px",

//                 fontWeight: 600,
//               }}
//             >
//               {value || "—"}
//             </p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// // ======================================================
// // TOAST
// // ======================================================

// function Toast({ type, message, onClose }) {
//   const success = type === "success";

//   return (
//     <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md sm:right-6 sm:top-6">
//       <div
//         className={`overflow-hidden rounded-2xl border bg-white shadow-2xl ${
//           success ? "border-emerald-200" : "border-red-200"
//         }`}
//       >
//         <div className="flex items-start gap-3 p-4">
//           <div
//             className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black ${
//               success
//                 ? "bg-emerald-50 text-emerald-700"
//                 : "bg-red-50 text-red-700"
//             }`}
//           >
//             {success ? "✓" : "!"}
//           </div>

//           <div className="min-w-0 flex-1">
//             <p
//               className={`text-sm font-bold ${
//                 success ? "text-emerald-950" : "text-red-950"
//               }`}
//             >
//               {success ? "Success" : "Something went wrong"}
//             </p>

//             <p className="mt-1 text-sm leading-5 text-slate-600">{message}</p>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="grid h-8 w-8 place-items-center rounded-lg text-lg text-slate-400 hover:bg-slate-100"
//           >
//             ×
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ======================================================
// // DELETE RECORDING MODAL
// // ======================================================

// function DeleteRecordingModal({
//   hasTranscript,
//   deleting,
//   onCancel,
//   onConfirm,
// }) {
//   useEffect(() => {
//     function handleKeyDown(event) {
//       if (event.key === "Escape" && !deleting) {
//         onCancel();
//       }
//     }

//     document.addEventListener("keydown", handleKeyDown);

//     const previousOverflow = document.body.style.overflow;

//     document.body.style.overflow = "hidden";

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);

//       document.body.style.overflow = previousOverflow;
//     };
//   }, [deleting, onCancel]);

//   return (
//     <div
//       className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
//       onMouseDown={(event) => {
//         if (event.target === event.currentTarget && !deleting) {
//           onCancel();
//         }
//       }}
//     >
//       <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
//         <div className="p-6">
//           <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 font-black text-red-600">
//             !
//           </div>

//           <h3 className="mt-5 text-xl font-bold">Delete recording?</h3>

//           <p className="mt-2 text-sm leading-6 text-slate-500">
//             This recording will be removed permanently.
//           </p>

//           {hasTranscript && (
//             <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//               A transcript exists for this recording. Related transcript data
//               may also be removed depending on your backend delete route.
//             </div>
//           )}
//         </div>

//         <div className="flex flex-col-reverse gap-3 border-t bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
//           <button
//             type="button"
//             disabled={deleting}
//             onClick={onCancel}
//             className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             disabled={deleting}
//             onClick={onConfirm}
//             className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
//           >
//             {deleting ? "Deleting..." : "Delete permanently"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ======================================================
// // COMPLETE CONSULTATION MODAL
// // ======================================================

// function CompleteConsultationModal({
//   patientName,
//   hasTranscript,
//   completing,
//   onCancel,
//   onConfirm,
// }) {
//   useEffect(() => {
//     function handleKeyDown(event) {
//       if (event.key === "Escape" && !completing) {
//         onCancel();
//       }
//     }

//     document.addEventListener("keydown", handleKeyDown);

//     const previousOverflow = document.body.style.overflow;

//     document.body.style.overflow = "hidden";

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);

//       document.body.style.overflow = previousOverflow;
//     };
//   }, [completing, onCancel]);

//   return (
//     <div
//       className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
//       onMouseDown={(event) => {
//         if (event.target === event.currentTarget && !completing) {
//           onCancel();
//         }
//       }}
//     >
//       <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
//         <div className="p-6">
//           <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 font-black text-emerald-600">
//             ✓
//           </div>

//           <h3 className="mt-5 text-xl font-bold text-slate-950">
//             Complete consultation?
//           </h3>

//           <p className="mt-2 text-sm leading-6 text-slate-500">
//             {patientName
//               ? `You are about to mark ${patientName}'s consultation as completed.`
//               : "You are about to complete this consultation."}
//           </p>

//           <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
//             <p className="text-sm font-semibold text-slate-800">
//               After completion
//             </p>

//             <div className="mt-3 space-y-2 text-sm text-slate-600">
//               <p>✓ Appointment status becomes completed.</p>

//               <p>✓ Consultation end time is saved.</p>

//               <p>✓ Existing transcript remains available.</p>

//               <p>✓ Recording and transcription controls are locked.</p>
//             </div>
//           </div>

//           {!hasTranscript && (
//             <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800">
//               No transcript exists yet. You can still complete the consultation,
//               but transcription will no longer be available on this page.
//             </div>
//           )}
//         </div>

//         <div className="flex flex-col-reverse gap-3 border-t bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
//           <button
//             type="button"
//             disabled={completing}
//             onClick={onCancel}
//             className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             disabled={completing}
//             onClick={onConfirm}
//             className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
//           >
//             {completing ? "Completing..." : "Complete consultation"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import Badge from "@/components/Badge";

// ======================================================
// LANGUAGES
// ======================================================

const TRANSCRIPTION_LANGUAGES = [
  {
    value: "auto",
    label: "Auto detect",
  },
  {
    value: "en",
    label: "English",
  },
  {
    value: "ur",
    label: "Urdu",
  },
  {
    value: "roman-ur",
    label: "Roman Urdu",
  },
  {
    value: "hi",
    label: "Hindi",
  },
  {
    value: "ar",
    label: "Arabic",
  },
  {
    value: "pa",
    label: "Punjabi",
  },
];

// ======================================================
// PROVIDER LANGUAGES
// ======================================================

const PROVIDER_LANGUAGE_CODES = {
  en: "en",
  ur: "ur",
  hi: "hi",
  ar: "ar",
};

// ======================================================
// PAGE
// ======================================================

export default function NewConsultationPage() {
  return (
    <Suspense fallback={<ConsultationLoading />}>
      <NewConsultationContent />
    </Suspense>
  );
}

// ======================================================
// LOADING
// ======================================================

function ConsultationLoading() {
  return (
    <Shell
      role="doctor"
      title="New consultation"
      subtitle="Loading consultation"
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-950">
            Loading consultation
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Preparing consultation information...
          </p>
        </div>
      </div>
    </Shell>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

function NewConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("appointment");

  // ======================================================
  // DATA
  // ======================================================

  const [doctor, setDoctor] = useState(null);

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [consultation, setConsultation] = useState(null);

  // ======================================================
  // PAGE STATE
  // ======================================================

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // ======================================================
  // TOAST
  // ======================================================

  const [toast, setToast] = useState(null);

  const toastTimerRef = useRef(null);

  // ======================================================
  // RECORDING
  // ======================================================

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");

  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [uploadedRecording, setUploadedRecording] = useState(null);

  const [deletingRecording, setDeletingRecording] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ======================================================
  // TRANSCRIPTION
  // ======================================================

  const [transcribing, setTranscribing] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("auto");

  const [transcript, setTranscript] = useState(null);

  const [transcriptSegments, setTranscriptSegments] = useState([]);

  // ======================================================
  // COMPLETE CONSULTATION
  // ======================================================

  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const [completingConsultation, setCompletingConsultation] = useState(false);

  // ======================================================
  // DOWNLOAD
  // ======================================================

  const [downloadingFormat, setDownloadingFormat] = useState("");

  // ======================================================
  // RECORDING REFS
  // ======================================================

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  // ======================================================
  // TOAST
  // ======================================================

  function showToast(type, message, duration = 4500) {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      type,
      message,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);

      toastTimerRef.current = null;
    }, duration);
  }

  function showSuccess(message) {
    showToast("success", message);
  }

  function showError(message) {
    showToast("error", message, 6000);
  }

  // ======================================================
  // RESPONSE
  // ======================================================

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

  // ======================================================
  // LOAD DOCTOR
  // ======================================================

  async function loadDoctorInformation() {
    try {
      const response = await fetch(`/api/doctors/settings?t=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
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
        console.error("LOAD DOCTOR INFORMATION ERROR:", data.message);

        return;
      }

      setDoctor(
        data.doctor || data.profile || data.user || data.settings || null,
      );
    } catch (error) {
      console.error("LOAD DOCTOR INFORMATION ERROR:", error);
    }
  }

  // ======================================================
  // LOAD CONSULTATION
  // ======================================================

  async function loadConsultationData() {
    if (!appointmentId) {
      setLoading(false);

      showError("Appointment ID is missing.");

      return;
    }

    try {
      setLoading(true);

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
        showError(data.message || "Unable to load consultation information.");

        return;
      }

      setAppointment(data.appointment || null);

      setPatient(data.patient || null);

      setMedicalHistory(
        Array.isArray(data.medical_history) ? data.medical_history : [],
      );

      setConsultation(data.consultation || null);

      setUploadedRecording(data.audio_recording || null);

      setTranscript(data.transcript || null);

      setTranscriptSegments(
        Array.isArray(data.transcript_segments) ? data.transcript_segments : [],
      );

      if (
        data.transcript?.language &&
        TRANSCRIPTION_LANGUAGES.some(
          (item) => item.value === data.transcript.language,
        )
      ) {
        setSelectedLanguage(data.transcript.language);
      }
    } catch (error) {
      console.error("LOAD CONSULTATION ERROR:", error);

      showError(error?.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadConsultationData();

    loadDoctorInformation();
  }, [appointmentId]);

  // ======================================================
  // START CONSULTATION
  // ======================================================

  async function handleStartConsultation() {
    const numericAppointmentId = Number(appointmentId);

    if (!Number.isInteger(numericAppointmentId) || numericAppointmentId <= 0) {
      showError("Valid appointment ID is required.");

      return;
    }

    try {
      setStarting(true);

      const response = await fetch("/api/doctors/consultations/start", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify({
          appointment_id: numericAppointmentId,
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
        showError(data.message || "Unable to start consultation.");

        return;
      }

      setConsultation(data.consultation || null);

      if (data.appointment) {
        setAppointment((previous) => ({
          ...(previous || {}),
          ...data.appointment,
        }));
      } else {
        setAppointment((previous) =>
          previous
            ? {
                ...previous,
                status: "in_consultation",
              }
            : previous,
        );
      }

      if (data.audio_recording) {
        setUploadedRecording(data.audio_recording);
      }

      if (data.transcript) {
        setTranscript(data.transcript);
      }

      if (Array.isArray(data.transcript_segments)) {
        setTranscriptSegments(data.transcript_segments);
      }

      showSuccess(data.message || "Consultation started successfully.");
    } catch (error) {
      console.error("START CONSULTATION ERROR:", error);

      showError(error?.message || "Unable to start consultation.");
    } finally {
      setStarting(false);
    }
  }

  // ======================================================
  // COMPLETE CONSULTATION
  // ======================================================

  function openCompleteConsultationModal() {
    if (!consultation?.id) {
      showError("Consultation ID is missing.");

      return;
    }

    if (consultation.status === "completed") {
      showSuccess("Consultation is already completed.");

      return;
    }

    setCompleteModalOpen(true);
  }

  function closeCompleteConsultationModal() {
    if (completingConsultation) {
      return;
    }

    setCompleteModalOpen(false);
  }

  async function handleCompleteConsultation() {
    if (!consultation?.id) {
      showError("Consultation ID is missing.");

      return;
    }

    try {
      setCompletingConsultation(true);

      const response = await fetch("/api/doctors/consultations/start", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify({
          consultation_id: consultation.id,

          action: "complete",
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
        showError(data.message || "Unable to complete consultation.");

        return;
      }

      if (data.consultation) {
        setConsultation((previous) => ({
          ...(previous || {}),
          ...data.consultation,
        }));
      }

      if (data.appointment) {
        setAppointment((previous) => ({
          ...(previous || {}),
          ...data.appointment,
        }));
      } else {
        setAppointment((previous) =>
          previous
            ? {
                ...previous,
                status: "completed",
              }
            : previous,
        );
      }

      if (data.audio_recording) {
        setUploadedRecording(data.audio_recording);
      }

      if (data.transcript) {
        setTranscript(data.transcript);
      }

      if (Array.isArray(data.transcript_segments)) {
        setTranscriptSegments(data.transcript_segments);
      }

      setCompleteModalOpen(false);

      showSuccess(data.message || "Consultation completed successfully.");
    } catch (error) {
      console.error("COMPLETE CONSULTATION ERROR:", error);

      showError(error?.message || "Unable to complete consultation.");
    } finally {
      setCompletingConsultation(false);
    }
  }

  // ======================================================
  // TIMER
  // ======================================================

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  }

  function startTimer() {
    stopTimer();

    timerRef.current = setInterval(() => {
      setRecordingSeconds((previous) => previous + 1);
    }, 1000);
  }

  function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

    const minutes = Math.floor(safeSeconds / 60);

    const seconds = Math.floor(safeSeconds % 60);

    return `${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  function formatTranscriptTime(value) {
    const seconds = Math.max(0, Math.floor(Number(value) || 0));

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const remaining = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(remaining).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(
      2,
      "0",
    )}:${String(remaining).padStart(2, "0")}`;
  }

  // ======================================================
  // MICROPHONE
  // ======================================================

  function stopMicrophoneStream() {
    if (!streamRef.current) {
      return;
    }

    streamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
  }

  // ======================================================
  // START RECORDING
  // ======================================================

  async function handleStartRecording() {
    try {
      if (!consultation?.id) {
        showError("Start consultation before recording.");

        return;
      }

      if (
        consultation.status === "completed" ||
        appointment?.status === "completed"
      ) {
        showError("Completed consultation cannot be recorded again.");

        return;
      }

      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        showError("Microphone recording is not supported.");

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      let mimeType = "";

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
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

      setTranscriptSegments([]);

      setRecordingSeconds(0);

      setIsPaused(false);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || mimeType || "audio/webm";

        const blob = new Blob(chunksRef.current, {
          type: finalMimeType,
        });

        if (!blob.size) {
          showError("Recording is empty. Please record again.");

          setIsRecording(false);

          setIsPaused(false);

          stopTimer();

          stopMicrophoneStream();

          recorderRef.current = null;

          return;
        }

        const previewUrl = URL.createObjectURL(blob);

        setAudioBlob(blob);

        setAudioUrl(previewUrl);

        setIsRecording(false);

        setIsPaused(false);

        stopTimer();

        stopMicrophoneStream();

        recorderRef.current = null;

        showSuccess("Recording completed.");
      };

      recorder.onerror = (event) => {
        console.error("MEDIA RECORDER ERROR:", event.error);

        setIsRecording(false);

        setIsPaused(false);

        stopTimer();

        stopMicrophoneStream();

        recorderRef.current = null;

        showError("An error occurred while recording.");
      };

      recorder.start(1000);

      setIsRecording(true);

      setIsPaused(false);

      startTimer();
    } catch (error) {
      console.error("START RECORDING ERROR:", error);

      stopMicrophoneStream();

      if (error?.name === "NotAllowedError") {
        showError("Microphone permission was denied.");
      } else if (error?.name === "NotFoundError") {
        showError("No microphone was found.");
      } else {
        showError(error?.message || "Unable to start recording.");
      }
    }
  }

  // ======================================================
  // RECORD CONTROLS
  // ======================================================

  function handlePauseRecording() {
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.pause();

      setIsPaused(true);

      stopTimer();
    }
  }

  function handleResumeRecording() {
    const recorder = recorderRef.current;

    if (recorder?.state === "paused") {
      recorder.resume();

      setIsPaused(false);

      startTimer();
    }
  }

  function handleStopRecording() {
    const recorder = recorderRef.current;

    if (recorder && ["recording", "paused"].includes(recorder.state)) {
      recorder.stop();
    }
  }

  function handleRecordAgain() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);

    setAudioUrl("");

    setRecordingSeconds(0);

    setUploadedRecording(null);

    setTranscript(null);

    setTranscriptSegments([]);
  }

  // ======================================================
  // UPLOAD AUDIO
  // ======================================================

  async function handleUploadAudio() {
    if (!audioBlob) {
      showError("Record audio before saving.");

      return;
    }

    if (!consultation?.id) {
      showError("Consultation ID is missing.");

      return;
    }

    try {
      setUploadingAudio(true);

      const blobType = audioBlob.type || "audio/webm";

      let extension = "webm";

      if (blobType.includes("ogg")) {
        extension = "ogg";
      } else if (blobType.includes("mp4")) {
        extension = "mp4";
      } else if (blobType.includes("mpeg")) {
        extension = "mp3";
      } else if (blobType.includes("wav")) {
        extension = "wav";
      }

      const file = new File(
        [audioBlob],
        `consultation-${consultation.id}.${extension}`,
        {
          type: blobType,
        },
      );

      const formData = new FormData();

      formData.append("consultation_id", String(consultation.id));

      formData.append("duration_seconds", String(recordingSeconds));

      formData.append("audio", file);

      const response = await fetch("/api/doctors/consultations/audio", {
        method: "POST",

        credentials: "include",

        cache: "no-store",

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
        showError(data.message || "Unable to save recording.");

        return;
      }

      setUploadedRecording(data.audio_recording || null);

      setTranscript(null);

      setTranscriptSegments([]);

      setConsultation((previous) =>
        previous
          ? {
              ...previous,
              status: "recorded",
            }
          : previous,
      );

      showSuccess(data.message || "Recording saved successfully.");
    } catch (error) {
      console.error("UPLOAD AUDIO ERROR:", error);

      showError(error?.message || "Unable to upload recording.");
    } finally {
      setUploadingAudio(false);
    }
  }

  // ======================================================
  // DELETE RECORDING
  // ======================================================

  function openDeleteRecordingModal() {
    if (!uploadedRecording?.id) {
      showError("No recording available.");

      return;
    }

    setDeleteModalOpen(true);
  }

  function closeDeleteRecordingModal() {
    if (deletingRecording) {
      return;
    }

    setDeleteModalOpen(false);
  }

  async function handleDeleteRecording() {
    if (!consultation?.id || !uploadedRecording?.id) {
      showError("Recording information is missing.");

      return;
    }

    try {
      setDeletingRecording(true);

      const response = await fetch("/api/doctors/consultations/audio", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

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
        showError(data.message || "Unable to delete recording.");

        return;
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioBlob(null);

      setAudioUrl("");

      setRecordingSeconds(0);

      setTranscript(null);

      setTranscriptSegments([]);

      setUploadedRecording(data.remaining_audio_recording || null);

      if (data.consultation) {
        setConsultation((previous) => ({
          ...(previous || {}),
          ...data.consultation,
        }));
      }

      setDeleteModalOpen(false);

      showSuccess(data.message || "Recording deleted successfully.");
    } catch (error) {
      console.error("DELETE RECORDING ERROR:", error);

      showError(error?.message || "Unable to delete recording.");
    } finally {
      setDeletingRecording(false);
    }
  }

  // ======================================================
  // PUTER HELPERS
  // ======================================================

  function findTranscriptText(result) {
    const candidates = [
      result?.text,
      result?.data?.text,
      result?.result?.text,
      result?.output?.text,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }

    return "";
  }

  function findRawSegments(result) {
    const candidates = [
      result?.segments,
      result?.data?.segments,
      result?.result?.segments,
      result?.output?.segments,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.length) {
        return candidate;
      }
    }

    return [];
  }

  function findWords(result) {
    const candidates = [
      result?.words,
      result?.data?.words,
      result?.result?.words,
      result?.output?.words,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.length) {
        return candidate;
      }
    }

    return [];
  }

  function normalizePuterSegments(segments) {
    return (Array.isArray(segments) ? segments : [])
      .map((segment, index) => {
        const start = Number(segment?.start ?? segment?.start_time ?? 0) || 0;

        const end = Number(segment?.end ?? segment?.end_time ?? start) || start;

        const rawSpeaker =
          segment?.speaker ?? segment?.speaker_id ?? `speaker_${index}`;

        const text =
          typeof segment?.text === "string" ? segment.text.trim() : "";

        return {
          segment_index: index,

          speaker: String(rawSpeaker),

          speaker_role: null,

          start_time: start,

          end_time: Math.max(start, end),

          text,
        };
      })
      .filter((segment) => segment.text);
  }

  function buildSegmentsFromWords(words) {
    const segments = [];

    let current = null;

    for (const word of words) {
      const text = typeof word?.text === "string" ? word.text.trim() : "";

      if (!text) {
        continue;
      }

      const speaker = String(
        word?.speaker ?? word?.speaker_id ?? "speaker_unknown",
      );

      const start = Number(word?.start) || 0;

      const end = Number(word?.end) || start;

      if (!current || current.speaker !== speaker) {
        if (current) {
          segments.push(current);
        }

        current = {
          segment_index: segments.length,

          speaker,

          speaker_role: null,

          start_time: start,

          end_time: end,

          text,
        };
      } else {
        current.text = `${current.text} ${text}`;

        current.end_time = end;
      }
    }

    if (current) {
      segments.push(current);
    }

    return segments;
  }

  function cleanJsonText(value) {
    return String(value || "")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  function getPuterChatText(result) {
    if (typeof result === "string") {
      return result.trim();
    }

    if (typeof result?.message?.content === "string") {
      return result.message.content.trim();
    }

    if (Array.isArray(result?.message?.content)) {
      return result.message.content
        .map((item) => (typeof item?.text === "string" ? item.text : ""))
        .join("")
        .trim();
    }

    return "";
  }

  // ======================================================
  // SPEAKER ROLE
  // ======================================================

  async function identifySpeakerRoles(segments) {
    const speakers = [...new Set(segments.map((segment) => segment.speaker))];

    if (speakers.length < 2) {
      return Object.fromEntries(
        speakers.map((speaker) => [speaker, "unknown"]),
      );
    }

    const conversation = segments
      .map((segment) => `${segment.speaker}: ${segment.text}`)
      .join("\n");

    const prompt = `
This is a medical consultation between one doctor and one patient.

Identify which speaker is the doctor and which is the patient.

Doctor normally asks questions about symptoms, medicines, history, diagnosis and treatment.
Patient normally reports symptoms and answers questions.

Return ONLY valid JSON:

{
  "doctor": "speaker_name",
  "patient": "speaker_name"
}

Speakers:
${speakers.join(", ")}

Conversation:
${conversation}
    `.trim();

    try {
      const result = await window.puter.ai.chat(prompt);

      const text = cleanJsonText(getPuterChatText(result));

      const parsed = JSON.parse(text);

      const roles = {};

      if (speakers.includes(parsed?.doctor)) {
        roles[parsed.doctor] = "doctor";
      }

      if (speakers.includes(parsed?.patient)) {
        roles[parsed.patient] = "patient";
      }

      speakers.forEach((speaker) => {
        if (!roles[speaker]) {
          roles[speaker] = "unknown";
        }
      });

      return roles;
    } catch (error) {
      console.error("SPEAKER IDENTIFICATION ERROR:", error);

      return Object.fromEntries(
        speakers.map((speaker) => [speaker, "unknown"]),
      );
    }
  }

  // ======================================================
  // OPENAI DIARIZATION
  // ======================================================

  async function tryOpenAIDiarization(file) {
    const options = {
      provider: "openai",

      model: "gpt-4o-transcribe-diarize",

      response_format: "diarized_json",

      chunking_strategy: "auto",
    };

    const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

    if (providerLanguage) {
      options.language = providerLanguage;
    }

    const result = await window.puter.ai.speech2txt(file, options);

    console.log("OPENAI DIARIZATION RESPONSE:", result);

    return {
      provider: "openai",

      result,

      text: findTranscriptText(result),

      segments: normalizePuterSegments(findRawSegments(result)),
    };
  }

  // ======================================================
  // XAI FALLBACK
  // ======================================================

  async function tryXAIDiarization(file) {
    const options = {
      audio: file,

      provider: "xai",

      diarize: true,
    };

    const providerLanguage = PROVIDER_LANGUAGE_CODES[selectedLanguage];

    if (providerLanguage) {
      options.language = providerLanguage;

      options.format = true;
    }

    const result = await window.puter.ai.speech2txt(options);

    console.log("XAI DIARIZATION RESPONSE:", result);

    return {
      provider: "xai",

      result,

      text: findTranscriptText(result),

      segments: buildSegmentsFromWords(findWords(result)),
    };
  }

  // ======================================================
  // DIARIZATION
  // ======================================================

  async function callPuterDiarization(file) {
    let openAIResult = null;

    try {
      openAIResult = await tryOpenAIDiarization(file);

      if (openAIResult.segments.length > 0) {
        return openAIResult;
      }
    } catch (error) {
      console.error("OPENAI DIARIZATION ERROR:", error);
    }

    try {
      const xaiResult = await tryXAIDiarization(file);

      if (xaiResult.segments.length > 0) {
        return xaiResult;
      }
    } catch (error) {
      console.error("XAI DIARIZATION ERROR:", error);
    }

    if (openAIResult?.text) {
      throw new Error(
        "Speech detected but speaker separation could not be generated.",
      );
    }

    throw new Error(
      "Recording could not be transcribed with speaker separation.",
    );
  }

  // ======================================================
  // GENERATE TRANSCRIPT
  // ======================================================

  async function handleGenerateTranscript() {
    if (!consultation?.id) {
      showError("Consultation ID is missing.");

      return;
    }

    if (!uploadedRecording?.id) {
      showError("Please save recording first.");

      return;
    }

    if (!uploadedRecording?.audio_url) {
      showError("Audio URL is missing. Reload consultation.");

      return;
    }

    if (
      typeof window === "undefined" ||
      !window.puter?.ai ||
      typeof window.puter.ai.speech2txt !== "function"
    ) {
      showError("Speech-to-text service is unavailable.");

      return;
    }

    try {
      setTranscribing(true);

      const audioResponse = await fetch(uploadedRecording.audio_url, {
        method: "GET",
        cache: "no-store",
      });

      if (!audioResponse.ok) {
        throw new Error(
          `Unable to load saved audio (${audioResponse.status}).`,
        );
      }

      const fetchedBlob = await audioResponse.blob();

      if (fetchedBlob.size < 1000) {
        throw new Error("Saved audio is too small to transcribe.");
      }

      const rawMimeType =
        uploadedRecording.mime_type || fetchedBlob.type || "audio/webm";

      const mimeType = rawMimeType.split(";")[0].trim().toLowerCase();

      let extension = "webm";

      if (mimeType.includes("ogg")) {
        extension = "ogg";
      } else if (mimeType.includes("mp4")) {
        extension = "mp4";
      } else if (mimeType.includes("mpeg")) {
        extension = "mp3";
      } else if (mimeType.includes("wav")) {
        extension = "wav";
      }

      const file = new File(
        [fetchedBlob],
        `consultation-${consultation.id}.${extension}`,
        {
          type: mimeType,
        },
      );

      const diarization = await callPuterDiarization(file);

      if (!diarization.segments.length) {
        throw new Error("Speaker-separated transcript was not returned.");
      }

      const roles = await identifySpeakerRoles(diarization.segments);

      const finalSegments = diarization.segments.map((segment, index) => ({
        ...segment,

        segment_index: index,

        speaker_role:
          roles[segment.speaker] === "doctor" ||
          roles[segment.speaker] === "patient"
            ? roles[segment.speaker]
            : null,
      }));

      let transcriptText = diarization.text || "";

      if (!transcriptText) {
        transcriptText = finalSegments
          .map((segment) => segment.text)
          .join(" ")
          .trim();
      }

      if (!transcriptText) {
        throw new Error("Transcript is empty.");
      }

      const response = await fetch("/api/doctors/consultations/transcribe", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify({
          consultation_id: consultation.id,

          audio_recording_id: uploadedRecording.id,

          transcript_text: transcriptText,

          segments: finalSegments,

          provider: "puter",

          model: "gpt-4o-transcribe-diarize",

          language: selectedLanguage,
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
        showError(
          data.message || "Transcript generated but could not be saved.",
        );

        return;
      }

      setTranscript(data.transcript || null);

      setTranscriptSegments(
        Array.isArray(data.transcript_segments)
          ? data.transcript_segments
          : finalSegments,
      );

      setUploadedRecording((previous) =>
        previous
          ? {
              ...previous,
              status: "completed",
            }
          : previous,
      );

      setConsultation((previous) =>
        previous
          ? {
              ...previous,
              status: "transcribed",
            }
          : previous,
      );

      showSuccess(data.message || "Transcript generated successfully.");
    } catch (error) {
      console.error("GENERATE DIARIZED TRANSCRIPT ERROR:", error);

      showError(error?.message || "Unable to generate transcript.");
    } finally {
      setTranscribing(false);
    }
  }

  // ======================================================
  // HELPERS
  // ======================================================

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

    const [hours, minutes] = String(time).split(":");

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

  function getLanguageLabel(value) {
    return (
      TRANSCRIPTION_LANGUAGES.find((item) => item.value === value)?.label ||
      value ||
      "Auto detect"
    );
  }

  function getSpeakerLabel(segment) {
    if (segment?.speaker_role === "doctor") {
      return "Doctor";
    }

    if (segment?.speaker_role === "patient") {
      return "Patient";
    }

    return segment?.speaker || "Unknown speaker";
  }

  function getSpeakerTone(segment) {
    if (segment?.speaker_role === "doctor") {
      return "blue";
    }

    if (segment?.speaker_role === "patient") {
      return "green";
    }

    return "gray";
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

  // ======================================================
  // DOWNLOAD HELPERS
  // ======================================================

  function getSafeFileName() {
    const patientName =
      String(patient?.name || "patient")
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "patient";

    return `consultation-${consultation?.id || "transcript"}-${patientName}`;
  }

  function triggerBlobDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = fileName;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function getDoctorName() {
    return doctor?.name || doctor?.full_name || doctor?.user?.name || "—";
  }

  function getDoctorEmail() {
    return doctor?.email || doctor?.user?.email || "—";
  }

  function getDoctorPhone() {
    return doctor?.phone || doctor?.phone_number || doctor?.user?.phone || "—";
  }

  function getDoctorSpecialization() {
    return (
      doctor?.specialization || doctor?.speciality || doctor?.specialty || "—"
    );
  }

  function getDoctorQualification() {
    return doctor?.qualification || doctor?.qualifications || "—";
  }

  function getDoctorLicenseNumber() {
    return doctor?.license_number || doctor?.license_no || "—";
  }

  function getExportConversation() {
    if (transcriptSegments.length > 0) {
      return transcriptSegments.map((segment) => ({
        speaker: getSpeakerLabel(segment),

        detected_speaker: segment.speaker,

        start_time: Number(segment.start_time) || 0,

        end_time: Number(segment.end_time) || 0,

        text: segment.text || "",
      }));
    }

    return [
      {
        speaker: "Transcript",

        detected_speaker: null,

        start_time: 0,

        end_time: Number(uploadedRecording?.duration_seconds) || 0,

        text: transcript?.edited_text || transcript?.full_text || "",
      },
    ];
  }

  function getExportMetadata() {
    return {
      doctor: {
        name: getDoctorName(),

        email: getDoctorEmail(),

        phone: getDoctorPhone(),

        specialization: getDoctorSpecialization(),

        qualification: getDoctorQualification(),

        license_number: getDoctorLicenseNumber(),
      },

      patient: {
        name: patient?.name || "—",

        patient_code: patient?.patient_code || "—",

        age: calculateAge(patient?.date_of_birth),

        gender: patient?.gender || "—",

        phone: patient?.phone || "—",

        address: patient?.address || "—",
      },

      appointment: {
        id: appointment?.id || null,

        date: appointment?.appointment_date || null,

        time: appointment?.appointment_time || null,

        token: appointment?.token_number || "—",
      },

      consultation: {
        id: consultation?.id || null,

        status: consultation?.status || "—",

        started_at: consultation?.started_at || null,

        ended_at: consultation?.ended_at || null,
      },

      transcript: {
        id: transcript?.id || null,

        language: getLanguageLabel(transcript?.language || selectedLanguage),

        status: transcript?.status || "—",

        word_count: transcript?.word_count ?? null,
      },

      recording: {
        duration_seconds: uploadedRecording?.duration_seconds ?? null,
      },
    };
  }

  // ======================================================
  // TXT
  // ======================================================

  async function handleDownloadTxt() {
    if (!transcript) {
      showError("No transcript is available.");

      return;
    }

    try {
      setDownloadingFormat("txt");

      const metadata = getExportMetadata();

      const conversation = getExportConversation();

      const lines = [
        "MEDTRANSCRIPT",
        "MEDICAL CONSULTATION REPORT",
        "==============================================",
        "",

        "DOCTOR INFORMATION",
        "----------------------------------------------",
        `Name: ${metadata.doctor.name}`,
        `Email: ${metadata.doctor.email}`,
        `Phone: ${metadata.doctor.phone}`,
        `Specialization: ${metadata.doctor.specialization}`,
        `Qualification: ${metadata.doctor.qualification}`,
        `License Number: ${metadata.doctor.license_number}`,
        "",

        "PATIENT INFORMATION",
        "----------------------------------------------",
        `Name: ${metadata.patient.name}`,
        `Patient Code: ${metadata.patient.patient_code}`,
        `Age: ${
          metadata.patient.age !== null ? `${metadata.patient.age} years` : "—"
        }`,
        `Gender: ${metadata.patient.gender}`,
        `Phone: ${metadata.patient.phone}`,
        `Address: ${metadata.patient.address}`,
        "",

        "CONSULTATION INFORMATION",
        "----------------------------------------------",
        `Appointment ID: ${metadata.appointment.id ?? "—"}`,
        `Consultation ID: ${metadata.consultation.id ?? "—"}`,
        `Date: ${formatDate(metadata.appointment.date)}`,
        `Time: ${formatTime(metadata.appointment.time)}`,
        `Token: ${metadata.appointment.token}`,
        `Status: ${metadata.consultation.status}`,
        `Language: ${metadata.transcript.language}`,
        `Recording Duration: ${formatDuration(
          metadata.recording.duration_seconds,
        )}`,
        "",
        "",
        "CONSULTATION TRANSCRIPTION",
        "==============================================",
        "",
      ];

      conversation.forEach((segment) => {
        lines.push(
          `${segment.speaker} [${formatTranscriptTime(
            segment.start_time,
          )} - ${formatTranscriptTime(segment.end_time)}]`,
        );

        lines.push(segment.text);

        lines.push("");
      });

      const blob = new Blob([lines.join("\n")], {
        type: "text/plain;charset=utf-8",
      });

      triggerBlobDownload(blob, `${getSafeFileName()}.txt`);

      showSuccess("TXT downloaded successfully.");
    } catch (error) {
      console.error("TXT DOWNLOAD ERROR:", error);

      showError("Unable to download TXT.");
    } finally {
      setDownloadingFormat("");
    }
  }

  // ======================================================
  // JSON
  // ======================================================

  async function handleDownloadJson() {
    if (!transcript) {
      showError("No transcript is available.");

      return;
    }

    try {
      setDownloadingFormat("json");

      const data = {
        metadata: getExportMetadata(),

        consultation,

        transcript,

        segments: getExportConversation(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      });

      triggerBlobDownload(blob, `${getSafeFileName()}.json`);

      showSuccess("JSON downloaded successfully.");
    } catch (error) {
      console.error("JSON DOWNLOAD ERROR:", error);

      showError("Unable to download JSON.");
    } finally {
      setDownloadingFormat("");
    }
  }

  // ======================================================
  // DOCX
  // ======================================================

  function createDocxField(label, value) {
    return new Paragraph({
      spacing: {
        after: 100,
      },

      children: [
        new TextRun({
          text: `${label}: `,
          bold: true,
        }),

        new TextRun({
          text: String(value ?? "—"),
        }),
      ],
    });
  }

  async function handleDownloadDocx() {
    if (!transcript) {
      showError("No transcript is available.");

      return;
    }

    try {
      setDownloadingFormat("docx");

      const metadata = getExportMetadata();

      const conversation = getExportConversation();

      const children = [
        new Paragraph({
          text: "Medical Consultation Report",

          heading: HeadingLevel.TITLE,
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "MedTranscript",
              bold: true,
            }),
          ],
        }),

        new Paragraph({
          text: "",
        }),

        new Paragraph({
          text: "Doctor Information",

          heading: HeadingLevel.HEADING_1,
        }),

        createDocxField("Doctor Name", metadata.doctor.name),

        createDocxField("Email", metadata.doctor.email),

        createDocxField("Phone", metadata.doctor.phone),

        createDocxField("Specialization", metadata.doctor.specialization),

        createDocxField("Qualification", metadata.doctor.qualification),

        createDocxField("License Number", metadata.doctor.license_number),

        new Paragraph({
          text: "",
        }),

        new Paragraph({
          text: "Patient Information",

          heading: HeadingLevel.HEADING_1,
        }),

        createDocxField("Patient Name", metadata.patient.name),

        createDocxField("Patient Code", metadata.patient.patient_code),

        createDocxField(
          "Age",
          metadata.patient.age !== null ? `${metadata.patient.age} years` : "—",
        ),

        createDocxField("Gender", metadata.patient.gender),

        createDocxField("Phone", metadata.patient.phone),

        createDocxField("Address", metadata.patient.address),

        new Paragraph({
          text: "",
        }),

        new Paragraph({
          text: "Consultation Information",

          heading: HeadingLevel.HEADING_1,
        }),

        createDocxField("Appointment ID", metadata.appointment.id ?? "—"),

        createDocxField("Consultation ID", metadata.consultation.id ?? "—"),

        createDocxField("Date", formatDate(metadata.appointment.date)),

        createDocxField("Time", formatTime(metadata.appointment.time)),

        createDocxField("Token", metadata.appointment.token),

        createDocxField("Status", metadata.consultation.status),

        createDocxField("Language", metadata.transcript.language),

        createDocxField(
          "Recording Duration",
          formatDuration(metadata.recording.duration_seconds),
        ),

        new Paragraph({
          text: "Consultation Transcription",

          heading: HeadingLevel.HEADING_1,

          pageBreakBefore: true,
        }),
      ];

      conversation.forEach((segment) => {
        children.push(
          new Paragraph({
            spacing: {
              before: 280,
              after: 80,
            },

            children: [
              new TextRun({
                text: segment.speaker,

                bold: true,
              }),

              new TextRun({
                text: `    ${formatTranscriptTime(
                  segment.start_time,
                )} - ${formatTranscriptTime(segment.end_time)}`,

                color: "64748B",
              }),
            ],
          }),
        );

        children.push(
          new Paragraph({
            spacing: {
              after: 180,
            },

            children: [
              new TextRun({
                text: segment.text,
              }),
            ],
          }),
        );
      });

      const document = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
      });

      const blob = await Packer.toBlob(document);

      triggerBlobDownload(blob, `${getSafeFileName()}.docx`);

      showSuccess("DOCX downloaded successfully.");
    } catch (error) {
      console.error("DOCX DOWNLOAD ERROR:", error);

      showError("Unable to generate DOCX.");
    } finally {
      setDownloadingFormat("");
    }
  }

  // ======================================================
  // PDF - DIRECT JSPDF
  // ======================================================

  async function handleDownloadPdf() {
    if (!transcript) {
      showError("No transcript is available.");

      return;
    }

    try {
      setDownloadingFormat("pdf");

      // ====================================================
      // JSPDF
      // ====================================================

      const jsPDFModule = await import("jspdf");

      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      if (!jsPDF) {
        throw new Error("PDF library could not be loaded.");
      }

      // ====================================================
      // DATA
      // ====================================================

      const metadata = getExportMetadata();

      const conversation = getExportConversation();

      // ====================================================
      // CREATE PDF
      // ====================================================

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginLeft = 18;
      const marginRight = 18;
      const marginTop = 18;
      const marginBottom = 18;

      const contentWidth = pageWidth - marginLeft - marginRight;

      let y = marginTop;

      // ====================================================
      // INTERNAL HELPERS
      // ====================================================

      function addNewPage() {
        pdf.addPage();

        y = marginTop;
      }

      function ensureSpace(requiredHeight) {
        if (y + requiredHeight > pageHeight - marginBottom) {
          addNewPage();
        }
      }

      function drawSectionTitle(title) {
        ensureSpace(15);

        y += 3;

        pdf.setFont("helvetica", "bold");

        pdf.setFontSize(15);

        pdf.setTextColor(15, 23, 42);

        pdf.text(title, marginLeft, y);

        y += 4;

        pdf.setDrawColor(226, 232, 240);

        pdf.line(marginLeft, y, pageWidth - marginRight, y);

        y += 7;
      }

      function drawLabelValue(label, value) {
        const safeValue = String(value ?? "—");

        const lines = pdf.splitTextToSize(safeValue, contentWidth);

        const height = 9 + lines.length * 5;

        ensureSpace(height);

        pdf.setFont("helvetica", "bold");

        pdf.setFontSize(8.5);

        pdf.setTextColor(100, 116, 139);

        pdf.text(label.toUpperCase(), marginLeft, y);

        y += 4.5;

        pdf.setFont("helvetica", "normal");

        pdf.setFontSize(10.5);

        pdf.setTextColor(15, 23, 42);

        pdf.text(lines, marginLeft, y);

        y += lines.length * 5 + 3;
      }

      function drawTranscriptSegment(segment) {
        const speaker = segment.speaker || "Unknown";

        const timeText = `${formatTranscriptTime(
          segment.start_time,
        )} - ${formatTranscriptTime(segment.end_time)}`;

        const text = String(segment.text || "").trim();

        const textLines = pdf.splitTextToSize(text, contentWidth - 8);

        const blockHeight = 18 + textLines.length * 5;

        ensureSpace(blockHeight + 4);

        pdf.setFillColor(248, 250, 252);

        pdf.setDrawColor(226, 232, 240);

        pdf.roundedRect(
          marginLeft,
          y,
          contentWidth,
          blockHeight,
          2.5,
          2.5,
          "FD",
        );

        y += 6;

        pdf.setFont("helvetica", "bold");

        pdf.setFontSize(10);

        pdf.setTextColor(15, 23, 42);

        pdf.text(speaker, marginLeft + 4, y);

        pdf.setFont("helvetica", "normal");

        pdf.setFontSize(8);

        pdf.setTextColor(100, 116, 139);

        const timeWidth = pdf.getTextWidth(timeText);

        pdf.text(timeText, pageWidth - marginRight - timeWidth - 4, y);

        y += 6;

        pdf.setFontSize(10.5);

        pdf.setTextColor(30, 41, 59);

        pdf.text(textLines, marginLeft + 4, y, {
          lineHeightFactor: 1.35,
        });

        y += textLines.length * 5 + 7;
      }

      // ====================================================
      // PAGE 1 HEADER
      // ====================================================

      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(9);

      pdf.setTextColor(100, 116, 139);

      pdf.text("MEDTRANSCRIPT", marginLeft, y);

      y += 8;

      pdf.setFontSize(22);

      pdf.setTextColor(15, 23, 42);

      pdf.text("Medical Consultation Report", marginLeft, y);

      y += 7;

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(10);

      pdf.setTextColor(100, 116, 139);

      pdf.text(
        `Consultation #${metadata.consultation.id ?? "—"}`,
        marginLeft,
        y,
      );

      y += 7;

      pdf.setDrawColor(15, 23, 42);

      pdf.line(marginLeft, y, pageWidth - marginRight, y);

      y += 4;

      // ====================================================
      // DOCTOR
      // ====================================================

      drawSectionTitle("Doctor Information");

      drawLabelValue("Doctor Name", metadata.doctor.name);

      drawLabelValue("Email", metadata.doctor.email);

      drawLabelValue("Phone", metadata.doctor.phone);

      drawLabelValue("Specialization", metadata.doctor.specialization);

      drawLabelValue("Qualification", metadata.doctor.qualification);

      drawLabelValue("License Number", metadata.doctor.license_number);

      // ====================================================
      // PATIENT
      // ====================================================

      drawSectionTitle("Patient Information");

      drawLabelValue("Patient Name", metadata.patient.name);

      drawLabelValue("Patient Code", metadata.patient.patient_code);

      drawLabelValue(
        "Age",
        metadata.patient.age !== null ? `${metadata.patient.age} years` : "—",
      );

      drawLabelValue("Gender", metadata.patient.gender);

      drawLabelValue("Phone", metadata.patient.phone);

      drawLabelValue("Address", metadata.patient.address);

      // ====================================================
      // CONSULTATION
      // ====================================================

      drawSectionTitle("Consultation Information");

      drawLabelValue("Appointment ID", metadata.appointment.id ?? "—");

      drawLabelValue("Consultation ID", metadata.consultation.id ?? "—");

      drawLabelValue("Appointment Date", formatDate(metadata.appointment.date));

      drawLabelValue("Appointment Time", formatTime(metadata.appointment.time));

      drawLabelValue("Token", metadata.appointment.token);

      drawLabelValue(
        "Status",
        String(metadata.consultation.status || "—").replaceAll("_", " "),
      );

      drawLabelValue("Language", metadata.transcript.language);

      drawLabelValue(
        "Recording Duration",
        formatDuration(metadata.recording.duration_seconds),
      );

      // ====================================================
      // TRANSCRIPT ALWAYS STARTS NEW PAGE
      // ====================================================

      pdf.addPage();

      y = marginTop;

      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(9);

      pdf.setTextColor(100, 116, 139);

      pdf.text(
        `Consultation #${metadata.consultation.id ?? "—"}`,
        marginLeft,
        y,
      );

      y += 8;

      pdf.setFontSize(22);

      pdf.setTextColor(15, 23, 42);

      pdf.text("Consultation Transcription", marginLeft, y);

      y += 7;

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(10);

      pdf.setTextColor(100, 116, 139);

      const subtitle = `${metadata.patient.name} | ${metadata.transcript.language}`;

      pdf.text(subtitle, marginLeft, y);

      y += 7;

      pdf.setDrawColor(15, 23, 42);

      pdf.line(marginLeft, y, pageWidth - marginRight, y);

      y += 9;

      // ====================================================
      // TRANSCRIPT SEGMENTS
      // ====================================================

      if (conversation.length > 0) {
        for (const segment of conversation) {
          drawTranscriptSegment(segment);
        }
      } else {
        const text =
          transcript.edited_text ||
          transcript.full_text ||
          "Transcript is empty.";

        const lines = pdf.splitTextToSize(text, contentWidth);

        pdf.setFont("helvetica", "normal");

        pdf.setFontSize(10.5);

        pdf.setTextColor(30, 41, 59);

        pdf.text(lines, marginLeft, y);
      }

      // ====================================================
      // PAGE NUMBERS
      // ====================================================

      const pageCount = pdf.getNumberOfPages();

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        pdf.setPage(pageNumber);

        pdf.setFont("helvetica", "normal");

        pdf.setFontSize(8);

        pdf.setTextColor(148, 163, 184);

        pdf.text("Generated by MedTranscript", marginLeft, pageHeight - 8);

        const pageText = `Page ${pageNumber} of ${pageCount}`;

        const pageTextWidth = pdf.getTextWidth(pageText);

        pdf.text(
          pageText,
          pageWidth - marginRight - pageTextWidth,
          pageHeight - 8,
        );
      }

      // ====================================================
      // SAVE
      // ====================================================

      pdf.save(`${getSafeFileName()}.pdf`);

      showSuccess("PDF downloaded successfully.");
    } catch (error) {
      console.error("PDF DOWNLOAD ERROR:", error);

      showError(error?.message || "Unable to generate PDF.");
    } finally {
      setDownloadingFormat("");
    }
  }

  // ======================================================
  // CLEANUP
  // ======================================================

  useEffect(() => {
    return () => {
      stopTimer();

      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {}
      }

      stopMicrophoneStream();

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return <ConsultationLoading />;
  }

  // ======================================================
  // UNAVAILABLE
  // ======================================================

  if (!appointmentId || !patient || !appointment) {
    return (
      <Shell
        role="doctor"
        title="New consultation"
        subtitle="Consultation unavailable"
      >
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[28px] border bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold">Consultation unavailable</h2>

            <p className="mt-2 text-sm text-slate-500">
              Unable to load consultation.
            </p>

            <Link
              href="/doctor"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // ======================================================
  // PAGE DATA
  // ======================================================

  const age = calculateAge(patient.date_of_birth);

  const appointmentStatus = getAppointmentStatus(appointment.status);

  const latestHistory = medicalHistory.length > 0 ? medicalHistory[0] : null;

  const consultationStarted = Boolean(consultation?.id);

  const consultationLocked =
    consultation?.status === "completed" || appointment?.status === "completed";

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <>
      <Shell
        role="doctor"
        title="New consultation"
        subtitle={`${patient.name} · ${patient.patient_code}`}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          {/* =================================================
              PATIENT
          ================================================= */}

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6 md:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-lg font-bold text-white">
                    {String(patient.name || "P")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-950">
                        {patient.name}
                      </h2>

                      <Badge tone={appointmentStatus.tone}>
                        {appointmentStatus.label}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {patient.patient_code}

                      {" · "}

                      {age !== null ? `${age} years` : "Age not added"}

                      {" · "}

                      {patient.gender || "Gender not added"}
                    </p>

                    {patient.phone && (
                      <p className="mt-1 text-sm text-slate-500">
                        {patient.phone}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/doctor/patients/${patient.id}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"
                >
                  View patient
                </Link>
              </div>
            </div>

            <div className="grid divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">
              <InfoCell label="Appointment" value={`#${appointment.id}`} />

              <InfoCell
                label="Date"
                value={formatDate(appointment.appointment_date)}
              />

              <InfoCell
                label="Time"
                value={formatTime(appointment.appointment_time)}
              />

              <InfoCell label="Token" value={appointment.token_number || "—"} />
            </div>

            {appointment.notes && (
              <div className="border-t px-6 py-5 md:px-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Appointment notes
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {appointment.notes}
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              HISTORY
          ================================================= */}

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b px-6 py-5 md:px-8">
              <div>
                <h3 className="font-bold">Patient history</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Latest medical information before consultation.
                </p>
              </div>

              <Link
                href={`/doctor/patients/${patient.id}`}
                className="text-sm font-semibold text-blue-600"
              >
                Full history
              </Link>
            </div>

            {!latestHistory ? (
              <div className="p-6">
                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  No medical history available.
                </div>
              </div>
            ) : (
              <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                <HistoryCard
                  label="Previous diseases"
                  value={latestHistory.previous_diseases || "None reported"}
                />

                <HistoryCard
                  label="Allergies"
                  value={latestHistory.allergies || "None reported"}
                />

                <HistoryCard
                  label="Current medications"
                  value={latestHistory.current_medications || "None reported"}
                />

                <HistoryCard
                  label="Previous surgeries"
                  value={latestHistory.previous_surgeries || "None reported"}
                />

                <HistoryCard
                  label="Family history"
                  value={latestHistory.family_history || "None reported"}
                />

                <HistoryCard
                  label="Additional notes"
                  value={latestHistory.additional_notes || "No notes"}
                />
              </div>
            )}
          </section>

          {/* =================================================
              CONSULTATION
          ================================================= */}

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b px-6 py-5 md:px-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-bold">Consultation workspace</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Record, transcribe and complete consultation.
                  </p>
                </div>

                {consultationStarted && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold">
                      Consultation #{consultation.id}
                    </span>

                    <Badge
                      tone={
                        consultationLocked ||
                        consultation.status === "transcribed"
                          ? "green"
                          : "blue"
                      }
                    >
                      {String(consultation.status || "draft").replaceAll(
                        "_",
                        " ",
                      )}
                    </Badge>

                    {!consultationLocked ? (
                      <button
                        type="button"
                        disabled={
                          completingConsultation ||
                          isRecording ||
                          uploadingAudio ||
                          transcribing ||
                          deletingRecording
                        }
                        onClick={openCompleteConsultationModal}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Complete consultation
                      </button>
                    ) : (
                      <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {!consultationStarted ? (
                <div className="rounded-2xl border-2 border-dashed p-10 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-white">
                    <Icon name="mic" size={28} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    Ready to start consultation
                  </h3>

                  <button
                    type="button"
                    disabled={starting}
                    onClick={handleStartConsultation}
                    className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {starting ? "Starting..." : "Start consultation"}
                  </button>
                </div>
              ) : (
                <>
                  {consultationLocked && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="font-bold text-emerald-950">
                        Consultation completed
                      </p>

                      <p className="mt-1 text-sm text-emerald-800">
                        Recording and transcription controls are locked.
                      </p>
                    </div>
                  )}

                  {/* RECORDING */}

                  <div className="rounded-2xl border bg-slate-50 p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h4 className="font-bold">Consultation recording</h4>

                        <p className="mt-1 text-sm text-slate-500">
                          Record doctor and patient clearly.
                        </p>
                      </div>

                      {(isRecording || recordingSeconds > 0) && (
                        <div className="rounded-xl bg-white px-5 py-3 text-xl font-bold tabular-nums">
                          {formatDuration(recordingSeconds)}
                        </div>
                      )}
                    </div>

                    {!isRecording &&
                      !audioBlob &&
                      !uploadedRecording &&
                      !consultationLocked && (
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                        >
                          Start recording
                        </button>
                      )}

                    {isRecording && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {!isPaused ? (
                          <button
                            type="button"
                            onClick={handlePauseRecording}
                            className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResumeRecording}
                            className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
                          >
                            Resume
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
                        >
                          Stop
                        </button>
                      </div>
                    )}

                    {audioBlob && !uploadedRecording && !isRecording && (
                      <div className="mt-6 rounded-2xl bg-white p-5">
                        <audio controls src={audioUrl} className="w-full" />

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={uploadingAudio}
                            onClick={handleUploadAudio}
                            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {uploadingAudio ? "Saving..." : "Save recording"}
                          </button>

                          <button
                            type="button"
                            disabled={uploadingAudio}
                            onClick={handleRecordAgain}
                            className="rounded-xl border px-5 py-3 text-sm font-semibold"
                          >
                            Record again
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadedRecording && (
                      <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white">
                        <div className="bg-emerald-50 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-emerald-950">
                                Recording saved
                              </p>

                              <p className="mt-1 text-xs text-emerald-700">
                                Recording #{uploadedRecording.id}
                              </p>
                            </div>

                            <Badge tone="green">Uploaded</Badge>
                          </div>
                        </div>

                        <div className="p-5">
                          {uploadedRecording.audio_url && (
                            <audio
                              controls
                              src={uploadedRecording.audio_url}
                              className="w-full"
                            />
                          )}

                          {!consultationLocked && (
                            <div className="mt-5 grid gap-4 border-t pt-5 lg:grid-cols-[1fr_auto]">
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <select
                                  value={selectedLanguage}
                                  onChange={(event) =>
                                    setSelectedLanguage(event.target.value)
                                  }
                                  disabled={transcribing || deletingRecording}
                                  className="rounded-xl border bg-white px-4 py-3 text-sm"
                                >
                                  {TRANSCRIPTION_LANGUAGES.map((language) => (
                                    <option
                                      key={language.value}
                                      value={language.value}
                                    >
                                      {language.label}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  disabled={transcribing || deletingRecording}
                                  onClick={handleGenerateTranscript}
                                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                  {transcribing
                                    ? "Generating..."
                                    : transcript
                                      ? "Regenerate transcript"
                                      : "Generate transcript"}
                                </button>
                              </div>

                              <button
                                type="button"
                                disabled={deletingRecording || transcribing}
                                onClick={openDeleteRecordingModal}
                                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700"
                              >
                                Delete recording
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TRANSCRIPT */}

                  {transcript && (
                    <section className="mt-7 overflow-hidden rounded-2xl border">
                      <div className="flex flex-col gap-4 border-b bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">
                              Consultation transcript
                            </h3>

                            <Badge tone="green">Ready</Badge>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            Speaker-separated conversation with timestamps.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <ExportButton
                            label="TXT"
                            loading={downloadingFormat === "txt"}
                            onClick={handleDownloadTxt}
                          />

                          <ExportButton
                            label="DOCX"
                            loading={downloadingFormat === "docx"}
                            onClick={handleDownloadDocx}
                          />

                          <ExportButton
                            label="PDF"
                            loading={downloadingFormat === "pdf"}
                            onClick={handleDownloadPdf}
                          />

                          <ExportButton
                            label="JSON"
                            loading={downloadingFormat === "json"}
                            onClick={handleDownloadJson}
                          />
                        </div>
                      </div>

                      <div className="p-5">
                        {transcriptSegments.length > 0 ? (
                          <div className="space-y-4">
                            {transcriptSegments.map((segment, index) => (
                              <article
                                key={segment.id || index}
                                className={`rounded-2xl border p-5 ${
                                  segment.speaker_role === "doctor"
                                    ? "border-blue-100 bg-blue-50/50"
                                    : segment.speaker_role === "patient"
                                      ? "border-emerald-100 bg-emerald-50/50"
                                      : "border-slate-200 bg-slate-50"
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <Badge tone={getSpeakerTone(segment)}>
                                      {getSpeakerLabel(segment)}
                                    </Badge>

                                    <span className="text-xs text-slate-400">
                                      {segment.speaker}
                                    </span>
                                  </div>

                                  <span className="text-xs font-semibold text-slate-500">
                                    {formatTranscriptTime(segment.start_time)}

                                    {" - "}

                                    {formatTranscriptTime(segment.end_time)}
                                  </span>
                                </div>

                                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                                  {segment.text}
                                </p>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="whitespace-pre-wrap text-sm leading-7">
                              {transcript.edited_text ||
                                transcript.full_text ||
                                "Transcript is empty."}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-5 border-t pt-5 text-xs text-slate-400">
                          <span>Transcript #{transcript.id}</span>

                          {transcript.word_count !== null &&
                            transcript.word_count !== undefined && (
                              <span>{transcript.word_count} words</span>
                            )}

                          <span>{transcriptSegments.length} segments</span>

                          <span>
                            Language:{" "}
                            {getLanguageLabel(
                              transcript.language || selectedLanguage,
                            )}
                          </span>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </section>

          <div className="pb-5">
            <Link
              href="/doctor"
              className="text-sm font-semibold text-slate-500 hover:text-slate-950"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </Shell>

      {/* TOAST */}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* DELETE */}

      {deleteModalOpen && (
        <DeleteRecordingModal
          hasTranscript={Boolean(transcript?.id)}
          deleting={deletingRecording}
          onCancel={closeDeleteRecordingModal}
          onConfirm={handleDeleteRecording}
        />
      )}

      {/* COMPLETE */}

      {completeModalOpen && (
        <CompleteConsultationModal
          patientName={patient?.name}
          hasTranscript={Boolean(transcript?.id)}
          completing={completingConsultation}
          onCancel={closeCompleteConsultationModal}
          onConfirm={handleCompleteConsultation}
        />
      )}
    </>
  );
}

// ======================================================
// INFO CELL
// ======================================================

function InfoCell({ label, value }) {
  return (
    <div className="px-6 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

// ======================================================
// HISTORY CARD
// ======================================================

function HistoryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// EXPORT BUTTON
// ======================================================

function ExportButton({ label, loading, onClick }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="min-w-[70px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? "..." : label}
    </button>
  );
}

// ======================================================
// TOAST
// ======================================================

function Toast({ type, message, onClose }) {
  const success = type === "success";

  return (
    <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md sm:right-6 sm:top-6">
      <div
        className={`rounded-2xl border bg-white p-4 shadow-2xl ${
          success ? "border-emerald-200" : "border-red-200"
        }`}
      >
        <div className="flex gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black ${
              success
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {success ? "✓" : "!"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{success ? "Success" : "Error"}</p>

            <p className="mt-1 text-sm leading-5 text-slate-600">{message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-lg text-slate-400 hover:bg-slate-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// DELETE MODAL
// ======================================================

function DeleteRecordingModal({
  hasTranscript,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
        <div className="p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 font-black text-red-600">
            !
          </div>

          <h3 className="mt-5 text-xl font-bold">Delete recording?</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Recording will be removed permanently from the database and storage.
          </p>

          {hasTranscript && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              A transcript already exists for this recording.
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// COMPLETE MODAL
// ======================================================

function CompleteConsultationModal({
  patientName,
  hasTranscript,
  completing,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
        <div className="p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 font-black text-emerald-600">
            ✓
          </div>

          <h3 className="mt-5 text-xl font-bold">Complete consultation?</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {patientName
              ? `Mark ${patientName}'s consultation as completed?`
              : "Mark this consultation as completed?"}
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            <p>✓ Appointment becomes completed.</p>

            <p>✓ Consultation end time is saved.</p>

            <p>✓ Existing transcript remains available.</p>

            <p>✓ Recording controls become locked.</p>
          </div>

          {!hasTranscript && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No transcript exists yet for this consultation.
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t bg-slate-50 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={completing}
            onClick={onCancel}
            className="rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={completing}
            onClick={onConfirm}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {completing ? "Completing..." : "Complete consultation"}
          </button>
        </div>
      </div>
    </div>
  );
}
