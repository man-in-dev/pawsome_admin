'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserLeftOverview from '@views/apps/user/view/user-left-overview'
import UserRight from '@views/apps/user/view/user-right'

const OverViewTab = dynamic(() => import('@views/apps/user/view/user-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/user/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/user/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/user/view/user-right/notifications'))
const ChatDetails = dynamic(() => import('@views/apps/user/view/user-right/chat'))

const tabContentList = {
  overview: <OverViewTab />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlans />,
  notifications: <NotificationsTab />,
  chat: <ChatDetails />
}

const UserViewTab = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={4} md={5}>
        <UserLeftOverview />
      </Grid>
      <Grid item xs={12} lg={8} md={7}>
        <UserRight tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default UserViewTab
