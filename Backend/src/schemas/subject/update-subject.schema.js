import { z } from "zod";

const optionalShortText = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().max(50).optional(),
);

const optionalLongText = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().max(500).optional(),
);

const updateSubjectSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid subject ID"),
    }),
    request: z.object({
        name: z.string().trim().min(1, "Subject name cannot be empty").max(100).optional(),
        code: optionalShortText,
        description: optionalLongText,
    }),
    query: z.object({}),
});

export default updateSubjectSchema;
