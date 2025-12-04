import { z } from "zod";

export const CreateProductSchema = z.object({
    name: z.string(),
    price: z.number(),
    description: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
