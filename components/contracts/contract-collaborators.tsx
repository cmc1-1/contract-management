"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, X, Users } from "lucide-react";
import { UserRole } from "@/lib/generated/prisma/client";
import { isAdminOrManager } from "@/lib/permissions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Collaborator {
  user: { id: string; name: string; email: string };
}

interface Props {
  contractId: string;
  collaborators: Collaborator[];
  userRole: UserRole;
  userId: string;
}

export function ContractCollaborators({
  contractId,
  collaborators: initialCollaborators,
  userRole,
  userId,
}: Props) {
  const [selected, setSelected] = useState("");
  const { data: usersData } = useSWR(
    isAdminOrManager(userRole) ? "/api/users" : null,
    fetcher
  );
  const { data: collabData, mutate } = useSWR(
    `/api/contracts/${contractId}/collaborators`,
    fetcher
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collaborators: Collaborator[] = collabData?.collaborators || initialCollaborators;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: any[] = usersData?.users || [];

  async function addCollaborator() {
    if (!selected) return;
    const res = await fetch(`/api/contracts/${contractId}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected }),
    });
    if (!res.ok) {
      toast.error("Failed to add collaborator");
      return;
    }
    toast.success("Collaborator added");
    setSelected("");
    mutate();
  }

  async function removeCollaborator(collaboratorUserId: string) {
    const res = await fetch(`/api/contracts/${contractId}/collaborators`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: collaboratorUserId }),
    });
    if (!res.ok) {
      toast.error("Failed to remove collaborator");
      return;
    }
    toast.success("Collaborator removed");
    mutate();
  }

  const canManage = isAdminOrManager(userRole);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {canManage && (
        <div className="flex gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Add a collaborator..." />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter((u) => !collaborators.some((c) => c.user.id === u.id))
                .map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button onClick={addCollaborator} disabled={!selected} size="sm">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
      )}

      {collaborators.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No collaborators yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {collaborators.map((c) => (
            <div
              key={c.user.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                  {c.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {c.user.name}
                </p>
                <p className="text-xs text-gray-500">{c.user.email}</p>
              </div>
              {canManage && c.user.id !== userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-red-600"
                  onClick={() => removeCollaborator(c.user.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
