"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractStatus, UserRole } from "@/lib/generated/prisma/client";
import { CommentThread } from "@/components/comments/comment-thread";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { ContractCollaborators } from "@/components/contracts/contract-collaborators";
import { buildSignUrl } from "@/lib/sign-token";
import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ContractDetailTabsProps {
  contract: {
    id: string;
    status: ContractStatus;
    contentHtml: string | null;
    uploadedFileKey: string | null;
    uploadedFileName: string | null;
    approverId: string | null;
    approvalNote: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    signToken: string | null;
    approver: { id: string; name: string; email: string } | null;
    collaborators: { user: { id: string; name: string; email: string } }[];
  };
  userRole: UserRole;
  userId: string;
}

export function ContractDetailTabs({
  contract,
  userRole,
  userId,
}: ContractDetailTabsProps) {
  const copySignLink = () => {
    if (contract.signToken) {
      navigator.clipboard.writeText(buildSignUrl(contract.signToken));
      toast.success("Signing link copied");
    }
  };

  return (
    <Tabs defaultValue="content">
      <TabsList className="bg-gray-100">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="approval">Approval</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="people">People</TabsTrigger>
      </TabsList>

      {/* Content Tab */}
      <TabsContent value="content">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {contract.uploadedFileKey ? (
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {contract.uploadedFileName}
                </p>
                <a
                  href={`/api/contracts/${contract.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Download / View
                </a>
              </div>
            </div>
          ) : contract.contentHtml ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contract.contentHtml }}
            />
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              No content yet. Edit this contract to add content.
            </p>
          )}
        </div>
      </TabsContent>

      {/* Approval Tab */}
      <TabsContent value="approval">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned Approver</p>
              <p className="text-sm font-medium text-gray-900">
                {contract.approver?.name || "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Decision</p>
              <p className="text-sm font-medium text-gray-900">
                {contract.approvedAt
                  ? `Approved on ${formatDate(contract.approvedAt)}`
                  : contract.rejectedAt
                  ? `Rejected on ${formatDate(contract.rejectedAt)}`
                  : "Pending"}
              </p>
            </div>
          </div>
          {contract.approvalNote && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {contract.approvalNote}
              </p>
            </div>
          )}

          {/* Sign link if sent for signing or signed */}
          {(contract.status === "SENT_FOR_SIGNING" ||
            contract.status === "SIGNED") &&
            contract.signToken && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-2">Signing Link</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-50 rounded px-3 py-2 flex-1 truncate">
                    {buildSignUrl(contract.signToken)}
                  </code>
                  <Button variant="outline" size="sm" onClick={copySignLink}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                </div>
                {contract.status === "SIGNED" && (
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Signed by counterparty
                  </p>
                )}
              </div>
            )}
        </div>
      </TabsContent>

      {/* Comments Tab */}
      <TabsContent value="comments">
        <CommentThread contractId={contract.id} />
      </TabsContent>

      {/* Activity Tab */}
      <TabsContent value="activity">
        <ActivityFeed contractId={contract.id} />
      </TabsContent>

      {/* People Tab */}
      <TabsContent value="people">
        <ContractCollaborators
          contractId={contract.id}
          collaborators={contract.collaborators}
          userRole={userRole}
          userId={userId}
        />
      </TabsContent>
    </Tabs>
  );
}
