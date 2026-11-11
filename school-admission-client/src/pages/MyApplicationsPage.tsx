import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import SiteHeader from "@/components/layout/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { STATUS_STYLES } from "@/components/holds/columns";
import { getErrorMessage } from "@/lib/http-client";
import { formatDateTime } from "@/lib/date";
import { holdService } from "@/services/hold-service";
import { useStudentStore } from "@/stores/student-store";
import type { AdmissionHold } from "@/types/hold";

const POLL_INTERVAL_MS = 4000;

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const { applicant } = useStudentStore();

  const [holds, setHolds] = useState<AdmissionHold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  useEffect(() => {
    if (!applicant) {
      navigate("/admissions", { replace: true });
    }
  }, [applicant, navigate]);

  useEffect(() => {
    if (!applicant) return;

    let cancelled = false;

    const load = async (showSpinner: boolean) => {
      if (showSpinner) setIsLoading(true);
      try {
        const result = await holdService.getMyHolds();
        if (!cancelled) {
          setHolds(result);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err);
      } finally {
        if (!cancelled && showSpinner) setIsLoading(false);
      }
    };

    load(true);
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [applicant]);

  if (!applicant) {
    return <Loading className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />

      <main className="mx-auto max-w-3xl space-y-6 p-6 py-12">
        <h1 className="text-2xl font-semibold">My Applications</h1>

        {isLoading ? (
          <Loading />
        ) : loadError ? (
          <p className="text-sm text-destructive">{getErrorMessage(loadError)}</p>
        ) : holds.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              You haven't applied to any class yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {holds.map((hold) => (
              <Card key={hold.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">
                    {hold.className} ({hold.classShift})
                  </CardTitle>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[hold.status]}`}>
                    {hold.status}
                  </span>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>Applied on {formatDateTime(hold.createdAt)}</p>
                  {hold.status === "Held" && <p>Expires at {formatDateTime(hold.expiresAt)}</p>}
                  {hold.status === "Confirmed" && <p>Confirmed at {formatDateTime(hold.confirmedAt)}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyApplicationsPage;
