"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Shell from "@/components/Shell";
import Icon from "@/components/Icon";

export default function Patients() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search")?.trim() || "";

  const [search, setSearch] = useState(currentSearch);

  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // GET PATIENTS FROM API
  // =========================

  async function getPatients(searchValue = "") {
    try {
      setLoading(true);
      setError("");

      let url = "/api/patients/list";

      if (searchValue.trim()) {
        url += `?search=${encodeURIComponent(searchValue.trim())}`;
      }

      const response = await fetch(url, {
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
        setError(data.message || "Unable to load patients.");
        return;
      }

      setPatients(data.patients || []);
    } catch (error) {
      console.error("GET PATIENTS ERROR:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD PATIENTS
  // =========================

  useEffect(() => {
    setSearch(currentSearch);

    getPatients(currentSearch);
  }, [currentSearch]);

  // =========================
  // SEARCH
  // =========================

  function handleSearch(e) {
    e.preventDefault();

    const value = search.trim();

    if (value) {
      router.push(`/compounder/patients?search=${encodeURIComponent(value)}`);
    } else {
      router.push("/compounder/patients");
    }
  }

  function clearSearch() {
    setSearch("");

    router.push("/compounder/patients");
  }

  // =========================
  // DATE FORMAT
  // =========================

  function formatDate(date) {
    if (!date) {
      return "No visit yet";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
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

  return (
    <Shell
      role="compounder"
      title="Patients"
      subtitle="Register and manage patient records"
    >
      {/* =========================
          TOP ACTIONS
      ========================== */}

      <div className="flex flex-wrap gap-3 justify-between mb-5">
        {/* SEARCH */}

        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <span className="absolute left-3 top-3 text-slate-400">
            <Icon name="search" size={18} />
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border rounded-xl pl-10 pr-24 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Search by name, phone or patient ID..."
          />

          <button
            type="submit"
            className="absolute right-1.5 top-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-medium text-white"
          >
            Search
          </button>
        </form>

        {/* ADD PATIENT */}

        <Link
          href="/compounder/patients/new"
          className="bg-slate-950 text-white rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          + Add patient
        </Link>
      </div>

      {/* =========================
          SEARCH INFO
      ========================== */}

      {currentSearch && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Search results for{" "}
            <span className="font-medium text-slate-900">
              "{currentSearch}"
            </span>
          </p>

          <button
            type="button"
            onClick={clearSearch}
            className="text-sm text-blue-600"
          >
            Clear search
          </button>
        </div>
      )}

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
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          // =========================
          // EMPTY STATE
          // =========================

          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-500">
              <Icon name="users" size={20} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {currentSearch ? "No patients found" : "No patients registered"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {currentSearch
                ? "Try another name, phone number or patient ID."
                : "Register your first patient to get started."}
            </p>

            {!currentSearch && (
              <Link
                href="/compounder/patients/new"
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                + Add patient
              </Link>
            )}
          </div>
        ) : (
          // =========================
          // REAL DATA
          // =========================

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left">Patient</th>

                  <th className="p-4 text-left">Patient ID</th>

                  <th className="p-4 text-left">Phone</th>

                  <th className="p-4 text-left">Gender</th>

                  <th className="p-4 text-left">Last visit</th>

                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    {/* PATIENT */}

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center font-semibold text-slate-700">
                          {getInitials(patient.name)}
                        </div>

                        <div>
                          <div className="font-medium text-slate-900">
                            {patient.name}
                          </div>

                          <div className="text-xs text-slate-400 mt-0.5">
                            Registered {formatDate(patient.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PATIENT CODE */}

                    <td className="p-4 font-medium">{patient.patient_code}</td>

                    {/* PHONE */}

                    <td className="p-4 text-slate-500">
                      {patient.phone || "Not added"}
                    </td>

                    {/* GENDER */}

                    <td className="p-4 text-slate-500">
                      {patient.gender || "Not added"}
                    </td>

                    {/* LAST VISIT */}

                    <td className="p-4 text-slate-500">
                      {formatDate(patient.last_visit)}
                    </td>

                    {/* ACTION */}

                    <td className="p-4 text-right">
                      <Link
                        href={`/compounder/patients/${patient.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View patient
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          TOTAL COUNT
      ========================== */}

      {!loading && patients.length > 0 && (
        <div className="mt-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-900">{patients.length}</span>{" "}
          patient
          {patients.length !== 1 ? "s" : ""}
        </div>
      )}
    </Shell>
  );
}
