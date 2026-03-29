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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { listCategories, listCharacters } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { useListingQuery } from "@/hooks/use-listing-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toast } from "sonner";
import Link from "next/link";

export default function CharactersListClient() {
  const router = useRouter();
  const { query, setQuery } = useListingQuery({ sort: "createdAt:desc", page: 1, search: "" });

  const page = typeof query.page === "number" ? query.page : Number(query.page ?? 1);
  const search = String(query.search ?? "");
  const sort = String(query.sort ?? "createdAt:desc");
  const status = String(query.status ?? "all") as "all" | "active" | "inactive";
  const nsfw = String(query.nsfw ?? "all") as "all" | "nsfw" | "safe";
  const visibility = String(query.visibility ?? "all") as "all" | "public" | "unlisted" | "private";

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
      filters: {
        ...(status === "all" ? {} : { isActive: status === "active" }),
        ...(nsfw === "all" ? {} : { isNsfw: nsfw === "nsfw" }),
        ...(visibility === "all" ? {} : { visibility }),
      },
    }),
    [page, search, sortBy, sortOrder, status, nsfw, visibility],
  );

  const { data, loading, error } = usePaginatedApi<any>(listCharacters, params);
  const { data: categoriesData } = usePaginatedApi<any>(listCategories, {
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  useEffect(() => {
    if (error?.message) toast.error(error.message);
  }, [error?.message]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categoriesData.items ?? []) {
      const id = c?.id ?? c?._id;
      if (id) map.set(String(id), String(c.name ?? id));
    }
    return map;
  }, [categoriesData.items]);

  return (
    <div>
      <PageHeader
        title="Characters"
        description="Manage AI characters"
        actions={
          <Button onClick={() => router.push("/characters/add")} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Character
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:flex-1 lg:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search characters..."
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
              value={nsfw}
              onValueChange={(v) => {
                setQuery({ nsfw: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm" className="w-full lg:w-fit">
                <SelectValue placeholder="NSFW" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="nsfw">NSFW</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={visibility}
              onValueChange={(v) => {
                setQuery({ visibility: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm" className="w-full lg:w-fit">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
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
                <SelectItem value="rating:desc">Rating (high)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Character</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Rating</TableHead>
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
                    No characters found
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((char: any) => (
                  <TableRow key={char.id ?? char._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={char.avatarUrl ?? ""}
                            alt={char.name ?? char.id ?? char._id ?? "Character"}
                            className="object-cover object-top"
                          />
                          <AvatarFallback className="text-xs bg-secondary">{String(char.name ?? "?")[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/characters/${char.id ?? char._id}/detail`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {char.name ?? char.id ?? char._id}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{char.gender ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(char.categories ?? [])
                        .map((c: any) => {
                          if (!c) return "";
                          if (typeof c === "string") return categoryNameById.get(c) ?? c;

                          const id = c.id ?? c._id;
                          return c.name ?? (id ? categoryNameById.get(String(id)) ?? String(id) : "");
                        })
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={(char.visibility ?? "public") as any} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-chart-amber text-chart-amber" />
                        <span className="text-sm font-mono">{char.rating ?? "—"}</span>
                        {typeof char.ratingCount === "number" && (
                          <span className="text-xs text-muted-foreground">({char.ratingCount})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={char.isActive ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell>
                      <RowActions
                        viewUrl={`/characters/${char.id ?? char._id}/detail`}
                        editUrl={`/characters/${char.id ?? char._id}/edit`}
                        onDelete={() => {}}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{(data.total ?? data.items.length).toLocaleString()} characters</p>
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
