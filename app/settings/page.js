import Shell from "@/components/Shell";
export default function Settings() {
  return (
    <Shell
      role="doctor"
      title="Settings"
      subtitle="Account and clinic preferences"
    >
      <div className="max-w-3xl bg-white border rounded-2xl p-6">
        <h3 className="font-semibold">Profile</h3>
        <div className="mt-5 grid md:grid-cols-2 gap-5">
          <label className="text-sm font-medium">
            Full name
            <input
              className="mt-2 w-full border rounded-xl px-4 py-3"
              defaultValue="Dr. Ahmed"
            />
          </label>
          <label className="text-sm font-medium">
            Email
            <input
              className="mt-2 w-full border rounded-xl px-4 py-3"
              defaultValue="doctor@clinic.com"
            />
          </label>
        </div>
        <button className="mt-6 bg-slate-950 text-white rounded-xl px-5 py-2.5 font-semibold">
          Save changes
        </button>
      </div>
    </Shell>
  );
}
