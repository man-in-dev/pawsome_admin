'use client'

import React, { useState, useEffect } from 'react'

import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

import { Card, CardContent, Typography, Box } from '@mui/material'

import { shopanAnalytics } from '@/app/api'

const AnalyticsPage = () => {
  const [data, setData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    orderGrowthRate: 0,
    avgOrderValue: 0,
    productCategoryRevenue: {},
    avgFulfilmentTimeMs: 0
  })

  const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  const defaultEndDate = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  const fetchAnalyticsData = async () => {
    const payload = {
      startDate: startDate,
      endDate: endDate
    }
    try {
      const res = await shopanAnalytics(payload)
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

  // Helper to format revenue
  const formatCurrency = amount => `₹${amount.toFixed(2)}`

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}>
        Analytics Dashboard
      </h1>
      <Typography variant='subtitle1' sx={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Detailed insights into shop metrics and distributions
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
              Total Orders
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalOrders}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Total Revenue
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {formatCurrency(data.totalRevenue)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Order Growth Rate
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.orderGrowthRate || 0}%
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Average Order Value
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {formatCurrency(data.avgOrderValue)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Typography variant='h6' component='div'>
              Average Fulfillment Time
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {(data.avgFulfilmentTimeMs / (1000 * 60 * 60)).toFixed(2)} hours
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Product Category Revenue */}
      <Box>
        <Typography variant='h5' fontWeight='bold' marginBottom='20px'>
          Product Category Revenue
        </Typography>
        <Bar
          data={{
            labels: Object.keys(data.productCategoryRevenue),
            datasets: [
              {
                label: 'Revenue',
                data: Object.values(data.productCategoryRevenue).map(category => category.amount),
                backgroundColor: '#4CAF50'
              },
              {
                label: 'Total Quantity',
                data: Object.values(data.productCategoryRevenue).map(category => category.totalQty),
                backgroundColor: '#2196F3'
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              x: {
                beginAtZero: true
              }
            }
          }}
        />
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
