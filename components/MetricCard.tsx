import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}

export function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  const isPositive = change.startsWith("+");
  return (
    <Card className="animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <TrendingUp className={`h-3 w-3 ${isPositive ? "text-chart-emerald" : "text-chart-red"}`} />
          <span className={`text-xs font-medium font-mono ${isPositive ? "text-chart-emerald" : "text-chart-red"}`}>
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
