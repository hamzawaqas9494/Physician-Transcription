// import Link from "next/link";
// import Icon from "./Icon";

// const doctorLinks = [
//   ["/doctor/dashboard", "Dashboard", "grid"],
//   ["/doctor/patients", "Patients", "users"],
//   ["/doctor/appointments", "Appointments", "calendar"],
//   ["/doctor/consultations", "Consultations", "clipboard"],
// ];
// const compounderLinks = [
//   ["/compounder/dashboard", "Dashboard", "grid"],
//   ["/compounder/patients", "Patients", "users"],
//   ["/compounder/appointments", "Appointments", "calendar"],
//   ["/compounder/queue", "Today's Queue", "clock"],
// ];

// export default function Sidebar({ role }) {
//   const links = role === "doctor" ? doctorLinks : compounderLinks;
//   return (
//     <aside className="hidden lg:flex w-[250px] shrink-0 min-h-screen bg-white border-r border-slate-200 flex-col">
//       <div className="h-20 px-6 flex items-center gap-3 border-b">
//         <div className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
//           M
//         </div>
//         <div>
//           <div className="font-bold tracking-tight">MedTranscript</div>
//           <div className="text-[10px] uppercase tracking-widest text-slate-400">
//             Clinic platform
//           </div>
//         </div>
//       </div>
//       <div className="px-4 pt-6 text-[11px] uppercase tracking-widest font-semibold text-slate-400">
//         {role} workspace
//       </div>
//       <nav className="p-3 space-y-1">
//         {links.map(([href, label, icon]) => (
//           <Link
//             key={href}
//             href={href}
//             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
//           >
//             <Icon name={icon} size={18} />
//             {label}
//           </Link>
//         ))}
//       </nav>
//       <div className="mt-auto p-4 border-t">
//         <Link
//           href="/settings"
//           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
//         >
//           <Icon name="settings" size={18} />
//           Settings
//         </Link>
//         <Link
//           href="/login"
//           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
//         >
//           <Icon name="logout" size={18} />
//           Sign out
//         </Link>
//       </div>
//     </aside>
//   );
// }

// import Link from "next/link";
// import Icon from "./Icon";

// const doctorLinks = [
//   ["/doctor/dashboard", "Dashboard", "grid"],
//   ["/doctor/patients", "Patients", "users"],
//   ["/doctor/appointments", "Appointments", "calendar"],
//   ["/doctor/consultations", "Consultations", "clipboard"],
// ];

// const compounderLinks = [
//   ["/compounder/dashboard", "Dashboard", "grid"],
//   ["/compounder/patients", "Patients", "users"],
//   ["/compounder/appointments", "Appointments", "calendar"],
//   ["/compounder/queue", "Today's Queue", "clock"],
// ];

// export default function Sidebar({ role }) {
//   const links = role === "doctor" ? doctorLinks : compounderLinks;

//   // =========================
//   // ROLE BASED SETTINGS URL
//   // =========================

//   const settingsHref =
//     role === "doctor" ? "/doctor/settings" : "/compounder/settings";

//   return (
//     <aside className="hidden lg:flex w-[250px] shrink-0 min-h-screen bg-white border-r border-slate-200 flex-col">
//       {/* =========================
//           LOGO
//       ========================== */}

//       <div className="h-20 px-6 flex items-center gap-3 border-b">
//         <div className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
//           M
//         </div>

//         <div>
//           <div className="font-bold tracking-tight">MedTranscript</div>

//           <div className="text-[10px] uppercase tracking-widest text-slate-400">
//             Clinic platform
//           </div>
//         </div>
//       </div>

//       {/* =========================
//           WORKSPACE LABEL
//       ========================== */}

//       <div className="px-4 pt-6 text-[11px] uppercase tracking-widest font-semibold text-slate-400">
//         {role} workspace
//       </div>

//       {/* =========================
//           NAV LINKS
//       ========================== */}

//       <nav className="p-3 space-y-1">
//         {links.map(([href, label, icon]) => (
//           <Link
//             key={href}
//             href={href}
//             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
//           >
//             <Icon name={icon} size={18} />

//             {label}
//           </Link>
//         ))}
//       </nav>

//       {/* =========================
//           BOTTOM LINKS
//       ========================== */}

//       <div className="mt-auto p-4 border-t">
//         {/* SETTINGS */}

