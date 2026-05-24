"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ShippingDistrict,
  ShippingProvince,
  ShippingWard,
} from "../types";

interface AddressSelectsProps {
  provinceId: number | null;
  districtId: number | null;
  wardCode: string | null;
  provinces: ShippingProvince[];
  districts: ShippingDistrict[];
  wards: ShippingWard[];
  disabled?: boolean;
  loadingDistricts?: boolean;
  loadingWards?: boolean;
  onProvinceChange: (provinceId: number) => void;
  onDistrictChange: (districtId: number) => void;
  onWardChange: (wardCode: string) => void;
}

export function AddressSelects({
  provinceId,
  districtId,
  wardCode,
  provinces,
  districts,
  wards,
  disabled = false,
  loadingDistricts = false,
  loadingWards = false,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
}: AddressSelectsProps) {
  const t = useTranslations("checkout");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          {t("province")}
        </label>
        <Select
          value={provinceId ? String(provinceId) : undefined}
          onValueChange={(value) => onProvinceChange(Number(value))}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectProvince")} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.provinceId} value={String(province.provinceId)}>
                {province.provinceName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          {t("district")}
        </label>
        <Select
          value={districtId ? String(districtId) : undefined}
          onValueChange={(value) => onDistrictChange(Number(value))}
          disabled={disabled || !provinceId || loadingDistricts}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectDistrict")} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.districtId} value={String(district.districtId)}>
                {district.districtName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          {t("ward")}
        </label>
        <Select
          value={wardCode ?? undefined}
          onValueChange={onWardChange}
          disabled={disabled || !districtId || loadingWards}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectWard")} />
          </SelectTrigger>
          <SelectContent>
            {wards.map((ward) => (
              <SelectItem key={ward.wardCode} value={ward.wardCode}>
                {ward.wardName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
