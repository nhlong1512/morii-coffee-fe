"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  User,
  Package,
  Heart,
  Star,
  Bell,
  Edit2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Trophy,
  Camera,
} from "lucide-react";
import { cn, formatVND } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useWishlistStore } from "@/stores/wishlist-store";
import * as userService from "@/services/user-service";
import type { Product } from "@/data/products";
import { getAllProducts } from "@/services/products-service";
import { orders } from "@/data/orders";
import { EGender } from "@/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const statusColors: Record<string, string> = {
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "in-transit":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  processing:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function getDisplayName(user: { fullName: string | null; userName: string }) {
  return user.fullName || user.userName;
}

function getInitials(user: { fullName: string | null; userName: string }) {
  const name = user.fullName || user.userName;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tOrder = useTranslations("orders");
  const user = useAuthStore((s) => s.user);
  const { isLoading } = useProtectedRoute();
  const setUser = useAuthStore((s) => s.setUser);
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState<string>("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [loyaltyAlerts, setLoyaltyAlerts] = useState(true);

  useEffect(() => {
    if (user) {
      getAllProducts().then(setAllProducts).catch(() => {});
    }
  }, [user]);

  // Show loading state while checking auth or redirecting
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  const wishlisted = allProducts.filter((p) => wishlistItems.includes(p.id));
  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  const handleEditStart = () => {
    setEditFullName(user.fullName ?? "");
    setEditDob(user.dob ? user.dob.split("T")[0] : "");
    setEditGender(user.gender ?? "");
    setEditBio(user.bio ?? "");
    setSaveError("");
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      const updated = await userService.updateProfile({
        fullName: editFullName,
        dob: editDob ? new Date(editDob).toISOString() : new Date().toISOString(),
        gender: (editGender || "Other") as "Male" | "Female" | "Other",
        bio: editBio,
      });
      setUser(updated);
      setIsEditing(false);
    } catch {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const updated = await userService.changeAvatar(file);
      setUser(updated);
    } catch {
      // silently fail — toast could be added later
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          {t("myProfile")}
        </h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 sm:grid-cols-5">
            <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t("editProfile")}</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{tOrder("orderHistory")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{t("myWishlist")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="loyalty"
              className="gap-1.5 text-xs sm:text-sm hidden sm:flex"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">{t("loyaltyPoints")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-1.5 text-xs sm:text-sm hidden sm:flex"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("notificationPreferences")}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("editProfile")}</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditStart}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEditSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : t("save")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditCancel}
                      disabled={isSaving}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
                      <AvatarFallback className="text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {isUploadingAvatar ? (
                        <LoadingSpinner variant="spinner" size="sm" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.userName}
                    </p>
                  </div>
                </div>

                <Separator />

                {saveError && <ErrorMessage message={saveError} />}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profileFullName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="profileFullName"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                        {user.fullName || "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileEmail">Email</Label>
                    <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileDob">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="profileDob"
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                        {user.dob
                          ? new Date(user.dob).toLocaleDateString()
                          : "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileGender">Gender</Label>
                    {isEditing ? (
                      <Select value={editGender} onValueChange={setEditGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EGender.Male}>Male</SelectItem>
                          <SelectItem value={EGender.Female}>Female</SelectItem>
                          <SelectItem value={EGender.Other}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                        {user.gender || "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="profileBio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="profileBio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                        {user.bio || "No bio"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                      {user.phoneNumber || "Not set"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Link href="/change-password">
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{tOrder("orderHistory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-border"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                        onClick={() => toggleOrder(order.id)}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-medium text-foreground">
                            {order.orderNumber}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              statusColors[order.status]
                            )}
                          >
                            {tOrder(
                              order.status === "in-transit"
                                ? "inTransit"
                                : order.status
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {formatVND(order.total)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.date}
                            </p>
                          </div>
                          {expandedOrder === order.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      {expandedOrder === order.id && (
                        <div className="border-t border-border p-4">
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3"
                              >
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity}
                                    {item.size ? ` | Size: ${item.size}` : ""}
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                  {formatVND(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                          {order.trackingNumber && (
                            <div className="mt-3 rounded-md bg-muted p-2">
                              <p className="text-xs text-muted-foreground">
                                {tOrder("trackingNumber")}:{" "}
                                <span className="font-medium text-foreground">
                                  {order.trackingNumber}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>{t("myWishlist")}</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlisted.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Your wishlist is empty.
                    </p>
                    <Link href="/products">
                      <Button variant="outline" className="mt-4">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlisted.map((product) => (
                      <div
                        key={product.id}
                        className="group relative overflow-hidden rounded-lg border border-border"
                      >
                        <div className="relative aspect-square bg-muted">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-foreground">
                            {product.name}
                          </h4>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-sm font-semibold text-primary">
                              {formatVND(product.price)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromWishlist(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tab — placeholder, not wired to API yet */}
          <TabsContent value="loyalty">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Loyalty Points
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          Coming Soon
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab — placeholder */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("notificationPreferences")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Email Notifications
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Push Notifications
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Order Updates
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Get notified about order status changes
                      </p>
                    </div>
                    <Switch
                      checked={orderUpdates}
                      onCheckedChange={setOrderUpdates}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Promotions & Offers
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Receive special offers and discounts
                      </p>
                    </div>
                    <Switch
                      checked={promotions}
                      onCheckedChange={setPromotions}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Loyalty Alerts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Get notified about points and rewards
                      </p>
                    </div>
                    <Switch
                      checked={loyaltyAlerts}
                      onCheckedChange={setLoyaltyAlerts}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
