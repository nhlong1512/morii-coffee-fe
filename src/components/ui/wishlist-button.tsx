"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { WishlistItem } from "@/stores/wishlist-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
  product: {
    productId: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    inStock: boolean;
    quantitySold?: number;
  };
  size?: "sm" | "md";
  variant?: "overlay" | "inline";
  className?: string;
}

export function WishlistButton({
  product,
  size = "sm",
  variant = "overlay",
  className,
}: WishlistButtonProps) {
  const t = useTranslations("wishlist");
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const pendingIds = useWishlistStore((state) => state.pendingIds);

  const wishlisted = isInWishlist(product.productId);
  const isPending = pendingIds.has(product.productId);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    if (wishlisted) {
      setShowRemoveDialog(true);
    } else {
      const item: WishlistItem = {
        productId: product.productId,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        inStock: product.inStock,
        addedAt: new Date().toISOString(),
        quantitySold: product.quantitySold ?? 0,
      };
      void addItem(item);
    }
  };

  const handleConfirmRemove = async () => {
    setShowRemoveDialog(false);
    await removeItem(product.productId);
  };

  const overlayClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const inlineClasses = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const heartIconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  const buttonElement = (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
      aria-pressed={wishlisted}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "overlay" && [
          "absolute right-2 top-2 z-10",
          overlayClasses,
          "bg-background/80 shadow backdrop-blur-sm hover:bg-background",
        ],
        variant === "inline" && [
          "border border-border bg-card hover:bg-accent",
          inlineClasses,
        ],
        className
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-150 active:scale-125",
          heartIconSize,
          wishlisted
            ? "fill-red-500 stroke-red-500"
            : "fill-transparent stroke-foreground"
        )}
      />
    </button>
  );

  const withTooltip = wishlisted ? (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{buttonElement}</Tooltip.Trigger>
        <Tooltip.Content
          className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg"
          sideOffset={5}
        >
          {t("removeFromWishlist")}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  ) : (
    buttonElement
  );

  return (
    <>
      {withTooltip}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmRemoveTitle")}</DialogTitle>
            <DialogDescription>
              {t("confirmRemoveMessage", { productName: product.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              {t("remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
