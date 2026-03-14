import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { getCategoryById } from "@/lib/mock-data";
import Link from "next/link";

const CategoryDetail = async ({params} : {params: {id: string}}) => {
  const { id } = await params;
  const cat = getCategoryById(id || "");

  if (!cat) return <div className="text-muted-foreground">Category not found</div>;

  return (
    <div>
      <PageHeader
        title={cat.name}
        backUrl="/categories"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/categories/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Link>
          </Button>
        }
      />
      <div className="w-full">
        <DetailSection title="Category Info">
          <DetailField label="Name" value={cat.name} />
          <DetailField label="NSFW" value={cat.isNsfw ? <StatusBadge status="nsfw" /> : "No"} />
          <DetailField label="Status" value={<StatusBadge status={cat.isActive ? "active" : "inactive"} />} />
        </DetailSection>
      </div>
    </div>
  );
};

export default CategoryDetail;
