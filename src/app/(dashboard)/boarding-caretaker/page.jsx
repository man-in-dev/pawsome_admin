'use client'

import React, { useState, useEffect } from 'react'
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
    Typography,
    Tooltip,
    Avatar
} from '@mui/material'

import PeopleIcon from '@mui/icons-material/People'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
    getAllBoardingStaff,
    createBoardingStaff,
    updateBoardingStaff,
    deleteBoardingStaff,
    getAllBoardingFacilities,
    uploadImage
} from '@/app/api'

const BoardingCaretakerManagement = () => {
    const [staffList, setStaffList] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [staffToDelete, setStaffToDelete] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [page, setPage] = useState(0)

    const [newStaff, setNewStaff] = useState({
        name: '',
        profilePicture: '',
        experience: '',
        bio: '',
        slots: [],
        status: true
    })

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ]

    const fetchData = async () => {
        try {
            const response = await getAllBoardingStaff()
            setStaffList(response.data.data || [])
        } catch (error) {
            toast.error('Error fetching data')
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewStaff(prev => ({ ...prev, [name]: value }))
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await uploadImage(formData)
            if (response.data?.data?.fileUrl) {
                setNewStaff(prev => ({ ...prev, profilePicture: response.data.data.fileUrl }))
                toast.success('Image uploaded')
            }
        } catch (error) {
            toast.error('Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleSlotToggle = (slot) => {
        setNewStaff(prev => {
            const slots = prev.slots.includes(slot)
                ? prev.slots.filter(s => s !== slot)
                : [...prev.slots, slot]
            return { ...prev, slots }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newStaff.name) {
            toast.error('Name is required')
            return
        }

        try {
            if (isEditing) {
                await updateBoardingStaff(selectedStaff.id, newStaff)
                toast.success('Caretaker updated')
            } else {
                await createBoardingStaff(newStaff)
                toast.success('Caretaker created')
            }
            setModalOpen(false)
            resetForm()
            fetchData()
        } catch (error) {
            toast.error('Operation failed')
        }
    }

    const handleEdit = (staff) => {
        setSelectedStaff(staff)
        setNewStaff({
            name: staff.name,
            profilePicture: staff.profilePicture || '',
            experience: staff.experience || '',
            bio: staff.bio || '',
            slots: staff.slots || [],
            status: staff.status
        })
        setIsEditing(true)
        setModalOpen(true)
    }

    const handleDeleteClick = (id) => {
        setStaffToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        try {
            await deleteBoardingStaff(staffToDelete)
            toast.success('Caretaker deleted')
            fetchData()
        } catch (error) {
            toast.error('Delete failed')
        }
        setDeleteDialogOpen(false)
    }

    const resetForm = () => {
        setNewStaff({
            name: '',
            profilePicture: '',
            experience: '',
            bio: '',
            slots: [],
            status: true
        })
        setIsEditing(false)
        setSelectedStaff(null)
    }

    return (
        <Box p={3}>
            <ToastContainer />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <CardHeader
                    avatar={<PeopleIcon color="primary" sx={{ fontSize: 40 }} />}
                    title="Boarding Caretakers"
                    subheader="Manage professional staff for boarding facilities"
                    titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
                    sx={{ p: 0 }}
                />
                <Button
                    variant="contained"
                    sx={{ backgroundColor: '#FF9C1E' }}
                    onClick={() => { resetForm(); setModalOpen(true); }}
                >
                    Add Caretaker
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Caretaker</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Facility</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Experience</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Slots</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {staffList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(staff => (
                            <TableRow key={staff.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar src={staff.profilePicture} variant="rounded">
                                            {staff.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">{staff.name}</Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {staff.bio}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {staff.Facility?.name ? (
                                        <Chip label={staff.Facility.name} size="small" variant="outlined" color="primary" />
                                    ) : (
                                        <Typography variant="caption" color="textSecondary">Not Assigned</Typography>
                                    )}
                                </TableCell>
                                <TableCell>{staff.experience} Years</TableCell>
                                <TableCell>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                        {staff.slots?.slice(0, 3).map(slot => (
                                            <Chip key={slot} label={slot} size="small" variant="outlined" />
                                        ))}
                                        {staff.slots?.length > 3 && (
                                            <Chip label={`+${staff.slots.length - 3}`} size="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={staff.status ? 'Active' : 'Inactive'}
                                        color={staff.status ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(staff)} size="small" color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(staff.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={staffList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 600, bgcolor: 'white', borderRadius: 4, boxShadow: 24, p: 4, maxHeight: '90vh', overflowY: 'auto'
                }}>
                    <Typography variant="h6" mb={3} fontWeight="bold">
                        {isEditing ? 'Edit Caretaker' : 'Add New Caretaker'}
                    </Typography>

                    <Box display="flex" justifyContent="center" mb={3}>
                        <Box position="relative">
                            <Avatar
                                src={newStaff.profilePicture}
                                sx={{ width: 100, height: 100, border: '3px solid #FF9C1E' }}
                            />
                            <IconButton
                                component="label"
                                sx={{ position: 'absolute', bottom: -10, right: -10, backgroundColor: 'white', boxShadow: 1 }}
                            >
                                <PhotoCamera />
                                <input type="file" hidden onChange={handleFileUpload} />
                            </IconButton>
                        </Box>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                label="Name"
                                name="name"
                                value={newStaff.name}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Experience (Years)"
                                name="experience"
                                type="number"
                                value={newStaff.experience}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Box>

                        <TextField
                            label="Bio"
                            name="bio"
                            value={newStaff.bio}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="subtitle2" mb={1} fontWeight="bold">Available Time Slots</Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                            {timeSlots.map(slot => (
                                <Chip
                                    key={slot}
                                    label={slot}
                                    onClick={() => handleSlotToggle(slot)}
                                    color={newStaff.slots.includes(slot) ? 'primary' : 'default'}
                                    variant={newStaff.slots.includes(slot) ? 'filled' : 'outlined'}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>

                        <Box display="flex" gap={2}>
                            <Button fullWidth variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                sx={{ backgroundColor: '#FF9C1E' }}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' : (isEditing ? 'Update' : 'Create')}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this caretaker? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default BoardingCaretakerManagement
