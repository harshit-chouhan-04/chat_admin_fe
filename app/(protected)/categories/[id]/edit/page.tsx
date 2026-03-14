'use client'

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import CategoryForm, { type CategoryFormValues } from "@/components/categories/CategoryForm";
import { getCategoryById } from "@/lib/mock-data";
import { toast } from "sonner";

const CategoryEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const existing = useMemo(() => (id ? getCategoryById(id) : null), [id]);

  const handleSubmit = (_values: CategoryFormValues) => {
    toast.success("Category updated");
    if (id) router.push(`/categories/${id}/detail`);
    else router.push("/categories");
  };

  if (!id) {
    return (
      <div>
        <PageHeader title="Edit Category" backUrl="/categories" />
        <div className="text-sm text-muted-foreground">Missing category id.</div>
      </div>
    );
  }

  if (!existing) {
    return (
      <div>
        <PageHeader title="Edit Category" backUrl="/categories" />
        <div className="text-sm text-muted-foreground">Category not found.</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Edit ${existing.name}`} backUrl={`/categories/${id}/detail`} />
      <CategoryForm
        initialValues={{
          name: existing.name,
          slug: existing.slug,
          isNsfw: existing.isNsfw,
          isActive: existing.isActive,
        }}
        submitText="Update Category"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/categories/${id}/detail`)}
      />
    </div>
  );
};

export default CategoryEditPage;
