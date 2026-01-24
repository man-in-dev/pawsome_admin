'use client'

import React, { useEffect, useState } from 'react'

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Button,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  CardHeader,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import AddIcon from '@mui/icons-material/Add'

import { DeliveryDiningOutlined, Warning } from '@mui/icons-material'

import ProtectedRoutes from '@/components/ProtectedRoute'

import {
  createDeliveryDetails,
  createDisease,
  deleteDeliveryDetails,
  deleteDisease,
  getAllDisease,
  getDeliveryDetails,
  updateDeliveryDetails,
  updateDisease
} from '@/app/api'

const DeliveryPage = () => {
  const [diseases, setDiseases] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDisease, setEditingDisease] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [validationErrors, setValidationErrors] = useState({ name: '', deliveryTypes: '' })
  const [userRole, setUserRole] = useState('')
  const [deliveryDetails, setDeliveryDetails] = useState([])




  const deliveryAmountMapping = {
    standard: 39,
    express120Min: 99,
    express1Day: 79,
    inStorePickup: 0
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

  const fetchDelivery = async () => {
    setLoading(true)
    try {
      const response = await getDeliveryDetails()
      if (response.status === 200) {
        console.log('del', response)
        setDeliveryDetails(response.data.data)
      }
    } catch (error) {
      toast.error('An error occurred while fetching delivery details.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch diseases from API
  const fetchAllDiseases = async () => {
    setLoading(true)
    try {
      const response = await getAllDisease()
      if (response.status === 200) {
        setDiseases(response.data.data)
      } else {
      }
    } catch (error) {
      toast.error('An error occurred while fetching diseases.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllDiseases()
    fetchDelivery()
  }, [])

  // Open the modal for adding or editing
  const handleOpenModal = (disease = null) => {
    console.log('data', disease)
    setEditingDisease(disease || { pinCode: '', deliveryTypes: '' })
    setIsAdding(!disease)
    setModalOpen(true)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingDisease(null)
    setIsAdding(false)
    setValidationErrors({ name: '', type: '' })
  }

  const handleSave = async () => {
    const errors = {}

    // Validate Name
    // if (!editingDisease?.name?.trim()) {
    //   errors.name = 'Name is required'
    // }

    // // Validate Type
    // if (!editingDisease?.type?.trim()) {
    //   errors.type = 'Type is required'
    // }

    // If there are validation errors, set them and return early
    // if (Object.keys(errors).length > 0) {
    //   setValidationErrors(errors)
    //   return
    // }
    setLoading(true)
    try {
      if (isAdding) {
        // Add new disease
        const payload = {
          pinCode: editingDisease.pinCode,
          deliveryTypes: editingDisease.deliveryTypes
        }
        const response = await createDeliveryDetails(payload)
        if (response.status === 200) {
          fetchDelivery()
          toast.success('Delivery added successfully!')
        } else {
          toast.error('Failed to add delivery.')
        }
      } else {
        // Edit existing disease
        const payload = {
          id: editingDisease.id,
          pinCode: editingDisease.pinCode,
          deliveryTypes: editingDisease.deliveryTypes
        }
        await updateDeliveryDetails(payload)
        fetchDelivery()
        toast.success('Delivery Details updated successfully!')
      }
      handleCloseModal()
    } catch (error) {
      toast.error('An error occurred while saving the Delivery Details.')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete action with confirmation
  const handleDelete = id => {
    setDeleteId(id)
    setConfirmDelete(true)
  }

  const confirmDeleteDisease = async () => {
    setLoading(true)
    const payload = {
      id: deleteId
    }
    try {
      await deleteDeliveryDetails(payload)
      fetchDelivery()
      toast.success('Delivery Details deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete Delivery Details.')
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  //   const types = ['Standard', 'Express-120 min', 'Express-1 day', 'Express-2 day']

  const types = [
    { label: 'STANDARD', value: 'standard' },
    { label: 'EXPRESS-120 MIN', value: 'express120Min' },
    { label: 'EXPRESS-1 DAY', value: 'express1Day' },

    { label: 'In-Store Pickup', value: 'inStorePickup' }
  ]

  return (
    <Box sx={{ padding: 4 }}>
      <ToastContainer />
      {loading && <LinearProgress />}
      <CardHeader
        avatar={<DeliveryDiningOutlined color='primary' fontSize='large' />} // Icon before title
        title='Delivery Management'
        titleTypographyProps={{
          variant: 'h5', // Set the text size
          color: 'textPrimary', // Optional: Change text color
          fontWeight: 'bold' // Optional: Make it bold
        }}
        subheader={'Add or Edit Delivery Options'}
      />
      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 2 }}>
        <Button
          variant='contained'
          sx={{ backgroundColor: '#ffA500' }}
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Add Delivery Details
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pin Code</TableCell>
              <TableCell>Delivery Type</TableCell>
              <TableCell>Delivery Charges</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diseases.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={3} align='center'>
                  No data
                </TableCell>
              </TableRow>
            ) : (
              deliveryDetails?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(disease => (
                <TableRow key={disease.id}>
                  <TableCell>{disease.pinCode}</TableCell>
                  <TableCell>
                    {disease?.deliveryTypes?.map((type, index) => (
                      <Chip key={index} label={type} sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    {disease?.deliveryTypes?.map((type, index) => {
                      const typeData = types.find(option => option.value === type)
                      const amount = deliveryAmountMapping[type]
                      return <Chip key={index} label={`${typeData?.label || type}: ${amount}`} sx={{ mr: 0.5 }} />
                    })}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => handleOpenModal(disease)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => handleDelete(disease.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={diseases.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Modal */}
      {/* <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24
          }}
        >
          <Typography variant='h6' gutterBottom>
            {isAdding ? 'Add Disease' : 'Edit Disease'}
          </Typography>
          <TextField
            fullWidth
            label='Name'
            value={editingDisease?.name || ''}
            // onChange={e => setEditingDisease(prev => ({ ...prev, name: e.target.value }))}
            onChange={e => {
              setEditingDisease(prev => ({ ...prev, name: e.target.value }))
              setValidationErrors(prev => ({ ...prev, name: '' })) // Clear error on change
            }}
            sx={{ mb: 2 }}
            error={!!validationErrors.name} // Highlight the input field in red if there's an error
            helperText={validationErrors.name}
          />
          <TextField
            fullWidth
            label='Type'
            value={editingDisease?.type || ''}
            // onChange={e => setEditingDisease(prev => ({ ...prev, type: e.target.value }))}
            onChange={e => {
              setEditingDisease(prev => ({ ...prev, type: e.target.value }))
              setValidationErrors(prev => ({ ...prev, type: '' })) // Clear error on change
            }}
            sx={{ mb: 2 }}
            error={!!validationErrors.type} // Highlight the input field in red if there's an error
            helperText={validationErrors.type}
          />
          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <Button onClick={handleCloseModal} color='secondary'>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal> */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24
          }}
        >
          <Typography variant='h6' gutterBottom>
            {isAdding ? 'Add Delivery' : 'Edit Delivery'}
          </Typography>
          <TextField
            fullWidth
            label='Pin Code'
            value={editingDisease?.pinCode || ''}
            onChange={e => {
              setEditingDisease(prev => ({ ...prev, pinCode: e.target.value }))
              setValidationErrors(prev => ({ ...prev, name: '' }))
            }}
            sx={{ mb: 2 }}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
          <FormControl fullWidth sx={{ mb: 2 }} error={!!validationErrors.deliveryTypes}>
            <InputLabel id='delivery-type-label'>Delivery Type</InputLabel>
            <Select
              labelId='delivery-type-label'
              multiple
              value={editingDisease?.deliveryTypes || []}
              label='Delivery Type'
              onChange={e => {
                setEditingDisease(prev => ({ ...prev, deliveryTypes: e.target.value }))
                setValidationErrors(prev => ({ ...prev, deliveryTypes: '' }))
              }}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => (
                    <Chip key={value} label={types.find(t => t.value === value)?.label || value} />
                  ))}
                </Box>
              )}
            >
              {types?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {Array.isArray(editingDisease?.deliveryTypes) &&
            editingDisease.deliveryTypes.map(deliveryType => {
              const amount = deliveryAmountMapping[deliveryType]
              if (amount) {
                const typeLabel = types.find(option => option.value === deliveryType)?.label || deliveryType
                return (
                  <Typography key={deliveryType} variant='body2' sx={{ mt: 1 }}>
                    {typeLabel} Delivery Charge: {amount}
                  </Typography>
                )
              }
              return null
            })}
          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <Button onClick={handleCloseModal} color='secondary'>
              Cancel
            </Button>
            <Button
              disabled={editingDisease?.pinCode?.length > 0 ? false : true}
              variant='contained'
              onClick={handleSave}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this disease?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteDisease} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// export default DiseaseList

const ProtectedChatPage = () => {
  return (
    <ProtectedRoutes requiredPermission='shop'>
      <DeliveryPage />
    </ProtectedRoutes>
  )
}

export default ProtectedChatPage
