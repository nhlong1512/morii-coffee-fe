"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Shield, ShieldOff, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminUsers, type AdminUser } from "@/data/admin/users";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !user.name.toLowerCase().includes(q) &&
          !user.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  function handleToggleBan(user: AdminUser) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "active" ? "banned" : "active" }
          : u
      )
    );
  }

  function handleToggleRole(user: AdminUser) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, role: u.role === "admin" ? "user" : "admin" }
          : u
      )
    );
  }

  function handleDeleteUser() {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
    setDeleteDialogOpen(false);
  }

  const columns: Column<AdminUser>[] = [
    {
      header: "User",
      accessor: "avatar",
      cell: (row: AdminUser) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback className="text-xs">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      sortable: true,
      cell: (row: AdminUser) => (
        <Badge
          className={cn(
            row.role === "admin"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          )}
        >
          {row.role}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      cell: (row: AdminUser) => (
        <Badge
          className={cn(
            row.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          )}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Joined",
      accessor: "joinedDate",
      sortable: true,
      cell: (row: AdminUser) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.joinedDate)}
        </span>
      ),
    },
    {
      header: "Loyalty Points",
      accessor: "loyaltyPoints",
      sortable: true,
      cell: (row: AdminUser) => (
        <span className="text-sm font-medium">
          {row.loyaltyPoints.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Orders",
      accessor: "ordersCount",
      sortable: true,
      cell: (row: AdminUser) => (
        <span className="text-sm">{row.ordersCount}</span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      cell: (row: AdminUser) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/users/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToggleRole(row)}>
                <Shield className="h-4 w-4 mr-2" />
                {row.role === "admin" ? "Demote to User" : "Promote to Admin"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleBan(row)}>
                <ShieldOff className="h-4 w-4 mr-2" />
                {row.status === "active" ? "Ban User" : "Unban User"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setUserToDelete(row);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">{users.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Search users..."
        searchKey="name"
        pageSize={10}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
        variant="destructive"
      />
    </div>
  );
}
