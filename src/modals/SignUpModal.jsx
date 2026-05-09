import { useState, useRef } from "react";

export default function SignUpModal({ onClose, onOpenAuth }) {
    const mouseDownOnBackdrop = useRef(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            return;
        }

        const res = await fetch("http://127.0.0.1:8000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        });

        if (res.ok) {
            onClose();
            onOpenAuth();
        } else {
            console.log("Signup failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={(e) => {
            mouseDownOnBackdrop.current = e.target === e.currentTarget;
        }}
        onClick={() => {
            if (mouseDownOnBackdrop.current) onClose();
        }}>
            <div className="bg-[#0a0f1e] rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-200 mb-6">Sign Up</h2>
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            placeholder="Enter your username"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Confirm Password</label>
                        <input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            placeholder="Confirm your password"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 rounded bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors mt-1 cursor-pointer"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="text-sm text-slate-500 text-center mt-4">
                    Already have an account?{" "}
                    <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer" onClick={onOpenAuth}>
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}