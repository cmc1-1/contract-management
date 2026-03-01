import { TemplateSelector } from "@/components/contracts/template-selector";

export default function NewContractPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">New Contract</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose a template to get started
        </p>
      </div>
      <TemplateSelector />
    </div>
  );
}
