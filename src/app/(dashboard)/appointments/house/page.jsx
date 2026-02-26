'use client'

import React, { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  CircularProgress,
  TablePagination,
  TextField,
  LinearProgress,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Tabs,
  Tab
} from '@mui/material'

import { HouseSharp } from '@mui/icons-material'

import { toast, ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import {
  addComment,
  amountPaidVet,
  amountPaidVetSpot,
  getAllAppointmentsHouse,
  getAllVets,
  getAllGroomingAppointments,
  getAllGroomers,
  updateAppointment,
  updateAppointmentStatus,
  updateGroomingAppointment
} from '@/app/api'

const InHouseAppointmentPage = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([]) // For filtered results
  const [searchQuery, setSearchQuery] = useState('') // Search query state
  const [statusValues, setStatusValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [vets, setVets] = useState([])
  const [groomers, setGroomers] = useState([])
  const [loadingProfessionals, setLoadingProfessionals] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [comment, setComment] = useState('')

  const [openNoteModal, setOpenNoteModal] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [activeTab, setActiveTab] = useState('veterinary')

  // Animated Placeholder Data
  const [animateData] = useState(['Search users', 'Search pets'])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [openVetPaymentEditModal, setOpenVetPaymentEditModal] = useState(false)
  const [selectedAppointmentForVetPaymentEdit, setSelectedAppointmentForVetPaymentEdit] = useState(null)
  const [vetPaymentEditValues, setVetPaymentEditValues] = useState({
    amountPaidVet: '',
    amountPaidVetSpot: ''
  })
  //payment model

  const [openPaymentModal, setOpenPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  // Open the Payment modal and store the payment data
  const handleOpenPaymentModal = payment => {
    setSelectedPayment(payment)
    setOpenPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false)
    setSelectedPayment(null)
  }

  const fetchInHouseAppointments = async () => {
    setLoading(true)
    try {
      const [vetResponse, groomingResponse] = await Promise.all([
        getAllAppointmentsHouse(),
        getAllGroomingAppointments({ type: 'home' })
      ])

      const vetData = (vetResponse?.data?.data || []).map(app => ({
        ...app,
        backend: 'veterinary'
      }))

      const groomingData = (groomingResponse?.data?.data || [])
        .filter(app => app.type === 'home')
        .map(app => ({
          ...app,
          backend: 'grooming'
        }))

      const mergedData = [...vetData, ...groomingData]
        .map(app => {
          let derivedServiceType = app.backend // Default to origin backend
          if (app.Package?.serviceType) {
            derivedServiceType = app.Package.serviceType
          } else if (app.GroomingPackage) {
            derivedServiceType = 'grooming'
          }
          return { ...app, serviceType: derivedServiceType }
        })
        .sort((a, b) => new Date(b.datetimeSlot) - new Date(a.datetimeSlot))

      setAppointments(mergedData)
      setFilteredAppointments(mergedData)
    } catch (error) {
      console.error('Error fetching in-house appointments:', error)
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % animateData.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [animateData])
  const fetchAllProfessionals = async () => {
    setLoadingProfessionals(true)
    try {
      const [vetRes, groomRes] = await Promise.all([
        getAllVets(),
        getAllGroomers()
      ])
      setVets(vetRes?.data?.data || [])
      setGroomers(groomRes?.data?.data || [])
    } catch (error) {
      console.error('Error fetching professionals:', error)
    } finally {
      setLoadingProfessionals(false)
    }
  }

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = appointments.filter(appointment => {
      const matchesSearch =
        appointment.User?.name?.toLowerCase().includes(query) ||
        appointment.Pet?.name?.toLowerCase().includes(query) ||
        appointment.Address?.streetName?.toLowerCase().includes(query) ||
        appointment.User?.email?.toLowerCase().includes(query) ||
        appointment.User?.phone?.toLowerCase().includes(query)

      const matchesTab = appointment.serviceType === activeTab

      return matchesSearch && matchesTab
    })
    setFilteredAppointments(filtered)
    setPage(0)
  }, [searchQuery, activeTab, appointments])

  const handleSearch = event => {
    setSearchQuery(event.target.value)
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleProfessionalChange = async (appointment, profId) => {
    setLoading(true)
    try {
      if (appointment.serviceType === 'grooming') {
        const payload = appointment.backend === 'veterinary' ? { vetId: profId } : { groomerId: profId }
        appointment.backend === 'veterinary'
          ? await updateAppointment(appointment.id, payload)
          : await updateGroomingAppointment(appointment.id, payload)
      } else {
        await updateAppointment(appointment.id, { vetId: profId })
      }
      fetchInHouseAppointments()
      toast.success('Professional assignment updated successfully!')
    } catch (error) {
      console.error('Error updating professional assignment:', error)
      toast.error('Failed to update assignment.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appointment, value) => {
    const id = appointment.id
    if (!value) {
      toast.error('Status is required')
      return
    }
    const payload = {
      appointmentId: id,
      status: value
    }
    setLoading(true)
    try {
      const response = appointment?.backend === 'grooming'
        ? await updateGroomingAppointment(id, payload)
        : await updateAppointmentStatus(payload)

      if (response?.status === 200 && (response.data?.success || response.status === 200)) {
        toast.success('Appointment status updated successfully')
        setStatusValues(prev => ({ ...prev, [id]: value }))
        fetchInHouseAppointments()
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

  useEffect(() => {
    fetchInHouseAppointments()
    fetchAllProfessionals()
  }, [])

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // --- Vet Payment Edit Modal Handlers ---
  const handleOpenVetPaymentEditModal = appointment => {
    setSelectedAppointmentForVetPaymentEdit(appointment)
    setVetPaymentEditValues({
      amountPaid: appointment.serviceType === 'grooming' ? appointment.AmountPaid || '' : appointment.AmountPaidToVet || '',
      amountPaidSpot: appointment.serviceType === 'grooming' ? appointment.AmountPaidOnSpot || '' : appointment.AmountPaidOnSoptVet || ''
    })
    setOpenVetPaymentEditModal(true)
  }
  const handleCloseVetPaymentEditModal = () => {
    setOpenVetPaymentEditModal(false)
    setSelectedAppointmentForVetPaymentEdit(null)
    setVetPaymentEditValues({ amountPaid: '', amountPaidSpot: '' })
  }

  // Update Amount Paid independently
  const handleUpdateAmountPaidModal = async () => {
    const amount = vetPaymentEditValues.amountPaid
    if (amount === '' || isNaN(amount)) {
      toast.error('Enter a valid amount')
      return
    }
    try {
      setLoading(true)
      const payload = {
        appointmentId: selectedAppointmentForVetPaymentEdit.id,
        amount: Number(amount)
      }

      let response
      if (selectedAppointmentForVetPaymentEdit.serviceType === 'grooming') {
        response = await updateGroomingAppointment(selectedAppointmentForVetPaymentEdit.id, { AmountPaid: Number(amount) })
      } else {
        response = await amountPaidVet(payload)
      }

      if (response?.status === 200 && (response.data?.success || response.status === 200)) {
        toast.success('Amount Paid updated successfully')
        fetchInHouseAppointments()
        handleCloseVetPaymentEditModal()
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

  // Update Amount On Spot Paid independently
  const handleUpdateAmountSpotModal = async () => {
    const amount = vetPaymentEditValues.amountPaidSpot
    if (amount === '' || isNaN(amount)) {
      toast.error('Enter a valid amount on spot')
      return
    }
    try {
      setLoading(true)
      const payload = {
        appointmentId: selectedAppointmentForVetPaymentEdit.id,
        amount: Number(amount)
      }

      let response
      if (selectedAppointmentForVetPaymentEdit.serviceType === 'grooming') {
        response = await updateGroomingAppointment(selectedAppointmentForVetPaymentEdit.id, { AmountPaidOnSpot: Number(amount) })
      } else {
        response = await amountPaidVetSpot(payload)
      }

      if (response?.status === 200 && (response.data?.success || response.status === 200)) {
        toast.success('Amount On Spot Paid updated successfully')
        fetchInHouseAppointments()
        handleCloseVetPaymentEditModal()
      } else {
        toast.error(response?.data?.message || 'Failed to update Amount On Spot Paid')
      }
    } catch (error) {
      console.error('Error updating Amount On Spot Paid:', error)
      toast.error('An error occurred while updating Amount On Spot Paid')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!selectedAppointment || !noteValue.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    try {
      setLoading(true)
      const payload = {
        id: selectedAppointment.id,
        note: noteValue.trim()
      }
      const response = await addComment(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Note added successfully')

        // Optionally refetch or update local state to show new note

        // Close modal
        handleCloseNoteModal()
        fetchInHouseAppointments()
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

  // Open the modal, store the current appointment ID, and reset note
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

  return (
    <>
      <Box sx={{ padding: 2 }}>
        {loading && (
          <LinearProgress
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1200,
              backgroundColor: 'rgba(255, 165, 0, 0.2)', // Light orange for the track
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'orange' // Orange for the progress bar
              }
            }}
            variant='indeterminate'
          />
        )}
        <CardHeader
          avatar={<HouseSharp color='primary' fontSize='large' />} // Icon before title
          title='In-House Bookings'
          titleTypographyProps={{
            variant: 'h5', // Set the text size
            color: 'textPrimary', // Optional: Change text color
            fontWeight: 'bold' // Optional: Make it bold
          }}
          subheader={'View or Edit Status'}
        />

        <ToastContainer position='top-right' autoClose={3000} />

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: 2 }} indicatorColor='primary' textColor='primary'>
          <Tab label='Vet In-house' value='veterinary' />
          <Tab label='Groom In-house' value='grooming' />
        </Tabs>

        {/* Search Bar */}
        <TextField
          onClick={() => {
            setClicked(true)
          }}
          onBlur={() => {
            setClicked(false)
          }}
          value={searchQuery}
          onChange={handleSearch}
          placeholder=''
          InputProps={{
            startAdornment: (
              <>
                {!clicked ? (
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      width: '200px'
                    }}
                  >
                    <AnimatePresence>
                      <motion.div
                        key={animateData[currentIndex]}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 0, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 120,
                          damping: 14
                        }}
                        style={{
                          fontSize: '16px',
                          color: 'rgba(0, 0, 0, 0.6)',
                          position: 'absolute',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {animateData[currentIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </Box>
                ) : null}
              </>
            )
          }}
          variant='outlined'
          fullWidth
          sx={{ marginBottom: 2 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Pet</TableCell>
                {/* <TableCell>Type</TableCell> */}
                <TableCell>Booking Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Package</TableCell>
                <TableCell>Assigned Professional</TableCell>
                <TableCell>Assign Professional</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Datetime Slot</TableCell>
                <TableCell>{activeTab === 'grooming' ? 'Amount paid to Groomer' : 'Amount paid to Vet'}</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Action</TableCell>
                {/* <TableCell>Notes</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(appointment => (
                  <TableRow
                    sx={{
                      backgroundColor: '#E0E0E0,',
                      '&:hover': {
                        backgroundColor: '#E0E0E0', // Hover effect
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow effect
                        cursor: 'pointer',
                        '& td': {
                          transform: 'scale(0.95)', // Zoom-out effect
                          transition: 'transform 0.3s ease'
                        }
                      }
                    }}
                    key={appointment.id}
                  >
                    <TableCell>
                      <Box>
                        <Typography>{appointment?.User?.name}</Typography>
                        <Typography display='block' variant='caption'>
                          {appointment?.User?.email}
                        </Typography>
                        <Typography display='block' variant='caption'>
                          {appointment?.User?.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography>{appointment.Pet?.name}</Typography>
                        <Typography variant='caption' sx={{ marginBottom: '4px' }}>
                          Type: {appointment?.Pet?.type}
                        </Typography>
                        <br />
                        <Typography variant='caption' sx={{ marginBottom: '4px' }}>
                          Breed: {appointment?.Pet?.breed}
                        </Typography>
                        <br />
                        <Typography variant='caption' sx={{ marginBottom: '4px' }}>
                          gender: {appointment?.Pet?.gender}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* <TableCell>{appointment?.type}</TableCell> */}
                    <TableCell>{appointment?.bookingReasons || 'N/A'}</TableCell>
                    <TableCell>
                      <Select
                        value={statusValues[appointment.id] || appointment.status}
                        onChange={e => handleStatusChange(appointment, e.target.value)}
                        sx={{ paddingRight: '15px !important' }}
                      >
                        <MenuItem value='pending'>Pending</MenuItem>
                        <MenuItem value='confirmed'>Confirmed</MenuItem>
                        <MenuItem value='completed'>Completed</MenuItem>
                        <MenuItem value='cancelled'>Cancelled</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {appointment?.Package ? (
                        <Box>
                          <Typography>{appointment?.Package?.name}</Typography>
                          <Typography variant='caption'>Price: {appointment?.Package?.regularPrice}</Typography>
                        </Box>
                      ) : appointment?.GroomingPackage ? (
                        <Box>
                          <Typography>{appointment?.GroomingPackage?.name}</Typography>
                          <Typography variant='caption'>Price: {appointment?.GroomingPackage?.regularPrice}</Typography>
                        </Box>
                      ) : (
                        'No Package'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {appointment.serviceType === 'grooming'
                          ? appointment.Groomer
                            ? appointment.Groomer.name
                            : groomers.find(g => g.id === (appointment.groomerId || appointment.vetId))?.name || 'No Groomer Assigned'
                          : appointment.Vet
                            ? appointment.Vet.name
                            : vets.find(v => v.id === appointment.vetId)?.name || 'No Vet Assigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {loadingProfessionals ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Select
                          sx={{ paddingRight: '15px !important' }}
                          value={
                            appointment.serviceType === 'grooming'
                              ? appointment.groomerId || ''
                              : appointment.vetId || ''
                          }
                          onChange={e => handleProfessionalChange(appointment, e.target.value)}
                        >
                          {appointment.serviceType === 'grooming' ? (
                            groomers.length > 0 ? (
                              groomers.map(groomer => (
                                <MenuItem key={groomer.id} value={groomer.id}>
                                  {groomer.name}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem value=''>No Groomers Available</MenuItem>
                            )
                          ) : vets.length > 0 ? (
                            vets.map(vet => (
                              <MenuItem key={vet.id} value={vet.id}>
                                {vet.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value=''>No Vets Available</MenuItem>
                          )}
                        </Select>
                      )}
                    </TableCell>
                    {/* <TableCell>{appointment.Payment?.status || 'No Payment'}</TableCell> */}

                    <TableCell>
                      {appointment.Payment ? (
                        <Button
                          variant='text'
                          color='primary'
                          onClick={() => handleOpenPaymentModal(appointment.Payment)}
                        >
                          {appointment.Payment.status}
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {appointment.Address ? (
                        <Box>
                          <Typography>{appointment.Address.streetName}</Typography>
                          <Typography variant='caption'>Landmark: {appointment.Address.landmark}</Typography>
                        </Box>
                      ) : (
                        'No Address'
                      )}
                    </TableCell>
                    <TableCell>{new Date(appointment.datetimeSlot).toLocaleString()}</TableCell>
                    {/* <TableCell>{appointment.notes || 'No Notes'}</TableCell> */}

                    <TableCell>
                      <Box>
                        {appointment.serviceType === 'grooming' ? (
                          <>
                            <Typography variant='body2'>
                              Amount Paid: {appointment.AmountPaid || 0}
                            </Typography>
                            <Typography variant='body2'>
                              Amount On Spot Paid: {appointment.AmountPaidOnSpot || 0}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant='body2'>Amount Paid Vet: {appointment.AmountPaidToVet || 0}</Typography>
                            <Typography variant='body2'>
                              Amount On Spot Paid Vet: {appointment.AmountPaidOnSoptVet || 0}
                            </Typography>
                          </>
                        )}
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => handleOpenVetPaymentEditModal(appointment)}
                          sx={{ mt: 1 }}
                        >
                          Edit {appointment.serviceType === 'grooming' ? 'Groomer' : 'Vet'} Payment
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>{appointment.Comment || 'n/a'}</TableCell>
                    <TableCell>
                      {/* Add Note Button */}
                      <Button variant='outlined' size='small' onClick={() => handleOpenNoteModal(appointment)}>
                        Add Comment
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align='center'>
                    No in-house appointments available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer >

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={filteredAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box >

      <Dialog open={openPaymentModal} onClose={handleClosePaymentModal} maxWidth='sm' fullWidth>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent dividers>
          {selectedPayment ? (
            <Box sx={{ '& > *': { marginBottom: 1 } }}>
              {/* <Typography variant='body1'>
                <strong>ID:</strong> {selectedPayment.id}
              </Typography> */}
              {/* <Typography variant='body1'>
                <strong>User ID:</strong> {selectedPayment.userId}
              </Typography> */}
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
                <strong>MRP Discount:</strong> {selectedPayment.mrpDiscount}
              </Typography>
              <Typography variant='body1'>
                <strong>Subscription Discount:</strong> {selectedPayment.subscriptionDiscount}
              </Typography>
              <Typography variant='body1'>
                <strong>Coupon Discount:</strong> {selectedPayment.couponDiscount || 0}
              </Typography>
              <Typography variant='body1'>
                <strong>Paw Points Discount:</strong> {selectedPayment.pawPointsDiscount}
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
              {/* If you need to display the nested notes object in detail */}
              {/* {selectedPayment.notes && (
                <>
                  <Typography variant='body1'>
                    <strong>Notes:</strong>
                  </Typography>
                  {Object.entries(selectedPayment.notes).map(([key, value]) => (
                    <Typography key={key} variant='body2' sx={{ ml: 2 }}>
                      <strong>{key}:</strong> {value !== null ? value.toString() : 'N/A'}
                    </Typography>
                  ))}
                </>
              )} */}
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

      <Dialog open={openVetPaymentEditModal} onClose={handleCloseVetPaymentEditModal} maxWidth='sm' fullWidth>
        <DialogTitle>Edit {selectedAppointmentForVetPaymentEdit?.serviceType === 'grooming' ? 'Groomer' : 'Vet'} Payment Amounts</DialogTitle>
        <DialogContent>
          <TextField
            label={selectedAppointmentForVetPaymentEdit?.serviceType === 'grooming' ? 'Amount Paid Groomer' : 'Amount Paid Vet'}
            fullWidth
            type='number'
            variant='outlined'
            value={vetPaymentEditValues.amountPaid}
            onChange={e => setVetPaymentEditValues(prev => ({ ...prev, amountPaid: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <TextField
            label={selectedAppointmentForVetPaymentEdit?.serviceType === 'grooming' ? 'Amount On Spot Paid Groomer' : 'Amount On Spot Paid Vet'}
            fullWidth
            type='number'
            variant='outlined'
            value={vetPaymentEditValues.amountPaidSpot}
            onChange={e => setVetPaymentEditValues(prev => ({ ...prev, amountPaidSpot: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVetPaymentEditModal} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleUpdateAmountPaidModal} variant='contained' color='primary'>
            Update Amount Paid
          </Button>
          <Button onClick={handleUpdateAmountSpotModal} variant='contained' color='primary'>
            Update Amount On Spot
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNoteModal} onClose={handleCloseNoteModal} maxWidth='sm' fullWidth>
        <DialogTitle>Add Note</DialogTitle>
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
          <Button onClick={handleAddNote} variant='contained' color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InHouseAppointmentPage
