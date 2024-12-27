import React from 'react'

export const metadata = {
  title: "Wealth App | Transaction",
  description: "In this page you can create a new transaction.",
};

const layout = ({children}) => {
  return (
    <div className='container mx-auto my-32'>
      {children}
    </div>
  )
}

export default layout
