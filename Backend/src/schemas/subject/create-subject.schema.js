import { z } from "zod";

const optionalShortText = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().max(50).optional(),
);

const optionalLongText = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().max(500).optional(),
);

const createSubjectSchema = z.object({
    request: z.object({
        name: z
            .string({ required_error: "Subject name is required" })
            .trim()
            .min(1, "Subject name is required")
            .max(100),
        code: optionalShortText,
        description: optionalLongText,
    }),
    query: z.object({}),
    params: z.object({}),
});

export default createSubjectSchema;
