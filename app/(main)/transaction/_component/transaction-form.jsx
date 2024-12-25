"use client"
import { createTransaction } from '@/actions/transaction'
import { transactionSchema } from '@/app/lib/schema'
import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import useFetch from '@/hooks/use-fetch'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const AddTransactionForm = ({ accounts, categories }) => {

    const router = useRouter();

    const { register, setValue, handleSubmit, formState: { errors }, getValues, watch, reset } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "EXPENSES",
            amount: " ",
            description: "",
            date: new Date(),
            accountId: accounts.find((ac) => ac.isDefault)?.id, //safely access the id of the first account in the accounts array that has the isDefault property set to true.
            isRecurring: false
        }
    });

    const {
        loading: transactionLoading,
        data: transactionResult,
        fn: transactionFn
    } = useFetch(createTransaction);

    const type = watch('type');
    const isRecurring = watch('isRecurring');
    const date = watch('date');

    const filteredCategories = categories.filter((category) => category.type === type);

    const onSubmit = async (data) =>{
        const formData = {
            ...data,
            amount : parseFloat(data.amount),
        }

        transactionFn(formData)
    }

    useEffect(() => {
        if (transactionResult?.success && !transactionLoading) {
          toast.success( "Transaction created successfully");
          reset();
          router.push(`/account/${transactionResult.data.accountId}`);
        }
      }, [transactionResult, transactionLoading]);

      
    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Ai Reciept Scanner  */}

            <div className="space-y-2">
                <label className="text-sm font-medium"> Type </label>
                <Select onValueChange={(value) => setValue('type', value)}
                    defaultValue={type} >
                    <SelectTrigger >
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium"> Amount </label>
                    <Input
                        type="number"
                        step="0.01" // Sets step to 0.01 for decimal input
                        placeholder='0.00'
                        {...register("amount")} />
                    {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium"> Account</label>
                    <Select onValueChange={(value) => setValue('accountId', value)}
                        defaultValue={getValues("accountId")} >
                        <SelectTrigger >
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}
                            <CreateAccountDrawer>
                                <Button variant="ghost" className='w-full select-none item-center text-sm outline-none'>
                                    Create Account
                                </Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>
                    {errors.accountId && (
                        <p className="text-sm text-red-500">{errors.accountId.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium"> Category</label>
                <Select onValueChange={(value) => setValue('category', value)}
                    defaultValue={getValues("category")} >
                    <SelectTrigger >
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name} (${parseFloat(category.balance).toFixed(2)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={"w-full pl-3 text-left font-normal"}
                        >
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => setValue("date", date)}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Enter description" {...register("description")} />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            {/* Recurring Toggle */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <label className="text-base font-medium">Recurring Transaction</label>
                    <div className="text-sm text-muted-foreground">
                        Set up a recurring schedule for this transaction
                    </div>
                </div>
                <Switch
                    checked={isRecurring}
                    onCheckedChange={(checked) => setValue("isRecurring", checked)}
                />
            </div>

            {/* Recurring Interval */}
            {isRecurring && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Recurring Interval</label>
                    <Select
                        onValueChange={(value) => setValue("recurringInterval", value)}
                        defaultValue={getValues("recurringInterval")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.recurringInterval && (
                        <p className="text-sm text-red-500">
                            {errors.recurringInterval.message}
                        </p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={transactionLoading}>

                    Create Transaction

                </Button>
            </div>
        </form>
    )
}

export default AddTransactionForm