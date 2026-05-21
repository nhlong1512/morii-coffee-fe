"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Pencil, Trash2, Upload, ArchiveRestore, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import type { ApiBlogPostSummary, BlogPostStatus } from "@/types/api";
import { BlogStatusBadge } from "./blog-status-badge";

interface BlogListTableProps {
  posts: ApiBlogPostSummary[];
  onDelete: (post: ApiBlogPostSummary) => void;
  onStatusChange: (post: ApiBlogPostSummary, status: BlogPostStatus) => void;
  editHref: (id: string) => string;
}

export function BlogListTable({
  posts,
  onDelete,
  onStatusChange,
  editHref,
}: BlogListTableProps) {
  const t = useTranslations("adminBlog");

  const columns = React.useMemo<Column<ApiBlogPostSummary>[]>(
    () => [
      {
        header: t("table.title"),
        accessor: "title",
        sortable: true,
        cell: (row) => (
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground">{row.slug}</p>
          </div>
        ),
      },
      {
        header: t("table.status"),
        accessor: "status",
        cell: (row) => <BlogStatusBadge status={row.status} />,
      },
      {
        header: t("table.categories"),
        accessor: "categories",
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.categories.map((category) => category.name).join(", ") || t("table.none")}
          </span>
        ),
      },
      {
        header: t("table.order"),
        accessor: "displayOrder",
        sortable: true,
      },
      {
        header: t("table.actions"),
        accessor: "id",
        cell: (row) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={editHref(row.id)} aria-label={t("actions.edit")}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            {row.status === "Published" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onStatusChange(row, "Archived")}
                aria-label={t("actions.archive")}
              >
                <Archive className="h-4 w-4" />
              </Button>
            ) : row.status === "Archived" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onStatusChange(row, "Draft")}
                aria-label={t("actions.restoreDraft")}
              >
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onStatusChange(row, "Published")}
                aria-label={t("actions.publish")}
              >
                <Upload className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(row)}
              aria-label={t("actions.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [editHref, onDelete, onStatusChange, t]
  );

  return (
    <DataTable
      columns={columns}
      data={posts}
      searchKey="title"
      searchPlaceholder={t("filters.searchPlaceholder")}
      pageSize={10}
    />
  );
}
