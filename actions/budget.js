"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
    try {
        // console.log('Account ID:', accountId);

        const { userId } = await auth(); // check if user is authenticated/ login or not
        if (!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({ // check if user exists
            where: { clerkUserId: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const budget = await db.budget.findFirst({
            where: {
                userId: user.id,
            },
        });

        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        //currentDate.getFullYear() means 2024, currentDate.getMonth() means month, 1 means 1st day of the month
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        //currentDate.getMonth() + 1: Moves to the next month (December becomes January in this case).
        // 0 as the day: When you pass 0 as the day in the Date constructor, it sets the date to the last day of the previous month. This is a JavaScript quirk.

        // console.log('Start of Month:', startOfMonth);
        // console.log('End of Month:', endOfMonth);

        const expenses = await db.transaction.aggregate({
            where: {
                userId: user.id,
                type: "EXPENSE",
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
                accountId,
            },
            _sum: {
                amount: true,
            },
        });
        
        // console.log('Expenses Result:', expenses);


        return {
            budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
            currentExpense: expenses._sum.amount ? expenses._sum.amount.toNumber() : 0
        }
    }
    catch (error) {
        console.log(error.message);
        return { success: false, error: error.message };
    }
}

export async function updateBudget(amount) {
    try {
        const { userId } = await auth(); // check if user is authenticated/ login or not
        if (!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({ // check if user exists
            where: { clerkUserId: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const budget = await db.budget.upsert({ // upsert means insert if not exists create,and update if exists
            where: { userId: user.id },
            update: { amount },
            create: {
                userId: user.id,
                amount: amount
            }
        });

        revalidatePath('/dashboard')
        return {
            success: true,
            data: { ...budget, amount: budget.amount.toNumber() }
        }
    }
    catch (error) {
        console.log(error.message);

        return { success: false, error: error.message };
    }
}