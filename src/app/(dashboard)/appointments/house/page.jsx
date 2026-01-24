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
  DialogContentText
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
  updateAppointment,
  updateAppointmentStatus
} from '@/app/api'

const InHouseAppointmentPage = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([]) // For filtered results
  const [searchQuery, setSearchQuery] = useState('') // Search query state
  const [statusValues, setStatusValues] = useState({})
  const [vets, setVets] = useState([])
  const [loadingVets, setLoadingVets] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [comment, setComment] = useState('')

  const [openNoteModal, setOpenNoteModal] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

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
      const response = await getAllAppointmentsHouse()
      const appointmentData = response?.data?.data || []
      setAppointments(appointmentData)
      setFilteredAppointments(appointmentData) // Initialize filtered appointments
    } catch (error) {
      console.error('Error fetching in-house appointments:', error)
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
  const fetchAllVets = async () => {
    setLoadingVets(true)
    try {
      const response = await getAllVets()
      setVets(response?.data?.data || [])
    } catch (error) {
      console.error('Error fetching vets:', error)
    } finally {
      setLoadingVets(false)
    }
  }

  const handleSearch = event => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)

    const filtered = appointments.filter(
      appointment =>
        appointment.User.name.toLowerCase().includes(query) || // Search by user name
        appointment.Pet.name.toLowerCase().includes(query) || // Search by pet name
        appointment.Address?.streetName.toLowerCase().includes(query) // Search by address
    )
    setFilteredAppointments(filtered)
    setPage(0) // Reset to first page after search
  }

  const handleVetChange = async (appointmentId, vetId) => {
    setLoading(true)
    try {
      await updateAppointment(appointmentId, { vetId })
      fetchInHouseAppointments()
      toast.success('Vet assignment updated successfully!')
    } catch (error) {
      console.error('Error updating vet assignment:', error)
      toast.error('Failed to update vet assignment.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, value) => {
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
      const response = await updateAppointmentStatus(payload)
      if (response?.status === 200 && response.data?.success) {
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
    fetchAllVets()
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
      amountPaidVet: appointment.AmountPaidVet || '',
      amountPaidVetSpot: appointment.AmountPaidVetSpot || ''
    })
    setOpenVetPaymentEditModal(true)
  }
  const handleCloseVetPaymentEditModal = () => {
    setOpenVetPaymentEditModal(false)
    setSelectedAppointmentForVetPaymentEdit(null)
    setVetPaymentEditValues({ amountPaidVet: '', amountPaidVetSpot: '' })
  }

  // Update Amount Paid Vet independently
  const handleUpdateAmountPaidVetModal = async () => {
    const amount = vetPaymentEditValues.amountPaidVet
    if (amount === '' || isNaN(amount)) {
      toast.error('Enter a valid Amount Paid Vet')
      return
    }
    try {
      setLoading(true)
      const payload = {
        appointmentId: selectedAppointmentForVetPaymentEdit.id,
        amount: Number(amount)
      }
      const response = await amountPaidVet(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount Paid Vet updated successfully')
        fetchInHouseAppointments()
      } else {
        toast.error(response?.data?.message || 'Failed to update Amount Paid Vet')
      }
    } catch (error) {
      console.error('Error updating Amount Paid Vet:', error)
      toast.error('An error occurred while updating Amount Paid Vet')
    } finally {
      setLoading(false)
    }
  }

  // Update Amount On Sopt Paid Vet independently
  const handleUpdateAmountVetSpotModal = async () => {
    const amount = vetPaymentEditValues.amountPaidVetSpot
    if (amount === '' || isNaN(amount)) {
      toast.error('Enter a valid Amount On Spot Paid Vet')
      return
    }
    try {
      setLoading(true)
      const payload = {
        appointmentId: selectedAppointmentForVetPaymentEdit.id,
        amount: Number(amount)
      }
      const response = await amountPaidVetSpot(payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Amount On Spot Paid Vet updated successfully')
        fetchInHouseAppointments()
      } else {
        toast.error(response?.data?.message || 'Failed to update Amount On Spot Paid Vet')
      }
    } catch (error) {
      console.error('Error updating Amount On Spot Paid Vet:', error)
      toast.error('An error occurred while updating Amount On Spot Paid Vet')
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
                <TableCell>Assigned Vet</TableCell>
                <TableCell>Assign Vet</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Datetime Slot</TableCell>
                <TableCell>Amount paid to Vet</TableCell>
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
                        onChange={e => handleStatusChange(appointment.id, e.target.value)}
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
                      ) : (
                        'No Package'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography>{appointment.Vet ? appointment.Vet.name : 'No Vet Assigned'}</Typography>
                    </TableCell>
                    <TableCell>
                      {loadingVets ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Select
                          sx={{ paddingRight: '15px !important' }}
                          value={appointment.vetId || ''}
                          onChange={e => handleVetChange(appointment.id, e.target.value)}
                        >
                          {vets.length > 0 ? (
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
                        <Typography variant='body2'>Amount Paid Vet: {appointment.AmountPaidVet || 0}</Typography>
                        <Typography variant='body2'>
                          Amount On Spot Paid Vet: {appointment.AmountPaidVetSpot || 0}
                        </Typography>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => handleOpenVetPaymentEditModal(appointment)}
                          sx={{ mt: 1 }}
                        >
                          Edit Vet Payment
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
        <DialogTitle>Edit Vet Payment Amounts</DialogTitle>
        <DialogContent>
          <TextField
            label='Amount Paid Vet'
            fullWidth
            type='number'
            variant='outlined'
            value={vetPaymentEditValues.amountPaidVet}
            onChange={e => setVetPaymentEditValues(prev => ({ ...prev, amountPaidVet: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <TextField
            label='Amount On Spot Paid Vet'
            fullWidth
            type='number'
            variant='outlined'
            value={vetPaymentEditValues.amountPaidVetSpot}
            onChange={e => setVetPaymentEditValues(prev => ({ ...prev, amountPaidVetSpot: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVetPaymentEditModal} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleUpdateAmountPaidVetModal} variant='contained' color='primary'>
            Update Amount Paid Vet
          </Button>
          <Button onClick={handleUpdateAmountVetSpotModal} variant='contained' color='primary'>
            Update Amount On Spot Paid Vet
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
