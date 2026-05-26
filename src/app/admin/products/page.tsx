"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ProductImage } from "@/components/ui/product-image";
import { CategoryManager } from "@/components/admin/category-manager";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import type { Product } from "@/data/products";
import { deleteProduct } from "@/services/products-service";
import { cn, formatVND } from "@/lib/utils";
import { useProducts } from "@/hooks/use-products";
import { ROUTES } from "@/constants/routes";
import {
  Plus,
  Star,
  Pencil,
  Trash2,
  ToggleLeft,
} from "lucide-react";

export default function AdminProductsPage() {
  const t = useTranslations("adminProducts");
  const { products, loading, error, refetch } = useProducts({ takeAll: true });
  const [productList, setProductList] = React.useState<Product[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    setProductList(products);
  }, [products]);

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    await refetch();
    setDeleteId(null);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    await Promise.all([...selectedRows].map(deleteProduct));
    await refetch();
    setSelectedRows(new Set());
    setBulkDeleteOpen(false);
  };

  const handleToggleStatus = () => {
    setProductList((prev) =>
      prev.map((p) =>
        selectedRows.has(p.id) ? { ...p, inStock: !p.inStock } : p
      )
    );
  };

  const columns: Column<Product>[] = [
    {
      header: t("columnImage"),
      accessor: "image",
      cell: (row) => (
        <div className="relative h-10 w-10 overflow-hidden rounded-md">
          <ProductImage
            src={row.image}
            alt={row.name}
            category={row.categories[0]}
          />
        </div>
      ),
    },
    {
      header: t("columnName"),
      accessor: "name",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.slug}</p>
        </div>
      ),
    },
    {
      header: t("columnCategory"),
      accessor: "categories",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.categories.map((cat) => (
            <Badge key={cat} variant="secondary">
              {cat}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: t("columnPrice"),
      accessor: "price",
      sortable: true,
      cell: (row) => <span>{formatVND(row.price)}</span>,
    },
    {
      header: t("columnStatus"),
      accessor: "inStock",
      cell: (row) =>
        row.inStock ? (
          <Badge variant="success">
            {t("statusActive")}
          </Badge>
        ) : (
          <Badge variant="error">
            {t("statusInactive")}
          </Badge>
        ),
    },
    {
      header: t("columnFeatured"),
      accessor: "featured",
      cell: (row) => (
        <Star
          className={cn(
            "h-5 w-5",
            row.featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
      ),
    },
    {
      header: t("columnActions"),
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/admin/products/edit/${row.id}`}>
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

  const productToDelete = productList.find((p) => p.id === deleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild className="self-start sm:self-auto">
          <Link href={ROUTES.ADMIN.PRODUCTS_NEW}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addProduct")}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">{t("tabProducts")}</TabsTrigger>
          <TabsTrigger value="categories">{t("tabCategories")}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {selectedRows.size > 0 && (
            <div className="flex flex-col items-start gap-2 rounded-md border border-border bg-muted/50 px-4 py-3 sm:flex-row sm:items-center">
              <span className="text-sm font-medium">{t("selected", { n: selectedRows.size })}</span>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                {t("deleteSelected", { n: selectedRows.size })}
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                <ToggleLeft className="h-4 w-4 mr-1" />
                {t("toggleStatus")}
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner variant="spinner" size="md" />
            </div>
          )}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <ErrorMessage message={error} inline={false} />
              <Button variant="outline" size="sm" onClick={refetch}>
                {t("retry")}
              </Button>
            </div>
          )}
          {!loading && !error && (
            <DataTable
              columns={columns}
              data={productList}
              searchPlaceholder={t("searchPlaceholder")}
              searchKey="name"
              pageSize={10}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              getRowId={(row) => row.id}
            />
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title={t("deleteProductTitle")}
        description={
          productToDelete
            ? t("deleteProductDescription", { name: productToDelete.name })
            : ""
        }
        onConfirm={() => deleteId && handleDelete(deleteId)}
        variant="destructive"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t("deleteManyTitle")}
        description={t("deleteManyDescription", { n: selectedRows.size })}
        onConfirm={handleBulkDelete}
        variant="destructive"
      />
    </div>
  );
}
