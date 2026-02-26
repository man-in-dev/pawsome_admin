'use client'

import React, { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    TablePagination,
    IconButton,
    CardHeader,
    Chip,
    Avatar
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { OtherHouses } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import BoardingFacilityForm from '@/components/boardingfacility/BoardingFacilityForm'
import ProtectedRoutes from '@/components/ProtectedRoute'
import { getAllBoardingFacilities, deleteBoardingFacility } from '@/app/api'
import CustomTextField from '@core/components/mui/TextField'

const BoardingFacilityManagement = () => {
    const [facilities, setFacilities] = useState([])
    const [isModalOpen, setModalOpen] = useState(false)
    const [editingFacility, setEditingFacility] = useState(null)
    const [globalFilter, setGlobalFilter] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [facilityToDelete, setFacilityToDelete] = useState(null)
    const [userRole, setUserRole] = useState('')

    const fetchFacilities = async () => {
        try {
            const response = await getAllBoardingFacilities()
            if (response.status === 200) {
                setFacilities(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching boarding facilities:', error)
            toast.error('Failed to fetch facilities')
        }
    }

    useEffect(() => {
        fetchFacilities()
        const userRole = localStorage.getItem('user')
        if (userRole) {
            const parsedData = JSON.parse(userRole)
            setUserRole(parsedData.role)
        }
    }, [])

    const handleEdit = (facility) => {
        setEditingFacility(facility)
        setModalOpen(true)
    }

    const handleDeleteClick = (id) => {
        setFacilityToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        try {
            const response = await deleteBoardingFacility(facilityToDelete)
            if (response.status === 200) {
                fetchFacilities()
                toast.success('Facility deleted successfully')
            }
        } catch (error) {
            toast.error('Failed to delete facility')
        }
        setDeleteDialogOpen(false)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const filteredFacilities = facilities
        .filter(f => f.name.toLowerCase().includes(globalFilter.toLowerCase()))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    return (
        <Box sx={{ p: 3 }}>
            <ToastContainer />
            <CardHeader
                avatar={<OtherHouses color='primary' fontSize='large' />}
                title='Boarding Centers'
                titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
                subheader='Manage In-Clinic Boarding Facilities'
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <CustomTextField
                    value={globalFilter}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder='Search Facility'
                    sx={{ width: 300 }}
                />
                <Button
                    variant='contained'
                    sx={{ backgroundColor: '#ff9c1e' }}
                    onClick={() => { setEditingFacility(null); setModalOpen(true); }}
                >
                    Add New Facility
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Facility</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Speciality</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Timing</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fees (Details)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFacilities.map(facility => (
                            <TableRow key={facility.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            src={facility.images?.[0] || ''}
                                            variant="rounded"
                                            sx={{ width: 50, height: 50 }}
                                        >
                                            {facility.name.charAt(0)}
                                        </Avatar>
                                        <Typography variant="body1" fontWeight="medium">
                                            {facility.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{facility.speciality || 'n/a'}</TableCell>
                                <TableCell>
                                    {facility.timing ? (
                                        <Chip label={facility.timing} size="small" />
                                    ) : (
                                        'n/a'
                                    )}
                                </TableCell>
                                <TableCell>{facility.address}</TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        Service: ₹{facility.fees || 0} <br />
                                        Regular: ₹{facility.regularFees} <br />
                                        Gold: ₹{facility.goldFees}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={facility.status ? 'Active' : 'Inactive'}
                                        color={facility.status ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(facility)}>
                                        <EditIcon color="primary" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(facility.id)}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredFacilities.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No facilities found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component='div'
                    count={facilities.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth='sm'>
                <DialogTitle>{editingFacility ? 'Edit Boarding Center' : 'Add New Boarding Center'}</DialogTitle>
                <DialogContent>
                    <BoardingFacilityForm
                        fetchFacilities={fetchFacilities}
                        onSubmit={() => setModalOpen(false)}
                        initialData={editingFacility}
                        onClose={() => setModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this boarding facility?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color='error'>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

const ProtectedPage = () => (
    <ProtectedRoutes requiredPermission='hospital'>
        <BoardingFacilityManagement />
    </ProtectedRoutes>
)

export default ProtectedPage
