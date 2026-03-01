"use client";

import { useRouter } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";

export function TemplateSelector() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-4">
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => router.push(`/contracts/new/${template.id}`)}
          className="group flex flex-col items-start p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all text-left cursor-pointer"
        >
          <span className="text-3xl mb-4">{template.icon}</span>
          <h3 className="font-semibold text-gray-900 text-sm">
            {template.label}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{template.description}</p>
        </button>
      ))}
    </div>
  );
}
