"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Users,
  Check,
  Copy,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useAdminData } from "@/context/AdminDataContext";
import { ClientRegistrationModal } from "@/components/clients/ClientRegistrationModal";
import { EditClientModal } from "@/components/clients/EditClientModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientRecord } from "@/types/admin";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { TablePagination } from "@/components/ui/TablePagination";

export function ClientsTable() {
  const {
    clients,
    deleteClient,
    isClientsLoading,
    clientFilter,
    setClientFilter,
    exportClientsCsv,
    copyToClipboard,
    copiedId,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState("");

  // State for modals
  const [clientToEdit, setClientToEdit] = useState<ClientRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        client.fullName.toLowerCase().includes(q) ||
        (client.username && client.username.toLowerCase().includes(q)) ||
        client.phone.toLowerCase().includes(q) ||
        client.telegramId.includes(q);

      if (!matchesSearch) return false;

      if (clientFilter === "verified") return client.isRegistered;
      if (clientFilter === "in-progress") return !client.isRegistered;
      if (clientFilter === "admin") return client.role === "admin";
      if (clientFilter === "ethiopia") {
        return (
          client.phone &&
          (client.phone.startsWith("+251") || client.phone.startsWith("251"))
        );
      }
      if (clientFilter === "diaspora") {
        return (
          client.phone &&
          client.phone !== "Not shared" &&
          !client.phone.startsWith("+251") &&
          !client.phone.startsWith("251")
        );
      }
      return true;
    });
  }, [clients, searchQuery, clientFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to first page on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, clientFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Registered Clients</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            List of registered clients
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search name, phone, @user, ID..."
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 2. Below Search on Mobile: All Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filter Dropdown */}
            <CustomDropdown
              id="select-clients-filter"
              value={clientFilter}
              options={[
                { value: "all", label: "All Registrations" },
                { value: "verified", label: "Verified (Has Phone)" },
                { value: "in-progress", label: "In-Progress" },
                { value: "admin", label: "Administrators" },
                { value: "ethiopia", label: "Ethiopia (+251)" },
                { value: "diaspora", label: "Diaspora / Global" },
              ]}
              onChange={setClientFilter}
              className="shrink-0 flex-1 sm:flex-none"
              triggerClassName="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
            />

            {/* Export Action Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportClientsCsv}
              className="border-black/15 text-[#202328] bg-white/80 hover:bg-white text-xs h-9 px-3.5 rounded-full cursor-pointer shadow-2xs font-semibold shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-neutral-600" />
              <span>Export</span>
            </Button>

            {/* Action Button: + Client */}
            <div className="shrink-0">
              <ClientRegistrationModal />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        {/* Clients Table Container with internal scroll and sticky header */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                  <TableHead className="text-[#202328] font-bold text-xs py-3 w-16 px-4 shrink-0">
                    ID
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[160px]">
                    Name
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[130px]">
                    Telegram ID
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[130px]">
                    Verified Phone
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[110px]">
                    Status
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[120px]">
                    Joined
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 text-right min-w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isClientsLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`cli-skel-${idx}`} className="border-b border-black/[0.04]">
                      <TableCell className="px-4 py-3"><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-36" />
                          <Skeleton className="h-2.5 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-18 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                      <TableCell className="text-right px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Skeleton className="w-7 h-7 rounded-full" />
                          <Skeleton className="w-7 h-7 rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-neutral-500 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                          <Users className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-[#202328] text-sm">No Clients Found</p>
                        <p className="text-xs text-neutral-500">
                          {searchQuery || clientFilter !== "all"
                            ? "No clients match your filter criteria. Try resetting filters."
                            : "No registered clients found yet. New users will appear here automatically when they join the bot."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                    >
                      <TableCell className="text-neutral-400 text-xs font-semibold px-4">
                        #{client.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8 border border-black/10 text-xs">
                            <AvatarFallback className="bg-[#202328] text-white font-bold text-xs">
                              {client.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "CL"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-bold text-[#202328] text-sm flex items-center gap-1.5">
                            <span>{client.fullName}</span>
                            {client.languageCode && (
                              <span className="text-[10px] font-bold uppercase bg-black/[0.05] border border-black/[0.08] text-[#202328] px-1.5 py-0.5 rounded-full">
                                {client.languageCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <div className="inline-flex items-center gap-1.5 text-xs text-[#202328] font-mono">
                            <span>{client.telegramId}</span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(client.telegramId, `tid-${client.id}`)
                              }
                              title="Copy Telegram ID"
                              className="text-neutral-400 hover:text-[#202328] cursor-pointer"
                            >
                              {copiedId === `tid-${client.id}` ? (
                                <Check className="w-3 h-3 text-[#202328]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                            {client.username ? `@${client.username}` : "—"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-[#202328] font-medium">
                        <div className="inline-flex items-center gap-1.5">
                          <span>{client.phone}</span>
                          {client.phone && client.phone.startsWith("+") && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(client.phone, `ph-${client.id}`)}
                              title="Copy Phone Number"
                              className="text-neutral-400 hover:text-[#202328] cursor-pointer"
                            >
                              {copiedId === `ph-${client.id}` ? (
                                <Check className="w-3 h-3 text-[#202328]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {client.isRegistered ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                            <Check className="w-3 h-3 text-[#202328] stroke-[2.5]" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-neutral-100 border border-black/10 text-neutral-600 text-xs font-medium px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            <span>Awaiting Phone</span>
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-neutral-400 text-xs font-medium">
                        {client.joinedAt}
                      </TableCell>

                      {/* 3-Dot Actions Menu */}
                      <TableCell className="text-right px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-lg text-neutral-400 hover:text-[#202328] hover:bg-black/[0.05] transition-colors cursor-pointer outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 bg-white border border-black/10 shadow-lg rounded-xl p-1 z-50">
                            <DropdownMenuItem
                              onClick={() => {
                                setClientToEdit(client);
                                setIsEditModalOpen(true);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#202328] hover:bg-neutral-100 rounded-lg cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Edit Client</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(client.telegramId, `tid-${client.id}`)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#202328] hover:bg-neutral-100 rounded-lg cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Copy Telegram ID</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-t border-black/[0.06]" />
                            <DropdownMenuItem
                              onClick={() => {
                                setClientToDelete(client);
                                setIsDeleteModalOpen(true);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete Client</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredClients.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="clients"
      />

      {/* Edit Client Modal */}
      <EditClientModal
        client={clientToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setClientToEdit(null);
        }}
      />

      {/* Confirm Delete Client Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={async () => {
          if (clientToDelete) {
            await deleteClient(clientToDelete.id);
          }
        }}
        title="Delete Client Record"
        description="Are you sure you want to permanently delete this client? All counseling requests and activity records linked to this account will be removed."
        itemName={
          clientToDelete
            ? `${clientToDelete.fullName} (Telegram ID: ${clientToDelete.telegramId})`
            : undefined
        }
      />
    </Card>
  );
}
