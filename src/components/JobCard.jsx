export function JobCard({ job, cardClassName, actions, application, onDelete, showRemoveButton = false }) {

    const handleDelete = async () => {
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/users/applications/${application.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Delete failed");
            }

            onDelete?.(application.id);
        } catch (err) {
            console.error("Failed to delete job", err);
        }
    };



    return (
        <div
            className={`group flex items-center justify-between p-5 rounded-xl transition-all duration-300 ${cardClassName}`}
        >
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                    <img
                        src={`http://127.0.0.1:8000/proxy-image/?url=${encodeURIComponent(job.image)}`}
                        alt={job.company}
                        style={{ maxWidth: "80%", maxHeight: "80%", width: "auto", height: "auto" }}
                        className="mix-blend-multiply"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `<span style="color:#64748b;font-weight:700;font-size:1.125rem">${job.company?.[0] ?? "?"}</span>`;
                        }}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {job.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                        {job.company || "Unknown company"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300">
                            {job.category?.replace(/-/g, " ")}
                        </span>
                        <span className="text-xs px-2.5 py-1 bg-slate-700/40 rounded-full text-slate-400">
                            📍 {job.location?.split("Hybrid")[0].trim() || "Unknown"}
                        </span>
                        {job.location?.includes("Hybrid") && (
                            <span className="text-xs px-2.5 py-1 bg-slate-700/40 rounded-full text-slate-400">
                                📍 Hybrid
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500 tabular-nums">
                    {job.date_display || "N/A"}
                </span>
                {actions}
                {showRemoveButton && (
                    <button
                        className="border-1 rounded-lg px-3 py-1.5 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10 transition-all"
                        onClick={handleDelete}
                    >
                        Remove
                    </button>
                )}
            </div>
        </div>
    );
}

export function Pagination({ page, totalPages, onPrev, onNext }) {
    return (
        <div className="flex items-center justify-center gap-3 mt-6 mb-2">
            <button
                onClick={onPrev}
                disabled={page === 1}
                className="px-4 py-2 text-sm text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                ← Prev
            </button>
            <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
            </span>
            <button
                onClick={onNext}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                Next →
            </button>
        </div>
    );
}