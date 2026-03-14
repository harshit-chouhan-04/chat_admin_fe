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
import { listCharacters, listConversations, listUsers } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { useListingQuery } from "@/hooks/use-listing-query";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ConversationsListClient() {
  const { query, setQuery } = useListingQuery({ sort: "lastMessageAt:desc", page: 1, search: "" });

  const page = typeof query.page === "number" ? query.page : Number(query.page ?? 1);
  const search = String(query.search ?? "");
  const sort = String(query.sort ?? "lastMessageAt:desc");
  const status = String(query.status ?? "all") as "all" | "active" | "archived";

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
      filters: status === "all" ? undefined : { isArchived: status === "archived" },
    }),
    [page, search, sortBy, sortOrder, status],
  );

  const { data, loading, error } = usePaginatedApi<any>(listConversations, params);
  const { data: usersLookup } = usePaginatedApi<any>(listUsers, { page: 1, limit: 100 });
  const { data: charactersLookup } = usePaginatedApi<any>(listCharacters, { page: 1, limit: 100 });

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

  const characterNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of charactersLookup.items ?? []) {
      const id = c?.id ?? c?._id;
      if (id) map.set(String(id), String(c.name ?? id));
    }
    return map;
  }, [charactersLookup.items]);

  return (
    <div>
      <PageHeader title="Conversations" description="View platform conversations" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
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
                <SelectItem value="archived">Archived</SelectItem>
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
                <SelectItem value="lastMessageAt:desc">Last message (recent)</SelectItem>
                <SelectItem value="createdAt:desc">Created (newest)</SelectItem>
                <SelectItem value="messageCount:desc">Messages (high)</SelectItem>
                <SelectItem value="totalCost:desc">Cost (high)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Character</TableHead>
                  <TableHead className="text-right">Messages</TableHead>
                  <TableHead>Intimacy</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-sm text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-sm text-muted-foreground">
                      No conversations found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((conv: any) => {
                    const userId = typeof conv.user === "string" ? conv.user : conv.user?.id ?? conv.user?._id;
                    const characterId =
                      typeof conv.character === "string" ? conv.character : conv.character?.id ?? conv.character?._id;
                    const userName =
                      typeof conv.user === "object" && conv.user?.name
                        ? conv.user.name
                        : userId
                          ? userNameById.get(String(userId)) ?? String(userId)
                          : "—";
                    const characterName =
                      typeof conv.character === "object" && conv.character?.name
                        ? conv.character.name
                        : characterId
                          ? characterNameById.get(String(characterId)) ?? String(characterId)
                          : "—";

                    return (
                      <TableRow key={conv.id ?? conv._id}>
                        <TableCell className="text-sm font-medium">{conv.title ?? conv.id ?? conv._id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{userName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{characterName}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{conv.messageCount ?? "—"}</TableCell>
                        <TableCell className="text-sm">
                          {conv.intimacyStage ?? "—"}{" "}
                          {typeof conv.intimacyScore === "number" && (
                            <span className="text-muted-foreground font-mono">({conv.intimacyScore})</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {typeof conv.totalTokenCount === "number" ? conv.totalTokenCount.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {typeof conv.totalCost === "number" ? `$${conv.totalCost.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={conv.isArchived ? "archived" : "active"} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), "MMM d") : "—"}
                        </TableCell>
                        <TableCell>
                          <RowActions viewUrl={`/conversations/${conv.id ?? conv._id}/detail`} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{(data.total ?? data.items.length).toLocaleString()} conversations</p>
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
