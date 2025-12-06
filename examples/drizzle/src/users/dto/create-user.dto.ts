import { z } from "zod";
import { ZodDto } from "@project-karin/core";

export const CreateUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
});

@ZodDto(CreateUserSchema)
export class CreateUserDto {
    name!: string;
    email!: string;
    password!: string;
}

