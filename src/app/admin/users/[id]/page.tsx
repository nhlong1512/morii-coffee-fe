"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole, EUserStatus } from "@/enums";
import * as userService from "@/services/user-service";
import type { ApiUserProfile } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const t = useTranslations("adminUsers");

  const [user, setUser] = useState<ApiUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role editing
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [roleSuccess, setRoleSuccess] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUserById(userId);
      setUser(data);
      setEditRoles([...data.roles]);
    } catch {
      setError("User not found or failed to load.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleToggleRole = (role: UserRole) => {
    setEditRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
    setRoleSuccess("");
  };

  const handleSaveRoles = async () => {
    if (!user || editRoles.length === 0) return;
    setSavingRoles(true);
    setRoleSuccess("");
    try {
      await userService.assignRoles(user.id, editRoles);
      // Refetch to confirm
      const updated = await userService.getUserById(user.id);
      setUser(updated);
      setEditRoles([...updated.roles]);
      setRoleSuccess(t("rolesSaved"));
    } catch {
      setRoleSuccess(t("rolesSaveFailed"));
    } finally {
      setSavingRoles(false);
    }
  };

  const rolesChanged =
    user &&
    (editRoles.length !== user.roles.length ||
      editRoles.some((r) => !user.roles.includes(r)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">{t("notFound")}</h2>
        <p className="text-muted-foreground mt-2">
          {error || t("notFoundHint")}
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/users">{t("backToUsers")}</Link>
        </Button>
      </div>
    );
  }

  const displayName = user.fullName || user.userName;

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
            <h1 className="text-2xl font-bold tracking-tight">
              {displayName}
            </h1>
            {user.roles.map((role) => (
              <Badge
                key={role}
                className={cn(
                  role === UserRole.Admin
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                    : role === UserRole.Staff
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                {role}
              </Badge>
            ))}
            <Badge
              className={cn(
                user.status === EUserStatus.Active
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
              <AvatarImage
                src={user.avatarUrl ?? undefined}
                alt={displayName}
              />
              <AvatarFallback className="text-xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                @{user.userName}
              </p>
              {user.phoneNumber && (
                <p className="text-sm text-muted-foreground">
                  {user.phoneNumber}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profileInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground">{t("fieldFullName")}</Label>
              <p className="text-sm font-medium">
                {user.fullName || t("notSet")}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">{t("fieldUsername")}</Label>
              <p className="text-sm font-medium">{user.userName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">{t("fieldEmail")}</Label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">{t("fieldPhone")}</Label>
              <p className="text-sm font-medium">
                {user.phoneNumber || t("notSet")}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">{t("fieldDateOfBirth")}</Label>
              <p className="text-sm font-medium">
                {user.dob ? formatDate(user.dob) : t("notSet")}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">{t("fieldGender")}</Label>
              <p className="text-sm font-medium">
                {user.gender || t("notSet")}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-muted-foreground">{t("fieldBio")}</Label>
              <p className="text-sm font-medium">{user.bio || t("noBio")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t("roleManagement")}</CardTitle>
          <CardDescription>
            {t("roleManagementHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            {Object.values(UserRole).map((role) => (
              <div key={role} className="flex items-center gap-3">
                <Checkbox
                  id={`role-${role}`}
                  checked={editRoles.includes(role)}
                  onCheckedChange={() => handleToggleRole(role)}
                />
                <Label htmlFor={`role-${role}`} className="font-normal">
                  {role}
                </Label>
              </div>
            ))}
          </div>

          {roleSuccess && (
            <p
              className={cn(
                "text-sm",
                roleSuccess.includes("Failed")
                  ? "text-destructive"
                  : "text-green-600 dark:text-green-400"
              )}
            >
              {roleSuccess}
            </p>
          )}

          <Separator />

          <Button
            onClick={handleSaveRoles}
            disabled={!rolesChanged || savingRoles || editRoles.length === 0}
          >
            {savingRoles ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("saveRoles")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
