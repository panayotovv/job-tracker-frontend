import { useState, useRef } from "react";
import { SortDropdown, SORT_PARAM_MAP } from "../components/SortDropdown";
import { JobCard, Pagination } from "../components/JobCard";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";

const monthsBg = ["яну.","фев.","мар.","апр.","май","юни","юли","авг.","сеп.","окт.","ное.","дек."];

const toDatetimeLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatInterviewDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return `${d.getDate()} ${monthsBg[d.getMonth()]} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

export default function Interviews({ search = "", user }) {
    const [sortLabel, setSortLabel] = useState("Date — newest first");
    const dateInputRefs             = useRef({});

    const buildUrl = (p, s, sort, order) =>
        `http://127.0.0.1:8000/users/me/applications/?page=${p}&limit=20&search=${s}&sort=${sort}&order=${order}&status=Interview%20scheduled`;

    const { items: applications, setItems: setApplications, page, setPage, totalPages, scrollRef } =
        usePaginatedFetch({ buildUrl, search, sortLabel, sortParamMap: SORT_PARAM_MAP, user });

    const handleInterviewDateChange = async (applicationId, newDate) => {
        setApplications((prev) =>
            prev.map((app) =>
                app.id === applicationId ? { ...app, interview_date: newDate } : app
            )
        );
        try {
            await fetch(`http://127.0.0.1:8000/users/applications/${applicationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({ interview_date: newDate ? `${newDate}:00` : null }),
            });
        } catch (err) {
            console.error("Failed to update interview date", err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0f1e]">
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-200">Interviews</h2>
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
                                cardClassName="bg-indigo-900/20 border border-indigo-500/30 hover:bg-indigo-900/30"
                                actions={
                                    <div
                                        className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all cursor-pointer"
                                        onClick={() => dateInputRefs.current[app.id]?.showPicker()}
                                    >
                                        <span className="text-sm">📅</span>
                                        {app.interview_date ? (
                                            <span className="text-xs text-indigo-300">
                                                {formatInterviewDate(app.interview_date)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500">Schedule</span>
                                        )}
                                        <input
                                            ref={(el) => (dateInputRefs.current[app.id] = el)}
                                            type="datetime-local"
                                            value={toDatetimeLocal(app.interview_date)}
                                            onChange={(e) => handleInterviewDateChange(app.id, e.target.value)}
                                            className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                        />
                                    </div>
                                }
                            />
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-10 text-lg">No interviews scheduled.</p>
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