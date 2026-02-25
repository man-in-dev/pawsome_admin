'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
    Typography,
    TextField,
    Button,
    FormControl,
    FormControlLabel,
    Switch,
    Box,
    IconButton,
    Avatar,
    Autocomplete
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import {
    uploadImage,
    createBoardingFacility,
    updateBoardingFacility,
    getAllBoardingStaff
} from '@/app/api'

const BoardingFacilityForm = ({ fetchFacilities, onSubmit, initialData, onClose }) => {
    const [mediaUrls, setMediaUrls] = useState([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [allStaff, setAllStaff] = useState([])
    const [selectedStaff, setSelectedStaff] = useState([])

    const [facilityData, setFacilityData] = useState({
        id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        images: [],
        coordinates: [0, 0],
        regularFees: 0,
        silverFees: 0,
        goldFees: 0,
        fees: 0,
        timing: '',
        speciality: '',
        status: true,
        ...initialData
    })

    const [openTime, setOpenTime] = useState({ hour: '10', minute: '00', period: 'AM' })
    const [closeTime, setCloseTime] = useState({ hour: '08', minute: '00', period: 'PM' })

    const [errors, setErrors] = useState({})

    const fetchAllStaff = async () => {
        try {
            const response = await getAllBoardingStaff()
            setAllStaff(response.data.data || [])
        } catch (error) {
            console.error('Error fetching staff:', error)
        }
    }

    useEffect(() => {
        fetchAllStaff()
    }, [])

    useEffect(() => {
        if (initialData) {
            setFacilityData(prevData => ({
                ...prevData,
                ...initialData
            }))
            setMediaUrls(initialData.images || [])
            if (initialData.Staff) {
                setSelectedStaff(initialData.Staff)
            }
            if (initialData.timing) {
                const parts = initialData.timing.split(' - ')
                if (parts.length === 2) {
                    const openParts = parts[0].match(/(\d+):(\d+)\s*(AM|PM)/i)
                    const closeParts = parts[1].match(/(\d+):(\d+)\s*(AM|PM)/i)
                    if (openParts) setOpenTime({ hour: openParts[1], minute: openParts[2], period: openParts[3].toUpperCase() })
                    if (closeParts) setCloseTime({ hour: closeParts[1], minute: closeParts[2], period: closeParts[3].toUpperCase() })
                }
            }
        }
    }, [initialData])

    useEffect(() => {
        const timingString = `${openTime.hour}:${openTime.minute} ${openTime.period} - ${closeTime.hour}:${closeTime.minute} ${closeTime.period}`
        setFacilityData(prev => ({ ...prev, timing: timingString }))
    }, [openTime, closeTime])

    const handleImageUpload = async e => {
        const files = Array.from(e.target.files)
        const imageUrls = []

        for (let file of files) {
            try {
                const formData = new FormData()
                formData.append('file', file)
                const response = await uploadImage(formData)
                if (response) {
                    const imageUrl = response?.data?.data.fileUrl
                    imageUrls.push(imageUrl)
                } else {
                    toast.error('Failed to upload image')
                }
            } catch (error) {
                toast.error('Error uploading image')
            }
        }
        setMediaUrls(prevUrls => [...prevUrls, ...imageUrls])
    }

    const handleRemoveImage = index => {
        setMediaUrls(prevUrls => prevUrls.filter((_, i) => i !== index))
    }

    const handleNextImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % mediaUrls.length)
    }

    const handlePreviousImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex - 1 + mediaUrls.length) % mediaUrls.length)
    }

    const handleInputChange = async e => {
        const { name, value } = e.target
        setFacilityData(prevData => ({ ...prevData, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))

        if (name === 'address') {
            // Auto-fetch coordinates if possible or user can enter manually
        }
    }

    const handleCoordinatesChange = (index, value) => {
        const newCoordinates = [...facilityData.coordinates]
        newCoordinates[index] = parseFloat(value) || 0
        setFacilityData(prevData => ({ ...prevData, coordinates: newCoordinates }))
    }

    const validate = () => {
        const tempErrors = {}
        if (!facilityData.name.trim()) tempErrors.name = 'Facility Name is required'
        if (!facilityData.address.trim()) tempErrors.address = 'Address is required'
        if (!facilityData.city.trim()) tempErrors.city = 'City is required'
        if (!mediaUrls.length) tempErrors.images = 'At least one image is required'
        if (isNaN(facilityData.regularFees) || facilityData.regularFees < 0) tempErrors.regularFees = 'Invalid fee'
        if (isNaN(facilityData.goldFees) || facilityData.goldFees < 0) tempErrors.goldFees = 'Invalid fee'

        setErrors(tempErrors)
        return Object.keys(tempErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error('Please fix errors before submitting')
            return
        }

        try {
            const { Staff, Ratings, createdAt, updatedAt, ...rest } = facilityData
            const payload = {
                ...rest,
                images: mediaUrls,
                regularFees: Number(facilityData.regularFees),
                silverFees: Number(facilityData.silverFees),
                goldFees: Number(facilityData.goldFees),
                fees: Number(facilityData.fees),
                coordinates: facilityData.coordinates.map(Number),
                staffIds: selectedStaff.map(s => s.id)
            }

            if (initialData?.id) {
                const response = await updateBoardingFacility(initialData.id, payload)
                if (response.status === 200) {
                    toast.success('Facility updated successfully')
                }
            } else {
                const response = await createBoardingFacility(payload)
                if (response.status === 200 || response.status === 201) {
                    toast.success('Facility created successfully')
                }
            }

            onSubmit(facilityData)
            fetchFacilities()
            onClose()
        } catch (error) {
            toast.error('Error saving facility: ' + (error.response?.data?.message || error.message))
        }
    }

    return (
        <Box component="form" sx={{ p: 2 }}>
            <TextField
                name='name'
                label='Facility Name'
                value={facilityData.name}
                fullWidth
                margin='normal'
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
            />
            <TextField
                name='address'
                label='Address'
                value={facilityData.address}
                fullWidth
                margin='normal'
                multiline
                rows={2}
                onChange={handleInputChange}
                error={!!errors.address}
                helperText={errors.address}
            />
            <Box display='flex' gap={2}>
                <TextField
                    name='speciality'
                    label='Speciality'
                    value={facilityData.speciality}
                    fullWidth
                    margin='normal'
                    onChange={handleInputChange}
                />
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>Opening and Closing Time</Typography>
            <Box display='flex' gap={2} mb={2}>
                <Box display='flex' gap={1} flex={1}>
                    <TextField
                        select
                        label="Hour"
                        value={openTime.hour}
                        SelectProps={{ native: true }}
                        onChange={(e) => setOpenTime({ ...openTime, hour: e.target.value })}
                        fullWidth
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <option key={h} value={h < 10 ? `0${h}` : h}>{h < 10 ? `0${h}` : h}</option>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Minute"
                        value={openTime.minute}
                        SelectProps={{ native: true }}
                        onChange={(e) => setOpenTime({ ...openTime, minute: e.target.value })}
                        fullWidth
                    >
                        {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="AM/PM"
                        value={openTime.period}
                        SelectProps={{ native: true }}
                        onChange={(e) => setOpenTime({ ...openTime, period: e.target.value })}
                        fullWidth
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </TextField>
                </Box>
                <Box display='flex' gap={1} flex={1}>
                    <TextField
                        select
                        label="Hour"
                        value={closeTime.hour}
                        SelectProps={{ native: true }}
                        onChange={(e) => setCloseTime({ ...closeTime, hour: e.target.value })}
                        fullWidth
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <option key={h} value={h < 10 ? `0${h}` : h}>{h < 10 ? `0${h}` : h}</option>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Minute"
                        value={closeTime.minute}
                        SelectProps={{ native: true }}
                        onChange={(e) => setCloseTime({ ...closeTime, minute: e.target.value })}
                        fullWidth
                    >
                        {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="AM/PM"
                        value={closeTime.period}
                        SelectProps={{ native: true }}
                        onChange={(e) => setCloseTime({ ...closeTime, period: e.target.value })}
                        fullWidth
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </TextField>
                </Box>
            </Box>

            <Box display='flex' gap={2}>
                <TextField
                    name='city'
                    label='City'
                    value={facilityData.city}
                    fullWidth
                    margin='normal'
                    onChange={handleInputChange}
                    error={!!errors.city}
                    helperText={errors.city}
                />
                <TextField
                    name='state'
                    label='State'
                    value={facilityData.state}
                    fullWidth
                    margin='normal'
                    onChange={handleInputChange}
                />
            </Box>
            <TextField
                name='pinCode'
                label='Pin Code'
                value={facilityData.pinCode}
                fullWidth
                margin='normal'
                onChange={handleInputChange}
            />

            <Box display='flex' gap={2} mt={2}>
                <TextField
                    type='number'
                    name='regularFees'
                    label='Regular Fees / Day'
                    fullWidth
                    value={facilityData.regularFees}
                    onChange={handleInputChange}
                    error={!!errors.regularFees}
                    helperText={errors.regularFees}
                />
                <TextField
                    type='number'
                    name='silverFees'
                    label='Silver Fees / Day'
                    fullWidth
                    value={facilityData.silverFees}
                    onChange={handleInputChange}
                />
                <TextField
                    type='number'
                    name='goldFees'
                    label='Gold Fees / Day'
                    fullWidth
                    value={facilityData.goldFees}
                    onChange={handleInputChange}
                    error={!!errors.goldFees}
                    helperText={errors.goldFees}
                />
                <TextField
                    type='number'
                    name='fees'
                    label='Service Fees'
                    fullWidth
                    value={facilityData.fees}
                    onChange={handleInputChange}
                />
            </Box>

            <Box display='flex' gap={2} mt={2}>
                <TextField
                    type='number'
                    label='Latitude'
                    fullWidth
                    value={facilityData.coordinates[0]}
                    onChange={e => handleCoordinatesChange(0, e.target.value)}
                />
                <TextField
                    type='number'
                    label='Longitude'
                    fullWidth
                    value={facilityData.coordinates[1]}
                    onChange={e => handleCoordinatesChange(1, e.target.value)}
                />
            </Box>

            <Autocomplete
                multiple
                id="staff-select"
                options={allStaff}
                getOptionLabel={(option) => option.name || ''}
                value={selectedStaff}
                onChange={(event, newValue) => {
                    setSelectedStaff(newValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Assign Caretakers"
                        placeholder="Select Caretakers"
                        margin="normal"
                    />
                )}
                renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={option.profilePicture} sx={{ width: 24, height: 24 }}>{option.name?.charAt(0)}</Avatar>
                        <Box>
                            <Typography variant="body2">{option.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{option.Facility?.name ? `Currently in: ${option.Facility.name}` : 'Unassigned'}</Typography>
                        </Box>
                    </Box>
                )}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={facilityData.status}
                        onChange={e => setFacilityData({ ...facilityData, status: e.target.checked })}
                    />
                }
                label='Active Status'
                sx={{ mt: 2 }}
            />

            <Typography variant='subtitle1' sx={{ mt: 2 }}>Images</Typography>
            <Box display='flex' flexWrap='wrap' gap={1} mt={1}>
                {mediaUrls.map((url, index) => (
                    <Box key={index} position='relative'>
                        <img src={url} alt="facility" width='80' height='80' style={{ objectFit: 'cover', borderRadius: '4px' }} />
                        <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'white', '&:hover': { bgcolor: '#eee' } }}
                        >
                            <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                    </Box>
                ))}
                <Button variant="outlined" component="label" sx={{ width: 80, height: 80 }}>
                    +
                    <input type="file" multiple hidden onChange={handleImageUpload} />
                </Button>
            </Box>

            <Box display='flex' justifyContent='space-between' mt={4}>
                <Button variant='outlined' color='secondary' onClick={onClose}>
                    Cancel
                </Button>
                <Button variant='contained' color='primary' onClick={handleSubmit}>
                    Save Facility
                </Button>
            </Box>
        </Box>
    )
}

export default BoardingFacilityForm
