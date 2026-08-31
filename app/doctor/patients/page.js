import Shell from "@/components/Shell";
import Link from "next/link";
import Icon from "@/components/Icon";
export default function Patients() {
  return (
    <Shell
      role="doctor"
      title="Patients"
      subtitle="Search and review patient records"
    >
      <div className="flex flex-wrap gap-3 justify-between mb-5">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-3 text-slate-400">
            <Icon name="search" size={18} />
          </span>
          <input
            className="w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-sm"
            placeholder="Search by name, phone or patient ID"
          />
        </div>
      </div>
      <div className="bg-white border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-4">Patient</th>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Age / Gender</th>
              <th className="text-left p-4">Last visit</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {["Ali Khan", "Sara Ahmed", "Usman Ali", "Hina Shah"].map(
              (n, i) => (
                <tr key={n}>
                  <td className="p-4 font-medium">{n}</td>
                  <td className="p-4 text-slate-500">PT-10{24 + i}</td>
                  <td className="p-4">
                    {35 + i} · {i % 2 ? "Female" : "Male"}
                  </td>
                  <td className="p-4 text-slate-500">27 Aug 2026</td>
                  <td className="p-4 text-right">
                    <Link
                      href="/doctor/patients/1"
                      className="text-blue-600 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
