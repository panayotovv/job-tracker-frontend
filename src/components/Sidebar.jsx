import { NavLink } from "react-router-dom";
import { HomeIcon, AppIcon, ClockIcon, StarIcon, UserIcon, SettingsIcon, LogoIcon, SignInIcon, LogoutIcon } from "./Icons";

const NavItem = ({ to, icon, label, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 w-full text-left"
      >
        <span className="w-4 h-4 opacity-70">{icon}</span>
        <span className="flex-1">{label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm ${
          isActive
            ? "bg-indigo-500/10 text-indigo-300"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 bg-indigo-400 rounded-r-sm" />
          )}
          <span
            className={`w-4 h-4 ${
              isActive ? "opacity-100" : "opacity-70"
            }`}
          >
            {icon}
          </span>
          <span className="flex-1">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default function Sidebar({onOpenAuth, user, setUser}) {
  const mainNav = [
    { label: "Dashboard", icon: <HomeIcon />, to: "/" },
    { label: "Applications", icon: <AppIcon />, to: "/applications" },
    { label: "Interviews", icon: <ClockIcon />, to: "/interviews" },
  ];

  const settingsNav = user
    ? [
        { label: "Profile", icon: <UserIcon />, to: "/profile" },
        { label: "Preferences", icon: <SettingsIcon />, to: "/preferences" },
        {
          label: "Logout",
          icon: <LogoutIcon />,
          onClick: () => {setUser(null); localStorage.removeItem("token");},
        },
      ]
    : [
        {
          label: "Sign In",
          icon: <SignInIcon />,
          onClick: onOpenAuth,
        },
      ];

  return (
    <div className="fixed flex flex-col h-screen w-60 bg-[#0a0f1e] border-r border-indigo-500/10 px-3 py-5 overflow-hidden">
      <div className="flex items-center gap-2.5 px-2.5 pb-5 mb-4 border-b border-white/5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
          <LogoIcon />
        </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[17px] font-bold text-slate-200 tracking-tight">
          DEV<span className="text-indigo-400">.BG</span> Job Tracker
        </span>
      </div>
      </div>

      <p className="text-[10px] font-medium tracking-widest text-slate-500/50 uppercase px-2.5 mb-1.5">
        Menu
      </p>
      <nav className="flex flex-col gap-0.5 mb-5">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      <div className="h-px bg-white/5 mb-4" />

      <p className="text-[10px] font-medium tracking-widest text-slate-500/50 uppercase px-2.5 mb-1.5">
        Settings
      </p>
      <nav className="flex flex-col gap-0.5">
        {settingsNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>
    </div>
  );
}