import { z } from "zod";

const sendSchoolAdminWelcomeSchema = z.object({
  request: z.object({
    password: z.string().min(1, "Password is required to include in the welcome email"),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("School id must be a valid UUID"),
  }),
});

export default sendSchoolAdminWelcomeSchema;
