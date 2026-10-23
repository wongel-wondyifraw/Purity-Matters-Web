"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  Check,
  Copy,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  Users,
  Plus,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { ConsoleUser } from "@/types/auth";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { TablePagination } from "@/components/ui/TablePagination";

export function UsersManagement() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  const [users, setUsers] = useState<ConsoleUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ConsoleUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ConsoleUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("purity_console_token");
      const response = await fetch(`${apiUrl}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load console users");
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("User Load Error", err.message || "Could not retrieve user list.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Clipboard copy helper
  const copyToClipboard = (text: string, idKey: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(idKey);
      toast.success("Copied to clipboard", text);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (targetUser: ConsoleUser) => {
    try {
      const token = localStorage.getItem("purity_console_token");
      const nextStatus = !targetUser.isActive;

      const response = await fetch(`${apiUrl}/api/users/${targetUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update user status");
      }

      toast.success(
        nextStatus ? "Account Activated" : "Account Deactivated",
        `${targetUser.fullName || targetUser.email} is now ${nextStatus ? "active" : "deactivated"}.`
      );
      await fetchUsers();
    } catch (err: any) {
      toast.error("Update Error", err.message || "Could not change status.");
    }
  };

  // Confirm delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem("purity_console_token");
      const response = await fetch(`${apiUrl}/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete user");
      }

      toast.success(
        "User Deleted",
        `Administrator account for ${userToDelete.email} has been removed.`
      );
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error("Delete Failed", err.message || "Could not delete user.");
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        u.firstName.toLowerCase().includes(q) ||
        (u.middleName && u.middleName.toLowerCase().includes(q)) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        String(u.id).includes(q);

      if (!matchesSearch) return false;

      if (roleFilter !== "all" && u.role.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const getInitials = (u: ConsoleUser) => {
    const f = u.firstName ? u.firstName.charAt(0).toUpperCase() : "";
    const l = u.lastName ? u.lastName.charAt(0).toUpperCase() : "";
    return `${f}${l}` || "AD";
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      {/* Header and Controls - exactly matching ClientsTable layout */}
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] pb-3.5 sm:pb-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Console Users</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            List of console administrators and users
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search name, email, role..."
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 2. Below Search on Mobile: All Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filter Dropdown */}
            <CustomDropdown
              id="select-user-role-filter"
              value={roleFilter}
              options={[
                { value: "all", label: "All Roles" },
                { value: "superadmin", label: "Superadmins" },
                { value: "admin", label: "Administrators" },
                { value: "counselor", label: "Counselors" },
              ]}
              onChange={setRoleFilter}
              className="shrink-0 flex-1 sm:flex-none"
              triggerClassName="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
            />

            {/* Action Button: + User */}
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#202328] hover:bg-black text-white text-xs font-semibold h-9 px-4 rounded-full flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
              <span>User</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        {/* Users Table Container with internal scroll and sticky header */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                  <TableHead className="text-[#202328] font-bold text-xs py-3 w-16 px-4">
                    ID
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Name
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Email Address
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Role
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Status
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Last Active
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-neutral-500 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#202328]" />
                        <span className="font-medium">Loading console users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-neutral-500 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                          <Users className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-[#202328] text-sm">No Users Found</p>
                        <p className="text-xs text-neutral-500">
                          {searchQuery || roleFilter !== "all"
                            ? "No console users match your filter criteria. Try resetting filters."
                            : "No console users found yet. Click 'Add User' to register your first administrative team member."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    const isSuper = u.role.toLowerCase() === "superadmin";

                    return (
                      <TableRow
                        key={u.id}
                        className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                      >
                        {/* ID */}
                        <TableCell className="text-neutral-400 text-xs font-semibold px-4">
                          #{u.id}
                        </TableCell>

                        {/* Name */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8 border border-black/10 text-xs">
                              <AvatarFallback className="bg-[#202328] text-white font-bold text-xs">
                                {getInitials(u)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-bold text-[#202328] text-sm flex items-center gap-1.5">
                              <span>{u.fullName || `${u.firstName} ${u.lastName}`}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold uppercase bg-black/[0.05] border border-black/[0.08] text-[#202328] px-1.5 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Email Address */}
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 text-xs text-[#202328] font-mono">
                            <span>{u.email}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                              title="Copy Email"
                              className="text-neutral-400 hover:text-[#202328] cursor-pointer"
                            >
                              {copiedId === `email-${u.id}` ? (
                                <Check className="w-3 h-3 text-[#202328]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs ${
                              isSuper
                                ? "bg-[#202328] text-white"
                                : "bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328]"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 text-[#F6CE46]" />
                            <span className="capitalize">{u.role}</span>
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {u.isActive !== false ? (
                            <span className="inline-flex items-center gap-1.5 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                              <Check className="w-3 h-3 text-[#202328] stroke-[2.5]" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-neutral-100 border border-black/10 text-neutral-600 text-xs font-medium px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                              <span>Deactivated</span>
                            </span>
                          )}
                        </TableCell>

                        {/* Last Active */}
                        <TableCell className="text-neutral-400 text-xs font-medium">
                          {u.lastLoginAt
                            ? new Date(u.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>

                        {/* 3-Dot Actions Menu exactly matching ClientsTable */}
                        <TableCell className="text-right px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-lg text-neutral-400 hover:text-[#202328] hover:bg-black/[0.05] transition-colors cursor-pointer outline-none">
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-44 bg-white border border-black/10 shadow-lg rounded-xl p-1 z-50"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToEdit(u);
                                  setIsEditOpen(true);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#202328] hover:bg-neutral-100 rounded-lg cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Edit User</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(u)}
                                disabled={isSelf}
                                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                                  isSelf
                                    ? "text-neutral-300 cursor-not-allowed"
                                    : "text-[#202328] hover:bg-neutral-100"
                                }`}
                              >
                                <Power className="w-3.5 h-3.5 text-neutral-500" />
                                <span>
                                  {u.isActive !== false ? "Deactivate User" : "Activate User"}
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => copyToClipboard(u.email, `email-${u.id}`)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#202328] hover:bg-neutral-100 rounded-lg cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Copy Email</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-1 border-t border-black/[0.06]" />

                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToDelete(u);
                                  setIsDeleteModalOpen(true);
                                }}
                                disabled={isSelf}
                                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                                  isSelf
                                    ? "text-neutral-300 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50"
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Delete User</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="users"
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchUsers}
        apiUrl={apiUrl}
      />

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setUserToEdit(null);
        }}
        onSuccess={fetchUsers}
        user={userToEdit}
        apiUrl={apiUrl}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete Console User"
        description="Are you sure you want to remove this administrator account? This action cannot be undone and will permanently revoke console access."
        itemName={userToDelete ? userToDelete.email : ""}
      />
    </Card>
  );
}
