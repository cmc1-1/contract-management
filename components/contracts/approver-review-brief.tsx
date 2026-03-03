"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Shield,
  Sparkles,
  XCircle,
} from "lucide-react";

interface ApproverReviewBriefProps {
  contractId: string;
}

interface Deviation {
  clause: string;
  issue: string;
}

interface ObligationHighlight {
  obligation: string;
  deadline: string;
}

interface Brief {
  executiveBullets: string[];
  playbookCompliance: "GREEN" | "YELLOW" | "RED";
  topDeviations: Deviation[];
  obligationHighlights: ObligationHighlight[];
  topRisk: string;
  recommendation: string;
}

export function ApproverReviewBrief({ contractId }: ApproverReviewBriefProps) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkCached();
  }, [contractId]);

  async function checkCached() {
    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-approver-brief`);
      const data = await res.json();
      if (data.brief) {
        setBrief(data.brief as Brief);
      }
    } finally {
      setInitialLoading(false);
    }
  }

  async function generateBrief() {
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-approver-brief`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.brief) {
        setBrief(data.brief as Brief);
      }
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return null;

  if (!brief) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="text-sm font-semibold text-purple-900">
                AI Review Brief
              </h3>
              <p className="text-xs text-purple-600">
                Get an AI-generated summary to help with your approval decision
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={generateBrief}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Generate Brief
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const complianceConfig = {
    GREEN: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: CheckCircle,
      label: "Compliant",
    },
    YELLOW: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: AlertTriangle,
      label: "Minor Deviations",
    },
    RED: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: XCircle,
      label: "Policy Violations",
    },
  };

  const compliance = complianceConfig[brief.playbookCompliance] || complianceConfig.YELLOW;
  const ComplianceIcon = compliance.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-gray-900">AI Review Brief</h3>
        <div
          className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full ${compliance.bg} ${compliance.border} border`}
        >
          <ComplianceIcon className={`h-3.5 w-3.5 ${compliance.text}`} />
          <span className={`text-xs font-semibold ${compliance.text}`}>
            {compliance.label}
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Executive Summary
        </h4>
        <ul className="space-y-1.5">
          {brief.executiveBullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-gray-400 mt-0.5">•</span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Deviations */}
        {brief.topDeviations.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <Shield className="h-3 w-3 inline mr-1 text-orange-500" />
              Playbook Deviations
            </h4>
            <div className="space-y-2">
              {brief.topDeviations.map((d, i) => (
                <div key={i} className="bg-orange-50 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-orange-800">{d.clause}</p>
                  <p className="text-xs text-orange-600">{d.issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Obligations */}
        {brief.obligationHighlights.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <Clock className="h-3 w-3 inline mr-1 text-blue-500" />
              Key Obligations
            </h4>
            <div className="space-y-2">
              {brief.obligationHighlights.map((o, i) => (
                <div key={i} className="bg-blue-50 rounded-lg p-2.5">
                  <p className="text-xs text-blue-800">{o.obligation}</p>
                  <p className="text-[10px] text-blue-600 font-medium">
                    Deadline: {o.deadline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk & Recommendation */}
      <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
        {brief.topRisk !== "None identified" && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Top Risk
              </p>
              <p className="text-sm text-red-700">{brief.topRisk}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              AI Recommendation
            </p>
            <p className="text-sm text-gray-900 font-medium">{brief.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
