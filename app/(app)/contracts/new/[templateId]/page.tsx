import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/templates";
import { ContractCreateForm } from "@/components/contracts/contract-create-form";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function NewContractEditorPage({ params }: PageProps) {
  const { templateId } = await params;
  const template = getTemplate(templateId as "real-estate" | "employment" | "sales" | "blank");

  if (!template) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <span>New Contract</span>
          <span>/</span>
          <span>{template.label}</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          {template.label}
        </h1>
      </div>
      <ContractCreateForm template={template} />
    </div>
  );
}
