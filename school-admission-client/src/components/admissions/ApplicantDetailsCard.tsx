import type { ApplicantInfo } from "@/stores/student-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicantDetailsCardProps {
  applicant: ApplicantInfo;
}

const ApplicantDetailsCard = ({ applicant }: ApplicantDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applicant Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
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
      </CardContent>
    </Card>
  );
};

export default ApplicantDetailsCard;
