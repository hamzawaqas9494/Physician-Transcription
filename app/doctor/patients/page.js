"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Icon from "@/components/Icon";

export default function DoctorPatientsPage() {
  const router = useRouter();

  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // LOAD PATIENTS
  // =========================

  async function loadPatients(searchValue = "") {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      }

      const queryString = params.toString();

      const url = queryString
        ? `/api/doctors/patients?${queryString}`
        : "/api/doctors/patients";

      const response = await fetch(url, {
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
        setError(data.message || "Unable to load patients.");
        return;
      }

      // =========================
      // SUCCESS
      // =========================

      setPatients(data.patients || []);
    } catch (error) {
      console.error("LOAD DOCTOR PATIENTS ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadPatients();
  }, []);

  // =========================
  // SEARCH DEBOUNCE
  // =========================

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadPatients(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // =========================
  // CALCULATE AGE
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

  // =========================
  // FORMAT DATE
  // =========================

  function formatDate(date) {
    if (!date) {
      return "No previous visit";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  // =========================
  // PATIENT INITIALS
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

  return (
    <Shell
      role="doctor"
      title="Patients"
      subtitle="Search and review patient records"
    >
      {/* =========================
          SEARCH
      ========================== */}

      <div className="flex flex-wrap gap-3 justify-between mb-5">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-3 text-slate-400">
            <Icon name="search" size={18} />
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Search by name, phone or patient ID"
          />
        </div>
      </div>

      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================
          PATIENT TABLE
      ========================== */}

      <div className="bg-white border rounded-2xl overflow-hidden">
        {/* LOADING */}

        {loading ? (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          /* =========================
              EMPTY
          ========================== */

          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-500">
              <Icon name="search" size={20} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No patients found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try searching with another name, phone number or patient ID."
                : "No patient records are available."}
            </p>
          </div>
        ) : (
          /* =========================
              TABLE
          ========================== */

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-4 font-medium">Patient</th>

                  <th className="text-left p-4 font-medium">ID</th>

                  <th className="text-left p-4 font-medium">Age / Gender</th>

                  <th className="text-left p-4 font-medium">Phone</th>

                  <th className="text-left p-4 font-medium">Last visit</th>

                  <th className="p-4"></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {patients.map((patient) => {
                  const age = calculateAge(patient.date_of_birth);

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70">
                      {/* PATIENT */}

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 grid place-items-center font-semibold text-slate-700">
                            {getInitials(patient.name)}
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {patient.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Patient record
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PATIENT ID */}

                      <td className="p-4 text-slate-500">
                        {patient.patient_code}
                      </td>

                      {/* AGE / GENDER */}

                      <td className="p-4">
                        {age !== null ? `${age} years` : "Age not added"}

                        {" · "}

                        {patient.gender || "Not added"}
                      </td>

                      {/* PHONE */}

                      <td className="p-4 text-slate-500">
                        {patient.phone || "Not added"}
                      </td>

                      {/* LAST VISIT */}

                      <td className="p-4 text-slate-500">
                        {formatDate(patient.last_visit)}
                      </td>

                      {/* VIEW */}

                      <td className="p-4 text-right">
                        <Link
                          href={`/doctor/patients/${patient.id}`}
                          className="text-blue-600 font-medium hover:text-blue-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          COUNT
      ========================== */}

      {!loading && patients.length > 0 && (
        <p className="mt-4 text-xs text-slate-400">
          Showing {patients.length}{" "}
          {patients.length === 1 ? "patient" : "patients"}
        </p>
      )}
    </Shell>
  );
}
