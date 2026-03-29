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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUser, listConversations, listInvoices, listPlans, updateUserNumberOfMessageLeft } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/use-paginated-api";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatCurrencyINR } from "@/lib/utils";
export default function UserDetail() {
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState<Error | null>(null);

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingMessages, setSavingMessages] = useState(false);

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

  const { data: plansData, error: plansError } = usePaginatedApi<any>(listPlans, {
    page: 1,
    limit: 100,
    sortBy: "price",
    sortOrder: "asc",
    filters: { isActive: true },
  });

  useEffect(() => {
    if (conversationsError?.message) toast.error(conversationsError.message);
  }, [conversationsError?.message]);

  useEffect(() => {
    if (invoicesError?.message) toast.error(invoicesError.message);
  }, [invoicesError?.message]);

  useEffect(() => {
    if (plansError?.message) toast.error(plansError.message);
  }, [plansError?.message]);

  useEffect(() => {
    if (!dialogOpen) return;
    setSelectedPlanId("");
  }, [dialogOpen]);

  const userConversations = conversationsData.items ?? [];
  const userInvoices = invoicesData.items ?? [];
  const plans = useMemo(() => plansData.items ?? [], [plansData.items]);

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null;
    return (
      plans.find((p: any) => String(p?.id ?? p?._id ?? "") === String(selectedPlanId)) ?? null
    );
  }, [plans, selectedPlanId]);

  const messagesFromPlan = useMemo(() => {
    if (!selectedPlan) return 0;
    const raw =
      selectedPlan.messageLimit ??
      selectedPlan.numberOfMessages ??
      selectedPlan.numberOfMessage ??
      selectedPlan.messages;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [selectedPlan]);

  if (loadingUser && !user) return <div className="text-muted-foreground">Loading...</div>;
  if (!user) return <div className="text-muted-foreground">User not found</div>;

  const handleAddMessagesLeft = async () => {
    const amount = messagesFromPlan;
    if (!userId) return;
    if (!selectedPlan) return;
    if (!Number.isFinite(amount) || amount <= 0) return;

    const currentCount =
      typeof user.numberOfMessageLeft === "number" ? user.numberOfMessageLeft : 0;
    const newTotal = currentCount + amount;

    try {
      setSavingMessages(true);
      const updated = await updateUserNumberOfMessageLeft(userId, {
        numberOfMessageLeft: newTotal,
        planId: String(selectedPlan?.id ?? selectedPlan?._id ?? selectedPlanId),
      });

      if (updated && typeof updated === "object") {
        setUser(updated);
      } else {
        setUser((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            numberOfMessageLeft: newTotal,
          };
        });
      }

      toast.success("Messages Added", {
        description: `${amount.toLocaleString()} messages added from plan ${selectedPlan.name ?? selectedPlan.id ?? selectedPlan._id ?? ""}.`,
      });
      setSelectedPlanId("");
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingMessages(false);
    }
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
              <DetailField
                label="Credits"
                value={typeof user.credits === "number" ? user.credits.toLocaleString() : "—"}
                mono
              />
              <DetailField
                label="Messages Left"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {typeof user.numberOfMessageLeft === "number" ? user.numberOfMessageLeft.toLocaleString() : "—"}
                    </span>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                          <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Messages to {user.name ?? "user"}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <label className="text-sm font-medium text-foreground">Plan</label>
                          <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={savingMessages}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {plans.length === 0 ? (
                                <SelectItem value="__none" disabled>
                                  No active plans
                                </SelectItem>
                              ) : (
                                plans.map((plan: any) => {
                                  const pid = String(plan?.id ?? plan?._id ?? "");
                                  const msg =
                                    typeof plan?.messageLimit === "number" ? plan.messageLimit : Number(plan?.messageLimit);
                                  const msgText = Number.isFinite(msg) ? msg.toLocaleString() : "—";
                                  const credits = typeof plan?.credits === "number" ? plan.credits : Number(plan?.credits);
                                  const creditsText = Number.isFinite(credits) ? `${credits.toLocaleString()} credits` : "";
                                  return (
                                    <SelectItem key={pid} value={pid}>
                                      {plan?.name ?? pid} ({msgText} msgs, {creditsText})
                                    </SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>

                          <label className="text-sm font-medium text-foreground mt-4 block">Messages to Add</label>
                          <Input
                            value={selectedPlan ? messagesFromPlan.toLocaleString() : ""}
                            placeholder="Select a plan first"
                            className="mt-1.5"
                            disabled
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={savingMessages}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddMessagesLeft}
                            disabled={
                              savingMessages ||
                              !selectedPlanId ||
                              !selectedPlan ||
                              !Number.isFinite(messagesFromPlan) ||
                              messagesFromPlan <= 0
                            }
                          >
                            {savingMessages ? "Saving..." : "Add Messages"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                }
              />
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
                            <TableCell className="font-mono">{typeof inv.amount === "number" ? formatCurrencyINR(inv.amount) : "—"}</TableCell>
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
