'use client'

import React, { useEffect, useRef, useState } from 'react'

import CountUp from 'react-countup'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Tooltip,
  Typography,
  Box,
  IconButton,
  Modal,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CardHeader
} from '@mui/material'
import { Edit as EditIcon, Visibility as ViewIcon, ProductionQuantityLimits } from '@mui/icons-material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import ProtectedRoutes from '@/components/ProtectedRoute'
import CustomTextField from '@core/components/mui/TextField'
import { getAllCollections, getAllOrders, updateOrder } from '@/app/api'

const OrdersTable = () => {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subheaderText, setSubheaderText] = useState('Add Product')
  const [selectedOrderForView, setSelectedOrderForView] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  // NEW STATES for Items and MRP modals:
  const [selectedOrderForItems, setSelectedOrderForItems] = useState(null)
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false)
  const [selectedOrderForMRP, setSelectedOrderForMRP] = useState(null)
  const [isMRPModalOpen, setIsMRPModalOpen] = useState(false)

  // Editable fields for order updates
  const [formData, setFormData] = useState({
    dispatchedDate: '',
    outForDeliveryDate: '',
    deliveredDate: '',
    courierName: '',
    trackingId: '',
    status: ''
  })

  // Debounced input (unchanged)
  const DebouncedInput = ({ value: initialValue, onChange, debounce = 700, ...props }) => {
    const [value, setValue] = useState(initialValue)
    const [typing, setTyping] = useState(false)
    const timeoutRef = useRef(null)

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
      if (!typing) return
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        onChange(value)
      }, debounce)
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [value, onChange, debounce])

    return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} />
  }

  const [selectedOption, setSelectedOption] = useState('')

  // (Other existing code for subheader text cycling)
  useEffect(() => {
    const interval = setInterval(() => {
      setSubheaderText(prev => (prev === 'Add Product' ? 'Edit Product' : 'Add Product'))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllOrders = async () => {
    try {
      const response = await getAllOrders()
      console.log('or', response)
      if (response.status === 200) {
        setOrders(response.data.data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const filteredOrders = orders.filter(order => order?.name?.toLowerCase().includes(globalFilter.toLowerCase()))

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // --- Modal handlers for update (existing) ---
  const handleOpenModal = order => {
    console.log('Opening modal for order:', order)
    const customAttributesMap = order?.customAttributes?.reduce((acc, attr) => {
      acc[attr.key] = attr.value
      return acc
    }, {})
    setSelectedOrder(order)
    setFormData({
      dispatchedDate: customAttributesMap?.dispatchedDate ? new Date(customAttributesMap?.dispatchedDate) : null,
      outForDeliveryDate: customAttributesMap?.outForDeliveryDate
        ? new Date(customAttributesMap.outForDeliveryDate)
        : null,
      deliveredDate: customAttributesMap?.deliveredDate ? new Date(customAttributesMap?.deliveredDate) : null,
      courierName: customAttributesMap?.courierName || '',
      trackingId: customAttributesMap?.trackingId || '',
      status: customAttributesMap?.status || ''
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  const handleFormChange = e => {
    const { name, value } = e.target
    setFormData(prev => {
      const updatedFormData = { ...prev, [name]: value }
      if (name === 'status') {
        switch (value) {
          case 'dispatched':
            return {
              ...updatedFormData,
              dispatchedDate: prev.dispatchedDate || new Date().toISOString().split('T')[0]
            }
          case 'outForDelivery':
            return {
              ...updatedFormData,
              dispatchedDate: prev.dispatchedDate || new Date().toISOString().split('T')[0],
              outForDeliveryDate: prev.outForDeliveryDate || new Date().toISOString().split('T')[0]
            }
          case 'delivered':
            return {
              ...updatedFormData,
              dispatchedDate: prev.dispatchedDate || new Date().toISOString().split('T')[0],
              outForDeliveryDate: prev.outForDeliveryDate || new Date().toISOString().split('T')[0],
              deliveredDate: prev.deliveredDate || new Date().toISOString().split('T')[0]
            }
          default:
            return updatedFormData
        }
      }
      return updatedFormData
    })
  }

  const isSaveDisabled = () => {
    const { status, dispatchedDate, outForDeliveryDate, deliveredDate } = formData
    if (status === 'dispatched' && !dispatchedDate) return true
    if (status === 'outForDelivery' && (!dispatchedDate || !outForDeliveryDate)) return true
    if (status === 'delivered' && (!dispatchedDate || !outForDeliveryDate || !deliveredDate)) return true
    return false
  }
  function toShortUTCString(date) {
    // 1) Convert to ISO: "2025-03-12T14:30:00.000Z"
    // 2) Remove milliseconds:
    //    split at '.' => ["2025-03-12T14:30:00", "000Z"]
    //    then add "Z" => "2025-03-12T14:30:00Z"
    return date?.toISOString()?.split('.')[0] + 'Z'
  }

  const handleSaveChanges = async () => {
    if (!selectedOrder) return
    const dispatchTimeStr = formData.dispatchedDate ? toShortUTCString(formData.dispatchedDate) : ''
    const outForDeliveryStr = formData.outForDeliveryDate ? toShortUTCString(formData.outForDeliveryDate) : ''
    const deliveredDateStr = formData.deliveredDate ? toShortUTCString(formData.deliveredDate) : ''
    const data = [
      { key: 'dispatchedDate', value: dispatchTimeStr },
      { key: 'outForDeliveryDate', value: outForDeliveryStr },
      { key: 'deliveredDate', value: deliveredDateStr },
      { key: 'courierName', value: formData.courierName },
      { key: 'trackingId', value: formData.trackingId },
      { key: 'status', value: formData.status }
    ]
    try {
      const response = await updateOrder(selectedOrder.id, data)
      console.log('Order updated successfully:', response)
      toast.success('Order updated successfully!')
      setIsModalOpen(false)
      fetchAllOrders()
    } catch (error) {
      toast.error('Error updating order!')
      console.error('Error updating order:', error)
    }
  }

  const handleViewDetails = order => {
    setSelectedOrderForView(order)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setSelectedOrderForView(null)
    setIsViewModalOpen(false)
  }

  // --- New Handlers for Total Items Modal ---
  const handleOpenItemsModal = order => {
    console.log('order', order)
    setSelectedOrderForItems(order)
    setIsItemsModalOpen(true)
  }
  const handleCloseItemsModal = () => {
    setSelectedOrderForItems(null)
    setIsItemsModalOpen(false)
  }

  // --- New Handlers for MRP Modal ---
  const handleOpenMRPModal = order => {
    setSelectedOrderForMRP(order)
    setIsMRPModalOpen(true)
  }
  const handleCloseMRPModal = () => {
    setSelectedOrderForMRP(null)
    setIsMRPModalOpen(false)
  }

  // Helper to extract custom attribute (unchanged)
  const extractCustomAttribute = (order, key) => {
    const attribute = order.customAttributes?.find(attr => attr.key === key)
    if (!attribute) return 'N/A'
    if (key === 'status' || key === 'courierName' || key === 'trackingId') {
      return attribute.value
    }
    return attribute.value ? new Date(attribute.value).toLocaleDateString('en-GB') : 'N/A'
  }

  // Helper to compute total items (sum of quantities)
  const getTotalItems = order => {
    if (!order.items) return 0
    return order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  }

  // Helper to compute total MRP (sum of each item's mrp * quantity)
  const getTotalMRP = order => {
    // Assume each item has an 'mrp' field (if not, fallback to 0)
    // return order.note.reduce(
    //   (sum, item) => sum + (Number(item?.note?.originalAmount) || 0) * (Number(item.quantity) || 0),
    //   0
    // )
    return order?.note?.originalAmount
  }

  const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <TextField fullWidth variant='outlined' onClick={onClick} value={value} placeholder={placeholder} ref={ref} />
  ))

  return (
    <Box sx={{ padding: 4, maxWidth: '1800px', margin: 'auto' }}>
      <ToastContainer />
      <CardHeader
        avatar={<ProductionQuantityLimits color='primary' fontSize='large' />}
        title='Orders Management'
        titleTypographyProps={{
          variant: 'h5',
          color: 'textPrimary',
          fontWeight: 'bold'
        }}
        subheader={'View Orders'}
      />
      <Box sx={{ paddingBottom: 6 }}>
        <TextField
          label='Search Orders'
          variant='outlined'
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          sx={{ width: '300px', marginBottom: 2 }}
        />
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Order ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Customer Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Processed At</strong>
                </TableCell>
                <TableCell>
                  <strong>Subtotal</strong>
                </TableCell>

                {/* New Columns */}
                <TableCell>
                  <strong>Ordered From</strong>
                </TableCell>
                <TableCell>
                  <strong>Delivery Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Total Items</strong>
                </TableCell>
                <TableCell>
                  <strong>MRP</strong>
                </TableCell>
                {/* Existing Columns */}
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Cancelled Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Refund Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Dispatched Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Out for Delivery</strong>
                </TableCell>
                <TableCell>
                  <strong>Delivered Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Courier</strong>
                </TableCell>
                <TableCell>
                  <strong>TrackingId</strong>
                </TableCell>
                <TableCell>
                  <strong>Address</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(order => {
                const status = extractCustomAttribute(order, 'status')
                const totalItems = getTotalItems(order)
                const totalMRP = getTotalMRP(order)
                const mrp = order.totals
                return (
                  <TableRow key={order.id}>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.addresses.billing.name}</TableCell>
                    <TableCell>{new Date(order.processedAt).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>
                      <CountUp start={0} end={Number(order?.note?.totals?.payableAmount)} />{' '}
                      {order.pricing.subtotal.currency}
                    </TableCell>
                    <TableCell>{order?.note?.deviceType || 'n/a'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{order?.note?.deliveryType || 'n/a'}</TableCell>
                    {/* Total Items Column */}
                    <TableCell
                      sx={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => handleOpenItemsModal(order)}
                    >
                      {totalItems}
                    </TableCell>
                    {/* MRP Column */}
                    <TableCell
                      sx={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => handleOpenMRPModal(order)}
                    >
                      {totalMRP}
                    </TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{extractCustomAttribute(order, 'cancelledDate')}</TableCell>
                    <TableCell>{extractCustomAttribute(order, 'refundedDate')}</TableCell>
                    <TableCell>{extractCustomAttribute(order, 'dispatchedDate') || 'N/A'}</TableCell>
                    <TableCell>{extractCustomAttribute(order, 'outForDeliveryDate') || 'N/A'}</TableCell>
                    <TableCell>{extractCustomAttribute(order, 'deliveredDate') || 'N/A'}</TableCell>
                    <TableCell>{extractCustomAttribute(order, 'courierName') || 'N/A'}</TableCell>
                    <TableCell>{extractCustomAttribute(order, 'trackingId') || 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip
                        title={
                          <Box>
                            <Typography variant='body2'>
                              <strong>Name:</strong> {order?.addresses?.shipping?.name || 'N/A'}
                            </Typography>
                            <Typography variant='body2'>
                              <strong>Address 1:</strong> {order?.addresses?.shipping?.address1 || 'N/A'}
                            </Typography>
                            <Typography variant='body2'>
                              <strong>Address 2:</strong> {order?.addresses?.shipping?.address2 || 'N/A'}
                            </Typography>
                            <Typography variant='body2'>
                              <strong>City:</strong> {order?.addresses?.shipping?.city || 'N/A'}
                            </Typography>
                            <Typography variant='body2'>
                              <strong>Province:</strong> {order?.addresses?.shipping?.province || 'N/A'}
                            </Typography>
                            <Typography variant='body2'>
                              <strong>Country:</strong> {order?.addresses?.shipping?.country || 'N/A'}
                            </Typography>
                            <Typography variant='body2'>
                              <strong>ZIP:</strong> {order?.addresses?.shipping?.zip || 'N/A'}
                            </Typography>
                            <Typography variant='body2'>
                              <strong>Phone:</strong> {order?.addresses?.shipping?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        }
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: '#ffffff', // White background
                              color: '#000000', // Black text
                              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow
                              fontSize: '14px'
                            }
                          }
                        }}
                      >
                        <span>{`${order?.addresses?.shipping?.city || ''}, ${order?.addresses?.shipping?.country || ''}`}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenModal(order)} disabled={status === 'refunded'}>
                        <EditIcon />
                      </IconButton>
                      {/* <IconButton onClick={() => handleViewDetails(order)}>
                        <ViewIcon />
                      </IconButton> */}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={filteredOrders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Existing Order Details Modal (for editing/updating) */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth='sm' fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <TextField
                select
                label='Order Status'
                fullWidth
                margin='normal'
                name='status'
                value={formData.status || ''}
                onChange={handleFormChange}
                SelectProps={{ native: true }}
              >
                <option value='placed'>Placed</option>
                <option value='dispatched'>Dispatched</option>
                <option value='outForDelivery'>Out for Delivery</option>
                <option value='delivered'>Delivered</option>
              </TextField>
              <TextField
                label='Order Placed Date'
                fullWidth
                margin='normal'
                value={new Date(selectedOrder?.processedAt).toLocaleString('en-GB')}
                InputProps={{ readOnly: true }}
              />
              {formData.status === 'dispatched' && (
                <div style={{ marginTop: 16 }}>
                  <label>Dispatch Date & Time</label>
                  <DatePicker
                    selected={new Date(formData?.dispatchedDate)}
                    onChange={date => setFormData(prev => ({ ...prev, dispatchedDate: date }))}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat='Pp'
                    placeholderText='Select delivered date & time'
                    customInput={<CustomDateInput />}
                    withPortal
                  />
                </div>
              )}
              {(formData.status === 'outForDelivery' || formData.status === 'delivered') && (
                <>
                  <div style={{ marginTop: 16 }}>
                    <label>Dispatch Date & Time</label>
                    <DatePicker
                      selected={new Date(formData?.dispatchedDate)}
                      onChange={date => setFormData(prev => ({ ...prev, dispatchedDate: date }))}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat='dd/MM/yyyy h:mm aa'
                      placeholderText='Select dispatch date & time'
                      customInput={<CustomDateInput />}
                      withPortal
                    />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label>Out for Delivery Date & Time</label>
                    <DatePicker
                      selected={new Date(formData?.outForDeliveryDate)}
                      onChange={date => setFormData(prev => ({ ...prev, outForDeliveryDate: date }))}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat='dd/MM/yyyy h:mm aa'
                      placeholderText='Select delivered date & time'
                      customInput={<CustomDateInput />}
                      withPortal
                    />
                  </div>
                </>
              )}
              {formData?.status === 'delivered' && (
                <div style={{ marginTop: 16 }}>
                  <label>Delivered Date & Time</label>
                  <DatePicker
                    selected={new Date(formData?.deliveredDate)}
                    onChange={date => setFormData(prev => ({ ...prev, deliveredDate: date }))}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat='dd/MM/yyyy h:mm aa'
                    placeholderText='Select delivered date & time'
                    customInput={<CustomDateInput />}
                    withPortal
                  />
                </div>
              )}
              <TextField
                label='Courier Name'
                fullWidth
                margin='normal'
                name='courierName'
                value={formData.courierName}
                onChange={handleFormChange}
              />
              <TextField
                label='Tracking ID'
                fullWidth
                margin='normal'
                name='trackingId'
                value={formData.trackingId}
                onChange={handleFormChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color='primary' disabled={isSaveDisabled()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Existing View Order Modal */}
      <Dialog open={isViewModalOpen} onClose={handleCloseViewModal} maxWidth='sm' fullWidth>
        <DialogTitle>View Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrderForView && (
            <>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Items
              </Typography>
              {selectedOrderForView.items?.map((item, idx) => (
                <Typography variant='body2' key={idx}>
                  • {item.title} (Qty: {item.quantity})
                </Typography>
              ))}
              <Box mt={3}>
                <Typography variant='h6' gutterBottom>
                  Totals
                </Typography>
                {selectedOrderForView?.note?.totals ? (
                  <Box sx={{ ml: 2 }}>
                    <Typography variant='body2'>
                      <strong>Original Amount:</strong> {selectedOrderForView.note.totals.originalAmount}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Total Discount:</strong> {selectedOrderForView.note.totals.totalDiscount}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Instant Discount:</strong> {selectedOrderForView.note.totals.instantDiscount}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>PawPoints Cashback:</strong> {selectedOrderForView.note.totals.pawPointsCashback}
                    </Typography>
                    <Typography variant='body2'>
                      <strong>Payable Amount:</strong> {selectedOrderForView.note.totals.payableAmount}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant='body2'>No totals information available.</Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewModal} color='primary' autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Modal for Items Details */}
      <Dialog open={isItemsModalOpen} onClose={handleCloseItemsModal} maxWidth='sm' fullWidth>
        <DialogTitle>Order Items</DialogTitle>
        <DialogContent dividers>
          {selectedOrderForItems && (
            <Box>
              <Typography variant='body1' gutterBottom>
                Total Items: {getTotalItems(selectedOrderForItems)}
              </Typography>
              <ul>
                {selectedOrderForItems?.items?.map((item, idx) => (
                  <li key={idx}>
                    <Typography variant='body2'>
                      {item.title} - Qty: {item.quantity} - Price:{' '}
                      {selectedOrderForItems.note ? selectedOrderForItems?.note?.originalAmount : 'N/A'}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemsModal} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Modal for MRP Breakdown */}
      {/* <Dialog open={isMRPModalOpen} onClose={handleCloseMRPModal} maxWidth='sm' fullWidth>
        <DialogTitle>MRP Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrderForMRP && selectedOrderForMRP.note?.totals ? (
            <Box sx={{ ml: 2 }}>
              <Typography variant='body2'>
                <strong>Original Amount:</strong> {selectedOrderForMRP.note.totals.originalAmount}
              </Typography>
              <Typography variant='body2'>
                <strong>Total Discount:</strong> {selectedOrderForMRP.note.totals.totalDiscount}
              </Typography>
              <Typography variant='body2'>
                <strong>Instant Discount:</strong> {selectedOrderForMRP.note.totals.instantDiscount}
              </Typography>
              <Typography variant='body2'>
                <strong>PawPoints Cashback:</strong> {selectedOrderForMRP.note.totals.pawPointsCashback}
              </Typography>
              <Typography variant='body2'>
                <strong>Payable Amount:</strong> {selectedOrderForMRP.note.totals.payableAmount}
              </Typography>
            </Box>
          ) : (
            <Typography variant='body2'>No MRP details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMRPModal} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* New Modal for MRP Breakdown */}
      <Dialog open={isMRPModalOpen} onClose={handleCloseMRPModal} maxWidth='sm' fullWidth>
        <DialogTitle>MRP Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrderForMRP && selectedOrderForMRP.note ? (
            <Box sx={{ ml: 2 }}>
              {/* Existing Totals (if available) */}
              {selectedOrderForMRP.note.totals && (
                <>
                  <Typography variant='body2'>
                    <strong>Original Amount:</strong> {selectedOrderForMRP.note.totals.originalAmount}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Total Discount:</strong> {selectedOrderForMRP.note.totals.totalDiscount}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Instant Discount:</strong> {selectedOrderForMRP.note.totals.instantDiscount}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>PawPoints Cashback:</strong> {selectedOrderForMRP.note.totals.pawPointsCashback}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Payable Amount:</strong> {selectedOrderForMRP.note.totals.payableAmount}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Delivery Charge:</strong> {selectedOrderForMRP.note.totals.deliveryCharge}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Sub Total(including delivery):</strong>{' '}
                    {Number(selectedOrderForMRP.note.totals.payableAmount) +
                      Number(selectedOrderForMRP.note.totals.deliveryCharge)}
                  </Typography>
                </>
              )}

              {/* New Details */}
              {selectedOrderForMRP.note.name && (
                <Typography variant='body2' sx={{ mt: 2 }}>
                  <strong>Order Name:</strong> {selectedOrderForMRP.note.name}
                </Typography>
              )}

              {selectedOrderForMRP.note.discounts && selectedOrderForMRP.note.discounts.coupon && (
                <>
                  <Typography variant='body2' sx={{ mt: 2 }}>
                    <strong>Coupon Code:</strong> {selectedOrderForMRP.note.discounts.coupon.code}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Coupon Applied:</strong>{' '}
                    {selectedOrderForMRP.note.discounts.coupon.couponApplied ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Discount Value:</strong> {selectedOrderForMRP.note.discounts.coupon.discountValue}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Coupon Savings:</strong> {selectedOrderForMRP.note.discounts.coupon.savings}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Coupon Type:</strong> {selectedOrderForMRP.note.discounts.coupon.type || 'n/a'}
                  </Typography>
                </>
              )}

              {selectedOrderForMRP.note.mrp && (
                <Typography variant='body2' sx={{ mt: 2 }}>
                  <strong>MRP Savings:</strong> {selectedOrderForMRP.note.mrp.savings}
                </Typography>
              )}

              {selectedOrderForMRP.note.pawPoints && (
                <Typography variant='body2' sx={{ mt: 2 }}>
                  <strong>PawPoints Applied:</strong>{' '}
                  {selectedOrderForMRP.note.pawPoints.pawPointsApplied ? 'Yes' : 'No'} - <strong>Savings:</strong>{' '}
                  {selectedOrderForMRP.note.pawPoints.savings}
                </Typography>
              )}

              {selectedOrderForMRP.note.subscription && (
                <Typography variant='body2' sx={{ mt: 2 }}>
                  <strong>Subscription Savings:</strong> {selectedOrderForMRP.note.subscription.savings} -{' '}
                  <strong>Type:</strong> {selectedOrderForMRP.note.subscription.type}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant='body2'>No MRP details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMRPModal} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const ProtectedChatPage = () => {
  return (
    <ProtectedRoutes requiredPermission='shop'>
      <OrdersTable />
    </ProtectedRoutes>
  )
}

export default ProtectedChatPage
