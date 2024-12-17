'use server'

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
}

export async function createAccount(data) { // this data come from frontend 
    try {
        const { userid } = await auth();
        if (!userid) throw new Error('Unauthorized');

        const user = await db.user.findUnique({
            where: { clerkUserId: userid }
        });

        if (!user) {
            throw new Error("User not found");
        }

        //convert balance to float before saving
        const balanceFloat = parseFloat(data.balance)
        if (isNaN(balanceFloat)) {
            throw new Error('Invalid balance amount')
        }

        //check if this is the user's first account
        const existingAccounts = await db.account.findMany({
            where: {
                userId: user.id
            }
        });

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;
        // if this account should be default, unset other default account
        if (shouldBeDefault) {
            await db.account.ipdateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false }
            })
        }

        const account = await db.account.create({
            data: {
                ...data,
                userId: user.id,
                balance: balanceFloat,
                isDefault: shouldBeDefault,
            }
        });

        const serislizeAccount = serializeTransaction(account);
        revalidatePath("/dashboard");
        return { success: true, data: serislizeAccount }

    } catch (error) {
        throw new Error(error.message)
    }
}