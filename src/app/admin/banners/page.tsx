"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { cn, formatDateRange } from "@/lib/utils";
import { Plus, Pencil, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { getBanners, deleteBanner, updateBanner } from "@/services/banners-service";
import type { ApiBanner } from "@/types/api";

export default function AdminBannersPage() {
  const [banners, setBanners] = React.useState<ApiBanner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const fetchBanners = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBanners();
      setBanners(data.slice().sort((a, b) => a.displayOrder - b.displayOrder));
    } catch {
      setError("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleToggleActive = async (banner: ApiBanner) => {
    if (togglingId) return;
    setTogglingId(banner.id);
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
    );
    try {
      await updateBanner(banner.id, {
        title: banner.title,
        subtitle: banner.subtitle ?? undefined,
        cta: banner.cta ?? undefined,
        ctaLink: banner.ctaLink ?? undefined,
        displayOrder: banner.displayOrder,
        startDate: banner.startDate,
        endDate: banner.endDate,
        isActive: !banner.isActive,
      });
    } catch {
      // Rollback on failure
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBanner(deleteId);
      setBanners((prev) => prev.filter((b) => b.id !== deleteId));
    } catch {
      // deletion failed — let user retry
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<ApiBanner>[] = [
    {
      header: "Image",
      accessor: "imageUrl",
      cell: (row) =>
        row.imageUrl ? (
          <div className="relative h-10 w-16 overflow-hidden rounded-md">
            <Image src={row.imageUrl} alt={row.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-[#146d4d]/20">
            <ImageIcon className="h-4 w-4 text-[#146d4d]" />
          </div>
        ),
    },
    {
      header: "Title",
      accessor: "title",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          {row.subtitle && (
            <p className="max-w-xs truncate text-xs text-muted-foreground">{row.subtitle}</p>
          )}
        </div>
      ),
    },
    {
      header: "Order",
      accessor: "displayOrder",
      sortable: true,
      cell: (row) => <span className="text-sm">{row.displayOrder}</span>,
    },
    {
      header: "Date Range",
      accessor: "startDate",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDateRange(row.startDate, row.endDate)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      cell: (row) => (
        <Badge
          className={cn(
            "text-xs",
            row.isActive
              ? "border-green-600/20 bg-green-600/15 text-green-700"
              : "bg-muted text-muted-foreground"
          )}
        >
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Switch
            checked={row.isActive}
            onCheckedChange={() => handleToggleActive(row)}
            disabled={togglingId === row.id}
            className="scale-75"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/admin/banners/edit/${row.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const bannerToDelete = banners.find((b) => b.id === deleteId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
          <p className="text-muted-foreground">Manage hero carousel banners</p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Link>
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading banners…
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchBanners}>
            Retry
          </Button>
        </div>
      )}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={banners}
          searchPlaceholder="Search banners..."
          searchKey="title"
          pageSize={10}
          getRowId={(row) => row.id}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete Banner"
        description={
          bannerToDelete
            ? `Are you sure you want to delete "${bannerToDelete.title}"? This is a soft delete — the record is retained for audit purposes.`
            : ""
        }
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
