import { NavLink, Outlet } from "react-router";
import { cn } from "../lib/utils";

const navItems = [{ to: "/admin/classes", label: "Classes" }];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-60 flex-col border-r bg-background md:flex">
        <div className="border-b px-6 py-4 text-lg font-semibold">Admission Admin</div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b bg-background px-6 py-4 text-lg font-semibold md:hidden">
          Admission Admin Test
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}