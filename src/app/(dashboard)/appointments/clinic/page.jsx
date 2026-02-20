'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Select, MenuItem, TablePagination,
  TextField, LinearProgress, CardHeader, Button, DialogActions,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  Tabs, Tab
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import { OtherHouses, ContentCut } from '@mui/icons-material'
import {
  addComment, addNote, amountPaid, amountPaidOnSopt,
  getAllAppointments, getAllAppointmentsHouse, getAllGroomingAppointments,
  getVetByClinicId, sendNotificationAdmin, updateAppointment,
  updateAppointmentStatus, updatePaidStatus, updateGroomingAppointment,
  deleteGroomingAppointment
} from '@/app/api'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoutes from '@/components/ProtectedRoute'

const AppointmentPage = () => {
  const [tabValue, setTabValue] = useState(0)

  // Clinic appointments
  const [clinicAppointments, setClinicAppointments] = useState([])
  const [filteredClinicAppointments, setFilteredClinicAppointments] = useState([])
  const [clinicStatusValues, setClinicStatusValues] = useState({})
  const [clinicPaidStatusValues, setClinicPaidStatusValues] = useState({})
  const [clinicAmountPaidValues, setClinicAmountPaidValues] = useState({})
  const [clinicAmountOnSpotValues, setClinicAmountOnSpotValues] = useState({})

  // Groom appointments
  const [groomAppointments, setGroomAppointments] = useState([])
  const [filteredGroomAppointments, setFilteredGroomAppointments] = useState([])
  const [groomStatusValues, setGroomStatusValues] = useState({})

  // Common states
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [loading, setLoading] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Modal states
  const [openNoteModal, setOpenNoteModal] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [openPaymentModal, setOpenPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [openPaymentEditModal, setOpenPaymentEditModal] = useState(false)
  const [selectedAppointmentForPaymentEdit, setSelectedAppointmentForPaymentEdit] = useState(null)
  const [paymentEditValues, setPaymentEditValues] = useState({ amountPaid: '', amountPaidOnSopt: '' })
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)
  const [appointmentToDeleteType, setAppointmentToDeleteType] = useState(null)

  // Animation
  const [animateData] = useState(['Search users'])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch all clinic appointments
  const fetchAllClinicAppointments = async () => {
    setLoading(true)
    try {
      const response = await getAllAppointments()
      const appointmentsData = response?.data?.data || []
      setClinicAppointments(appointmentsData)
      setFilteredClinicAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching clinic appointments:', error)
      toast.error('Error fetching clinic appointments')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all groom appointments
  const fetchAllGroomAppointments = async () => {
    setLoading(true)
    try {
      const response = await getAllGroomingAppointments({ type: 'groom' })
      const appointmentsData = (response?.data?.data || []).filter(
        appointment => appointment.type === 'groom'
      )
      setGroomAppointments(appointmentsData)
      setFilteredGroomAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching groom appointments:', error)
      toast.error('Error fetching groom appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllClinicAppointments()
    fetchAllGroomAppointments()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % animateData.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [animateData])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setSearchQuery('')
    setPage(0)
  }

  // Clinic search
  const handleClinicSearch = event => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = clinicAppointments.filter(appointment =>
      appointment.User?.name.toLowerCase().includes(query)
    )
    setFilteredClinicAppointments(filtered)
    setPage(0)
  }

  // Groom search
  const handleGroomSearch = event => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = groomAppointments.filter(appointment => {
      const userName = appointment?.User?.name?.toLowerCase() || ''
      const userEmail = appointment?.User?.email?.toLowerCase() || ''
      const userPhone = appointment?.User?.phone?.toLowerCase() || ''
      const petName = appointment?.Pet?.name?.toLowerCase() || ''
      const groomName = appointment.Groomer?.name?.toLowerCase() || ''
      return userName.includes(query) || userEmail.includes(query) ||
        userPhone.includes(query) || petName.includes(query) ||
        groomName.includes(query)
    })
    setFilteredGroomAppointments(filtered)
    setPage(0)
  }

  const handleClinicStatusChange = async (id, value, ap) => {
    if (!value) {
      toast.error('Status is required')
      return
    }

    try {
      setLoading(true)
      const payload = { appointmentId: id, status: value }
      const updateResponse = await updateAppointmentStatus(payload)

      if (updateResponse?.status === 200) {
        toast.success('Appointment Updated Successfully')
        setClinicStatusValues(prev => ({ ...prev, [id]: value }))
        fetchAllClinicAppointments()
      } else {
        toast.error(updateResponse.data?.message || 'Failed to update appointment status')
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('An error occurred while updating the appointment status')
    } finally {
      setLoading(false)
    }
  }

  const handleGroomStatusChange = async (id, value) => {
    if (!value) {
      toast.error('Status is required')
      return
    }

    try {
      setLoading(true)
      const payload = { status: value }
      const response = await updateGroomingAppointment(id, payload)

      if (response?.status === 200) {
        toast.success('Appointment Updated Successfully')
        setGroomStatusValues(prev => ({ ...prev, [id]: value }))
        fetchAllGroomAppointments()
      } else {
        toast.error(response.data?.message || 'Failed to update appointment status')
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('An error occurred while updating the appointment status')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Modal handlers
  const handleOpenNoteModal = appointment => {
    setSelectedAppointment(appointment)
    setNoteValue('')
    setOpenNoteModal(true)
  }

  const handleCloseNoteModal = () => {
    setOpenNoteModal(false)
    setSelectedAppointment(null)
    setNoteValue('')
  }

  const handleOpenPaymentModal = payment => {
    setSelectedPayment(payment)
    setOpenPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false)
    setSelectedPayment(null)
  }

  const handleOpenPaymentEditModal = appointment => {
    setSelectedAppointmentForPaymentEdit(appointment)
    setPaymentEditValues({
      amountPaid: appointment.AmountPaid || '',
      amountPaidOnSopt: appointment.AmountPaidOnSopt || ''
    })
    setOpenPaymentEditModal(true)
  }

  const handleClosePaymentEditModal = () => {
    setOpenPaymentEditModal(false)
    setSelectedAppointmentForPaymentEdit(null)
    setPaymentEditValues({ amountPaid: '', amountPaidOnSopt: '' })
  }

  const handleAddClinicNote = async () => {
    if (!selectedAppointment || !noteValue.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    try {
      setLoading(true)
      const payload = { id: selectedAppointment.id, note: noteValue.trim() }
      const response = await addComment(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Note added successfully')
        fetchAllClinicAppointments()
        handleCloseNoteModal()
      } else {
        toast.error(response?.data?.message || 'Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('An error occurred while adding the note')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGroomNote = async () => {
    if (!selectedAppointment || !noteValue.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    try {
      setLoading(true)
      const payload = { status: selectedAppointment.status, notes: noteValue.trim() }
      const response = await updateGroomingAppointment(selectedAppointment.id, payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Note added successfully')
        fetchAllGroomAppointments()
        handleCloseNoteModal()
      } else {
        toast.error(response?.data?.message || 'Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('An error occurred while adding the note')
    } finally {
      setLoading(false)
    }
  }

  const handlePaidStatusChange = async (id, value) => {
    if (!value) {
      toast.error('Paid status is required')
      return
    }

    try {
      setLoading(true)
      const payload = { appointmentId: id, status: Boolean(value) }
      const response = await updatePaidStatus(payload)
      if (response?.status === 200) {
        toast.success('Payment status updated successfully')
        setClinicPaidStatusValues(prev => ({ ...prev, [id]: value }))
        fetchAllClinicAppointments()
      } else {
        toast.error(response?.data?.message || 'Failed to update payment status')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('An error occurred while updating the payment status')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAmountPaidModal = async () => {
    const amount = paymentEditValues.amountPaid
    if (amount === '' || isNaN(amount)) {
      toast.error('Enter a valid Amount Paid')
      return
    }
    try {
      setLoading(true)
      const payload = { appointmentId: selectedAppointmentForPaymentEdit.id, amount: parseFloat(amount) }
      const response = await amountPaid(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount Paid updated successfully')
        fetchAllClinicAppointments()
        handleClosePaymentEditModal()
      } else {
        toast.error(response?.data?.message || 'Failed to update Amount Paid')
      }
    } catch (error) {
      console.error('Error updating Amount Paid:', error)
      toast.error('An error occurred while updating Amount Paid')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAmountOnSoptModal = async () => {
    const amount = paymentEditValues.amountPaidOnSopt
    if (amount === '' || isNaN(amount)) {
      toast.error('Enter a valid Amount Paid On Spot')
      return
    }
    try {
      setLoading(true)
      const payload = { appointmentId: selectedAppointmentForPaymentEdit.id, amount: parseFloat(amount) }
      const response = await amountPaidOnSopt(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount Paid On Spot updated successfully')
        fetchAllClinicAppointments()
        handleClosePaymentEditModal()
      } else {
        toast.error(response?.data?.message || 'Failed to update Amount Paid On Spot')
      }
    } catch (error) {
      console.error('Error updating Amount Paid On Spot:', error)
      toast.error('An error occurred while updating Amount Paid On Spot')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDeleteDialog = (appointment, type) => {
    setAppointmentToDelete(appointment)
    setAppointmentToDeleteType(type)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setAppointmentToDelete(null)
    setAppointmentToDeleteType(null)
  }

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete || appointmentToDeleteType !== 'groom') {
      handleCloseDeleteDialog()
      return
    }

    try {
      setLoading(true)
      const response = await deleteGroomingAppointment(appointmentToDelete.id)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Appointment deleted successfully')
        fetchAllGroomAppointments()
        handleCloseDeleteDialog()
      } else {
        toast.error(response?.data?.message || 'Failed to delete appointment')
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error(error?.response?.data?.message || 'An error occurred while deleting the appointment')
    } finally {
      setLoading(false)
    }
  }

  const getClinicData = () => {
    return filteredClinicAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }

  const getGroomData = () => {
    return filteredGroomAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }

  return (
    <>
      <Box sx={{ padding: 2 }}>
        {loading && (
          <LinearProgress
            sx={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200,
              backgroundColor: 'rgba(255, 165, 0, 0.2)',
              '& .MuiLinearProgress-bar': { backgroundColor: 'orange' }
            }}
            variant='indeterminate'
          />
        )}
        <CardHeader
          avatar={<OtherHouses color='primary' fontSize='large' />}
          title='Clinic & Groom Bookings'
          titleTypographyProps={{ variant: 'h5', color: 'textPrimary', fontWeight: 'bold' }}
          subheader={'View or Update Status'}
        />

        <ToastContainer position='top-right' autoClose={3000} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label='Clinic Appointments' />
            <Tab label='Groom Appointments' />
          </Tabs>
        </Box>

        {/* Search Bar */}
        <TextField
          onClick={() => setClicked(true)}
          onBlur={() => setClicked(false)}
          value={searchQuery}
          onChange={tabValue === 0 ? handleClinicSearch : handleGroomSearch}
          placeholder=''
          variant='outlined'
          fullWidth
          sx={{ marginBottom: 2 }}
          InputProps={{
            startAdornment: !clicked ? (
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', width: '200px' }}>
                <AnimatePresence>
                  <motion.div
                    key={animateData[currentIndex]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.6)', position: 'absolute', whiteSpace: 'nowrap' }}
                  >
                    {animateData[currentIndex]}
                  </motion.div>
                </AnimatePresence>
              </Box>
            ) : null
          }}
        />

        {/* Clinic Appointments Tab */}
        {tabValue === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Pet</TableCell>
                  <TableCell>Hospital/Clinic</TableCell>
                  <TableCell>Booking Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Vet</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Datetime Slot</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getClinicData().length > 0 ? (
                  getClinicData().map(appointment => (
                    <TableRow key={appointment.id} sx={{ backgroundColor: '#E0E0E0', '&:hover': { backgroundColor: '#E0E0E0', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', cursor: 'pointer' } }}>
                      <TableCell>
                        <Box>
                          <Typography>{appointment.User?.name}</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 1 }}>
                            <Typography variant='caption'>{appointment?.User?.email}</Typography>
                            <Typography variant='caption'>{appointment?.User?.phone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography>{appointment.Pet?.name}</Typography>
                          <Typography variant='caption'>Type: {appointment?.Pet?.type}</Typography><br />
                          <Typography variant='caption'>Breed: {appointment?.Pet?.breed}</Typography><br />
                          <Typography variant='caption'>Gender: {appointment?.Pet?.gender}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{appointment.Clinic?.name || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>{appointment.bookingReasons || 'N/A'}</TableCell>
                      <TableCell>
                        <Select value={clinicStatusValues[appointment.id] || appointment.status} onChange={e => handleClinicStatusChange(appointment.id, e.target.value, appointment)} fullWidth sx={{ marginLeft: 4 }}>
                          <MenuItem value='pending'>Pending</MenuItem>
                          <MenuItem value='confirmed'>Confirmed</MenuItem>
                          <MenuItem value='completed'>Completed</MenuItem>
                          <MenuItem value='cancelled'>Cancelled</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Typography>{appointment.Vet ? appointment.Vet.name : 'No Vet Assigned'}</Typography>
                      </TableCell>
                      <TableCell>
                        {appointment.Payment ? (
                          <Button variant='text' color='primary' onClick={() => handleOpenPaymentModal(appointment.Payment)}>
                            {appointment.Payment.status}
                          </Button>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{new Date(appointment.datetimeSlot).toLocaleString()}</TableCell>
                      <TableCell>
                        <Select value={clinicPaidStatusValues[appointment.id] || appointment.isClinicPaid || ''} onChange={e => handlePaidStatusChange(appointment.id, e.target.value)} fullWidth sx={{ marginLeft: 4 }}>
                          <MenuItem value='true'>Yes</MenuItem>
                          <MenuItem value='false'>No</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2'>Amount Paid: {appointment.AmountPaid || 0}</Typography>
                          <Typography variant='body2'>Amount On Spot: {appointment.AmountPaidOnSopt || 0}</Typography>
                          <Button variant='outlined' size='small' onClick={() => handleOpenPaymentEditModal(appointment)} sx={{ mt: 1 }}>
                            Edit Payment
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {appointment.notes && appointment.notes.length > 0 ? (
                          <Box>
                            <Typography>{appointment.notes}</Typography>
                          </Box>
                        ) : (
                          <Typography variant='body2' color='textSecondary'>
                            No notes
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{appointment.Comment || 'n/a'}</TableCell>
                      <TableCell>
                        <Button variant='outlined' size='small' onClick={() => handleOpenNoteModal(appointment)}>
                          Add Comment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} align='center'>
                      No clinic appointments available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Groom Appointments Tab */}
        {tabValue === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Pet</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Groom</TableCell>
                  <TableCell>Booking Services</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell>Datetime Slot</TableCell>
                  <TableCell>Additional Note</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getGroomData().length > 0 ? (
                  getGroomData().map(appointment => (
                    <TableRow key={appointment.id} sx={{ '&:hover': { backgroundColor: '#E0E0E0', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', cursor: 'pointer' } }}>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: '600' }}>
                            {appointment?.User?.name || appointment.userId || 'N/A'}
                          </Typography>
                          {appointment?.User?.email && (
                            <Typography display='block' variant='caption' color="text.secondary">
                              {appointment.User.email}
                            </Typography>
                          )}
                          {appointment?.User?.phone && (
                            <Typography display='block' variant='caption' color="text.secondary">
                              {appointment.User.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: '600' }}>
                            {appointment?.Pet?.name || appointment?.petName || appointment?.Pet?.id || appointment?.petId || 'N/A'}
                          </Typography>
                          {appointment?.Pet?.type && (
                            <Typography variant='caption' display='block' sx={{ marginTop: '4px' }}>
                              Type: {appointment.Pet.type}
                            </Typography>
                          )}
                          {appointment?.Pet?.breed && (
                            <Typography variant='caption' display='block' sx={{ marginTop: '4px' }}>
                              Breed: {appointment.Pet.breed}
                            </Typography>
                          )}
                          {appointment?.Pet?.gender && (
                            <Typography variant='caption' display='block' sx={{ marginTop: '4px' }}>
                              Gender: {appointment.Pet.gender}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ textTransform: 'capitalize', fontWeight: '500', color: appointment.type === 'groom' ? 'primary.main' : appointment.type === 'home' ? 'success.main' : 'text.secondary' }}>
                          {appointment.type === 'groom' ? 'Clinic Groom' : appointment.type === 'home' ? 'House Groom' : appointment.type || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {appointment.Groomer ? (
                            <>
                              <Typography sx={{ fontWeight: '600' }}>
                                {appointment.Groomer.name}
                              </Typography>
                              {appointment.Groomer.phone && (
                                <Typography variant='caption' display='block' color="text.secondary">
                                  {appointment.Groomer.phone}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography>No Groom Assigned</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box component='ul' sx={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                          {appointment.bookingReasons?.map((reason, idx) => (
                            <Box component='li' key={idx}>
                              {reason}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Select value={groomStatusValues[appointment.id] || appointment.status} onChange={e => handleGroomStatusChange(appointment.id, e.target.value)} sx={{ paddingRight: '15px !important' }}>
                          <MenuItem value='pending'>Pending</MenuItem>
                          <MenuItem value='confirmed'>Confirmed</MenuItem>
                          <MenuItem value='completed'>Completed</MenuItem>
                          <MenuItem value='cancelled'>Cancelled</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: '600' }}>
                          ₹{appointment.priceAtBooking || appointment.Payment?.amount || appointment.AmountPaid || appointment.AmountPaidOnSpot || appointment.Groomer?.consultantFee || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {appointment.Payment?.status === 'paid' ? (
                          <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            Paid
                          </Typography>
                        ) : appointment.AmountPaid || appointment.AmountPaidOnSpot ? (
                          <Typography sx={{ color: 'info.main', fontWeight: 'bold' }}>
                            Paid (On Spot)
                          </Typography>
                        ) : (
                          <Typography sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                            Pending
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {appointment.Payment?.status === 'paid' ? (
                          <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            ₹{appointment.Payment.amount || appointment.priceAtBooking || 0}
                          </Typography>
                        ) : appointment.AmountPaid ? (
                          <Typography sx={{ color: 'info.main', fontWeight: 'bold' }}>
                            ₹{appointment.AmountPaid}
                          </Typography>
                        ) : appointment.AmountPaidOnSpot ? (
                          <Typography sx={{ color: 'info.main', fontWeight: 'bold' }}>
                            ₹{appointment.AmountPaidOnSpot}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: 'text.secondary' }}>₹0</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(appointment.datetimeSlot).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Typography>{appointment.additionalNote || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button variant='outlined' size='small' onClick={() => handleOpenNoteModal(appointment)}>
                          {appointment.notes ? 'View/Edit' : 'Add Note'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant='contained' color='error' size='small' onClick={() => handleOpenDeleteDialog(appointment, 'groom')}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} align='center'>
                      <Typography>No groom appointments found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={tabValue === 0 ? filteredClinicAppointments.length : filteredGroomAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      {/* Note Modal */}
      <Dialog open={openNoteModal} onClose={handleCloseNoteModal} maxWidth='sm' fullWidth>
        <DialogTitle>Add/Edit Note</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a note for <strong>{selectedAppointment?.User?.name || 'this appointment'}</strong>
          </DialogContentText>
          <TextField
            label='Note'
            fullWidth
            multiline
            rows={4}
            value={noteValue}
            onChange={e => setNoteValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteModal} color='secondary'>
            Cancel
          </Button>
          <Button onClick={tabValue === 0 ? handleAddClinicNote : handleAddGroomNote} variant='contained' color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={openPaymentModal} onClose={handleClosePaymentModal} maxWidth='sm' fullWidth>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent dividers>
          {selectedPayment ? (
            <Box sx={{ '& > *': { marginBottom: 1 } }}>
              <Typography variant='body1'>
                <strong>Order ID:</strong> {selectedPayment.rpOrderId}
              </Typography>
              <Typography variant='body1'>
                <strong>Payment ID:</strong> {selectedPayment.rpPaymentId}
              </Typography>
              <Typography variant='body1'>
                <strong>Currency:</strong> {selectedPayment.currency}
              </Typography>
              <Typography variant='body1'>
                <strong>Amount:</strong> {selectedPayment.amount}
              </Typography>
              <Typography variant='body1'>
                <strong>Status:</strong> {selectedPayment.status}
              </Typography>
              <Typography variant='body1'>
                <strong>Source:</strong> {selectedPayment.source}
              </Typography>
              <Typography variant='body1'>
                <strong>Tax:</strong> {selectedPayment.tax}
              </Typography>
              <Typography variant='body1'>
                <strong>Subtotal:</strong> {selectedPayment.subtotal}
              </Typography>
              <Typography variant='body1'>
                <strong>Invoice:</strong>
                <a href={selectedPayment.invoice} target='_blank' rel='noopener noreferrer' style={{ marginLeft: 4 }}>
                  View Invoice
                </a>
              </Typography>
            </Box>
          ) : (
            <Typography variant='body2'>No payment details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentModal} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Edit Modal */}
      <Dialog open={openPaymentEditModal} onClose={handleClosePaymentEditModal} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Payment Amounts</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the payment details for{' '}
            <strong>{selectedAppointmentForPaymentEdit?.User?.name || 'this appointment'}</strong>
          </DialogContentText>
          <TextField
            label='Amount Paid'
            fullWidth
            type='number'
            variant='outlined'
            value={paymentEditValues.amountPaid}
            onChange={e => setPaymentEditValues(prev => ({ ...prev, amountPaid: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <TextField
            label='Amount Paid On Spot'
            fullWidth
            type='number'
            variant='outlined'
            value={paymentEditValues.amountPaidOnSopt}
            onChange={e => setPaymentEditValues(prev => ({ ...prev, amountPaidOnSopt: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentEditModal} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleUpdateAmountPaidModal} variant='contained' color='primary'>
            Update Amount Paid
          </Button>
          <Button onClick={handleUpdateAmountOnSoptModal} variant='contained' color='primary'>
            Update Amount On Spot
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this appointment? This action cannot be undone.
            {appointmentToDelete && (
              <>
                <br />
                <br />
                <strong>Appointment Details:</strong>
                <br />
                User: {appointmentToDelete?.User?.name || appointmentToDelete?.userId || 'N/A'}
                <br />
                Pet: {appointmentToDelete?.Pet?.name || appointmentToDelete?.petId || 'N/A'}
                <br />
                Date: {appointmentToDelete?.datetimeSlot ? new Date(appointmentToDelete.datetimeSlot).toLocaleString() : 'N/A'}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteAppointment} color='error' variant='contained' disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const ProtectedChatPage = () => {
  return (
    <ProtectedRoutes requiredPermission='Appointments'>
      <AppointmentPage />
    </ProtectedRoutes>
  )
}

export default ProtectedChatPage
