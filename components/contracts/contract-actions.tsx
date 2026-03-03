"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ContractStatus, UserRole } from "@/lib/generated/prisma/client";
import {
  canSubmitForReview,
  canApproveContract,
  canSendForSigning,
  isAdminOrManager,
} from "@/lib/permissions";
import { canTransition } from "@/lib/contract-transitions";
import { buildSignUrl } from "@/lib/sign-token";
import { AiRiskPanel } from "@/components/contracts/ai-risk-panel";
import { Copy, CheckCircle, Send, XCircle } from "lucide-react";
import useSWR from "swr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  contract: {
    id: string;
    status: ContractStatus;
    approverId: string | null;
    signToken: string | null;
  };
  userRole: UserRole;
  userId: string;
}

export function ContractActions({ contract, userRole, userId }: Props) {
  const router = useRouter();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: usersData } = useSWR(
    isAdminOrManager(userRole) ? "/api/users?role=APPROVER" : null,
    fetcher
  );
  const approvers = usersData?.users || [];

  async function doAction(endpoint: string, body?: object) {
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Action failed");
        return false;
      }
      return data;
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    const result = await doAction("submit", {
      approverId: selectedApprover || undefined,
    });
    if (result) {
      toast.success("Contract submitted for review");
      setShowSubmitDialog(false);
      router.refresh();
    }
  };

  const handleApprove = async () => {
    const result = await doAction("approve");
    if (result) {
      toast.success("Contract approved");
      router.refresh();
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    const result = await doAction("reject", { note: rejectNote });
    if (result) {
      toast.success("Contract rejected");
      setShowRejectDialog(false);
      router.refresh();
    }
  };

  const handleSendForSigning = async () => {
    const result = await doAction("send-for-signing");
    if (result) {
      toast.success("Contract sent for signing. Copy the link from the detail panel.");
      router.refresh();
    }
  };

  const copySignLink = () => {
    if (contract.signToken) {
      const url = buildSignUrl(contract.signToken);
      navigator.clipboard.writeText(url);
      toast.success("Signing link copied to clipboard");
    }
  };

  const canSubmit = canSubmitForReview(userRole, userId, userId) && canTransition(contract.status, "PENDING_REVIEW");
  const canApprove = canApproveContract(userRole, userId, contract.approverId) && canTransition(contract.status, "APPROVED");
  const canReject = canApproveContract(userRole, userId, contract.approverId) && canTransition(contract.status, "REJECTED");
  const canSend = canSendForSigning(userRole) && canTransition(contract.status, "SENT_FOR_SIGNING");
  const hasSigned = contract.status === "SIGNED";
  const hasSentForSigning = contract.status === "SENT_FOR_SIGNING" && contract.signToken;

  return (
    <>
      <div className="flex items-center gap-2">
        {canSubmit && (
          <Button size="sm" onClick={() => setShowSubmitDialog(true)}>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Submit for Review
          </Button>
        )}
        {canApprove && (
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Approve
          </Button>
        )}
        {canReject && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
          >
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            Reject
          </Button>
        )}
        {canSend && (
          <Button size="sm" onClick={handleSendForSigning} disabled={loading}>
            Send for Signing
          </Button>
        )}
        {(hasSentForSigning || hasSigned) && contract.signToken && (
          <Button size="sm" variant="outline" onClick={copySignLink}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Sign Link
          </Button>
        )}
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* AI Risk Panel — shows risk score before submission */}
            <AiRiskPanel contractId={contract.id} />

            <div className="space-y-1.5">
              <Label>Assign Approver (optional)</Label>
              <Select
                value={selectedApprover}
                onValueChange={setSelectedApprover}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an approver" />
                </SelectTrigger>
                <SelectContent>
                  {approvers.map((u: { id: string; name: string }) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Explain why this contract is being rejected..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectNote.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
