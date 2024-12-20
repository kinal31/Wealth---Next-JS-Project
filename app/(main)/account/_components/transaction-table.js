"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MoreHorizontalIcon, RefreshCw, Search, Trash, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react'

const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
    const [selectedIds, setSelectedIds] = useState([]); // for checkbox select
    const [sortConfig, setSortConfig] = useState({  //for sort icon and direction in header
        field: "date",
        direction: "desc"
    });
    const [searchTerm, setSearchTerm] = useState(""); // for search input
    const [typeFilter, setTypeFilter] = useState(""); // for type filter dropdown
    const [recurringFilter, setRecurringFilter] = useState(""); // for recurring filter dropdown

    const router = useRouter();

    // Memoized filtered and sorted transactions
    const filteredAndSoredTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
                transaction.description?.toLowerCase().includes(searchLower)
            );
        }

        // Apply type filter
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }

        // Apply recurring filter
        if (recurringFilter) {
            result = result.filter((transaction) => {
                if (recurringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring;
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;
                default:
                    comparison = 0;
            }

            return sortConfig.direction === "asc" ? comparison : -comparison;
        });

        return result;
    }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

    const handleSort = (field) => {
        console.log("sort");
        setSortConfig((current) => ({
            field,
            direction: current.field == field && current.direction === "asc" ? "desc" : "asc",
        }))
    }

    const handleSelect = (id) => {
        setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id])); //if selected then remove it, else select it
    }

    const handleSelectAll = (id) => {
        setSelectedIds((current) => current.length === filteredAndSoredTransactions.length ? [] : filteredAndSoredTransactions.map((x) => x.id));
    }

    const handleBulkDelete = () => {
        console.log("Bulk delete");


    }

    const handleClearFilter = () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setSelectedIds([]);
    }

    return (
        <div className='space-y-4'>

            {/* filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className='flex flex-2 gap-1'>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger >
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedIds.length > 0 &&
                        <div className='flex items-center gap-2'>
                            <Button variant="destructive" size="sm" onClick={handleBulkDelete}> <Trash className='h-4 w-4 mr-2' /> Delete Selected ({selectedIds.length})</Button>
                        </div>
                    }

                    {(searchTerm || typeFilter || recurringFilter) && (
                        <Button variant="outline" size="icon" onClick={handleClearFilter} title="Clear Filters">
                            <X className='h-4 w-5' />
                        </Button>
                    )}
                </div>
            </div>

            {/* transactions */}
            <div className='rounded-md border'>
                <Table>
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader>
                        <TableRow>

                            <TableHead className="w-[50px]">
                                <Checkbox onCheckedChange={handleSelectAll}
                                    checked={selectedIds.length === filteredAndSoredTransactions.length && filteredAndSoredTransactions.length > 0} />
                            </TableHead>

                            <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                                <div className='flex items-center'>
                                    Date
                                    {sortConfig.field === "date" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}
                                </div>
                            </TableHead>

                            <TableHead>Description</TableHead>

                            <TableHead className="cursor-pointer" onClick={() => handleSort("category")} >
                                <div className='flex items-center'>
                                    Category
                                    {sortConfig.field === "category" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}
                                </div>
                            </TableHead>

                            <TableHead className="cursor-pointer" onClick={() => handleSort("amount")} >
                                <div className='flex items-center justify-end' >
                                    Amount
                                    {sortConfig.field === "amount" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}
                                </div>
                            </TableHead>

                            <TableHead>Recurring</TableHead>

                            <TableHead className='w-[50px]'></TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filteredAndSoredTransactions.length === 0 ? (
                                <TableRow colSpan={7} className='text-center text-muted-foreground'>
                                    <TableCell>No Transaction fount</TableCell>
                                </TableRow>
                            ) :
                                (
                                    filteredAndSoredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="w-[50px]">
                                                <Checkbox
                                                    onCheckedChange={() => handleSelect(transaction.id)}
                                                    checked={selectedIds.includes(transaction.id)} />
                                            </TableCell>

                                            <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>

                                            <TableCell>{transaction.description}</TableCell>

                                            <TableCell className="capitalize">
                                                <span style={{
                                                    backgroundColor: categoryColors[transaction.category]
                                                }}
                                                    className='px-2 py-1 rounded text-white text-sm'>
                                                    {transaction.category}
                                                </span>
                                            </TableCell>

                                            <TableCell className='text-right font-medium'
                                                style={{
                                                    color: transaction.type === "EXPENSE" ? "red" : "green"
                                                }}>
                                                {transaction.type === "EXPENSE" ? "-" : "+"}
                                                {transaction.amount.toFixed(2)}
                                            </TableCell>

                                            <TableCell>{transaction.isRecurring ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge className="gap-1 bg-purple-100  text-purple-700 hover:text-purple-200" variant='outline'>
                                                                <RefreshCw className='h-3 w-3' />
                                                                {
                                                                    RECURRING_INTERVALS[
                                                                    transaction.recurringInterval
                                                                    ]
                                                                }
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <div className='text-sm'>
                                                                <div className='font-medium'>Next Date: </div>
                                                                <div>{format(new Date(transaction.nextRecurringDate), "PP")}</div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <Badge className="gap-1" variant='outline'>
                                                    <Clock className='h-3 w-3' />
                                                    One-time
                                                </Badge>
                                            )}</TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant='ghost' className='h-8 w-8 p-0'>
                                                            <MoreHorizontalIcon className='h-4 w-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}>Edit</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className='text-destructive'
                                                        //  onClick={() => handleDelete(transaction.id)}
                                                        >Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                        }
                    </TableBody>
                </Table>

            </div>
        </div>
    )
}

export default TransactionTable
