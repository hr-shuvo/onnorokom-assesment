import { Link } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navItems = [
  { to: "/admissions", label: "Admissions" },
  { to: "/admin", label: "Admin" },
];

const SiteHeader = () => {
  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="text-lg font-semibold">
          School Admission
        </Link>

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
      </div>
    </header>
  );
};

export default SiteHeader;
