import { z } from "zod";
import { createDefaultOpeningHours } from "./utils";

const storeHoursSchema = z
  .object({
    dayOfWeek: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    openTime: z.string().min(1, "Open time is required"),
    closeTime: z.string().min(1, "Close time is required"),
    isClosed: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.isClosed) {
      return;
    }

    if (value.openTime >= value.closeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Open time must be earlier than close time",
      });
    }
  });

export const storeFormSchema = z.object({
  name: z.string().trim().min(1, "Store name is required"),
  slug: z.string().trim(),
  address: z.string().trim().min(1, "Address is required"),
  district: z.string().trim(),
  city: z.string().trim().min(1, "City is required"),
  province: z.string().trim(),
  latitude: z
    .string()
    .trim()
    .min(1, "Latitude is required")
    .refine((value) => !Number.isNaN(Number(value)), "Latitude must be a valid number")
    .refine((value) => Number(value) >= -90 && Number(value) <= 90, "Latitude must be between -90 and 90"),
  longitude: z
    .string()
    .trim()
    .min(1, "Longitude is required")
    .refine((value) => !Number.isNaN(Number(value)), "Longitude must be a valid number")
    .refine((value) => Number(value) >= -180 && Number(value) <= 180, "Longitude must be between -180 and 180"),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, "Email must be valid"),
  coverImageUrl: z.string().trim(),
  isActive: z.boolean(),
  displayOrder: z
    .string()
    .trim()
    .min(1, "Display order is required")
    .refine((value) => !Number.isNaN(Number(value)), "Display order must be a valid number"),
  openingHours: z
    .array(storeHoursSchema)
    .length(7, "Stores must include exactly seven days of opening hours")
    .superRefine((value, ctx) => {
      const uniqueDays = new Set(value.map((hour) => hour.dayOfWeek));
      if (uniqueDays.size !== value.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Opening hours must contain unique days",
        });
      }
    }),
});

export type StoreFormSchema = z.infer<typeof storeFormSchema>;

export const defaultStoreFormValues = {
  name: "",
  slug: "",
  address: "",
  district: "",
  city: "",
  province: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
  coverImageUrl: "",
  isActive: true,
  displayOrder: "1",
  openingHours: createDefaultOpeningHours(),
};
