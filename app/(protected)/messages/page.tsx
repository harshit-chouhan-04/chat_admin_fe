"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { mockMessages } from "@/lib/mock-data";
import { format } from "date-fns";

const MessagesList = () => {
  const [search, setSearch] = useState("");
  const filtered = mockMessages.filter(m =>
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Messages" description="View all messages" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conversation</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead className="w-[300px]">Content</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Flagged</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="text-sm text-muted-foreground font-mono">{msg.conversation}</TableCell>
                  <TableCell>
                    <StatusBadge status={msg.senderType === "user" ? "active" : "public"} />
                  </TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate">{msg.content}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{msg.tokenCount}</TableCell>
                  <TableCell className="text-right font-mono text-sm">${msg.cost.toFixed(3)}</TableCell>
                  <TableCell>{msg.isFlagged ? <StatusBadge status="flagged" /> : <span className="text-sm text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{format(new Date(msg.createdAt), "MMM d, HH:mm")}</TableCell>
                  <TableCell><RowActions viewUrl={`/messages/${msg.id}`} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} messages</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-8 px-3 font-mono text-xs">1</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesList;
