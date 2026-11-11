import { Link } from "react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";

const highlights = [
  {
    icon: GraduationCapIcon,
    title: "Admission Application",
    description: "Apply for admission online with a simple guided form.",
    to: "/admissions",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />

      <main className="flex flex-col items-center gap-10 p-6 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold">School Admission</h1>
          <p className="text-muted-foreground">Welcome to the school admission portal.</p>
        </div>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description, to }) => (
            <Link key={title} to={to}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <Icon className="size-6 text-primary" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
