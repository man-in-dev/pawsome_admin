import React, { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'

import PetsIcon from '@mui/icons-material/Pets'

import Countup from 'react-countup'

import { AnimatePresence, motion } from 'framer-motion'

import PersonIcon from '@mui/icons-material/Person'

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

import {
  Box,
  Card,
  CardHeader,
  TablePagination,
  Avatar,
  Button,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Checkbox,
  ListItemAvatar,
  Chip,
  Divider
} from '@mui/material'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table'

EditIcon
import { IconButton } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import CloseIcon from '@mui/icons-material/Close'

import { ToastContainer, toast } from 'react-toastify'

import { Group, PersonPinCircleOutlined } from '@mui/icons-material'

import ProtectedRoutes from '@/components/ProtectedRoute'

import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import TablePaginationComponent from '@components/TablePaginationComponent'

import { getusers, blockUser, unblockUser, updatePawPoints, updateAppUser, uploadImage, deleteUser } from '@/app/api'

import 'react-toastify/dist/ReactToastify.css'

const UserListTable = () => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPets, setSelectedPets] = useState([])
  const [pawEdit, setPawEdit] = useState(false)
  const [editingPawPoints, setEditingPawPoints] = useState(null)
  const [openReferredModal, setOpenReferredModal] = useState(false)
  const [referredUsernames, setReferredUsernames] = useState([])
  const [clicked, setClicked] = useState(false)
  const [openBlockMoadal, setOpenBlockModal] = useState(false)
  const [blockModal, setBlockModal] = useState(false)
  const [alreadyBlockedModules, setAlreadyBlockedModules] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // Add near your other useState declarations
  const [pawPointsFilter, setPawPointsFilter] = useState({ min: '', max: '' })

  // Animated Placeholder Data
  const [animateData] = useState(['Search users', 'Search content', 'Search posts'])
  const [currentIndex, setCurrentIndex] = useState(0)

  const [editingUser, setEditingUser] = useState(null) // Store the user being edited
  const [pawPointsValue, setPawPointsValue] = useState('') // PawPoints value
  const [openPawPointsModal, setOpenPawPointsModal] = useState(false) // Modal state
  const [userRole, setUserRole] = useState('') //for allowing users to edit or delete

  const [tableSortingState, setTableSortingState] = useState([])

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [editUserForm, setEditUserForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    gender: '',
    pawPoints: 0,
    profilePicture: '',
    addresses: []
  })
  const [selectedProfileFile, setSelectedProfileFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('') // For local image preview

  useEffect(() => {
    const userRole = localStorage.getItem('user')
    if (userRole) {
      const parsedData = JSON.parse(userRole)
      setUserRole(parsedData.role)
    } else {
      setUserRole('')
    }
  }, [])

  // Function to open the modal and prefill PawPoints
  const handleOpenPawPointsModal = user => {
    console.log('open', user)
    setEditingUser(user)
    setPawPointsValue(user.pawPoints || '') // Prefill the current PawPoints value
    setOpenPawPointsModal(true)
  }

  // Function to close the modal
  const handleClosePawPointsModal = () => {
    setEditingUser(null)
    setPawPointsValue('')
    setOpenPawPointsModal(false)
  }

  // Function to handle PawPoints update
  const handleUpdatePawPoints = async () => {
    if (!editingUser) return

    const payload = { pawPoints: pawPointsValue }

    try {
      const response = await updatePawPoints(editingUser.id, payload)
      if (response.status === 200) {
        toast.success('PawPoints updated successfully')
        fetchAllUsers() // Refresh the data
        handleClosePawPointsModal()
      }
    } catch (error) {
      toast.error('Failed to update PawPoints')
    }
  }

  const handleBlockDialogOpen = data => {
    setBlockModal(true)
    try {
      console.log('block', data)
      if (data) {
        setAlreadyBlockedModules(data?.blocked)
        setSelectedUserId(data.id)
      }
    } catch (error) {
      setAlreadyBlockedModules([])
    }
  }

  const fetchAllUsers = async () => {
    setLoading(true)
    try {
      const response = await getusers()
      if (response?.data?.data) {
        // console.log('apppp', response.data.data.Appointments)
        setData(response?.data?.data)
      }
    } catch (error) {
      toast.error('Failed to fetch users')
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

  const handleOpenDialog = (user, blocking) => {
    setSelectedUser(user)
    setIsBlocking(blocking)
    setOpenDialog(true)
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedUser(null)
    setIsBlocking(false)
  }
  const handleOpenPetDialog = pets => {
    setSelectedPets(pets)
    setOpenPetDialog(true)
  }
  const handleEditPawPoints = user => {
    setEditingPawPoints(user.id)
  }

  const handleClosePetDialog = () => {
    setOpenPetDialog(false)
    setSelectedPets([])
  }
  const handleToggleBlockConfirm = async () => {
    const payload = { module: 'ALL' }
    try {
      if (isBlocking) {
        const response = await blockUser(selectedUser.id, payload)
        if (response.data.success) {
          toast.success(`User blocked for the whole app`)
          setData(prevData => prevData.map(u => (u.id === selectedUser.id ? { ...u, blocked: ['ALL'] } : u)))
        }
      } else {
        const response = await unblockUser(selectedUser.id, payload)
        if (response) {
          toast.success(`User unblocked`)
          fetchAllUsers()
        }
      }
    } catch (error) {
      toast.error('Failed to toggle block status')
    }
    handleCloseDialog()
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])
  const globalFilterFn = (row, _, filterValue) => {
    const { name, email, phone } = row.original || {}
    const searchTerm = filterValue.toLowerCase() // Convert filterValue to lowercase for case-insensitive search

    // Safely check if the fields exist and convert them to lowercase if they do, otherwise use an empty string
    return (
      (name ? name.toLowerCase() : '').includes(searchTerm) ||
      (email ? email.toLowerCase() : '').includes(searchTerm) ||
      (phone ? phone.toLowerCase() : '').includes(searchTerm)
    )
  }

  const handleToggleBlock = async user => {
    const payload = { module: 'ALL' }
    try {
      if (user.blocked.length > 0) {
        const response = await unblockUser(user.id, payload)
        if (response) {
          toast.success(`User unblocked`)
          fetchAllUsers()
        }
      } else {
        const response = await blockUser(user.id, payload)
        if (response.data.success) {
          toast.success(`User blocked for the whole app`)
          setData(prevData => prevData.map(u => (u.id === user.id ? { ...u, blocked: ['ALL'] } : u)))
        }
      }
    } catch (error) {
      toast.error('Failed to toggle block status')
    }
  }

  const truncateText = (text, maxLength = 20) => {
    if (!text) return 'N/A'
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const handleClick = value => {
    console.log('got', value)
    setPawEdit(true)
    return
  }
  const handlePawPointsChange = async (userId, value) => {
    const user = data?.find(user => user.id === userId)
    if (!user || Number(user.pawPoints) === Number(value)) {
      setEditingPawPoints(null)
      return
    }
    console.log('to', userId, value)
    const payload = {
      pawPoints: value
    }
    try {
      const response = await updatePawPoints(userId, payload)

      // setData(prevData => prevData.map(user => (user.id === userId ? { ...user, pawPoints: value } : user)))
      if (response.status == 200) {
        fetchAllUsers()
        toast.success('PawPoints updated successfully')
        setEditingPawPoints(null)
      }
    } catch (error) {
      toast.error('Failed to update PawPoints')
    }
  }
  const getRowStyle = index => ({
    backgroundColor: index % 2 === 0 ? '#f3f3f3' : '#ffffff', // Alternating row color
    '&:hover': {
      backgroundColor: '#d9e9f7' // Hover color
    }
  })
  const handleOpenReferredModal = users => {
    console.log('opned')
    const usernames = users.map(user => user.name || user.email || 'N/A')
    setReferredUsernames(usernames)
    setOpenReferredModal(true)
  }

  const handleCloseReferredModal = () => {
    setOpenReferredModal(false)
    setReferredUsernames([])
  }
  const handleBlockModalClose = () => {
    setOpenBlockModal(false)
    setBlockModal(false)
  }

  const handleDeleteDialogOpen = (user) => {
    setUserToDelete(user)
    setOpenDeleteDialog(true)
  }

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false)
    setUserToDelete(null)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await deleteUser(userToDelete.id)
      if (response.status === 200) {
        toast.success('User deleted successfully')
        fetchAllUsers() // Refresh the user list
        handleDeleteDialogClose()
      }
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Delete user error:', error)
    }
  }

  // user deatils
  const handleOpenEditUserModal = user => {
    setEditUserForm({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || '',
      pawPoints: user.pawPoints || 0,
      profilePicture: user.profilePicture || '',
      addresses: user.Addresses || []
    })
    setSelectedProfileFile(null)
    setPreviewUrl(user.profilePicture || '')
    setIsEditUserModalOpen(true)
  }
  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false)
    setSelectedProfileFile(null)
    setPreviewUrl('')
  }

  const handleProfileFileChange = async e => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await uploadImage(formData)
        if (response) {
          const newFileUrl = response.data.data.fileUrl
          setSelectedProfileFile(file)
          setPreviewUrl(response.data.data.fileUrl)
          setEditUserForm(prev => ({
            ...prev,
            profilePicture: newFileUrl
          }))
        } else {
          toast.error('Failed to upload profile picture')
        }
      } catch (error) {
        toast.error('Error uploading image')
      }

      // setSelectedProfileFile(file)
      // Generate a local preview

      // setPreviewUrl(fileReader.result.toString())
    }
  }

  // Local state for controlling the dialog modal.

  const columns = useMemo(
    () => [
      {
        header: 'User',
        accessorKey: 'name',
        cell: ({ row }) => {
          const appointments = row.original.Appointments || []
          const shop = row.original.Payments || []
          console.log('shop', shop)

          // Count 'clinic' type appointments
          const clinicCount = appointments?.filter(appointment => appointment?.type === 'clinic').length

          // Count 'in-house' type appointments
          const inHouseCount = appointments?.filter(appointment => appointment?.type === 'in-house').length

          // Total shop Orders
          const shopOrder = shop?.filter(data => data?.notes?.type?.toLowerCase() === 'shopify').length

          return (
            <Box display='flex' alignItems='center'>
              <Avatar src={row.original.profilePicture || '/default-avatar.png'} alt={row.original.name} />
              {/* Container for name and caption */}
              <Box ml={2} display='flex' flexDirection='column'>
                <Tooltip title={row.original.name || 'N/A'}>
                  <Typography variant='body1'>{truncateText(row.original.name)}</Typography>
                </Tooltip>
                <Typography variant='caption'>Platform: {row.original.platform || 'n/a'}</Typography>
                <Typography variant='caption'>Model: {row.original.model || 'n/a'}</Typography>
                <Typography variant='caption'>Gender: {row.original.gender || 'n/a'}</Typography>

                {/* Display the appointment counts */}
              </Box>
            </Box>
          )
        }
      },

      {
        header: 'Clinic Appointments',
        accessorKey: 'clinicCount',
        cell: ({ row }) => {
          const appointments = row.original.Appointments || []
          const clinicCount = appointments?.filter(appointment => appointment?.type === 'clinic').length
          return (
            <>
              <Typography>{clinicCount}</Typography>
            </>
          )
        }
      },
      {
        header: 'In-House Appointments',
        accessorKey: 'clinicCount',
        cell: ({ row }) => {
          const appointments = row.original.Appointments || []
          // Count 'in-house' type appointments
          const inHouseCount = appointments?.filter(appointment => appointment?.type === 'in-house').length
          return (
            <>
              <Typography>{inHouseCount}</Typography>
            </>
          )
        }
      },
      {
        header: 'In-House Appointments',
        accessorKey: 'clinicCount',
        cell: ({ row }) => {
          const appointments = row.original.Appointments || []
          // Count 'in-house' type appointments
          const inHouseCount = appointments?.filter(appointment => appointment?.type === 'in-house').length
          return (
            <>
              <Typography>{inHouseCount}</Typography>
            </>
          )
        }
      },
      {
        header: 'Total Shop',
        accessorKey: 'shopCount',
        cell: ({ row }) => {
          const shop = row.original.Payments || []
          const shopOrder = shop?.filter(data => data?.notes?.type?.toLowerCase() === 'shopify').length
          return (
            <>
              <Typography>{shopOrder}</Typography>
            </>
          )
        }
      },
      {
        header: 'Total Posts',
        accessorKey: 'totalPosts',
        cell: ({ row }) => {
          const shop = row.original.Payments || []
          const shopOrder = shop?.filter(data => data?.notes?.type?.toLowerCase() === 'shopify').length
          return (
            <>
              <Typography variant='caption'>Total Posts: {row.original.totalPosts}</Typography>
            </>
          )
        }
      },

      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => (
          <Tooltip title={row.original.email || 'N/A'}>
            <Typography>{truncateText(row.original.email)}</Typography>
          </Tooltip>
        )
      },
      {
        header: 'City',
        accessorKey: 'City',
        cell: ({ row }) => {
          const addresses = row.original.Addresses || []
          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0]
          const city = defaultAddress?.city?.trim() || 'N/A'

          return (
            <Tooltip title={city}>
              <Typography>{truncateText(city)}</Typography>
            </Tooltip>
          )
        }
      },

      // {
      //   header: 'Plan',
      //   accessorKey: 'Plan',
      //   cell: ({ row }) => {
      //     const [open, setOpen] = React.useState(false)

      //     // Handlers for dialog open/close.
      //     const handleOpen = () => setOpen(true)
      //     const handleClose = () => setOpen(false)
      //     // Safely access the first subscription in the subscriptions array
      //     const subscription = row?.original?.subscriptions ? row?.original?.subscriptions[0] : null
      //     const planName = subscription?.subscriptionPlan?.name || 'N/A'

      //     // Determine if we need to show a special Chip for Silver or Gold.
      //     // Convert to lower case for a case-insensitive comparison.
      //     const planLower = planName.toLowerCase()
      //     let chipProps = null

      //     if (planLower === 'silver') {
      //       chipProps = {
      //         label: planName,
      //         style: {
      //           backgroundColor: '#C0C0C0', // Silver color
      //           color: '#000'
      //         }
      //       }
      //     } else if (planLower === 'gold') {
      //       chipProps = {
      //         label: planName,
      //         style: {
      //           backgroundColor: '#FFD700', // Gold color
      //           color: '#000'
      //         }
      //       }
      //     }

      //     return (
      //       <Tooltip title={planName}>
      //         {chipProps ? <Chip {...chipProps} onClick={handleOpen} /> : <Typography>{planName}</Typography>}
      //       </Tooltip>
      //     )
      //   }
      // },
      // {
      //   header: 'Plan',
      //   accessorKey: 'Plan',
      //   cell: ({ row }) => {
      //     // Determine the correct user id. Adjust this if your user id is stored under a different property.
      //     const userId = row?.original?.userId || row?.original?.id

      //     // Get all subscriptions from the row.
      //     const allSubscriptions = row?.original?.subscriptions || []

      //     // Filter subscriptions to only include those for this user.
      //     const userSubscriptions = allSubscriptions.filter(sub => sub.userId === userId)

      //     // For the Chip display, use the first subscription of the filtered subscriptions.
      //     const firstSubscription = userSubscriptions[0] || null
      //     const planName = firstSubscription?.subscriptionPlan?.name || 'N/A'

      //     // Local state for controlling the dialog for this specific user.
      //     const [open, setOpen] = React.useState(false)
      //     const handleOpen = () => setOpen(true)
      //     const handleClose = () => setOpen(false)

      //     // Set up Chip styling for Silver or Gold plans.
      //     const planLower = planName.toLowerCase()
      //     let chipProps = null
      //     if (planLower === 'silver') {
      //       chipProps = {
      //         label: planName,
      //         style: { backgroundColor: '#C0C0C0', color: '#000' }
      //       }
      //     } else if (planLower === 'gold') {
      //       chipProps = {
      //         label: planName,
      //         style: { backgroundColor: '#FFD700', color: '#000' }
      //       }
      //     }

      //     // A helper component to render a field label and its value.
      //     const Field = ({ label, value }) => (
      //       <Typography variant='body2' gutterBottom>
      //         <strong>{label}:</strong> {value}
      //       </Typography>
      //     )

      //     return (
      //       <>
      //         <Tooltip title={planName}>
      //           {chipProps ? (
      //             <Chip {...chipProps} onClick={handleOpen} style={{ cursor: 'pointer', ...chipProps.style }} />
      //           ) : (
      //             <Typography onClick={handleOpen} style={{ cursor: 'pointer' }}>
      //               {planName}
      //             </Typography>
      //           )}
      //         </Tooltip>

      //         {/* Modal Dialog for the specific user's subscription details */}
      //         <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      //           <DialogTitle>
      //             Subscription Details for {row?.original?.name || 'User'}
      //             <IconButton
      //               aria-label='close'
      //               onClick={handleClose}
      //               sx={{
      //                 position: 'absolute',
      //                 right: 8,
      //                 top: 8,
      //                 color: theme => theme.palette.grey[500]
      //               }}
      //             >
      //               <CloseIcon />
      //             </IconButton>
      //           </DialogTitle>
      //           <DialogContent dividers>
      //             {userSubscriptions.length === 0 ? (
      //               <Typography>No subscriptions available.</Typography>
      //             ) : (
      //               userSubscriptions.map((sub, index) => (
      //                 <Box key={sub.id || index} mb={2}>
      //                   <Typography variant='h6' gutterBottom>
      //                     Subscription {index + 1}
      //                   </Typography>
      //                   <Field label='ID' value={sub.id} />
      //                   <Field label='Status' value={sub.status} />
      //                   <Field label='Cancel Reason' value={sub.cancelReason || 'N/A'} />
      //                   <Field label='Start Date' value={new Date(sub.startDate).toLocaleDateString()} />
      //                   <Field label='End Date' value={new Date(sub.endDate).toLocaleDateString()} />
      //                   <Field label='User ID' value={sub.userId} />
      //                   <Field label='Subscription Plan ID' value={sub.subscriptionPlanId} />
      //                   <Field label='Payment ID' value={sub.paymentId} />
      //                   <Field label='Created At' value={new Date(sub.createdAt).toLocaleString()} />
      //                   <Field label='Updated At' value={new Date(sub.updatedAt).toLocaleString()} />

      //                   <Box my={1}>
      //                     <Divider />
      //                   </Box>

      //                   {/* Subscription Plan Details */}
      //                   <Typography variant='subtitle1' gutterBottom>
      //                     Plan Details
      //                   </Typography>
      //                   <Field label='Name' value={sub.subscriptionPlan?.name || 'N/A'} />
      //                   <Field label='Price' value={sub.subscriptionPlan?.price || 'N/A'} />
      //                   <Field label='Crossed Price' value={sub.subscriptionPlan?.crossedPrice || 'N/A'} />
      //                   <Field label='Description' value={sub.subscriptionPlan?.description || 'N/A'} />
      //                   <Field
      //                     label='Benefits'
      //                     value={sub.subscriptionPlan?.benefits ? sub.subscriptionPlan.benefits.join(', ') : 'N/A'}
      //                   />
      //                   <Field label='Welcome Kit' value={sub.subscriptionPlan?.welcomeKit ? 'Yes' : 'No'} />
      //                   <Field label='Birthday Cake' value={sub.subscriptionPlan?.birthdayCake ? 'Yes' : 'No'} />
      //                   <Field
      //                     label='Shop Discount (%)'
      //                     value={sub.subscriptionPlan?.shopDiscountPercentage || 'N/A'}
      //                   />
      //                   <Field
      //                     label='Delivery Discount (%)'
      //                     value={sub.subscriptionPlan?.deliveryDiscountPercentage || 'N/A'}
      //                   />
      //                   <Field label='Vet Discount (%)' value={sub.subscriptionPlan?.vetDiscountPercentage || 'N/A'} />
      //                   <Field label='Daily Profile Views' value={sub.subscriptionPlan?.dailyProfileViews || 'N/A'} />
      //                   <Field label='Paw Fives' value={sub.subscriptionPlan?.pawFives || 'N/A'} />
      //                   <Field label='Duration (months)' value={sub.subscriptionPlan?.durationInMonths || 'N/A'} />
      //                 </Box>
      //               ))
      //             )}
      //           </DialogContent>
      //         </Dialog>
      //       </>
      //     )
      //   }
      // },
      {
        header: 'Plan',
        accessorKey: 'Plan',
        cell: ({ row }) => {
          const [open, setOpen] = useState(false)

          const handleOpen = () => setOpen(true)
          const handleClose = () => setOpen(false)
          // Determine the correct user id.
          // Adjust this if your user id is stored under a different property.
          const userId = row?.original?.userId || row?.original?.id

          // Get all subscriptions from the row.
          const allSubscriptions = row?.original?.subscriptions || []

          // Filter subscriptions to include only those for the current user.
          const userSubscriptions = allSubscriptions.filter(sub => sub.userId === userId)

          // For the chip display (in the table cell), we use the first subscription's plan name (if any)
          const firstSubscription = userSubscriptions[0] || null
          const planName = firstSubscription?.subscriptionPlan?.name || 'N/A'

          // Set up Chip styling for Silver or Gold plans (for table cell display)
          const planLower = planName.toLowerCase()
          let chipProps = null
          if (planLower === 'silver') {
            chipProps = {
              label: planName,
              style: { backgroundColor: '#C0C0C0', color: '#000' }
            }
          } else if (planLower === 'gold') {
            chipProps = {
              label: planName,
              style: { backgroundColor: '#FFD700', color: '#000' }
            }
          }

          // Helper to return a status color for a subscription flag.
          const getStatusColor = status => {
            if (!status) return '#000'
            switch (status.toLowerCase()) {
              case 'active':
                return '#4caf50' // green
              case 'cancelled':
                return '#f44336' // red
              case 'expired':
                return '#9e9e9e' // grey
              default:
                return '#2196f3' // blue (for pending or other statuses)
            }
          }

          // A helper component to render a field label and its value.
          const Field = ({ label, value }) => (
            <Typography variant='body2' gutterBottom>
              <strong>{label}:</strong> {value}
            </Typography>
          )

          return (
            <>
              <Tooltip title={planName}>
                {chipProps ? (
                  <Chip {...chipProps} onClick={handleOpen} style={{ cursor: 'pointer', ...chipProps.style }} />
                ) : (
                  <Typography onClick={handleOpen} style={{ cursor: 'pointer' }}>
                    {planName}
                  </Typography>
                )}
              </Tooltip>

              {/* Dialog modal for this user's subscription details */}
              <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
                <DialogTitle>
                  Subscription Details for {row?.original?.name || 'User'}
                  <IconButton
                    aria-label='close'
                    onClick={handleClose}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: theme => theme.palette.grey[500]
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  {userSubscriptions.length === 0 ? (
                    <Typography>No subscriptions available.</Typography>
                  ) : (
                    userSubscriptions.map((sub, index) => {
                      // Determine the status flag color for this subscription.
                      const statusColor = getStatusColor(sub.status)
                      return (
                        <Box key={sub.id || index} mb={2} p={1} border={1} borderColor='#e0e0e0' borderRadius={2}>
                          <Box display='flex' alignItems='center' mb={1}>
                            <Typography variant='h6' gutterBottom>
                              Subscription {index + 1}
                            </Typography>
                            {/* Status Flag */}
                            <Chip
                              label={sub.status}
                              size='small'
                              style={{
                                backgroundColor: statusColor,
                                color: '#fff',
                                marginLeft: 8
                              }}
                            />
                          </Box>
                          <Field label='ID' value={sub.id} />
                          <Field label='Cancel Reason' value={sub.cancelReason || 'N/A'} />
                          <Field label='Start Date' value={new Date(sub.startDate).toLocaleDateString()} />
                          <Field label='End Date' value={new Date(sub.endDate).toLocaleDateString()} />
                          <Field label='User ID' value={sub.userId} />
                          <Field label='Subscription Plan ID' value={sub.subscriptionPlanId} />
                          <Field label='Payment ID' value={sub.paymentId || 'N/A'} />
                          <Field label='Created At' value={new Date(sub.createdAt).toLocaleString()} />
                          <Field label='Updated At' value={new Date(sub.updatedAt).toLocaleString()} />

                          <Box my={1}>
                            <Divider />
                          </Box>

                          {/* Subscription Plan Details */}
                          <Typography variant='subtitle1' gutterBottom>
                            Plan Details
                          </Typography>
                          <Field label='Name' value={sub.subscriptionPlan?.name || 'N/A'} />
                          <Field label='Price' value={sub.subscriptionPlan?.price || 'N/A'} />
                          <Field label='Crossed Price' value={sub.subscriptionPlan?.crossedPrice || 'N/A'} />
                          <Field label='Description' value={sub.subscriptionPlan?.description || 'N/A'} />
                          <Field
                            label='Benefits'
                            value={sub.subscriptionPlan?.benefits ? sub.subscriptionPlan.benefits.join(', ') : 'N/A'}
                          />
                          <Field label='Welcome Kit' value={sub.subscriptionPlan?.welcomeKit ? 'Yes' : 'No'} />
                          <Field label='Birthday Cake' value={sub.subscriptionPlan?.birthdayCake ? 'Yes' : 'No'} />
                          <Field
                            label='Shop Discount (%)'
                            value={sub.subscriptionPlan?.shopDiscountPercentage || 'N/A'}
                          />
                          <Field
                            label='Delivery Discount (%)'
                            value={sub.subscriptionPlan?.deliveryDiscountPercentage || 'N/A'}
                          />
                          <Field
                            label='Vet Discount (%)'
                            value={sub.subscriptionPlan?.vetDiscountPercentage || 'N/A'}
                          />
                          <Field label='Daily Profile Views' value={sub.subscriptionPlan?.dailyProfileViews || 'N/A'} />
                          <Field label='Paw Fives' value={sub.subscriptionPlan?.pawFives || 'N/A'} />
                          <Field label='Duration (months)' value={sub.subscriptionPlan?.durationInMonths || 'N/A'} />
                        </Box>
                      )
                    })
                  )}
                </DialogContent>
              </Dialog>
            </>
          )
        }
      },
      {
        header: 'ToTal Revenue',
        accessorKey: 'totalPaymentAmount',
        cell: ({ row }) => <Typography>₹ {row.original.totalPaymentAmount.toFixed() || 0}</Typography>
      },
      {
        header: 'Last Activity',
        accessorKey: 'updatedAt',
        cell: ({ row }) => {
          const date = new Date(row?.original?.updatedAt)
          return (
            <>
              <Typography>{date.toLocaleDateString('en-GB')}</Typography>
              <Typography>{date.toLocaleTimeString('en-GB')}</Typography>
            </>
          )
        }
      },

      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ row }) => (
          <Tooltip title={row.original.phone || 'N/A'}>
            <Typography>{truncateText(row.original.phone)}</Typography>
          </Tooltip>
        )
      },
      {
        header: 'Referred By',
        accessorKey: 'ReferredBy',
        cell: ({ row }) => {
          const referredBy = row.original.ReferredBy
          return (
            <Tooltip title={referredBy ? referredBy.referralCode || referredBy.email || 'N/A' : 'N/A'}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography>{referredBy ? referredBy.name || referredBy.referralCode || 'N/A' : 'N/A'}</Typography>
              </Box>
            </Tooltip>
          )
        }
      },
      {
        header: 'Referred Users',
        accessorKey: 'Referred Users',
        cell: ({ row }) => {
          const referredTo = row.original.ReferredUsers || []

          return (
            <Tooltip title='Click to view referred users'>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.8, cursor: 'pointer' }}
                onClick={() => handleOpenReferredModal(referredTo)}
              >
                <Typography>{referredTo.length}</Typography>
              </Box>
            </Tooltip>
          )
        }
      },
      {
        // header: ({ column }) => {
        //   const sortingState = column.getIsSorted()
        //   return (
        //     <Box
        //       sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        //       // onClick={() => column.toggleSorting()}
        //     >
        //       <Typography>PawPoints</Typography>
        //       {sortingState === 'asc' ? (
        //         <ArrowUpwardIcon fontSize='small' />
        //       ) : sortingState === 'desc' ? (
        //         <ArrowDownwardIcon fontSize='small' />
        //       ) : null}
        //     </Box>
        //   )
        // },
        header: 'Paw Points',
        accessorKey: 'pawPoints',
        sortingFn: (rowA, rowB, columnId) => {
          const a = Number(rowA.getValue(columnId))
          const b = Number(rowB.getValue(columnId))
          return a - b
        },

        cell: ({ row }) => {
          const isCurrentRowEditing = editingPawPoints === row.original.id
          const handleSavePawPoints = (userId, newValue) => {
            // Check if the new value is different from the current value
            if (Number(newValue) === Number(row.original.pawPoints)) {
              // toast.info('No changes made to PawPoints.')
              setEditingPawPoints(null) // Exit edit mode
              return
            }

            // Call the API only if the value has changed
            handlePawPointsChange(userId, newValue)
          }

          return (
            <Tooltip title='Double-click to edit PawPoints'>
              {isCurrentRowEditing ? (
                <TextField
                  variant='outlined'
                  size='small'
                  defaultValue={row.original.pawPoints}
                  onBlur={e => handleSavePawPoints(row.original.id, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSavePawPoints(row.original.id, e.target.value)
                    }
                  }}
                  autoFocus
                />
              ) : (
                <Typography
                  sx={{
                    cursor: 'pointer',
                    padding: '4px 8px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    display: 'inline-block',
                    ':hover': {
                      backgroundColor: '#e0e0e0'
                    }
                  }}
                >
                  {isCurrentRowEditing ? <Countup start={0} end={row.original.pawPoints} /> : row.original.pawPoints}
                </Typography>
              )}
            </Tooltip>
          )
        }
      },

      // {
      //   header: 'Appointments',
      //   accessorKey: 'Appointments',
      //   cell: ({ row }) => (
      //     <Tooltip
      //       title={
      //         row.original.Appointments.length > 0
      //           ? row.original.Appointments.map(appointment => appointment.type).join(', ')
      //           : 'N/A'
      //       }
      //     >
      //       <Typography>
      //         {row.original.Appointments.length > 0
      //           ? row.original.Appointments[0].type // Display first appointment type
      //           : 'N/A'}
      //       </Typography>
      //     </Tooltip>
      //   )
      // },
      // {
      //   header: 'Appointments',
      //   accessorKey: 'Appointments',
      //   cell: ({ row }) => (
      //     <Tooltip
      //       title={
      //         row.original.Appointments.length > 0
      //           ? row.original.Appointments.map(appointment => appointment.type).join(', ')
      //           : 'N/A'
      //       }
      //     >
      //       <Typography
      //         sx={{
      //           overflow: 'hidden',
      //           whiteSpace: 'normal', // Allow line breaks
      //           wordWrap: 'break-word', // Ensure words break if too long
      //           maxWidth: '200px' // Optional: set max width to prevent expansion
      //         }}
      //       >
      //         {row.original.Appointments.length > 0
      //           ? truncateText(row.original.Appointments.map(appointment => appointment.type).join(', '))
      //           : 'N/A'}
      //       </Typography>
      //     </Tooltip>
      //   )
      // },
      {
        header: 'Pets ',
        accessorKey: 'Pets',
        cell: ({ row }) => (
          <Link href={{ pathname: `/pawmanagment`, query: { user: row.original.id } }} passHref>
            <Typography component='a'>{row.original.Pets ? row.original.Pets.length : 0}</Typography>
          </Link>
        )
      },

      {
        header: 'Addresses',
        accessorKey: 'Addresses',
        cell: ({ row }) => {
          const addresses = row.original.Addresses || []

          if (addresses.length === 0) {
            return <Typography>N/A</Typography>
          }

          // Prefer the default address if it exists, otherwise the first
          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0]
          const addressText = `${defaultAddress.houseNo}, ${defaultAddress.streetName}, ${defaultAddress.city}`

          // Build a multi-line tooltip for ALL addresses
          const tooltipContent = (
            <Box>
              {addresses.map((addr, index) => (
                <Typography variant='body2' key={index}>
                  {`
                    ${addr.houseNo}, ${addr.streetName}, 
                    ${addr.city}, ${addr.state || ''} 
                    ${addr.country || ''} - (${addr.type || 'no-type'})
                  `}
                </Typography>
              ))}
            </Box>
          )

          // OPTIONAL: Use your existing truncate function
          const truncatedText = truncateText(addressText, 20)
          // Example utility:
          // function truncateText(str, maxLength = 20) {
          //   if (!str) return ''
          //   return str.length > maxLength ? str.slice(0, maxLength) + '…' : str
          // }

          return (
            <Tooltip
              title={tooltipContent}
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    fontSize: '14px'
                  }
                }
              }}
            >
              <Typography
                sx={{
                  maxWidth: 120, // limit the visible width
                  whiteSpace: 'nowrap', // keep on one line
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer'
                }}
              >
                {truncatedText}
              </Typography>
            </Tooltip>
          )
        }
      },

      {
        header: 'Active',
        accessorKey: 'active',
        cell: ({ row }) => (
          <Button
            variant='contained'
            size='small'
            color={row.original.blocked.length > 0 ? 'success' : 'error'}
            onClick={() => handleBlockDialogOpen(row.original)}
            disabled={userRole !== 'superadmin' && userRole !== 'admin'}
          >
            {row.original.blocked.length > 0 ? 'Unblock' : 'Block'}
          </Button>
        )
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              disabled={userRole !== 'superadmin' && userRole !== 'admin'}
              onClick={() => handleOpenEditUserModal(row.original)}
              aria-label='edit user'
            >
              <EditIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
            <IconButton
              disabled={userRole !== 'superadmin' && userRole !== 'admin'}
              onClick={() => handleDeleteDialogOpen(row.original)}
              aria-label='delete user'
            >
              <DeleteIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Box>
        )
      }
    ],
    [editingPawPoints, userRole]
  )

  const blockModules = ['veterinary', 'community', 'shop', 'match', 'all']

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { globalFilter, sorting: tableSortingState }, // This connects the global filter to the table state
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn, // Adding custom global filter function
    onSortingChange: setTableSortingState
  })

  // const handleBlock = async () => {
  //   try {
  //     // API payload
  //     const payload = {
  //       // userId: selectedUser.id, // Assuming `selectedUser` contains the user's ID
  //       blockedModules: alreadyBlockedModules
  //     }

  //     console.log('Saving blocked modules:', payload)
  //     console.log(selectedUserId)

  //     // Call the API to update blocked modules
  //     const response = await blockUser(selectedUserId, payload)

  //     if (response.status === 200) {
  //       toast.success('Blocked modules updated successfully')
  //       fetchAllUsers() // Refresh the user list after successful API call
  //       handleBlockModalClose() // Close the modal
  //     } else {
  //       toast.error('Failed to update blocked modules')
  //     }
  //   } catch (error) {
  //     console.error('Error saving blocked modules:', error)
  //     toast.error('An error occurred while saving blocked modules')
  //   }
  // }
  const handleBlock = async () => {
    try {
      // Identify modules to block (newly added to `alreadyBlockedModules`)
      const blockResponse = await blockUser(selectedUserId, {
        blockedModules: alreadyBlockedModules // Pass modules to block
      })

      console.log('REsonss', blockResponse)

      if (blockResponse.status === 200 && blockResponse?.data?.data?.blocked?.length > 0) {
        toast.success(`User Blocked Successfully`)
      } else {
        toast.success(`User unblocked`)
      }

      // Refresh user list after updates
      fetchAllUsers()
      handleBlockModalClose()
    } catch (error) {
      console.error('Error updating modules:', error)
      toast.error('An error occurred while updating modules')
    }
  }

  const handleSaveUserChanges = async () => {
    try {
      // Build the payload with updated fields
      const payload = {
        name: editUserForm.name,
        email: editUserForm.email,
        phone: editUserForm.phone,
        gender: editUserForm.gender,
        pawPoints: editUserForm.pawPoints,
        profilePicture: editUserForm.profilePicture,
        addresses: editUserForm.addresses
      }

      const response = await updateAppUser(editUserForm.id, payload)

      if (response.status === 200) {
        toast.success('User updated successfully')
        setIsEditUserModalOpen(false)
        // Refresh your user list to reflect changes
        fetchAllUsers()
      } else {
        toast.error('Failed to update user')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while updating the user')
    }
  }
  const updateAddressField = (index, field, value) => {
    setEditUserForm(prev => {
      const updatedAddresses = [...prev.addresses]
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        [field]: value
      }
      return { ...prev, addresses: updatedAddresses }
    })
  }

  return (
    <>
      <ToastContainer />
      <Card>
        <CardHeader
          avatar={<Group color='primary' fontSize='large' />} // Icon before title
          title='App Users'
          titleTypographyProps={{
            variant: 'h5', // Set the text size
            color: 'textPrimary', // Optional: Change text color
            fontWeight: 'bold' // Optional: Make it bold
          }}
          subheader={'View and Edit '}
        />
        <Box display='flex' p={3} justifyContent='space-between'>
          <CustomTextField
            value={globalFilter ?? ''}
            onClick={() => {
              setClicked(true)
            }}
            onBlur={() => {
              setClicked(false)
            }}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search'
          // InputProps={{
          //   startAdornment: (
          //     <>
          //       {!clicked ? (
          //         <Box
          //           sx={{
          //             position: 'relative',
          //             display: 'flex',
          //             alignItems: 'center',
          //             width: '200px'
          //           }}
          //         >
          //           <AnimatePresence>
          //             <motion.div
          //               key={animateData[currentIndex]}
          //               initial={{ y: 20, opacity: 0 }}
          //               animate={{ y: 0, opacity: 1 }}
          //               exit={{ y: 0, opacity: 0 }}
          //               transition={{
          //                 type: 'spring',
          //                 stiffness: 120,
          //                 damping: 14
          //               }}
          //               style={{
          //                 fontSize: '16px',
          //                 color: 'rgba(0, 0, 0, 0.6)',
          //                 position: 'absolute',
          //                 whiteSpace: 'nowrap'
          //               }}
          //             >
          //               {animateData[currentIndex]}
          //             </motion.div>
          //           </AnimatePresence>
          //         </Box>
          //       ) : null}
          //     </>
          //   )
          // }}
          />
        </Box>
        <Box sx={{ maxHeight: '700px', overflow: 'auto' }}>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr
                  key={headerGroup.id}
                  style={{
                    backgroundColor: '#E0E0E0,',
                    '&:hover': {
                      backgroundColor: '#E0E0E0', // Hover effect
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow effect
                      cursor: 'pointer',
                      '& td': {
                        transform: 'scale(0.9)', // Zoom-out effect
                        transition: 'transform 0.1  s ease'
                      }
                    }
                  }}
                >
                  {headerGroup.headers.map(header => (
                    <th
                      style={{
                        position: header.id === 'name' || header.isHeader ? 'sticky' : 'static',
                        top: header.isHeader ? '0' : 'unset', // Sticky header
                        left: header.id === 'name' ? '0' : 'unset', // Sticky column
                        zIndex: header.id === 'name' ? 3 : header.isHeader ? 2 : 1,
                        backgroundColor: '#ffffff',
                        padding: '10px',
                        border: '1px solid #ccc'
                      }}
                      key={header.id}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody
            // style={{
            //   backgroundColor: '#E0E0E0,',
            //   '&:hover': {
            //     backgroundColor: '#E0E0E0', // Hover effect
            //     boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow effect
            //     cursor: 'pointer',
            //     '& td': {
            //       transform: 'scale(0.95)', // Zoom-out effect
            //       transition: 'transform 0.3s ease'
            //     }
            //   }
            // }}
            >
              {table.getRowModel().rows.map(row => (
                <tr
                  // style={{
                  //   backgroundColor: '#E0E0E0,',
                  //   '&:hover': {
                  //     backgroundColor: '#E0E0E0', // Hover effect
                  //     boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow effect
                  //     cursor: 'pointer',
                  //     '& td': {
                  //       transform: 'scale(0.95)', // Zoom-out effect
                  //       transition: 'transform 0.3s ease'
                  //     }
                  //   }
                  // }}
                  // style={{
                  //   backgroundColor: '',
                  //   transition: 'transform 0.3s ease',

                  //   cursor: 'pointer'
                  // }}
                  // onMouseEnter={e => {
                  //   ;(e.currentTarget.style.transform = 'scale(0.95)'),
                  //     (e.currentTarget.style.backgroundColor = '#E0E0E0')
                  //   e.currentTarget.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)'
                  // }}
                  // onMouseLeave={e => {
                  //   ;(e.currentTarget.style.backgroundColor = 'white'),
                  //     (e.currentTarget.style.boxShadow = 'none'),
                  //     (e.currentTarget.style.transform = 'scale(1)')
                  // }}
                  key={row.id}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      style={{
                        position: cell.column.id === 'name' ? 'sticky' : 'static',
                        left: cell.column.id === 'name' ? '0' : 'unset',
                        zIndex: cell.column.id === 'name' ? 1 : 0,
                        backgroundColor: cell.column.id === 'name' ? '#f9f9f9' : 'inherit',
                        padding: '10px'
                        // border: '1px solid #ddd'
                      }}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <TablePagination
          // component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPageOptions={[10, 20, 50]}
          component='div'
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={event => {
            table.setPageSize(Number(event.target.value))
          }}
        />
      </Card>
      {/* <Dialog open={''} onClose={handleCloseDialog}>
        <DialogTitle>{isBlocking ? 'Block User' : 'Unblock User'}</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to {isBlocking ? 'block' : 'unblock'} this user?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleToggleBlockConfirm} color='secondary'>
            {isBlocking ? 'Block' : 'Unblock'}
          </Button>
        </DialogActions>
      </Dialog> */}

      <Dialog open={openReferredModal} onClose={handleCloseReferredModal}>
        <DialogTitle>Referred Users</DialogTitle>
        <DialogContent>
          <DialogContentText>List of users referred by this user:</DialogContentText>
          <List>
            {referredUsernames.map((username, index) => (
              <ListItem
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: index % 2 === 0 ? 'grey.100' : 'white',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    transition: 'background-color 0.3s ease'
                  }
                }}
                key={index}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={username}
                  primaryTypographyProps={{
                    fontWeight: 'light',
                    fontSize: '1rem'
                  }}
                />
              </ListItem>
            ))}
          </List>
          <IconButton
            aria-label='close'
            onClick={handleCloseReferredModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogContent>
      </Dialog>

      <Dialog open={blockModal} onClose={handleBlockModalClose}>
        <DialogTitle>Manage Blocked Modules</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Below are the modules the user is already blocked in. You can add or remove blocks as needed.
          </DialogContentText>
          <List>
            {blockModules.map((module, index) => {
              const isBlocked = alreadyBlockedModules.includes(module)
              return (
                <ListItem key={index} disablePadding>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isBlocked}
                        onChange={e => {
                          const updatedModules = e.target.checked
                            ? [...alreadyBlockedModules, module]
                            : alreadyBlockedModules.filter(m => m !== module)
                          setAlreadyBlockedModules(updatedModules) // Update state
                        }}
                      />
                    }
                    label={
                      <ListItemText
                        primary={module}
                        secondary={isBlocked ? 'Currently Blocked' : 'Not Blocked'}
                        primaryTypographyProps={{ style: { fontWeight: isBlocked ? 'bold' : 'normal' } }}
                      />
                    }
                  />
                </ListItem>
              )
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBlockModalClose} color='secondary'>
            Cancel
          </Button>

          <Button
            onClick={() => {
              handleBlock()
            }}
            color='primary'
            variant='contained'
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPawPointsModal} onClose={handleClosePawPointsModal}>
        <DialogTitle>Edit PawPoints</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update PawPoints for <strong>{editingUser?.name}</strong>
          </DialogContentText>
          <TextField
            fullWidth
            label='PawPoints'
            type='number'
            value={pawPointsValue}
            onChange={e => setPawPointsValue(e.target.value)}
            sx={{ marginTop: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePawPointsModal} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleUpdatePawPoints} color='primary' variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditUserModalOpen} onClose={handleCloseEditUserModal} maxWidth='md' fullWidth>
        <DialogTitle>Edit User Info</DialogTitle>
        <DialogContent>
          <DialogContentText>Update the user's information below.</DialogContentText>

          {/* Display current/new profile image + file input */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Avatar
              src={previewUrl || '/default-avatar.png'}
              alt='Profile Preview'
              sx={{ width: 80, height: 80, border: '2px solid #ddd' }}
            />
            <label htmlFor='profile-picture-input'>
              <input
                id='profile-picture-input'
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={handleProfileFileChange}
              />
              <Button variant='outlined' component='span'>
                Change Picture
              </Button>
            </label>
          </Box>

          {/* Basic fields */}
          <TextField
            label='Name'
            fullWidth
            margin='normal'
            value={editUserForm.name}
            onChange={e => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label='Email'
            fullWidth
            margin='normal'
            value={editUserForm.email}
            onChange={e => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
          />
          <TextField
            label='Phone'
            fullWidth
            margin='normal'
            value={editUserForm.phone}
            onChange={e => setEditUserForm(prev => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            label='Gender'
            fullWidth
            margin='normal'
            value={editUserForm.gender}
            onChange={e => setEditUserForm(prev => ({ ...prev, gender: e.target.value }))}
          />
          <TextField
            label='PawPoints'
            type='number'
            fullWidth
            margin='normal'
            value={editUserForm.pawPoints}
            onChange={e => setEditUserForm(prev => ({ ...prev, pawPoints: Number(e.target.value) }))}
          />

          {/* Addresses */}
          <Box mt={3}>
            <Typography variant='h6' gutterBottom>
              Addresses
            </Typography>
            {editUserForm.addresses.map((addr, index) => (
              <Box
                key={addr.id || index}
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  p: 2,
                  mb: 2
                }}
              >
                <Typography variant='subtitle1' fontWeight='bold'>
                  Address {index + 1}
                </Typography>
                <TextField
                  label='House No'
                  fullWidth
                  margin='normal'
                  value={addr.houseNo || ''}
                  onChange={e => updateAddressField(index, 'houseNo', e.target.value)}
                />
                <TextField
                  label='Street Name'
                  fullWidth
                  margin='normal'
                  value={addr.streetName || ''}
                  onChange={e => updateAddressField(index, 'streetName', e.target.value)}
                />
                <TextField
                  label='City'
                  fullWidth
                  margin='normal'
                  value={addr.city || ''}
                  onChange={e => updateAddressField(index, 'city', e.target.value)}
                />
                <TextField
                  label='State'
                  fullWidth
                  margin='normal'
                  value={addr.state || ''}
                  onChange={e => updateAddressField(index, 'state', e.target.value)}
                />
                <TextField
                  label='Country'
                  fullWidth
                  margin='normal'
                  value={addr.country || ''}
                  onChange={e => updateAddressField(index, 'country', e.target.value)}
                />
                <TextField
                  label='Pincode'
                  fullWidth
                  margin='normal'
                  value={addr.pincode || ''}
                  onChange={e => updateAddressField(index, 'pincode', e.target.value)}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditUserModal} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSaveUserChanges} color='primary' variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete user <strong>{userToDelete?.name || userToDelete?.email}</strong>?
            This action cannot be undone and will remove all associated data including pets, appointments, and posts.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const ProtectedChatPage = () => {
  return (
    <ProtectedRoutes requiredPermission='User'>
      <UserListTable />
    </ProtectedRoutes>
  )
}

export default ProtectedChatPage