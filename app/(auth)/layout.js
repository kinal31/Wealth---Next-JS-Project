import React from 'react'

const AuthLayout = ({children}) => {
  return (
    <div className='flex justify-center pt-40'>   {/** both signin and signup will be in this div */}
      {children}
    </div>
  )
}

export default AuthLayout
