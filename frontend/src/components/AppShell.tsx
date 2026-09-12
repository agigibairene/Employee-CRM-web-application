import { NavLink, Outlet } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";


const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/employees", label: "Employees" },
  { to: "/departments", label: "Departments" },
  { to: "/leave", label: "Leave" },
];

export function AppShell() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-serif-brand text-lg font-semibold text-ink">Personnel</span>
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-primary" : "text-ink-muted hover:text-ink"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => dispatch(logout())}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}