import { z } from "zod";

const schoolTypes = [
  "PRIMARY",
  "SECONDARY",
  "PREPARATORY",
  "COMBINED",
  "SPECIAL",
  "OTHER",
] as const;

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const optionalCapacity = z
  .union([z.literal(""), z.coerce.number().int().nonnegative()])
  .optional()
  .transform((value) =>
    value === "" || value === undefined ? undefined : value,
  );

export const createSchoolSchema = z.object({
  code: z.string().trim().min(1).max(32),

  name: z.string().trim().min(2).max(200),

  type: z.enum(schoolTypes),

  districtId: z.uuid(),

  location: optionalText(200),

  address: optionalText(500),

  phone: optionalText(30),

  email: z.union([z.email(), z.literal("")]).optional(),

  capacity: optionalCapacity,
});

export const updateSchoolSchema = createSchoolSchema.partial().extend({
  id: z.uuid(),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;

export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
