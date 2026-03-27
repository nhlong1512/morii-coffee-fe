"use client";

import * as React from "react";
import Link from "next/link";
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
import { getProducts, deleteProduct } from "@/services/products-service";
import { cn, formatVND } from "@/lib/utils";
import {
  Plus,
  Star,
  Pencil,
  Trash2,
  ToggleLeft,
} from "lucide-react";

export default function AdminProductsPage() {
  const [productList, setProductList] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { products } = await getProducts({ takeAll: true });
      setProductList(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    await Promise.all([...selectedRows].map(deleteProduct));
    setProductList((prev) => prev.filter((p) => !selectedRows.has(p.id)));
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
      header: "Image",
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
      header: "Name",
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
      header: "Category",
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
      header: "Price",
      accessor: "price",
      sortable: true,
      cell: (row) => <span>{formatVND(row.price)}</span>,
    },
    {
      header: "Status",
      accessor: "inStock",
      cell: (row) =>
        row.inStock ? (
          <Badge variant="success">
            Active
          </Badge>
        ) : (
          <Badge variant="error">
            Inactive
          </Badge>
        ),
    },
    {
      header: "Featured",
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
      header: "Actions",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">Manage your products and categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-4 py-3">
              <span className="text-sm font-medium">{selectedRows.size} selected</span>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected ({selectedRows.size})
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                <ToggleLeft className="h-4 w-4 mr-1" />
                Toggle Status
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
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                Retry
              </Button>
            </div>
          )}
          {!loading && !error && (
            <DataTable
              columns={columns}
              data={productList}
              searchPlaceholder="Search products..."
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
        title="Delete Product"
        description={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={() => deleteId && handleDelete(deleteId)}
        variant="destructive"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete Selected Products"
        description={`Are you sure you want to delete ${selectedRows.size} selected product(s)? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        variant="destructive"
      />
    </div>
  );
}
