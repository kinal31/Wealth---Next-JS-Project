import { getAccountData, getUserAccounts } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'
// import AccountCard from './_components/account-card'
const AccountCard = dynamic(() => import('./_components/account-card'))
import { getCurrentBudget } from '@/actions/budget'
// import BudgetProgress from './_components/budget-progress'
const BudgetProgress = dynamic(() => import('./_components/budget-progress'))
// import DashboardOverview from './_components/dashboard-overview'
const DashboardOverview = dynamic(() => import('./_components/dashboard-overview'))

export default async function DashboardPage (){
    const accounts = await getUserAccounts();
    // console.log(accounts);
    
    const defaultAccount = accounts?.find((account) => account.isDefault);

    let budgetData = null;
    if(defaultAccount){
        budgetData = await getCurrentBudget(defaultAccount.id);
    }
    // console.log(budgetData);
    
    const transactions = await getAccountData();
    // console.log(transactions);
    

    return (
        <div className='space-y-8'>
            {/* Budget progress  */}
            {defaultAccount && <BudgetProgress 
                initialBudget={budgetData?.budget}
                currentExpenses={budgetData?.currentExpense || 0}/>}
            {/* overview */}
            <Suspense fallback="Loading overview ...">
                <DashboardOverview 
                    accounts={accounts}
                    transactions={transactions} />
            </Suspense>
            {/* account */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <CreateAccountDrawer>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                        <CardContent className="flex flex-col justify-center items-center text-muted-foreground pt-5 h-full">
                            <Plus className='h-10 w-10 mb-2'/>
                            <p className='text-sm font-medium'>Add New Account</p>
                        </CardContent>
                    </Card>
                </CreateAccountDrawer>

                {accounts.length> 0 && accounts?.map((account) => {
                    return <AccountCard key={account.id} account={account} />
                })}
            </div>

        </div>
    )
}


