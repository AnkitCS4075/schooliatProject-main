import { z } from "zod";
import { optionalNullableHttpUrl } from "./optional-http-url.schema.js";
import {
  optionalEstablishedYearField,
  optionalNullableTrimmedString,
  optionalSchoolEmailField,
  optionalSchoolRegionId,
  optionalStudentStrengthField,
} from "./school-writable-fields.schema.js";

const updateSchoolSchema = z.object({
  request: z.object({
    name: z
      .string()
      .trim()
      .min(1, "School name cannot be empty")
      .optional(),
    code: z
      .string()
      .trim()
      .min(1, "School code cannot be empty")
      .optional(),
    email: z.string().trim().email("Invalid email format").optional(),
    phone: z.string().trim().min(1, "Phone cannot be empty").optional(),
    address: z
      .array(z.string().trim().min(1, "Address line cannot be empty"))
      .min(1, "At least one address line is required")
      .optional(),
    regionId: optionalSchoolRegionId(),
    certificateLink: optionalNullableHttpUrl(
      "Certificate link must be a valid URL",
    ),
    gstNumber: optionalNullableTrimmedString(),
    principalName: optionalNullableTrimmedString(),
    principalEmail: optionalSchoolEmailField("Invalid email"),
    principalPhone: optionalNullableTrimmedString(),
    establishedYear: optionalEstablishedYearField(),
    boardAffiliation: optionalNullableTrimmedString(),
    studentStrength: optionalStudentStrengthField(),
    bankName: optionalNullableTrimmedString(),
    bankAccountNumber: optionalNullableTrimmedString(),
    bankIfscCode: optionalNullableTrimmedString(),
    bankBranchName: optionalNullableTrimmedString(),
    upiId: optionalNullableTrimmedString(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export default updateSchoolSchema;
