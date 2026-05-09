import { useState, useEffect, useRef } from "react";

const LIMIT = 20;

export function usePaginatedFetch({ buildUrl, search, sortLabel, sortParamMap, user, headers = {} }) {
    const [items, setItems]               = useState([]);
    const [total, setTotal]               = useState(0);
    const [page, setPage]                 = useState(1);
    const [debouncedSearch, setDebounced] = useState(search);
    const scrollRef                       = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebounced(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const { sort, order } = sortParamMap[sortLabel];
        const url = buildUrl(page, debouncedSearch, sort, order);

        fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                ...headers,
            },
        })
            .then((r) => r.json())
            .then((data) => {
                setItems(data.jobs ?? data.applications ?? []);
                setTotal(data.total ?? 0);
            })
            .catch(console.error);

        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [page, debouncedSearch, sortLabel, user]);

    const totalPages = Math.ceil(total / LIMIT);

    return { items, setItems, total, page, setPage, totalPages, scrollRef };
}