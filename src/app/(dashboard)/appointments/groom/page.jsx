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

import { ContentCut } from '@mui/icons-material'

import 'react-toastify/dist/ReactToastify.css'
import {
  getAllGroomingAppointments,
  updateGroomingAppointment,
  deleteGroomingAppointment
} from '@/app/api'

const GroomAppointmentPage = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [statusValues, setStatusValues] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [loading, setLoading] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [openNoteModal, setOpenNoteModal] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)

  const [animateData] = useState(['Search users'])
  const [currentIndex, setCurrentIndex] = useState(0)

  const fetchAllAppointments = async () => {
    setLoading(true)
    try {
      const response = await getAllGroomingAppointments({ type: 'groom' })
      const appointmentsData = response?.data?.data || []
      setAppointments(appointmentsData)
      setFilteredAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching groom appointments:', error)
      toast.error('Error fetching appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllAppointments()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % animateData.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [animateData])

  const handleSearch = event => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)

    const filtered = appointments.filter(appointment => {
      const userName = appointment?.User?.name?.toLowerCase() || ''
      const userEmail = appointment?.User?.email?.toLowerCase() || ''
      const userPhone = appointment?.User?.phone?.toLowerCase() || ''
      const petName = appointment?.Pet?.name?.toLowerCase() || ''
      const groomName = appointment.Groomer?.name?.toLowerCase() || ''
      const appointmentId = appointment.id?.toLowerCase() || ''
      return (
        userName.includes(query) || 
        userEmail.includes(query) || 
        userPhone.includes(query) ||
        petName.includes(query) ||
        groomName.includes(query) || 
        appointmentId.includes(query)
      )
    })

    setFilteredAppointments(filtered)
    setPage(0)
  }

  const handleStatusChange = async (id, value) => {
    if (!value) {
      toast.error('Status is required')
      return
    }

    try {
      setLoading(true)
      const payload = {
        status: value,
        notes: noteValue || undefined
      }

      const response = await updateGroomingAppointment(id, payload)

      if (response?.status === 200) {
        toast.success('Appointment Updated Successfully')
        setStatusValues(prev => ({ ...prev, [id]: value }))
        fetchAllAppointments()
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

  const handleOpenNoteModal = appointment => {
    setSelectedAppointment(appointment)
    setNoteValue(appointment.notes || '')
    setOpenNoteModal(true)
  }

  const handleCloseNoteModal = () => {
    setOpenNoteModal(false)
    setSelectedAppointment(null)
    setNoteValue('')
  }

  const handleAddNote = async () => {
    if (!selectedAppointment || !noteValue.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    try {
      setLoading(true)
      const payload = {
        status: selectedAppointment.status,
        notes: noteValue.trim()
      }
      const response = await updateGroomingAppointment(selectedAppointment.id, payload)
      if (response?.status === 200 && response.data?.success) {
        toast.success('Note added successfully')
        fetchAllAppointments()
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

  const handleOpenDeleteDialog = appointment => {
    setAppointmentToDelete(appointment)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setAppointmentToDelete(null)
  }

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) {
      return
    }

    try {
      setLoading(true)
      const response = await deleteGroomingAppointment(appointmentToDelete.id)
      
      if (response?.status === 200 && response.data?.success) {
        toast.success('Appointment deleted successfully')
        fetchAllAppointments()
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
              backgroundColor: 'rgba(255, 165, 0, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'orange'
              }
            }}
            variant='indeterminate'
          />
        )}
        <CardHeader
          avatar={<ContentCut color='primary' fontSize='large' />}
          title='Groom Appointments'
          titleTypographyProps={{
            variant: 'h5',
            color: 'textPrimary',
            fontWeight: 'bold'
          }}
          subheader={'View or Update Status'}
        />

        <ToastContainer position='top-right' autoClose={3000} />

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
              {filteredAppointments.length > 0 ? (
                filteredAppointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(appointment => (
                    <TableRow
                      key={appointment.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#E0E0E0',
                          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                          cursor: 'pointer'
                        }
                      }}
                    >
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
                            {appointment?.Pet?.name || appointment.petId || 'N/A'}
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
                        <Typography
                          sx={{
                            textTransform: 'capitalize',
                            fontWeight: '500',
                            color: appointment.type === 'groom' ? 'primary.main' : 
                                   appointment.type === 'store' ? 'info.main' : 
                                   appointment.type === 'home' ? 'success.main' : 'text.secondary'
                          }}
                        >
                          {appointment.type === 'groom' ? 'Clinic Groom' : 
                           appointment.type === 'store' ? 'Clinic Groom' : 
                           appointment.type === 'home' ? 'House Groom' : 
                           appointment.type || 'N/A'}
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
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => handleOpenNoteModal(appointment)}
                        >
                          {appointment.notes ? 'View/Edit' : 'Add Note'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='contained'
                          color='error'
                          size='small'
                          onClick={() => handleOpenDeleteDialog(appointment)}
                        >
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

        <TablePagination
          component='div'
          count={filteredAppointments.length}
          rowsPerPageOptions={[5, 10, 25]}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Dialog open={openNoteModal} onClose={handleCloseNoteModal}>
          <DialogTitle>Add/Edit Note</DialogTitle>
          <DialogContent>
            <DialogContentText>Add a note for this appointment</DialogContentText>
            <TextField
              autoFocus
              margin='dense'
              label='Note'
              fullWidth
              variant='outlined'
              multiline
              rows={4}
              value={noteValue}
              onChange={e => setNoteValue(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNoteModal}>Cancel</Button>
            <Button onClick={handleAddNote} variant='contained'>
              Save
            </Button>
          </DialogActions>
        </Dialog>

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
      </Box>
    </>
  )
}

export default GroomAppointmentPage
