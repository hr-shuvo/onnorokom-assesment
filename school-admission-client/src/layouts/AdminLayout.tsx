import { ClipboardList, GraduationCap, LayoutGrid, LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";

const navGroups = [
  {
    label: "Management",
    items: [{ to: "/admin/classes", label: "Classes", icon: LayoutGrid }],
  },
  {
    label: "Settings",
    items: [{ to: "/admin/admission", label: "Admission", icon: ClipboardList }],
  },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <GraduationCap className="size-6 shrink-0 text-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              Admission Admin
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={location.pathname.startsWith(item.to)}
                        tooltip={item.label}
                        render={<NavLink to={item.to} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Exit Admin" render={<Link to="/" />}>
                <LogOut />
                <span>Exit Admin</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium text-muted-foreground">Admission Admin</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
