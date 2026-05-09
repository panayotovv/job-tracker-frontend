import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SortDropdown, SORT_PARAM_MAP } from "../components/SortDropdown";
import { JobCard, Pagination } from "../components/JobCard";
import { usePaginatedFetch } from "../hooks/usePaginatedFetch";

export default function Dashboard({ search, user }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const page      = parseInt(searchParams.get("page")) || 1;
    const sortLabel = searchParams.get("sort") || "Date — newest first";

    const setParam = (updates) =>
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            Object.entries(updates).forEach(([k, v]) =>
                v == null ? next.delete(k) : next.set(k, String(v))
            );
            return next;
        });

    const buildUrl = (p, s, sort, order) =>
        `http://127.0.0.1:8000/jobs/?page=${p}&limit=20&search=${s}&sort=${sort}&order=${order}`;

    const { items: jobs, setItems: setJobs, totalPages, scrollRef } = usePaginatedFetch({
        buildUrl,
        search,
        sortLabel,
        sortParamMap: SORT_PARAM_MAP,
        user,
    });

    const handleApply = async (jobId) => {
        try {
            const res = await fetch("http://127.0.0.1:8000/users/me/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ job_id: jobId }),
            });
            if (!res.ok) throw new Error("Failed to apply");
            setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0f1e]">
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-200">Dashboard</h2>
                    <SortDropdown
                        value={sortLabel}
                        onChange={(opt) => setParam({ sort: opt, page: 1 })}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    {jobs?.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            cardClassName={
                                job.applied
                                    ? "bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-900/30"
                                    : "bg-[#111827] border border-indigo-500/10 hover:border-indigo-500/30 hover:bg-[#141e33]"
                            }
                            actions={
                                <div className="flex gap-2">
                                    {job.applied ? (
                                        <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                            ✓ Applied
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(job.id)}
                                            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                                        >
                                            Mark as applied
                                        </button>
                                    )}
                                    <a
                                        href={job.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                                    >
                                        Apply →
                                    </a>
                                </div>
                            }
                        />
                    ))}
                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrev={() => setParam({ page: page - 1 })}
                    onNext={() => setParam({ page: page + 1 })}
                />
            </div>
        </div>
    );
}