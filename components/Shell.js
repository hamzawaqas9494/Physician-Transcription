import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Shell({ role, title, subtitle, user, children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar role={role} user={user} />

      <main className="flex-1 min-w-0">
        <Header title={title} subtitle={subtitle} user={user} />

        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
