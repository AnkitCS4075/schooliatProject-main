import { z } from "zod";

const updateGateEntrySchema = z.object({
  request: z.object({
    outTime: z.coerce.date().optional(),
    reason: z.string().trim().max(500).optional(),
    classInterestedIn: z.string().trim().max(100).optional(),
    personToMeet: z.string().trim().max(200).optional(),
    photoFileId: z.string().uuid().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Gate entry ID must be a valid UUID"),
  }),
});

export default updateGateEntrySchema;
