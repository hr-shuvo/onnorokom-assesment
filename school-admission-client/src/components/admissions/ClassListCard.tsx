import type { AcademicClass } from "@/types/academic-class";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassListCardProps {
  classes: AcademicClass[];
  onApply: (classId: number, mode: "apply" | "waitlist") => void;
  submittingClassId: number | null;
}

const ClassListCard = ({ classes, onApply, submittingClassId }: ClassListCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Class</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {classes.length === 0 && (
          <p className="text-sm text-muted-foreground">No classes are open for admission right now.</p>
        )}
        {classes.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">
                {c.name} <span className="text-muted-foreground">({c.shift})</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {c.availableSeats > 0 ? `${c.availableSeats} of ${c.totalSeats} seats available` : "Full"}
              </p>
            </div>
            <Button
              type="button"
              variant={c.availableSeats > 0 ? "default" : "outline"}
              disabled={submittingClassId === c.id}
              onClick={() => onApply(c.id, c.availableSeats > 0 ? "apply" : "waitlist")}
            >
              {submittingClassId === c.id ? "Submitting..." : c.availableSeats > 0 ? "Apply" : "Join Waitlist"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ClassListCard;
