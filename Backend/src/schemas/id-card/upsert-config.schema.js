import { z } from "zod";

const colorSchema = z.string().trim().min(1, "Color value is required");

const colorsSchema = z
  .object({
    primaryColor: colorSchema.optional(),
    secondaryColor: colorSchema.optional(),
  })
  .optional();

const typographySchema = z
  .object({
    textColorForHeaderAndFooter: colorSchema.optional(),
    defaultTextColor: colorSchema.optional(),
    defaultLabelColor: colorSchema.optional(),
    bloodGroupTextColor: colorSchema.optional(),
  })
  .optional();

const upsertConfigSchema = z
  .object({
    request: z
      .object({
        config: z
          .object({
            colors: colorsSchema,
            typography: typographySchema,
            schoolLogoFileId: z
              .string()
              .uuid("School logo file ID must be a valid UUID")
              .optional(),
          })
          .optional(),
        templateId: z.string().uuid("Template ID must be a valid UUID"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default upsertConfigSchema;
