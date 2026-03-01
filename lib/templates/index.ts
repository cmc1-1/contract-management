import { employmentTemplate } from "./employment";
import { realEstateTemplate } from "./real-estate";
import { salesTemplate } from "./sales";

export type TemplateId = "real-estate" | "employment" | "sales" | "blank";

export interface TemplateConfig {
  id: TemplateId;
  label: string;
  description: string;
  icon: string;
  defaultTitle: string;
  content: object | null;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "real-estate",
    label: "Real Estate Contract",
    description: "Purchase agreement for property transactions",
    icon: "🏠",
    defaultTitle: "Real Estate Purchase Agreement",
    content: realEstateTemplate,
  },
  {
    id: "employment",
    label: "Employment Contract",
    description: "Employment agreement with compensation and terms",
    icon: "👤",
    defaultTitle: "Employment Agreement",
    content: employmentTemplate,
  },
  {
    id: "sales",
    label: "Sales Contract",
    description: "Sales and service agreement for goods or services",
    icon: "🤝",
    defaultTitle: "Sales and Service Agreement",
    content: salesTemplate,
  },
  {
    id: "blank",
    label: "Blank Contract",
    description: "Start from scratch with an empty document",
    icon: "📄",
    defaultTitle: "New Contract",
    content: null,
  },
];

export function getTemplate(id: TemplateId): TemplateConfig | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export { employmentTemplate, realEstateTemplate, salesTemplate };
