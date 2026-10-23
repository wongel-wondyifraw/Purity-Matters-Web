"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Package,
  FileText,
  Download,
  Trash2,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Pencil,
  Check,
  X,
  Send,
  Smartphone,
  Building2,
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
import { useAdminData } from "@/context/AdminDataContext";
import { AddResourceModal } from "@/components/resources/AddResourceModal";
import { EditResourceModal } from "@/components/resources/EditResourceModal";
import { PaymentSettingsModal } from "@/components/resources/PaymentSettingsModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import {
  PhysicalBookOrderItem,
  ResourceCatalogItem,
  ResourceOrderRecord,
} from "@/types/admin";

export function ResourcesTable() {
  const {
    resourceCatalog,
    physicalBookOrders,
    resourceOrders,
    updatePhysicalOrderStatus,
    deleteResource,
    deletePhysicalOrder,
    deleteResourceOrder,
    confirmResourceOrderPayment,
    rejectResourceOrderPayment,
    isCatalogLoading,
    isOrdersLoading,
    isResourceOrdersLoading,
    apiUrl,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<"catalog" | "orders" | "shipping">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ebook" | "physical_book">("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [fulfillingId, setFulfillingId] = useState<number | null>(null);

  // State for delete confirmation modal for resource item
  const [resourceToDelete, setResourceToDelete] = useState<ResourceCatalogItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State for delete confirmation modal for order (resource or physical)
  const [orderToDelete, setOrderToDelete] = useState<{
    id: number;
    orderNumber: string;
    type: "resource" | "physical";
  } | null>(null);
  const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);

  // State for edit modal
  const [resourceToEdit, setResourceToEdit] = useState<ResourceCatalogItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter Catalog Items
  const filteredCatalog = useMemo(() => {
    return resourceCatalog.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      return true;
    });
  }, [resourceCatalog, searchQuery, typeFilter]);

  // Filter Digital Resource Orders (Purchased via Telegram Bot)
  const filteredResourceOrders = useMemo(() => {
    return resourceOrders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.resourceTitle.toLowerCase().includes(q) ||
        order.telegramId.toLowerCase().includes(q) ||
        (order.clientName && order.clientName.toLowerCase().includes(q)) ||
        (order.username && order.username.toLowerCase().includes(q)) ||
        (order.paymentReference && order.paymentReference.toLowerCase().includes(q)) ||
        (order.paymentMethod && order.paymentMethod.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (orderStatusFilter !== "all" && order.paymentStatus !== orderStatusFilter) return false;

      return true;
    });
  }, [resourceOrders, searchQuery, orderStatusFilter]);

  // Filter Physical Book Orders (Strictly physical courier delivery)
  const filteredPhysicalOrders = useMemo(() => {
    return physicalBookOrders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.resourceTitle.toLowerCase().includes(q) ||
        order.clientName.toLowerCase().includes(q) ||
        order.phone.toLowerCase().includes(q) ||
        order.shippingAddress.toLowerCase().includes(q) ||
        order.city.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) return false;

      return true;
    });
  }, [physicalBookOrders, searchQuery, orderStatusFilter]);

  // Count pending verification orders for visual notification
  const pendingVerificationCount = useMemo(() => {
    return resourceOrders.filter((o) => o.paymentStatus === "payment_submitted").length;
  }, [resourceOrders]);

  // Format file size helper
  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFullDownloadUrl = (filePath: string | null) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    return `${apiUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const handleConfirmOrder = async (orderId: number) => {
    setFulfillingId(orderId);
    try {
      await confirmResourceOrderPayment(orderId);
    } finally {
      setFulfillingId(null);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    if (window.confirm("Are you sure you want to reject this payment request?")) {
      await rejectResourceOrderPayment(orderId, "Payment verification could not be confirmed.");
    }
  };

  // Mobile tab options using Lucide React icons instead of emojis
  const mobileTabOptions: DropdownOption[] = useMemo(
    () => [
      {
        value: "catalog",
        label: `Catalog (${resourceCatalog.length})`,
        icon: <BookOpen className="w-3.5 h-3.5 text-[#F6CE46]" />,
      },
      {
        value: "orders",
        label: `Orders (${resourceOrders.length})`,
        icon: <ShoppingBag className="w-3.5 h-3.5 text-[#F6CE46]" />,
      },
      {
        value: "shipping",
        label: `Shipping (${physicalBookOrders.length})`,
        icon: <Truck className="w-3.5 h-3.5 text-[#F6CE46]" />,
      },
    ],
    [resourceCatalog.length, resourceOrders.length, physicalBookOrders.length]
  );

  // Status and type filter options for CustomDropdown
  const filterOptions: DropdownOption[] = useMemo(() => {
    if (activeTab === "catalog") {
      return [
        { value: "all", label: "All Formats" },
        { value: "ebook", label: "E-Books Only" },
        { value: "physical_book", label: "Physical Books" },
      ];
    }
    if (activeTab === "orders") {
      return [
        { value: "all", label: "All Payment States" },
        { value: "payment_submitted", label: "Pending Verification" },
        { value: "verified", label: "Verified & Delivered" },
        { value: "pending", label: "Awaiting Payment" },
        { value: "rejected", label: "Rejected" },
      ];
    }
    return [
      { value: "all", label: "All Delivery Status" },
      { value: "pending", label: "Pending" },
      { value: "dispatched", label: "Dispatched" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
    ];
  }, [activeTab]);

  const shippingStatusOptions: DropdownOption[] = [
    { value: "pending", label: "Pending" },
    { value: "dispatched", label: "Dispatched" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <Card id="resources-management-card" className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      {/* Header and Controls */}
      <CardHeader id="resources-header" className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] pb-3.5 sm:pb-4">
        <div className="flex items-start justify-between w-full sm:w-auto">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Ministry Resources & E-Books</span>
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
              Digital publications, orders & payment verification, and physical courier shipping.
            </CardDescription>
          </div>

          {/* Top corner gear icon for mobile */}
          <div className="sm:hidden shrink-0 ml-2">
            <PaymentSettingsModal />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-48 lg:w-56 order-1 sm:order-2">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              id="input-search-resources"
              type="text"
              placeholder={
                activeTab === "catalog"
                  ? "Search catalog..."
                  : activeTab === "orders"
                  ? "Search orders..."
                  : "Search shipping..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
            />
          </div>

          {/* 2. Below Search on Mobile: All Action Buttons & Switchers (wrap onto next line when screen is shrinking) */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
            {/* View Switcher: CustomDropdown with Lucide icons on Mobile UI layout */}
            <div className="relative sm:hidden flex-1 min-w-[120px]">
              <CustomDropdown
                id="mobile-tab-dropdown"
                value={activeTab}
                options={mobileTabOptions}
                onChange={(val) => {
                  setActiveTab(val as "catalog" | "orders" | "shipping");
                  setOrderStatusFilter("all");
                }}
                className="w-full"
                triggerClassName="w-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 text-xs font-bold rounded-full px-3.5 py-1.5 text-[#202328] shadow-2xs h-9"
              />
            </div>

            {/* View Switcher: Pill tabs on Desktop (sm:flex) */}
            <div className="hidden sm:flex items-center bg-neutral-100 p-0.5 rounded-full border border-black/[0.06] h-9 shrink-0">
              <button
                type="button"
                id="tab-catalog"
                onClick={() => {
                  setActiveTab("catalog");
                  setOrderStatusFilter("all");
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "catalog"
                    ? "bg-[#202328] text-white shadow-2xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F6CE46]" />
                <span>Catalog</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-[10px] rounded-full">
                  {resourceCatalog.length}
                </span>
              </button>

              <button
                type="button"
                id="tab-orders"
                onClick={() => {
                  setActiveTab("orders");
                  setOrderStatusFilter("all");
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  activeTab === "orders"
                    ? "bg-[#202328] text-white shadow-2xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#F6CE46]" />
                <span>Orders</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-[10px] rounded-full">
                  {resourceOrders.length}
                </span>
                {pendingVerificationCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#F6CE46] absolute -top-0.5 right-1 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                id="tab-shipping"
                onClick={() => {
                  setActiveTab("shipping");
                  setOrderStatusFilter("all");
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "shipping"
                    ? "bg-[#202328] text-white shadow-2xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-[#F6CE46]" />
                <span>Shipping</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-[10px] rounded-full">
                  {physicalBookOrders.length}
                </span>
              </button>
            </div>

            {/* Filter Dropdown */}
            <CustomDropdown
              id="select-status-filter"
              value={activeTab === "catalog" ? typeFilter : orderStatusFilter}
              options={filterOptions}
              onChange={(val) => {
                if (activeTab === "catalog") {
                  setTypeFilter(val as "all" | "ebook" | "physical_book");
                } else {
                  setOrderStatusFilter(val);
                }
              }}
              className="flex-1 sm:flex-none min-w-[120px]"
              triggerClassName="w-full bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
            />

            {/* Action Buttons: strictly single-word with + */}
            <div className="flex items-center gap-2 shrink-0">
              <AddResourceModal />
              {/* Desktop gear icon */}
              <div className="hidden sm:block">
                <PaymentSettingsModal />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Main Table Content */}
      <CardContent id="resources-body" className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            {activeTab === "catalog" ? (
              /* TAB 1: RESOURCE CATALOG */
              <Table id="table-catalog">
                <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                  <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                    <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                      Title & Author
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Format
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Pricing & Cost
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Digital File / Asset
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Inventory / Stock
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Created
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isCatalogLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`cat-skel-${idx}`} className="border-b border-black/[0.04]">
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <Skeleton className="h-3.5 w-44" />
                              <Skeleton className="h-2.5 w-24" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Skeleton className="w-7 h-7 rounded-full" />
                            <Skeleton className="w-7 h-7 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredCatalog.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16 text-neutral-500 text-sm">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-[#202328] text-sm">
                            No Resources Found
                          </p>
                          <p className="text-xs text-neutral-500">
                            Click "+ Resource" to publish digital e-books or add physical books to the inventory.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCatalog.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                      >
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-black/10 flex items-center justify-center shrink-0 text-[#202328]">
                              {item.type === "ebook" ? (
                                <FileText className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Package className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#202328] text-xs truncate max-w-xs sm:max-w-sm">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-neutral-500 truncate max-w-xs">
                                {item.author || "Purity Matters Ministry"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {item.type === "ebook" ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <FileText className="w-3 h-3" />
                              <span>E-Book</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Package className="w-3 h-3" />
                              <span>Physical</span>
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.pricingType === "free" ? (
                            <span className="inline-flex items-center bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Free Download
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-[#F6CE46]/20 border border-[#F6CE46]/40 text-[#202328] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {item.price} {item.currency || "ETB"}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.filePath ? (
                            <a
                              href={getFullDownloadUrl(item.filePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 border border-black/10 px-2.5 py-1 rounded-full transition-colors"
                            >
                              <Download className="w-3 h-3 text-[#202328]" />
                              <span>{formatBytes(item.fileSizeBytes)}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400 italic">No file attached</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-[#202328]">
                          {item.type === "physical_book" ? (
                            <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/10">
                              {item.stockQuantity ?? 0} in stock
                            </span>
                          ) : (
                            <span className="text-neutral-400">Unlimited</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setResourceToEdit(item);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-[#202328] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Resource"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResourceToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : activeTab === "orders" ? (
              /* TAB 2: RESOURCE ORDERS & PAYMENT VERIFICATION */
              <Table id="table-orders">
                <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                  <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                    <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                      Order # & Date
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Resource Title
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Customer / Telegram
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Amount
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Payment Account / Method
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isResourceOrdersLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`ord-skel-${idx}`} className="border-b border-black/[0.04]">
                        <TableCell className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                        <TableCell className="text-right px-4"><Skeleton className="h-8 w-24 rounded-full ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredResourceOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16 text-neutral-500 text-sm">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-[#202328] text-sm">
                            No Resource Orders Found
                          </p>
                          <p className="text-xs text-neutral-500">
                            When users purchase paid e-books on Telegram bot, their orders appear here for confirmation and automated file delivery.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResourceOrders.map((order) => {
                      const isSubmitted = order.paymentStatus === "payment_submitted";
                      const isVerified = order.paymentStatus === "verified";
                      const isRejected = order.paymentStatus === "rejected";
                      const isPending = order.paymentStatus === "pending";

                      return (
                        <TableRow
                          key={order.id}
                          className={`border-b border-black/[0.04] transition-colors ${
                            isSubmitted ? "bg-[#F6CE46]/5 hover:bg-[#F6CE46]/10" : "hover:bg-black/[0.02]"
                          }`}
                        >
                          <TableCell className="px-4 py-3">
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-xs bg-neutral-100 border border-black/10 px-2 py-0.5 rounded-md text-[#202328]">
                                {order.orderNumber}
                              </span>
                              <p className="text-[10px] text-neutral-500">
                                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="font-semibold text-xs text-[#202328] max-w-[200px]">
                            <p className="truncate">{order.resourceTitle}</p>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                              {order.resourceType.toUpperCase()}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-bold text-xs text-[#202328]">
                                {order.clientName || order.username || `Client #${order.telegramId}`}
                              </p>
                              <p className="text-[11px] text-neutral-500 font-mono">
                                ID: {order.telegramId}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-bold text-xs text-[#202328]">
                              {order.amount} {order.currency || "ETB"}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {order.paymentMethod?.toLowerCase().includes("telebirr") ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005cb9] bg-[#005cb9]/10 border border-[#005cb9]/20 px-2 py-0.5 rounded-full">
                                    <Smartphone className="w-3 h-3" />
                                    <span>Telebirr</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6a1b9a] bg-[#6a1b9a]/10 border border-[#6a1b9a]/20 px-2 py-0.5 rounded-full">
                                    <Building2 className="w-3 h-3" />
                                    <span>CBE Bank</span>
                                  </span>
                                )}
                              </div>
                              {order.paymentReference && (
                                <p className="text-[10px] font-mono text-neutral-600 truncate max-w-[150px]">
                                  Ref: {order.paymentReference}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            {isSubmitted ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-[10px] px-2.5 py-1 rounded-full shadow-2xs">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Payment Submitted</span>
                              </span>
                            ) : isVerified ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified & Delivered</span>
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-300 text-rose-800 font-bold text-[10px] px-2.5 py-1 rounded-full">
                                <X className="w-3 h-3 text-rose-600" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-black/10 text-neutral-600 font-bold text-[10px] px-2.5 py-1 rounded-full">
                                <Clock className="w-3 h-3 text-neutral-500" />
                                <span>Pending Payment</span>
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-right px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {isSubmitted || isPending ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmOrder(order.id)}
                                    disabled={fulfillingId === order.id}
                                    className="bg-[#202328] hover:bg-black text-white text-xs font-semibold rounded-full h-8 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                                    title="Verify payment and dispatch file via Telegram bot"
                                  >
                                    <Check className="w-3.5 h-3.5 text-[#F6CE46]" />
                                    <span>{fulfillingId === order.id ? "Sending..." : "Confirm & Send"}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRejectOrder(order.id)}
                                    disabled={fulfillingId === order.id}
                                    className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 text-xs rounded-full h-8 px-2 cursor-pointer transition-colors"
                                    title="Decline order"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              ) : isVerified ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Send className="w-3 h-3 text-emerald-600" />
                                    <span>Delivered on Bot</span>
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleConfirmOrder(order.id)}
                                    disabled={fulfillingId === order.id}
                                    title="Resend document file to client's Telegram"
                                    className="text-xs rounded-full h-7 px-2 text-neutral-600 hover:text-[#202328] cursor-pointer"
                                  >
                                    <RefreshCw className={`w-3 h-3 ${fulfillingId === order.id ? "animate-spin" : ""}`} />
                                  </Button>
                                </div>
                              ) : null}

                              {/* Delete button available for ALL states */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderToDelete({
                                    id: order.id,
                                    orderNumber: order.orderNumber,
                                    type: "resource",
                                  });
                                  setIsDeleteOrderModalOpen(true);
                                }}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Order Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            ) : (
              /* TAB 3: PHYSICAL ORDERS SHIPPING QUEUE */
              <Table id="table-shipping">
                <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                  <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                    <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                      Order #
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Physical Book
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Client Contact
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Shipping Delivery Address
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Qty & Amount
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3">
                      Payment
                    </TableHead>
                    <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 text-right">
                      Fulfillment Status & Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isOrdersLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`ship-skel-${idx}`} className="border-b border-black/[0.04]">
                        <TableCell className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-3.5 w-40" />
                            <Skeleton className="h-2.5 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-2.5 w-20" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-3.5 w-44" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right px-4"><Skeleton className="h-6 w-28 rounded-full ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPhysicalOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16 text-neutral-500 text-sm">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                            <Truck className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-[#202328] text-sm">
                            No Physical Book Orders
                          </p>
                          <p className="text-xs text-neutral-500">
                            Orders are created when clients purchase physical print copies requiring courier delivery.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPhysicalOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                      >
                        <TableCell className="font-bold text-[#202328] text-xs px-4">
                          <span className="font-mono bg-neutral-100 border border-black/10 px-2 py-0.5 rounded-md">
                            {order.orderNumber}
                          </span>
                        </TableCell>

                        <TableCell className="font-semibold text-[#202328] text-xs max-w-[200px]">
                          <p className="truncate">{order.resourceTitle}</p>
                          <p className="text-[10px] text-neutral-400">Physical Print Copy</p>
                        </TableCell>

                        <TableCell>
                          <p className="font-bold text-xs text-[#202328]">
                            {order.clientName}
                          </p>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            <span>{order.phone}</span>
                          </p>
                        </TableCell>

                        <TableCell className="max-w-[220px]">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-[#202328] leading-tight">
                                {order.city}
                              </p>
                              <p className="text-[11px] text-neutral-500 leading-snug truncate max-w-[200px]">
                                {order.shippingAddress}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="font-bold text-xs text-[#202328]">
                            {order.quantity} × {order.unitPrice} {order.currency}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-medium">
                            Total: {order.totalAmount} {order.currency}
                          </p>
                        </TableCell>

                        <TableCell>
                          {order.paymentStatus === "verified" ? (
                            <span className="inline-flex items-center gap-1 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] font-bold text-[10px] px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-[#202328]" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-neutral-100 border border-black/10 text-neutral-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              <span>Pending</span>
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <CustomDropdown
                              id={`select-status-${order.id}`}
                              value={order.status}
                              options={shippingStatusOptions}
                              onChange={(val) =>
                                updatePhysicalOrderStatus(
                                  order.id,
                                  val as PhysicalBookOrderItem["status"]
                                )
                              }
                              size="sm"
                              variant="compact"
                              triggerClassName={`text-xs font-bold px-2.5 py-1 border transition-colors ${
                                order.status === "delivered"
                                  ? "bg-[#F6CE46]/25 text-[#202328] border-[#F6CE46]/50"
                                  : order.status === "dispatched"
                                  ? "bg-[#202328] text-white border-[#202328]"
                                  : order.status === "cancelled"
                                  ? "bg-neutral-100 text-neutral-400 border-black/10"
                                  : "bg-neutral-100 text-[#202328] border-black/10"
                              }`}
                            />

                            {/* Delete button available for ALL shipping states */}
                            <button
                              type="button"
                              onClick={() => {
                                setOrderToDelete({
                                  id: order.id,
                                  orderNumber: order.orderNumber,
                                  type: "physical",
                                });
                                setIsDeleteOrderModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Shipping Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>

      {/* Edit Resource Modal */}
      <EditResourceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setResourceToEdit(null);
        }}
        resource={resourceToEdit}
      />

      {/* Confirm Delete Resource Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setResourceToDelete(null);
        }}
        onConfirm={async () => {
          if (resourceToDelete) {
            await deleteResource(resourceToDelete.id);
          }
        }}
        title="Delete Resource Item"
        description="Are you sure you want to permanently delete this resource from the catalog? This will remove the resource from the active store."
        itemName={resourceToDelete?.title}
      />

      {/* Confirm Delete Order Modal (Supports both digital resource orders and physical shipping orders in any state) */}
      <ConfirmDeleteModal
        isOpen={isDeleteOrderModalOpen}
        onClose={() => {
          setIsDeleteOrderModalOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={async () => {
          if (orderToDelete) {
            if (orderToDelete.type === "resource") {
              await deleteResourceOrder(orderToDelete.id);
            } else {
              await deletePhysicalOrder(orderToDelete.id);
            }
          }
        }}
        title="Delete Order Record"
        description="Are you sure you want to permanently delete this order record? This will remove the order permanently from the database."
        itemName={orderToDelete?.orderNumber}
      />
    </Card>
  );
}
