import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Topbar({
  onOpenAuth,
  search,
  setSearch,
  user,
  jobCount,
  newToday,
  collapsed,
  setCollapsed,
}) {
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-between px-7 py-3.5 bg-[#0a0f1e] border-b border-indigo-500/10 backdrop-blur-md">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="group relative w-9 h-9 flex items-center justify-center rounded-[10px]
                       border border-indigo-500/15 bg-white/[0.04]
                       hover:bg-indigo-500/10 hover:border-indigo-500/40
                       transition-all duration-300"
          >
            <div className="flex flex-col justify-center gap-[3px]">
              <span className="w-4 h-[2px] bg-slate-300 group-hover:bg-indigo-300 rounded transition" />
              <span className="w-4 h-[2px] bg-slate-300 group-hover:bg-indigo-300 rounded transition" />
              <span className="w-4 h-[2px] bg-slate-300 group-hover:bg-indigo-300 rounded transition" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-500/13 bg-white/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.7)]" />
            <span className="text-[13px] font-semibold text-slate-200">
              {jobCount.toLocaleString()}
            </span>
            <span className="text-[12px] text-slate-600">jobs</span>
          </div>

        </div>

        <div className="w-px h-4 bg-indigo-500/10" />

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-500/13 bg-white/[0.03]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
          <span className="text-[13px] font-semibold text-slate-200">
            {newToday}
          </span>
          <span className="text-[12px] text-slate-600">new today</span>
        </div>

      </div>

      <div className="flex items-center gap-2.5">

        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 transition-colors duration-200"
            style={{ color: focused ? "#818cf8" : undefined }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            type="text"
            placeholder="Search jobs..."
            className={`pl-8 pr-3 py-2 rounded-[10px] text-[13.5px] text-slate-300 placeholder:text-slate-600 bg-white/[0.04] border border-indigo-500/15 outline-none transition-all duration-300 ease-in-out caret-indigo-400 focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] ${
              focused ? "w-60" : "w-44"
            }`}
          />
        </div>

        <button className="relative w-[38px] h-[38px] rounded-[10px] border border-indigo-500/15 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/12 hover:border-indigo-500/35 transition-all">
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#0a0f1e] animate-pulse" />
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div className="w-px h-6 bg-indigo-500/15" />

        {!user ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </button>
        ) : (
          <div className="cursor-pointer group">
            {user.image ? (
              <img
                src={user.image}
                alt="User avatar"
                className="w-9 h-9 rounded-full border-[1.5px] border-indigo-500/40 group-hover:border-indigo-500/80 transition object-cover"
                onClick={() => navigate("/profile")}
              />
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                className="rounded-full border-[1.5px] border-indigo-500/40 group-hover:border-indigo-500/80 transition"
                onClick={() => navigate("/profile")}
              >
                <rect width="32" height="32" rx="16" fill="url(#grad)" />
                <circle cx="16" cy="13" r="5" fill="rgba(255,255,255,0.85)" />
                <path
                  d="M6 26c0-5.523 4.477-9 10-9s10 3.477 10 9"
                  fill="rgba(255,255,255,0.85)"
                />
                <defs>
                  <linearGradient
                    id="grad"
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                  >
                    <stop offset="0%" stopColor="#2d1f8f" />
                    <stop offset="100%" stopColor="#3b0764" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}