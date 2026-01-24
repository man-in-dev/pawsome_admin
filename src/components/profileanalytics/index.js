// 'use client'

// import React, { useState, useEffect } from 'react'

// // import ReactApexChart from 'react-apexcharts'
// import dynamic from 'next/dynamic'
// const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

// import { Doughnut } from 'react-chartjs-2'

// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
// ChartJS.register(ArcElement, Tooltip, Legend)

// import { Card, CardContent, Typography, Box } from '@mui/material'
// import { People, Pets, Category, LocalHospital } from '@mui/icons-material'

// import { matchAnalytics, profileAnalytics, vetAnalytics } from '@/app/api'

// const AnalyticsPage = () => {
//   const [data, setData] = useState({
//     totalPets: 0,
//     dogCount: 0,
//     catCount: 0,
//     newEnrollments: 0,
//     newEnrolledDogs: 0,
//     newEnrolledCats: 0,
//     breeds: [],
//     ageGroups: {},
//     diseases: []
//   })

//   const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
//   const defaultEndDate = new Date().toISOString().split('T')[0]

//   const [startDate, setStartDate] = useState(defaultStartDate)
//   const [endDate, setEndDate] = useState(defaultEndDate)

//   const fetchVetData = async () => {
//     try {
//       const res = await profileAnalytics(startDate, endDate)
//       if (res.status === 200) {
//         setData(res.data.data)
//       }
//     } catch (error) {
//       console.error('Error fetching vet analytics:', error)
//       setData([])
//     }
//   }

//   useEffect(() => {
//     fetchVetData()
//   }, [])

//   useEffect(() => {
//     fetchVetData()
//   }, [startDate, endDate])

//   const petChartData = {
//     series: [data.dogCount, data.catCount],
//     options: {
//       chart: {
//         type: 'donut',
//         height: 350
//       },
//       labels: ['Dogs', 'Cats'],
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
//           formatter: value => `${value} pets`
//         }
//       }
//     }
//   }

//   const breedsChartData = {
//     series: [
//       {
//         data: data.breeds.map(breed => breed.count)
//       }
//     ],
//     options: {
//       chart: {
//         type: 'bar',
//         height: 350
//       },
//       xaxis: {
//         categories: data.breeds.map(breed => breed.name)
//       },
//       title: {
//         text: 'Breed Distribution',
//         align: 'center'
//       },
//       plotOptions: {
//         bar: {
//           horizontal: true
//         }
//       }
//     }
//   }

//   const ageGroupsChartData = {
//     series: [
//       {
//         data: Object.values(data.ageGroups) || {}
//       }
//     ],
//     options: {
//       chart: {
//         type: 'bar',
//         height: 350
//       },
//       xaxis: {
//         categories: Object.keys(data.ageGroups) || {}
//       },
//       title: {
//         text: 'Age Group Distribution',
//         align: 'center'
//       },
//       plotOptions: {
//         bar: {
//           horizontal: true
//         }
//       }
//     }
//   }

//   const diseasesChartData = {
//     series: [
//       {
//         data: data.diseases.map(disease => disease.count) || []
//       }
//     ],
//     options: {
//       chart: {
//         type: 'bar',
//         height: 350
//       },
//       xaxis: {
//         categories: data.diseases.map(disease => disease.name) || []
//       },
//       title: {
//         text: 'Disease Distribution',
//         align: 'center'
//       },
//       plotOptions: {
//         bar: {
//           horizontal: true
//         }
//       }
//     }
//   }
//   const doughnutData = {
//     labels: ['Dogs', 'Cats'],
//     datasets: [
//       {
//         data: [data.dogCount, data.catCount],
//         backgroundColor: ['#FF6384', '#36A2EB'],
//         hoverBackgroundColor: ['#FF6384', '#36A2EB']
//       }
//     ]
//   }
//   const doughnutOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'bottom'
//       },
//       tooltip: {
//         callbacks: {
//           label: function (tooltipItem) {
//             return `${tooltipItem?.label}: ${tooltipItem?.raw} pets`
//           }
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
//         Detailed insights into pet metrics and distributions
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
//               Total Pets
//             </Typography>
//             <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
//               {data.totalPets}
//             </Typography>
//           </CardContent>
//         </Card>
//         <Card sx={enhancedCardStyle}>
//           <CardContent>
//             <Pets sx={{ fontSize: 40, color: '#2196f3', marginBottom: '10px' }} />
//             <Typography variant='h6' component='div'>
//               New Enrollments
//             </Typography>
//             <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
//               {data.newEnrollments}
//             </Typography>
//           </CardContent>
//         </Card>
//         <Card sx={enhancedCardStyle}>
//           <CardContent>
//             <Pets sx={{ fontSize: 40, color: '#ff9800', marginBottom: '10px' }} />
//             <Typography variant='h6' component='div'>
//               New Enrolled Dogs
//             </Typography>
//             <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
//               {data.newEnrolledDogs}
//             </Typography>
//           </CardContent>
//         </Card>
//         <Card sx={enhancedCardStyle}>
//           <CardContent>
//             <Pets sx={{ fontSize: 40, color: '#f44336', marginBottom: '10px' }} />
//             <Typography variant='h6' component='div'>
//               New Enrolled Cats
//             </Typography>
//             <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
//               {data.newEnrolledCats}
//             </Typography>
//           </CardContent>
//         </Card>
//       </Box>

