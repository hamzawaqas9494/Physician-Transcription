import Icon from "./Icon";

export default function Header({ title, subtitle, user, loadingUser = false }) {
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
  // ROLE LABEL
  // ======================================================

  function getRoleLabel(role) {
    if (role === "doctor") {
      return "Doctor";
    }

    if (role === "compounder") {
      return "Compounder";
    }

    return role || "";
  }

  // ======================================================
  // VALUES
  // ======================================================

  const userName = user?.name || "User";

  const userRole = getRoleLabel(user?.role);

  const profilePicture = user?.profile_picture || "";

  // ======================================================
  // HEADER
  // ======================================================

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-4 px-5 md:px-8">
        {/* LEFT */}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 md:text-xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate-500 md:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 items-center gap-3">
          {/* NOTIFICATION */}

          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <Icon name="bell" size={18} />

            <span className="absolute right-[8px] top-[7px] h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          {/* DIVIDER */}

          <div className="hidden h-9 w-px bg-slate-200 sm:block" />

          {/* USER INFO */}

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                {loadingUser ? "Loading..." : userName}
              </p>

              <div className="mt-0.5 flex items-center justify-end gap-1.5">
                {!loadingUser && user && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}

                <p className="text-xs font-medium text-slate-400">
                  {loadingUser ? "" : userRole}
                </p>
              </div>
            </div>

            {/* PROFILE */}

            <div className="relative">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm">
                {loadingUser ? (
                  <div className="h-full w-full animate-pulse bg-slate-200" />
                ) : profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={`${userName} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-sm font-bold tracking-wide">
                    {getInitials(userName)}
                  </div>
                )}
              </div>

              {!loadingUser && user && (
                <span
                  title="Online"
                  className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
