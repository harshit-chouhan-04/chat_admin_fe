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
import { listMessages } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { useListingQuery } from "@/hooks/use-listing-query";
import { format } from "date-fns";
import { toast } from "sonner";

const MessagesList = () => {
  const { query, setQuery } = useListingQuery({ sort: "createdAt:desc", page: 1, search: "" });

  const page = typeof query.page === "number" ? query.page : Number(query.page ?? 1);
  const search = String(query.search ?? "");
  const sort = String(query.sort ?? "createdAt:desc");
  const flagged = (String(query.flagged ?? "all") as "all" | "flagged" | "clean");
  const sender = (String(query.sender ?? "all") as "all" | "user" | "ai");

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
        ...(flagged === "all" ? {} : { isFlagged: flagged === "flagged" }),
        ...(sender === "all" ? {} : { senderType: sender }),
      },
    }),
    [page, search, sortBy, sortOrder, flagged, sender]
  );

  const { data, loading, error } = usePaginatedApi<any>(listMessages, params);

  useEffect(() => {
    if (error?.message) toast.error(error.message);
  }, [error?.message]);

  return (
    <div>
      <PageHeader title="Messages" description="View all messages" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => {
                  setQuery({ search: e.target.value }, { resetPage: true });
                }}
              />
            </div>

            <Select
              value={flagged}
              onValueChange={(v) => {
                setQuery({ flagged: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Flagged" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sender}
              onValueChange={(v) => {
                setQuery({ sender: v === "all" ? null : v }, { resetPage: true });
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Sender" />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
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
                <SelectItem value="tokenCount:desc">Tokens (high)</SelectItem>
                <SelectItem value="cost:desc">Cost (high)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conversation</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead className="w-[300px]">Content</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                {/* <TableHead>Flagged</TableHead> */}
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
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((msg: any) => (
                  <TableRow key={msg.id ?? msg._id}>
                    <TableCell className="text-sm text-muted-foreground font-mono">{msg.conversation.user.name ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={msg.senderType === "CHARACTER" ? "CHARACTER" : "USER"} />
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">{msg.content ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{msg.tokenCount ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {typeof msg.cost === "number" ? `₹${msg.cost.toFixed(3)}` : "—"}
                    </TableCell>
                    {/* <TableCell>
                      {msg.isFlagged ? <StatusBadge status="flagged" /> : <span className="text-sm text-muted-foreground">—</span>}
                    </TableCell> */}
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, HH:mm") : "—"}
                    </TableCell>
                    <TableCell>
                      <RowActions viewUrl={`/messages/${msg.id ?? msg._id}/detail`} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {(data.total ?? data.items.length).toLocaleString()} messages
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

export default MessagesList;
