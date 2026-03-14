"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { mockPlans } from "@/lib/mock-data";

const PlansList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = mockPlans.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Plans"
        description="Manage subscription plans"
        actions={
          <Button onClick={() => router.push("/plans/add")} size="sm">
            <Plus className="h-4 w-4 mr-1" />Add Plan
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search plans..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
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
              {filtered.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="text-sm font-medium">{plan.name}</TableCell>
                  <TableCell className="text-right font-mono text-sm">${plan.price.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{plan.billingCycle}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{plan.credits.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{plan.messageLimit.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={plan.isActive ? "active" : "inactive"} /></TableCell>
                  <TableCell>
                    <RowActions viewUrl={`/plans/${plan.id}`} editUrl={`/plans/${plan.id}/edit`} onDelete={() => {}} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} plans</p>
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

export default PlansList;
