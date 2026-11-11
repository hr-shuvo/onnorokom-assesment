import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import SiteHeader from "@/components/layout/SiteHeader";
import AdmissionClosedCard from "@/components/admissions/AdmissionClosedCard";
import { academicClassService } from "@/services/academic-class-service";
import { useAdmission } from "@/hooks/use-admission";
import type { AcademicClass } from "@/types/academic-class";

const seatLabel = (c: AcademicClass) => {
  if (c.availableSeats > 0) return `${c.availableSeats} of ${c.totalSeats} seats available`;
  if (c.confirmedSeats >= c.totalSeats) return "Full";
  return "Waitlist";
};

const HomePage = () => {
  const { admission, isLoading: isAdmissionLoading, isOpen, closedMessage } = useAdmission();
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setIsLoadingClasses(false);
      return;
    }

    const load = async () => {
      setIsLoadingClasses(true);
      const result = await academicClassService.load(1, 100);
      setClasses(result.items.filter((c) => c.isActive));
      setIsLoadingClasses(false);
    };
    load();
  }, [isOpen]);

  if (isAdmissionLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />

      <main className="mx-auto max-w-2xl space-y-6 p-6 py-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{admission?.title ?? "School Admission"}</h1>
          {admission?.description && <p className="text-muted-foreground">{admission.description}</p>}
          {admission && isOpen && (
            <p className="text-sm text-muted-foreground">
              Admissions close on {new Date(admission.closesAt).toLocaleString()}.
            </p>
          )}
        </div>

        {!isOpen && <AdmissionClosedCard message={closedMessage} />}

        {isOpen && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Available Classes</CardTitle>
                <CardDescription>Seat availability as of right now.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingClasses && <p className="text-sm text-muted-foreground">Loading classes...</p>}
                {!isLoadingClasses && classes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No classes are open for admission right now.</p>
                )}
                {!isLoadingClasses &&
                  classes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                      <p className="font-medium">
                        {c.name} <span className="text-muted-foreground">({c.shift})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{seatLabel(c)}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Link to="/admissions">
              <Button size="lg" className="w-full">
                Start Admission
              </Button>
            </Link>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
