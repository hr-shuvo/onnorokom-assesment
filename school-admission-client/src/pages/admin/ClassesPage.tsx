import { useQuery } from "@tanstack/react-query";
import { getErrorMessage, httpClient } from "../../api/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function ClassesPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await httpClient.get<unknown[]>("/classes")).data,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Classes</h1>
      <Card>
        <CardHeader>
          <CardTitle>API connection</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && "Loading..."}
          {error && getErrorMessage(error)}
          {data && `Connected. ${data.length} class(es) found.`}
        </CardContent>
      </Card>
    </div>
  );
}