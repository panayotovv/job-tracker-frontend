import { useState, useEffect, useRef } from "react";

export const SORT_OPTIONS = [
    { group: "Date",     options: ["Date — newest first", "Date — oldest first"] },
    { group: "Company",  options: ["Company A → Z",       "Company Z → A"] },
    { group: "Location", options: ["Location — remote first", "Location — on-site first"] },
];

export const SORT_PARAM_MAP = {
    "Date — newest first":      { sort: "date",     order: "desc"   },
    "Date — oldest first":      { sort: "date",     order: "asc"    },
    "Company A → Z":            { sort: "company",  order: "asc"    },
    "Company Z → A":            { sort: "company",  order: "desc"   },
    "Location — remote first":  { sort: "location", order: "remote" },
    "Location — on-site first": { sort: "location", order: "onsite" },
};

export function SortDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref             = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (opt) => {
        setOpen(false);
        onChange(opt);
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-[#111827] border border-indigo-500/20 rounded-lg hover:bg-[#141e33] transition-all"
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Sort:</span>
                <span className="text-slate-200 font-medium">{value}</span>
                <svg
                    width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                >
                    <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-10 bg-[#111827] border border-indigo-500/20 rounded-xl overflow-hidden min-w-[220px]">
                    {SORT_OPTIONS.map(({ group, options }, groupIdx) => (
                        <div key={group}>
                            <p className="px-3.5 pt-2 pb-1 text-[11px] text-slate-500 uppercase tracking-wider">
                                {group}
                            </p>
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelect(opt)}
                                    className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors ${
                                        value === opt
                                            ? "text-indigo-300 bg-indigo-500/10"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-[#141e33]"
                                    }`}
                                >
                                    {opt}
                                    {value === opt && (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                            {groupIdx < SORT_OPTIONS.length - 1 && (
                                <div className="h-px bg-indigo-500/10 my-1" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}