'use client'
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import CategoryForm from "@/components/categories/CategoryForm";
import { toast } from "sonner";

const CategoryAddPage = () => {
  const router = useRouter();

  const handleSubmit = () => {
    toast.success("Category created");
    router.push("/categories");
  };

  return (
    <div>
      <PageHeader title="Add Category" backUrl="/categories" />
      <CategoryForm
        submitText="Create Category"
        onSubmit={() => handleSubmit()}
        onCancel={() => router.push("/categories")}
      />
    </div>
  );
};

export default CategoryAddPage;
