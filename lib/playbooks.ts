// lib/playbooks.ts — Company playbook definitions per contract type
// Inspired by Ironclad's AI Playbooks. Defines preferred, acceptable,
// and unacceptable terms that the AI compares contracts against.
//
// This is a static config file. In a future version, these could be
// managed by admins through a database-backed UI.

export interface PlaybookEntry {
  /** The clause or contract provision name */
  clause: string;
  /** Whether this clause MUST be present in the contract */
  required: boolean;
  /** The company's ideal position for this clause */
  preferredPosition: string;
  /** An acceptable fallback if preferred isn't achievable */
  fallbackPosition: string;
  /** Terms the company should not accept */
  unacceptable: string;
}

export interface Playbook {
  type: string;
  description: string;
  entries: PlaybookEntry[];
}

// ─────────────────────────────────────────────────────────────
// EMPLOYMENT CONTRACT PLAYBOOK
// ─────────────────────────────────────────────────────────────

const EMPLOYMENT_PLAYBOOK: Playbook = {
  type: "EMPLOYMENT",
  description: "Standard terms for employment agreements including full-time, part-time, and contractor conversions.",
  entries: [
    {
      clause: "Position and Duties",
      required: true,
      preferredPosition: "Clearly defined role, title, reporting structure, and primary responsibilities",
      fallbackPosition: "General role description with flexibility clause for additional duties",
      unacceptable: "No position description or vague 'as assigned' without any specifics",
    },
    {
      clause: "Compensation and Benefits",
      required: true,
      preferredPosition: "Fixed salary with clear pay schedule, bonus structure, and comprehensive benefits package detailed",
      fallbackPosition: "Base salary stated with reference to separate benefits documentation",
      unacceptable: "No salary specified, or compensation contingent on undefined metrics",
    },
    {
      clause: "Term and At-Will Employment",
      required: true,
      preferredPosition: "At-will employment with mutual 30-day written notice for termination",
      fallbackPosition: "At-will with 14-day notice period",
      unacceptable: "Fixed-term with automatic renewal and no early termination option",
    },
    {
      clause: "Termination",
      required: true,
      preferredPosition: "Clear termination for cause definitions, mutual termination rights with 30-day notice, severance provisions for without-cause termination",
      fallbackPosition: "Termination for cause with 14-day notice, limited severance",
      unacceptable: "Unilateral termination rights for employer without notice or severance, or no termination clause",
    },
    {
      clause: "Non-Compete",
      required: true,
      preferredPosition: "12-month duration, 50-mile geographic radius, limited to direct competitors in same industry",
      fallbackPosition: "18-month duration, 100-mile radius, broader industry scope",
      unacceptable: "No non-compete clause, or non-compete exceeding 24 months or unlimited geography",
    },
    {
      clause: "Non-Solicitation",
      required: true,
      preferredPosition: "12-month non-solicitation of employees and clients after departure",
      fallbackPosition: "18-month non-solicitation limited to direct reports and active clients",
      unacceptable: "No non-solicitation clause",
    },
    {
      clause: "Confidentiality and NDA",
      required: true,
      preferredPosition: "Perpetual confidentiality for trade secrets, 3-year term for general confidential information, clear definitions of what constitutes confidential information",
      fallbackPosition: "5-year confidentiality term for all information categories",
      unacceptable: "No confidentiality clause, or confidentiality limited to less than 1 year",
    },
    {
      clause: "Intellectual Property Assignment",
      required: true,
      preferredPosition: "All work product, inventions, and IP created during employment assigned to company, including moral rights waiver",
      fallbackPosition: "Work-related IP assigned to company; personal projects excluded if disclosed",
      unacceptable: "No IP assignment clause, or employee retains rights to work-related inventions",
    },
    {
      clause: "Dispute Resolution",
      required: false,
      preferredPosition: "Binding arbitration in company's jurisdiction with each party bearing own costs",
      fallbackPosition: "Mediation first, then arbitration in mutually agreed location",
      unacceptable: "Litigation only with employee choosing jurisdiction",
    },
    {
      clause: "Governing Law",
      required: true,
      preferredPosition: "Governed by the laws of the company's state of incorporation",
      fallbackPosition: "Governed by the laws of the state where employee is based",
      unacceptable: "No governing law specified, or foreign jurisdiction",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// SALES / SERVICE CONTRACT PLAYBOOK
// ─────────────────────────────────────────────────────────────

const SALES_PLAYBOOK: Playbook = {
  type: "SALES",
  description: "Standard terms for sales agreements, service contracts, SaaS agreements, and vendor engagements.",
  entries: [
    {
      clause: "Scope of Services / Deliverables",
      required: true,
      preferredPosition: "Detailed statement of work with specific deliverables, milestones, acceptance criteria, and timeline",
      fallbackPosition: "General scope with reference to separate SOW document",
      unacceptable: "No scope definition or vague 'best efforts' without deliverables",
    },
    {
      clause: "Payment Terms",
      required: true,
      preferredPosition: "Net-30 payment terms, milestone-based billing, clear invoicing procedures",
      fallbackPosition: "Net-45 payment terms with progress billing",
      unacceptable: "Payment in advance exceeding 25% of total value, or Net-60+ terms",
    },
    {
      clause: "Limitation of Liability",
      required: true,
      preferredPosition: "Mutual limitation of liability capped at total contract value, excluding gross negligence and willful misconduct",
      fallbackPosition: "Liability capped at 2x the fees paid in the preceding 12 months",
      unacceptable: "Unlimited liability, or one-sided limitation favouring only the other party",
    },
    {
      clause: "Indemnification",
      required: true,
      preferredPosition: "Mutual indemnification for third-party claims arising from each party's breach, negligence, or IP infringement",
      fallbackPosition: "Mutual indemnification limited to IP infringement and gross negligence",
      unacceptable: "One-sided indemnification requiring company to indemnify for all claims regardless of fault",
    },
    {
      clause: "Warranty",
      required: true,
      preferredPosition: "12-month warranty that services/products conform to specifications, with cure period for defects",
      fallbackPosition: "90-day warranty with limited remedy (re-performance or refund)",
      unacceptable: "No warranty or 'as-is' delivery without any quality guarantee",
    },
    {
      clause: "Intellectual Property Rights",
      required: true,
      preferredPosition: "Company retains all IP in deliverables upon full payment; vendor retains pre-existing IP with perpetual license granted",
      fallbackPosition: "Joint ownership with unrestricted license to both parties",
      unacceptable: "Vendor retains all IP including custom deliverables, or no IP clause",
    },
    {
      clause: "Termination",
      required: true,
      preferredPosition: "Either party may terminate with 30-day written notice; immediate termination for material breach with 15-day cure period",
      fallbackPosition: "60-day notice for convenience; 30-day cure period for breach",
      unacceptable: "No termination for convenience, or lock-in for the full term without exit option",
    },
    {
      clause: "Confidentiality",
      required: true,
      preferredPosition: "Mutual NDA covering all shared information, 3-year survival period, standard exceptions for public knowledge",
      fallbackPosition: "Mutual NDA with 2-year survival",
      unacceptable: "One-sided confidentiality, or no confidentiality clause",
    },
    {
      clause: "Force Majeure",
      required: false,
      preferredPosition: "Mutual force majeure with defined events, 30-day notification requirement, right to terminate if event exceeds 90 days",
      fallbackPosition: "Mutual force majeure with 60-day notification and 180-day termination trigger",
      unacceptable: "No force majeure clause, or one-sided force majeure",
    },
    {
      clause: "Governing Law and Dispute Resolution",
      required: true,
      preferredPosition: "Company's state law governs; disputes resolved by binding arbitration in company's jurisdiction",
      fallbackPosition: "Neutral state law; mediation then arbitration in mutually agreed venue",
      unacceptable: "Other party's jurisdiction with litigation only, or no governing law clause",
    },
    {
      clause: "Data Protection and Privacy",
      required: false,
      preferredPosition: "Compliance with applicable data protection laws (GDPR, CCPA), data processing agreement included, clear data handling and breach notification procedures",
      fallbackPosition: "Reference to applicable privacy laws with commitment to reasonable security measures",
      unacceptable: "No mention of data protection, or permission to share data with third parties without consent",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// REAL ESTATE CONTRACT PLAYBOOK
// ─────────────────────────────────────────────────────────────

const REAL_ESTATE_PLAYBOOK: Playbook = {
  type: "REAL_ESTATE",
  description: "Standard terms for real estate purchase agreements, commercial leases, and property transactions.",
  entries: [
    {
      clause: "Property Description",
      required: true,
      preferredPosition: "Full legal description with address, parcel number, lot dimensions, and any included fixtures/improvements",
      fallbackPosition: "Street address with reference to recorded plat or survey",
      unacceptable: "Vague property description without legal identifiers",
    },
    {
      clause: "Purchase Price / Rent",
      required: true,
      preferredPosition: "Fixed purchase price or base rent clearly stated, with payment schedule, earnest money amount, and escrow instructions",
      fallbackPosition: "Price stated with reference to separate payment schedule",
      unacceptable: "No price specified, or price subject to unilateral adjustment",
    },
    {
      clause: "Inspection Contingency",
      required: true,
      preferredPosition: "Buyer has 14-day inspection period; may terminate with full deposit refund if material defects found",
      fallbackPosition: "10-day inspection period with negotiation rights for repairs",
      unacceptable: "No inspection contingency, or 'as-is' without any inspection right",
    },
    {
      clause: "Financing Contingency",
      required: true,
      preferredPosition: "Buyer has 30-day financing contingency; full refund of deposit if financing not obtained",
      fallbackPosition: "21-day financing contingency with partial deposit at risk",
      unacceptable: "No financing contingency on financed purchases",
    },
    {
      clause: "Title and Survey",
      required: true,
      preferredPosition: "Seller provides marketable title free of liens and encumbrances; title insurance provided at seller's expense; current survey included",
      fallbackPosition: "Seller warrants marketable title; title insurance at buyer's expense",
      unacceptable: "Quitclaim deed only, no title warranty, no title insurance option",
    },
    {
      clause: "Closing Timeline",
      required: true,
      preferredPosition: "Closing within 45 days of contract execution with specific milestone dates",
      fallbackPosition: "Closing within 60 days with reasonable extension provisions",
      unacceptable: "No closing date specified, or open-ended timeline exceeding 90 days",
    },
    {
      clause: "Property Condition and Disclosures",
      required: true,
      preferredPosition: "Seller provides full disclosure of known defects, environmental conditions, and property history; property delivered in current condition with all systems operational",
      fallbackPosition: "Seller discloses known material defects only",
      unacceptable: "No disclosure requirements, or blanket disclaimer of all property conditions",
    },
    {
      clause: "Environmental Compliance",
      required: false,
      preferredPosition: "Phase I environmental assessment completed; seller warrants no known contamination; seller responsible for pre-existing environmental issues",
      fallbackPosition: "Phase I assessment at buyer's expense; seller warrants no known environmental violations",
      unacceptable: "No environmental provisions; buyer assumes all environmental risk",
    },
    {
      clause: "Default and Remedies",
      required: true,
      preferredPosition: "Clear default definitions with 15-day cure period; specific performance available as remedy; liquidated damages limited to earnest money for buyer default",
      fallbackPosition: "30-day cure period; standard legal remedies available",
      unacceptable: "Immediate forfeiture of all deposits without cure opportunity, or unlimited damages",
    },
    {
      clause: "Governing Law",
      required: true,
      preferredPosition: "Governed by the laws of the state where the property is located",
      fallbackPosition: "Governed by the laws of the state where the property is located with arbitration clause",
      unacceptable: "Governed by laws of a different state than where property is located",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// OTHER / GENERIC CONTRACT PLAYBOOK
// ─────────────────────────────────────────────────────────────

const OTHER_PLAYBOOK: Playbook = {
  type: "OTHER",
  description: "General contract terms applicable to miscellaneous agreement types.",
  entries: [
    {
      clause: "Scope and Purpose",
      required: true,
      preferredPosition: "Clear statement of the agreement's purpose, parties' obligations, and expected outcomes",
      fallbackPosition: "General purpose statement with reference to attached schedules",
      unacceptable: "No clear purpose or scope defined",
    },
    {
      clause: "Term and Renewal",
      required: true,
      preferredPosition: "Fixed term with clear start and end dates; renewal by mutual written consent only",
      fallbackPosition: "Fixed term with auto-renewal and 60-day opt-out notice",
      unacceptable: "Evergreen contract with no termination option, or no term specified",
    },
    {
      clause: "Termination",
      required: true,
      preferredPosition: "Either party may terminate with 30-day written notice for convenience; immediate termination for material breach with 15-day cure",
      fallbackPosition: "60-day notice for convenience; 30-day cure for breach",
      unacceptable: "No termination clause, or termination only available to one party",
    },
    {
      clause: "Limitation of Liability",
      required: true,
      preferredPosition: "Mutual cap at total contract value; exclusion of consequential and indirect damages",
      fallbackPosition: "Mutual cap at 2x contract value",
      unacceptable: "Unlimited liability or no liability cap",
    },
    {
      clause: "Confidentiality",
      required: true,
      preferredPosition: "Mutual NDA with 3-year survival, clear exceptions, return/destruction of information on termination",
      fallbackPosition: "Mutual NDA with 2-year survival",
      unacceptable: "No confidentiality provision",
    },
    {
      clause: "Governing Law",
      required: true,
      preferredPosition: "Governed by company's state law; disputes resolved by binding arbitration",
      fallbackPosition: "Mutually agreed state law; mediation before arbitration",
      unacceptable: "No governing law clause or foreign jurisdiction without consent",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PLAYBOOK REGISTRY
// ─────────────────────────────────────────────────────────────

const PLAYBOOKS: Record<string, Playbook> = {
  EMPLOYMENT: EMPLOYMENT_PLAYBOOK,
  SALES: SALES_PLAYBOOK,
  REAL_ESTATE: REAL_ESTATE_PLAYBOOK,
  OTHER: OTHER_PLAYBOOK,
};

/**
 * Get the playbook for a given contract type.
 * Falls back to OTHER playbook for unknown types.
 */
export function getPlaybook(contractType: string): Playbook {
  return PLAYBOOKS[contractType] ?? PLAYBOOKS.OTHER;
}

/**
 * Format a playbook as a text table for injection into an LLM prompt.
 * This is the primary way playbooks become LLM context.
 */
export function formatPlaybookForPrompt(contractType: string): string {
  const playbook = getPlaybook(contractType);
  const lines: string[] = [
    `COMPANY PLAYBOOK FOR ${playbook.type} CONTRACTS:`,
    `${playbook.description}`,
    "",
    "| Clause | Required | Preferred Position | Acceptable Fallback | Unacceptable |",
    "|--------|----------|-------------------|---------------------|--------------|",
  ];

  for (const entry of playbook.entries) {
    lines.push(
      `| ${entry.clause} | ${entry.required ? "Yes" : "No"} | ${entry.preferredPosition} | ${entry.fallbackPosition} | ${entry.unacceptable} |`
    );
  }

  return lines.join("\n");
}

/**
 * Get just the clause names for a contract type.
 * Used for quick "missing clause" checks.
 */
export function getRequiredClauses(contractType: string): string[] {
  const playbook = getPlaybook(contractType);
  return playbook.entries
    .filter((e) => e.required)
    .map((e) => e.clause);
}
