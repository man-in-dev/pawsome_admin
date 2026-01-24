'use client'

import React, { useEffect, useState } from 'react'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  MenuItem,
  Button,
  Collapse,
  IconButton
} from '@mui/material'

import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js'

import { FilterList, Close, Dashboard, ExpandMore, ExpandLess } from '@mui/icons-material'
import Slider from 'react-slick'

// Import react-slick components and styles
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ProtectedRoutes from '@/components/ProtectedRoute'
import { matchAnalytics, profileAnalytics, vetAnalytics } from '@/app/api'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, ArcElement)

// Carousel settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  centerMode: true,
  centerPadding: '0',
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: false
      }
    }
  ]
}

// Static sections data
const initialSections = []

const UserListCards = () => {
  const [sections, setSections] = useState([])
  const [vetAnalyticsData, setVetAnalyticsData] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)
  const [expandedFilter, setExpandedFilter] = useState(null)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    serviceType: 'all'
  })
  const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  const defaultEndDate = new Date().toISOString().split('T')[0]
  const doughnutData = vetAnalyticsData
    ? {
        labels: ['Clinic Bookings', 'Home Bookings'],
        datasets: [
          {
            data: [vetAnalyticsData.totalClinicBookings, vetAnalyticsData.totalHomeBookings],
            backgroundColor: ['#36a2eb', '#ff6384'], // Colors for chart sections
            hoverOffset: 4
          }
        ]
      }
    : null

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: tooltipItem => {
            return `${tooltipItem.label}: ${tooltipItem.raw} bookings`
          }
        }
      }
    }
  }

  // Fetch Veterinary Data
  const fetchVetData = async () => {
    const startDate = filters.startDate || defaultStartDate
    const endDate = filters.endDate || defaultEndDate
    try {
      const response = await vetAnalytics(startDate, endDate)
      if (response.status === 200) {
        setVetAnalyticsData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching vet analytics:', error.message)
    }
  }
  const fetchMatchData = async () => {
    const startDate = filters.startDate || defaultStartDate
    const endDate = filters.endDate || defaultEndDate
    try {
      const response = await matchAnalytics(startDate, endDate)
      if (response.status === 200) {
        setMatchData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching match analytics:', error.message)
    }
  }
  const fetchProfileData = async () => {
    const startDate = filters.startDate || defaultStartDate
    const endDate = filters.endDate || defaultEndDate

    try {
      const response = await profileAnalytics(startDate, endDate)
      if (response.status === 200) {
        setProfileData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching profile analytics:', error.message)
    }
  }

  // Apply Filters and Add Veterinary Section
  const applyFilters = () => {
    const filteredSections = initialSections.map(section => {
      const filteredData = section.data.filter(item => {
        if (filters.startDate && filters.endDate) {
          const itemDate = new Date(item.date || '2025-01-01')
          const startDate = new Date(filters.startDate)
          const endDate = new Date(filters.endDate)
          return itemDate >= startDate && itemDate <= endDate
        }
        return true
      })
      return { ...section, data: filteredData }
    })

    // Add Veterinary Section dynamically
    if (vetAnalyticsData) {
      filteredSections.push({
        title: 'Veterinary Section',
        data: [
          {
            title: 'Total Bookings',
            value: vetAnalyticsData?.totalBookings,
            avatarColor: '#2196f3',
            cardBackground: 'linear-gradient(to right, #36d1dc, #5b86e5)',
            subTitle: 'Overall Bookings'
          },
          {
            title: 'Clinic Bookings',
            value: vetAnalyticsData?.totalClinicBookings,
            avatarColor: '#4caf50',
            cardBackground: 'linear-gradient(to right, #67b26f, #4ca2cd)',
            subTitle: 'Bookings at Clinic'
          },
          {
            title: 'Home Bookings',
            value: vetAnalyticsData?.totalHomeBookings,
            avatarColor: '#ff5722',
            cardBackground: 'linear-gradient(to right, #ff6f61, #ff9671)',
            subTitle: 'Bookings at Home'
          },
          {
            title: 'Toal Retention',
            value: `${vetAnalyticsData?.retentionRate}%`,
            avatarColor: '#ff5722',
            cardBackground: 'linear-gradient(to right, #ff6f61, #ff9671)',
            subTitle: ''
          },
          {
            title: 'Top Booked Service',
            value: vetAnalyticsData?.topBookedServiceName,
            avatarColor: '#673ab7',
            cardBackground: 'linear-gradient(to right, #7b1fa2, #512da8)',
            subTitle: `Count: ${vetAnalyticsData?.topBookedServiceCount}`
          },
          {
            title: 'Revenue',
            value: vetAnalyticsData?.avgRevenuePerUser,
            avatarColor: '#673ab7',
            cardBackground: 'linear-gradient(to right, #7b1fa2, #512da8)',
            subTitle: `Average Revenue Per User`
          },
          {
            title: 'Growth Rate',
            value: vetAnalyticsData?.bookingGrowthRate,
            avatarColor: '#673ab7',
            cardBackground: 'linear-gradient(to right, #7b1fa2, #512da8)',
            subTitle: `Booking Growth Rate`
          },
          {
            title: 'Booking ',
            value: vetAnalyticsData?.bookingConversionRate,
            avatarColor: '#673ab7',
            cardBackground: 'linear-gradient(to right, #7b1fa2, #512da8)',
            subTitle: `Booking Convertion Rate`
          }
        ],
        chart: (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant='h6' fontWeight='bold'>
              Home vs Clinic Bookings
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <Card
                sx={{
                  borderRadius: '50%',
                  width: 300,
                  height: 300,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f9f9f9',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Box sx={{ width: '80%', height: '80%' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </Box>
              </Card>
            </Box>
          </Box>
        )
      })
    }
    if (matchData) {
      filteredSections.push({
        title: 'Match Section',
        data: [
          {
            title: 'Total Swipes',
            value: matchData.totalSwipes,
            avatarColor: '#2196f3',
            cardBackground: 'linear-gradient(to right, #36d1dc, #5b86e5)',
            subTitle: 'Swipes Overall'
          },
          {
            title: 'Left Swipes',
            value: matchData.leftSwipes,
            avatarColor: '#ff5722',
            cardBackground: 'linear-gradient(to right, #ff6f61, #ff9671)',
            subTitle: 'Swipes Left'
          },
          {
            title: 'Right Swipes',
            value: matchData.rightSwipes,
            avatarColor: '#4caf50',
            cardBackground: 'linear-gradient(to right, #67b26f, #4ca2cd)',
            subTitle: 'Swipes Right'
          },
          {
            title: 'Total Matches',
            value: matchData.totalMatches,
            avatarColor: '#673ab7',
            cardBackground: 'linear-gradient(to right, #7b1fa2, #512da8)',
            subTitle: 'Matches Found'
          },
          {
            title: 'Total Unmatches',
            value: matchData.totalUnMatches,
            avatarColor: '#009688',
            cardBackground: 'linear-gradient(to right, #00796b, #004d40)',
            subTitle: 'Unmatched Users'
          },
          {
            title: 'Avg Matches Per User',
            value: matchData.avgMatchesPerUser,
            avatarColor: '#ff9800',
            cardBackground: 'linear-gradient(to right, #ff9800, #ffc107)',
            subTitle: 'Average Matches Per User'
          }
        ]
      })
    }
    if (profileData) {
      filteredSections.push({
        title: 'Profile Section',
        data: [
          {
            title: 'Total Pets',
            value: profileData.totalPets,
            avatarColor: '#2196f3',
            cardBackground: 'linear-gradient(to right, #36d1dc, #5b86e5)',
            subTitle: 'All Registered Pets'
          },
          {
            title: 'Dogs',
            value: profileData.dogCount,
            avatarColor: '#4caf50',
            cardBackground: 'linear-gradient(to right, #67b26f, #4ca2cd)',
            subTitle: 'Total Dogs'
          },
          {
            title: 'Cats',
            value: profileData.catCount,
            avatarColor: '#ff5722',
            cardBackground: 'linear-gradient(to right, #ff6f61, #ff9671)',
            subTitle: 'Total Cats'
          },
          {
            title: 'New Enrollments',
            value: profileData.newEnrollments,
            avatarColor: '#673ab7',
            cardBackground: 'linear-gradient(to right, #7b1fa2, #512da8)',
            subTitle: 'Recent Pet Registrations'
          }
          // {
          //   title: 'Top Breeds',
          //   value: profileData.breeds
          //     .slice(0, 3)
          //     .map(breed => `${breed.name} (${breed.count})`)
          //     .join(', '),
          //   avatarColor: '#009688',
          //   cardBackground: 'linear-gradient(to right, #00796b, #004d40)',
          //   subTitle: 'Most Popular Breeds'
          // }
        ]
      })
      filteredSections.push({
        title: '',
        breedsChart: {
          labels: profileData.breeds.map(breed => breed.name),
          datasets: [
            {
              label: 'Breed Count',
              data: profileData.breeds.map(breed => breed.count),
              backgroundColor: '#4caf50'
            }
          ]
        }
      })
    }

    setSections(filteredSections)
  }

  // Trigger filters reapply when vetAnalyticsData changes
  useEffect(() => {
    if (vetAnalyticsData || matchData || profileData) {
      applyFilters()
    }
  }, [vetAnalyticsData, matchData, profileData])

  useEffect(() => {
    fetchVetData()
    fetchMatchData()
    fetchProfileData()
  }, [])

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchVetData()
      fetchMatchData()
      fetchProfileData()
    }
  }, [filters.startDate, filters.endDate])

  return (
    <Box p={4} bgcolor='#f4f6f8'>
      {sections?.map((section, sectionIndex) => (
        <Box key={sectionIndex} mb={6}>
          {/* Section Header */}
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
            <Typography variant='h5' fontWeight='bold'>
              {section.title}
            </Typography>
            <Box display='flex' gap={1}>
              <IconButton
                onClick={() => setExpandedFilter(prev => (prev === sectionIndex ? null : sectionIndex))}
                sx={{
                  background: expandedFilter === sectionIndex ? '#d32f2f' : '#1976d2',
                  color: '#fff',
                  '&:hover': {
                    background: expandedFilter === sectionIndex ? '#c62828' : '#1565c0'
                  }
                }}
              >
                {expandedFilter === sectionIndex ? <Close /> : <FilterList />}
              </IconButton>
              <IconButton
                onClick={() => setExpandedSection(prev => (prev === sectionIndex ? null : sectionIndex))}
                sx={{
                  background: expandedSection === sectionIndex ? '#d32f2f' : '#1976d2',
                  color: '#fff',
                  '&:hover': {
                    background: expandedSection === sectionIndex ? '#c62828' : '#1565c0'
                  }
                }}
              >
                {expandedSection === sectionIndex ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          {/* Filters */}
          <Collapse in={expandedFilter === sectionIndex} timeout='auto' unmountOnExit>
            <Box
              display='flex'
              flexWrap='wrap'
              gap={2}
              p={2}
              mb={3}
              bgcolor='#ffffff'
              borderRadius={2}
              boxShadow='0 2px 10px rgba(0,0,0,0.1)'
            >
              <TextField
                label='Start Date'
                type='date'
                InputLabelProps={{ shrink: true }}
                size='small'
                value={filters?.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                label='End Date'
                type='date'
                InputLabelProps={{ shrink: true }}
                size='small'
                value={filters?.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                sx={{ flex: '1 1 200px' }}
              />
              <TextField
                label='Type'
                select
                size='small'
                value={filters.serviceType}
                onChange={e => setFilters({ ...filters, serviceType: e.target.value })}
                sx={{ flex: '1 1 200px' }}
              >
                <MenuItem value='all'>All</MenuItem>
                <MenuItem value='consultation'>Consultation</MenuItem>
                <MenuItem value='surgery'>Surgery</MenuItem>
              </TextField>
              <Button variant='contained' color='primary' size='small' onClick={applyFilters} sx={{ flex: '0 1 auto' }}>
                Apply
              </Button>
            </Box>
          </Collapse>

          {/* Cards Section */}
          {expandedSection === sectionIndex ? (
            <Box display='flex' flexWrap='wrap' gap={2}>
              {section?.data?.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    width: '30%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    background: item.cardBackground,
                    color: '#fff',
                    borderRadius: 4,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: item.avatarColor,
                        width: 56,
                        height: 56,
                        margin: '0 auto'
                      }}
                    >
                      <Dashboard fontSize='large' />
                    </Avatar>
                    <Typography variant='h6' fontWeight='bold' mt={2}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant='h4'
                      fontWeight='bold'
                      mt={1}
                      sx={{ color: '#fff', textShadow: '0px 2px 4px rgba(0,0,0,0.3)' }}
                    >
                      {item.value}
                    </Typography>
                    <Typography variant='body2' mt={1} sx={{ color: '#f0f0f0' }}>
                      {item.subTitle}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Slider {...carouselSettings}>
              {section?.data?.map((item, index) => (
                <Box key={index} p={2}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'transform 0.3s',
                      background: item.cardBackground,
                      color: '#fff',
                      borderRadius: 4,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <CardContent>
                      <Avatar
                        sx={{
                          bgcolor: item.avatarColor,
                          width: 56,
                          height: 56,
                          margin: '0 auto'
                        }}
                      >
                        <Dashboard fontSize='large' />
                      </Avatar>
                      <Typography variant='h6' fontWeight='bold' mt={2}>
                        {item.title}
                      </Typography>
                      <Typography
                        variant='h4'
                        fontWeight='bold'
                        mt={1}
                        sx={{ color: '#fff', textShadow: '0px 2px 4px rgba(0,0,0,0.3)' }}
                      >
                        {item.value}
                      </Typography>
                      <Typography variant='body2' mt={1} sx={{ color: '#f0f0f0' }}>
                        {item.subTitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Slider>
          )}
          {/* {section.breedsChart && (
            <Box mt={4} p={2} bgcolor='#fff' borderRadius={4} boxShadow='0 2px 10px rgba(0,0,0,0.1)'>
              <Typography variant='h6' fontWeight='bold' mb={2}>
                Breed Distribution
              </Typography>
              <Bar
                data={section.breedsChart}
                options={{
                  indexAxis: 'y',
                  scales: {
                    x: { beginAtZero: true }
                  },
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </Box>
          )} */}
        </Box>
      ))}
      {/* <Box mb={6}>
        <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
          <Typography variant='h5' fontWeight='bold'>
            Age Group Distribution
          </Typography>
          <IconButton
            onClick={() => setExpandedSection(prev => (prev === 'ageGroups' ? null : 'ageGroups'))}
            sx={{
              background: expandedSection === 'ageGroups' ? '#d32f2f' : '#1976d2',
              color: '#fff',
              '&:hover': {
                background: expandedSection === 'ageGroups' ? '#c62828' : '#1565c0'
              }
            }}
          >
            {expandedSection === 'ageGroups' ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={expandedSection === 'ageGroups'} timeout='auto' unmountOnExit>
          <Box p={2} bgcolor='#fff' borderRadius={2} boxShadow='0 2px 10px rgba(0,0,0,0.1)'>
            <Bar
              data={ageGroupChartData}
              options={{
                indexAxis: 'y',
                scales: {
                  x: { beginAtZero: true }
                },
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </Box>
        </Collapse>
      </Box> */}

      {/* <Box mb={6}>
        <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
          <Typography variant='h5' fontWeight='bold'>
            Diseases Distribution
          </Typography>
          <IconButton
            onClick={() => setExpandedSection(prev => (prev === 'diseases' ? null : 'diseases'))}
            sx={{
              background: expandedSection === 'diseases' ? '#d32f2f' : '#1976d2',
              color: '#fff',
              '&:hover': {
                background: expandedSection === 'diseases' ? '#c62828' : '#1565c0'
              }
            }}
          >
            {expandedSection === 'diseases' ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={expandedSection === 'diseases'} timeout='auto' unmountOnExit>
          <Box p={2} bgcolor='#fff' borderRadius={4} boxShadow='0 2px 10px rgba(0,0,0,0.1)'>
            <Bar
              data={diseaseChartData}
              options={{
                indexAxis: 'y',
                scales: {
                  x: { beginAtZero: true }
                },
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </Box>
        </Collapse>
      </Box> */}
      <Box mb={6}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h5' fontWeight='bold'>
            Key Statistics
          </Typography>
        </Box>
        <Box
          display='flex'
          flexWrap='wrap'
          gap={4}
          p={2}
          bgcolor='#f4f6f8'
          borderRadius={4}
          boxShadow='0 2px 10px rgba(0,0,0,0.1)'
        >
          {/* Breed Distribution */}
          <Box flex='1 1 300px' p={2} bgcolor='#fff' borderRadius={4} boxShadow='0 2px 10px rgba(0,0,0,0.1)'>
            <Typography variant='h6' fontWeight='bold' mb={2}>
              Breed Distribution
            </Typography>
            <Bar
              data={{
                labels: profileData?.breeds.map(breed => breed.name) || [],
                datasets: [
                  {
                    label: 'Breed Count',
                    data: profileData?.breeds.map(breed => breed.count) || [],
                    backgroundColor: '#4caf50'
                  }
                ]
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: { beginAtZero: true }
                },
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </Box>

          {/* Age Group Distribution */}
          <Box flex='1 1 300px' p={2} bgcolor='#fff' borderRadius={4} boxShadow='0 2px 10px rgba(0,0,0,0.1)'>
            <Typography variant='h6' fontWeight='bold' mb={2}>
              Age Group Distribution
            </Typography>
            <Bar
              data={{
                labels: Object.keys(profileData?.ageGroups || {}),
                datasets: [
                  {
                    label: 'Age Group Count',
                    data: Object.values(profileData?.ageGroups || {}),
                    backgroundColor: '#2196f3'
                  }
                ]
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: { beginAtZero: true }
                },
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </Box>

          {/* Disease Distribution */}
          <Box flex='1 1 300px' p={2} bgcolor='#fff' borderRadius={4} boxShadow='0 2px 10px rgba(0,0,0,0.1)'>
            <Typography variant='h6' fontWeight='bold' mb={2}>
              Disease Distribution
            </Typography>
            <Bar
              data={{
                labels: profileData?.diseases.map(disease => disease.name) || [],
                datasets: [
                  {
                    label: 'Disease Count',
                    data: profileData?.diseases.map(disease => disease.count) || [],
                    backgroundColor: '#ff5722'
                  }
                ]
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: { beginAtZero: true }
                },
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}
      >
        {doughnutData ? (
          <Card
            sx={{
              borderRadius: '50%',
              width: '300px',
              height: '300px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f9f9f9',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box sx={{ width: '80%', height: '80%' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </Box>
          </Card>
        ) : (
          <Typography variant='h6' color='textSecondary'>
            No data available for the chart
          </Typography>
        )}
      </Box>
    </Box>
  )
}

const ProtectedChatPage = () => {
  return (
    <ProtectedRoutes requiredPermission='Dashboard'>
      <UserListCards />
    </ProtectedRoutes>
  )
}

export default ProtectedChatPage
