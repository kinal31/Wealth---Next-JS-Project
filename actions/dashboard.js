'use server'

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }
    
    return serialized;
}

export async function createAccount(data) { // this data come from frontend 
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
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
            await db.account.updateMany({
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

export async function getUserAccounts(){
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }
        
        const accounts = await db.account.findMany({
            where:{userId : user.id},
            orderBy:{createdAt:'desc'},
            include:{
                _count:{
                    select:{
                        transactions:true,
                    }
                }
            }
        })
        const serislizeAccount = accounts.map(serializeTransaction);
        return serislizeAccount;
    } 
    catch (error) {
        console.error(error);        
    }
}