'use client'

import React from 'react'

import { Box, Button, Typography, Card } from '@mui/material'
import Link from 'next/link'

const UnauthorizedPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          p: 6,
          textAlign: 'center',
          boxShadow: 4,
          borderRadius: 4
        }}
      >
        <Typography variant='h4' gutterBottom>
          Access Denied
        </Typography>
        <Typography variant='body1' color='textSecondary' sx={{ mb: 4 }}>
          You do not have permission to view this page. If you believe this is a mistake, please contact your
          administrator.
        </Typography>
        <Button component={Link} href='/vet' variant='contained' sx={{ backgroundColor: '#FFA500' }}>
          Back to Dashboard
        </Button>
      </Card>
    </Box>
  )
}

export default UnauthorizedPage

