import { useEffect, useRef, useState } from "react";

const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#fb7185"];

function timeAgo(dt) {
  const diff = Math.floor((Date.now() - new Date(dt)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };
}

async function apiFetch(path) {
  const res = await fetch(`http://127.0.0.1:8000${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed: ${path}`);
  return res.json();
}

export default function Profile({ user, onOpenEditProfile }) {
  const [stats, setStats] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const donutRef = useRef(null);

  useEffect(() => {
    apiFetch("/users/applications/stats").then(setStats).catch(console.error);
    apiFetch("/users/applications/weekly").then(setWeeklyData).catch(console.error);
    apiFetch("/users/applications/interviews").then(setInterviews).catch(console.error);
  }, []);

  const applications = weeklyData.map(w => w.count ?? 0);
  const weeks = weeklyData.map((w, i) => w.week ?? `Wk ${i + 1}`);
  const maxBar = Math.max(1, ...applications);

  const pipeline = [
    { label: "Interview", count: stats.interviews || 0, color: "#34d399" },
    { label: "Offer",     count: stats.offer      || 0, color: "#fbbf24" },
    { label: "Rejected",  count: stats.rejected   || 0, color: "#fb7185" },
  ];
  const pipelineTotal = pipeline.reduce((a, b) => a + b.count, 0);

  useEffect(() => {
    const canvas = donutRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 90;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = 36, inner = 24;
    const data = [stats.applications, stats.interviews, stats.offer, stats.rejected].map(v => v || 0);
    const sum = data.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#1e2535";
      ctx.fill();
    } else {
      let start = -Math.PI / 2;
      data.forEach((val, i) => {
        const angle = (val / sum) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, start + angle);
        ctx.closePath();
        ctx.fillStyle = COLORS[i];
        ctx.fill();
        start += angle;
      });
    }
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sum || "—", cx, cy);
  }, [stats]);

  return (
    <div className="min-h-full bg-[#0a0f1e] py-6">
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-4">

        <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl overflow-hidden">
          <div className="flex items-start gap-5 p-6 pb-4">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 flex-shrink-0 overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <rect width="64" height="64" fill="#1e1b4b" />
                  <circle cx="32" cy="26" r="11" fill="rgba(255,255,255,0.82)" />
                  <path d="M8 56c0-11.6 10.7-20 24-20s24 8.4 24 20" fill="rgba(255,255,255,0.82)" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-bold text-slate-200 tracking-tight">
                {user?.full_name || user?.username || "—"}
              </div>
              <div className="text-[12px] text-slate-600 mt-0.5">@{user?.username || "—"}</div>
              {user?.bio && <div className="text-[13px] text-slate-500 mt-2 leading-relaxed">{user.bio}</div>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onOpenEditProfile}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/18 hover:text-indigo-300 text-[12px] transition-all cursor-pointer"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit profile
              </button>
              <button className="w-[32px] h-[32px] flex items-center justify-center rounded-lg border border-indigo-500/12 text-slate-600 hover:text-slate-400 hover:bg-white/[0.03] transition-all cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 pb-4 flex-wrap">
            {user?.location && (
              <div className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {user.location}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Member since {new Date(user?.created_at || "2024-01-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </div>
          </div>

          <div className="border-t border-indigo-500/8 grid grid-cols-4">
            {[
              { num: stats.applications, label: "Applied Total", color: "text-indigo-400" },
              { num: stats.interviews,   label: "Interviews",    color: "text-emerald-400" },
              { num: stats.offer,        label: "Offers",        color: "text-amber-400" },
              { num: stats.rejected,     label: "Rejected",      color: "text-rose-400" },
            ].map((s, i) => (
              <div key={i} className={`py-4 text-center ${i < 3 ? "border-r border-indigo-500/7" : ""}`}>
                <div className={`text-[20px] font-bold ${s.color}`}>{s.num ?? "—"}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-4">
          <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl p-5">
            <p className="text-[10.5px] text-slate-600 uppercase tracking-widest font-medium mb-4">Applications · last 6 weeks</p>
            {applications.length === 0 ? (
              <div className="h-[100px] flex items-center justify-center text-[11px] text-slate-700">Loading…</div>
            ) : (
              <div className="flex items-end gap-2 h-[100px]">
                {applications.map((val, i) => {
                  const pct = (val / maxBar) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex items-end" style={{ height: "80px" }}>
                        <div
                          className="w-full rounded-t-md bg-indigo-500/30 border-t border-indigo-500/50 hover:bg-indigo-500/50 transition-all cursor-default"
                          style={{ height: pct === 0 ? "3px" : `${pct}%` }}
                          title={`${val} application${val !== 1 ? "s" : ""}`}
                        />
                      </div>
                      <span className="text-[9.5px] text-slate-600">{weeks[i]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl p-5">
            <p className="text-[10.5px] text-slate-600 uppercase tracking-widest font-medium mb-4">Pipeline status</p>
            <div className="flex items-center gap-4">
              <canvas ref={donutRef} style={{ width: 90, height: 90, flexShrink: 0 }} />
              <div className="flex flex-col gap-2">
                {pipeline.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11.5px] text-slate-500">
                    <span className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ background: p.color }} />
                    <span>{p.label}</span>
                    <span className="text-slate-600 ml-auto pl-2">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex rounded-full overflow-hidden h-1.5">
              {pipelineTotal === 0
                ? <div className="w-full h-full bg-indigo-500/10 rounded-full" />
                : pipeline.map((p, i) => (
                    <div key={i} style={{ width: `${(p.count / pipelineTotal) * 100}%`, background: p.color }} />
                  ))
              }
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
            <p className="text-[10.5px] text-slate-600 uppercase tracking-widest font-medium">Upcoming interviews</p>
            {interviews.length > 0 && (
              <span className="text-[10.5px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/18 text-emerald-400">
                {interviews.length} scheduled
              </span>
            )}
          </div>
          <div className="flex flex-col border-t border-indigo-500/8">
            {interviews.length === 0 ? (
              <div className="px-5 py-6 text-[11px] text-slate-700 text-center">No upcoming interviews</div>
            ) : interviews.map((iv, i, arr) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${i < arr.length - 1 ? "border-b border-indigo-500/6" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/12 flex items-center justify-center font-bold text-[13px] text-indigo-400 flex-shrink-0">
                    {iv.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-slate-300">{iv.role}</div>
                    <div className="text-[11.5px] text-slate-600 mt-0.5">{iv.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.03] border border-indigo-500/10 text-slate-500">{iv.type}</span>
                  <div className="text-right">
                    <div className="text-[12px] font-medium text-indigo-400">{iv.date}</div>
                    <div className="text-[11px] text-slate-600">{iv.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}