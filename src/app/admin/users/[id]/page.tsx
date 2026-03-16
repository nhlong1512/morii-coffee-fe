"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ShieldOff,
  Shield,
  Trash2,
  ShoppingCart,
  Star,
  Award,
  CreditCard,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminUsers, type AdminUser } from "@/data/admin/users";
import { adminOrders } from "@/data/admin/orders";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function getLoyaltyTier(points: number) {
  if (points >= 5000) return { label: "Platinum", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" };
  if (points >= 2000) return { label: "Gold", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
  if (points >= 500) return { label: "Silver", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" };
  return { label: "Bronze", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const originalUser = adminUsers.find((u) => u.id === userId);

  const [user, setUser] = useState<AdminUser | null>(
    originalUser ? { ...originalUser } : null
  );
  const [editName, setEditName] = useState(originalUser?.name ?? "");
  const [editEmail, setEditEmail] = useState(originalUser?.email ?? "");
  const [editRole, setEditRole] = useState<string>(originalUser?.role ?? "user");
  const [editStatus, setEditStatus] = useState(originalUser?.status === "active");
  const [editLoyaltyPoints, setEditLoyaltyPoints] = useState(
    String(originalUser?.loyaltyPoints ?? 0)
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const userOrders = useMemo(() => {
    if (!user) return [];
    return adminOrders.filter(
      (order) => order.customerEmail === user.email
    );
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">User not found</h2>
        <p className="text-muted-foreground mt-2">
          The user you are looking for does not exist.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  const tier = getLoyaltyTier(user.loyaltyPoints);

  function handleSave() {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: editName,
        email: editEmail,
        role: editRole as "admin" | "user",
        status: editStatus ? "active" : "banned",
        loyaltyPoints: parseInt(editLoyaltyPoints) || 0,
      };
    });
  }

  function handleToggleBan() {
    setUser((prev) => {
      if (!prev) return prev;
      const newStatus = prev.status === "active" ? "banned" : "active";
      setEditStatus(newStatus === "active");
      return { ...prev, status: newStatus };
    });
    setBanDialogOpen(false);
  }

  function handleDelete() {
    setDeleteDialogOpen(false);
    router.push("/admin/users");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <Badge
              className={cn(
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              )}
            >
              {user.role}
            </Badge>
            <Badge
              className={cn(
                user.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {user.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                Joined {formatDate(user.joinedDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-xl font-bold">{user.ordersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviews</p>
                <p className="text-xl font-bold">{user.reviewsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loyalty Points</p>
                <p className="text-xl font-bold">
                  {user.loyaltyPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", tier.color.split(" ")[0])}>
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tier</p>
                <Badge className={cn(tier.color)}>{tier.label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty History</TabsTrigger>
        </TabsList>

        {/* Profile Info Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update user profile information and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={editRole} onValueChange={setEditRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loyaltyPoints">Loyalty Points</Label>
                  <Input
                    id="loyaltyPoints"
                    type="number"
                    value={editLoyaltyPoints}
                    onChange={(e) => setEditLoyaltyPoints(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="status"
                  checked={editStatus}
                  onCheckedChange={setEditStatus}
                />
                <Label htmlFor="status">
                  Account Active {editStatus ? "(Active)" : "(Banned)"}
                </Label>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order History Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                {userOrders.length} order{userOrders.length !== 1 ? "s" : ""}{" "}
                placed by this customer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No orders found for this user.
                </p>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            #{order.orderNumber}
                          </span>
                          <Badge
                            className={cn(
                              order.orderStatus === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : order.orderStatus === "processing"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : order.orderStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {order.orderStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)} &middot;{" "}
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          ${order.total.toFixed(2)}
                        </span>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                Reviews written by {user.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <Star className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {user.reviewsCount} review{user.reviewsCount !== 1 ? "s" : ""}{" "}
                  written by this user.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Review details will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty History Tab */}
        <TabsContent value="loyalty">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty History</CardTitle>
              <CardDescription>
                Points earned and redeemed over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <Award className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Current balance:{" "}
                  <span className="font-semibold">
                    {user.loyaltyPoints.toLocaleString()} points
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Points history will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setBanDialogOpen(true)}
        >
          {user.status === "active" ? (
            <>
              <ShieldOff className="h-4 w-4 mr-2" />
              Ban User
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Unban User
            </>
          )}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </Button>
      </div>

      <ConfirmDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        title={user.status === "active" ? "Ban User" : "Unban User"}
        description={
          user.status === "active"
            ? `Are you sure you want to ban "${user.name}"? They will lose access to their account.`
            : `Are you sure you want to unban "${user.name}"? They will regain access to their account.`
        }
        onConfirm={handleToggleBan}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to permanently delete "${user.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
