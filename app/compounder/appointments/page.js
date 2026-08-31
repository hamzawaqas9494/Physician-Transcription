// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// import Shell from "@/components/Shell";

// export default function Appointments() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const patientFromUrl = searchParams.get("patient") || "";

//   const [patients, setPatients] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [slots, setSlots] = useState([]);

//   const [form, setForm] = useState({
//     patient_id: patientFromUrl,
//     doctor_id: "",
//     appointment_date: "",
//     appointment_time: "",
//     notes: "",
//   });

//   const [loadingPatients, setLoadingPatients] = useState(true);
//   const [loadingDoctors, setLoadingDoctors] = useState(true);
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // =========================
//   // LOAD PATIENTS
//   // =========================

//   async function loadPatients() {
//     try {
//       setLoadingPatients(true);

//       const response = await fetch("/api/patients/list", {
//         method: "GET",
//         credentials: "include",
//         cache: "no-store",
//       });

//       const data = await response.json();

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(data.message || "Unable to load patients.");
//       }

//       setPatients(data.patients || []);
//     } catch (error) {
//       console.error("LOAD PATIENTS ERROR:", error);

//       setError(error.message);
//     } finally {
//       setLoadingPatients(false);
//     }
//   }

//   // =========================
//   // LOAD DOCTORS
//   // =========================

//   async function loadDoctors() {
//     try {
//       setLoadingDoctors(true);

//       const response = await fetch("/api/doctors/active-doctors", {
//         method: "GET",
//         credentials: "include",
//         cache: "no-store",
//       });

//       const data = await response.json();

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(data.message || "Unable to load doctors.");
//       }

//       setDoctors(data.doctors || []);
//     } catch (error) {
//       console.error("LOAD DOCTORS ERROR:", error);

//       setError(error.message);
//     } finally {
//       setLoadingDoctors(false);
//     }
//   }

//   // =========================
//   // LOAD AVAILABLE SLOTS
//   // =========================

//   async function loadSlots(doctorId, date) {
//     if (!doctorId || !date) {
//       setSlots([]);
//       return;
//     }

//     try {
//       setLoadingSlots(true);
//       setError("");

//       const response = await fetch(
//         `/api/appointments/slots?doctor_id=${doctorId}&date=${date}`,
//         {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.message || "Unable to load available slots.");
//         setSlots([]);
//         return;
//       }

//       setSlots(data.slots || []);
//     } catch (error) {
//       console.error("LOAD SLOTS ERROR:", error);

//       setError("Unable to load available slots.");
//       setSlots([]);
//     } finally {
//       setLoadingSlots(false);
//     }
//   }

//   // =========================
//   // INITIAL LOAD
//   // =========================

//   useEffect(() => {
//     loadPatients();
//     loadDoctors();
//   }, []);

//   // =========================
//   // LOAD SLOTS WHEN
//   // DOCTOR OR DATE CHANGES
//   // =========================

//   useEffect(() => {
//     setForm((prev) => ({
//       ...prev,
//       appointment_time: "",
//     }));

//     loadSlots(form.doctor_id, form.appointment_date);
//   }, [form.doctor_id, form.appointment_date]);

//   // =========================
//   // FORM CHANGE
//   // =========================

//   function handleChange(e) {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   }

//   // =========================
//   // SELECT SLOT
//   // =========================

//   function selectSlot(time) {
//     setForm((prev) => ({
//       ...prev,
//       appointment_time: time,
//     }));
//   }

//   // =========================
//   // FORMAT TIME
//   // =========================

//   function formatTime(time) {
//     if (!time) return "";

//     const [hours, minutes] = time.split(":");

//     const date = new Date();

//     date.setHours(Number(hours));
//     date.setMinutes(Number(minutes));

//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // =========================
//   // SUBMIT
//   // =========================

//   async function handleSubmit(e) {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!form.patient_id) {
//       setError("Please select a patient.");
//       return;
//     }

//     if (!form.doctor_id) {
//       setError("Please select a doctor.");
//       return;
//     }

