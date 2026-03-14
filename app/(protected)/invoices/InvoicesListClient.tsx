"use client";

import { useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { listInvoices, listPlans, listUsers } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { useListingQuery } from "@/hooks/use-listing-query";
import { format } from "date-fns";
import { toast } from "sonner";

export default function InvoicesListClient() {
  const { query, setQuery } = useListingQuery({ sort: "createdAt:desc", page: 1, search: "" });

  const page = typeof query.page === "number" ? query.page : Number(query.page ?? 1);
  const search = String(query.search ?? "");
  const sort = String(query.sort ?? "createdAt:desc");
  const status = String(query.status ?? "all") as "all" | "paid" | "pending" | "failed";

  const { sortBy, sortOrder } = useMemo(() => {
    const [sb, so] = sort.split(":");
    return {
      sortBy: sb,
      sortOrder: (so === "asc" || so === "desc" ? so : "desc") as "asc" | "desc",
    };
  }, [sort]);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search,
      sortBy,
      sortOrder,
      filters: status === "all" ? undefined : { status },
    }),
    [page, search, sortBy, sortOrder, status],
  );

  const { data, loading, error } = usePaginatedApi<any>(listInvoices, params);
  const { data: usersLookup } = usePaginatedApi<any>(listUsers, { page: 1, limit: 100 });
  const { data: plansLookup } = usePaginatedApi<any>(listPlans, { page: 1, limit: 100 });

  useEffect(() => {
    if (error?.message) toast.error(error.message);
  }, [error?.message]);

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of usersLookup.items ?? []) {
      const id = u?.id ?? u?._id;
      if (id) map.set(String(id), String(u.name ?? id));
    }
    return map;
  }, [usersLookup.items]);

  const planNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of plansLookup.items ?? []) {
      const id = p?.id ?? p?._id;
      if (id) map.set(String(id), String(p.name ?? id));
    }
    return map;
  }, [plansLookup.items]);

  return (
    <div>
      <PageHeader title="Invoices" description="View payment invoices" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => {
                  setQuery({ search: e.target.value }, { resetPage: true });
                }}
              />
            </div>

            <Select
              value={status}
              onValueChange={(v) => {
                setQuery({ status: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => {
                setQuery({ sort: v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="createdAt:desc">Created (newest)</SelectItem>
                <SelectItem value="amount:desc">Amount (high)</SelectItem>
                <SelectItem value="amount:asc">Amount (low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((inv: any) => {
                  const userId = typeof inv.user === "string" ? inv.user : inv.user?.id ?? inv.user?._id;
                  const planId = typeof inv.plan === "string" ? inv.plan : inv.plan?.id ?? inv.plan?._id;
                  const userName =
                    typeof inv.user === "object" && inv.user?.name
                      ? inv.user.name
                      : userId
                        ? userNameById.get(String(userId)) ?? String(userId)
                        : "—";
                  const planName =
                    typeof inv.plan === "object" && inv.plan?.name
                      ? inv.plan.name
                      : planId
                        ? planNameById.get(String(planId)) ?? String(planId)
                        : "—";

                  const invId = inv.id ?? inv._id;

                  return (
                    <TableRow key={invId}>
                      <TableCell className="text-sm font-mono font-medium">{inv.invoiceId ?? invId}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{userName}</TableCell>
                      <TableCell className="text-sm">{planName}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {typeof inv.amount === "number" ? `$${inv.amount.toFixed(2)}` : "—"} {inv.currency ?? ""}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={(inv.status ?? "pending") as any} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">{inv.paymentProvider ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {inv.createdAt ? format(new Date(inv.createdAt), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <RowActions viewUrl={`/invoices/${invId}/detail`} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{(data.total ?? data.items.length).toLocaleString()} invoices</p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={loading || !data.hasPreviousPage}
                onClick={() => setQuery({ page: Math.max(1, page - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 font-mono text-xs">
                {data.page}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={loading || !data.hasNextPage}
                onClick={() => setQuery({ page: page + 1 })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
