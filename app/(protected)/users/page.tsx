"use client";

import { useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { listUsers } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { useListingQuery } from "@/hooks/use-listing-query";
import { format } from "date-fns";
import { toast } from "sonner";

const UsersList = () => {
  const { query, setQuery } = useListingQuery({ sort: "lastLoginAt:desc", page: 1, search: "" });

  const page = typeof query.page === "number" ? query.page : Number(query.page ?? 1);
  const search = String(query.search ?? "");
  const sort = String(query.sort ?? "lastLoginAt:desc");
  const verified = (String(query.verified ?? "all") as "all" | "verified" | "unverified");

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
      filters: verified === "all" ? undefined : { isEmailVerified: verified === "verified" },
    }),
    [page, search, sortBy, sortOrder, verified]
  );

  const { data, loading, error } = usePaginatedApi<any>(listUsers, params);

  useEffect(() => {
    if (error?.message) toast.error(error.message);
  }, [error?.message]);

  return (
    <div>
      <PageHeader title="Users" description="Manage platform users" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => {
                  setQuery({ search: e.target.value }, { resetPage: true });
                }}
              />
            </div>
            <Select
              value={verified}
              onValueChange={(v) => {
                setQuery({ verified: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Verified" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
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
                <SelectItem value="lastLoginAt:desc">Last login (recent)</SelectItem>
                <SelectItem value="createdAt:desc">Created (newest)</SelectItem>
                <SelectItem value="name:asc">Name (A–Z)</SelectItem>
                <SelectItem value="credits:desc">Credits (high)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Msgs Left</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Last Login</TableHead>
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
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((user: any) => (
                  <TableRow key={user.id ?? user._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-secondary">
                            {(user.name ?? "?")
                              .split(" ")
                              .filter(Boolean)
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name ?? user.id ?? user._id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {user.username ? `@${user.username}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {typeof user.credits === "number" ? user.credits.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {user.numberOfMessageLeft ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.isEmailVerified ? "verified" : "unverified"} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <RowActions viewUrl={`/users/${user.id ?? user._id}/detail`} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {(data.total ?? data.items.length).toLocaleString()} users
            </p>
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
};

export default UsersList;
