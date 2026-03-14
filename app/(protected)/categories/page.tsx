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
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { listCategories } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { useListingQuery } from "@/hooks/use-listing-query";
import { toast } from "sonner";

const CategoriesList = () => {
  const router = useRouter();
  const { query, setQuery } = useListingQuery({ sort: "name:asc", page: 1, search: "" });

  const page = typeof query.page === "number" ? query.page : Number(query.page ?? 1);
  const search = String(query.search ?? "");
  const sort = String(query.sort ?? "name:asc");
  const status = (String(query.status ?? "all") as "all" | "active" | "inactive");
  const nsfw = (String(query.nsfw ?? "all") as "all" | "nsfw" | "safe");

  const { sortBy, sortOrder } = useMemo(() => {
    const [sb, so] = sort.split(":");
    return {
      sortBy: sb,
      sortOrder: (so === "asc" || so === "desc" ? so : "asc") as "asc" | "desc",
    };
  }, [sort]);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search,
      sortBy,
      sortOrder,
      filters: {
        ...(status === "all" ? {} : { isActive: status === "active" }),
        ...(nsfw === "all" ? {} : { isNsfw: nsfw === "nsfw" }),
      },
    }),
    [page, search, sortBy, sortOrder, status, nsfw]
  );

  const { data, loading, error } = usePaginatedApi<any>(listCategories, params);

  useEffect(() => {
    if (error?.message) toast.error(error.message);
  }, [error?.message]);

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage character categories"
        actions={<Button onClick={() => router.push("/categories/add")} size="sm"><Plus className="h-4 w-4 mr-1" />Add Category</Button>}
      />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={nsfw}
              onValueChange={(v) => {
                setQuery({ nsfw: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="NSFW" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="nsfw">NSFW</SelectItem>
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
                <SelectItem value="name:asc">Name (A–Z)</SelectItem>
                <SelectItem value="name:desc">Name (Z–A)</SelectItem>
                <SelectItem value="createdAt:desc">Created (newest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>NSFW</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((cat: any) => {
                  const id = cat.id ?? cat._id;
                  return (
                    <TableRow key={id}>
                      <TableCell className="text-sm font-medium">{cat.name ?? id}</TableCell>
                      <TableCell>
                        {cat.isNsfw ? (
                          <StatusBadge status="nsfw" />
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={cat.isActive ? "active" : "inactive"} />
                      </TableCell>
                      <TableCell>
                        <RowActions viewUrl={`/categories/${id}/detail`} editUrl={`/categories/${id}/edit`} onDelete={() => {}} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {(data.total ?? data.items.length).toLocaleString()} categories
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

export default CategoriesList;
