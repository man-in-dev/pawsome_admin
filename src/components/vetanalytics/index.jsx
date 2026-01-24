'use client'

import React, { useState, useEffect } from 'react'



import dynamic from 'next/dynamic'

import CountUp from 'react-countup'

import { Doughnut } from 'react-chartjs-2' // Import the Doughnut chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

// import ReactApexChart from 'react-apexcharts'

import { Card, CardContent, Typography, Box } from '@mui/material'
import {
  People,
  TrendingUp,
  AttachMoney,
  PeopleAlt,
  Money,
  MoneyOffCsred,
  MoneyTwoTone,
  MoneyOffOutlined,
  BookOnline
} from '@mui/icons-material'

import { vetAnalytics } from '@/app/api'

const AnalyticsPage = () => {
  const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

  const [data, setData] = useState({
    totalActiveUsers: 0,
    retentionRate: 0,
    bookingGrowthRate: 0,
    bookingConversionRate: 0,
    bookingRevenue: 0,
    avgRevenuePerUser: 0,
    topBookedServiceName: '',
    topBookedServiceCount: 0,
    totalBookings: 0,
    totalClinicBookings: 0,
    totalHomeBookings: 0
  })

  const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  const defaultEndDate = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  const fetchVetData = async () => {
    try {
      const res = await vetAnalytics(startDate, endDate)
      if (res.status === 200) {
        setData(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching vet analytics:', error)
      setData([])
    }
  }

  useEffect(() => {
    fetchVetData()
  }, [])

  useEffect(() => {
    fetchVetData()
  }, [startDate, endDate])

  const isDataAvailable =
    typeof data.totalClinicBookings === 'number' &&
    typeof data.totalHomeBookings === 'number' &&
    (data.totalClinicBookings > 0 || data.totalHomeBookings > 0)
  // Chart data for bookings
  // Doughnut chart data
  const doughnutData = {
    labels: ['Clinic Bookings', 'Home Bookings'],
    datasets: [
      {
        label: 'Bookings',
        data: [data.totalClinicBookings || 0, data.totalHomeBookings || 0],
        backgroundColor: ['#4caf50', '#2196f3'],
        hoverBackgroundColor: ['#45a049', '#1e88e5'],
        borderWidth: 1
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
          label: tooltipItem => `${tooltipItem.raw} bookings`
        }
      }
    }
  }
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}>
        <PeopleAlt />
        Veterinary Analytics
      </h1>
      <Typography variant='subtitle1' sx={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Detailed insights into bookings and user metrics
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
              Total Active Users
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {<CountUp start={0} end={data.totalActiveUsers} />}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <TrendingUp sx={{ fontSize: 40, color: '#2196f3', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Retention Rate
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {<CountUp start={0} end={data.retentionRate} />}%
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <TrendingUp sx={{ fontSize: 40, color: '#ff9800', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Booking Growth Rate
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {<CountUp start={0} end={data.bookingGrowthRate} />}%
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <BookOnline sx={{ fontSize: 40, color: '#f44336', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Booking Conversion Rate
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {<CountUp start={0} end={data.bookingConversionRate} />}%
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Money sx={{ fontSize: 40, color: '#673ab7', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Booking Revenue
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              ₹{<CountUp start={0} end={data?.bookingRevenue?.toFixed(2)} />}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <MoneyTwoTone sx={{ fontSize: 40, color: '#00bcd4', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Avg Revenue per User
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              ₹{<CountUp start={0} end={data?.avgRevenuePerUser?.toFixed(2)} />}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <TrendingUp sx={{ fontSize: 40, color: '#3f51b5', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              Top Booked Service
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.topBookedServiceName}
            </Typography>
            <Typography variant='body1' sx={{ color: '#555', marginTop: '5px' }}>
              ({<CountUp start={0} end={data.topBookedServiceCount} />} bookings)
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Circular Chart Section */}
      <Box textAlign='center' marginTop='40px'>
        <Typography variant='h5' fontWeight='bold' marginBottom='20px'>
          Booking Distribution
        </Typography>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 'bold',
            color: '#666',
            textAlign: 'center',
            padding: '10px 20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9'
          }}
        >
          Total Bookings: {<CountUp start={0} end={data?.totalBookings} /> || 'N/A'}
        </Typography>
        {isDataAvailable ? (
          <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        ) : (
          <Typography variant='body1' sx={{ color: '#888', marginTop: '20px' }}>
            No data available for the selected date range.
          </Typography>
        )}
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

// 'use client'

// import React, { useState, useEffect } from 'react'
// import dynamic from 'next/dynamic'
// import { Card, CardContent, Typography, Box } from '@mui/material'
// import { People, TrendingUp, AttachMoney } from '@mui/icons-material'
// import { vetAnalytics } from '@/app/api'

// const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

// const AnalyticsPage = () => {
//   const [data, setData] = useState({
//     totalActiveUsers: 0,
//     retentionRate: 0,
//     bookingGrowthRate: 0,
//     bookingConversionRate: 0,
//     bookingRevenue: 0,
//     avgRevenuePerUser: 0,
//     topBookedServiceName: '',
//     topBookedServiceCount: 0,
//     totalBookings: 0,
//     totalClinicBookings: 0,
//     totalHomeBookings: 0
//   })

//   const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
//   const defaultEndDate = new Date().toISOString().split('T')[0]

//   const [startDate, setStartDate] = useState(defaultStartDate)
//   const [endDate, setEndDate] = useState(defaultEndDate)

//   useEffect(() => {
//     const fetchVetData = async () => {
//       try {
//         const res = await vetAnalytics(startDate, endDate)
//         if (res.status === 200 && res.data) {
//           setData(res.data.data || {})
//         }
//       } catch (error) {
//         console.error('Error fetching vet analytics:', error)
//       }
//     }

//     fetchVetData()
//   }, [startDate, endDate])

//   const isDataAvailable =
//     typeof data.totalClinicBookings === 'number' &&
//     typeof data.totalHomeBookings === 'number' &&
//     (data.totalClinicBookings > 0 || data.totalHomeBookings > 0)

//   // Chart data for bookings
//   const chartData = {
//     series: [data.totalClinicBookings || 0, data.totalHomeBookings || 0],
//     options: {
//       chart: {
//         type: 'donut',
//         height: 350
//       },
//       labels: ['Clinic Bookings', 'Home Bookings'],
//       legend: {
//         position: 'bottom'
//       },
//       plotOptions: {
//         pie: {
//           donut: {
//             size: '70%'
//           }
//         }
//       },
//       dataLabels: {
//         enabled: true,
//         formatter: val => `${val.toFixed(1)}%`
//       },
//       tooltip: {
//         y: {
//           formatter: value => `${value} bookings`
//         }
//       }
//     }
//   }

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h1 style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}>
//         Analytics Dashboard
//       </h1>
//       <Typography variant='subtitle1' sx={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
//         Detailed insights into bookings and user metrics
//       </Typography>

//       {/* Date Filters */}
//       <Box display='flex' justifyContent='center' marginBottom='30px' gap='20px'>
//         <Box>
//           <Typography variant='subtitle1' gutterBottom>
//             Start Date:
//           </Typography>
//           <input type='date' value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
//         </Box>
//         <Box>
//           <Typography variant='subtitle1' gutterBottom>
//             End Date:
//           </Typography>
//           <input type='date' value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
//         </Box>
//       </Box>

//       {/* Cards Section */}
//       <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(250px, 1fr))' gap='20px' marginBottom='40px'>
//         <Card sx={enhancedCardStyle}>
//           <CardContent>
//             <People sx={{ fontSize: 40, color: '#4caf50', marginBottom: '10px' }} />
//             <Typography variant='h6' component='div'>
//               Total Active Users
//             </Typography>
//             <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
//               {data.totalActiveUsers}
//             </Typography>
//           </CardContent>
//         </Card>
//         <Card sx={enhancedCardStyle}>
//           <CardContent>
//             <TrendingUp sx={{ fontSize: 40, color: '#2196f3', marginBottom: '10px' }} />
//             <Typography variant='h6' component='div'>
//               Retention Rate
//             </Typography>
//             <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
//               {data.retentionRate}%
//             </Typography>
//           </CardContent>
//         </Card>
//         <Card sx={enhancedCardStyle}>
//           <CardContent>
//             <AttachMoney sx={{ fontSize: 40, color: '#673ab7', marginBottom: '10px' }} />
//             <Typography variant='h6' component='div'>
//               Booking Revenue
//             </Typography>
//             <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
//               ${data.bookingRevenue.toFixed(2)}
//             </Typography>
//           </CardContent>
//         </Card>
//       </Box>

//       {/* Circular Chart Section */}
//       <Box textAlign='center' marginTop='40px'>
//         <Typography variant='h5' fontWeight='bold' marginBottom='20px'>
//           Total Bookings: {data.totalBookings || 0}
//         </Typography>
//         {isDataAvailable ? (
//           <ReactApexChart options={chartData.options} series={chartData.series} type='donut' height={350} />
//         ) : (
//           <Typography variant='body1' sx={{ color: '#888', marginTop: '20px' }}>
//             No data available for the selected date range.
//           </Typography>
//         )}
//       </Box>
//     </div>
//   )
// }

// const enhancedCardStyle = {
//   padding: '20px',
//   boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
//   borderRadius: '10px',
//   backgroundColor: '#fdfdfd',
//   textAlign: 'center',
//   transition: 'transform 0.3s ease',
//   '&:hover': {
//     transform: 'translateY(-5px)',
//     boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
//   }
// }

// const inputStyle = {
//   padding: '10px',
//   border: '1px solid #ccc',
//   borderRadius: '5px',
//   fontSize: '14px'
// }

// export default AnalyticsPage