//         <Link
//           href={settingsHref}
//           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
//         >
//           <Icon name="settings" size={18} />
//           Settings
//         </Link>

//         {/* SIGN OUT */}

//         <Link
//           href="/login"
//           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
//         >
//           <Icon name="logout" size={18} />
//           Sign out
//         </Link>
//       </div>
//     </aside>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Icon from "./Icon";

const doctorLinks = [
  ["/doctor/dashboard", "Dashboard", "grid"],
  ["/doctor/patients", "Patients", "users"],
  ["/doctor/appointments", "Appointments", "calendar"],
  ["/doctor/consultations", "Consultations", "clipboard"],
];

const compounderLinks = [
  ["/compounder/dashboard", "Dashboard", "grid"],
  ["/compounder/patients", "Patients", "users"],
  ["/compounder/appointments", "Appointments", "calendar"],
  ["/compounder/queue", "Today's Queue", "clock"],
];

export default function Sidebar({ role, user }) {
  const pathname = usePathname();

  // ======================================================
  // ROLE BASED LINKS
  // ======================================================

  const links = role === "doctor" ? doctorLinks : compounderLinks;

  const dashboardHref =
    role === "doctor" ? "/doctor/dashboard" : "/compounder/dashboard";

  const settingsHref =
    role === "doctor" ? "/doctor/settings" : "/compounder/settings";

  // ======================================================
  // ROLE LABEL
  // ======================================================

  const workspaceLabel =
    role === "doctor" ? "Doctor workspace" : "Compounder workspace";

  // ======================================================
  // INITIALS
  // ======================================================

  function getInitials(name) {
    if (!name || !name.trim()) {
      return "U";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }

  // ======================================================
  // ACTIVE LINK
  // ======================================================

  function isActive(href) {
    if (pathname === href) {
      return true;
    }

    // Dashboard should only match exactly.
    if (href === "/doctor/dashboard" || href === "/compounder/dashboard") {
      return false;
    }

    return pathname.startsWith(`${href}/`);
  }

  // ======================================================
  // SIDEBAR
  // ======================================================

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[272px] flex-col border-r border-slate-200 bg-white lg:flex">
      {/* =================================================
          BRAND
      ================================================= */}

      <div className="flex h-20 shrink-0 items-center border-b border-slate-200 px-5">
        <Link href={dashboardHref} className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-base font-bold text-white shadow-sm">
            M
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-slate-950">
              MedTranscript
            </p>

            <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Clinic platform
            </p>
          </div>
        </Link>
      </div>

      {/* =================================================
          WORKSPACE LABEL
      ================================================= */}

      <div className="px-5 pb-3 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {workspaceLabel}
        </p>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="flex-1 overflow-y-auto px-3 pb-5">
        <div className="space-y-1">
          {links.map(([href, label, icon]) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {/* ACTIVE INDICATOR */}

                {active && (
                  <span className="absolute -left-1 h-6 w-1 rounded-full bg-blue-500" />
                )}

                {/* ICON */}

                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-900"
                  }`}
                >
                  <Icon name={icon} size={17} />
                </span>

                {/* LABEL */}

                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* =================================================
          BOTTOM SECTION
      ================================================= */}

      <div className="shrink-0 border-t border-slate-200 p-3">
        {/* =================================================
            USER CARD
        ================================================= */}

        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {/* PROFILE */}

            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-950 text-white">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={`${user.name || "User"} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs font-bold">
                  {getInitials(user.name)}
                </div>
              )}
            </div>

            {/* USER INFORMATION */}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name || "User"}
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                <p className="truncate text-xs capitalize text-slate-400">
                  {user.role || role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Link
          href={settingsHref}
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            pathname === settingsHref
              ? "bg-slate-100 text-slate-950"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          }`}
        >
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
              pathname === settingsHref
                ? "bg-white text-slate-950"
                : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-900"
            }`}
          >
            <Icon name="settings" size={17} />
          </span>

          <span>Settings</span>
        </Link>

        {/* =================================================
            SIGN OUT
        ================================================= */}

        <Link
          href="/login"
          className="group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-white group-hover:text-red-600">
            <Icon name="logout" size={17} />
          </span>

          <span>Sign out</span>
        </Link>
      </div>
    </aside>
  );
}
