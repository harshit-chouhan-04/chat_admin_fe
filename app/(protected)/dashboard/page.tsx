"use client"
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { mockUsers, mockConversations, getCharacterById } from "@/lib/mock-data";
import { formatCurrencyINR } from "@/lib/utils";
import { DateRangeQuery, getDashboardConversationsPerDay, getDashboardMessagesPerDay, getDashboardMetrics } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Bot, DollarSign, MessageSquare, MessagesSquare, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MetricCardModel = {
  title: string;
  value: string;
  change: string;
  // MetricCard expects a LucideIcon-compatible component
  icon: any;
};

type ConversationsPerDayPoint = { date: string; count: number };
type MessagesPerDayPoint = { date: string; user: number; ai: number };

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toRangeQuery(start: string, end: string): DateRangeQuery | null {
  if (!start || !end) return null;

  // Use an explicit UTC range to avoid client timezone shifting.
  const startDate = `${start}T00:00:00.000Z`;
  const endDate = `${end}T23:59:59.999Z`;
  return { startDate, endDate };
}

function coerceString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString();
  return "—";
}

function coercePercent(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  }
  return "+0%";
}

function normalizeMetrics(raw: unknown): MetricCardModel[] {
  const iconByTitle: Record<string, any> = {
    "Total Users": Users,
    "Total Characters": Bot,
    "Total Conversations": MessagesSquare,
    "Total Messages": MessageSquare,
    "Revenue": DollarSign,
  };

  const asAny = raw as any;
  const arr: any[] = Array.isArray(raw)
    ? (raw as any[])
    : Array.isArray(asAny?.metrics)
      ? (asAny.metrics as any[])
      : [];

  if (arr.length) {
    return arr
      .map((m) => {
        const title = String(m?.title ?? m?.name ?? m?.label ?? "").trim();
        if (!title) return null;
        const isRevenue = /revenue/i.test(title);
        const value = isRevenue && typeof m?.value === "number"
          ? formatCurrencyINR(m.value, 0)
          : coerceString(m?.value ?? m?.count ?? m?.total);
        const change = coercePercent(m?.change ?? m?.delta ?? m?.growth ?? m?.percentageChange);
        return {
          title,
          value,
          change,
          icon: iconByTitle[title] ?? Users,
        } satisfies MetricCardModel;
      })
      .filter(Boolean) as MetricCardModel[];
  }

  // Object-shaped fallbacks (common for stats endpoints)
  const obj = (raw && typeof raw === "object" && !Array.isArray(raw)) ? (raw as Record<string, any>) : null;
  if (!obj) return [];

  // Support shape: { range: ..., metrics: { totalUsers: { total, current, previous, changePct }, ... } }
  const metricContainer: Record<string, any> | null =
    (obj.metrics && typeof obj.metrics === "object" && !Array.isArray(obj.metrics))
      ? (obj.metrics as Record<string, any>)
      : obj;

  const candidates: Array<{ title: string; key: string; icon: any; isCurrency?: boolean }> = [
    { title: "Total Users", key: "totalUsers", icon: Users },
    { title: "Total Characters", key: "totalCharacters", icon: Bot },
    { title: "Total Conversations", key: "totalConversations", icon: MessagesSquare },
    { title: "Total Messages", key: "totalMessages", icon: MessageSquare },
    { title: "Revenue", key: "revenue", icon: DollarSign, isCurrency: true },
  ];

  return candidates.map(({ title, key, icon, isCurrency }) => {
    const metric = metricContainer?.[key];

    const valueRaw =
      (metric && typeof metric === "object" && !Array.isArray(metric))
        ? (metric.total ?? metric.current ?? metric.value ?? metric.count)
        : (metricContainer?.[key] ?? metricContainer?.[key.replace(/^total/, "")] ?? metricContainer?.[key.toLowerCase()]);

    const changeRaw =
      (metric && typeof metric === "object" && !Array.isArray(metric))
        ? (metric.changePct ?? metric.change ?? metric.delta ?? metric.growth)
        : (
          metricContainer?.[`${key}Change`] ??
          metricContainer?.[`${key}Delta`] ??
          metricContainer?.[`${key}Growth`] ??
          metricContainer?.[`${key}PercentChange`] ??
          metricContainer?.[`${key}PercentageChange`]
        );

    const value = isCurrency && typeof valueRaw === "number"
      ? formatCurrencyINR(valueRaw, 0)
      : coerceString(valueRaw);

    return {
      title,
      value,
      change: coercePercent(changeRaw),
      icon,
    } satisfies MetricCardModel;
  });
}

