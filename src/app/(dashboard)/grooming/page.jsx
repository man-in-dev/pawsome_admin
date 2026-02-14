'use client'

import React, { useState, useEffect } from 'react'

import Cropper from 'react-easy-crop'

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
  Tooltip
} from '@mui/material'

import Person2 from '@mui/icons-material/Person2'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

import { getCroppedImg } from '../../../utils/cropImage.js'

import { getAllGroomers, createGroomer, editGroomer, uploadImage, deleteGroomer } from '@/app/api'
import ProtectedRoutes from '@/components/ProtectedRoute'

const GroomManagement = () => {
  const [grooms, setGrooms] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedGroom, setSelectedGroom] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groomToDelete, setGroomToDelete] = useState(null)
  const [mediaUrl, setMediaUrl] = useState(null)
  const [selectedSlots, setSelectedSlots] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)
  const [userRole, setUserRole] = useState('')

  const [imageSrc, setImageSrc] = useState(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const [newGroom, setNewGroom] = useState({
    name: '',
    specialization: '',
    profilePicture: '',
    bio: '',
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

  const [errors, setErrors] = useState({})

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleCropDone = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      await uploadCroppedImage(croppedBlob)
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
      if (response?.data?.data?.fileUrl) {
        setMediaUrl(response.data.data.fileUrl)
        toast.success('Profile picture uploaded')
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

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageSrc(reader.result)
      setShowCropModal(true)
    })
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedData = JSON.parse(storedUser)
      setUserRole(parsedData.role)
    }
  }, [])

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour24 = i + 9
    const hour12 = hour24 % 12 || 12
    const period = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12.toString().padStart(2, '0')}:00 ${period}`
  })

  const fetchGrooms = async () => {
    try {
      const response = await getAllGroomers()
      setGrooms(response.data.data || [])
    } catch (error) {
      toast.error('Error fetching grooms')
      setGrooms([])
    }
  }

  useEffect(() => {
    fetchGrooms()
  }, [])

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewGroom(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const tempError = {}
    if (!newGroom?.name) tempError.name = 'Name is required'
    if (!newGroom?.specialization) tempError.specialization = 'Specialization is required'
    if (!newGroom?.bio) tempError.bio = 'Bio is required'
    if (!newGroom?.experience) tempError.experience = 'Experience is required'
    if (!newGroom?.category) tempError.category = 'Category is required'
    setErrors(tempError)
    return Object.keys(tempError).length === 0
  }

  const handleSlotChange = slot => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot))
    } else {
      setSelectedSlots([...selectedSlots, slot])
    }
  }

  const handleCreateGroom = async e => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fill all required fields')
      return
    }

    const groomData = {
      ...newGroom,
      profilePicture: mediaUrl || newGroom.profilePicture,
      slots: selectedSlots,
      noOfConsultations: parseInt(newGroom.noOfConsultations) || 0
    }

    try {
      const response = await createGroomer(groomData)
      if (response.status === 201 || response.status === 200) {
        fetchGrooms()
        toast.success('Groom created successfully')
        setModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Create Groom Error:', error)
      toast.error('Failed to create groom. Please check console for details.')
    }
  }

  const handleUpdateGroom = async e => {
    e.preventDefault()

    const groomData = {
      ...newGroom,
      profilePicture: mediaUrl || newGroom.profilePicture,
      slots: selectedSlots,
      noOfConsultations: parseInt(newGroom.noOfConsultations) || 0,
    }

    try {
      const response = await editGroomer(groomData, selectedGroom.id)
      if (response.status === 200) {
        fetchGrooms()
        toast.success('Groom updated successfully')
        setModalOpen(false)
        setIsEditing(false)
        setSelectedGroom(null)
        resetForm()
      }
    } catch (error) {
      toast.error('Failed to update groom')
    }
  }

  const handleEditGroom = groom => {
    setSelectedGroom(groom)
    setNewGroom({
      name: groom.name || '',
      specialization: groom.specialization || '',
      profilePicture: groom.profilePicture || '',
      bio: groom.bio || '',
      experience: groom.experience || '',
      consultantFee: groom.consultantFee || '',
      category: groom.category || '',
      address: groom.address || '',
      city: groom.city || '',
      state: groom.state || '',
      pinCode: groom.pinCode || '',
      registrationNo: groom.registrationNo || '',
      phone: groom.phone || '',
      degree: groom.degree || '',
      noOfConsultations: groom.noOfConsultations || 0
    })
    setSelectedSlots(groom.slots || [])
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleDeleteGroom = id => {
    setGroomToDelete(id)
    setDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setNewGroom({
      name: '',
      specialization: '',
      profilePicture: '',
      bio: '',
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
    })
    setSelectedSlots([])
    setMediaUrl('')
  }

  const handleCancel = () => {
    setModalOpen(false)
    setIsEditing(false)
    setSelectedGroom(null)
    resetForm()
  }

  const handleModalClose = () => {
    setModalOpen(false)
    if (!isEditing) resetForm()
  }

  const confirmDeleteGroom = async () => {
    try {
      const response = await deleteGroomer(groomToDelete)
      if (response.status === 200) {
        setGrooms(grooms.filter(g => g.id !== groomToDelete))
        toast.success('Groom deleted successfully')
      } else {
        toast.error('Failed to delete groom')
      }
    } catch (error) {
      toast.error('Failed to delete groom')
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

  const filteredGrooms = grooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <div>
      <ToastContainer />
      <Box>
        <CardHeader
          avatar={<Person2 color='primary' fontSize='large' />}
          title='Groom Management'
          titleTypographyProps={{
            variant: 'h5',
            color: 'textPrimary',
            fontWeight: 'bold'
          }}
          subheader={'Create or Edit Groom Profile'}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'end', mb: 2 }}>
        <Button variant='contained' sx={{ backgroundColor: '#FF9C1E' }} onClick={() => setModalOpen(true)}>
          Add Groom
        </Button>
      </Box>

      {/* Modal for adding or editing groom */}
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
            overflowY: 'auto'
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
            {isEditing ? 'Edit Groom Profile' : 'Add New Groom Profile'}
          </h2>

          <Box display='flex' justifyContent='center' mb={2}>
            {mediaUrl || newGroom.profilePicture ? (
              <img
                src={mediaUrl || newGroom.profilePicture}
                alt='Profile Preview'
                width='150'
                height='150'
                style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0px 0px 8px rgba(0,0,0,0.2)', border: '4px solid #FF9C1E' }}
              />
            ) : (
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 0px 5px rgba(0,0,0,0.1)',
                  border: '4px solid #ddd'
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
            sx={{ mt: 1, mb: 3, backgroundColor: '#FF9C1E', '&:hover': { backgroundColor: '#e68a1a' } }}
          >
            {isUploading ? 'Uploading Image...' : 'Upload Profile Picture'}
            <input type='file' hidden onChange={handleFileSelect} />
          </Button>

          <form onSubmit={isEditing ? handleUpdateGroom : handleCreateGroom}>
            <Box display='flex' gap={2}>
              <TextField
                label='Name'
                name='name'
                value={newGroom.name}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                label='Specialization'
                name='specialization'
                value={newGroom.specialization}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
                error={!!errors.specialization}
                helperText={errors.specialization}
              />
            </Box>

            <Box display='flex' gap={2}>
              <TextField
                label='Experience (years)'
                name='experience'
                value={newGroom.experience}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
                error={!!errors.experience}
                helperText={errors.experience}
              />
              <TextField
                label='Consultant Fee'
                name='consultantFee'
                value={newGroom.consultantFee}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
              />
            </Box>

            <TextField
              label='Bio'
              name='bio'
              value={newGroom.bio}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              multiline
              rows={3}
              error={!!errors.bio}
              helperText={errors.bio}
            />

            <Box display='flex' gap={2}>
              <FormControl fullWidth margin='normal' required error={!!errors.category}>
                <InputLabel id='category-label'>Category</InputLabel>
                <Select
                  labelId='category-label'
                  id='category'
                  name='category'
                  value={newGroom.category}
                  label='Category'
                  onChange={handleInputChange}
                >
                  <MenuItem value='ClinicGroom'>Clinic Groom</MenuItem>
                  <MenuItem value='HomeGroom'>Home Groom</MenuItem>
                  <MenuItem value='Both'>Both</MenuItem>
                </Select>
                {errors.category && <Typography variant='caption' color='error'>{errors.category}</Typography>}
              </FormControl>
              <TextField
                label='Phone Number'
                name='phone'
                value={newGroom.phone}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
                inputProps={{ maxLength: 10 }}
              />
            </Box>

            <TextField
              label='Address'
              name='address'
              value={newGroom.address}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              required
            />

            <Box display='flex' gap={2}>
              <TextField
                label='City'
                name='city'
                value={newGroom.city}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='State'
                name='state'
                value={newGroom.state}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Pin Code'
                name='pinCode'
                value={newGroom.pinCode}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
                inputProps={{ maxLength: 6 }}
              />
            </Box>

            <Box display='flex' gap={2}>
              <TextField
                label='Registration Number'
                name='registrationNo'
                value={newGroom.registrationNo}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Degree/Certification'
                name='degree'
                value={newGroom.degree}
                onChange={handleInputChange}
                fullWidth
                margin='normal'
                required
              />
            </Box>

            <TextField
              label='Number of Consultations'
              name='noOfConsultations'
              value={newGroom.noOfConsultations}
              onChange={handleInputChange}
              fullWidth
              margin='normal'
              type='number'
              inputProps={{ min: 0 }}
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant='subtitle1' gutterBottom fontWeight='bold'>
                Select Available Time Slots:
              </Typography>
              <Box display='flex' flexWrap='wrap' gap={1}>
                {timeSlots.map(slot => (
                  <Chip
                    key={slot}
                    label={slot}
                    onClick={() => handleSlotChange(slot)}
                    color={selectedSlots.includes(slot) ? 'primary' : 'default'}
                    variant={selectedSlots.includes(slot) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>


            <Box display='flex' gap={2} mt={4}>
              <Button onClick={handleCancel} variant='outlined' color='secondary' fullWidth>
                Cancel
              </Button>
              <Button type='submit' variant='contained' sx={{ backgroundColor: '#FF9C1E', '&:hover': { backgroundColor: '#e68a1a' } }} fullWidth>
                {isEditing ? 'Update Groom' : 'Create Groom'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Image Crop Modal */}
      <Modal open={showCropModal} onClose={() => setShowCropModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '600px' },
            bgcolor: 'background.paper',
            borderRadius: '12px',
            boxShadow: 24,
            p: 3,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography variant='h6' gutterBottom align='center'>Crop Profile Picture</Typography>
          {imageSrc && (
            <>
              <Box sx={{ position: 'relative', width: '100%', height: '400px', background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape='round'
                  showGrid={true}
                />
              </Box>
              <Box mt={3}>
                <Typography variant='body2'>Rotation: {rotation}°</Typography>
                <Slider value={rotation} min={0} max={360} onChange={(e, val) => setRotation(val)} color='primary' />
              </Box>
              <Box mt={1}>
                <Typography variant='body2'>Zoom: {zoom.toFixed(1)}x</Typography>
                <Slider value={zoom} min={1} max={3} step={0.1} onChange={(e, val) => setZoom(val)} color='primary' />
              </Box>
              <Box display='flex' justifyContent='flex-end' gap={2} mt={4}>
                <Button variant='outlined' onClick={() => setShowCropModal(false)}>Cancel</Button>
                <Button variant='contained' onClick={handleCropDone} sx={{ backgroundColor: '#FF9C1E', '&:hover': { backgroundColor: '#e68a1a' } }}>
                  Save & Upload
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Grooms Table */}
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
            {filteredGrooms.length > 0 ? (
              filteredGrooms.map(groom => (
                <TableRow key={groom.id}>
                  <TableCell>
                    {groom.profilePicture ? (
                      <img
                        src={groom.profilePicture}
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
                    {groom.name}
                  </TableCell>
                  <TableCell>{groom.phone || 'n/a'}</TableCell>
                  <TableCell>
                    <Box component='ul' sx={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                      {groom?.specialization?.includes(',')
                        ? groom?.specialization?.split(' ,').map((spec, idx) => (
                            <Box component='li' key={idx}>
                              {spec.trim()}
                            </Box>
                          ))
                        : groom?.specialization?.split('|').map((spec, idx) => (
                            <Box component='li' key={idx}>
                              {spec.trim()}
                            </Box>
                          ))}
                    </Box>
                  </TableCell>
                  <TableCell>{groom.consultantFee}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Tooltip placement='left-start' title={groom.bio}>
                      <span>{groom.bio}</span>
                    </Tooltip>
                  </TableCell>
               
                  <TableCell>{groom.city || 'n/a'}</TableCell>
                  <TableCell>{groom.degree || 'n/a'}</TableCell>
                  <TableCell>{groom.category}</TableCell>
                  <TableCell>{groom.registrationNo || 'n/a'}</TableCell>
                  <TableCell>{groom.noOfConsultations || 0}</TableCell>
                  <TableCell sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {groom.slots && groom.slots.length > 0
                      ? groom.slots.map(slot => <Chip key={slot} label={slot} size='small' />)
                      : 'No Slots Selected'}
                  </TableCell>
                  <TableCell>{groom.experience ? `${groom.experience} years` : 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => handleEditGroom(groom)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => handleDeleteGroom(groom.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} align='center'>
                  No grooms available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={grooms.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle>Delete Groom Profile?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Are you sure you want to remove this groom from the system?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color='inherit'>Cancel</Button>
          <Button onClick={confirmDeleteGroom} color='error' variant='contained'>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

const GroomManagementPage = () => {
  return (
    <ProtectedRoutes requiredPermission='Groom Profile'>
      <GroomManagement />
    </ProtectedRoutes>
  )
}

export default GroomManagementPage
