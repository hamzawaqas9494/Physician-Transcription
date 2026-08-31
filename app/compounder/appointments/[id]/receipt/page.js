"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AppointmentReceiptPage() {
  const params = useParams();
  const router = useRouter();

  const appointmentId = params.id;

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReceipt() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/appointments/${appointmentId}/receipt`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
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
        setError(data.message || "Unable to load receipt.");
        return;
      }

      setReceipt(data.receipt);
    } catch (error) {
      console.error("LOAD RECEIPT ERROR:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (appointmentId) {
      loadReceipt();
    }
  }, [appointmentId]);

  function formatDate(date) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatTime(time) {
    if (!time) return "—";

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

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 grid place-items-center">
        <div className="text-sm text-slate-500">
          Loading receipt...
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-slate-100 grid place-items-center p-6">
        <div className="bg-white border rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold">
            Receipt unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Unable to load receipt."}
          </p>

          <button
            onClick={() => router.back()}
            className="mt-5 rounded-xl bg-slate-950 text-white px-4 py-2.5 text-sm font-semibold"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .receipt-wrapper {
            padding: 0 !important;
            background: white !important;
          }

          .receipt-card {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <main className="receipt-wrapper min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="no-print max-w-3xl mx-auto mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Print receipt
          </button>
        </div>

        <div className="receipt-card max-w-3xl mx-auto bg-white border rounded-2xl overflow-hidden shadow-sm">
          {/* HEADER */}

          <div className="p-7 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 text-white grid place-items-center font-bold">
                    M
                  </div>

                  <div>
                    <h1 className="text-xl font-bold">
                      MedTranscript Clinic
                    </h1>

                    <p className="text-xs text-slate-500 mt-1">
                      Appointment Receipt
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-400">
                  Receipt #
                </p>

                <p className="mt-1 font-semibold">
                  APT-{receipt.appointment_id}
                </p>
              </div>
            </div>
          </div>

          {/* PATIENT */}

          <div className="p-7 border-b">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Patient Information
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">
                  Patient Name
                </p>

                <p className="mt-1 font-semibold">
                  {receipt.patient_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Patient ID
                </p>

                <p className="mt-1 font-semibold">
                  {receipt.patient_code}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Phone
                </p>

                <p className="mt-1 font-semibold">
                  {receipt.patient_phone || "Not added"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Gender
                </p>

                <p className="mt-1 font-semibold">
                  {receipt.patient_gender || "Not added"}
                </p>
              </div>
            </div>
          </div>

          {/* APPOINTMENT */}

          <div className="p-7 border-b">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Appointment Information
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">
                  Doctor
                </p>

                <p className="mt-1 font-semibold">
                  {receipt.doctor_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Token Number
                </p>

                <p className="mt-1 text-xl font-bold">
                  {receipt.token_number || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Appointment Date
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(receipt.appointment_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Appointment Time
                </p>

                <p className="mt-1 font-semibold">
                  {formatTime(receipt.appointment_time)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Status
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {receipt.status?.replaceAll("_", " ")}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Booked By
                </p>

                <p className="mt-1 font-semibold">
                  {receipt.created_by_name || "Clinic staff"}
                </p>
              </div>
            </div>
          </div>

          {/* NOTES */}

          {receipt.notes && (
            <div className="p-7 border-b">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Appointment Notes
              </p>

              <p className="mt-3 text-sm text-slate-700">
                {receipt.notes}
              </p>
            </div>
          )}

          {/* FOOTER */}

          <div className="p-7">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-medium">
                Please arrive on time and keep this receipt for reference.
              </p>

              <p className="mt-1 text-xs text-slate-500">
                This receipt contains appointment information only and does not
                include medical history or clinical notes.
              </p>
            </div>

            <div className="mt-7 flex justify-between gap-4 text-xs text-slate-400">
              <span>
                Appointment #{receipt.appointment_id}
              </span>

              <span>
                MedTranscript Clinic
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}