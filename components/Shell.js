// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import Sidebar from "./Sidebar";
// import Header from "./Header";

// export default function Shell({ role, title, subtitle, user, children }) {
//   const router = useRouter();

//   // ======================================================
//   // CURRENT USER
//   // ======================================================

//   const [currentUser, setCurrentUser] = useState(user || null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   // ======================================================
//   // KEEP PAGE-PROVIDED USER DATA
//   // ======================================================

//   useEffect(() => {
//     if (user) {
//       setCurrentUser((previous) => ({
//         ...(previous || {}),
//         ...user,
//       }));
//     }
//   }, [user]);

//   // ======================================================
//   // LOAD CURRENT LOGGED-IN USER
//   // Always fetch canonical profile information
//   // ======================================================

//   useEffect(() => {
//     let cancelled = false;

//     async function loadCurrentUser() {
//       try {
//         setLoadingUser(true);

//         let endpoint = "";

//         // =========================
//         // DOCTOR
//         // =========================

//         if (role === "doctor") {
//           endpoint = "/api/doctors/settings";
//         }

//         // =========================
//         // COMPOUNDER
//         // =========================
//         else if (role === "compounder") {
//           endpoint = "/api/compounder/settings";
//         }

//         // =========================
//         // INVALID ROLE
//         // =========================
//         else {
//           setLoadingUser(false);
//           return;
//         }

//         const response = await fetch(endpoint, {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         });

//         const data = await response.json();
// console.log(data, "MMMM")
//         if (cancelled) {
//           return;
//         }

//         // =========================
//         // AUTH
//         // =========================

//         if (response.status === 401) {
//           router.replace("/login");
//           return;
//         }

//         if (response.status === 403) {
//           router.replace("/unauthorized");
//           return;
//         }

//         // =========================
//         // ERROR
//         // =========================

//         if (!response.ok) {
//           console.error(
//             "LOAD SHELL USER ERROR:",
//             data.message || "Unable to load current user.",
//           );

//           return;
//         }

//         // =========================
//         // GET USER FROM RESPONSE
//         // =========================

//         let fetchedUser = null;

//         if (role === "doctor") {
//           fetchedUser = data.doctor || null;
//         }

//         if (role === "compounder") {
//           fetchedUser = data.compounder || null;
//         }

//         // =========================
//         // MERGE USER DATA
//         // =========================

//         if (fetchedUser) {
//           setCurrentUser((previous) => ({
//             ...(previous || {}),
//             ...fetchedUser,
//           }));
//         }
//       } catch (error) {
//         if (!cancelled) {
//           console.error("LOAD SHELL USER ERROR:", error);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoadingUser(false);
//         }
//       }
//     }

//     loadCurrentUser();

//     return () => {
//       cancelled = true;
//     };
//   }, [role, router]);

//   // ======================================================
//   // PAGE
//   // ======================================================

//   return (
//     <div className="min-h-screen flex bg-slate-50">
//       <Sidebar role={role} user={currentUser} />

//       <main className="flex-1 min-w-0">
//         <Header
//           title={title}
//           subtitle={subtitle}
//           user={currentUser}
//           loadingUser={loadingUser}
//         />

//         <div className="p-5 md:p-8">{children}</div>
//       </main>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Shell({ role, title, subtitle, user, children }) {
  const router = useRouter();

  // ======================================================
  // CURRENT USER
  // ======================================================

  const [currentUser, setCurrentUser] = useState(user || null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ======================================================
  // KEEP PAGE-PROVIDED USER DATA
  // ======================================================

  useEffect(() => {
    if (user) {
      setCurrentUser((previous) => ({
        ...(previous || {}),
        ...user,
      }));
    }
  }, [user]);

  // ======================================================
  // LOAD CURRENT LOGGED-IN USER
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        setLoadingUser(true);

        let endpoint = "";

        // DOCTOR
        if (role === "doctor") {
          endpoint = "/api/doctors/settings";
        }

        // COMPOUNDER
        else if (role === "compounder") {
          endpoint = "/api/compounder/settings";
        }

        // INVALID ROLE
        else {
          setLoadingUser(false);
          return;
        }

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        // AUTH
        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          router.replace("/unauthorized");
          return;
        }

        // ERROR
        if (!response.ok) {
          console.error(
            "LOAD SHELL USER ERROR:",
            data.message || "Unable to load current user.",
          );

          return;
        }

        // GET USER FROM RESPONSE
        let fetchedUser = null;

        if (role === "doctor") {
          fetchedUser = data.doctor || null;
        }

        if (role === "compounder") {
          fetchedUser = data.compounder || null;
        }

        // MERGE USER DATA
        if (fetchedUser) {
          setCurrentUser((previous) => ({
            ...(previous || {}),
            ...fetchedUser,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("LOAD SHELL USER ERROR:", error);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [role, router]);

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* FIXED SIDEBAR */}

      <Sidebar role={role} user={currentUser} />

      {/* RIGHT SIDE CONTENT */}

      <div className="min-h-screen lg:pl-[272px]">
        {/* STICKY HEADER */}

        <Header
          title={title}
          subtitle={subtitle}
          user={currentUser}
          loadingUser={loadingUser}
        />

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-80px)] p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
