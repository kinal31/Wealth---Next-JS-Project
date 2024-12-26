import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import React from 'react'
import AddTransactionForm from '../_component/transaction-form';
import { getTransactions } from '@/actions/transaction';

const AddTransactionPage = async({searchParams}) => {
    const accounts = await getUserAccounts();
    // console.log(accounts);
    const editId = searchParams?.edit;
    // console.log(editedId);
    let initialData =null;
    if(editId){
      const transaction = await getTransactions(editId);
      initialData = transaction;
      // console.log(initialData);     
    }

  return (
    <div className='max-w-3xl mx-auto px-5'>
      <h1 className='text-5xl gradient-title'>{editId? "Edit" : "Add"} Transaction</h1>

      <AddTransactionForm accounts={accounts} categories={defaultCategories} editMode={!!editId} initialData={initialData} />                                                       {/*editmode={true}*/}
    </div>
  )
}

export default AddTransactionPage
