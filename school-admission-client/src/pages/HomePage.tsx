import { Link } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenIcon, GraduationCapIcon, UsersIcon } from "lucide-react";

const navItems = [
  { to: "/admissions", label: "Admissions" },
  { to: "/classes-fees", label: "Classes & Fees" },
  { to: "/notices", label: "Notices" },
  { to: "/admin", label: "Admin" },
];

const highlights = [
  {
    icon: GraduationCapIcon,
    title: "Admission Application",
    description: "Apply for admission online with a simple guided form.",
    to: "/admissions",
  },
  {
    icon: UsersIcon,
    title: "Classes & Fees",
    description: "Check seat availability and the fee structure for every class.",
    to: "/classes-fees",
  },
  {
    icon: BookOpenIcon,
    title: "Notices & Announcements",
    description: "Stay updated with the latest school notices and events.",
    to: "/notices",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-muted/40">
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

      <main className="flex flex-col items-center gap-10 p-6 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold">School Admission</h1>
          <p className="text-muted-foreground">Welcome to the school admission portal.</p>
        </div>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="size-6 text-primary" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
