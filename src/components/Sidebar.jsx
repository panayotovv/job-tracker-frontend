import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  AppIcon,
  ClockIcon,
  UserIcon,
  SettingsIcon,
  LogoIcon,
  SignInIcon,
  LogoutIcon,
} from "./Icons";

const NavItem = ({ to, icon, label, onClick, collapsed }) => {
  const base = `group relative flex items-center rounded-lg cursor-pointer transition-all duration-200 text-sm w-full ${
    collapsed ? "px-0 py-2 justify-center" : "px-2.5 py-2"
  }`;

  const content = (
    <>
      <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 opacity-70 group-hover:opacity-100 transition">
        {icon}
      </span>

      <span
        className={`ml-2 whitespace-nowrap transition-all duration-200 ease-out ${
          collapsed
            ? "opacity-0 translate-x-[-6px] w-0 overflow-hidden ml-0"
            : "opacity-100 translate-x-0"
        }`}
      >
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${base} text-slate-400 hover:bg-white/5 hover:text-slate-200`}
      >
        {content}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${base} ${
          isActive
            ? "bg-indigo-500/10 text-indigo-300"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        }`
      }
    >
      {content}
    </NavLink>
  );
};

export default function Sidebar({
  onOpenAuth,
  user,
  setUser,
  collapsed,
  setCollapsed,
}) {
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
          onClick: () => {
            setUser(null);
            localStorage.removeItem("token");
          },
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
    <div
      className={`fixed flex flex-col h-screen bg-[#0a0f1e] border-r border-indigo-500/10 px-3 py-5 overflow-hidden transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-center pb-5 mb-4 border-b border-white/5">
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex-shrink-0">
            <LogoIcon />
          </div>

          <span
            className={`text-[15px] font-bold text-slate-200 tracking-tight whitespace-nowrap transition-all duration-200 ${
              collapsed
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100"
            }`}
          >
            DEV<span className="text-indigo-400">.BG</span> Job Tracker
          </span>
        </div>
      </div>

      <p className="text-[10px] font-medium tracking-widest text-slate-500/50 uppercase px-2.5 mb-1.5">
        {!collapsed && "Menu"}
      </p>

      <nav className="flex flex-col gap-0.5 mb-5">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="h-px bg-white/5 mb-4" />

      {!collapsed && (
        <p className="text-[10px] font-medium tracking-widest text-slate-500/50 uppercase px-2.5 mb-1.5">
          Settings
        </p>
      )}

      <nav className="flex flex-col gap-0.5">
        {settingsNav.map((item) => (
          <NavItem key={item.label} {...item} collapsed={collapsed} />
        ))}
      </nav>
    </div>
  );
}