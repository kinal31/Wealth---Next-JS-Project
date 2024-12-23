"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => { // this function is used to convert decimal into number

    const serialized = { ...obj };

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }

    return serialized;
}

export async function updateDefaultAccount(accountId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // First, unset any existing default account
        await db.account.updateMany({
            where: {
                userId: user.id,
                isDefault: true,
            },
            data: { isDefault: false },
        });

        // Then set the new default account
        const account = await db.account.update({
            where: {
                id: accountId,
                userId: user.id,
            },
            data: { isDefault: true },
        });

        revalidatePath("/dashboard");
        return { success: true, data: serializeTransaction(account) }
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getAccountWithTransaction(accountId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
                id: accountId,
                userId: user.id,
            },
            include: {
                transactions: {
                    orderBy: { date: "desc" },
                },
                _count: {
                    select: { transactions: true },
                },
            },
        });

        if (!account) return null;

        return {
            ...serializeTransaction(account),
            transactions: account.transactions.map(serializeTransaction),
        };
    }
    catch (error) {
        console.log(error.message);

        return { success: false, error: error.message };
    }
}

export async function bulkDeleteTransactions(transactionId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const transactions = await db.transaction.findMany({
            where: {
                id: { in: transactionId },
                userId: user.id,
            },
        });

        const accountBalanceChanges = transactions.reduce((acc, transaction) => { // Transforms the transactions array into an object (acc) that tracks the net balance change for each accountId.

            const change = transaction.type === 'EXPENSE' ? transaction.amount : -transaction.amount;
            //If transaction.type is 'EXPENSE': The amount is positive (since it's an outgoing transaction, it reduces the account balance).
            // If transaction.type is not 'EXPENSE' (assumed to be 'INCOME'): The amount is negative (because income adds to the balance, but subtracting a negative value achieves this in calculations).

            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;

            return acc;
        }, {});

        //delete transactions and update account balances in a transaction table
        await db.$transaction(async (tx) => {  //The db.$transaction method is a feature provided by modern database ORM libraries like Prisma. It is used to execute multiple database operations within a single transaction.

            //Delete transactions
            await tx.transaction.deleteMany({
                where: {
                    id: { in: transactionId },
                    userId: user.id,
                }
            });

            // Update account balances
            for (const [accountId, balanceChange] of Object.entries(
                accountBalanceChanges
            )) {
                await tx.account.update({
                    where: { id: accountId },
                    data: {
                        balance: {
                            increment: balanceChange,
                        },
                    },
                });
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/account/[id]");
    
        return { success: true };
    }
    catch (error) {
        console.log(error.message);

        return { success: false, error: error.message };
    }
}                                                                   