//       {/* Circular Chart Section */}
//       <Box textAlign='center' marginTop='40px' marginBottom='40px'>
//         <Typography variant='h5' fontWeight='bold' marginBottom='20px'>
//           Pet Distribution
//         </Typography>
//         <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
//           <Doughnut data={doughnutData} options={doughnutOptions} />
//         </div>
//       </Box>

//       {/* Bar Charts Section */}
//       <Box marginBottom='40px'>
//         <ReactApexChart
//           options={breedsChartData?.options || []}
//           series={breedsChartData?.series || []}
//           type='bar'
//           height={350}
//         />
//       </Box>
//       <Box marginBottom='40px'>
//         <ReactApexChart
//           options={ageGroupsChartData?.options || []}
//           series={ageGroupsChartData?.series || []}
//           type='bar'
//           height={350}
//         />
//       </Box>
//       <Box>
//         <ReactApexChart
//           options={diseasesChartData?.options || []}
//           series={diseasesChartData?.series || []}
//           type='bar'
//           height={350}
//         />
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


'use client'

import React, { useState, useEffect } from 'react'

import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

import { Card, CardContent, Typography, Box } from '@mui/material'
import { People, Pets } from '@mui/icons-material'

import { profileAnalytics } from '@/app/api'

const AnalyticsPage = () => {
  const [data, setData] = useState({
    totalPets: 0,
    dogCount: 0,
    catCount: 0,
    newEnrollments: 0,
    newEnrolledDogs: 0,
    newEnrolledCats: 0,
    breeds: [],
    ageGroups: {},
    diseases: []
  })

  const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  const defaultEndDate = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  const fetchVetData = async () => {
    try {
      const res = await profileAnalytics(startDate, endDate)
      if (res.status === 200) {
        setData(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    fetchVetData()
  }, [startDate, endDate])

  // Data for the Doughnut chart
  const doughnutData = {
    labels: ['Dogs', 'Cats'],
    datasets: [
      {
        data: [data.dogCount, data.catCount],
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
            return `${tooltipItem.label}: ${tooltipItem.raw} pets`
          }
        }
      }
    }
  }

  // Data for horizontal bar charts
  const breedsBarData = {
    labels: data.breeds.map(breed => breed.name),
    datasets: [
      {
        label: 'Breeds',
        data: data.breeds.map(breed => breed.count),
        backgroundColor: '#4CAF50'
      }
    ]
  }

  const ageGroupsBarData = {
    labels: Object.keys(data.ageGroups),
    datasets: [
      {
        label: 'Age Groups',
        data: Object.values(data.ageGroups),
        backgroundColor: '#2196F3'
      }
    ]
  }

  const diseasesBarData = {
    labels: data.diseases.map(disease => disease.name),
    datasets: [
      {
        label: 'Diseases',
        data: data.diseases.map(disease => disease.count),
        backgroundColor: '#FF9800'
      }
    ]
  }

  const barOptions = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '2.5rem' }}>
        Analytics Dashboard
      </h1>
      <Typography variant='subtitle1' sx={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Detailed insights into pet metrics and distributions
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
              Total Pets
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.totalPets}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Pets sx={{ fontSize: 40, color: '#2196f3', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              New Enrollments
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.newEnrollments}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Pets sx={{ fontSize: 40, color: '#ff9800', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              New Enrolled Dogs
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.newEnrolledDogs || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={enhancedCardStyle}>
          <CardContent>
            <Pets sx={{ fontSize: 40, color: '#f44336', marginBottom: '10px' }} />
            <Typography variant='h6' component='div'>
              New Enrolled Cats
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {data.newEnrolledCats}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Doughnut Chart Section */}
      <Box textAlign='center' marginTop='40px' marginBottom='40px'>
        <Typography variant='h5' fontWeight='bold' marginBottom='20px'>
          Pet Distribution
        </Typography>
        <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </Box>

      {/* Bar Charts Section */}
      <Box marginBottom='40px'>
        <Bar data={breedsBarData} options={barOptions} />
      </Box>
      <Box marginBottom='40px'>
        <Bar data={ageGroupsBarData} options={barOptions} />
      </Box>
      <Box>
        <Bar data={diseasesBarData} options={barOptions} />
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
