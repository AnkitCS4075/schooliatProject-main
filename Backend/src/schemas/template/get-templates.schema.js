import { z } from "zod";

const getTemplatesSchema = z
  .object({
    query: z
      .object({
        type: z
          .enum(["ID_CARD", "RESULT", "INVENTORY_RECEIPT", "FEE_RECEIPT"])
          .optional(),
      })
      ,
    params: z.object({}),
    request: z.object({}).strip().optional(),
  })
  ;

export default getTemplatesSchema;
