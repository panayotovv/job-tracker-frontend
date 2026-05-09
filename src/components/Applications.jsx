import { useState, useEffect, useRef } from "react";
import { SortDropdown, SORT_PARAM_MAP } from "../components/SortDropdown";
import { JobCard, Pagination } from "../components/JobCard";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";

const STATUS_OPTIONS = [
    { label: "Applied",             icon: "✓",  color: "emerald" },
    { label: "Interview scheduled", icon: "📅", color: "indigo"  },
    { label: "Offer received",      icon: "🎉", color: "violet"  },
    { label: "Rejected",            icon: "✕",  color: "red"     },
    { label: "Withdrawn",           icon: "−",  color: "slate"   },
];

const statusStyles = {
    emerald: { button: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20", dot: "bg-emerald-400", card: "bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-900/30" },
    indigo:  { button: "bg-indigo-500/10  border-indigo-500/20  text-indigo-400  hover:bg-indigo-500/20",  dot: "bg-indigo-400",  card: "bg-indigo-900/20  border border-indigo-500/30  hover:bg-indigo-900/30"  },
    violet:  { button: "bg-violet-500/10  border-violet-500/20  text-violet-400  hover:bg-violet-500/20",  dot: "bg-violet-400",  card: "bg-violet-900/20  border border-violet-500/30  hover:bg-violet-900/30"  },
    red:     { button: "bg-red-500/10     border-red-500/20     text-red-400     hover:bg-red-500/20",     dot: "bg-red-400",     card: "bg-red-900/20     border border-red-500/30     hover:bg-red-900/30"     },
    slate:   { button: "bg-slate-700/40   border-slate-600/20   text-slate-400   hover:bg-slate-700/60",   dot: "bg-slate-400",   card: "bg-slate-800/20   border border-slate-600/30   hover:bg-slate-800/30"   },
};

const getStylesForStatus = (label) => {
    const opt = STATUS_OPTIONS.find((s) => s.label === label) ?? STATUS_OPTIONS[0];
    return statusStyles[opt.color];
};

function StatusDropdown({ applicationId, initialStatus = "Applied", onStatusChange }) {
    const [status, setStatus] = useState(initialStatus);
    const [open, setOpen]     = useState(false);
    const ref                 = useRef(null);

    const current = STATUS_OPTIONS.find((s) => s.label === status) ?? STATUS_OPTIONS[0];
    const styles  = statusStyles[current.color];

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (option) => {
        setStatus(option.label);
        setOpen(false);
        onStatusChange?.(option.label);
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${styles.button}`}
            >
                <span>{current.icon}</span>
                <span>{current.label}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                    <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-20 bg-[#111827] border border-indigo-500/20 rounded-xl overflow-hidden min-w-[190px] shadow-lg">
                    {STATUS_OPTIONS.map((option) => {
                        const isActive = option.label === status;
                        return (
                            <button
                                key={option.label}
                                onClick={() => handleSelect(option)}
                                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors ${isActive ? "bg-white/5" : "hover:bg-[#141e33]"}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusStyles[option.color].dot}`} />
                                <span className={isActive ? "text-slate-100 font-medium" : "text-slate-400"}>
                                    {option.label}
                                </span>
                                {isActive && (
                                    <svg className="ml-auto" width="12" height="12" viewBox="0 0 14 14" fill="none">
                                        <path d="M2.5 7l3 3 6-6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


export default function Applications({ search = "", user }) {
    const [sortLabel, setSortLabel] = useState("Date — newest first");
    const [appStatuses, setAppStatuses] = useState({});

    const buildUrl = (p, s, sort, order) =>
        `http://127.0.0.1:8000/users/me/applications/?page=${p}&limit=20&search=${s}&sort=${sort}&order=${order}`;

    const {
        items: applications,
        setItems,
        page,
        setPage,
        totalPages,
        scrollRef,
    } = usePaginatedFetch({
        buildUrl,
        search,
        sortLabel,
        sortParamMap: SORT_PARAM_MAP,
        user,
    });

    const handleStatusChange = async (applicationId, newStatus) => {
        setAppStatuses((prev) => ({ ...prev, [applicationId]: newStatus }));
        try {
            await fetch(`http://127.0.0.1:8000/users/applications/${applicationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleDelete = (deletedId) => {
        setItems((prev) =>
            prev.filter((app) => app.id !== deletedId)
        );
    };

    const cardClass = (app) =>
        getStylesForStatus(appStatuses[app.id] ?? app.status ?? "Applied").card;

    return (
        <div className="flex flex-col h-screen bg-[#0a0f1e]">
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-200">Applications</h2>
                    <SortDropdown
                        value={sortLabel}
                        onChange={(opt) => { setSortLabel(opt); setPage(1); }}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    {applications?.length > 0 ? (
                        applications.map((app) => (
                            <JobCard
                                key={app.id}
                                job={app.job}
                                application={app}
                                onDelete={handleDelete}
                                showRemoveButton={false}
                                cardClassName={cardClass(app)}
                                actions={
                                    <StatusDropdown
                                        applicationId={app.id}
                                        initialStatus={app.status || "Applied"}
                                        onStatusChange={(s) => handleStatusChange(app.id, s)}
                                    />
                                }
                            />
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-10 text-lg">No applications found.</p>
                    )}
                </div>

                {applications?.length > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPrev={() => setPage((p) => p - 1)}
                        onNext={() => setPage((p) => p + 1)}
                    />
                )}
            </div>
        </div>
    );
}