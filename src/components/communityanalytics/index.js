'use client'

import React, { useState, useEffect } from 'react'

import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

import { Card, CardContent, Typography, Box } from '@mui/material'

import { communityAnalytics } from '@/app/api'

const AnalyticsPage = () => {
  const [data, setData] = useState({
    activeUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    avgCommentsPerPost: 0,
    totalLikes: 0,
    avgLikesPerPost: 0
  })

  const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  const defaultEndDate = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  const fetchAnalyticsData = async () => {
    try {
      const res = await communityAnalytics(startDate, endDate)
      if (res.status === 200) {
        setData(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [startDate, endDate])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}>
        Community Analytics Dashboard
      </h1>
      <Typography variant='subtitle1' sx={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Insights into community activity and engagement
      </Typography>

      {/* Date Filters */}
      <Box display='flex' justifyContent='center' marginBottom='30px' gap='20px'>
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Start Date:
          </Typography>
          <input type='date' value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
        </Box>
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            End Date:
          </Typography>
          <input type='date' value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
        </Box>
      </Box>

      {/* Cards Section */}
      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(250px, 1fr))' gap='20px' marginBottom='40px'>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Active Users
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.activeUsers}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Total Posts
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalPosts}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Total Comments
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalComments}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Avg Comments Per Post
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.avgCommentsPerPost.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Total Likes
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalLikes}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Avg Likes Per Post
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.avgLikesPerPost.toFixed(2)}
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

const inputStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  fontSize: '14px'
}

export default AnalyticsPage
