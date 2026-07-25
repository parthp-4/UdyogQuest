import { VERIFIED_UNAVAILABLE } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SourceEmpty({ title = "Verified knowledge required", detail = VERIFIED_UNAVAILABLE }: { title?: string; detail?: string }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Add an official URL through the ingestion pipeline, verify the source, and this section will populate from PostgreSQL.
        </p>
      </CardContent>
    </Card>
  );
}

