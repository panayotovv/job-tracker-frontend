import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  onOpenAuth,
  search,
  setSearch,
  user,
  setUser,
  collapsed,
  setCollapsed,
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
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Topbar
          search={search}
          setSearch={setSearch}
          onOpenAuth={onOpenAuth}
          user={user}
          setUser={setUser}
          jobCount={stats.total}
          newToday={stats.new_today}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <Outlet />
      </main>
    </div>
  );
}