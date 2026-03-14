import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive" | "verified" | "unverified" | "paid" | "pending" | "failed" | "flagged" | "archived" | "nsfw" | "public" | "unlisted" | "CHARACTER" | "USER" | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  verified: { label: "Verified", variant: "default" },
  unverified: { label: "Unverified", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  pending: { label: "Pending", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
  flagged: { label: "Flagged", variant: "destructive" },
  archived: { label: "Archived", variant: "secondary" },
  nsfw: { label: "NSFW", variant: "destructive" },
  public: { label: "Public", variant: "default" },
  unlisted: { label: "Unlisted", variant: "secondary" },
  CHARACTER: { label: "Character", variant: "default" },
  USER: { label: "User", variant: "secondary" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={cn("font-medium text-xs", className)}>
      {config.label}
    </Badge>
  );
}
