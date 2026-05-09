import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  onOpenAuth,
  search,
  setSearch,
  user,
  setUser
}) {
  const [stats, setStats] = useState({ total: 0, new_today: 0 });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/jobs/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar
        onOpenAuth={onOpenAuth}
        user={user}
        setUser={setUser}
      />

      <main className="flex-1 ml-60 overflow-y-auto">
        <Topbar
          search={search}
          setSearch={setSearch}
          onOpenAuth={onOpenAuth}
          user={user}
          setUser={setUser}
          jobCount={stats.total}
          newToday={stats.new_today}
        />

        <Outlet />
      </main>
    </div>
  );
}