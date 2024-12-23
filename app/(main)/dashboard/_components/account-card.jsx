"use client"

import { updateDefaultAccount } from '@/actions/account'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import useFetch from '@/hooks/use-fetch'
import { ArrowDownRight, ArrowUpRight, AwardIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

const AccountCard = ({ account }) => {
    // console.log(account);
    
    const { id, name, balance, isDefault, type } = account;

    const {
        data: updateAccount,
        loading: updateAccountLoading,
        error,
        fn: updateAccountFn } = useFetch(updateDefaultAccount);

    const handleDefaultChange  = async (event) => {
        event.preventDefault();

        if (isDefault) {   // Don't allow toggling off the default account
            toast.warning("You need at least one default account");
            return;
        }

        await updateAccountFn(id);
    }
    
    useEffect(() => {
        if (updateAccount?.success) {
            toast.success("Default account updated successfully");
        }
    }, [updateAccount]);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update default account");
        }
    }, [error])


    return (
        <>
            <Card className="hover:shadow-md transition-shadow group relative">
                <Link href={`/account/${id}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                        <Switch
                            checked={isDefault}
                            onClick={handleDefaultChange }
                            disabled={updateAccountLoading} />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            ${parseFloat(balance).toFixed(2)}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            {type.charAt(0) + type.slice(1).toLowerCase()} Account
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                            Income
                        </div>
                        <div className="flex items-center">
                            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                            Expense
                        </div>
                    </CardFooter>
                </Link>
            </Card>
        </>
    )
}

export default AccountCard
