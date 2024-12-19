"use client"
import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { set } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateAccountDrawer = ({ children }) => {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: '',
            type: "CURRENT",
            balance: "",
            isDefault: false
        }
    });

    const {
        data: newAccount,
        loading: createAccountLoader,
        error,
        fn: createAccountFn } = useFetch(createAccount); //createAccount server action

    useEffect(() => {
        if (newAccount) {
            toast.success("Account Created Sucessfully");
            setOpen(false);
            reset();
        }
    }, [newAccount]);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to Create Account");
        }
    }, [error])

    const onSubmit = async (data) => {
        console.log(data);
        await createAccountFn(data);
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                </DrawerHeader>
                <div className='px-4 pb-4'>
                    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                        <div className='space-y-2'>
                            <label htmlFor="name" className='text-sm font-medium'>Account Name </label>
                            <Input
                                id='name'
                                placeholder="e.g. Main Checking"
                                {...register("name")} />
                            {errors.name && (
                                <p className='text-sm text-red-500'>{errors.name.message}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor="type" className='text-sm font-medium'>Account Name </label>
                            <Select
                                onValueChange={(value) => setValue("type", value)} //onValueChange: The event is triggered when the value of the input changes.
                                // value is the new value received from the input.
                                // setValue("type", value) is a function (likely from React Hook Form) that programmatically sets the value of the form field with the name "type" to the new value.

                                defaultValue={watch("type")} //defaultValue: A prop used to specify the starting value of an uncontrolled input component.
                            //watch is a function (likely from React Hook Form) that monitors the value of the "type" field in the form.
                            // watch("type") retrieves the current value of the "type" field.
                            >
                                <SelectTrigger id='type'>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT">Current</SelectItem>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>

                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className='text-sm text-red-500'>{errors.type.message}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <label htmlFor="balance" className='text-sm font-medium'>Initial Balance </label>
                            <Input
                                id='balance'
                                type='number'
                                step='0.01'
                                placeholder="0.00"
                                {...register("balance")} />
                            {errors.balance && (
                                <p className='text-sm text-red-500'>{errors.balance.message}</p>
                            )}
                        </div>

                        <div className='flex items-center justify-between rounded-lg border p-3'>
                            <div className='space-y-1'>
                                <label htmlFor="isDefault" className='text-sm font-medium cursor-pointer'>Set as Default </label>

                                <p className='text-sm text-muted-foreground'>This account will be selected by default for transactions</p>
                            </div>

                            <Switch id='isDefault'
                                onCheckedChange={(checked) => setValue("isDefault", checked)}
                                checked={watch("isDefault")}
                            />
                        </div>

                        <div className='flex gap-4 pt-4'>
                            <DrawerClose asChild>
                                <Button type='button' variant='outline' className='flex-1'>
                                    Close
                                </Button>
                            </DrawerClose>

                            <Button type='submit' className='flex-1' disabled={createAccountLoader}>
                                {createAccountLoader ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating...</> : " Create an Account"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DrawerContent >

        </Drawer >

    )
}

export default CreateAccountDrawer
