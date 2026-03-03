"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Loader2,
  RefreshCw,
  Shield,
  XCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface AiAnalysisTabProps {
  contractId: string;
}

interface RiskFlag {
  flag: string;
  severity: "low" | "medium" | "high";
  explanation: string;
}

interface PlaybookDeviation {
  clause: string;
  expected: string;
  found: string;
  severity: "low" | "medium" | "high";
}

interface RedlineSuggestion {
  section: string;
  original: string;
  suggested: string;
  rationale: string;
}

interface Obligation {
  obligation: string;
  deadline: string;
  party: string;
  section: string;
}

interface Analysis {
  riskScore: number | null;
  riskLevel: string | null;
  riskFlags: RiskFlag[] | null;
  playbookDeviations: PlaybookDeviation[] | null;
  redlineSuggestions: RedlineSuggestion[] | null;
  clauseGaps: string[] | null;
  keyTerms: Record<string, string | null> | null;
  obligations: Obligation[] | null;
  contractSummary: string | null;
  generatedAt: string;
}

export function AiAnalysisTab({ contractId }: AiAnalysisTabProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    risk: true,
    playbook: true,
    redlines: false,
    keyTerms: false,
    obligations: false,
    gaps: false,
  });

  // Fetch cached analysis on mount
  useEffect(() => {
    fetchAnalysis();
  }, [contractId]);

  async function fetchAnalysis() {
    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-analysis`);
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } finally {
      setInitialLoading(false);
    }
  }

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-analysis`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Analysis failed");
        return;
      }
      setAnalysis(data.analysis);
      toast.success(data.cached ? "Loaded cached analysis" : "AI analysis complete");
    } catch {
      toast.error("Failed to run AI analysis");
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function riskColor(score: number | null) {
    if (score === null) return "gray";
    if (score <= 30) return "green";
    if (score <= 60) return "yellow";
    return "red";
  }

  function severityBadge(severity: string) {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-700",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[severity] || "bg-gray-100 text-gray-600"}`}
      >
        {severity}
      </span>
    );
  }

  if (initialLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">Loading analysis...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Sparkles className="h-10 w-10 mx-auto text-purple-400 mb-3" />
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          AI Contract Analysis
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Run AI analysis to get a risk assessment, playbook compliance check,
          redline suggestions, and extracted key terms.
        </p>
        <Button onClick={runAnalysis} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileSearch className="h-4 w-4 mr-2" />
              Run AI Analysis
            </>
          )}
        </Button>
      </div>
    );
  }

  const color = riskColor(analysis.riskScore);
  const scoreColors: Record<string, string> = {
    green: "text-green-600 bg-green-50 border-green-200",
    yellow: "text-yellow-700 bg-yellow-50 border-yellow-200",
    red: "text-red-600 bg-red-50 border-red-200",
    gray: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-xs text-gray-500">
            Analyzed {new Date(analysis.generatedAt).toLocaleString()}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={runAnalysis} disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {/* Risk Score + Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center ${scoreColors[color]}`}
          >
            <span className="text-2xl font-bold">{analysis.riskScore ?? "—"}</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider">
              {analysis.riskLevel || "N/A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Risk Overview</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysis.contractSummary || "No summary available."}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Flags */}
      {analysis.riskFlags && analysis.riskFlags.length > 0 && (
        <CollapsibleCard
          title="Risk Flags"
          icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
          count={analysis.riskFlags.length}
          expanded={expandedSections.risk}
          onToggle={() => toggleSection("risk")}
        >
          <div className="divide-y divide-gray-100">
            {(analysis.riskFlags as RiskFlag[]).map((flag, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  {severityBadge(flag.severity)}
                  <span className="text-sm font-medium text-gray-900">{flag.flag}</span>
                </div>
                <p className="text-xs text-gray-500 pl-0">{flag.explanation}</p>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Playbook Compliance */}
      {analysis.playbookDeviations && analysis.playbookDeviations.length > 0 && (
        <CollapsibleCard
          title="Playbook Deviations"
          icon={<Shield className="h-4 w-4 text-orange-500" />}
          count={analysis.playbookDeviations.length}
          expanded={expandedSections.playbook}
          onToggle={() => toggleSection("playbook")}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Clause</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Expected</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Found</th>
                  <th className="text-left py-2 font-medium text-gray-500">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(analysis.playbookDeviations as PlaybookDeviation[]).map((d, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3 font-medium text-gray-900">{d.clause}</td>
                    <td className="py-2 pr-3 text-gray-600">{d.expected}</td>
                    <td className="py-2 pr-3 text-gray-600">{d.found}</td>
                    <td className="py-2">{severityBadge(d.severity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleCard>
      )}

      {/* Redline Suggestions */}
      {analysis.redlineSuggestions && analysis.redlineSuggestions.length > 0 && (
        <CollapsibleCard
          title="Redline Suggestions"
          icon={<FileSearch className="h-4 w-4 text-blue-500" />}
          count={analysis.redlineSuggestions.length}
          expanded={expandedSections.redlines}
          onToggle={() => toggleSection("redlines")}
        >
          <div className="space-y-4">
            {(analysis.redlineSuggestions as RedlineSuggestion[]).map((r, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Section: {r.section}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-red-500 font-semibold mb-1">
                      Original
                    </p>
                    <p className="text-xs text-gray-600 bg-red-50 rounded p-2 line-through decoration-red-300">
                      {r.original}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-green-600 font-semibold mb-1">
                      Suggested
                    </p>
                    <p className="text-xs text-gray-600 bg-green-50 rounded p-2">
                      {r.suggested}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">{r.rationale}</p>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Key Terms */}
      {analysis.keyTerms && (
        <CollapsibleCard
          title="Key Terms Extracted"
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          expanded={expandedSections.keyTerms}
          onToggle={() => toggleSection("keyTerms")}
        >
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analysis.keyTerms as Record<string, string | null>).map(
              ([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-xs text-gray-900 font-medium">
                    {value || "Not found"}
                  </p>
                </div>
              )
            )}
          </div>
        </CollapsibleCard>
      )}

      {/* Obligations */}
      {analysis.obligations && analysis.obligations.length > 0 && (
        <CollapsibleCard
          title="Obligations"
          icon={<AlertTriangle className="h-4 w-4 text-purple-500" />}
          count={analysis.obligations.length}
          expanded={expandedSections.obligations}
          onToggle={() => toggleSection("obligations")}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Obligation</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Party</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Deadline</th>
                  <th className="text-left py-2 font-medium text-gray-500">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(analysis.obligations as Obligation[]).map((o, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3 text-gray-900">{o.obligation}</td>
                    <td className="py-2 pr-3 text-gray-600">{o.party}</td>
                    <td className="py-2 pr-3 text-gray-600">{o.deadline}</td>
                    <td className="py-2 text-gray-500">{o.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleCard>
      )}

      {/* Clause Gaps */}
      {analysis.clauseGaps && analysis.clauseGaps.length > 0 && (
        <CollapsibleCard
          title="Missing Clauses"
          icon={<XCircle className="h-4 w-4 text-red-500" />}
          count={analysis.clauseGaps.length}
          expanded={expandedSections.gaps}
          onToggle={() => toggleSection("gaps")}
        >
          <ul className="space-y-1.5">
            {(analysis.clauseGaps as string[]).map((gap, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                {gap}
              </li>
            ))}
          </ul>
        </CollapsibleCard>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COLLAPSIBLE CARD HELPER
// ─────────────────────────────────────────────────────────────

function CollapsibleCard({
  title,
  icon,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {count}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
