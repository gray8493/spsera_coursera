import { z } from "zod";

export const requestSchema = z.object({
  email: z.string().trim().email(),
  contactEmail: z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }, z.string().email().max(255).optional()),
  password: z.string().trim().min(1).max(200),
  courseTarget: z.string().trim().max(500).optional(),
  fptCode: z.string().trim().max(50).optional(),
  serviceType: z.enum(["FULL_SUPPORT", "SKIP_VIDEO"]).default("FULL_SUPPORT"),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const statusSchema = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

export const paymentStatusSchema = z.enum(["UNPAID", "PAID", "VERIFIED"]);
