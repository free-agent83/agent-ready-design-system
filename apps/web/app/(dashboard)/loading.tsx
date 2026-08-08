import { Card, CardContent, CardHeader } from "@cbd/components";

// Skeleton shown while a dashboard route segment streams in. Uses the muted role
// + pulse — no spinner, enterprise-quiet.
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <Bar className="h-7 w-40" />
        <Bar className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Bar className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Bar className="h-8 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Bar className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Bar className="h-56 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
