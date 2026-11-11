import { LogOutIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useStudentStore } from "@/stores/student-store";

const navItems = [
  { to: "/admissions", label: "Admissions" },
  { to: "/admin", label: "Admin" },
];

const SiteHeader = () => {
  const navigate = useNavigate();
  const { applicant, clearApplicant } = useStudentStore();

  const onLogout = () => {
    clearApplicant();
    navigate("/admissions");
  };

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="text-lg font-semibold">
          School Admission
        </Link>

        <div className="flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.to}>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    render={<Link to={item.to}>{item.label}</Link>}
                  />
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {applicant && (
            <Button type="button" variant="outline" size="sm" onClick={onLogout}>
              <LogOutIcon />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
