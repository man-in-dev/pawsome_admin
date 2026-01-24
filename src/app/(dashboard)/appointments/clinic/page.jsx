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
  TablePagination,
  TextField,
  LinearProgress,
  CardHeader,
  Button,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText
} from '@mui/material'

import { toast, ToastContainer } from 'react-toastify'

import { OtherHouses } from '@mui/icons-material'

import {
  addComment,
  addNote,
  amountPaid,
  amountPaidOnSopt,
  getAllAppointments,
  getAllAppointmentsHouse,
  getVetByClinicId,
  sendNotificationAdmin,
  updateAppointment,
  updateAppointmentStatus,
  updatePaidStatus
} from '@/app/api'
import 'react-toastify/dist/ReactToastify.css'

import ProtectedRoutes from '@/components/ProtectedRoute'

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([]) // Separate filtered list
  const [statusValues, setStatusValues] = useState({})
  const [searchQuery, setSearchQuery] = useState('') // Query state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [loading, setLoading] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [openNoteModal, setOpenNoteModal] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const [openPaymentModal, setOpenPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  const [paidStatusValues, setPaidStatusValues] = useState({})

  const [amountPaidValues, setAmountPaidValues] = useState({})
  const [amountOnSpotValues, setAmountOnSpotValues] = useState({})

  const [openPaymentEditModal, setOpenPaymentEditModal] = useState(false)
  const [selectedAppointmentForPaymentEdit, setSelectedAppointmentForPaymentEdit] = useState(null)

  const [paymentEditValues, setPaymentEditValues] = useState({
    amountPaid: '',
    amountPaidOnSopt: ''
  })

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

  // Open the Payment modal and store the payment data
  const handleOpenPaymentModal = payment => {
    setSelectedPayment(payment)
    setOpenPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false)
    setSelectedPayment(null)
  }

  // Animated Placeholder Data
  const [animateData] = useState(['Search users'])
  const [currentIndex, setCurrentIndex] = useState(0)

  const fetchAllAppointments = async () => {
    setLoading(true)
    try {
      const response = await getAllAppointments()
      const appointmentsData = response?.data?.data || []
      setAppointments(appointmentsData)
      setFilteredAppointments(appointmentsData) // Initialize filtered appointments
    } catch (error) {
      console.error('Error fetching appointments:', error)
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

  const handleSearch = event => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)

    // Filter appointments based on the user name
    const filtered = appointments.filter(appointment => appointment.User?.name.toLowerCase().includes(query))

    setFilteredAppointments(filtered)
    setPage(0) // Reset to the first page on new search
  }

  const handleStatusChange = async (id, value, ap) => {
    console.log('app', ap)
    const user = ap?.User

    if (!value) {
      toast.error('Status is required')
      return
    }

    try {
      setLoading(true)
      const payload = {
        appointmentId: id,
        status: value
      }

      // Update the appointment status
      const updateResponse = await updateAppointmentStatus(payload)

      // Send a notification
      const notificationResponse = await sendNotificationAdmin({
        title: 'Appointment Update',
        message: `Your appointment has been ${value}`,
        users: [user]
      })
      console.log('Notification response:', notificationResponse)

      // Check the update response first
      if (updateResponse?.status === 200) {
        toast.success('Appointment Updated Successfully')
        setStatusValues(prev => ({ ...prev, [id]: value }))
        fetchAllAppointments() // Refresh data
      } else {
        toast.error(updateResponse.data?.message || 'Failed to update appointment status')
      }

      // If notification call did not return a success, show an additional error (optional)
      if (notificationResponse?.status !== 200) {
        toast.error('Appointment updated but failed to send notification')
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

  useEffect(() => {
    fetchAllAppointments()
  }, [])

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
        fetchAllAppointments()

        // Close modal
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

  // New function to handle paid status change (yes/no)
  const handlePaidStatusChange = async (id, value) => {
    if (!value) {
      toast.error('Paid status is required')
      return
    }

    try {
      setLoading(true)
      const payload = {
        appointmentId: id,
        status: Boolean(value)
      }

      // Update appointment with new paid status
      const response = await updatePaidStatus(payload)
      if (response?.status === 200) {
        toast.success('Payment status updated successfully')

        fetchAllAppointments()
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

  const handleUpdateAmountPaid = async appointmentId => {
    const amount = amountPaidValues[appointmentId]
    if (amount === undefined || amount === '') {
      toast.error('Amount Paid is required')
      return
    }
    try {
      setLoading(true)
      const payload = {
        appointmentId,
        amountPaid: parseFloat(amount)
      }
      const response = await updateAmountPaid(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount Paid updated successfully')
        fetchAllAppointments()
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

  // Function to update Amount Paid On Sopt for an appointment
  const handleUpdateAmountOnSpot = async appointmentId => {
    const amount = amountOnSpotValues[appointmentId]
    if (amount === undefined || amount === '') {
      toast.error('Amount Paid On Spot is required')
      return
    }
    try {
      setLoading(true)
      const payload = {
        appointmentId,
        amountPaidOnSopt: parseFloat(amount)
      }
      const response = await updateAmountPaidOnSopt(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount Paid On Spot updated successfully')
        fetchAllAppointments()
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
  const handleClosePaymentEditModal = () => {
    setOpenPaymentEditModal(false)
    setSelectedAppointmentForPaymentEdit(null)
    setPaymentEditValues({ amountPaid: '', amountPaidOnSopt: '' })
  }
  const handleUpdateAmountPaidModal = async () => {
    const amount = paymentEditValues.amountPaid
    if (amount === '' || isNaN(amount)) {
      toast.error('Enter a valid Amount Paid')
      return
    }
    try {
      setLoading(true)
      const payload = {
        appointmentId: selectedAppointmentForPaymentEdit.id,
        amount: parseFloat(amount)
      }
      const response = await amountPaid(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount Paid updated successfully')
        fetchAllAppointments()
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
      const payload = {
        appointmentId: selectedAppointmentForPaymentEdit.id,
        amount: parseFloat(amount)
      }
      const response = await amountPaidOnSopt(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount Paid On Spot updated successfully')
        fetchAllAppointments()
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
  const handleOpenPaymentEditModal = appointment => {
    setSelectedAppointmentForPaymentEdit(appointment)
    setPaymentEditValues({
      amountPaid: appointment.AmountPaid || '',
      amountPaidOnSopt: appointment.AmountPaidOnSopt || ''
    })
    setOpenPaymentEditModal(true)
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
          avatar={<OtherHouses color='primary' fontSize='large' />} // Icon before title
          title='In-Clinic Booking'
          titleTypographyProps={{
            variant: 'h5', // Set the text size
            color: 'textPrimary', // Optional: Change text color
            fontWeight: 'bold' // Optional: Make it bold
          }}
          subheader={'View or Update Status'}
        />

        <ToastContainer position='top-right' autoClose={3000} />

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
          variant='outlined'
          fullWidth
          sx={{ marginBottom: 2 }}
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
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Pet</TableCell>
                {/* <TableCell>Type</TableCell> */}
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
                        <Typography variant='caption' sx={{ marginBottom: '4px' }}>
                          Type: {appointment?.Pet?.type}
                        </Typography>{' '}
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

                    <TableCell>
                      <Typography>{appointment.Clinic?.name || 'N/A'}</Typography>
                    </TableCell>

                    {/* <TableCell>{appointment.type}</TableCell> */}
                    <TableCell>{appointment.bookingReasons || 'N/A'}</TableCell>

                    <TableCell>
                      <Select
                        value={statusValues[appointment.id] || appointment.status}
                        onChange={e => handleStatusChange(appointment.id, e.target.value, appointment)}
                        fullWidth
                        sx={{ marginLeft: 4 }}
                      >
                        <MenuItem value='pending'>Pending</MenuItem>
                        <MenuItem value='confirmed'>Confirmed</MenuItem>
                        <MenuItem value='completed'>Completed</MenuItem>
                        <MenuItem value='cancelled'>Cancelled</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Typography>{appointment.Vet ? appointment.Vet.name : 'No Vet Assigned'}</Typography>
                    </TableCell>

                    {/* <TableCell>{appointment.Payment?.status || 'N/A'}</TableCell>
                     */}

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
                    <TableCell>{new Date(appointment.datetimeSlot).toLocaleString()}</TableCell>
                    <TableCell>
                      <Select
                        value={paidStatusValues[appointment.id] || appointment.isClinicPaid || ''}
                        onChange={e => handlePaidStatusChange(appointment.id, e.target.value)}
                        fullWidth
                        sx={{ marginLeft: 4 }}
                      >
                        <MenuItem value='true'>Yes</MenuItem>
                        <MenuItem value='false'>No</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='body2'>Amount Paid: {appointment.AmountPaid || 0}</Typography>
                        <Typography variant='body2'>Amount On Spot: {appointment.AmountPaidOnSopt || 0}</Typography>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => handleOpenPaymentEditModal(appointment)}
                          sx={{ mt: 1 }}
                        >
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
                      {/* Add Note Button */}
                      <Button variant='outlined' size='small' onClick={() => handleOpenNoteModal(appointment)}>
                        Add Comment
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align='center'>
                    No appointments available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={filteredAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

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
          {/* Separate update buttons for independent updates */}
          <Button onClick={handleUpdateAmountPaidModal} variant='contained' color='primary'>
            Update Amount Paid
          </Button>
          <Button onClick={handleUpdateAmountOnSoptModal} variant='contained' color='primary'>
            Update Amount On Spot
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
