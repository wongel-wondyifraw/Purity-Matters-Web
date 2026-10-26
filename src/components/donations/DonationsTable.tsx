"use client";

import React, { useState, useMemo } from "react";
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Trash2,
  Check,
  X,
  Smartphone,
  Building2,
  CreditCard,
  Copy,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminData } from "@/context/AdminDataContext";
import { PaymentSettingsModal } from "@/components/resources/PaymentSettingsModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import { TablePagination } from "@/components/ui/TablePagination";
import { DonationRecord } from "@/types/admin";

export function DonationsTable() {
  const {
    donations,
    isDonationsLoading,
    verifyDonation,
    rejectDonation,
    deleteDonation,
    donationsFilter,
    setDonationsFilter,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states for Verify, Reject, and Delete
  const [verifyingDonation, setVerifyingDonation] = useState<DonationRecord | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [isVerifyingSubmitting, setIsVerifyingSubmitting] = useState(false);

  const [rejectingDonation, setRejectingDonation] = useState<DonationRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectingSubmitting, setIsRejectingSubmitting] = useState(false);

  const [deletingDonationId, setDeletingDonationId] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Calculations
  const totalVerifiedAmount = useMemo(() => {
    return donations
      .filter((d) => d.status === "verified")
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [donations]);

  const pendingVerificationCount = useMemo(() => {
    return donations.filter(
      (d) => d.status === "payment_submitted" || d.status === "pending"
    ).length;
  }, [donations]);

  const verifiedCount = useMemo(() => {
    return donations.filter((d) => d.status === "verified").length;
  }, [donations]);

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.referenceNumber.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        (item.clientUsername && item.clientUsername.toLowerCase().includes(q)) ||
        (item.clientPhone && item.clientPhone.toLowerCase().includes(q)) ||
        (item.telegramId && item.telegramId.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (donationsFilter !== "all" && item.status !== donationsFilter) {
        return false;
      }

      if (methodFilter !== "all" && item.paymentMethod.toLowerCase() !== methodFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [donations, searchQuery, donationsFilter, methodFilter]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, donationsFilter, methodFilter]);

  const paginatedDonations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDonations.slice(start, start + pageSize);
  }, [filteredDonations, currentPage, pageSize]);

  const statusDropdownOptions: DropdownOption[] = [
    { value: "all", label: "All Statuses" },
    { value: "payment_submitted", label: "⏳ Pending Verification" },
    { value: "verified", label: "✅ Verified" },
    { value: "pending", label: "⏳ Awaiting Transfer" },
    { value: "rejected", label: "❌ Rejected" },
  ];

  const methodDropdownOptions: DropdownOption[] = [
    { value: "all", label: "All Payment Methods" },
    { value: "telebirr", label: "📱 Telebirr" },
    { value: "cbe", label: "🏦 CBE" },
  ];

  const handleConfirmVerify = async () => {
    if (!verifyingDonation) return;
    setIsVerifyingSubmitting(true);
    try {
      await verifyDonation(verifyingDonation.id, verifyNotes.trim() || undefined);
      setVerifyingDonation(null);
      setVerifyNotes("");
    } finally {
      setIsVerifyingSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingDonation) return;
    setIsRejectingSubmitting(true);
    try {
      await rejectDonation(rejectingDonation.id, rejectReason.trim() || undefined);
      setRejectingDonation(null);
      setRejectReason("");
    } finally {
      setIsRejectingSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDonationId) return;
    await deleteDonation(deletingDonationId);
    setDeletingDonationId(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 w-full">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        {/* Total Raised */}
        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Donated</span>
            <div className="w-8 h-8 rounded-full bg-[#F6CE46]/20 text-[#202328] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#202328]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-[#202328] tracking-tight">
              {totalVerifiedAmount.toLocaleString()} <span className="text-xs font-bold text-neutral-500">ETB</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Verified Ministry Giving</p>
          </div>
        </Card>

        {/* Total Gifts */}
        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Gifts</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-[#202328] tracking-tight">
              {donations.length}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">All Recorded Donations</p>
          </div>
        </Card>

        {/* Pending Verification */}
        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Awaiting Verification</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight flex items-center gap-1.5">
              <span>{pendingVerificationCount}</span>
              {pendingVerificationCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Requires Console Review</p>
          </div>
        </Card>

        {/* Verified */}
        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Verified Gifts</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              {verifiedCount}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Confirmed in Bank / Telebirr</p>
          </div>
        </Card>
      </div>

      {/* 2. MAIN TABLE CARD */}
      <Card className="flex-1 flex flex-col min-h-0 bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
        {/* Card Header & Controls */}
        <CardHeader className="shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] pb-3.5 sm:pb-4">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Ministry Donations & Giving</span>
              <span className="text-xs font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full ml-1">
                {filteredDonations.length}
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
              Review and verify donations contributed via Telebirr and CBE accounts.
            </CardDescription>
          </div>

          {/* Search, Filter, & Payment Settings Button */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56 lg:w-64 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
              <Input
                placeholder="Search ref, donor, phone..."
                className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Dropdown */}
            <div className="w-[170px]">
              <CustomDropdown
                options={statusDropdownOptions}
                value={donationsFilter}
                onChange={setDonationsFilter}
              />
            </div>

            {/* Method Dropdown */}
            <div className="w-[160px]">
              <CustomDropdown
                options={methodDropdownOptions}
                value={methodFilter}
                onChange={setMethodFilter}
              />
            </div>

            {/* Payment Settings Modal Trigger */}
            <PaymentSettingsModal />
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden relative">
          <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
            <Table>
              <TableHeader className="bg-neutral-50/75 sticky top-0 z-10 backdrop-blur-xs border-b border-black/[0.06]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-3 pl-4">
                    Reference / Date
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-3">
                    Donor
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-3 text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-3 text-center">
                    Method
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-3 text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-3">
                    Admin Notes
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-3 pr-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isDonationsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-black/[0.04]">
                      <TableCell className="pl-4 py-3"><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="py-3"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="py-3 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                      <TableCell className="py-3 text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                      <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="pr-4 py-3 text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-neutral-400">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-1">
                          <HeartHandshake className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-[#202328]">No Donations Found</p>
                        <p className="text-xs text-neutral-500">
                          {searchQuery || donationsFilter !== "all" || methodFilter !== "all"
                            ? "Try adjusting your search query or filters."
                            : "Donations initiated by bot users via Telebirr or CBE will appear here automatically."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDonations.map((item) => {
                    const isTelebirr = item.paymentMethod.toLowerCase() === "telebirr";
                    const isCbe = item.paymentMethod.toLowerCase() === "cbe";

                    return (
                      <TableRow
                        key={item.id}
                        className="hover:bg-black/[0.015] border-b border-black/[0.04] transition-colors"
                      >
                        {/* Reference / Date */}
                        <TableCell className="pl-4 py-3 align-top">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#202328]">
                            <span>{item.referenceNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.referenceNumber, `ref-${item.id}`)}
                              className="text-neutral-400 hover:text-neutral-700 transition-colors p-0.5 rounded cursor-pointer"
                              title="Copy Reference"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === `ref-${item.id}` && (
                              <span className="text-[10px] text-emerald-600 font-sans font-semibold">Copied!</span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {item.createdAt}
                          </div>
                        </TableCell>

                        {/* Donor Details */}
                        <TableCell className="py-3.5 align-top min-w-[160px] whitespace-normal">
                          <div className="text-xs font-bold text-[#202328] leading-tight">
                            {item.clientName}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-neutral-500">
                            {item.clientUsername && (
                              <span className="text-neutral-600 font-medium">@{item.clientUsername}</span>
                            )}
                            {item.clientPhone && (
                              <>
                                <span className="text-neutral-300">•</span>
                                <span>{item.clientPhone}</span>
                              </>
                            )}
                            <span className="text-neutral-300">•</span>
                            <span className="font-mono text-[10px] text-neutral-400">ID: {item.telegramId}</span>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="py-3 text-right align-top">
                          <div className="text-xs font-black text-[#202328]">
                            {Number(item.amount).toLocaleString()}{" "}
                            <span className="text-[10px] font-bold text-neutral-500">{item.currency}</span>
                          </div>
                        </TableCell>

                        {/* Payment Method */}
                        <TableCell className="py-3 text-center align-top">
                          {isTelebirr ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5FB] text-[#1B4F72] border border-[#AED6F1]">
                              <Smartphone className="w-3 h-3 text-[#2980B9]" />
                              <span>Telebirr</span>
                            </span>
                          ) : isCbe ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF9E7] text-[#7D6608] border border-[#F9E79F]">
                              <Building2 className="w-3 h-3 text-[#B7950B]" />
                              <span>CBE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                              <CreditCard className="w-3 h-3" />
                              <span className="capitalize">{item.paymentMethod}</span>
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 text-center align-top">
                          {item.status === "verified" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : item.status === "payment_submitted" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Review</span>
                            </span>
                          ) : item.status === "rejected" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">
                              <Clock className="w-3 h-3" />
                              <span>Awaiting Transfer</span>
                            </span>
                          )}
                        </TableCell>

                        {/* Admin Notes */}
                        <TableCell className="py-3.5 align-top min-w-[180px] max-w-[320px] whitespace-normal">
                          {item.adminNotes ? (
                            <div className="flex items-start">
                              <span className="inline-flex border border-black/10 text-xs bg-white text-[#202328] font-medium px-2.5 py-1 rounded-xl shadow-2xs max-w-full whitespace-normal break-words leading-relaxed text-left" title={item.adminNotes}>
                                {item.adminNotes}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-300 italic">—</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="pr-4 py-3 text-right align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== "verified" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setVerifyingDonation(item);
                                  setVerifyNotes(item.adminNotes || "");
                                }}
                                className="h-7 px-2 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer"
                                title="Verify Donation"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                <span>Verify</span>
                              </Button>
                            )}

                            {item.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectingDonation(item);
                                  setRejectReason("");
                                }}
                                className="h-7 px-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer"
                                title="Reject Donation"
                              >
                                <X className="w-3 h-3 mr-1" />
                                <span>Reject</span>
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeletingDonationId(item.id)}
                              className="h-7 w-7 p-0 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer rounded-full"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination Footer */}
          <div className="shrink-0 border-t border-black/[0.06] p-3 sm:p-4 bg-white/50">
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredDonations.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      {/* VERIFY CONFIRMATION MODAL */}
      <Dialog open={!!verifyingDonation} onOpenChange={(open) => !open && setVerifyingDonation(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#202328] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verify Donation</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Confirm that the transfer of{" "}
              <b>
                {verifyingDonation?.amount} {verifyingDonation?.currency}
              </b>{" "}
              (Ref: <code>{verifyingDonation?.referenceNumber}</code>) has been received in your{" "}
              <b>{verifyingDonation?.paymentMethod.toUpperCase()}</b> account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-[#202328] block">
              Admin Notes / Verification Remarks (Optional)
            </label>
            <Input
              placeholder="e.g. Verified in CBE Mobile Banking ref #123456"
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              className="text-xs h-9 bg-neutral-50 border-black/10 rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerifyingDonation(null)}
              className="h-8 text-xs rounded-full"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isVerifyingSubmitting}
              onClick={handleConfirmVerify}
              className="h-8 text-xs rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isVerifyingSubmitting ? "Verifying..." : "Confirm & Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT MODAL */}
      <Dialog open={!!rejectingDonation} onOpenChange={(open) => !open && setRejectingDonation(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#202328] flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Reject Donation</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Mark donation <code>{rejectingDonation?.referenceNumber}</code> as rejected if the funds were not received or the reference is invalid.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-[#202328] block">
              Rejection Reason (Optional)
            </label>
            <Input
              placeholder="e.g. Transfer not reflected in statement after 24h"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs h-9 bg-neutral-50 border-black/10 rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingDonation(null)}
              className="h-8 text-xs rounded-full"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isRejectingSubmitting}
              onClick={handleConfirmReject}
              className="h-8 text-xs rounded-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isRejectingSubmitting ? "Rejecting..." : "Reject Donation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingDonationId}
        onClose={() => setDeletingDonationId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Donation Record"
        description="Are you sure you want to delete this donation record? This action cannot be undone."
      />
    </div>
  );
}
