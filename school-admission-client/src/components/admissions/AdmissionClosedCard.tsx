import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdmissionClosedCardProps {
  message: string;
}

const AdmissionClosedCard = ({ message }: AdmissionClosedCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admissions are currently closed</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default AdmissionClosedCard;
