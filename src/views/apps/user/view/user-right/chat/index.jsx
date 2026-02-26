'use client'

import Grid from '@mui/material/Grid'

import ChatPage from './ChatPage'

const ChatDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChatPage />
      </Grid>
    </Grid>
  )
}

export default ChatDetails
