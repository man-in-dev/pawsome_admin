'use client'

import React, { useState, useEffect } from 'react'

import { Card, CardContent, Typography, Box } from '@mui/material'
import { People } from '@mui/icons-material'

import { getUserAnalytics } from '@/app/api'

const AnalyticsPage = () => {
  const [data, setData] = useState({ totalUsers: 0 })

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        const res = await getUserAnalytics()
        if (res) {
          setData(res.data)
        }
      } catch (error) {
        console.error('Error fetching user analytics:', error)
      }
    }

    fetchUserAnalytics()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}>
        User Analytics Dashboard
      </h1>
      <Typography variant='subtitle1' sx={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Insights into user metrics
      </Typography>

      {/* Cards Section */}
      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(250px, 1fr))' gap='20px' marginBottom='40px'>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <People sx={{ fontSize: 40, color: '#4caf50', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Total Users
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalUsers}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </div>
  )
}

const enhancedCardStyle = {
  padding: '20px',
  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
  borderRadius: '10px',
  backgroundColor: '#fdfdfd',
  textAlign: 'center',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
  }
}

export default AnalyticsPage
