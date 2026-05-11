import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

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

function getLast7DayLabels() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(days[d.getDay()]);
  }
  return labels;
}

function PipelineStepTracker({ applied, interviews, offers, rejected }) {
  const stages = [
    { label: "Applied",   count: applied,    color: "#818cf8", dimColor: "rgba(129,140,248,0.15)" },
    { label: "Interview", count: interviews, color: "#34d399", dimColor: "rgba(52,211,153,0.15)"  },
    { label: "Offer",     count: offers,     color: "#fbbf24", dimColor: "rgba(251,191,36,0.15)"  },
  ];

  let activeIdx = -1;
  stages.forEach((s, i) => { if (s.count > 0) activeIdx = i; });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center w-full">
        {stages.map((s, i) => {
          const isActive = s.count > 0;
          const isCurrent = i === activeIdx;
          const isPast = i < activeIdx;

          return (
            <div key={i} className="flex items-center" style={{ flex: i < stages.length - 1 ? "1" : "0 0 auto" }}>
              <div className="flex flex-col items-center gap-2" style={{ minWidth: 68 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: isActive ? s.dimColor : "rgba(255,255,255,0.03)",
                    border: `2px solid ${isActive ? s.color : "rgba(255,255,255,0.07)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isCurrent ? `0 0 0 4px ${s.dimColor}` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: isActive ? s.color : "rgba(255,255,255,0.15)",
                      lineHeight: 1,
                    }}
                  >
                    {s.count}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: isActive ? s.color : "rgba(255,255,255,0.2)",
                    fontWeight: isPast || isCurrent ? 500 : 400,
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  {s.label}
                </span>
              </div>

              {i < stages.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    marginBottom: 22,
                    background: i < activeIdx
                      ? `linear-gradient(90deg, ${stages[i].color}, ${stages[i + 1].color})`
                      : "rgba(255,255,255,0.06)",
                    transition: "background 0.3s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {rejected > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 10,
            background: "rgba(251,113,133,0.07)",
            border: "1px solid rgba(251,113,133,0.15)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Rejected</span>
          <span style={{ fontSize: 13, color: "#fb7185", fontWeight: 600, marginLeft: "auto" }}>{rejected}</span>
        </div>
      )}
    </div>
  );
}

export default function Profile({ user, onOpenEditProfile }) {
  const [stats, setStats] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    apiFetch("/users/applications/stats").then(setStats).catch(console.error);
    apiFetch("/users/applications/weekly").then(setWeeklyData).catch(console.error);
    apiFetch("/users/applications/interviews").then(setInterviews).catch(console.error);
  }, []);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/users/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAvatarPreview(data.image);
    } catch (err) {
      console.error(err);
    }
  }

  const dayLabels = getLast7DayLabels();
  const applications =
    weeklyData.length > 0
      ? weeklyData.slice(-7).map((w) => w.count ?? 0)
      : Array(7).fill(0);
  while (applications.length < 7) applications.unshift(0);
  const chartData = applications.slice(-7);

  const pipelineApplied    = stats.applications || 0;
  const pipelineInterviews = stats.interviews   || 0;
  const pipelineOffers     = stats.offer        || 0;
  const pipelineRejected   = stats.rejected     || 0;

  const lineChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: "Applications",
        data: chartData,
        borderColor: "#818cf8",
        borderWidth: 2,
        pointBackgroundColor: "#818cf8",
        pointBorderColor: "#111827",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 130);
          g.addColorStop(0, "rgba(129,140,248,0.25)");
          g.addColorStop(1, "rgba(129,140,248,0)");
          return g;
        },
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e2535",
        borderColor: "rgba(99,102,241,0.2)",
        borderWidth: 1,
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        padding: 10,
        callbacks: {
          label: (ctx) =>
            ` ${ctx.parsed.y} application${ctx.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#475569", font: { size: 11 }, autoSkip: false },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        min: 0,
        ticks: { color: "#475569", font: { size: 11 }, stepSize: 2 },
        grid: { color: "rgba(99,102,241,0.06)" },
        border: { display: false },
      },
    },
  };

  return (
    <div className="min-h-full bg-[#0a0f1e] py-8">
      <div className="max-w-5xl mx-auto px-8 flex flex-col gap-5">

        <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl overflow-hidden">
          <div className="flex items-start gap-7 p-8 pb-6">

     
            <label
              htmlFor="avatar-upload"
              className="w-24 h-24 rounded-full border-2 border-indigo-500/30 flex-shrink-0 overflow-hidden relative cursor-pointer group"
            >
              {avatarPreview || user?.image ? (
                <img
                  src={avatarPreview || user.image}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <rect width="64" height="64" fill="#1e1b4b" />
                  <circle cx="32" cy="26" r="11" fill="rgba(255,255,255,0.82)" />
                  <path d="M8 56c0-11.6 10.7-20 24-20s24 8.4 24 20" fill="rgba(255,255,255,0.82)" />
                </svg>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>

            <div className="flex-1 min-w-0">
              <div className="text-[22px] font-bold text-slate-200 tracking-tight">
                {user?.full_name || user?.username || "—"}
              </div>
              <div className="text-[14px] text-slate-600 mt-1">@{user?.username || "—"}</div>
              {user?.bio && (
                <div className="text-[14px] text-slate-500 mt-3 leading-relaxed">{user.bio}</div>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={onOpenEditProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/18 hover:text-indigo-300 text-[13px] transition-all cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit profile
              </button>
              <button className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-indigo-500/12 text-slate-600 hover:text-slate-400 hover:bg-white/[0.03] transition-all cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 px-8 pb-5 flex-wrap">
            {user?.location && (
              <div className="flex items-center gap-2 text-[13px] text-slate-600">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {user.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-[13px] text-slate-600">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Member since{" "}
              {new Date(user?.created_at || "2024-01-01").toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="border-t border-indigo-500/8 grid grid-cols-4">
            {[
              { num: stats.applications, label: "Applied Total", color: "text-indigo-400" },
              { num: stats.interviews,   label: "Interviews",    color: "text-emerald-400" },
              { num: stats.offer,        label: "Offers",        color: "text-amber-400" },
              { num: stats.rejected,     label: "Rejected",      color: "text-rose-400" },
            ].map((s, i) => (
              <div key={i} className={`py-6 text-center ${i < 3 ? "border-r border-indigo-500/7" : ""}`}>
                <div className={`text-[26px] font-bold ${s.color}`}>{s.num ?? "—"}</div>
                <div className="text-[11px] text-slate-600 uppercase tracking-wide mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-5">
          <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl p-7">
            <p className="text-[11.5px] text-slate-600 uppercase tracking-widest font-medium mb-5">
              Applications · last 7 days
            </p>
            {weeklyData.length === 0 && chartData.every((v) => v === 0) ? (
              <div className="h-[130px] flex items-center justify-center text-[12px] text-slate-700">
                Loading…
              </div>
            ) : (
              <div style={{ position: "relative", height: "130px" }}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            )}
          </div>

          <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl p-7">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11.5px] text-slate-600 uppercase tracking-widest font-medium">
                Pipeline status
              </p>
            </div>
            <PipelineStepTracker
              applied={pipelineApplied}
              interviews={pipelineInterviews}
              offers={pipelineOffers}
              rejected={pipelineRejected}
            />
          </div>
        </div>

        <div className="bg-[#111827] border border-indigo-500/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-7 pt-6 pb-3.5">
            <p className="text-[11.5px] text-slate-600 uppercase tracking-widest font-medium">
              Upcoming interviews
            </p>
            {interviews.length > 0 && (
              <span className="text-[12px] px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/18 text-emerald-400">
                {interviews.length} scheduled
              </span>
            )}
          </div>
          <div className="flex flex-col border-t border-indigo-500/8">
            {interviews.length === 0 ? (
              <div className="px-7 py-8 text-[12px] text-slate-700 text-center">
                No upcoming interviews
              </div>
            ) : (
              interviews.map((iv, i, arr) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-7 py-5 hover:bg-white/[0.02] transition-colors ${
                    i < arr.length - 1 ? "border-b border-indigo-500/6" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-indigo-500/12 flex items-center justify-center font-bold text-[15px] text-indigo-400 flex-shrink-0">
                      {iv.initials}
                    </div>
                    <div>
                      <div className="text-[15px] font-medium text-slate-300">{iv.role}</div>
                      <div className="text-[13px] text-slate-600 mt-0.5">{iv.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-[12px] px-3 py-1.5 rounded-md bg-white/[0.03] border border-indigo-500/10 text-slate-500">
                      {iv.type}
                    </span>
                    <div className="text-right">
                      <div className="text-[14px] font-medium text-indigo-400">{iv.date}</div>
                      <div className="text-[12px] text-slate-600">{iv.time}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}