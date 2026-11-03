import { z } from "zod";

export const categoryEnum = z.enum([
  "WEB",
  "PWN",
  "CRYPTO",
  "REVERSE",
  "FORENSICS",
  "MISC",
  "OSINT",
]);

export const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD", "INSANE"]);

export const statusEnum = z.enum(["DRAFT", "UNLISTED", "PUBLIC"]);

export const createWriteupSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  excerpt: z
    .string()
    .max(500, "Excerpt must be at most 500 characters")
    .optional(),
  contentMd: z.string().min(10, "Content must be at least 10 characters"),
  coverImageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  ctfName: z.string().min(2, "CTF name is required").max(100),
  ctfYear: z
    .number()
    .int()
    .min(2000, "Year must be at least 2000")
    .max(new Date().getFullYear() + 2),
  category: categoryEnum,
  difficulty: difficultyEnum,
  status: statusEnum.default("DRAFT"),
  tags: z.array(z.string().min(1).max(30)).max(10, "At most 10 tags allowed").default([]),
});

export const updateWriteupSchema = createWriteupSchema.partial().extend({
  id: z.string().cuid(),
});

export const filterWriteupSchema = z.object({
  category: categoryEnum.optional(),
  difficulty: difficultyEnum.optional(),
  ctfName: z.string().optional(),
  ctfYear: z.coerce.number().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  search: z.string().optional(),
  status: statusEnum.optional(),
  sort: z.enum(["trending", "latest", "views", "alphabetical"]).default("trending"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateWriteupInput = z.infer<typeof createWriteupSchema>;
export type UpdateWriteupInput = z.infer<typeof updateWriteupSchema>;
export type FilterWriteupInput = z.input<typeof filterWriteupSchema>;
export type FilterWriteupOutput = z.infer<typeof filterWriteupSchema>;
