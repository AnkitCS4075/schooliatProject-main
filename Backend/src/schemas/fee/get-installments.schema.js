import { z } from "zod";

const getInstallmentsSchema = z
  .object({
    request: z.object({}).strip().optional(),
    query: z.object({}),
    params: z
      .object({
        installmentNumber: z
          .string()
          .regex(/^\d+$/, "Installment number must be a positive integer"),
      })
      ,
  })
  ;

export default getInstallmentsSchema;
