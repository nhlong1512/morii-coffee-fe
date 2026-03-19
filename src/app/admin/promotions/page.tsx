"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Ticket,
  Gift,
  Image as ImageIcon,
  Calendar,
  Info,
} from "lucide-react";

import { cn, formatVND } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  coupons as initialCoupons,
  loyaltyRewards as initialRewards,
  bannerCampaigns as initialCampaigns,
} from "@/data/admin/promotions";

// ---- Types ----

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minimumOrder: number;
  usageCount: number;
  maxUsage: number;
  expiryDate: string;
  active: boolean;
  applicableCategories: string[];
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  rewardType: "free-product" | "discount" | "merchandise";
  expiryDate: string;
  active: boolean;
}

interface BannerCampaign {
  id: string;
  title: string;
  image: string;
  link: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const CATEGORIES = [
  "Coffee",
  "Tea",
  "Pastries",
  "Merchandise",
  "Cold Brew",
  "Espresso",
];

const REWARD_TYPE_LABELS: Record<string, string> = {
  "free-product": "Free Product",
  discount: "Discount",
  merchandise: "Merchandise",
};

function isExpired(date: string): boolean {
  return new Date(date) < new Date();
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---- Coupon Modal ----

function CouponModal({
  open,
  onOpenChange,
  coupon,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  onSave: (coupon: Coupon) => void;
}) {
  const isEdit = coupon !== null;
  const [form, setForm] = useState<Coupon>(
    coupon ?? {
      id: crypto.randomUUID(),
      code: "",
      discountType: "percentage",
      value: 0,
      minimumOrder: 0,
      usageCount: 0,
      maxUsage: 100,
      expiryDate: "",
      active: true,
      applicableCategories: [],
    }
  );

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(cat)
        ? prev.applicableCategories.filter((c) => c !== cat)
        : [...prev.applicableCategories, cat],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the coupon details below."
              : "Fill in the details to create a new coupon."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              placeholder="e.g. SAVE20"
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(val: "percentage" | "fixed") =>
                  setForm((prev) => ({ ...prev, discountType: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={form.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minimumOrder">Minimum Order ($)</Label>
              <Input
                id="minimumOrder"
                type="number"
                value={form.minimumOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumOrder: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxUsage">Max Usage</Label>
              <Input
                id="maxUsage"
                type="number"
                value={form.maxUsage}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maxUsage: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, expiryDate: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Applicable Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={form.applicableCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <Label htmlFor={`cat-${cat}`} className="text-sm font-normal">
                    {cat}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.active}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, active: checked }))
              }
            />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Reward Modal ----

function RewardModal({
  open,
  onOpenChange,
  reward,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: LoyaltyReward | null;
  onSave: (reward: LoyaltyReward) => void;
}) {
  const isEdit = reward !== null;
  const [form, setForm] = useState<LoyaltyReward>(
    reward ?? {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      pointsCost: 0,
      rewardType: "free-product",
      expiryDate: "",
      active: true,
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Reward" : "Add Reward"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the reward details below."
              : "Fill in the details to create a new loyalty reward."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reward-name">Name</Label>
            <Input
              id="reward-name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Free Latte"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reward-desc">Description</Label>
            <Input
              id="reward-desc"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of the reward"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pointsCost">Points Cost</Label>
              <Input
                id="pointsCost"
                type="number"
                value={form.pointsCost}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    pointsCost: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rewardType">Reward Type</Label>
              <Select
                value={form.rewardType}
                onValueChange={(val: "free-product" | "discount" | "merchandise") =>
                  setForm((prev) => ({ ...prev, rewardType: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free-product">Free Product</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="merchandise">Merchandise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reward-expiry">Expiry Date</Label>
            <Input
              id="reward-expiry"
              type="date"
              value={form.expiryDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, expiryDate: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.active}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, active: checked }))
              }
            />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Campaign Modal ----

function CampaignModal({
  open,
  onOpenChange,
  campaign,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: BannerCampaign | null;
  onSave: (campaign: BannerCampaign) => void;
}) {
  const isEdit = campaign !== null;
  const [form, setForm] = useState<BannerCampaign>(
    campaign ?? {
      id: crypto.randomUUID(),
      title: "",
      image: "",
      link: "",
      startDate: "",
      endDate: "",
      active: true,
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Campaign" : "Add Campaign"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the banner campaign details below."
              : "Create a new banner campaign for the hero carousel."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="campaign-title">Title</Label>
            <Input
              id="campaign-title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Campaign title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-link">Link URL</Label>
            <Input
              id="campaign-link"
              value={form.link}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, link: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-start">Start Date</Label>
              <Input
                id="campaign-start"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campaign-end">End Date</Label>
              <Input
                id="campaign-end"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Banner Image</Label>
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-1 text-sm text-muted-foreground">
                  Image upload placeholder
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.active}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, active: checked }))
              }
            />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Page ----

export default function PromotionsPage() {
  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  // Rewards state
  const [rewards, setRewards] = useState<LoyaltyReward[]>(initialRewards);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [deletingRewardId, setDeletingRewardId] = useState<string | null>(null);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<BannerCampaign[]>(initialCampaigns);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<BannerCampaign | null>(
    null
  );
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(
    null
  );

  // ---- Coupon handlers ----
  const handleSaveCoupon = useCallback(
    (coupon: Coupon) => {
      if (editingCoupon) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? coupon : c))
        );
      } else {
        setCoupons((prev) => [...prev, coupon]);
      }
      setCouponModalOpen(false);
      setEditingCoupon(null);
    },
    [editingCoupon]
  );

  const handleDeleteCoupon = useCallback(() => {
    if (deletingCouponId) {
      setCoupons((prev) => prev.filter((c) => c.id !== deletingCouponId));
      setDeletingCouponId(null);
    }
  }, [deletingCouponId]);

  const toggleCouponActive = useCallback((id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  }, []);

  // ---- Reward handlers ----
  const handleSaveReward = useCallback(
    (reward: LoyaltyReward) => {
      if (editingReward) {
        setRewards((prev) =>
          prev.map((r) => (r.id === reward.id ? reward : r))
        );
      } else {
        setRewards((prev) => [...prev, reward]);
      }
      setRewardModalOpen(false);
      setEditingReward(null);
    },
    [editingReward]
  );

  const handleDeleteReward = useCallback(() => {
    if (deletingRewardId) {
      setRewards((prev) => prev.filter((r) => r.id !== deletingRewardId));
      setDeletingRewardId(null);
    }
  }, [deletingRewardId]);

  const toggleRewardActive = useCallback((id: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  }, []);

  // ---- Campaign handlers ----
  const handleSaveCampaign = useCallback(
    (campaign: BannerCampaign) => {
      if (editingCampaign) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? campaign : c))
        );
      } else {
        setCampaigns((prev) => [...prev, campaign]);
      }
      setCampaignModalOpen(false);
      setEditingCampaign(null);
    },
    [editingCampaign]
  );

  const handleDeleteCampaign = useCallback(() => {
    if (deletingCampaignId) {
      setCampaigns((prev) => prev.filter((c) => c.id !== deletingCampaignId));
      setDeletingCampaignId(null);
    }
  }, [deletingCampaignId]);

  const toggleCampaignActive = useCallback((id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  }, []);

  // ---- Coupon table columns ----
  const couponColumns: Column<Coupon>[] = [
    {
      accessor: "code",
      header: "Code",
      cell: (row) => (
        <span className="font-mono font-bold text-foreground">
          {row.code}
        </span>
      ),
    },
    {
      accessor: "discountType",
      header: "Type",
      cell: (row) => (
        <Badge variant="secondary">
          {row.discountType === "percentage"
            ? `${row.value}% Off`
            : `$${row.value} Off`}
        </Badge>
      ),
    },
    {
      accessor: "value",
      header: "Value",
      cell: (row) => (
        <span>
          {row.discountType === "percentage"
            ? `${row.value}%`
            : formatVND(row.value)}
        </span>
      ),
    },
    {
      accessor: "minimumOrder",
      header: "Min Order",
      cell: (row) => (
        <span>{formatVND(row.minimumOrder)}</span>
      ),
    },
    {
      accessor: "usageCount",
      header: "Usage",
      cell: (row) => (
        <span>
          {row.usageCount}/{row.maxUsage}
        </span>
      ),
    },
    {
      accessor: "expiryDate",
      header: "Expiry",
      cell: (row) => (
        <span
          className={cn(
            isExpired(row.expiryDate) && "text-red-500 font-medium"
          )}
        >
          {formatDate(row.expiryDate)}
        </span>
      ),
    },
    {
      accessor: "active",
      header: "Status",
      cell: (row) => (
        <Switch
          checked={row.active}
          onCheckedChange={() => toggleCouponActive(row.id)}
        />
      ),
    },
    {
      accessor: "id",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCoupon(row);
              setCouponModalOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeletingCouponId(row.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Promotions
        </h1>
        <p className="text-muted-foreground">
          Manage coupons, loyalty rewards, and banner campaigns.
        </p>
      </div>

      <Tabs defaultValue="coupons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons" className="gap-2">
            <Ticket className="h-4 w-4" />
            Coupons
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Gift className="h-4 w-4" />
            Loyalty Rewards
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Banner Campaigns
          </TabsTrigger>
        </TabsList>

        {/* ---- Coupons Tab ---- */}
        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingCoupon(null);
                setCouponModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </div>

          <DataTable
            columns={couponColumns}
            data={coupons}
            searchPlaceholder="Search coupons..."
            searchKey="code"
          />

          {couponModalOpen && (
            <CouponModal
              open={couponModalOpen}
              onOpenChange={(open) => {
                setCouponModalOpen(open);
                if (!open) setEditingCoupon(null);
              }}
              coupon={editingCoupon}
              onSave={handleSaveCoupon}
            />
          )}

          <ConfirmDialog
            open={deletingCouponId !== null}
            onOpenChange={(open) => {
              if (!open) setDeletingCouponId(null);
            }}
            title="Delete Coupon"
            description="Are you sure you want to delete this coupon? This action cannot be undone."
            onConfirm={handleDeleteCoupon}
            variant="destructive"
          />
        </TabsContent>

        {/* ---- Loyalty Rewards Tab ---- */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingReward(null);
                setRewardModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Reward
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        reward.rewardType === "free-product"
                          ? "default"
                          : reward.rewardType === "discount"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {REWARD_TYPE_LABELS[reward.rewardType]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Points Cost</span>
                    <span className="font-semibold text-foreground">
                      {reward.pointsCost.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expiry</span>
                    <span
                      className={cn(
                        "font-medium",
                        isExpired(reward.expiryDate)
                          ? "text-red-500"
                          : "text-foreground"
                      )}
                    >
                      {formatDate(reward.expiryDate)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Switch
                      checked={reward.active}
                      onCheckedChange={() => toggleRewardActive(reward.id)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingReward(reward);
                          setRewardModalOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingRewardId(reward.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {rewards.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
              <Gift className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No loyalty rewards yet. Add your first reward.
              </p>
            </div>
          )}

          {rewardModalOpen && (
            <RewardModal
              open={rewardModalOpen}
              onOpenChange={(open) => {
                setRewardModalOpen(open);
                if (!open) setEditingReward(null);
              }}
              reward={editingReward}
              onSave={handleSaveReward}
            />
          )}

          <ConfirmDialog
            open={deletingRewardId !== null}
            onOpenChange={(open) => {
              if (!open) setDeletingRewardId(null);
            }}
            title="Delete Reward"
            description="Are you sure you want to delete this loyalty reward? This action cannot be undone."
            onConfirm={handleDeleteReward}
            variant="destructive"
          />
        </TabsContent>

        {/* ---- Banner Campaigns Tab ---- */}
        <TabsContent value="banners" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              These banners feed into the Hero Carousel on the public site.
            </div>
            <Button
              onClick={() => {
                setEditingCampaign(null);
                setCampaignModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Campaign
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader className="p-0">
                  <div className="flex h-40 items-center justify-center rounded-t-xl bg-muted">
                    {campaign.image ? (
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="h-full w-full rounded-t-xl object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDate(campaign.startDate)} -{" "}
                      {formatDate(campaign.endDate)}
                    </span>
                  </div>
                  {campaign.link && (
                    <p className="truncate text-sm text-muted-foreground">
                      {campaign.link}
                    </p>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Switch
                      checked={campaign.active}
                      onCheckedChange={() => toggleCampaignActive(campaign.id)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setCampaignModalOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingCampaignId(campaign.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {campaigns.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No banner campaigns yet. Add your first campaign.
              </p>
            </div>
          )}

          {campaignModalOpen && (
            <CampaignModal
              open={campaignModalOpen}
              onOpenChange={(open) => {
                setCampaignModalOpen(open);
                if (!open) setEditingCampaign(null);
              }}
              campaign={editingCampaign}
              onSave={handleSaveCampaign}
            />
          )}

          <ConfirmDialog
            open={deletingCampaignId !== null}
            onOpenChange={(open) => {
              if (!open) setDeletingCampaignId(null);
            }}
            title="Delete Campaign"
            description="Are you sure you want to delete this banner campaign? This action cannot be undone."
            onConfirm={handleDeleteCampaign}
            variant="destructive"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
