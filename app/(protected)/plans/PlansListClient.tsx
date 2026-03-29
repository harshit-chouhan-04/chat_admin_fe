"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { listPlans } from "@/lib/api";
import { formatCurrencyINR } from "@/lib/utils";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { useListingQuery } from "@/hooks/use-listing-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toast } from "sonner";
import Link from "next/link";

export default function PlansListClient() {
  const router = useRouter();
  const { query, setQuery } = useListingQuery({ sort: "createdAt:desc", page: 1, search: "" });

  const page = typeof query.page === "number" ? query.page : Number(query.page ?? 1);
  const search = String(query.search ?? "");
  const sort = String(query.sort ?? "createdAt:desc");
  const status = String(query.status ?? "all") as "all" | "active" | "inactive";

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch === search) return;
    setQuery({ search: debouncedSearch }, { resetPage: true });
  }, [debouncedSearch, search, setQuery]);

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
      filters: status === "all" ? undefined : { isActive: status === "active" },
    }),
    [page, search, sortBy, sortOrder, status],
  );

  const { data, loading, error } = usePaginatedApi<any>(listPlans, params);

  useEffect(() => {
    if (error?.message) toast.error(error.message);
  }, [error?.message]);

  return (
    <div>
      <PageHeader
        title="Plans"
        description="Manage subscription plans"
        actions={
          <Button onClick={() => router.push("/plans/add")} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Plan
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:flex-1 lg:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                className="pl-9 h-9"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
              />
            </div>

            <Select
              value={status}
              onValueChange={(v) => {
                setQuery({ status: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm" className="w-full lg:w-fit">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => {
                setQuery({ sort: v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm" className="w-full lg:w-fit">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="createdAt:desc">Created (newest)</SelectItem>
                <SelectItem value="name:asc">Name (A–Z)</SelectItem>
                <SelectItem value="price:asc">Price (low)</SelectItem>
                <SelectItem value="price:desc">Price (high)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Msg Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-muted-foreground">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((plan: any) => (
                  <TableRow key={plan.id ?? plan._id}>
                    <TableCell>
                      <Link
                        href={`/plans/${plan.id ?? plan._id}/detail`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {plan.name ?? plan.id ?? plan._id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {typeof plan.price === "number" ? formatCurrencyINR(plan.price) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{plan.billingCycle ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {typeof plan.credits === "number" ? plan.credits.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {typeof plan.messageLimit === "number" ? plan.messageLimit.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={plan.isActive ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell>
                      <RowActions
                        viewUrl={`/plans/${plan.id ?? plan._id}/detail`}
                        editUrl={`/plans/${plan.id ?? plan._id}/edit`}
                        onDelete={() => {}}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{(data.total ?? data.items.length).toLocaleString()} plans</p>
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
