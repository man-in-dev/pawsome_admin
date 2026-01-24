'use client'

import { useEffect, useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CardHeader,
  IconButton,
  Modal,
  Box,
  Typography,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Icon,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  FormControlLabel,
  Switch
} from '@mui/material'

import { Edit, Delete, Add, Image, Wallpaper, WallpaperTwoTone } from '@mui/icons-material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import CountUp from 'react-countup'

import {
  getAllBanners,
  createBanner,
  uploadImage,
  editBanner,
  deleteBanner,
  getAllCollections,
  getAllProducts,
  getAllHospital,
  getAllPackages,
  getAllPlans
} from '@/app/api'

import ProtectedRoutes from '@/components/ProtectedRoute'

const BannerType = {
  Veterinary: 'veterinary',
  Shop: 'shop',
  Subscription: 'subscription',
  Website: 'website'
}

const BannerPage = () => {
  const [allBanners, setAllBanners] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  // const [newBannerData, setNewBannerData] = useState({ title: '', type: BannerType.Shop })
  const [mediaUrl, setMediaUrl] = useState(null)
  const [webMedia, setWebMedia] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState(null)
  const [userRole, setUserRole] = useState('')
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    type: '',
    image: ''
  })

  // Extend your state to include the dynamic fields:
  const [newBannerData, setNewBannerData] = useState({
    title: '',
    type: BannerType.Shop,
    // Fields for Shop type
    shopOption: '', // will be either 'product' or 'collection'
    productId: '',
    collectionId: '',
    // Fields for Veterinary type
    vetOption: '', // will be either 'in-house' or 'clinic'
    clinicId: '',
    // Fields for Subscription type
    subscriptionOption: '', // e.g., 'gold', 'silver', 'backed'
    websiteOption: '', // 'none' or 'website'
    website: '',
    webImage: '',
    isBrand: false
  })

  // COLLECTION STATE
  const [collectionData, setCollectionData] = useState([])
  const [productLists, setProductLists] = useState([])
  const [clinicLists, setClinicLists] = useState([])

  const [packageLists, setPackageLists] = useState([])

  const [membershipData, setMembershipData] = useState([])

  const fetchPackage = async () => {
    try {
      const response = await getAllPackages()
      if (response.status === 200) {
        console.log('package', response.data.data)
        setPackageLists(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // apis to
  const fetchCollections = async () => {
    try {
      const response = await getAllCollections()
      if (response.status === 200) {
        console.log('coll', response.data.data)
        setCollectionData(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchProductLists = async () => {
    try {
      const response = await getAllProducts()
      if (response.status === 200) {
        console.log('pp', response.data.data.products)
        setProductLists(response.data.data.products)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const fetchClinicLists = async () => {
    // fetch clinic lists
    try {
      const response = await getAllHospital()
      if (response.status === 200) {
        console.log('clinic', response.data.data)
        setClinicLists(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchMemberships = async () => {
    try {
      const response = await getAllPlans()
      if (response.status === 200) {
        console.log('mem', response.data.data)
        setMembershipData(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (newBannerData.type === BannerType.Shop) {
      fetchProductLists()
      fetchCollections()
    } else if (newBannerData.type === BannerType.Veterinary) {
      if (newBannerData.vetOption === 'clinic') {
        fetchClinicLists()
      }
    } else if (newBannerData.type === BannerType.Subscription) {
      fetchMemberships()
    }
  }, [newBannerData.type, newBannerData.vetOption])

  useEffect(() => {
    if (newBannerData.type === BannerType.Veterinary && newBannerData.vetOption === 'home') {
      fetchPackage()
    }
  }, [newBannerData.type, newBannerData.vetOption])

  useEffect(() => {
    if (editData?.type === BannerType.Subscription && membershipData.length === 0) {
      fetchMemberships()
    }
  }, [editData, membershipData.length])

  useEffect(() => {
    const userRole = localStorage.getItem('user')
    if (userRole) {
      const parsedData = JSON.parse(userRole)
      setUserRole(parsedData.role)
    } else {
      setUserRole('')
    }
  }, [])
  // whenever you switch to Shop mode and pick product/collection:
  useEffect(() => {
    if (editData?.type === BannerType.Shop) {
      if (editData.shopOption === 'product') {
        fetchProductLists()
      } else if (editData.shopOption === 'category') {
        fetchCollections()
      }
    }
  }, [editData?.shopOption, editData?.type])

  // whenever you switch to Veterinary mode and pick clinic/home:
  useEffect(() => {
    if (editData?.type === BannerType.Veterinary) {
      if (editData.vetOption === 'clinic') {
        fetchClinicLists()
      } else if (editData.vetOption === 'home') {
        fetchPackage()
      }
    }
  }, [editData?.vetOption, editData?.type])

  const fetchAllBanners = async () => {
    try {
      const response = await getAllBanners()
      if (response.status === 200) {
        setAllBanners(response?.data?.data?.banners || [])
      }
    } catch (error) {
      console.log(error)
      setAllBanners([])
    }
  }

  useEffect(() => {
    fetchAllBanners()
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const openEditModal = data => {
    console.log('data', data)

    const shopOption = data.productId ? 'product' : data.categoryId ? 'category' : ''
    const vetOption = data.vetType || ''
    const websiteOption = data.link ? 'website' : 'none'

    setEditData({
      ...data,
      shopOption,
      vetOption,
      websiteOption
    })
    setMediaUrl(null)
    setWebMedia(null)
    setEditModalOpen(true)
    // setEditData(data)
    // setEditModalOpen(true)
    // if (data.vetType === 'clinic') {
    //   fetchClinicLists()
    // }
    // if (shopOption === 'collection') fetchCollections()
    // else if (shopOption === 'product') fetchProductLists()
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditData(null)
  }

  // const handleSaveEdit = async () => {
  //   const errors = {}

  //   // Validate title
  //   if (!editData.title.trim()) {
  //     errors.title = 'Title is required'
  //   }

  //   // Validate type
  //   if (!editData.type) {
  //     errors.type = 'Type is required'
  //   }

  //   if (Object.keys(errors).length > 0) {
  //     setValidationErrors(errors)
  //     return
  //   }
  //   try {
  //     const updatedBanner = {
  //       title: editData.title,
  //       type: editData.type,
  //       image: mediaUrl || editData.image
  //     }
  //     await editBanner(editData.id, updatedBanner)
  //     fetchAllBanners()
  //     closeEditModal()
  //     toast.success('Banner updated successfully')
  //   } catch (error) {
  //     console.error(error)
  //     toast.error('Failed to update banner')
  //   }
  // }
  const handleSaveEdit = async () => {
    const errors = {}

    // Validate title
    if (!editData.title.trim()) {
      errors.title = 'Title is required.'
    }

    // Validate type
    if (!editData.type) {
      errors.type = 'Type is required.'
    }

    // Validate image
    if (!mediaUrl && !editData.image) {
      errors.image = 'Image is required.'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors) // Set errors if validation fails
      return
    }
    const payload = {
      title: editData.title,
      type: editData.type,
      image: mediaUrl || editData.image,
      webImage: webMedia || editData.webImage,
      link: editData.link
    }

    // inject type-specific fields
    if (editData.type === BannerType.Shop) {
      payload.shopType = editData.shopOption

      if (editData.shopOption === 'product') {
        payload.productId = editData.productId
      } else {
        payload.categoryId = editData.collectionId
        payload.isBrand = editData.isPaid
        console.log('idpaid', payload)
      }
    } else if (editData.type === BannerType.Veterinary) {
      payload.vetType = editData.vetOption
      if (editData.vetOption === 'clinic') {
        payload.clinicId = editData.clinicId
      } else if (editData.vetOption === 'home') {
        payload.packageId = editData.packageId
      }
    } else if (editData.type === BannerType.Subscription) {
      payload.subscriptionOption = editData.subscriptionOption
      if (editData.websiteOption === 'website') {
        payload.link = editData.website
      }
    } else if (editData.type === BannerType.Website) {
      payload.link = editData.link
    }

    try {
      const updatedBanner = {
        title: editData.title,
        type: editData.type,
        image: mediaUrl || editData.image
      }
      await editBanner(editData.id, payload)
      fetchAllBanners()
      closeEditModal()
      toast.success('Banner updated successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update banner')
    }
  }

  const openAddModal = () => setAddModalOpen(true)
  const closeAddModal = () => {
    setAddModalOpen(false)
    setNewBannerData({ title: '', type: BannerType.HOME })
    setMediaUrl(null)
  }

  const handleAddBanner = async () => {
    const errors = {}

    // Validate required fields
    if (!newBannerData.title.trim()) {
      errors.title = 'Title is required.'
    }
    if (!newBannerData.type) {
      errors.type = 'Type is required.'
    }
    if (!mediaUrl) {
      errors.image = 'Image is required.'
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Prepare the payload
    const payload = {
      title: newBannerData.title,
      image: mediaUrl,
      type: newBannerData.type,
      webImage: webMedia,
      link: newBannerData.link
    }

    if (newBannerData.type === BannerType.Shop) {
      // tell the API whether this is a product-banner or a collection-banner
      payload.shopType = newBannerData.shopOption
      console.log('newBannerData', newBannerData)

      if (newBannerData.shopOption === 'product') {
        payload.productId = newBannerData.productId
        payload.isBrand = newBannerData.isBrand
      } else {
        payload.categoryId = newBannerData.collectionId
        payload.isBrand = newBannerData.isBrand
        console.log('else', payload)
      }
    } else if (newBannerData.type === BannerType.Veterinary) {
      // For Veterinary banners, set the appropriate field based on the vet option.
      if (newBannerData.vetOption === 'clinic') {
        payload.clinicId = newBannerData.clinicId
        payload.vetType = 'clinic'
      } else if (newBannerData.vetOption === 'home') {
        payload.packageId = newBannerData.packageId
        payload.vetType = 'home'
      }
    } else if (newBannerData.type === BannerType.Subscription) {
      // For Subscription banners, include website URL if the option is chosen.
      if (newBannerData.websiteOption === 'website') {
        payload.link = newBannerData.website
      }
      // Optionally include subscriptionOption if needed.
      // payload.subscriptionOption = newBannerData.subscriptionOption;
    } else if (newBannerData.type === BannerType.Website) {
      payload.link = newBannerData.link
    }

    try {
      await createBanner(payload)
      fetchAllBanners()
      closeAddModal()
      toast.success('Banner added successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to add banner')
    }
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadImage(formData)

      if (response.status === 200) {
        const imageUrl = response?.data?.data.fileUrl
        setMediaUrl(imageUrl)
        toast.success('Image uploaded successfully')
      }
    } catch (error) {
      console.error(error)
      toast.error('Image upload failed')
    }
  }
  const handleImageUploadWeb = async e => {
    const file = e.target.files[0]
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadImage(formData)

      if (response.status === 200) {
        const imageUrl = response?.data?.data.fileUrl
        setWebMedia(imageUrl)
        toast.success('Image uploaded successfully')
      }
    } catch (error) {
      console.error(error)
      toast.error('Image upload failed')
    }
  }
  // Open confirmation dialog
  const openDeleteDialog = bannerId => {
    setBannerToDelete(bannerId)
    setDeleteDialogOpen(true)
  }

  // Close confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setBannerToDelete(null)
  }

  // Confirm and delete the banner
  const confirmDeleteBanner = async () => {
    try {
      const response = await deleteBanner(bannerToDelete)
      if (response.status === 200) {
        toast.success('Banner deleted successfully')
        fetchAllBanners()
      } else {
        toast.error('Error deleting banner')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete banner')
    } finally {
      closeDeleteDialog()
    }
  }

  const handleDelete = async bannerId => {
    const response = await deleteBanner(bannerId)
    console.log('delban', response)
    if (response.status === 200) {
      toast.success('Banner deleted')
      fetchAllBanners()
    } else {
      toast.error('Error deleting banner')
      fetchAllBanners()
    }
  }

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    p: 4,
    bgcolor: 'background.paper',
    borderRadius: 2,
    width: 500,
    boxShadow: 24,
    maxHeight: '90vh',
    overflowY: 'auto'
  }

  return (
    <>
      <ToastContainer />
      <CardHeader
        avatar={<Wallpaper color='primary' fontSize='large' />}
        title='Banner Management'
        titleTypographyProps={{
          variant: 'h5', // Set the text size
          color: 'textPrimary', // Optional: Change text color
          fontWeight: 'bold' // Optional: Make it bold
        }}
        subheader={'Create or Edit Banner'}
      />
      <Box display='flex' justifyContent='flex-end' mb={2} mr={2}>
        <Button variant='contained' sx={{ backgroundColor: '#ffA500' }} startIcon={<Add />} onClick={openAddModal}>
          Add Banner
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allBanners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(banner => (
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
                key={banner.id}
              >
                <TableCell>
                  <img src={banner.image} alt={banner.title} style={{ width: '50px', height: '50px' }} />
                </TableCell>
                <TableCell>{banner.title}</TableCell>
                <TableCell>{banner.type}</TableCell>
                <TableCell>
                  <IconButton
                    disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                    onClick={() => openEditModal(banner)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                    onClick={() => openDeleteDialog(banner.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        count={allBanners.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* Edit Modal */}
      <Modal open={isEditModalOpen} onClose={closeEditModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' gutterBottom align='center'>
            Edit Banner
          </Typography>
          <TextField
            fullWidth
            label='Title'
            value={editData?.title || ''}
            onChange={e => {
              setEditData({ ...editData, title: e.target.value })
              setValidationErrors(prev => ({ ...prev, title: '' }))
            }}
            margin='normal'
            error={!!validationErrors.title}
            helperText={validationErrors.title}
          />
          {editData?.type === BannerType.Website && (
            <TextField
              fullWidth
              label='Link URL'
              value={editData?.link || ''}
              onChange={e => setEditData({ ...editData, link: e.target.value })}
              margin='normal'
              placeholder='https://example.com'
            />
          )}
          <FormControl fullWidth margin='normal' error={!!validationErrors.type}>
            <InputLabel>Type</InputLabel>
            <Select
              value={editData?.type || BannerType.Shop}
              onChange={e => {
                // Optionally, reset dynamic fields when type changes.
                setEditData({ ...editData, type: e.target.value })
                setValidationErrors(prev => ({ ...prev, type: '' }))
              }}
            >
              <MenuItem value={BannerType.Shop}>Shop</MenuItem>
              <MenuItem value={BannerType.Veterinary}>Veterinary</MenuItem>
              <MenuItem value={BannerType.Subscription}>Subscription</MenuItem>
              <MenuItem value={BannerType.Website}>Website</MenuItem>
            </Select>
          </FormControl>

          {/* Render dynamic fields based on banner type */}
          {editData?.type === BannerType.Shop && (
            <>
              {/* Shop Option */}
              <FormControl fullWidth margin='normal'>
                <InputLabel>Shop Option</InputLabel>
                <Select
                  value={editData?.shopOption || ''}
                  onChange={e => setEditData({ ...editData, shopOption: e.target.value })}
                >
                  <MenuItem value='product'>Product</MenuItem>
                  <MenuItem value='category'>Collection</MenuItem>
                </Select>
              </FormControl>

              {/* Product selector */}
              {editData?.shopOption === 'product' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={editData?.productId || ''}
                    onChange={e => setEditData({ ...editData, productId: e.target.value })}
                  >
                    {productLists.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Collection selector */}
              {editData?.shopOption === 'category' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Collection</InputLabel>
                  <Select
                    value={editData?.categoryId || ''}
                    onChange={e => setEditData({ ...editData, categoryId: e.target.value })}
                  >
                    {collectionData.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {editData?.shopType === 'product' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={editData?.productId || ''}
                    onChange={e => setEditData({ ...editData, productId: e.target.value })}
                  >
                    {productLists.map(product => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {editData?.shopType === 'collection' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Collection</InputLabel>
                  <Select
                    value={editData?.categoryId || ''}
                    onChange={e => setEditData({ ...editData, categoryId: e.target.value })}
                  >
                    {collectionData.map(collection => (
                      <MenuItem key={collection.id} value={collection.id}>
                        {collection.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}

          {editData?.type === BannerType.Veterinary && (
            <>
              <FormControl fullWidth margin='normal'>
                <InputLabel>Vet Option</InputLabel>
                <Select
                  value={editData?.vetOption || ''}
                  onChange={e => setEditData({ ...editData, vetOption: e.target.value })}
                >
                  <MenuItem value='clinic'>Clinic</MenuItem>
                  <MenuItem value='home'>In-House</MenuItem>
                </Select>
              </FormControl>
              {editData?.vetOption === 'clinic' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Clinic</InputLabel>
                  <Select
                    value={editData?.clinicId || ''}
                    onChange={e => setEditData({ ...editData, clinicId: e.target.value })}
                  >
                    {clinicLists.map(clinic => (
                      <MenuItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {editData?.vetOption === 'home' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Package</InputLabel>
                  <Select
                    value={editData?.packageId || ''}
                    onChange={e => setEditData({ ...editData, packageId: e.target.value })}
                  >
                    {packageLists.map(pkg => (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}

          {editData?.type === BannerType.Subscription && (
            <>
              <FormControl fullWidth margin='normal'>
                <InputLabel>Membership</InputLabel>
                <Select
                  value={editData?.subscriptionOption || ''}
                  onChange={e => setEditData({ ...editData, subscriptionOption: e.target.value })}
                >
                  {membershipData.map(membership => (
                    <MenuItem key={membership.id} value={membership.id}>
                      {membership.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <InputLabel>Website</InputLabel>
                <Select
                  value={editData?.websiteOption || 'none'}
                  onChange={e => setEditData({ ...editData, websiteOption: e.target.value })}
                >
                  <MenuItem value='none'>None</MenuItem>
                  <MenuItem value='website'>Website</MenuItem>
                </Select>
              </FormControl>
              {editData?.websiteOption === 'website' && (
                <TextField
                  fullWidth
                  label='Website URL'
                  value={editData?.website || ''}
                  onChange={e => setEditData({ ...editData, website: e.target.value })}
                  margin='normal'
                />
              )}
            </>
          )}

          <Box mt={2} mb={2}>
            <Typography variant='body1' gutterBottom>
              Upload Image
            </Typography>
            <Button
              variant='contained'
              component='label'
              color='primary'
              startIcon={<Image />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Choose File
              <input type='file' hidden onChange={handleImageUpload} />
            </Button>
            <Box mt={2} display='flex' justifyContent='center'>
              <img
                src={mediaUrl || editData?.image}
                alt='Uploaded preview'
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
              />
            </Box>
          </Box>

          <Box display='flex' justifyContent='space-between' mt={2}>
            <Button onClick={closeEditModal} color='secondary' variant='outlined'>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} color='primary' variant='contained'>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Modal */}

      <Modal open={isAddModalOpen} onClose={closeAddModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' gutterBottom align='center'>
            Add Banner
          </Typography>
          <TextField
            fullWidth
            label='Title'
            value={newBannerData.title}
            onChange={e => {
              setNewBannerData(prev => ({ ...prev, title: e.target.value }))
              setValidationErrors(prev => ({ ...prev, title: '' }))
            }}
            margin='normal'
            error={!!validationErrors.title}
            helperText={validationErrors.title}
          />
          {newBannerData.type === BannerType.Website && (
            <TextField
              fullWidth
              label='Link URL'
              value={newBannerData.link || ''}
              onChange={e => setNewBannerData(prev => ({ ...prev, link: e.target.value }))}
              margin='normal'
              placeholder='https://example.com'
            />
          )}
          <FormControl fullWidth margin='normal' error={!!validationErrors.type}>
            <InputLabel>Type</InputLabel>
            <Select
              value={newBannerData.type}
              onChange={e => {
                setNewBannerData(prev => ({
                  ...prev,
                  type: e.target.value,
                  // Reset dynamic fields when type changes
                  shopOption: '',
                  productId: '',
                  collectionId: '',
                  vetOption: '',
                  clinicId: '',
                  subscriptionOption: '',
                  websiteOption: '',
                  website: ''
                }))
                setValidationErrors(prev => ({ ...prev, type: '' }))
              }}
            >
              <MenuItem value={BannerType.Shop}>Shop</MenuItem>
              <MenuItem value={BannerType.Veterinary}>Veterinary</MenuItem>
              <MenuItem value={BannerType.Subscription}>Subscription</MenuItem>
              <MenuItem value={BannerType.Website}>Website</MenuItem>
            </Select>
          </FormControl>

          {/* Render dynamic fields based on banner type */}
          {newBannerData.type === BannerType.Shop && (
            <>
              <FormControl fullWidth margin='normal'>
                <InputLabel>Shop Option</InputLabel>
                <Select
                  value={newBannerData.shopOption}
                  onChange={e =>
                    setNewBannerData(prev => ({
                      ...prev,
                      shopOption: e.target.value,
                      // reset IDs if option changes
                      productId: '',
                      collectionId: ''
                    }))
                  }
                >
                  <MenuItem value='product'>Product</MenuItem>
                  <MenuItem value='category'>Collection</MenuItem>
                </Select>
              </FormControl>
              {newBannerData.shopOption === 'product' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={newBannerData.productId}
                    onChange={e => setNewBannerData(prev => ({ ...prev, productId: e.target.value }))}
                  >
                    {productLists.map(product => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {newBannerData.shopOption === 'category' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Collection</InputLabel>
                  <Select
                    value={newBannerData.collectionId}
                    onChange={e => setNewBannerData(prev => ({ ...prev, collectionId: e.target.value }))}
                  >
                    {collectionData.map(collection => (
                      <MenuItem key={collection.id} value={collection.id}>
                        {collection.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={newBannerData.isBrand}
                    onChange={e => setNewBannerData(prev => ({ ...prev, isBrand: e.target.checked }))}
                    color='primary'
                  />
                }
                label='Is Brand'
                sx={{ mt: 1 }}
              />
            </>
          )}

          {newBannerData.type === BannerType.Veterinary && (
            <>
              <FormControl fullWidth margin='normal'>
                <InputLabel>Vet Option</InputLabel>
                <Select
                  value={newBannerData.vetOption}
                  onChange={e =>
                    setNewBannerData(prev => ({
                      ...prev,
                      vetOption: e.target.value,
                      clinicId: '',
                      packageId: ''
                    }))
                  }
                >
                  <MenuItem value='home'>In-House</MenuItem>
                  <MenuItem value='clinic'>Clinic</MenuItem>
                </Select>
              </FormControl>
              {newBannerData.vetOption === 'clinic' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Clinic</InputLabel>
                  <Select
                    value={newBannerData.clinicId}
                    onChange={e => setNewBannerData(prev => ({ ...prev, clinicId: e.target.value }))}
                  >
                    {clinicLists?.map(clinic => (
                      <MenuItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {newBannerData.vetOption === 'home' && (
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Package</InputLabel>
                  <Select
                    value={newBannerData.packageId}
                    onChange={e => setNewBannerData(prev => ({ ...prev, packageId: e.target.value }))}
                  >
                    {packageLists.map(pkg => (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}
          {newBannerData.type === BannerType.Subscription && (
            <>
              <FormControl fullWidth margin='normal'>
                <InputLabel>Membership</InputLabel>
                <Select
                  value={newBannerData.subscriptionOption}
                  onChange={e => setNewBannerData(prev => ({ ...prev, subscriptionOption: e.target.value }))}
                >
                  {membershipData.map(membership => (
                    <MenuItem key={membership.id} value={membership.id}>
                      {membership.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <InputLabel>Website</InputLabel>
                <Select
                  value={newBannerData.websiteOption}
                  onChange={e =>
                    setNewBannerData(prev => ({
                      ...prev,
                      websiteOption: e.target.value,
                      website: ''
                    }))
                  }
                >
                  <MenuItem value='none'>None</MenuItem>
                  <MenuItem value='website'>Website</MenuItem>
                </Select>
              </FormControl>
              {newBannerData.websiteOption === 'website' && (
                <TextField
                  fullWidth
                  label='Website URL'
                  value={newBannerData.website}
                  onChange={e => setNewBannerData(prev => ({ ...prev, website: e.target.value }))}
                  margin='normal'
                />
              )}
            </>
          )}

          <Box mt={2} mb={2}>
            <Typography variant='body1' gutterBottom>
              Upload Image
            </Typography>
            <Button
              variant='contained'
              component='label'
              color='primary'
              startIcon={<Image />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Choose File
              <input
                type='file'
                hidden
                onChange={handleImageUpload}
                onClick={() => setValidationErrors(prev => ({ ...prev, image: '' }))}
              />
            </Button>
            <Typography variant='body2' color='error'>
              {validationErrors.image}
            </Typography>
            {mediaUrl && (
              <Box mt={2} display='flex' justifyContent='center'>
                <img
                  src={mediaUrl}
                  alt='Uploaded preview'
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 8
                  }}
                />
              </Box>
            )}
          </Box>

          <Box mt={2} mb={2}>
            <Typography variant='body1' gutterBottom>
              Upload Image Web
            </Typography>
            <Button
              variant='contained'
              component='label'
              color='primary'
              startIcon={<Image />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Choose File
              <input
                type='file'
                hidden
                onChange={handleImageUploadWeb}
                onClick={() => setValidationErrors(prev => ({ ...prev, webImage: '' }))}
              />
            </Button>
            <Typography variant='body2' color='error'>
              {validationErrors.webImage}
            </Typography>
            {webMedia && (
              <Box mt={2} display='flex' justifyContent='center'>
                <img
                  src={webMedia}
                  alt='Uploaded preview'
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 8
                  }}
                />
              </Box>
            )}
          </Box>

          <Box display='flex' justifyContent='space-between' mt={2}>
            <Button onClick={closeAddModal} color='secondary' variant='outlined'>
              Cancel
            </Button>
            <Button onClick={handleAddBanner} color='primary' variant='contained'>
              Add
            </Button>
          </Box>
        </Box>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Confirm Deletion'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Are you sure you want to delete this banner? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteBanner} color='primary' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const ProtectedChatPage = () => {
  return (
    <ProtectedRoutes requiredPermission='banner'>
      <BannerPage />
    </ProtectedRoutes>
  )
}

export default ProtectedChatPage

