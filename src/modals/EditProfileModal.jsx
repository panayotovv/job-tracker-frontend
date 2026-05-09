import { useState, useRef, useEffect } from "react";

export default function EditProfileModal({ onClose, getUser, user }) {
    const mouseDownOnBackdrop = useRef(false);
    const [full_name, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");

    const handleEditProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setUsername(formData.get("username"));
        setFullName(formData.get("full_name"));
        setEmail(formData.get("email"));
        setBio(formData.get("bio"));
        setLocation(formData.get("location"));

        
        const res = await fetch("http://127.0.0.1:8000/users/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                username: formData.get("username"),
                full_name: formData.get("full_name"),
                email: formData.get("email"),
                location: formData.get("location"),
                bio: formData.get("bio")
            })
        });

        if (res.ok) {
            getUser();
            onClose();
        }
    };

    useEffect(() => {
    if (user) {
        setFullName(user.full_name || "");
        setUsername(user.username || "");
        setEmail(user.email || "");
        setBio(user.bio || "");
        setLocation(user.location || "");
    }
}, [user]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={(e) => {
            mouseDownOnBackdrop.current = e.target === e.currentTarget;
        }}
        onClick={() => {
            if (mouseDownOnBackdrop.current) onClose();
        }}>
            <div className="bg-[#0a0f1e] rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-200 mb-6">Edit Profile</h2>
                <form onSubmit={handleEditProfile} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Full Name</label>
                        <input
                            name="full_name"
                            value={full_name}
                            onChange={(e) => setFullName(e.target.value)}
                            type="text"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Username</label>
                        <input
                            value={username}
                            name="username"
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Email</label>
                        <input
                            value={email}
                            name="email"
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Location</label>
                        <input
                            value={location}
                            name="location"
                            onChange={(e) => setLocation(e.target.value)}
                            type="text"
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-400">Bio</label>
                        <textarea
                            rows="5" cols="40"
                            name="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-2 rounded bg-[#1a2138] border border-[#2a3650] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 rounded bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors mt-1 cursor-pointer"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}