import { z } from "zod";
import { FeeLedgerEntryType } from "../../prisma/generated/index.js";

const optionalUuid = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().uuid("studentId must be a valid UUID").optional(),
);

const getSchoolFeeLedgerSchema = z.object({
  request: z.object({}).strip().optional(),
  query: z.object({
    studentId: optionalUuid,
    entryType: z.nativeEnum(FeeLedgerEntryType).optional(),
    academicYear: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .optional()
      .transform((v) => (v === undefined ? undefined : parseInt(v, 10))),
    limit: z
      .string()
      .regex(/^\d+$/)
      .optional()
      .transform((v) => (v === undefined ? undefined : parseInt(v, 10))),
  }),
  params: z.object({}),
});

export default getSchoolFeeLedgerSchema;
