import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

function AppHeader() {
    return (
        <div className='p-4 shadow-sm flex items-center justify-between w-full'>
            <SidebarTrigger />
            <UserButton afterSignOutUrl='/sign-in' />
        </div>
    )
}

export default AppHeader