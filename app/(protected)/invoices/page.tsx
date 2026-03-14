'use client'
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { mockInvoices, getUserById, getPlanById } from "@/lib/mock-data";
import { format } from "date-fns";

const InvoicesList = () => {
  const [search, setSearch] = useState("");
  const filtered = mockInvoices.filter(i =>
    i.invoiceId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Invoices" description="View payment invoices" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
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
              {filtered.map((inv) => {
                const user = getUserById(inv.user);
                const plan = getPlanById(inv.plan);
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm font-mono font-medium">{inv.invoiceId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user?.name || inv.user}</TableCell>
                    <TableCell className="text-sm">{plan?.name || inv.plan}</TableCell>
                    <TableCell className="text-right font-mono text-sm">${inv.amount.toFixed(2)} {inv.currency}</TableCell>
                    <TableCell><StatusBadge status={inv.status as any} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{inv.paymentProvider}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{format(new Date(inv.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell><RowActions viewUrl={`/invoices/${inv.id}`} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} invoices</p>
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

export default InvoicesList;
