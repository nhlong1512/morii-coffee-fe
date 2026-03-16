"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CategoryManager } from "@/components/admin/category-manager";
import { products, type Product } from "@/data/products";
import { cn } from "@/lib/utils";
import {
  Plus,
  Coffee,
  Star,
  Pencil,
  Trash2,
  ToggleLeft,
} from "lucide-react";

export default function AdminProductsPage() {
  const [productList, setProductList] = React.useState<Product[]>(products);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set()
  );
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const handleDelete = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
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
      cell: () => (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <Coffee className="h-5 w-5 text-muted-foreground" />
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
      accessor: "category",
      sortable: true,
      cell: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.category}
        </Badge>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      sortable: true,
      cell: (row) => <span>${row.price.toFixed(2)}</span>,
    },
    {
      header: "Stock Status",
      accessor: "inStock",
      cell: (row) =>
        row.inStock ? (
          <Badge className="bg-green-600/15 text-green-700 border-green-600/20 hover:bg-green-600/20">
            In Stock
          </Badge>
        ) : (
          <Badge className="bg-red-600/15 text-red-700 border-red-600/20 hover:bg-red-600/20">
            Out of Stock
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
            row.featured
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
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
          <h1 className="text-3xl font-bold tracking-tight">
            Product Management
          </h1>
          <p className="text-muted-foreground">
            Manage your products and categories
          </p>
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
              <span className="text-sm font-medium">
                {selectedRows.size} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected ({selectedRows.size})
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                <ToggleLeft className="h-4 w-4 mr-1" />
                Toggle Status
              </Button>
            </div>
          )}

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
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
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
