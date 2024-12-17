import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'

const DashboardPage = () => {
    return (
        <div className='px-5'>
            {/* Budget progress  */}
            {/* overview */}
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
            </div>

        </div>
    )
}

export default DashboardPage
