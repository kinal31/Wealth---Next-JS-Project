"use client"
import React, { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { set } from 'date-fns';
import { useForm } from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod'
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';

const CreateAccountDrawer = ({ children }) => {
    const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState:{errors} , setValue,watch,reset} = useForm({
    resolver:zodResolver(accountSchema),
    defaultValues:{
        name:'',
        type:"CURRENT",
        balance:"",
        isDefault:false
    }
  });
    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                </DrawerHeader>
                <div className='px-4 pb-4'>
                    <form>
                        <div className='space-y-2'>
                            <label htmlFor="name" className='text-sm font-medium'>Account Name </label>
                            <Input 
                            id='name'
                            placeholder="e.g. Main Checking"
                            {...register("name")}/>
                            {errors.name && (
                                <p className='text-sm text-red-500'>{errors.name.message}</p>
                            )}
                        </div>
                    </form>
                </div>
            </DrawerContent>

        </Drawer>

    )
}

export default CreateAccountDrawer
