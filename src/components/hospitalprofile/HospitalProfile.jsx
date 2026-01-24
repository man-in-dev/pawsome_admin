import React, { useState, useEffect } from 'react'

import axios from 'axios'

import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import {
  Typography,
  TextField,
  Button,
  Slider,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Popper
} from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

import Autocomplete from '@mui/material/Autocomplete'

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

import {
  getAllVets,
  getAllHospital,
  deleteClinic,
  createHospital,
  editHospital,
  uploadImage,
  getAllMatches
} from '@/app/api'

import CustomDatePicker from '../../utils/DatePicker'

const HospitalProfileForm = ({ fetchHospital, fetchvets, vetsList, onSubmit, initialData, onClose = {} }) => {
  const [mediaUrls, setMediaUrls] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')

  const [hospitalData, setHospitalData] = useState({
    id: '',
    name: '',
    speciality: '',
    address: '',
    images: mediaUrls ? mediaUrls : '',
    coordinates: [],
    timing: '',
    rating: 3,
    fees: 0,
    vetIds: [],
    silverFees: '',
    goldFees: '',
    regularFees: '',

    ...initialData
  })

  const [errors, setErrors] = useState({
    name: '',
    speciality: '',
    address: '',
    timing: '',
    fees: '',
    silverFees: '',
    goldFees: '',
    regularFees: '',
    images: '',
    coordinates: '',
    vetIds: ''
  })

  const timeStringToDate = timeString => {
    const [time, period] = timeString.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(period === 'PM' ? hours + 12 : hours, minutes, 0, 0)
    return date
  }

  // useEffect(() => {
  //   if (initialData.timing) {
  //     const [from, to] = initialData?.timing?.split(' - ')
  //     const fromTimeComponents = parseTime(from || '')
  //     const toTimeComponents = parseTime(to || '')

  //     console.log('From Time:', fromTimeComponents) // { hours: '3', minutes: '09', period: 'AM' }
  //     console.log('To Time:', toTimeComponents) // { hours: '7', minutes: '12', period: 'AM' }

  //     setFromTime(from || '')
  //     setToTime(to || '')
  //   }
  // }, [initialData])

  useEffect(() => {
    if (initialData.timing) {
      const [from, to] = initialData?.timing?.split(' - ')
      setFromTime(from ? timeStringToDate(from) : '')
      setToTime(to ? timeStringToDate(to) : '')
    }
  }, [initialData])

  useEffect(() => {
    if (initialData) {
      setHospitalData(prevData => ({
        ...prevData,
        ...initialData,
        images: initialData.images || []
      }))

      // if (initialData?.timing) {
      //   const [from, to] = initialData.timing.split(' - ')
      //   setFromTime(from || '')
      //   setToTime(to || '')
      // }

      setMediaUrls(initialData.images || [])
    }
  }, [initialData])

  useEffect(() => {
    if (initialData?.Vets) {
      setHospitalData(prevData => ({
        ...prevData,
        vetIds: initialData.Vets.map(vet => vet.id)
      }))
    }
  }, [initialData])

  const handleImageUpload = async e => {
    const files = Array.from(e.target.files)
    const imageUrls = []

    for (let file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await uploadImage(formData)
        if (response) {
          const imageUrl = response?.data?.data.fileUrl
          imageUrls.push(imageUrl)
        } else {
          toast.error('Failed to upload image')
        }
      } catch (error) {
        toast.error('Error uploading image')
      }
    }
    setMediaUrls(prevUrls => [...prevUrls, ...imageUrls])
  }

  const handleRemoveImage = index => {
    setMediaUrls(prevUrls => prevUrls.filter((_, i) => i !== index))
    if (index === currentImageIndex && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prevIndex => (prevIndex + 1) % mediaUrls.length)
  }

  const handlePreviousImage = () => {
    setCurrentImageIndex(prevIndex => (prevIndex - 1 + mediaUrls.length) % mediaUrls.length)
  }

  const handleInputChange = async e => {
    const { name, value } = e.target
    setHospitalData(prevData => ({ ...prevData, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))

    if (name === 'address') {
      const coordinates = await fetchCoordinates(value)
      if (coordinates) {
        setHospitalData(prevData => ({ ...prevData, coordinates }))
      }
    }
  }

  const fetchCoordinates = async address => {
    try {
      const apiKey = 'AIzaSyC1jYctLwdiesL_sAaQh8QGTkXPi7-S03M'
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: address,
          key: apiKey
        }
      })
      const location = response?.data?.results[0]?.geometry?.location
      return [location?.lat, location?.lng]
    } catch (error) {
      toast.error('Error fetching coordinates')
      return null
    }
  }

  const handleVetSelection = event => {
    const { value } = event.target
    setHospitalData(prevData => ({
      ...prevData,
      vetIds: value
    }))
  }

  const handleCoordinatesChange = (index, value) => {
    const newCoordinates = [...hospitalData.coordinates]
    newCoordinates[index] = parseFloat(value)
    setHospitalData(prevData => ({ ...prevData, coordinates: newCoordinates }))
  }
  const formatTime = date => {
    if (!date) return ''
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? 'PM' : 'AM'
    // Convert to 12-hour format and handle midnight (0 becomes 12)
    hours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${hours}:${formattedMinutes} ${period}`
  }

  const validate = () => {
    const tempErrors = {}
    if (!hospitalData.name.trim()) tempErrors.name = 'Hospital Name is required'
    if (!hospitalData.speciality.trim()) tempErrors.speciality = 'Speciality is required'
    if (!hospitalData.address.trim()) tempErrors.address = 'Address is required'
    if (!initialData?.id && (!fromTime || !toTime)) {
      tempErrors.timing = 'Both opening and closing times are required'
    } else if (fromTime >= toTime) {
      tempErrors.timing = 'Opening time must be before closing time'
    }
    if ( !initialData?.id && !mediaUrls.length) tempErrors.images = 'At least one image is required'
    if (hospitalData.coordinates.length !== 2 || hospitalData.coordinates.some(c => isNaN(c)))
      tempErrors.coordinates = 'Valid latitude and longitude are required'
    if (hospitalData.fees === '' || isNaN(hospitalData.fees) || Number(hospitalData.fees) < 0)
      tempErrors.fees = 'Valid consultation fees are required'
    if (hospitalData.silverFees === '' || isNaN(hospitalData.silverFees) || Number(hospitalData.silverFees) < 0)
      tempErrors.silverFees = 'Valid silver fees are required'
    if (hospitalData.goldFees === '' || isNaN(hospitalData.goldFees) || Number(hospitalData.goldFees) < 0)
      tempErrors.goldFees = 'Valid gold fees are required'
    if (hospitalData.regularFees === '' || isNaN(hospitalData.regularFees) || Number(hospitalData.regularFees) < 0)
      tempErrors.regularFees = 'Valid regular fees are required'
    if (!initialData?.id && (!hospitalData.vetIds || hospitalData.vetIds.length === 0))
      tempErrors.vetIds = 'At least one vet must be assigned'

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  console.log('errors', errors)


  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill all fields before submitting')
      return
    }

    try {
      const payload = {
        name: hospitalData.name?.trim(),
        speciality: hospitalData.speciality,
        // timing: hospitalData.timing ? String(hospitalData.timing) : '',
        timing: `${formatTime(fromTime)} - ${formatTime(toTime)}`,
        images: mediaUrls,
        coordinates: hospitalData.coordinates.length === 2 ? hospitalData.coordinates : [],
        address: hospitalData.address?.trim(),
        goldFees: hospitalData.goldFees !== '' ? Number(hospitalData.goldFees) : 0,
        silverFees: hospitalData.silverFees !== '' ? Number(hospitalData.silverFees) : 0,
        regularFees: hospitalData.regularFees !== '' ? Number(hospitalData.regularFees) : 0,
        fees: hospitalData.fees !== '' ? Number(hospitalData.fees) : 0,
        ...(initialData?.id && { vetIds: hospitalData.vetIds })
      }

      if (
        !payload.name ||
        !payload.timing ||
        !payload.images.length ||
        !payload.coordinates.length ||
        !payload.address ||
        isNaN(payload.fees) ||
        isNaN(payload.silverFees) ||
        isNaN(payload.goldFees) ||
        isNaN(payload.regularFees)
      ) {
        throw new Error('All required fields must be filled and valid')
      }

      if (initialData?.id) {
        const response = await editHospital(initialData.id, payload)
        if (response.status === 200) {
          // await getAllHospital()
          await fetchHospital
          // await getAllVets()
          toast.success('Hospital edited successfully', {
            autoClose: 9000
          })
        }
      } else {
        const response = await createHospital(payload)
        if (response.status === 200) {
          await fetchHospital
          // fetchvets()
          toast.success('Hospital created successfully', {
            autoClose: 9000
          })
        }
      }

      onSubmit(hospitalData)
      onClose()
    } catch (error) {
      toast.error('Error saving hospital: ' + error.message)
    }
  }

  const handleTimeChange = (field, time) => {
    console.log('tt', time)
    const timmings = {
      fromTime: time,
      toTime: time
    }
    setHospitalData(prevData => {
      const updatedData = { ...prevData, [field]: timmings }

      return updatedData
    })
  }

  return (
    <form>
      <ToastContainer />
      <TextField
        name='name'
        label='Hospital Name'
        value={hospitalData.name}
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        name='speciality'
        label='Speciality'
        value={hospitalData.speciality}
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        error={!!errors.speciality}
        helperText={errors.speciality}
      />
      <TextField
        name='address'
        label='Address'
        fullWidth
        margin='normal'
        multiline
        rows={3}
        onChange={handleInputChange}
        value={hospitalData.address}
      />
      {/* Opening & Closing Times */}
      <Typography variant='h6' gutterBottom>
        Opening and Closing Time
      </Typography>
      <Box display='flex' flexDirection={{ xs: 'column', sm: 'column' }} gap={4} marginBottom={2}>
        <CustomDatePicker
          placeholderText='From Time'
          value={fromTime}
          onChange={time => setFromTime(time)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          timeCaption='Time'
          dateFormat='h:mm aa'
        />
        <CustomDatePicker
          placeholderText='To Time'
          value={toTime}
          onChange={time => setToTime(time)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          timeCaption='Time'
          dateFormat='h:mm aa'
        />
      </Box>

      <TextField
        type='number'
        name='fees'
        label='Consultation Fees'
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        value={hospitalData.fees || ''}
        error={!!errors.fees}
        helperText={errors.fees}
      />
      <TextField
        type='number'
        name='silverFees'
        label='Silver Fees'
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        value={hospitalData.silverFees || ''}
        error={!!errors.silverFees}
        helperText={errors.silverFees}
      />
      <TextField
        type='number'
        name='goldFees'
        label='Gold Fees'
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        value={hospitalData.goldFees || ''}
        error={!!errors.goldFees}
        helperText={errors.goldFees}
      />
      <TextField
        type='regularFees'
        name='regularFees'
        label='Regular Fees'
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        value={hospitalData.regularFees || ''}
        error={!!errors.regularFees}
        helperText={errors.regularFees}
      />

      <Box display='flex' gap={2} marginBottom={2}>
        <TextField
          type='number'
          name='latitude'
          label='Latitude'
          fullWidth
          margin='normal'
          value={hospitalData.coordinates[0] || ''}
          onChange={e => handleCoordinatesChange(0, e.target.value)}
        />
        <TextField
          type='number'
          name='longitude'
          label='Longitude'
          fullWidth
          margin='normal'
          value={hospitalData.coordinates[1] || ''}
          onChange={e => handleCoordinatesChange(1, e.target.value)}
        />
      </Box>
      <Box display='flex' flexDirection='column' gap={1} marginTop={2}>
        {initialData.id && (
          <>
            <Typography variant='h6'>Assign Vets</Typography>
            <FormControl fullWidth margin='normal'>
              <Autocomplete
                multiple
                id='assign-vets'
                options={vetsList || []}
                getOptionLabel={option => option.name}
                // Map the selected vet IDs into vet objects; if none found, fallback to empty object.
                value={vetsList?.filter(vet => hospitalData?.vetIds?.includes(vet.id))}
                onChange={(event, newValue) => {
                  // Update your state with the vet IDs from newValue
                  setHospitalData(prev => ({ ...prev, vetIds: newValue.map(v => v.id) }))
                }}
                renderInput={params => <TextField {...params} placeholder='Search vets' />}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={option.profilePicture} alt={option.name} sx={{ width: 24, height: 24, mr: 1 }}>
                        {option.name.charAt(0)}
                      </Avatar>
                      {option.name}
                    </Box>
                  </li>
                )}
              />
            </FormControl>
          </>
        )}
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={hospitalData.status}
            onChange={e => setHospitalData({ ...hospitalData, status: e.target.checked })}
          />
        }
        label='Status'
      />

      <Box display='flex' flexWrap='wrap' gap={2} marginTop={2} sx={{ overflow: 'auto', maxHeight: '150px' }}>
        {mediaUrls.map((url, index) => (
          <Box key={index} position='relative'>
            <img src={url} alt={`Uploaded ${index}`} width='100' />
            <IconButton
              onClick={() => handleRemoveImage(index)}
              sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>

      {mediaUrls.length > 1 && (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            mb: 2,
            height: 300
          }}
        >
          <IconButton
            sx={{
              position: 'absolute',
              left: 8,
              backgroundColor: 'rgba(255,255,255,0.7)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
            }}
            onClick={handlePreviousImage}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <img
            src={mediaUrls[currentImageIndex]}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            alt={`Image ${currentImageIndex + 1}`}
            width='300'
          />
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.7)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
            }}
            onClick={handleNextImage}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}
      <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center' mt={3}>
        <Button variant='contained' component='label' sx={{ marginTop: 2 }}>
          Upload Images
          <input type='file' multiple hidden onChange={handleImageUpload} />
        </Button>
        <Button variant='contained' color='secondary' sx={{ marginTop: 2 }} onClick={handleSubmit}>
          Save Hospital
        </Button>
      </Box>
    </form>
  )
}

export default HospitalProfileForm
