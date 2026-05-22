"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ROUTES } from "@/constants/routes";
import {
  StoreForm,
  type UpsertStoreRequest,
  updateStore,
  useAdminStore,
} from "@/features/stores";

export default function EditAdminStorePage() {
  const t = useTranslations("adminStores");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const storeId = typeof params.id === "string" ? params.id : null;
  const { data, loading, error, refetch } = useAdminStore(storeId);

  const handleSubmit = async (payload: UpsertStoreRequest) => {
    if (!storeId) {
      return;
    }

    await updateStore(storeId, payload);
    router.push(ROUTES.ADMIN.STORES);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.ADMIN.STORES}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("editTitle")}</h1>
          <p className="text-muted-foreground">{t("editSubtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner variant="spinner" size="md" />
        </div>
      ) : error ? (
        <div className="space-y-4">
          <ErrorMessage message={error} inline={false} />
          <Button variant="outline" onClick={refetch}>
            {t("retry")}
          </Button>
        </div>
      ) : !data ? (
        <EmptyState
          icon={<MapPin className="h-10 w-10" />}
          title={t("notFoundTitle")}
          description={t("notFoundDescription")}
        />
      ) : (
        <Card>
          <CardContent className="p-6">
            <StoreForm
              mode="edit"
              initialValue={data}
              onSubmit={handleSubmit}
              onCancel={() => router.push(ROUTES.ADMIN.STORES)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
