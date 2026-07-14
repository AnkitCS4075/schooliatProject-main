import { z } from "zod";

/**
 * Express query values are strings (or occasionally duplicated keys). Normalize so
 * empty / invalid optional params don't fail the whole list endpoint.
 */
const getSubjectsSchema = z.object({
    request: z.object({}),
    query: z
        .object({
            classId: z.string().optional(),
            page: z.string().optional(),
            limit: z.string().optional(),
        })
        .transform((q) => {
            const classIdInput = Array.isArray(q.classId) ? q.classId[0] : q.classId;
            const classIdRaw =
                typeof classIdInput === "string" ? classIdInput.trim() : undefined;
            const classId =
                classIdRaw && classIdRaw.length > 0 ? classIdRaw : undefined;
            if (classId) {
                const uuid =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuid.test(classId)) {
                    throw new z.ZodError([
                        {
                            code: z.ZodIssueCode.custom,
                            path: ["classId"],
                            message: "Class ID must be a valid UUID",
                        },
                    ]);
                }
            }
            const pageInput = Array.isArray(q.page) ? q.page[0] : q.page;
            const page =
                typeof pageInput === "string" ? pageInput.trim() : undefined;
            const pageNum =
                page && /^\d+$/.test(page) ? Math.max(1, parseInt(page, 10)) : 1;
            const limitInput = Array.isArray(q.limit) ? q.limit[0] : q.limit;
            const limit =
                typeof limitInput === "string" ? limitInput.trim() : undefined;
            const limitNum =
                limit && /^\d+$/.test(limit) ? Math.max(1, parseInt(limit, 10)) : 20;
            return { classId, page: pageNum, limit: limitNum };
        }),
    params: z.object({}),
});

export default getSubjectsSchema;
