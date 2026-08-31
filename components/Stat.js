export default function Stat({ label, value, delta }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
      {delta && <div className="mt-2 text-xs text-slate-400">{delta}</div>}
    </div>
  );
}
