"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { getUser, listConversations, listInvoices } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
export default function UserDetail() {
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState<Error | null>(null);

  const [creditsToAdd, setCreditsToAdd] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setLoadingUser(true);
    setUserError(null);

    getUser(String(id), { signal: ac.signal })
      .then((u) => {
        if (ac.signal.aborted) return;
        setUser(u ?? null);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setUser(null);
        setUserError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoadingUser(false);
      });

    return () => ac.abort();
  }, [id]);

  useEffect(() => {
    if (userError?.message) toast.error(userError.message);
  }, [userError?.message]);

  const userId = useMemo(() => {
    const v = user?.id ?? user?._id ?? id;
    return v ? String(v) : "";
  }, [user?.id, user?._id, id]);

  const { data: conversationsData, error: conversationsError } = usePaginatedApi<any>(
    listConversations,
    {
      page: 1,
      limit: 10,
      sortBy: "lastMessageAt",
      sortOrder: "desc",
      filters: userId ? { user: userId } : {},
    }
  );
  const { data: invoicesData, error: invoicesError } = usePaginatedApi<any>(
    listInvoices,
    {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      filters: userId ? { user: userId } : {},
    }
  );

  useEffect(() => {
    if (conversationsError?.message) toast.error(conversationsError.message);
  }, [conversationsError?.message]);

  useEffect(() => {
    if (invoicesError?.message) toast.error(invoicesError.message);
  }, [invoicesError?.message]);

  if (loadingUser && !user) return <div className="text-muted-foreground">Loading...</div>;
  if (!user) return <div className="text-muted-foreground">User not found</div>;

  const userConversations = conversationsData.items ?? [];
  const userInvoices = invoicesData.items ?? [];

  const handleAddCredits = () => {
    const amount = parseInt(creditsToAdd);
    if (isNaN(amount) || amount <= 0) return;
    toast.success("Credits Added", {
      description: `${amount.toLocaleString()} credits added to ${user.name}'s account.`,
    });
    setCreditsToAdd("");
    setDialogOpen(false);
  };

  return (
    <div>
      <PageHeader title={user.name ?? "User"} description={user.username ? `@${user.username}` : undefined} backUrl="/users" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Profile">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-secondary">
                  {String(user.name ?? "?")
                    .split(" ")
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name ?? userId}</p>
                <p className="text-sm text-muted-foreground">{user.email ?? "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Username" value={user.username ? `@${user.username}` : "—"} mono />
              <DetailField label="Email" value={user.email ?? "—"} />
            </div>
          </DetailSection>

          <DetailSection title="Usage">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Credits" value={
                <div className="flex items-center gap-2">
                  <span className="font-mono">
                    {typeof user.credits === "number" ? user.credits.toLocaleString() : "—"}
                  </span>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Credits to {user.name ?? "user"}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <label className="text-sm font-medium text-foreground">Credits Amount</label>
                        <Input
                          type="number"
                          placeholder="e.g. 500"
                          value={creditsToAdd}
                          onChange={(e) => setCreditsToAdd(e.target.value)}
                          className="mt-1.5"
                          min="1"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCredits} disabled={!creditsToAdd || parseInt(creditsToAdd) <= 0}>Add Credits</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              } />
              <DetailField label="Messages Left" value={String(user.numberOfMessageLeft ?? "—")} mono />
            </div>
          </DetailSection>

          {/* Conversations Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Conversations ({userConversations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {userConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Character</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Intimacy</TableHead>
                      <TableHead>Last Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {userConversations.map((conv: any) => {
                        const convId = conv.id ?? conv._id;
                        const characterName =
                          typeof conv.character === "object" && conv.character?.name
                            ? conv.character.name
                            : String(conv.character ?? "—");
                      return (
                          <TableRow key={convId}>
                          <TableCell>
                              <Link href={`/conversations/${convId}/detail`} className="text-primary hover:underline font-medium">
                                {conv.title ?? convId}
                            </Link>
                          </TableCell>
                            <TableCell className="text-muted-foreground">{characterName}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">{conv.messageCount ?? "—"}</TableCell>
                            <TableCell>
                              {conv.intimacyStage ? <StatusBadge status={String(conv.intimacyStage).toLowerCase() as any} /> : "—"}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground">
                              {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), "MMM d, HH:mm") : "—"}
                            </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Invoices ({userInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {userInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {userInvoices.map((inv: any) => {
                        const invId = inv.id ?? inv._id;
                        const planName =
                          typeof inv.plan === "object" && inv.plan?.name
                            ? inv.plan.name
                            : String(inv.plan ?? "—");
                      return (
                          <TableRow key={invId}>
                          <TableCell>
                              <Link href={`/invoices/${invId}/detail`} className="text-primary hover:underline font-mono text-xs">
                                {inv.invoiceId ?? invId}
                            </Link>
                          </TableCell>
                            <TableCell className="text-muted-foreground">{planName}</TableCell>
                            <TableCell className="font-mono">{typeof inv.amount === "number" ? `$${inv.amount.toFixed(2)}` : "—"}</TableCell>
                            <TableCell>{inv.status ? <StatusBadge status={inv.status as any} /> : "—"}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">
                              {inv.createdAt ? format(new Date(inv.createdAt), "MMM d, yyyy") : "—"}
                            </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <DetailSection title="Account">
            <DetailField
              label="Email Verified"
              value={<StatusBadge status={user.isEmailVerified ? "verified" : "unverified"} />}
            />
            <DetailField
              label="Created"
              value={user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
              mono
            />
            <DetailField
              label="Last Login"
              value={user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy HH:mm") : "—"}
              mono
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
