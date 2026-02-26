'use client'

import React, { useState, useEffect, useCallback } from 'react'

import DatePicker from 'react-datepicker'
import Cropper from 'react-easy-crop'

import 'react-datepicker/dist/react-datepicker.css'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Modal,
  Box,
  TextField,
  Paper,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  TablePagination,
  CardHeader,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Tooltip,
  Autocomplete
} from '@mui/material'

import { Person2 } from '@mui/icons-material'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

import { getCroppedImg } from '../../../utils/cropImage.js'

import { getAllVets, createVet, editVet, getAllHospital, uploadImage, deleteVet } from '@/app/api'

const VetManagementPage = () => {
  const [vets, setVets] = useState([])
  const [hospitalLists, setHospitalLists] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedVet, setSelectedVet] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vetToDelete, setVetToDelete] = useState(null)
  const [mediaUrl, setMediaUrl] = useState(null)
  const [selectedSlots, setSelectedSlots] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDates, setSelectedDates] = useState([])
  
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [page, setPage] = useState(0)
  const [userRole, setUserRole] = useState('')

  const [imageSrc, setImageSrc] = useState(null) // Source image for cropping
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedImage, setCroppedImage] = useState(null)
  const [rotation, setRotation] = useState(0)

  const [newVet, setNewVet] = useState({
    name: '',
    specialization: '',
    profilePicture: '',
    bio: '',
    slots: [],
    clinicId: [],
    experience: '',
    consultantFee: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    registrationNo: '',
    phone: '',
    degree: '',
    noOfConsultations: 0,
    category: ''
  })
  const [errors, setErrors] = useState({
    name: '',
    specialization: '',
    bio: '',
    slots: [],
    clinicId: [],
    experience: '',
    consultantFee: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    registrationNo: '',
    phone: '',
    degree: '',
    category: ''
  })

  // ================ CROPPER LOGIC ================
  // Called whenever the crop changes
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
    // setImageSrc(croppedArea)
  }

  // Generate a cropped image and upload it
  const handleCropDone = async () => {
    console.log('url', imageSrc)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)

      // Now that we have the cropped image blob, we can upload it
      console.log('url1', imageSrc)
      await uploadCroppedImage(croppedBlob)
      console.log('url2', imageSrc)
      setCroppedImage(croppedBlob)
      setShowCropModal(false)
      setImageSrc(null)
    } catch (error) {
      console.error(error)
      toast.error('Failed to crop image')
    }
  }

  const uploadCroppedImage = async blob => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', blob, 'cropped.jpeg')

      const response = await uploadImage(formData)
      if (response) {
        const imageUrl = response?.data?.data.fileUrl
        setMediaUrl(imageUrl)
      } else {
        toast.error('Failed to upload image')
      }
    } catch (err) {
      toast.error('Error uploading cropped image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = e => {
    const file = e.target.files[0]
    if (!file) return

    // Convert file to a local URL so Cropper can display it
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageSrc(reader.result)
      setShowCropModal(true) // open the crop modal
    })
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const userRole = localStorage.getItem('user')
    if (userRole) {
      const parsedData = JSON.parse(userRole)
      setUserRole(parsedData.role)
    } else {
      setUserRole('')
    }
  }, [])

  const formatTimeTo12Hour = time24 => {
    const [hour, minute] = time24.split(':')
    let hourInt = parseInt(hour)
    const amPm = hourInt >= 12 ? 'PM' : 'AM'
    hourInt = hourInt % 12 || 12
    return `${hourInt.toString().padStart(2, '0')}:${minute} ${amPm}`
  }

  // Generate time slots from 9:00 AM to 8:00 PM with leading zero
  // const timeSlots = Array.from({ length: 12 }, (_, i) => {
  //   const hour = i + 9
  //   return `${hour.toString().padStart(2, '0')}:00`
  // })
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour24 = i + 9
    const hour12 = hour24 % 12 || 12
    const period = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12.toString().padStart(2, '0')}:00 ${period}`
  })

  const fetchVets = async () => {
    try {
      const response = await getAllVets()
      setVets(response.data.data || [])
    } catch (error) {
      toast.error('Error fetching vets')
      setVets([])
    }
  }

  const fetchAllHospitals = async () => {
    try {
      const response = await getAllHospital()
      if (response.status === 200) {
        setHospitalLists(response?.data?.data)
      }
    } catch (error) {
      toast.error('Error fetching hospitals')
      setHospitalLists([])
    }
  }

  useEffect(() => {
    fetchVets()
    fetchAllHospitals()
  }, [])

  const handleInputChange = e => {
    const { name, value } = e.target
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
    setNewVet(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }
  // name: '',
  // specialization: '',
  // profilePicture: '',
  // bio: '',
  // slots: [],
  // clinicId: [],
  // experience: '' // New field for experience

  const validate = () => {
    const tempError = {}
    if (!newVet?.name) {
      tempError.name = 'Name is required'
    } else if (newVet?.name.length > 10) {
      tempError.name = 'Name must  be less than 10'
    }
    if (!newVet?.specialization) {
      tempError.specialization = 'Specialization is required'
    }
    if (!newVet?.bio) {
      tempError.bio = 'Bio is required'
    }
    if (!newVet?.experience) {
      tempError.experience = 'Experience is required'
    }
    setErrors(tempError)
    return Object.keys(tempError).length === 0
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await uploadImage(formData)
        if (response) {
          const imageUrl = response?.data?.data.fileUrl
          setImageSrc(imageUrl)
          setShowCropModal(true) // open the crop modal
          setMediaUrl(imageUrl)
          setIsUploading(false)
        } else {
          toast.error('Failed to upload image')
        }
      } catch (error) {
        toast.error('Error uploading image')
      }
    }
  }

  const handleSlotChange = slot => {
    console.log('ss', slot)
    console.log('ss', selectedSlots)
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot)) // Deselect slot
    } else {
      setSelectedSlots([...selectedSlots, slot]) // Select slot
    }
  }

  const handleCreateVet = async e => {
    e.preventDefault()

    // Convert selected slots to 12-hour format
    const formattedSlots = selectedSlots.map(slot => formatTimeTo12Hour(slot))
    const formattedDates = selectedDates.map(date => date.toISOString())
    if (!validate()) {
      toast.error('Please fill all fields before submitting')
      return
    }

    const vetData = {
      name: newVet.name,
      specialization: newVet.specialization,
      profilePicture: mediaUrl ? mediaUrl : newVet.profilePicture,
      bio: newVet.bio,
      slots: selectedSlots,
      experience: newVet.experience,
      address: newVet.address,
      city: newVet.city,
      consultantFee: newVet.consultantFee,
      state: newVet.state,
      pinCode: newVet.pinCode,
      registrationNo: newVet.registrationNo,
      phone: newVet.phone,
      degree: newVet.degree,
      noOfConsultations: newVet.noOfConsultations, // Initialize to 0
      // availableDates: formattedDates
      category: newVet.category
    }

    try {
      const response = await createVet(vetData)
      if (response.status === 201) {
        fetchVets()
        toast.success('Vet created successfully')
      }
    } catch (error) {
      toast.error('Failed to create vet')
    }

    setModalOpen(false)
    setNewVet({
      name: '',
      specialization: '',
      profilePicture: '',
      bio: '',
      clinicId: [],
      experience: '',
      address: '',
      consultantFee: '',
      city: '',
      state: '',
      pinCode: '',
      registrationNo: '',
      phone: '',
      degree: '',
      noOfConsultations: 0,
      category: ''
    }) // Reset experience too
    setSelectedSlots([]) // Reset time slots
  }
  const handleDateChange = date => {
    setSelectedDates(prevDates => [...prevDates, date]) // Add the selected date to the array
  }

  const handleUpdateVet = async e => {
    e.preventDefault()

    const vetData = {
      name: newVet.name,
      specialization: newVet.specialization,
      profilePicture: newVet.profilePicture || mediaUrl,
      bio: newVet.bio,
      slots: selectedSlots,
      clinicId: newVet.clinicId,
      experience: newVet.experience,
      address: newVet.address,
      city: newVet.city,
      consultantFee: newVet.consultantFee,
      state: newVet.state,
      pinCode: newVet.pinCode,
      registrationNo: newVet.registrationNo,
      phone: newVet.phone,
      degree: newVet.degree,
      category: newVet.category
    }

    try {
      const response = await editVet(vetData, selectedVet.id)
      if (response.status === 200) {
        fetchVets()
        toast.success('Vet updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update vet')
    }

    setModalOpen(false)
    setIsEditing(false)
    setSelectedVet(null)
    setNewVet({ name: '', specialization: '', profilePicture: '', bio: '', clinicId: [], experience: '' })
    setSelectedSlots([])
  }

  const handleEditVet = vet => {
    console.log('vv', vet)
    setSelectedVet(vet)
    setNewVet({
      name: vet.name,
      specialization: vet.specialization,
      profilePicture: vet.profilePicture,
      bio: vet.bio,
      slots: vet.slots.join(',') || [],
      clinicId: vet.Clinic.map(clinic => clinic.id) || [],
      experience: vet.experience || '',
      consultantFee: vet.consultantFee || '',
      category: vet.category || '',
      address: vet.addreess || '',
      city: vet.city || '',
      state: vet.state || '',
      pinCode: vet.pinCode || '',
      registrationNo: vet.registrationNo || '',
      phone: vet.phone || '',
      degree: vet.degree || '',
      noOfConsultations: vet.noOfConsultations || 0
    })
    setSelectedSlots(vet.slots || [])
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleDeleteVet = id => {
    setVetToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleCancel = () => {
    setModalOpen(false)
    setIsEditing(false)
    setSelectedVet(null)
    setNewVet({
      name: '',
      specialization: '',
      profilePicture: '',
      bio: '',
      clinicId: [],
      experience: '',
      consultantFee: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      registrationNo: '',
      phone: '',
      degree: '',
      noOfConsultations: 0
    })
    setSelectedSlots([])
    setMediaUrl('')
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setNewVet({
      name: '',
      specialization: '',
      profilePicture: '',
      bio: '',
      clinicId: [],
      experience: '',
      slots: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      registrationNo: '',
      phone: '',
      degree: '',
      noOfConsultations: 0
    })
    setSelectedSlots([])
  }

  const confirmDeleteVet = async () => {
    try {
      const payload = {
        vetId: vetToDelete
      }
      const response = await deleteVet(payload)
      if (response.status === 200) {
        setVets(vets.filter(vet => vet.id !== vetToDelete))
        toast.success('Vet deleted successfully')
      } else {
        toast.error('Failed to delete vet')
      }
    } catch (error) {
      toast.error('Failed to delete vet')
    }
    setDeleteDialogOpen(false)
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleCropChange = crop => {
    console.log('Crop Change:', crop)
    setCrop(crop)
  }
  const handleZoomChange = zoom => {
    console.log('Zoom Change:', zoom)
    setZoom(zoom)
  }

  return (
    <div>
      <ToastContainer />
      <Box>
        <CardHeader
          avatar={<Person2 color='primary' fontSize='large' />}
          title='Vet Management'
          titleTypographyProps={{
            variant: 'h5',
            color: 'textPrimary',
            fontWeight: 'bold'
          }}
          subheader='Create or Edit Vet Profile'
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button variant='contained' sx={{ backgroundColor: '#FFA500' }} onClick={() => setModalOpen(true)}>
          Add Vet
        </Button>
      </Box>

      {/* Modal for adding or editing vet */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: 24,
            p: 4,
            overflowY: 'auto',
            gap: '2'
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {isEditing ? 'Edit Vet Profile' : 'Add New Vet'}
          </h2>
          {/* {mediaUrl && (
              <Box display='flex' justifyContent='center' mb={2}>
                <img
                  src={mediaUrl}
                  alt='Profile Preview'
                  width='150' // Increased size for better visibility
                  height='150'
                  style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0px 0px 5px rgba(0,0,0,0.2)' }}
                />
              </Box>
            )} */}
          {/* Profile Picture Preview or Placeholder */}
          <Box display='flex' justifyContent='center' mb={2}>
            {mediaUrl || newVet.profilePicture ? (
              <img
                src={mediaUrl || newVet.profilePicture}
                alt='Profile Preview'
                width='150'
                height='150'
                style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0px 0px 5px rgba(0,0,0,0.2)' }}
              />
            ) : (
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 0px 5px rgba(0,0,0,0.2)'
                }}
              >
                <PhotoCamera style={{ fontSize: 50, color: '#9e9e9e' }} />
              </Box>
            )}
          </Box>
          <Button
            variant='contained'
            component='label'
            startIcon={<PhotoCamera />}
            fullWidth
            sx={{ mt: 2, mb: 2, backgroundColor: '#FFA500' }}
          >
            {isUploading ? 'Uploading Image...' : 'Upload Profile Picture'}
            {/* <input type='file' hidden onChange={handleImageUpload} /> */}
            <input type='file' hidden onChange={handleFileSelect} />
          </Button>

          <form onSubmit={isEditing ? handleUpdateVet : handleCreateVet}>
            <TextField
              label='Name'
              name='name'
              value={newVet.name}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.name}
              helperText={errors.name}
              type='name'
            />
            <TextField
              label='Specialization'
              name='specialization'
              value={newVet.specialization}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.specialization}
              helperText={errors.specialization}
            />
            <TextField
              label='Experience (years)'
              name='experience'
              value={newVet.experience}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.experience}
              helperText={errors.experience}
            />
            <TextField
              label='Bio'
              name='bio'
              value={newVet.bio}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              multiline
              rows={3}
              error={!!errors.bio}
              helperText={errors.bio}
            />
            <FormControl fullWidth margin='normal' required error={!!errors.category}>
              <InputLabel id='category-label'>Category</InputLabel>
              <Select
                labelId='category-label'
                id='category'
                name='category'
                value={newVet.category}
                label='Category'
                onChange={handleInputChange}
              >
                <MenuItem value='ClinicVet'>Clinic Vet</MenuItem>
                <MenuItem value='HomeVet'>Home Vet</MenuItem>
                <MenuItem value='Both'>Both</MenuItem>
              </Select>
              {errors.category && <span style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>}
            </FormControl>
            <TextField
              label='Consultant Fee'
              name='consultantFee'
              value={newVet.consultantFee}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.address}
              helperText={errors.address}
              type='text'
            />
            <TextField
              label='Address'
              name='address'
              value={newVet.address}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.address}
              helperText={errors.address}
              type='text'
            />

            <TextField
              label='City'
              name='city'
              value={newVet.city}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.city}
              helperText={errors.city}
              type='text'
            />

            <TextField
              label='State'
              name='state'
              value={newVet.state}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.state}
              helperText={errors.state}
              type='text'
            />

            <TextField
              label='Pin Code'
              name='pinCode'
              value={newVet.pinCode}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.pinCode}
              helperText={errors.pinCode}
              type='text'
              inputProps={{ maxLength: 6 }}
            />

            <TextField
              label='Registration Number'
              name='registrationNo'
              value={newVet.registrationNo}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.registrationNo}
              helperText={errors.registrationNo}
              type='text'
            />

            <TextField
              label='Phone Number'
              name='phone'
              value={newVet.phone}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.phone}
              helperText={errors.phone}
              type='tel'
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              label='Degree'
              name='degree'
              value={newVet.degree}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
              error={!!errors.degree}
              helperText={errors.degree}
              type='text'
            />

            <TextField
              label='Number of Consultations'
              name='noOfConsultations'
              value={newVet.noOfConsultations}
              onChange={e => setNewVet(prev => ({ ...prev, noOfConsultations: parseInt(e.target.value) || 0 }))}
              fullWidth
              margin='normal'
              type='number'
              inputProps={{ min: 0 }}
            />

            {/* Time slots selection */}
            <Box sx={{ marginBottom: 2 }}>
              <p>Select Available Time Slots:</p>
              {timeSlots.map(slot => (
                <Button
                  key={slot}
                  variant={selectedSlots.includes(slot) ? 'contained' : 'outlined'}
                  onClick={() => handleSlotChange(slot)}
                  sx={{ margin: '4px' }}
                >
                  {/* {formatTimeTo12Hour(slot)}
                   */}
                  {slot}
                </Button>
              ))}
            </Box>

            {/* Only show clinic select field in edit mode */}
            {isEditing && (
              <FormControl fullWidth margin='normal'>
                <Autocomplete
                  multiple
                  options={hospitalLists}
                  getOptionLabel={option => option.name}
                  value={hospitalLists.filter(hospital => newVet.clinicId.includes(hospital.id))}
                  onChange={(event, newValue) =>
                    setNewVet(prev => ({
                      ...prev,
                      clinicId: newValue.map(option => option.id)
                    }))
                  }
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} />
                      <ListItemText primary={option.name} />
                    </li>
                  )}
                  renderInput={params => <TextField {...params} placeholder='Select Clinics' />}
                />
              </FormControl>
            )}

            <Button type='submit' variant='contained' sx={{ backgroundColor: '#FFA500' }} fullWidth>
              {isEditing ? 'Update Vet' : 'Create Vet'}
            </Button>
            <Button onClick={() => handleCancel()} variant='contained' color='secondary' fullWidth sx={{ mt: 2 }}>
              Cancel
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal open={showCropModal} onClose={() => setShowCropModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '60%' }, // Responsive widths
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {imageSrc && (
            <>
              <Box sx={{ position: 'relative', width: '100%', height: '450px', background: '#333' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={handleZoomChange}
                  cropShape='round'
                  showGrid={true}
                />
                {/* Circular Overlay */}
                <Box
                // sx={{
                //   position: 'absolute',
                //   top: 0,
                //   left: 0,
                //   right: 0,
                //   bottom: 0,
                //   display: 'flex',
                //   alignItems: 'center',
                //   justifyContent: 'center'
                // }}
                >
                  <Box
                  // sx={{
                  //   borderRadius: '50%',
                  //   width: 300,
                  //   height: 300,
                  //   boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                  //   pointerEvents: 'none'
                  // }}
                  />
                </Box>
              </Box>
              <Box display='flex' alignItems='center'>
                <Typography variant='body2' sx={{ mr: 2 }}>
                  Rotation
                </Typography>
                <Slider
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(e, rotation) => setRotation(rotation)}
                  aria-labelledby='Rotation'
                  sx={{ width: '150px' }}
                />
              </Box>

              <Box display='flex' justifyContent='space-between' mt={2} width='100%'>
                <Button variant='outlined' onClick={() => setShowCropModal(false)}>
                  Cancel
                </Button>
                <Box display='flex' alignItems='center'>
                  <Typography variant='body2' sx={{ mr: 2 }}>
                    Zoom
                  </Typography>
                  <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e, zoom) => setZoom(zoom)}
                    aria-labelledby='Zoom'
                    sx={{ width: '150px' }}
                  />
                </Box>
                <Button variant='contained' onClick={handleCropDone} sx={{ backgroundColor: '#FFA500' }}>
                  Crop & Upload
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Table to show all vets */}
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table sx={{ minWidth: 650 }} size='small'>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  minWidth: 150,

                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Profile Picture
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 150,

                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Name
              </TableCell>
              <TableCell sx={{ minWidth: 100 }}>Phone</TableCell>

              <TableCell
                sx={{
                  minWidth: 150,

                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Specialization
              </TableCell>
              <TableCell sx={{ minWidth: 150, fontWeight: 'bold' }}>Consultant Fee</TableCell>
              <TableCell
                sx={{
                  minWidth: 150,

                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Bio
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 150,
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Assigned Clinic(s)
              </TableCell>
              <TableCell sx={{ minWidth: 150, fontWeight: 'bold' }}>City</TableCell>
              <TableCell sx={{ minWidth: 150, fontWeight: 'bold' }}>Degree</TableCell>
              <TableCell sx={{ minWidth: 150, fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ minWidth: 170, fontWeight: 'bold' }}>Registration No.</TableCell>
              <TableCell sx={{ minWidth: 170, fontWeight: 'bold' }}>No. of Consultations</TableCell>
              <TableCell
                sx={{
                  maxWidth: 150,
                  fontWeight: 'bold',
                  overflow: 'hidden'
                }}
              >
                Time
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>Experience</TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vets.length > 0 ? (
              vets.map(vet => (
                <TableRow key={vet.id}>
                  <TableCell>
                    {vet.profilePicture ? (
                      <img
                        src={vet.profilePicture}
                        alt='Profile'
                        width={65}
                        height={65}
                        style={{ borderRadius: '50%' }}
                      />
                    ) : (
                      'No Image'
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {vet.name}
                  </TableCell>
                  <TableCell>{vet.phone || 'n/a'}</TableCell>
                  <TableCell>
                    <Box component='ul' sx={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                      {vet?.specialization?.includes(',')
                        ? vet?.specialization?.split(' ,').map((spec, idx) => (
                            <Box component='li' key={idx}>
                              {spec.trim()}
                            </Box>
                          ))
                        : vet?.specialization?.split('|').map((spec, idx) => (
                            <Box component='li' key={idx}>
                              {spec.trim()}
                            </Box>
                          ))}
                    </Box>
                  </TableCell>

                  <TableCell>{vet.consultantFee}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Tooltip placement='left-start' title={vet.bio}>
                      <span>{vet.bio}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Tooltip
                      title={
                        vet.Clinic && vet.Clinic.length > 0
                          ? vet.Clinic.map(clinic => clinic.name).join(', ')
                          : 'Not Assigned'
                      }
                    >
                      <span>
                        {vet.Clinic && vet.Clinic.length > 0
                          ? vet.Clinic.map(clinic => clinic.name).join(', ')
                          : 'Not Assigned'}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{vet.city || 'n/a'}</TableCell>
                  <TableCell>{vet.degree || 'n/a'}</TableCell>
                  <TableCell>{vet.category}</TableCell>
                  <TableCell>{vet.registrationNo || 'n/a'}</TableCell>
                  <TableCell>{vet.noOfConsultations || 0}</TableCell>
                  {/* <TableCell sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {vet.slots ? vet.slots.join(', ') : 'No Slots Selected'}
                  </TableCell> */}
                  <TableCell sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {vet.slots && vet.slots.length > 0
                      ? vet.slots.map(slot => <Chip key={slot} label={slot} size='small' />)
                      : 'No Slots Selected'}
                  </TableCell>
                  <TableCell>{vet.experience ? `${vet.experience} years` : 'N/A'}</TableCell>

                  <TableCell>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => handleEditVet(vet)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => handleDeleteVet(vet.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  No vets available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component='div'
          count={vets.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Confirmation Dialog for Deleting Vet */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>Are you sure you want to delete this vet?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='primary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteVet} color='secondary' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default VetManagementPage
