"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { getCategory } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";

const CategoryDetail = ({ params }: { params: { id: string } }) => {
  const id = params?.id;
  const [cat, setCat] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setLoading(true);

    getCategory(String(id), { signal: ac.signal })
      .then((c) => {
        if (ac.signal.aborted) return;
        setCat(c ?? null);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setCat(null);
        toast.error(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const catId = useMemo(() => String(cat?.id ?? cat?._id ?? id ?? ""), [cat?.id, cat?._id, id]);

  if (loading && !cat) return <div className="text-muted-foreground">Loading...</div>;
  if (!cat) return <div className="text-muted-foreground">Category not found</div>;

  return (
    <div>
      <PageHeader
        title={cat.name ?? catId}
        backUrl="/categories"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/categories/${catId}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Link>
          </Button>
        }
      />
      <div className="w-full">
        <DetailSection title="Category Info">
          <DetailField label="Name" value={cat.name ?? "—"} />
          <DetailField label="NSFW" value={cat.isNsfw ? <StatusBadge status="nsfw" /> : "No"} />
          <DetailField label="Status" value={<StatusBadge status={cat.isActive ? "active" : "inactive"} />} />
        </DetailSection>
      </div>
    </div>
  );
};

export default CategoryDetail;
