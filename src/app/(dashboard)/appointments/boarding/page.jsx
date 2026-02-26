'use client'

import React, { useEffect, useState } from 'react'
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, Select, MenuItem, TablePagination,
    TextField, LinearProgress, CardHeader, Chip
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import { LocalHotel } from '@mui/icons-material'
import { getAllBoardingAppointments, updateBoardingAppointmentStatus } from '@/app/api'
import 'react-toastify/dist/ReactToastify.css'

const BoardingAppointmentPage = () => {
    const [appointments, setAppointments] = useState([])
    const [filteredAppointments, setFilteredAppointments] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const fetchAppointments = async () => {
        setLoading(true)
        try {
            const response = await getAllBoardingAppointments()
            const data = response?.data?.data || []
            setAppointments(data)
            setFilteredAppointments(data)
        } catch (error) {
            toast.error('Error fetching boarding appointments')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase()
        setSearchQuery(query)
        const filtered = appointments.filter(app =>
            app.User?.name?.toLowerCase().includes(query) ||
            app.Facility?.name?.toLowerCase().includes(query) ||
            app.Staff?.name?.toLowerCase().includes(query)
        )
        setFilteredAppointments(filtered)
        setPage(0)
    }

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateBoardingAppointmentStatus(id, { status: newStatus })
            toast.success('Status updated successfully')
            fetchAppointments()
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'success'
            case 'pending': return 'warning'
            case 'cancelled': return 'error'
            case 'completed': return 'info'
            default: return 'default'
        }
    }

    return (
        <Box p={3}>
            <ToastContainer />
            <Paper elevation={3} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                <CardHeader
                    title={
                        <Box display="flex" alignItems="center" gap={1}>
                            <LocalHotel color="primary" />
                            <Typography variant="h6">Boarding Appointments</Typography>
                        </Box>
                    }
                    sx={{ borderBottom: '1px solid #eee', bgcolor: '#fcfcfc' }}
                />

                <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search by User, Facility, or Staff..."
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{ width: 350 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                        Total Records: {filteredAppointments.length}
                    </Typography>
                </Box>

                {loading && <LinearProgress />}

                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Facility</TableCell>
                                <TableCell>Pets Count</TableCell>
                                <TableCell>Stay Reasons</TableCell>
                                <TableCell>Check-in Slot</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Payment ID</TableCell>
                                <TableCell>Staff</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAppointments
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((app) => (
                                    <TableRow key={app.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{app.User?.name || 'N/A'}</Typography>
                                            <Typography variant="caption" color="textSecondary">{app.User?.phone}</Typography>
                                        </TableCell>
                                        <TableCell>{app.Facility?.name}</TableCell>
                                        <TableCell>
                                            <Chip label={app.petIds?.length || 0} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            {app.bookingReasons?.join(', ')}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(app.datetimeSlot).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </TableCell>
                                        <TableCell>₹{app.priceAtBooking}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={app.status}
                                                size="small"
                                                color={getStatusColor(app.status)}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color={app.paymentId ? 'success.main' : 'text.disabled'}>
                                                {app.paymentId ? app.paymentId : 'Not Paid'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{app.Staff?.name}</TableCell>
                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                sx={{ fontSize: '0.8rem', minWidth: 120 }}
                                            >
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="confirmed">Confirmed</MenuItem>
                                                <MenuItem value="completed">Completed</MenuItem>
                                                <MenuItem value="cancelled">Cancelled</MenuItem>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredAppointments.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                        No boarding appointments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredAppointments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    )
}

export default BoardingAppointmentPage
