import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cbd/components";
import { StatCard } from "../components/stat-card";
import { RevenueChart } from "../components/revenue-chart";
import { ActivityList } from "../components/activity-list";
import { stats } from "../lib/fixtures";

export default function OverviewPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of activity across the workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Monthly recurring revenue, last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This month</CardTitle>
            <CardDescription>Key figures</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">New customers</span>
              <span className="font-mono font-medium tabular-nums">128</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Invoices sent</span>
              <span className="font-mono font-medium tabular-nums">412</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Open tickets</span>
              <span className="font-mono font-medium tabular-nums">17</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conversion</span>
              <span className="font-mono font-medium tabular-nums">3.2%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest member events</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityList />
        </CardContent>
      </Card>
    </div>
  );
}
