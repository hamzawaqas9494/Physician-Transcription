import Icon from "./Icon";

export default function Header({ title, subtitle, user }) {
  function getInitials(name) {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  return (
    <header className="h-20 bg-white border-b flex items-center justify-between px-5 md:px-8">
      {/* LEFT */}
      <div>
        <h1 className="text-lg font-bold">{title}</h1>

        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="w-10 h-10 rounded-xl border grid place-items-center text-slate-500">
          <Icon name="bell" size={18} />
        </button>

        {/* USER INFO */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-900">
            {user?.name || "User"}
          </p>

          <p className="text-xs capitalize text-slate-400">
            {user?.role || ""}
          </p>
        </div>

        {/* PROFILE ICON */}
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-bold">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
}
