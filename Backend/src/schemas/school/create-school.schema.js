import { z } from "zod";
import { optionalNullableHttpUrl } from "./optional-http-url.schema.js";
import {
  optionalEstablishedYearField,
  optionalNullableTrimmedString,
  optionalSchoolEmailField,
  optionalSchoolRegionId,
  optionalStudentStrengthField,
} from "./school-writable-fields.schema.js";

const createSchoolSchema = z.object({
  request: z.object({
    name: z.string().trim().min(1, "School name is required"),
    email: z.string().trim().email("Invalid email format"),
    phone: z.string().trim().min(1, "Phone is required"),
    address: z
      .array(z.string().trim().min(1, "Address line cannot be empty"))
      .min(1, "At least one address line is required"),
    code: z.string().trim().min(1, "School code is required"),
    gstNumber: optionalNullableTrimmedString(),
    principalName: optionalNullableTrimmedString(),
    principalEmail: optionalSchoolEmailField("Invalid email"),
    principalPhone: optionalNullableTrimmedString(),
    establishedYear: optionalEstablishedYearField(),
    boardAffiliation: optionalNullableTrimmedString(),
    studentStrength: optionalStudentStrengthField(),
    certificateLink: optionalNullableHttpUrl("Invalid URL"),
    bankName: optionalNullableTrimmedString(),
    bankAccountNumber: optionalNullableTrimmedString(),
    bankIfscCode: optionalNullableTrimmedString(),
    bankBranchName: optionalNullableTrimmedString(),
    regionId: optionalSchoolRegionId("Please select a valid region"),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createSchoolSchema;
