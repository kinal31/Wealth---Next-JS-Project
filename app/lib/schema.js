

import {z} from "zod"

export const accountSchema = z.object({
    name: z.string().min(1,"Name is required"), // min 1 letter inside of it 
    balance: z.string().min(1, "Intial balance is required"),
    type:z.enum(["CURRENT", "SAVINGS"]),
    isDefault: z.boolean().default(false),
})

export const transactionSchema = z.object({
    type : z.enum(["INCOME", "EXPENSES"]),
    amount : z.string().min(1, "Amount is required"),
    description : z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
})
.superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {  //(true && empty)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });