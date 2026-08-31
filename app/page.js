import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white grid place-items-center p-6">
      <div className="max-w-4xl w-full">
        <div className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold tracking-widest text-blue-300">
          TAILWIND ACTIVE
        </div>
        <div className="mt-6 text-sm font-semibold tracking-widest text-blue-300">
          MEDTRANSCRIPT
        </div>
        <h1 className="mt-4 text-5xl md:text-6xl font-bold tracking-tight">
          Medical consultation,
          <br />
          organized and transcribed.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          A complete UI starter for compounders and doctors: patient
          registration, appointments, consultation and the future
          audio-to-transcript workflow.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-white text-slate-950 px-5 py-3 font-semibold"
          >
            Open Login
          </Link>
          <Link
            href="/compounder/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-3"
          >
            Compounder Demo
          </Link>
          <Link
            href="/doctor/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-3"
          >
            Doctor Demo
          </Link>
        </div>
      </div>
    </main>
  );
}
