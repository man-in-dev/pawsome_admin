import React, { useState, useEffect } from 'react'

import axios from 'axios'

import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import {
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
  FormControlLabel,
  Switch
} from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

import {
  createGroomingStore,
  editGroomingStore,
  uploadImage
} from '@/app/api'

import CustomDatePicker from '../../utils/DatePicker'

const GroomingStoreProfileForm = ({ fetchStore, onSubmit, initialData, onClose = {} }) => {
  const [mediaUrls, setMediaUrls] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')

  const [storeData, setStoreData] = useState({
    id: '',
    name: '',
    speciality: '',
    address: '',
    images: mediaUrls ? mediaUrls : '',
    coordinates: [],
    timing: '',
    rating: 3,
    fees: 0,
    silverFees: '',
    goldFees: '',
    regularFees: '',
    status: true,
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
    coordinates: ''
  })

  const timeStringToDate = timeString => {
    const [time, period] = timeString.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(period === 'PM' ? hours + 12 : hours, minutes, 0, 0)
    return date
  }

  useEffect(() => {
    if (initialData.timing) {
      const [from, to] = initialData?.timing?.split(' - ')
      setFromTime(from ? timeStringToDate(from) : '')
      setToTime(to ? timeStringToDate(to) : '')
    }
  }, [initialData])

  useEffect(() => {
    if (initialData) {
      setStoreData(prevData => ({
        ...prevData,
        ...initialData,
        images: initialData.images || []
      }))
      setMediaUrls(initialData.images || [])
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
    setStoreData(prevData => ({ ...prevData, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))

    if (name === 'address') {
      const coordinates = await fetchCoordinates(value)
      if (coordinates) {
        setStoreData(prevData => ({ ...prevData, coordinates }))
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

  const handleCoordinatesChange = (index, value) => {
    const newCoordinates = [...storeData.coordinates]
    newCoordinates[index] = parseFloat(value)
    setStoreData(prevData => ({ ...prevData, coordinates: newCoordinates }))
  }
  
  const formatTime = date => {
    if (!date) return ''
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    return `${hours}:${formattedMinutes} ${period}`
  }

  const validate = () => {
    const tempErrors = {}
    if (!storeData.name.trim()) tempErrors.name = 'Store Name is required'
    if (!storeData.speciality.trim()) tempErrors.speciality = 'Speciality is required'
    if (!storeData.address.trim()) tempErrors.address = 'Address is required'
    if (!initialData?.id && (!fromTime || !toTime)) {
      tempErrors.timing = 'Both opening and closing times are required'
    } else if (fromTime >= toTime) {
      tempErrors.timing = 'Opening time must be before closing time'
    }
    if (!initialData?.id && !mediaUrls.length) tempErrors.images = 'At least one image is required'
    if (storeData.coordinates.length !== 2 || storeData.coordinates.some(c => isNaN(c)))
      tempErrors.coordinates = 'Valid latitude and longitude are required'
    if (storeData.fees === '' || isNaN(storeData.fees) || Number(storeData.fees) < 0)
      tempErrors.fees = 'Valid consultation fees are required'
    if (storeData.silverFees === '' || isNaN(storeData.silverFees) || Number(storeData.silverFees) < 0)
      tempErrors.silverFees = 'Valid silver fees are required'
    if (storeData.goldFees === '' || isNaN(storeData.goldFees) || Number(storeData.goldFees) < 0)
      tempErrors.goldFees = 'Valid gold fees are required'
    if (storeData.regularFees === '' || isNaN(storeData.regularFees) || Number(storeData.regularFees) < 0)
      tempErrors.regularFees = 'Valid regular fees are required'

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill all fields before submitting')
      return
    }

    try {
      const payload = {
        name: storeData.name?.trim(),
        speciality: storeData.speciality,
        timing: `${formatTime(fromTime)} - ${formatTime(toTime)}`,
        images: mediaUrls,
        coordinates: storeData.coordinates.length === 2 ? storeData.coordinates : [],
        address: storeData.address?.trim(),
        goldFees: storeData.goldFees !== '' ? Number(storeData.goldFees) : 0,
        silverFees: storeData.silverFees !== '' ? Number(storeData.silverFees) : 0,
        regularFees: storeData.regularFees !== '' ? Number(storeData.regularFees) : 0,
        fees: storeData.fees !== '' ? Number(storeData.fees) : 0,
        status: storeData.status
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
        const response = await editGroomingStore(initialData.id, payload)
        if (response.status === 200) {
          await fetchStore()
          toast.success('Grooming store edited successfully', {
            autoClose: 9000
          })
        }
      } else {
        const response = await createGroomingStore(payload)
        if (response.status === 200) {
          await fetchStore()
          toast.success('Grooming store created successfully', {
            autoClose: 9000
          })
        }
      }

      onSubmit(storeData)
      onClose()
    } catch (error) {
      toast.error('Error saving grooming store: ' + error.message)
    }
  }

  return (
    <form>
      <ToastContainer />
      <TextField
        name='name'
        label='Store Name'
        value={storeData.name}
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        name='speciality'
        label='Speciality'
        value={storeData.speciality}
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
        value={storeData.address}
        error={!!errors.address}
        helperText={errors.address}
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
      {errors.timing && (
        <Typography variant='caption' color='error' sx={{ ml: 2 }}>
          {errors.timing}
        </Typography>
      )}

      <TextField
        type='number'
        name='fees'
        label='Consultation Fees'
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        value={storeData.fees || ''}
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
        value={storeData.silverFees || ''}
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
        value={storeData.goldFees || ''}
        error={!!errors.goldFees}
        helperText={errors.goldFees}
      />
      <TextField
        type='number'
        name='regularFees'
        label='Regular Fees'
        fullWidth
        margin='normal'
        onChange={handleInputChange}
        value={storeData.regularFees || ''}
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
          value={storeData.coordinates[0] || ''}
          onChange={e => handleCoordinatesChange(0, e.target.value)}
          error={!!errors.coordinates}
        />
        <TextField
          type='number'
          name='longitude'
          label='Longitude'
          fullWidth
          margin='normal'
          value={storeData.coordinates[1] || ''}
          onChange={e => handleCoordinatesChange(1, e.target.value)}
          error={!!errors.coordinates}
        />
      </Box>
      {errors.coordinates && (
        <Typography variant='caption' color='error' sx={{ ml: 2, mb: 2 }}>
          {errors.coordinates}
        </Typography>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={storeData.status}
            onChange={e => setStoreData({ ...storeData, status: e.target.checked })}
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
          Save Store
        </Button>
      </Box>
    </form>
  )
}

export default GroomingStoreProfileForm
