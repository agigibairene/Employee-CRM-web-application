import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LayoutDashboard, Users, Building2, CalendarClock, LogOut, Menu, X, Briefcase, ShieldCheck, } from "lucide-react";
import { logout } from "../redux/authSlice";
import { useGetMeQuery } from "../redux/authApi";
import type { AppDispatch } from "../redux/store";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/leave", label: "Leave", icon: CalendarClock },
];

export function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: user } = useGetMeQuery();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-6">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-(--primary) text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif-brand text-xl font-semibold text-ink tracking-tight">
                Personnel
              </span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                Employee CRM
              </p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="rounded-sm p-1 text-ink-muted hover:bg-black/5 hover:text-ink md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 h-px bg-border" />

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-(--primary) text-white shadow-xs"
                      : "text-ink-muted hover:bg-black/5 hover:text-ink"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4.5 w-4.5 ${
                        isActive ? "text-white" : "text-ink-muted"
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Sign Out */}
      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 font-serif-brand text-sm font-semibold text-(--primary)">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {user?.full_name || "Employee"}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs text-ink-muted">
                {user?.email || "Signed in"}
              </p>
              {user?.role === "HR_ADMIN" && (
                <span className="inline-flex items-center gap-0.5 rounded-xs bg-accent/15 px-1 py-0.2 text-[10px] font-semibold text-[#8b6e3f]">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium text-ink-muted hover:bg-danger-bg hover:text-danger transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-(--primary) text-white">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="font-serif-brand text-lg font-semibold text-ink">Personnel</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-sm p-1.5 text-ink hover:bg-black/5"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-white shadow-xl transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:border-r md:border-border md:bg-white">
        {sidebarContent}
      </aside>
    </>
  );
}