//     if (!form.appointment_date) {
//       setError("Please select an appointment date.");
//       return;
//     }

//     if (!form.appointment_time) {
//       setError("Please select an available time slot.");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const response = await fetch("/api/appointments", {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         credentials: "include",

//         body: JSON.stringify({
//           patient_id: Number(form.patient_id),
//           doctor_id: Number(form.doctor_id),
//           appointment_date: form.appointment_date,
//           appointment_time: form.appointment_time,
//           notes: form.notes.trim() || null,
//         }),
//       });

//       const data = await response.json();

//       if (response.status === 401) {
//         router.replace("/login");
//         return;
//       }

//       if (response.status === 403) {
//         router.replace("/unauthorized");
//         return;
//       }

//       if (!response.ok) {
//         setError(data.message || "Unable to book appointment.");

//         return;
//       }

//       setSuccess(
//         `Appointment booked successfully. Token: ${
//           data.appointment.token_number || "Generated"
//         }`,
//       );

//       setForm((prev) => ({
//         ...prev,
//         appointment_time: "",
//         notes: "",
//       }));

//       await loadSlots(form.doctor_id, form.appointment_date);

//       setTimeout(() => {
//         router.push(`/compounder/patients/${form.patient_id}`);

//         router.refresh();
//       }, 1200);
//     } catch (error) {
//       console.error("BOOK APPOINTMENT ERROR:", error);

//       setError("Unable to connect to the server.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <Shell
//       role="compounder"
//       title="Appointments"
//       subtitle="Book a consultation slot"
//     >
//       <div className="max-w-4xl bg-white border rounded-2xl p-6">
//         {/* ERROR */}

//         {error && (
//           <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         {/* SUCCESS */}

//         {success && (
//           <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
//             {success}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="grid md:grid-cols-2 gap-5">
//             {/* PATIENT */}

//             <label className="text-sm font-medium">
//               Patient
//               <select
//                 name="patient_id"
//                 value={form.patient_id}
//                 onChange={handleChange}
//                 disabled={loadingPatients || submitting}
//                 className="mt-2 w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-200"
//               >
//                 <option value="">
//                   {loadingPatients ? "Loading patients..." : "Select patient"}
//                 </option>

//                 {patients.map((patient) => (
//                   <option key={patient.id} value={patient.id}>
//                     {patient.name} · {patient.patient_code}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             {/* DOCTOR */}

//             <label className="text-sm font-medium">
//               Doctor
//               <select
//                 name="doctor_id"
//                 value={form.doctor_id}
//                 onChange={handleChange}
//                 disabled={loadingDoctors || submitting}
//                 className="mt-2 w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-200"
//               >
//                 <option value="">
//                   {loadingDoctors ? "Loading doctors..." : "Select doctor"}
//                 </option>

//                 {doctors.map((doctor) => (
//                   <option key={doctor.id} value={doctor.id}>
//                     {doctor.name}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             {/* DATE */}

//             <label className="text-sm font-medium">
//               Date
//               <input
//                 name="appointment_date"
//                 type="date"
//                 value={form.appointment_date}
//                 onChange={handleChange}
//                 disabled={submitting}
//                 min={new Date().toISOString().split("T")[0]}
//                 className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
//               />
//             </label>

//             {/* SELECTED TIME */}

//             <label className="text-sm font-medium">
//               Selected time
//               <input
//                 value={
//                   form.appointment_time ? formatTime(form.appointment_time) : ""
//                 }
//                 readOnly
//                 placeholder="Select a slot below"
//                 className="mt-2 w-full border rounded-xl px-4 py-3 bg-slate-50"
//               />
//             </label>
//           </div>

//           {/* =========================
//               AVAILABLE SLOTS
//           ========================== */}

//           <div className="mt-7 rounded-xl bg-slate-50 p-5">
//             <div className="font-semibold">Available slots</div>

