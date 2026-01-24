'use client'

import React, { useState, useEffect } from 'react'

// import ReactApexChart from 'react-apexcharts'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

import { Doughnut } from 'react-chartjs-2'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

import { Card, CardContent, Typography, Box } from '@mui/material'
import { Analytics, People, Pets } from '@mui/icons-material'

import CountUp from 'react-countup'

import { matchAnalytics } from '@/app/api'

const AnalyticsPage = () => {
  const [data, setData] = useState({
    totalSwipes: 0,
    leftSwipes: 0,
    rightSwipes: 0,
    activeUsersCount: 0,
    avgSwipesPerUser: 0,
    totalMatches: 0,
    totalUnMatches: 0,
    avgMatchesPerUser: 0
  })

  const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  const defaultEndDate = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  useEffect(() => {
    async function getMatchData() {
     try {
       const res = await matchAnalytics(startDate, endDate)
       if (res.status === 200) {
         setData(res.data.data)
       }
     } catch (error) {
       setData([])
     }
      
    
    }
    getMatchData()
  }, [startDate, endDate])

  const doughnutData = {
    labels: ['Left Swipes', 'Right Swipes'],
    datasets: [
      {
        data: [data.leftSwipes, data.rightSwipes],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB']
      }
    ]
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} swipes`
          }
        }
      }
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}>
        <Analytics sx={{ color: '#4caf50' }} />
        Match Module Analytics
      </h1>
      <Typography variant='subtitle1' sx={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Insights into user activity and swipes
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
            <People sx={{ fontSize: 40, color: '#4caf50', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Active Users
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.activeUsersCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Pets sx={{ fontSize: 40, color: '#2196f3', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Average Swipes per User
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.avgSwipesPerUser}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Pets sx={{ fontSize: 40, color: '#ff9800', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Total Matches
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalMatches}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Pets sx={{ fontSize: 40, color: '#f44336', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Total Unmatches
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalUnMatches}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Pets sx={{ fontSize: 40, color: '#673ab7', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Average Matches per User
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.avgMatchesPerUser}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Circular Chart Section */}
      <Box textAlign='center' marginTop='40px' marginBottom='40px'>
        <Typography variant='h5' fontWeight='bold' marginBottom='20px'>
          Swipe Distribution
        </Typography>
        <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
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
