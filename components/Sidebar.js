import Link from "next/link";
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

export default function Sidebar({ role }) {
  const links = role === "doctor" ? doctorLinks : compounderLinks;
  return (
    <aside className="hidden lg:flex w-[250px] shrink-0 min-h-screen bg-white border-r border-slate-200 flex-col">
      <div className="h-20 px-6 flex items-center gap-3 border-b">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
          M
        </div>
        <div>
          <div className="font-bold tracking-tight">MedTranscript</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">
            Clinic platform
          </div>
        </div>
      </div>
      <div className="px-4 pt-6 text-[11px] uppercase tracking-widest font-semibold text-slate-400">
        {role} workspace
      </div>
      <nav className="p-3 space-y-1">
        {links.map(([href, label, icon]) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
          >
            <Icon name={icon} size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
        >
          <Icon name="settings" size={18} />
          Settings
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
        >
          <Icon name="logout" size={18} />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
