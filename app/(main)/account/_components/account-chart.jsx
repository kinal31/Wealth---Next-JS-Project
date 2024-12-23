"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const DATE_RANGES = {
    "7D": { label: "Last 7 Days", days: 7 },
    "1M": { label: "Last Month", days: 30 },
    "3M": { label: "Last 3 Months", days: 90 },
    "6M": { label: "Last 6 Months", days: 180 },
    ALL: { label: "All Time", days: null },
};

const AccountChart = ({ transactions }) => {
    const [dateRange, setDateRange] = useState("1M");

    const filterData = useMemo(() => {
        const range = DATE_RANGES[dateRange]; //DATE_RANGE["1M"]
        const now = new Date();

        const startDate = range.days //30
            ? startOfDay(subDays(now, range.days)) //// Get the start of the day from 30 days ago
            : new Date(0); // means range will be all and start date will be 0

        //filter transaction data based on the selected date range
        const filtered = transactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now));

        const group = filtered.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), "MMM dd");

            if (!acc[date]) {
                acc[date] = { date, income: 0, expense: 0 }
            }

            if (transaction.type === "INCOME") {
                acc[date].income += transaction.amount
            }
            else {
                acc[date].expense += transaction.amount
            }

            return acc;
        }, {});

        //convert to an array and sort data
        return Object.values(group).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

    }, [dateRange, transactions])

    // console.log(filterData);
    const totals = useMemo(() => {
        return filterData.reduce((acc, transaction) => ({
            income: acc.income + transaction.income,
            expense: acc.expense + transaction.expense
        }), { income: 0, expense: 0 });
    }, [filterData])

    // console.log(totals);


    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <CardTitle className="font-normal text-base">Transaction Overview</CardTitle>
                    <Select defaultValue={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(DATE_RANGES).map(([Key, { label }]) => {
                                return <SelectItem key={Key} value={Key}>
                                    {label}
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>

                </CardHeader>
                <CardContent>
                    <div className="flex justify-around mb-6 text-sm">
                        <div className="text-center">
                            <p className="text-muted-foreground">Total Income</p>
                            <p className="text-lg font-bold text-green-500">
                                ${totals.income.toFixed(2)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-muted-foreground">Total Expenses</p>
                            <p className="text-lg font-bold text-red-500">
                                ${totals.expense.toFixed(2)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-muted-foreground">Net</p>
                            <p
                                className={`text-lg font-bold ${totals.income - totals.expense >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                    }`}
                            >
                                ${(totals.income - totals.expense).toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className='h-[300px]'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={filterData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 10,   
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`} />
                                <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#22c55e"
                                    radius={[4, 4, 4, 0]}

                                />
                                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>

            </Card>


        </>
    )
}

export default AccountChart
