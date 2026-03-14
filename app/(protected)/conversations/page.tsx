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
import { mockConversations, getUserById, getCharacterById } from "@/lib/mock-data";
import { format } from "date-fns";

const ConversationsList = () => {
  const [search, setSearch] = useState("");
  const filtered = mockConversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Conversations" description="View platform conversations" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
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
                {filtered.map((conv) => {
                  const user = getUserById(conv.user);
                  const char = getCharacterById(conv.character);
                  return (
                    <TableRow key={conv.id}>
                      <TableCell className="text-sm font-medium">{conv.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user?.name || conv.user}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{char?.name || conv.character}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{conv.messageCount}</TableCell>
                      <TableCell className="text-sm">{conv.intimacyStage} <span className="text-muted-foreground font-mono">({conv.intimacyScore})</span></TableCell>
                      <TableCell className="text-right font-mono text-sm">{conv.totalTokenCount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm">${conv.totalCost.toFixed(2)}</TableCell>
                      <TableCell><StatusBadge status={conv.isArchived ? "archived" : "active"} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{format(new Date(conv.lastMessageAt), "MMM d")}</TableCell>
                      <TableCell><RowActions viewUrl={`/conversations/${conv.id}/detail`} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} conversations</p>
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

export default ConversationsList;
