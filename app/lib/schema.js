

import {z} from "zod"

export const accountSchema = z.object({
    name: z.string().min(1,"Name is required"),
    balance: z.string().min(1, "Intial balance is required"),
    type:z.enum(["CURRENT", "SAVINGS"]),
    isDefault: z.boolean().default(false),
})