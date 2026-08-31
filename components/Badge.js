export default function Badge({ children, tone = "gray" }) {
  const cls = {
    gray: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  }[tone];
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
