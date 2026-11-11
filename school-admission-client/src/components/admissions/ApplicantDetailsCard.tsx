import type { ApplicantInfo } from "@/stores/student-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicantDetailsCardProps {
  applicant: ApplicantInfo;
  onChange: () => void;
}

const ApplicantDetailsCard = ({ applicant, onChange }: ApplicantDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicant Details</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Student ID:</span> {applicant.studentId}
          </p>
          {applicant.studentName && (
            <p>
              <span className="text-muted-foreground">Name:</span> {applicant.studentName}
            </p>
          )}
          {applicant.guardianPhone && (
            <p>
              <span className="text-muted-foreground">Guardian Phone:</span> {applicant.guardianPhone}
            </p>
          )}
        </div>
        <Button type="button" variant="outline" onClick={onChange}>
          Change
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApplicantDetailsCard;