//             {!form.doctor_id || !form.appointment_date ? (
//               <p className="mt-2 text-sm text-slate-500">
//                 Select a doctor and date to view available consultation slots.
//               </p>
//             ) : loadingSlots ? (
//               <p className="mt-3 text-sm text-slate-500">
//                 Loading available slots...
//               </p>
//             ) : slots.length === 0 ? (
//               <p className="mt-3 text-sm text-slate-500">
//                 No available slots for this doctor on the selected date.
//               </p>
//             ) : (
//               <div className="mt-3 flex flex-wrap gap-2">
//                 {slots.map((slot) => (
//                   <button
//                     key={slot.time}
//                     type="button"
//                     onClick={() => selectSlot(slot.time)}
//                     disabled={!slot.available}
//                     className={`rounded-lg border px-3 py-2 text-sm transition ${
//                       form.appointment_time === slot.time
//                         ? "bg-slate-950 text-white border-slate-950"
//                         : slot.available
//                           ? "bg-white hover:bg-slate-100"
//                           : "bg-slate-100 text-slate-400 cursor-not-allowed"
//                     }`}
//                   >
//                     {formatTime(slot.time)}

//                     {!slot.available && " — Booked"}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* NOTES */}

//           <label className="mt-6 block text-sm font-medium">
//             Notes
//             <textarea
//               name="notes"
//               value={form.notes}
//               onChange={handleChange}
//               disabled={submitting}
//               className="mt-2 w-full border rounded-xl px-4 py-3 min-h-24 outline-none focus:ring-2 focus:ring-slate-200"
//               placeholder="Optional appointment notes..."
//             />
//           </label>

//           {/* ACTIONS */}

