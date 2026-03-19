"use client";

import { useState, useEffect } from "react";
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
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Gift,
  Trophy,
  Coffee,
} from "lucide-react";
import { cn, formatVND } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/data/products";
import { getAllProducts } from "@/services/products-service";
import { orders } from "@/data/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const statusColors: Record<string, string> = {
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "in-transit":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  processing:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const tierColors: Record<string, string> = {
  Bronze: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Silver: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  Gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Platinum:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
};

const pointsHistory = [
  { id: "1", description: "Order MRC-20250301-001", points: 135, date: "2025-03-01", type: "earned" as const },
  { id: "2", description: "Free Pastry Reward", points: -200, date: "2025-02-20", type: "redeemed" as const },
  { id: "3", description: "Order MRC-20250215-002", points: 420, date: "2025-02-15", type: "earned" as const },
  { id: "4", description: "Birthday Bonus", points: 100, date: "2025-02-01", type: "earned" as const },
  { id: "5", description: "Order MRC-20250120-005", points: 120, date: "2025-01-20", type: "earned" as const },
];

const availableRewards = [
  { id: "r1", name: "Free Espresso", description: "Any size classic espresso", pointsCost: 150 },
  { id: "r2", name: "Free Pastry", description: "Choose any pastry item", pointsCost: 200 },
  { id: "r3", name: "Free Latte", description: "Any size, any flavor latte", pointsCost: 300 },
  { id: "r4", name: "20% Off Merch", description: "Discount on any merchandise", pointsCost: 500 },
];

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tOrder = useTranslations("orders");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [loyaltyAlerts, setLoyaltyAlerts] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    getAllProducts().then(setAllProducts).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Sign in to view your profile
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Please sign in to access your profile, orders, and more.
            </p>
            <Link href="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const wishlisted = allProducts.filter((p) => wishlistItems.includes(p.id));

  const handleEditStart = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    updateProfile({ name: editName, phone: editPhone });
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
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
          <TabsList className="mb-6 grid w-full grid-cols-5">
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
              className="gap-1.5 text-xs sm:text-sm"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">{t("loyaltyPoints")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-1.5 text-xs sm:text-sm"
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
                    <Button size="sm" onClick={handleEditSave}>
                      {t("save")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditCancel}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <Badge
                      className={cn(
                        "mt-1 border-none",
                        tierColors[user.tier] || tierColors.Bronze
                      )}
                    >
                      {user.tier} Member
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profileName">Name</Label>
                    {isEditing ? (
                      <Input
                        id="profileName"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                        {user.name}
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
                    <Label htmlFor="profilePhone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="profilePhone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                        {user.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Loyalty Points</Label>
                    <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                      {user.loyaltyPoints.toLocaleString()} pts
                    </p>
                  </div>
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

          {/* Loyalty Tab */}
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
                          Points Balance
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {user.loyaltyPoints.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "border-none px-4 py-1.5 text-sm",
                        tierColors[user.tier] || tierColors.Bronze
                      )}
                    >
                      <Star className="mr-1 h-4 w-4" />
                      {user.tier} Tier
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Points History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pointsHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-md border border-border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {entry.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.date}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            entry.type === "earned"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {entry.type === "earned" ? "+" : ""}
                          {entry.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                            <Gift className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {reward.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reward.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={user.loyaltyPoints < reward.pointsCost}
                        >
                          {reward.pointsCost} pts
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
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
