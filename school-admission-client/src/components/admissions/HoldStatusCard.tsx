import { useEffect, useState } from "react";
import type { AdmissionHold } from "@/types/hold";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formatCountdown = (ms: number): string => {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface HoldStatusCardProps {
  hold: AdmissionHold;
  onConfirm: () => void;
  isConfirming: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const HoldStatusCard = ({ hold, onConfirm, isConfirming, onRefresh, isRefreshing }: HoldStatusCardProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (hold.status !== "Held" || !hold.expiresAt) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [hold.status, hold.expiresAt]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Application</CardTitle>
        <CardDescription>
          {hold.className} ({hold.classShift})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">
          Status: <span className="font-medium">{hold.status}</span>
        </p>

        {hold.status === "Held" && hold.expiresAt && (
          <>
            <p className="text-sm text-muted-foreground">
              Confirm within {formatCountdown(new Date(hold.expiresAt).getTime() - now.getTime())}
            </p>
            <Button onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? "Confirming..." : "Confirm"}
            </Button>
          </>
        )}

        {hold.status === "Waiting" && (
          <>
            <p className="text-sm text-muted-foreground">
              You're on the waitlist. We'll hold a seat for you if one opens up.
            </p>
            <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh status"}
            </Button>
          </>
        )}

        {hold.status === "Confirmed" && (
          <p className="text-sm text-muted-foreground">Your seat is confirmed. Congratulations!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HoldStatusCard;