//           <div className="mt-7 flex flex-wrap gap-3">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               disabled={submitting}
//               className="border rounded-xl px-5 py-3 font-medium"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={
//                 submitting ||
//                 !form.patient_id ||
//                 !form.doctor_id ||
//                 !form.appointment_date ||
//                 !form.appointment_time
//               }
//               className="bg-slate-950 text-white rounded-xl px-5 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {submitting ? "Booking appointment..." : "Confirm appointment"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </Shell>
//   );
// }

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Shell from "@/components/Shell";

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientFromUrl = searchParams.get("patient") || "";

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [form, setForm] = useState({
    patient_id: patientFromUrl,
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // LOAD PATIENTS
  // =========================

  async function loadPatients() {
    try {
      setLoadingPatients(true);

      const response = await fetch("/api/patients/list", {
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
        throw new Error(data.message || "Unable to load patients.");
      }

      setPatients(data.patients || []);
    } catch (error) {
      console.error("LOAD PATIENTS ERROR:", error);
      setError(error.message);
    } finally {
      setLoadingPatients(false);
    }
  }

  // =========================
  // LOAD DOCTORS
  // =========================

  async function loadDoctors() {
    try {
      setLoadingDoctors(true);

      const response = await fetch("/api/doctors/active-doctors", {
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
        throw new Error(data.message || "Unable to load doctors.");
      }

      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("LOAD DOCTORS ERROR:", error);
      setError(error.message);
    } finally {
      setLoadingDoctors(false);
    }
  }

  // =========================
  // LOAD AVAILABLE SLOTS
  // =========================

  async function loadSlots(doctorId, date) {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");

      const response = await fetch(
        `/api/appointments/slots?doctor_id=${doctorId}&date=${date}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load available slots.");
        setSlots([]);
        return;
      }

      setSlots(data.slots || []);
    } catch (error) {
      console.error("LOAD SLOTS ERROR:", error);
      setError("Unable to load available slots.");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  // =========================
  // INITIAL LOAD hamza
  // =========================

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  // =========================
  // LOAD SLOTS WHEN
  // DOCTOR OR DATE CHANGES
  // =========================

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      appointment_time: "",
    }));

    loadSlots(form.doctor_id, form.appointment_date);
  }, [form.doctor_id, form.appointment_date]);

  // =========================
  // FORM CHANGE
  // =========================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================
  // SELECT SLOT
  // =========================

  function selectSlot(time) {
    setForm((prev) => ({
      ...prev,
      appointment_time: time,
    }));
  }

  // =========================
  // FORMAT TIME
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

  // =========================
  // SUBMIT
  // =========================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.patient_id) {
      setError("Please select a patient.");
      return;
    }

    if (!form.doctor_id) {
      setError("Please select a doctor.");
      return;
    }

    if (!form.appointment_date) {
      setError("Please select an appointment date.");
      return;
    }

    if (!form.appointment_time) {
      setError("Please select an available time slot.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          patient_id: Number(form.patient_id),
          doctor_id: Number(form.doctor_id),
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          notes: form.notes.trim() || null,
        }),
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
        setError(data.message || "Unable to book appointment.");
        return;
      }

      setSuccess(
        `Appointment booked successfully. Token: ${
          data.appointment.token_number || "Generated"
        }`,
      );

      setForm((prev) => ({
        ...prev,
        appointment_time: "",
        notes: "",
      }));

      await loadSlots(form.doctor_id, form.appointment_date);

      setTimeout(() => {
        router.push(`/compounder/patients/${form.patient_id}`);
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("BOOK APPOINTMENT ERROR:", error);
      setError("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell
      role="compounder"
      title="Appointments"
      subtitle="Book a consultation slot"
    >
      <div className="max-w-4xl bg-white border rounded-2xl p-6">
        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-5">
            {/* PATIENT */}
            <label className="text-sm font-medium">
              Patient
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                disabled={loadingPatients || submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  {loadingPatients ? "Loading patients..." : "Select patient"}
                </option>

                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} · {patient.patient_code}
                  </option>
                ))}
              </select>
            </label>

            {/* DOCTOR */}
            <label className="text-sm font-medium">
              Doctor
              <select
                name="doctor_id"
                value={form.doctor_id}
                onChange={handleChange}
                disabled={loadingDoctors || submitting}
                className="mt-2 w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  {loadingDoctors ? "Loading doctors..." : "Select doctor"}
                </option>

                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </label>

            {/* DATE */}
            <label className="text-sm font-medium">
              Date
              <input
                name="appointment_date"
                type="date"
                value={form.appointment_date}
                onChange={handleChange}
                disabled={submitting}
                min={new Date().toISOString().split("T")[0]}
                className="mt-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            {/* SELECTED TIME */}
            <label className="text-sm font-medium">
              Selected time
              <input
                value={
                  form.appointment_time ? formatTime(form.appointment_time) : ""
                }
                readOnly
                placeholder="Select a slot below"
                className="mt-2 w-full border rounded-xl px-4 py-3 bg-slate-50"
              />
            </label>
          </div>

          {/* AVAILABLE SLOTS */}
          <div className="mt-7 rounded-xl bg-slate-50 p-5">
            <div className="font-semibold">Available slots</div>

            {!form.doctor_id || !form.appointment_date ? (
              <p className="mt-2 text-sm text-slate-500">
                Select a doctor and date to view available consultation slots.
              </p>
            ) : loadingSlots ? (
              <p className="mt-3 text-sm text-slate-500">
                Loading available slots...
              </p>
            ) : slots.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No available slots for this doctor on the selected date.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => selectSlot(slot.time)}
                    disabled={!slot.available}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      form.appointment_time === slot.time
                        ? "bg-slate-950 text-white border-slate-950"
                        : slot.available
                          ? "bg-white hover:bg-slate-100"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {formatTime(slot.time)}
                    {!slot.available && " — Booked"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NOTES */}
          <label className="mt-6 block text-sm font-medium">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              disabled={submitting}
              className="mt-2 w-full border rounded-xl px-4 py-3 min-h-24 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Optional appointment notes..."
            />
          </label>

          {/* ACTIONS */}
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="border rounded-xl px-5 py-3 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !form.patient_id ||
                !form.doctor_id ||
                !form.appointment_date ||
                !form.appointment_time
              }
              className="bg-slate-950 text-white rounded-xl px-5 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Booking appointment..." : "Confirm appointment"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

// =========================
// MAIN PAGE (Suspense wrap)
// =========================

export default function Appointments() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
      }
    >
      <AppointmentsContent />
    </Suspense>
  );
}
