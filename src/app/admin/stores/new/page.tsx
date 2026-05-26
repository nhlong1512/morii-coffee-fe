"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { createStore, StoreForm, type UpsertStoreRequest } from "@/features/stores";

export default function NewAdminStorePage() {
  const t = useTranslations("adminStores");
  const router = useRouter();

  const handleSubmit = async (payload: UpsertStoreRequest) => {
    await createStore(payload);
    router.push(ROUTES.ADMIN.STORES);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.ADMIN.STORES}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("createTitle")}</h1>
          <p className="text-muted-foreground">{t("createSubtitle")}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <StoreForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.ADMIN.STORES)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
