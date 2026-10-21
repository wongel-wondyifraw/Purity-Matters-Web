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
  ExternalLink,
  ShoppingBag,
  AlertCircle,
  Pencil,
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
import { Input } from "@/components/ui/input";
import { useAdminData } from "@/context/AdminDataContext";
import { AddResourceModal } from "@/components/resources/AddResourceModal";
import { EditResourceModal } from "@/components/resources/EditResourceModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { Skeleton } from "@/components/ui/skeleton";
import { PhysicalBookOrderItem, ResourceCatalogItem } from "@/types/admin";

export function ResourcesTable() {
  const {
    resourceCatalog,
    physicalBookOrders,
    updatePhysicalOrderStatus,
    deleteResource,
    isCatalogLoading,
    isOrdersLoading,
    apiUrl,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ebook" | "physical_book">("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // State for delete confirmation modal
  const [resourceToDelete, setResourceToDelete] = useState<ResourceCatalogItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  // Filter Physical Book Orders (Strictly physical orders)
  const filteredOrders = useMemo(() => {
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

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      {/* Header and Controls - Standardized typography and height */}
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Ministry Resources & E-Books</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Digital downloads, physical publications catalog, and physical book shipping fulfillment.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Tab switchers */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-full border border-black/[0.06] h-9">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
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
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#202328] text-white shadow-2xs"
                  : "text-neutral-600 hover:text-[#202328]"
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#F6CE46]" />
              <span>Orders</span>
              <span className="px-1.5 py-0.2 bg-white/20 text-[10px] rounded-full">
                {physicalBookOrders.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48 lg:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              type="text"
              placeholder={activeTab === "catalog" ? "Search title..." : "Search orders..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            className="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#202328] cursor-pointer h-9"
            value={activeTab === "catalog" ? typeFilter : orderStatusFilter}
            onChange={(e) => {
              if (activeTab === "catalog") {
                setTypeFilter(e.target.value as "all" | "ebook" | "physical_book");
              } else {
                setOrderStatusFilter(e.target.value);
              }
            }}
          >
            {activeTab === "catalog" ? (
              <>
                <option value="all">All Formats</option>
                <option value="ebook">E-Books Only</option>
                <option value="physical_book">Physical Books</option>
              </>
            ) : (
              <>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </>
            )}
          </select>

          {/* Add Resource Trigger Modal */}
          <AddResourceModal />
        </div>
      </CardHeader>

      {/* Main Table Content - strictly fitted to viewport height */}
      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            {activeTab === "catalog" ? (
              /* TAB 1: RESOURCE CATALOG */
              <Table>
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
                            Click "Add Resource" to publish digital e-books or add physical books to the inventory.
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
                        <TableCell className="font-bold text-[#202328] text-sm px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-black/10 flex items-center justify-center shrink-0">
                              {item.type === "ebook" ? (
                                <FileText className="w-4 h-4 text-[#202328]" />
                              ) : (
                                <Package className="w-4 h-4 text-[#202328]" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#202328] text-xs">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-neutral-500 font-normal">
                                {item.author || "Ministry Team"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {item.type === "ebook" ? (
                            <span className="inline-flex items-center gap-1 bg-[#202328]/5 border border-black/10 text-[#202328] font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                              <FileText className="w-3 h-3 text-[#202328]" />
                              <span>E-Book</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                              <Package className="w-3 h-3 text-[#202328]" />
                              <span>Physical Book</span>
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.pricingType === "free" || Number(item.price) === 0 ? (
                            <span className="inline-flex items-center bg-neutral-100 border border-black/10 text-[#202328] font-bold text-[11px] px-2 py-0.5 rounded-full">
                              Free (0 ETB)
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-[#F6CE46]/30 border border-[#F6CE46]/50 text-[#202328] font-bold text-[11px] px-2 py-0.5 rounded-full">
                              {item.price} {item.currency}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.type === "ebook" && item.filePath ? (
                            <a
                              href={getFullDownloadUrl(item.filePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#202328] hover:bg-black/5 bg-neutral-100/90 border border-black/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-[#202328]" />
                              <span className="truncate max-w-[140px]">
                                {item.fileName || "Download PDF"}
                              </span>
                              {item.fileSizeBytes && (
                                <span className="text-[10px] text-neutral-400">
                                  ({formatBytes(item.fileSizeBytes)})
                                </span>
                              )}
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-xs italic">
                              Physical Item (No file)
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.type === "physical_book" ? (
                            <span className="font-bold text-xs text-[#202328]">
                              {item.stockQuantity ?? 0} in stock
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-xs font-medium">
                              Unlimited (Digital)
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-neutral-500 text-xs font-medium">
                          {item.createdAt}
                        </TableCell>

                        <TableCell className="text-right px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setResourceToEdit(item);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-[#202328] hover:bg-black/[0.05] rounded-lg transition-colors cursor-pointer"
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
            ) : (
              /* TAB 2: PHYSICAL ORDERS FULFILLMENT QUEUE (Strictly for physical books) */
              <Table>
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
                    <TableHead className="text-[#202328] font-bold text-xs py-3 px-4">
                      Fulfillment Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isOrdersLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`ord-skel-${idx}`} className="border-b border-black/[0.04]">
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
                        <TableCell className="px-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
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
                            Orders are created strictly when clients purchase physical print copies requiring courier delivery.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
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

                        <TableCell className="px-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updatePhysicalOrderStatus(
                                  order.id,
                                  e.target.value as PhysicalBookOrderItem["status"]
                                )
                              }
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer outline-none ${
                                order.status === "delivered"
                                  ? "bg-[#F6CE46]/25 text-[#202328] border-[#F6CE46]/50"
                                  : order.status === "dispatched"
                                  ? "bg-[#202328] text-white border-[#202328]"
                                  : order.status === "cancelled"
                                  ? "bg-neutral-100 text-neutral-400 border-black/10"
                                  : "bg-neutral-100 text-[#202328] border-black/10"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
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
    </Card>
  );
}