function normalizeConversationsPerDay(raw: unknown): ConversationsPerDayPoint[] {
  const asAny = raw as any;
  const arr: any[] = Array.isArray(raw)
    ? (raw as any[])
    : Array.isArray(asAny?.data)
      ? (asAny.data as any[])
      : Array.isArray(asAny?.items)
        ? (asAny.items as any[])
        : [];

  return arr
    .map((p) => {
      const date = String(p?.date ?? p?.day ?? p?.label ?? "").trim();
      const count = Number(p?.count ?? p?.value ?? p?.total ?? 0);
      if (!date) return null;
      return { date, count: Number.isFinite(count) ? count : 0 };
    })
    .filter(Boolean) as ConversationsPerDayPoint[];
}

function normalizeMessagesPerDay(raw: unknown): MessagesPerDayPoint[] {
  const asAny = raw as any;
  const arr: any[] = Array.isArray(raw)
    ? (raw as any[])
    : Array.isArray(asAny?.data)
      ? (asAny.data as any[])
      : Array.isArray(asAny?.items)
        ? (asAny.items as any[])
        : [];

  return arr
    .map((p) => {
      const date = String(p?.date ?? p?.day ?? p?.label ?? "").trim();
      if (!date) return null;
      const user = Number(p?.user ?? p?.userCount ?? p?.userMessages ?? p?.userMessageCount ?? p?.count ?? 0);
      const ai = Number(p?.ai ?? p?.aiCount ?? p?.aiMessages ?? p?.aiMessageCount ?? 0);
      return {
        date,
        user: Number.isFinite(user) ? user : 0,
        ai: Number.isFinite(ai) ? ai : 0,
      };
    })
    .filter(Boolean) as MessagesPerDayPoint[];
}

const Dashboard = () => {
  const defaultEnd = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const [startDate, setStartDate] = useState(() => toDateInputValue(defaultStart));
  const [endDate, setEndDate] = useState(() => toDateInputValue(defaultEnd));
  const [metrics, setMetrics] = useState<MetricCardModel[] | null>(null);
  const [conversationsPerDay, setConversationsPerDay] = useState<ConversationsPerDayPoint[]>([]);
  const [messagesPerDay, setMessagesPerDay] = useState<MessagesPerDayPoint[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const range = toRangeQuery(startDate, endDate);

    (async () => {
      try {
        const [metricsRaw, convRaw, msgRaw] = await Promise.all([
          getDashboardMetrics(range ?? undefined, { signal: controller.signal }),
          getDashboardConversationsPerDay(range ?? undefined, { signal: controller.signal }),
          getDashboardMessagesPerDay(range ?? undefined, { signal: controller.signal }),
        ]);

        setMetrics(normalizeMetrics(metricsRaw));
        setConversationsPerDay(normalizeConversationsPerDay(convRaw));
        setMessagesPerDay(normalizeMessagesPerDay(msgRaw));
      } catch (e) {
        // Keep UI usable even if the API is temporarily unavailable
        console.error("Failed to load dashboard data", e);
        setMetrics([]);
        setConversationsPerDay([]);
        setMessagesPerDay([]);
      }
    })();

    return () => controller.abort();
  }, [startDate, endDate]);

  const metricCards = useMemo(() => metrics ?? [], [metrics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your AI Character Chat platform</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
          <div className="space-y-1">
            <Label htmlFor="dashboard-start-date" className="text-xs text-muted-foreground">Start date</Label>
            <Input
              id="dashboard-start-date"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dashboard-end-date" className="text-xs text-muted-foreground">End date</Label>
            <Input
              id="dashboard-end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((stat: any) => (
          <MetricCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversations per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={conversationsPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-indigo))" fill="hsl(var(--chart-indigo))" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Message Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={messagesPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="user" fill="hsl(var(--chart-indigo))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ai" fill="hsl(var(--chart-emerald))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.slice(0, 5).map((user:any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-secondary">{user.name.split(' ').map((n:any) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell><StatusBadge status={user.isEmailVerified ? "verified" : "unverified"} /></TableCell>
                    <TableCell className="text-right font-mono text-sm">{user.credits.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Character</TableHead>
                  <TableHead className="text-right">Messages</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConversations.map((conv:any) => {
                  const character = getCharacterById(conv.character);
                  return (
                    <TableRow key={conv.id}>
                      <TableCell className="text-sm font-medium">{conv.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{character?.name || conv.character}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{conv.messageCount}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrencyINR(conv.totalCost)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
