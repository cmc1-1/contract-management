"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { Send, MessageSquare } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  contractId: string;
}

export function CommentThread({ contractId }: Props) {
  const { data: session } = useSession();
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const { data, mutate } = useSWR(
    `/api/contracts/${contractId}/comments`,
    fetcher
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments: any[] = data?.comments || [];

  async function postComment() {
    if (!body.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) {
        toast.error("Failed to post comment");
        return;
      }
      setBody("");
      mutate();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={postComment}
            disabled={posting || !body.trim()}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Comment
          </Button>
        </div>
      </div>

      {/* Comments */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3 divide-y divide-gray-50">
          {comments.map((comment) => (
            <div key={comment.id} className="pt-3 flex gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                  {comment.author?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author?.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
