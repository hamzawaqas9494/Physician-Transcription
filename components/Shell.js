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
//   // ======================================================

//   useEffect(() => {
//     let cancelled = false;

//     async function loadCurrentUser() {
//       try {
//         setLoadingUser(true);

//         let endpoint = "";

//         // DOCTOR
//         if (role === "doctor") {
//           endpoint = "/api/doctors/settings";
//         }

//         // COMPOUNDER
//         else if (role === "compounder") {
//           endpoint = "/api/compounder/settings";
//         }

//         // INVALID ROLE
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

//         if (cancelled) {
//           return;
//         }

//         // AUTH
//         if (response.status === 401) {
//           router.replace("/login");
//           return;
//         }

//         if (response.status === 403) {
//           router.replace("/unauthorized");
//           return;
//         }

//         // ERROR
//         if (!response.ok) {
//           console.error(
//             "LOAD SHELL USER ERROR:",
//             data.message || "Unable to load current user.",
//           );

//           return;
//         }

//         // GET USER FROM RESPONSE
//         let fetchedUser = null;

//         if (role === "doctor") {
//           fetchedUser = data.doctor || null;
//         }

//         if (role === "compounder") {
//           fetchedUser = data.compounder || null;
//         }

//         // MERGE USER DATA
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
//     <div className="min-h-screen bg-slate-50">
//       {/* FIXED SIDEBAR */}

//       <Sidebar role={role} user={currentUser} />

//       {/* RIGHT SIDE CONTENT */}

//       <div className="min-h-screen lg:pl-[272px]">
//         {/* STICKY HEADER */}

//         <Header
//           title={title}
//           subtitle={subtitle}
//           user={currentUser}
//           loadingUser={loadingUser}
//         />

//         {/* PAGE CONTENT */}

//         <main className="min-h-[calc(100vh-80px)] p-5 md:p-8">{children}</main>
//       </div>
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

  const [loadingUser, setLoadingUser] = useState(!user);

  // ======================================================
  // SYNC PAGE-PROVIDED USER
  //
  // Agar kisi dashboard/page se already user object aya hai,
  // usko current user ke sath merge kar do.
  // ======================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    setCurrentUser((previous) => ({
      ...(previous || {}),
      ...user,
    }));
  }, [user]);

  // ======================================================
  // LOAD CANONICAL LOGGED-IN USER
  //
  // Ye API signed S3 profile URL return karti hai.
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        setLoadingUser(true);

        let endpoint = null;

        // ==================================================
        // DOCTOR
        // ==================================================

        if (role === "doctor") {
          endpoint = "/api/doctors/settings";
        }

        // ==================================================
        // COMPOUNDER
        // ==================================================
        else if (role === "compounder") {
          endpoint = "/api/compounder/settings";
        }

        // ==================================================
        // UNSUPPORTED ROLE
        // ==================================================
        else {
          if (!cancelled) {
            setLoadingUser(false);
          }

          return;
        }

        const response = await fetch(`${endpoint}?t=${Date.now()}`, {
          method: "GET",

          credentials: "include",

          cache: "no-store",

          headers: {
            "Cache-Control": "no-cache",
          },
        });

        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (cancelled) {
          return;
        }

        // ==================================================
        // NOT AUTHENTICATED
        // ==================================================

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        // ==================================================
        // WRONG ROLE / INACTIVE ACCOUNT
        // ==================================================

        if (response.status === 403) {
          router.replace("/unauthorized");
          return;
        }

        // ==================================================
        // API ERROR
        // ==================================================

        if (!response.ok) {
          console.error(
            "LOAD SHELL USER ERROR:",
            data?.message || "Unable to load current user.",
          );

          return;
        }

        // ==================================================
        // EXTRACT USER
        // ==================================================

        let fetchedUser = null;

        if (role === "doctor") {
          fetchedUser = data?.doctor || null;
        }

        if (role === "compounder") {
          fetchedUser = data?.compounder || null;
        }

        // ==================================================
        // MERGE USER
        //
        // Important:
        // fetchedUser.profile_picture is signed S3 URL.
        // fetchedUser.profile_picture_key is permanent key.
        // ==================================================

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
      {/* =================================================
          FIXED DESKTOP SIDEBAR
      ================================================= */}

      <Sidebar role={role} user={currentUser} loadingUser={loadingUser} />

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="min-h-screen lg:pl-[272px]">
        {/* ===============================================
            STICKY HEADER
        =============================================== */}

        <Header
          title={title}
          subtitle={subtitle}
          user={currentUser}
          loadingUser={loadingUser}
        />

        {/* ===============================================
            PAGE CONTENT
        =============================================== */}

        <main className="min-h-[calc(100vh-80px)] p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
