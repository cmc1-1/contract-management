"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type UserRole = "ADMIN" | "MANAGER" | "APPROVER" | "EDITOR" | "VIEWER";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-purple-100 text-purple-700",
  APPROVER: "bg-blue-100 text-blue-700",
  EDITOR: "bg-green-100 text-green-700",
  VIEWER: "bg-gray-100 text-gray-600",
};

const ROLES: UserRole[] = ["ADMIN", "MANAGER", "APPROVER", "EDITOR", "VIEWER"];

export default function AdminUsersPage() {
  const { data: session, status } = useSession();

  const { data, mutate } = useSWR("/api/users", fetcher);
  const users: User[] = data?.users || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER" as UserRole,
  });
  const [editRole, setEditRole] = useState<UserRole>("VIEWER");

  // Guard — only ADMINs can see this page
  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to create user");
        return;
      }
      toast.success("User created");
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "VIEWER" });
      mutate();
    } finally {
      setSaving(false);
    }
  }

  async function handleEditRole(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) {
        toast.error("Failed to update role");
        return;
      }
      toast.success("Role updated");
      setEditUser(null);
      mutate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(userId: string) {
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete user");
      return;
    }
    toast.success("User deleted");
    mutate();
  }

  if (status === "loading") {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} {users.length === 1 ? "user" : "users"} in the system
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-name">Full Name *</Label>
                <Input
                  id="new-name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-email">Email *</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="jane@company.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">Password *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(v) =>
                    setCreateForm((f) => ({ ...f, role: v as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating…" : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role info card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">Role Permissions</p>
          <p className="text-xs text-amber-700 mt-0.5">
            <strong>Admin</strong>: Full access ·{" "}
            <strong>Manager</strong>: Create, approve, send for signing ·{" "}
            <strong>Approver</strong>: Approve/reject assigned contracts ·{" "}
            <strong>Editor</strong>: Create &amp; edit own contracts ·{" "}
            <strong>Viewer</strong>: Read-only
          </p>
        </div>
      </div>

      {/* User list */}
      {users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-900">No users yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {users.map((user) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isSelf = user.id === session?.user?.id;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm bg-gray-100 text-gray-600">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      {isSelf && (
                        <span className="text-xs text-gray-400">(you)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user.email} · Joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium border-0 ${ROLE_COLORS[user.role]}`}
                  >
                    {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </Badge>
                  {!isSelf && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-500"
                        onClick={() => {
                          setEditUser(user);
                          setEditRole(user.role);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Role
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete{" "}
                              <strong>{user.name}</strong> ({user.email}). This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit role dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRole} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <p className="text-sm text-gray-600">
                Updating role for{" "}
                <span className="font-medium">{editUser?.name}</span>
              </p>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Update Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
