import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { mockInvoices, getUserById, getPlanById } from "@/lib/mock-data";
import { format } from "date-fns";

const InvoiceDetail = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const inv = mockInvoices.find((i) => i.id === id);

  if (!inv) return <div className="text-muted-foreground">Invoice not found</div>;

  const user = getUserById(inv.user);
  const plan = getPlanById(inv.plan);

  return (
    <div>
      <PageHeader title={inv.invoiceId} backUrl="/invoices" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Invoice Info">
            <DetailField label="Invoice ID" value={inv.invoiceId} mono />
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Amount" value={`$${inv.amount.toFixed(2)}`} mono />
              <DetailField label="Currency" value={inv.currency} mono />
            </div>
          </DetailSection>
          <DetailSection title="User">
            <DetailField label="User" value={user?.name || inv.user} />
          </DetailSection>
          <DetailSection title="Plan">
            <DetailField label="Plan" value={plan?.name || inv.plan} />
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Payment">
            <DetailField label="Provider" value={inv.paymentProvider} />
            <DetailField label="Status" value={<StatusBadge status={inv.status as any} />} />
            <DetailField
              label="Paid At"
              value={inv.paidAt ? format(new Date(inv.paidAt), "MMM d, yyyy HH:mm") : "—"}
              mono
            />
          </DetailSection>
          <DetailSection title="Timestamps">
            <DetailField label="Created" value={format(new Date(inv.createdAt), "MMM d, yyyy HH:mm")} mono />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
