"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Edit2, Camera } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import * as userService from "@/services/user-service";
import { EGender } from "@/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const user = useAuthStore((s) => s.user);
  const { isLoading } = useProtectedRoute();
  const setUser = useAuthStore((s) => s.setUser);

  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState<string>("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show loading state while checking auth or redirecting
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
          {t("myProfile")}
        </h1>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="flex flex-col gap-2 sm:flex-row">
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
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
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
              <div className="min-w-0">
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/change-password">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Change Password
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
