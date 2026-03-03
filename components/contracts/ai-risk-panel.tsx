"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Shield,
  Sparkles,
  XCircle,
} from "lucide-react";

interface AiRiskPanelProps {
  contractId: string;
}

interface RiskFlag {
  flag: string;
  severity: "low" | "medium" | "high";
  explanation: string;
}

export function AiRiskPanel({ contractId }: AiRiskPanelProps) {
  const [analysis, setAnalysis] = useState<{
    riskScore: number | null;
    riskLevel: string | null;
    riskFlags: RiskFlag[] | null;
    clauseGaps: string[] | null;
    contractSummary: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Auto-fetch cached analysis on mount
  useEffect(() => {
    checkCachedAnalysis();
  }, [contractId]);

  async function checkCachedAnalysis() {
    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-analysis`);
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } finally {
      setHasChecked(true);
    }
  }

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-analysis`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalysis(data.analysis);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!hasChecked) return null;

  // If no analysis exists, show a small prompt to run one
  if (!analysis) {
    return (
      <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-800">
              Run AI risk check before submitting?
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            disabled={loading}
            className="h-7 text-xs"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Shield className="h-3 w-3 mr-1" />
            )}
            {loading ? "Analyzing..." : "Run Check"}
          </Button>
        </div>
      </div>
    );
  }

  // Determine risk colour
  const score = analysis.riskScore ?? 0;
  const riskConfig =
    score <= 30
      ? { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: CheckCircle }
      : score <= 60
        ? { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: AlertTriangle }
        : { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: XCircle };

  const Icon = riskConfig.icon;
  const topFlags = ((analysis.riskFlags as RiskFlag[]) || [])
    .filter((f) => f.severity === "high" || f.severity === "medium")
    .slice(0, 3);
  const gaps = ((analysis.clauseGaps as string[]) || []).slice(0, 3);

  return (
    <div className={`border ${riskConfig.border} ${riskConfig.bg} rounded-lg p-3 mb-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${riskConfig.text}`} />
        <span className={`text-sm font-semibold ${riskConfig.text}`}>
          Risk Score: {analysis.riskScore}/100 ({analysis.riskLevel})
        </span>
      </div>

      {analysis.contractSummary && (
        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
          {analysis.contractSummary}
        </p>
      )}

      {topFlags.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
            Top Risks
          </p>
          {topFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-700">{flag.flag}</span>
            </div>
          ))}
        </div>
      )}

      {gaps.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
            Missing Clauses
          </p>
          {gaps.map((gap, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1">
              <XCircle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-700">{gap}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
