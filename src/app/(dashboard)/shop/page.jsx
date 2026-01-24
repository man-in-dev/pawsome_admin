// 'use client'

// import React, { useState, useEffect, useRef } from 'react'

// import dynamic from 'next/dynamic'

// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
// import 'react-quill/dist/quill.snow.css'

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Collapse,
//   IconButton,
//   Typography,
//   Box,
//   Button,
//   Modal,
//   TextField,
//   MenuItem,
//   Card,
//   CardMedia,
//   CardActions,
//   Pagination,
//   CircularProgress,
//   DialogContent,
//   Dialog,
//   DialogActions,
//   DialogTitle,
//   DialogContentText,
//   LinearProgress,
//   CardHeader,
//   Chip,
//   Stepper,
//   StepLabel,
//   Step,
//   TablePagination,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails
// } from '@mui/material'

// import CountUp from 'react-countup'

// import {
//   ExpandMore,
//   ExpandLess,
//   Edit,
//   Add,
//   Delete,
//   ProductionQuantityLimitsSharp,
//   CommentOutlined,
//   Close
// } from '@mui/icons-material'

// import { ToastContainer, toast } from 'react-toastify'

// import ProtectedRoutes from '@/components/ProtectedRoute'

// import 'react-toastify/dist/ReactToastify.css'

// import ProductCard from './ProductCard'

// import {
//   getAllProducts,
//   getCollections,
//   createProduct,
//   uploadImage,
//   updateProduct,
//   deleteProduct,
//   updateProductPrice,
//   getAllOrders,
//   getAllBrands,
//   removeCollectionFromProduct
// } from '@/app/api'

// const ProductTable = () => {
//   const [loading, setLoading] = useState(false)
//   const [products, setProducts] = useState([])
//   const [categories, setCategories] = useState([])
//   const [expandedProductId, setExpandedProductId] = useState(null)
//   const [isEditModalOpen, setEditModalOpen] = useState(false)
//   const [editData, setEditData] = useState(null)
//   const [isAddModalOpen, setAddModalOpen] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [page, setPage] = useState(0)
//   const [rowsPerPage, setRowsPerPage] = useState(5)
//   const [deleteProductId, setDeleteProductId] = useState(null)
//   const [isDeletedModal, setIsDeletedModal] = useState(false)
//   const [currentStep, setCurrentStep] = useState(1)
//   const [createdProductId, setCreatedProductId] = useState(null)
//   const steps = ['Product Details', 'Variants', 'Variant Prices']
//   const [editProductData, setEditProductData] = useState({
//     id: '',
//     title: '',
//     descriptionHtml: '',
//     collection: '',
//     vendor: '',
//     tags: ''
//   })
//   const [editVariantDetails, setEditVariantDetails] = useState([])

//   const [variantDetails, setVariantDetails] = useState([
//     { name: '', price: '', comparePrice: '', gst: '', inventory: '' }
//   ])
//   const initialState = {
//     title: '',
//     descriptionHtml: '',
//     mediaUrl: [],
//     variants: [],
//     tags: '',
//     type: '',
//     category: '',
//     collection: '',
//     comparePrice: '',
//     brand: ''
//   }

//   const [newProductData, setNewProductData] = useState({
//     title: '',
//     descriptionHtml: '',
//     mediaUrl: [],
//     variants: [],
//     tags: '',
//     category: '',
//     collection: '',
//     comparePrice: '',
//     brand: ''
//   })
//   const [isVariantEditModalOpen, setVariantEditModalOpen] = useState(false)

//   const [selectedVariant, setSelectedVariant] = useState(null)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [newlyCreatedProductId, setNewlyCreatedProductId] = useState(null)
//   const [editableVariantId, setEditableVariantId] = useState(null)
//   const [variantEdits, setVariantEdits] = useState([])
//   const [gstPercentage, setGstPercentage] = useState(18)
//   const [brands, setBrands] = useState([])
//   const [isReviewModalOpen, setReviewModalOpen] = useState(false)
//   const [currentReviews, setCurrentReviews] = useState([])
//   const [userRole, setUserRole] = useState('')

//   const [selectedDescription, setSelectedDescription] = useState('')
//   const [openDescriptionModal, setOpenDescriptionModal] = useState(false)

//   //for product review
//   // Holds all images for the currently selected review
//   const [selectedReviewImages, setSelectedReviewImages] = useState([])

//   // Index of the currently displayed image
//   const [currentImageIndex, setCurrentImageIndex] = useState(0)

//   // Controls the visibility of the image preview modal
//   const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)

//   const reactQuillRef = useRef()

//   const handleImageClick = (imagesArray, index) => {
//     setSelectedReviewImages(imagesArray)
//     setCurrentImageIndex(index)
//     setIsImagePreviewOpen(true)
//   }

//   // Close the image preview
//   const handleCloseImagePreview = () => {
//     setIsImagePreviewOpen(false)
//   }

//   // Move to the next image (wrap around with modulo)
//   const handleNextImage = () => {
//     setCurrentImageIndex(prev => (prev + 1) % selectedReviewImages.length)
//   }

//   // Move to the previous image (wrap around with modulo)
//   const handlePrevImage = () => {
//     setCurrentImageIndex(prev => (prev - 1 + selectedReviewImages.length) % selectedReviewImages.length)
//   }

//   const getHighestAverageRating = () => {
//     const validRatings = products
//       .map(product => product.avgRating)
//       .filter(rating => rating !== null && rating !== undefined)
//     return validRatings.length > 0 ? Math.max(...validRatings) : 0
//   }

//   const cardData = [
//     { label: 'totalProducts', data: `${products?.length}` },
//     { label: 'totalBrands', data: `${brands?.length}` },
//     { label: 'highestReview', data: getHighestAverageRating() },
//     { label: 'blockedUsers', data: 3 }
//   ]

//   useEffect(() => {
//     const userRole = localStorage.getItem('user')
//     if (userRole) {
//       const parsedData = JSON.parse(userRole)
//       setUserRole(parsedData.role)
//     } else {
//       setUserRole('')
//     }
//   }, [])
//   // REVIEW MODAL
//   const handleOpenReviewModal = reviews => {
//     setCurrentReviews(reviews)
//     setReviewModalOpen(true)
//   }

//   // Rename this function for consistency:
//   const handleModalPageCHange = () => {
//     if (!newProductData.title || !newProductData.descriptionHtml || !newProductData.type) {
//       toast.error('Please fill all the required fields in Step 1')
//       return
//     }
//     // Move to Step 2
//     setCurrentStep(2)
//   }

//   // Updated validation function for add modal:
//   const validateAddComparePrice = () => {
//     console.log('under fun', variantDetails)
//     // Loop through each variant and check that its mrp is greater than its price
//     const isInvalid = variantDetails?.some(variant => {
//       const price = parseFloat(variant.price)
//       const mrp = parseFloat(variant.mrp)
//       // If either price or mrp isn't a valid number, skip that variant
//       if (isNaN(price) || isNaN(mrp)) return false
//       // If mrp is less than or equal to price, it's invalid
//       return mrp <= price
//     })

//     if (isInvalid) {
//       toast.error('MRP must be greater than Price for all variants')
//       return false
//     }
//     return true
//   }

//   const handleCloseReviewModal = () => {
//     setReviewModalOpen(false)
//     setCurrentReviews([])
//   }

//   const handleVariantEdit = (variantId, field, value, inventotyId) => {
//     console.log('iv', field, inventotyId)
//     setVariantEdits(prevEdits => {
//       const existingEdit = prevEdits.find(edit => edit.variantId === variantId)
//       if (existingEdit) {
//         return prevEdits.map(edit =>
//           edit.variantId === variantId ? { ...edit, [field]: value, idQuant: inventotyId } : edit
//         )
//       }

//       return [...prevEdits, { variantId, [field]: value, idQuant: inventotyId }]
//     })
//   }

//   // Compare price validation for add modal
//   // Rename this function for consistency:

//   // Compare price validation for edit modal
//   const validateEditComparePrice = () => {
//     const isInvalid = editVariantDetails.some(variant => {
//       const price = parseFloat(variant.price)
//       const comparePrice = parseFloat(variant.comparePrice)
//       return comparePrice >= price
//     })
//     if (isInvalid) {
//       toast.error('Compare Price must be less than Price for all variants')
//       return false
//     }
//     return true
//   }

//   const createFinalProduct = async () => {
//     setLoading(true)

//     // Validate compare price before proceeding

//     try {
//       // Construct the payload
//       const payload = {
//         productId: createdProductId, // The ID of the newly created product
//         variants: variantDetails.map((variant, index) => ({
//           variantId: variant.id,
//           price: variant.price,
//           comparePrice: newProductData.comparePrice, // Use null if empty
//           inventoryQuantity: `${variant.inventory}`, // Convert to string
//           idQuant: { id: variant.idQuant } || '', // This should be set from the API response
//           // mrp: (parseFloat(variant.price) * 1.18).toFixed(2) // Calculate MRP with 18% GST
//           mrp: (parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2),
//           percentage: gstPercentage
//         }))
//       }
//       const globalComparePrice = parseFloat(newProductData.comparePrice)
//       const isInvalid = payload.variants.some(variant => {
//         const computedMrp = parseFloat(variant.mrp)
//         // If the global comparePrice is less than the computed mrp, then it's invalid.
//         return globalComparePrice < computedMrp
//       })

//       if (isInvalid) {
//         toast.error('Compare Price must be greater than Price for all variants')
//         setLoading(false)
//         setAddModalOpen(true)
//         return
//       }

//       console.log('Final Payload:', payload)

//       // Call the API to save the variants with the constructed payload
//       const response = await updateProductPrice(payload)

//       if (response.status === 200) {
//         toast.success('Variants saved successfully')
//         setVariantEdits([])

//         fetchAllProducts() // Refresh the product list
//         setCurrentStep(1) // Reset to the first step

//         setAddModalOpen(false)
//         setEditModalOpen(false)
//         setEditProductData(null)
//         setVariantEdits([])
//         setEditVariantDetails([])
//         setAddModalOpen(false)
//       } else {
//         toast.error('Failed to save variants')
//       }
//     } catch (error) {
//       console.error('Error saving variants:', error)
//       toast.error('Error saving variants')
//     } finally {
//       setLoading(false)
//       // setCurrentStep(1)
//       // setAddModalOpen(false)
//     }
//   }

//   const handleSaveVariants = async () => {
//     setLoading(true)
//     try {
//       const payload = {
//         productId: createdProductId ? createdProductId : expandedProductId,
//         variants: variantEdits.map(edit => ({
//           ...edit,
//           mrp: (parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2),
//           percentage: gstPercentage
//         }))
//       }
//       console.log('to', payload)

//       const response = await updateProductPrice(payload)
//       console.log('uuu', response)
//       if (response.status === 200) {
//         toast.success('Variants updated successfully')

//         setVariantEdits([])
//         setEditableVariantId(null)
//         fetchAllProducts()
//       } else {
//         toast.error('Failed to update variants')
//       }
//     } catch (error) {
//       console.error('Error updating variants:', error)
//       toast.error('Error updating variants')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCancelEdit = () => {
//     setVariantEdits([])
//     setEditableVariantId(null)
//   }

//   const handleAddVariantOption = () => {
//     setNewProductData(prevData => ({
//       ...prevData,
//       variants: [...prevData.variants, { optionName: '', optionValues: [] }]
//     }))
//   }

//   const handleVariantOptionChange = (index, field, value) => {
//     const updatedVariants = newProductData.variants.map((variant, i) =>
//       i === index ? { ...variant, [field]: value } : variant
//     )
//     setNewProductData({ ...newProductData, variants: updatedVariants })
//   }

//   const handleAddOptionValue = index => {
//     const updatedVariants = newProductData.variants.map((variant, i) =>
//       i === index ? { ...variant, optionValues: [...variant.optionValues, ''] } : variant
//     )
//     setNewProductData({ ...newProductData, variants: updatedVariants })
//   }

//   const handleOptionValueChange = (variantIndex, valueIndex, value) => {
//     const updatedVariants = newProductData.variants.map((variant, i) => {
//       if (i === variantIndex) {
//         const updatedValues = variant.optionValues.map((val, j) => (j === valueIndex ? value : val))
//         return { ...variant, optionValues: updatedValues }
//       }
//       return variant
//     })
//     setNewProductData({ ...newProductData, variants: updatedVariants })
//   }

//   const fetchAllProducts = async () => {
//     setLoading(true)
//     try {
//       const response = await getAllProducts()
//       if (response.status === 200) {
//         setProducts(response.data?.data?.products)
//       } else {
//         console.error('Error fetching products:', response.message)
//       }

//       const collectionResponse = await getCollections()
//       console.log('coll', collectionResponse)
//       if (collectionResponse) {
//         const fetchedCategories = collectionResponse?.data?.data?.map(cat => ({
//           id: cat.id,
//           title: cat.title
//         }))
//         setCategories(fetchedCategories)
//       } else {
//         console.error('Error fetching collections:', collectionResponse.message)
//       }
//     } catch (error) {
//       console.error('Error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }
//   const fetchAllBrands = async () => {
//     try {
//       const response = await getAllBrands()
//       if (response.status === 200) {
//         console.log('brands', response.data.data)
//         setBrands(response.data.data)
//       }
//     } catch (error) {
//       console.log(error)
//       setBrands([])
//     }
//   }

//   useEffect(() => {
//     fetchAllProducts()
//     fetchAllBrands()
//   }, [])

//   const closeAddModal = () => {
//     setAddModalOpen(false)
//     setEditModalOpen(false)
//     setNewProductData({
//       title: '',
//       descriptionHtml: '',
//       mediaUrl: [],
//       variants: [],
//       tags: '',
//       category: '',
//       collection: ''
//     })
//   }

//   const handleImageUpload = async e => {
//     const file = e.target.files[0]
//     if (file) {
//       setIsUploading(true)
//       const formData = new FormData()
//       formData.append('file', file)
//       try {
//         const response = await uploadImage(formData)
//         if (response) {
//           const imageUrl = response.data.data.fileUrl
//           setNewProductData(prevData => ({
//             ...prevData,
//             mediaUrl: [...prevData.mediaUrl, imageUrl]
//           }))
//           toast.success('Image uploaded successfully')
//         } else {
//           toast.error('Failed to upload image')
//         }
//       } catch (error) {
//         toast.error('Error uploading image')
//       }
//       setIsUploading(false)
//     }
//   }
//   const htmlToText = html => {
//     const parser = new DOMParser()
//     const doc = parser.parseFromString(html, 'text/html')
//     return doc.body.textContent || ''
//   }

//   const handlePageChange = (event, newPage) => {
//     setPage(newPage)
//   }

//   // const paginatedProducts = products.slice((page - 1) * rowsPerPage, (page + 1) * rowsPerPage)
//   const paginatedProducts = products.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

//   const openEditModal = product => {
//     console.log('edit', product)

//     setEditModalOpen(true)
//     setCurrentStep(1)
//     setAddModalOpen(false)
//     setEditData(product)
//     setEditProductData({
//       id: product.id,
//       title: product.title || '',
//       descriptionHtml: htmlToText(product.descriptionHtml) || '',
//       collection: product.collections.map(collection => collection.title) || '',
//       // collection: collections || [],
//       type: product.productType,
//       brand: product.vendor,
//       tags: product.tags || '',
//       mediaUrl: product.images ? product.images.map(img => img.originalSrc) : []
//     })
//     setNewProductData({
//       title: product.title || '',
//       descriptionHtml: htmlToText(product.descriptionHtml) || '',
//       mediaUrl: product.images ? product.images.map(img => img.originalSrc) : [],
//       // variants: product.variants || [],
//       tags: product.tags || '',
//       category: product.productType || '',
//       collection: product.collection || '',
//       brand: product.vendor || ''
//     })
//     console.log('vxdvxdvc', product?.variants)
//     const variants =
//       product.variants?.map(variant => ({
//         id: variant.id,
//         title: variant.title,
//         price: variant.price || '',
//         comparePrice: variant.compareAtPrice || '',
//         inventoryQuantity: variant.inventoryQuantity || ''
//       })) || []

//     setEditVariantDetails(variants)
//   }

//   const handleDelete = async data => {
//     if (!deleteProductId) return

//     try {
//       const payload = {
//         id: deleteProductId
//       }
//       const response = await deleteProduct(payload)
//       if (response?.status === 200) {
//         toast.success('Product deleted successfully')
//         fetchAllProducts()
//       }

//       console.log('delete', response)
//     } catch (error) {
//       toast.error('Error deleting product ')
//       console.log(error)
//     } finally {
//       setIsDeletedModal(false)
//       setDeleteProductId(null)
//     }
//   }

//   const confirmDeleteProduct = productId => {
//     setDeleteProductId(productId?.id)
//     setIsDeletedModal(true)
//   }

//   const cancelDelete = () => {
//     setIsDeletedModal(false)
//     setDeleteProductId(null)
//   }

//   const handleCloseDialog = () => {
//     setOpenDialog(false)
//   }

//   const handleNextStep = async () => {
//     setLoading(true)
//     //check for compareprice value
//     // if (!validateAddComparePrice()) {
//     //   setLoading(false)
//     //   return
//     // }
//     try {
//       const productData = {
//         ...newProductData,
//         descriptionHtml: `<p>${newProductData.descriptionHtml}</p>`,
//         variants: newProductData.variants.map(variant => ({
//           optionName: variant.optionName,
//           optionValues: variant.optionValues
//         }))
//       }
//       console.log('sending data', productData)
//       const response = await createProduct({ productData })
//       console.log('res', response)

//       if (response.status === 200) {
//         // toast.success('Product created successfully')

//         console.log('response', response.data.data)
//         const createdVariants = response.data?.data?.product?.product?.variants?.edges.map(edge => ({
//           id: edge.node.id,
//           title: edge.node.title,
//           price: edge.node.price || '',
//           inventory: edge.node.inventoryQuantity || '',
//           gst: '18%',
//           idQuant: edge.node.inventoryItem?.id || '' // Capture inventory item ID
//           // mrp: (parseFloat(edge.node.price) * 1.18).toFixed(2) || ''
//         }))
//         console.log('created data', createdVariants)

//         setCreatedProductId(response.data?.data?.product?.product?.id)
//         console.log('next', response.data?.data?.product?.id)
//         setVariantDetails(createdVariants)
//         setCurrentStep(2)
//       } else {
//         toast.error('Error creating product')
//       }
//     } catch (error) {
//       console.error('Error:', error)
//       toast.error('Failed to create product')
//     } finally {
//       setCurrentStep(3)
//       setLoading(false)
//     }
//   }

//   const handleVariantInputChange = (index, field, value) => {
//     setVariantDetails(prevDetails => {
//       const updatedVariants = [...prevDetails]
//       updatedVariants[index][field] = value
//       if (field === 'price') {
//         updatedVariants[index]['mrp'] = (parseFloat(value) * 1.18).toFixed(2)
//       }

//       // Capture the variant's ID and the updated fields
//       const variantId = updatedVariants[index].id
//       setVariantEdits(prevEdits => {
//         const existingEdit = prevEdits.find(edit => edit.variantId === variantId)
//         if (existingEdit) {
//           return prevEdits.map(edit => (edit.variantId === variantId ? { ...edit, [field]: value } : edit))
//         } else {
//           return [...prevEdits, { variantId: variantId, [field]: value }]
//         }
//       })

//       return updatedVariants
//     })
//   }

//   const handleSaveEdit = async () => {
//     setLoading(true)

//     try {
//       const payload = {
//         productId: editProductData.id,
//         variants: editVariantDetails.map((variant, index) => ({
//           variantId: variant.id,
//           price: variant.price,
//           comparePrice: variant.comparePrice,

//           inventoryQuantity: `${variant.inventoryQuantity}`,
//           idQuant: editData.variants[index].inventoryItem,
//           // mrp: (parseFloat(variant.price) * 1.18).toFixed(2)
//           mrp: (parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2),
//           percentage: gstPercentage
//         }))
//       }

//       console.log('Payload to API:', payload)
//       const isInvalid = payload.variants.some(variant => {
//         const mrp = parseFloat(variant.mrp)
//         const cp = parseFloat(variant.comparePrice)
//         return cp < mrp
//       })

//       if (isInvalid) {
//         toast.error('Compare Price must be greater than or equal to the computed MRP for all variants')
//         setLoading(false)
//         // Optionally, keep the modal open here
//         return
//       }

//       const response = await updateProductPrice(payload)

//       if (response?.status === 200) {
//         toast.success('Variants updated successfully')
//         setCurrentStep(1)
//         setAddModalOpen(false)
//         setEditModalOpen(false)
//         setEditProductData(null)
//         setVariantEdits([])
//         setEditVariantDetails([])
//         setEditModalOpen(false)

//         fetchAllProducts()
//       } else {
//         toast.error('Failed to update variants')
//       }
//     } catch (error) {
//       console.error('Error updating variants:', error)
//       toast.error('Error updating variants')
//     } finally {
//       setLoading(false)
//     }
//   }
//   const handleAllDetailsSave = async () => {
//     setLoading(true)
//     console.log('edit2', editProductData)

//     try {
//       const productData = {
//         id: editProductData.id,
//         title: editProductData.title,
//         descriptionHtml: `<p>${editProductData.descriptionHtml}</p>`,
//         collection: editProductData.collection,
//         tags: editProductData.tags,
//         mediaUrl: editProductData.mediaUrl,
//         vendor: editProductData.brand
//       }

//       const response = await updateProduct(productData)

//       if (response?.status === 200) {
//         // toast.success('Product details updated successfully')
//         setCurrentStep(2)
//       } else {
//         toast.error('Failed to update product details')
//         setCurrentStep(1)
//       }
//     } catch (error) {
//       console.error('Error updating product details:', error)
//       toast.error('Error updating product details')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const formatBrand = text => {
//     if (text) {
//       const brandName = text.split('_')
//       return brandName[1]
//     }
//     return text
//   }
//   const handleRemoveCollection = async data => {
//     console.log('colldele', data)
//     const getRequiredCollection = categories?.filter(cat => cat.title.toLowerCase() === data.toLowerCase())
//     console.log('found', getRequiredCollection)
//     const removeCollection = {
//       id: editProductData?.id,
//       removedCollection: getRequiredCollection
//     }
//     try {
//       const response = await removeCollectionFromProduct(removeCollection)
//       console.log('res', response)
//       if (response?.status === 200) {
//         toast.success('Collection removed successfully')
//         setEditProductData(prevData => ({
//           ...prevData,
//           collection: prevData.collection.filter(title => title !== data)
//         }))
//       }
//     } catch (error) {
//       toast.error('Unable to remove collection')
//     }
//   }

//   const capitalizeWord = text => {
//     if (text) {
//       return text.charAt(0).toUpperCase() + text.slice(1)
//     }
//     return text
//   }

//   const handleCancel = () => {
//     setCurrentStep(1)
//     setAddModalOpen(false)
//     setEditModalOpen(false)
//     setEditProductData(null)
//     setVariantEdits([])
//     setEditVariantDetails([])
//     setNewProductData(initialState)
//   }

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage)
//   }

//   const handleChangeRowsPerPage = event => {
//     setRowsPerPage(parseInt(event.target.value, 10))
//     setPage(0) // Reset to first page whenever rows per page changes
//   }

//   const productTypes = [
//     { label: 'Dog', value: 'dog' },
//     { label: 'Cat', value: 'cat' }
//   ]

//   return (
//     <Box p={3}>
//       <ToastContainer />
//       <ProductCard cardData={cardData} />
//       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//         <CardHeader
//           avatar={<ProductionQuantityLimitsSharp color='primary' fontSize='large' />} // Icon before title
//           title='Products Management'
//           titleTypographyProps={{
//             variant: 'h5', // Set the text size
//             color: 'textPrimary', // Optional: Change text color
//             fontWeight: 'bold' // Optional: Make it bold
//           }}
//           subheader={'Add or Edit Product'}
//         />

//         <Box sx={{ marginTop: 6 }}>
//           {' '}
//           <Button
//             variant='contained'
//             sx={{ backgroundColor: '#ffA500' }}
//             startIcon={<Add />}
//             onClick={() => setAddModalOpen(true)}
//           >
//             Add Product
//           </Button>
//         </Box>
//       </Box>

//       <TableContainer component={Paper} sx={{ marginTop: 2, maxWidth: '1200', overflowX: 'auto' }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Product Title</TableCell>
//               <TableCell>Created Date</TableCell>
//               <TableCell>Type</TableCell>
//               <TableCell>Description</TableCell>
//               <TableCell>Images</TableCell>
//               <TableCell>Brand</TableCell>
//               <TableCell>Collections</TableCell>
//               <TableCell>Price Range</TableCell>
//               <TableCell>Reviews</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paginatedProducts?.map(product => (
//               <React.Fragment key={product.id}>
//                 <TableRow
//                   sx={{
//                     backgroundColor: '#E0E0E0,',
//                     '&:hover': {
//                       backgroundColor: '#E0E0E0', // Hover effect
//                       boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow effect
//                       cursor: 'pointer',
//                       '& td': {
//                         transform: 'scale(0.92)', // Zoom-out effect
//                         transition: 'transform 0.3s ease'
//                       }
//                     }
//                   }}
//                 >
//                   <TableCell>
//                     <Typography>{capitalizeWord(product.title)}</Typography>
//                   </TableCell>
//                   <TableCell>
//                     {product?.createdAt
//                       ? new Date(product.createdAt).toLocaleDateString('en-GB', {
//                           day: '2-digit',
//                           month: '2-digit',
//                           year: 'numeric'
//                         })
//                       : 'N/A'}
//                   </TableCell>
//                   <TableCell>
//                     <Chip key={''} label={product.productType || 'n/a'} />
//                   </TableCell>
//                   {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                     <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
//                   </TableCell> */}
//                   <TableCell sx={{ maxWidth: 250 }}>
//                     <div
//                       style={{
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis',
//                         display: '-webkit-box',
//                         WebkitLineClamp: 3,
//                         WebkitBoxOrient: 'vertical'
//                       }}
//                     >
//                       <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
//                     </div>
//                     <Button
//                       onClick={() => {
//                         setSelectedDescription(product.descriptionHtml)
//                         setOpenDescriptionModal(true)
//                       }}
//                       size='small'
//                     >
//                       Read more
//                     </Button>
//                   </TableCell>
//                   <TableCell>
//                     {product?.images?.map((img, index) => (
//                       <img
//                         key={index}
//                         src={img.originalSrc}
//                         alt={img.altText}
//                         style={{ width: '50px', height: '50px', marginRight: 8 }}
//                       />
//                     ))}
//                   </TableCell>
//                   <TableCell>
//                     <Chip key={product.id} label={formatBrand(product.vendor) || 'N/A'} />
//                   </TableCell>

//                   <TableCell>
//                     {product?.collections?.map(collection => (
//                       <Chip key={collection.id} label={collection.title} />
//                     ))}
//                   </TableCell>
//                   <TableCell>
//                     <span>
//                       ₹<CountUp start={0} end={Number(product?.priceRange?.minVariantPrice?.amount)} duration={1} /> - ₹
//                       <CountUp start={0} end={Number(product?.priceRange?.maxVariantPrice?.amount)} duration={1} />
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     {product?.avgRating ? (
//                       <>
//                         {Array.from({ length: 5 }, (_, index) => (
//                           <span key={index}>{index < product.avgRating ? '⭐' : '☆'}</span>
//                         ))}

//                         <IconButton onClick={() => handleOpenReviewModal(product.reviews)} color='primary'>
//                           <CommentOutlined />
//                           <Typography variant='body2' sx={{ ml: 0.5 }}>
//                             {product.reviews.length}
//                           </Typography>
//                         </IconButton>
//                       </>
//                     ) : (
//                       <Typography variant='body2'>No Reviews</Typography>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     <IconButton
//                       disabled={userRole !== 'superadmin' && userRole !== 'admin'}
//                       onClick={() => openEditModal(product)}
//                     >
//                       <Edit />
//                     </IconButton>
//                     <IconButton
//                       disabled={userRole !== 'superadmin' && userRole !== 'admin'}
//                       onClick={() => confirmDeleteProduct(product)}
//                     >
//                       <Delete />
//                     </IconButton>
//                     <IconButton
//                       onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
//                     >
//                       {expandedProductId === product.id ? <ExpandLess /> : <ExpandMore />}
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
//                     <Collapse in={expandedProductId === product.id} timeout='auto' unmountOnExit>
//                       <Box margin={2}>
//                         <Typography variant='h6' gutterBottom>
//                           Variants
//                         </Typography>
//                         <Table size='small'>
//                           <TableHead>
//                             <TableRow>
//                               <TableCell>Title</TableCell>
//                               <TableCell>Price</TableCell>
//                               <TableCell>Compare Price</TableCell>
//                               <TableCell>Inventory Quantity</TableCell>
//                               <TableCell>GST%</TableCell>
//                             </TableRow>
//                           </TableHead>
//                           <TableBody>
//                             {product?.variants?.map(variant => (
//                               <TableRow
//                                 sx={{
//                                   backgroundColor: '#E0E0E0,',
//                                   '&:hover': {
//                                     backgroundColor: '#E0E0E0',
//                                     boxShadow: '10px 10px 10px rgba(0, 0, 0, 0.2)',
//                                     cursor: 'pointer',
//                                     '& td': {
//                                       transform: 'scale(0.95)',
//                                       transition: 'transform 0.3s ease'
//                                     }
//                                   }
//                                 }}
//                                 key={variant.id}
//                               >
//                                 <TableCell>{variant.title}</TableCell>

//                                 <TableCell>
//                                   {editableVariantId === variant.id ? (
//                                     <TextField
//                                       type='text'
//                                       value={
//                                         variantEdits.find(edit => edit.variantId === variant.id)?.price ??
//                                         (variant.price !== undefined ? String(variant.price) : '')
//                                       }
//                                       onChange={e =>
//                                         handleVariantEdit(variant.id, 'price', e.target.value, variant.inventoryItem)
//                                       }
//                                       // onBlur={() => {
//                                       //   if (!variantEdits.find(edit => edit.variantId === variant.id)) {
//                                       //     setEditableVariantId(null)
//                                       //   }
//                                       //   console.log('yes')
//                                       // }}
//                                     />
//                                   ) : variantEdits.find(edit => edit.variantId === variant.id)?.price ? (
//                                     `₹${variantEdits.find(edit => edit.variantId === variant.id)?.price}`
//                                   ) : (
//                                     <CountUp start={0} end={Number(variant.price)} prefix='₹' duration={1} />
//                                   )}
//                                 </TableCell>

//                                 {
//                                   <TableCell>
//                                     {editableVariantId === variant.id ? (
//                                       <TextField
//                                         type='text'
//                                         value={
//                                           variantEdits.find(edit => edit.variantId === variant.id)?.comparePrice ??
//                                           (variant.comparePrice !== undefined
//                                             ? String(variant.compareAtPrice)
//                                             : variant.compareAtPrice)
//                                         }
//                                         onChange={e =>
//                                           handleVariantEdit(
//                                             variant.id,
//                                             'comparePrice',
//                                             e.target.value,
//                                             variant.inventoryItem
//                                           )
//                                         }
//                                       />
//                                     ) : (
//                                       `₹${variantEdits.find(edit => edit.variantId === variant.id)?.compareAtPrice || variant?.compareAtPrice || 'N/A'}`
//                                     )}
//                                   </TableCell>
//                                 }

//                                 <TableCell>
//                                   {editableVariantId === variant.id ? (
//                                     <TextField
//                                       type='text'
//                                       value={
//                                         variantEdits.find(edit => edit.variantId === variant.id)?.inventoryQuantity ??
//                                         (variant.inventoryQuantity !== undefined
//                                           ? String(variant.inventoryQuantity)
//                                           : variant.inventoryQuantity)
//                                       }
//                                       onChange={e =>
//                                         handleVariantEdit(
//                                           variant.id,
//                                           'inventoryQuantity',
//                                           e.target.value,
//                                           variant.inventoryItem
//                                         )
//                                       }
//                                     />
//                                   ) : variantEdits.find(edit => edit.variantId === variant.id)?.inventoryQuantity ? (
//                                     `${variantEdits.find(edit => edit.variantId === variant.id)?.inventoryQuantity}`
//                                   ) : variant?.inventoryQuantity ? (
//                                     <CountUp start={0} end={Number(variant.inventoryQuantity)} duration={1} />
//                                   ) : (
//                                     'N/A'
//                                   )}
//                                 </TableCell>

//                                 <TableCell>
//                                   {product?.appliedPercentage ? JSON.parse(product.appliedPercentage).tax + '%' : 'N/A'}
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                         {variantEdits?.length > 0 && (
//                           <Box mt={2} display='flex' justifyContent='space-between'>
//                             <Button variant='contained' color='primary' onClick={handleSaveVariants}>
//                               {loading ? <CircularProgress size={24} sx={{ ml: 2 }} /> : 'Save'}
//                             </Button>
//                             <Button variant='outlined' color='secondary' onClick={handleCancelEdit}>
//                               Cancel
//                             </Button>
//                           </Box>
//                         )}
//                       </Box>
//                     </Collapse>
//                   </TableCell>
//                 </TableRow>
//               </React.Fragment>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       {/* <Pagination
//         count={Math.ceil(products.length / rowsPerPage)}
//         page={page}
//         onChange={handlePageChange}
//         color='primary'
//         sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
//       /> */}
//       <TablePagination
//         component='div'
//         count={products.length}
//         page={page}
//         onPageChange={handleChangePage}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//         rowsPerPageOptions={[5, 10, 20, 50]}
//         labelRowsPerPage='Rows per page'
//         sx={{ display: 'flex', justifyContent: 'flex-end' }}
//       />

//       {loading && (
//         <LinearProgress
//           sx={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             zIndex: 1200,
//             backgroundColor: 'rgba(255, 165, 0, 0.2)', // Light orange for the track
//             '& .MuiLinearProgress-bar': {
//               backgroundColor: 'orange' // Orange for the progress bar
//             }
//           }}
//           variant='indeterminate'
//         />
//       )}

//       <Dialog open={isDeletedModal} onClose={cancelDelete}>
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete this product? This action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={cancelDelete} color='secondary'>
//             Cancel
//           </Button>
//           <Button onClick={handleDelete} color='error'>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <Dialog open={isVariantEditModalOpen} onClose={() => setVariantEditModalOpen(false)}>
//         <DialogTitle>Edit Variant</DialogTitle>
//         <DialogContent>
//           <TextField
//             label='Variant Title'
//             fullWidth
//             value={selectedVariant?.editedValue || ''}
//             // onChange={e => setSelectedVariant({ ...selectedVariant, title: e.target.value })}
//             onChange={e =>
//               setSelectedVariant({
//                 ...selectedVariant,
//                 editedValue: e.target.value
//               })
//             }
//             margin='normal'
//           />
//           <TextField
//             label='Price'
//             fullWidth
//             type='text'
//             value={selectedVariant?.price || ''}
//             onChange={e => setSelectedVariant({ ...selectedVariant, price: e.target.value })}
//             margin='normal'
//           />
//           <TextField
//             label='Compare Price'
//             fullWidth
//             type='text'
//             value={selectedVariant?.comparePrice || ''}
//             onChange={e => setSelectedVariant({ ...selectedVariant, comparePrice: e.target.value })}
//             margin='normal'
//           />

//           <TextField
//             label='Inventory Quantity'
//             fullWidth
//             type='number'
//             value={selectedVariant?.inventoryQuantity || ''}
//             onChange={e =>
//               setSelectedVariant({
//                 ...selectedVariant,
//                 inventoryQuantity: e.target.value
//               })
//             }
//             margin='normal'
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setVariantEditModalOpen(false)} color='secondary'>
//             Cancel
//           </Button>
//           <Button
//             onClick={() => {
//               // handleVariantSave(selectedVariant)
//             }}
//             color='primary'
//           >
//             {loading ? <CircularProgress size={24} sx={{ ml: 2 }} /> : 'Save'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <Dialog open={openDialog} onClose={handleCloseDialog}>
//         <DialogTitle>{'Variant Price '}</DialogTitle>
//         <DialogContent>
//           <DialogContentText>You want to add Prices Variant now ?</DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} color='primary'>
//             Skip
//           </Button>
//           <Button
//             onClick={() => {
//               setExpandedProductId(newlyCreatedProductId) // Expand product after dialog
//               setEditableVariantId(null) // Ensure no variant is editable initially
//               setOpenDialog(false)
//             }}
//             color='secondary'
//           >
//             okay
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <Modal open={isReviewModalOpen} onClose={handleCloseReviewModal}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: '80%',
//             maxWidth: 600,
//             maxHeight: '80vh',
//             bgcolor: 'background.paper',
//             borderRadius: 2,
//             boxShadow: 24,
//             p: 4,
//             overflowY: 'auto'
//           }}
//         >
//           <Typography variant='h5' gutterBottom>
//             Product Reviews
//           </Typography>
//           {currentReviews.length > 0 ? (
//             currentReviews.map((review, index) => (
//               <Box key={index} mb={3} p={2} border='1px solid #ddd' borderRadius={2}>
//                 <Typography variant='subtitle1' fontWeight='bold'>
//                   {review.customer_name}
//                 </Typography>
//                 <Typography variant='body2' color='textSecondary'>
//                   {new Date(review?.created_at)?.toLocaleDateString('en-GB', {
//                     day: '2-digit',
//                     month: '2-digit',
//                     year: 'numeric'
//                   })}
//                 </Typography>
//                 <Box mt={1} mb={1}>
//                   {Array.from({ length: 5 }, (_, i) => (
//                     <span key={i}>{i < Math.round(review.rating) ? '⭐' : '☆'}</span>
//                   ))}
//                 </Box>
//                 <Typography variant='body1'>{review.description}</Typography>
//                 {review?.images && review?.images?.length > 0 && (
//                   <Box mt={2} display='flex' flexWrap='wrap' gap={1}>
//                     {review?.images?.map((image, imgIndex) => (
//                       <CardMedia
//                         key={imgIndex}
//                         component='img'
//                         image={image}
//                         onClick={() => handleImageClick(review.images, imgIndex)}
//                         alt={`Review image ${imgIndex + 1}`}
//                         sx={{ width: 100, height: 100, borderRadius: 1, objectFit: 'cover' }}
//                       />
//                     ))}
//                   </Box>
//                 )}
//               </Box>
//             ))
//           ) : (
//             <Typography variant='body2'>No reviews available.</Typography>
//           )}
//           <Box display='flex' justifyContent='flex-end' mt={2}>
//             <Button variant='contained' color='primary' onClick={handleCloseReviewModal}>
//               Close
//             </Button>
//           </Box>
//         </Box>
//       </Modal>

//       <Modal open={isAddModalOpen} onClose={closeAddModal}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             bgcolor: 'background.paper',
//             borderRadius: 2,
//             boxShadow: 3,
//             width: '80%',
//             maxWidth: '900px',
//             maxHeight: '90vh',
//             overflowY: 'auto'
//           }}
//         >
//           <IconButton onClick={closeAddModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
//             <Close />
//           </IconButton>
//           <Box p={4}>
//             <Stepper activeStep={currentStep - 1} alternativeLabel>
//               {steps?.map(label => (
//                 <Step key={label}>
//                   <StepLabel>{label}</StepLabel>
//                 </Step>
//               ))}
//             </Stepper>
//             <Box mt={4}>
//               {currentStep === 1 && (
//                 <>
//                   <Typography variant='h5' gutterBottom>
//                     Add Product Details
//                   </Typography>
//                   <Typography variant='subtitle1' gutterBottom>
//                     Fill in the details about your product.
//                   </Typography>

//                   {/* Image Upload Section */}
//                   <Box mt={3}>
//                     <Typography variant='subtitle1' gutterBottom>
//                       Upload Images
//                     </Typography>
//                     <Box
//                       sx={{
//                         border: '2px dashed #ddd',
//                         borderRadius: 2,
//                         padding: 2,
//                         textAlign: 'center',
//                         cursor: 'pointer',
//                         '&:hover': { backgroundColor: '#f9f9f9' }
//                       }}
//                       onClick={() => document.querySelector('#image-upload').click()}
//                     >
//                       <Typography variant='body2' color='textSecondary'>
//                         Drag & drop images here, or click to upload
//                       </Typography>
//                       <input
//                         id='image-upload'
//                         type='file'
//                         accept='image/*'
//                         hidden
//                         multiple
//                         onChange={handleImageUpload}
//                       />
//                     </Box>
//                     <Box mt={2} display='flex' gap={2} flexWrap='wrap'>
//                       {newProductData?.mediaUrl.map((url, index) => (
//                         <Card key={index} sx={{ width: 120, height: 120, position: 'relative', boxShadow: 2 }}>
//                           <CardMedia
//                             component='img'
//                             src={url}
//                             alt={`Preview ${index + 1}`}
//                             sx={{ objectFit: 'cover', height: '100%' }}
//                           />
//                           <CardActions
//                             sx={{
//                               position: 'absolute',
//                               top: 4,
//                               right: 4,
//                               backgroundColor: 'rgba(255, 255, 255, 0.8)',
//                               borderRadius: '90%'
//                             }}
//                           >
//                             <Button
//                               color='error'
//                               onClick={() =>
//                                 setNewProductData(prev => ({
//                                   ...prev,
//                                   mediaUrl: prev.mediaUrl.filter((_, i) => i !== index)
//                                 }))
//                               }
//                             >
//                               <Delete fontSize='small' />
//                             </Button>
//                           </CardActions>
//                         </Card>
//                       ))}
//                     </Box>
//                   </Box>

//                   {/* Product Details Section */}
//                   <Box mt={3}>
//                     <TextField
//                       label='Product Title'
//                       fullWidth
//                       value={newProductData.title}
//                       onChange={e => setNewProductData({ ...newProductData, title: e.target.value })}
//                       margin='normal'
//                     />
//                     {/* <TextField
//                       label='Description'
//                       fullWidth
//                       multiline
//                       rows={4}
//                       value={newProductData.descriptionHtml}
//                       onChange={e => setNewProductData({ ...newProductData, descriptionHtml: e.target.value })}
//                       margin='normal'
//                     /> */}
//                     <Box mt={3}>
//                       <Typography variant='h6'>Description</Typography>
//                       <ReactQuill
//                         ref={reactQuillRef}
//                         theme='snow'
//                         placeholder='Start writing...'
//                         modules={{
//                           toolbar: {
//                             container: [
//                               [{ header: '1' }, { header: '2' }, { font: [] }],
//                               [{ size: [] }],
//                               ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                               [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
//                               ['link', 'image', 'video'],
//                               ['code-block'],
//                               ['clean']
//                             ]
//                           },
//                           clipboard: {
//                             matchVisual: false
//                           }
//                         }}
//                         formats={[
//                           'header',
//                           'font',
//                           'size',
//                           'bold',
//                           'italic',
//                           'underline',
//                           'strike',
//                           'blockquote',
//                           'list',
//                           'bullet',
//                           'indent',
//                           'link',
//                           'image',
//                           'video',
//                           'code-block'
//                         ]}
//                         value={newProductData.descriptionHtml}
//                         onChange={value => setNewProductData({ ...newProductData, descriptionHtml: value })}
//                       />
//                     </Box>
//                     <TextField
//                       select
//                       label='Type'
//                       fullWidth
//                       value={newProductData.type}
//                       onChange={e => setNewProductData({ ...newProductData, type: e.target.value })}
//                       margin='normal'
//                     >
//                       {productTypes?.map(option => (
//                         <MenuItem key={option} value={option.value}>
//                           {option.label}
//                         </MenuItem>
//                       ))}
//                     </TextField>

//                     <TextField
//                       fullWidth
//                       label='Tags'
//                       value={newProductData.tags}
//                       onChange={e => setNewProductData({ ...newProductData, tags: e.target.value })}
//                     />
//                     {/* <TextField
//                       fullWidth
//                       label='Category'
//                       value={newProductData.category}
//                       onChange={e => setNewProductData({ ...newProductData, category: e.target.value })}
//                       margin='normal'
//                       sx={{ mb: 2 }}
//                     /> */}
//                   </Box>

//                   {/* Collections and Brands */}
//                   <Box mt={3}>
//                     <TextField
//                       fullWidth
//                       select
//                       label='Collection'
//                       value={newProductData?.collection}
//                       onChange={e => setNewProductData({ ...newProductData, collection: e.target.value })}
//                       margin='normal'
//                       sx={{ mb: 2 }}
//                     >
//                       {categories?.map(category => (
//                         <MenuItem key={category.id} value={category.id}>
//                           {category.title}
//                         </MenuItem>
//                       ))}
//                     </TextField>

//                     <TextField
//                       fullWidth
//                       select
//                       label='Brands'
//                       value={newProductData?.brand}
//                       onChange={e => setNewProductData({ ...newProductData, brand: e.target.value })}
//                       margin='normal'
//                       sx={{ mb: 2 }}
//                     >
//                       {brands?.map((brand, index) => (
//                         <MenuItem key={index} value={`${index + 1}_${brand.name}`}>
//                           {`${index + 1}. ${brand.name}`}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Box>

//                   <Box display='flex' justifyContent='space-between' mt={3}>
//                     {currentStep > 1 ? (
//                       <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
//                         Previous
//                       </Button>
//                     ) : (
//                       <Box />
//                     )}
//                     <Box>
//                       <Button variant='contained' color='primary' onClick={handleCancel}>
//                         Cancel
//                       </Button>
//                       <Button
//                         variant='contained'
//                         color='primary'
//                         onClick={handleModalPageCHange}
//                         disabled={loading}
//                         sx={{ ml: 2 }}
//                       >
//                         {loading ? <CircularProgress size={24} /> : 'Next'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </>
//               )}

//               {currentStep === 2 && (
//                 <>
//                   <Typography variant='h5' gutterBottom>
//                     Add Variant Details
//                   </Typography>
//                   <Box mt={3}>
//                     {newProductData?.variants?.map((variant, index) => (
//                       <Accordion key={index}>
//                         <AccordionSummary expandIcon={<ExpandMore />}>
//                           <Typography>Variant {index + 1}</Typography>
//                         </AccordionSummary>
//                         <AccordionDetails>
//                           <TextField
//                             label='Option Name'
//                             fullWidth
//                             value={variant.optionName}
//                             onChange={e => handleVariantOptionChange(index, 'optionName', e.target.value)}
//                             margin='normal'
//                           />
//                           {variant?.optionValues?.map((value, valIndex) => (
//                             <TextField
//                               key={valIndex}
//                               label={`Option Value ${valIndex + 1}`}
//                               fullWidth
//                               value={value}
//                               onChange={e => handleOptionValueChange(index, valIndex, e.target.value)}
//                               margin='normal'
//                               sx={{ mb: 1 }}
//                             />
//                           ))}
//                           <Button
//                             onClick={() => handleAddOptionValue(index)}
//                             variant='text'
//                             color='primary'
//                             sx={{ mt: 1 }}
//                           >
//                             Add Option Value
//                           </Button>
//                         </AccordionDetails>
//                       </Accordion>
//                     ))}
//                     <Button
//                       onClick={handleAddVariantOption}
//                       variant='contained'
//                       color='primary'
//                       startIcon={<Add />}
//                       sx={{ mt: 2 }}
//                     >
//                       Add Variant Option
//                     </Button>
//                   </Box>
//                   <Box display='flex' justifyContent='space-between' mt={3}>
//                     <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
//                       Previous
//                     </Button>
//                     <Box>
//                       <Button variant='contained' color='primary' onClick={handleCancel}>
//                         Cancel
//                       </Button>
//                       <Button
//                         variant='contained'
//                         color='primary'
//                         onClick={handleNextStep}
//                         disabled={loading}
//                         sx={{ ml: 2 }}
//                       >
//                         {loading ? <CircularProgress size={24} /> : 'Next'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </>
//               )}

//               {currentStep === 3 && (
//                 <>
//                   <Typography variant='h4' gutterBottom>
//                     Add Variant Details
//                   </Typography>
//                   <Box mb={2}>
//                     <TextField
//                       label='Comparable Price'
//                       fullWidth
//                       type='number'
//                       value={newProductData.comparePrice || ''}
//                       onChange={e => setNewProductData({ ...newProductData, comparePrice: e.target.value })}
//                       // onChange={e => handleVariantInputChange(index, 'comparePrice', e.target.value)}
//                       margin='normal'
//                     />
//                   </Box>
//                   <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflowY: 'auto', mb: 3 }}>
//                     <Table stickyHeader>
//                       <TableHead>
//                         <TableRow>
//                           <TableCell>Variant Title</TableCell>
//                           <TableCell>Price</TableCell>
//                           <TableCell>Inventory Quantity</TableCell>
//                           <TableCell>GST (18%)</TableCell>
//                           <TableCell>MRP (Price + GST)</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {variantDetails?.map((variant, index) => (
//                           <TableRow key={variant.id}>
//                             <TableCell>{variant.title}</TableCell>
//                             <TableCell>
//                               <TextField
//                                 type='number'
//                                 value={variant.price}
//                                 onChange={e => handleVariantInputChange(index, 'price', e.target.value)}
//                                 fullWidth
//                               />
//                             </TableCell>
//                             <TableCell>
//                               <TextField
//                                 type='number'
//                                 value={variant.inventory}
//                                 onChange={e => handleVariantInputChange(index, 'inventory', e.target.value)}
//                                 fullWidth
//                               />
//                             </TableCell>

//                             <TableCell>
//                               <TextField
//                                 label='GST Percentage'
//                                 fullWidth
//                                 type='number'
//                                 value={gstPercentage}
//                                 onChange={e => setGstPercentage(Number(e.target.value))}
//                                 margin='normal'
//                               />
//                             </TableCell>

//                             <TableCell>
//                               <TextField
//                                 label='MRP Price (with 18% GST)'
//                                 type='text'
//                                 // value={variant.price ? `₹${(parseFloat(variant.price) * 1.18).toFixed(2)}` : ''}
//                                 value={
//                                   variant.price
//                                     ? `₹${(parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2)}`
//                                     : ''
//                                 }
//                                 disabled
//                                 fullWidth
//                               />
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                     {/* <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
//                       Previous
//                     </Button> */}
//                     <Box>
//                       <Button variant='contained' color='primary' onClick={handleCancel}>
//                         Cancel
//                       </Button>
//                       <Button
//                         variant='contained'
//                         color='primary'
//                         onClick={createFinalProduct}
//                         disabled={loading}
//                         sx={{ ml: 2 }}
//                       >
//                         {loading ? <CircularProgress size={24} /> : 'Save'}
//                       </Button>
//                     </Box>
//                   </Box>
//                 </>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       </Modal>

//       <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             p: 4,
//             bgcolor: 'background.paper',
//             borderRadius: 2,
//             width: 900,
//             maxHeight: '90vh',
//             overflowY: 'auto',
//             boxShadow: 3
//           }}
//         >
//           {currentStep === 1 ? (
//             <>
//               <Typography variant='h4' gutterBottom>
//                 Edit Product Details
//               </Typography>
//               <Box mb={3}>
//                 <Typography variant='body1' gutterBottom sx={{ mb: 1 }}>
//                   Upload Images
//                 </Typography>
//                 <Button variant='contained' component='label' startIcon={<Add />} sx={{ mb: 2 }} color='primary'>
//                   Choose Files
//                   <input type='file' accept='image/*' hidden multiple onChange={handleImageUpload} />
//                 </Button>
//                 {isUploading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
//                 <Box
//                   display='flex'
//                   flexWrap='wrap'
//                   gap={2}
//                   sx={{
//                     mt: 2,
//                     border: '1px solid #ddd',
//                     borderRadius: 1,
//                     p: 1,
//                     justifyContent: 'flex-start'
//                   }}
//                 >
//                   {editProductData?.mediaUrl?.map((url, index) => (
//                     <Card key={index} sx={{ width: 120, height: 120, position: 'relative', boxShadow: 2 }}>
//                       <CardMedia
//                         component='img'
//                         src={url}
//                         alt={`preview ${index}`}
//                         height='120'
//                         sx={{ borderRadius: 1, objectFit: 'cover' }}
//                       />
//                       <CardActions
//                         sx={{
//                           position: 'absolute',
//                           top: 4,
//                           right: 4,
//                           backgroundColor: 'rgba(255, 255, 255, 0.8)',
//                           borderRadius: '50%'
//                         }}
//                       >
//                         <IconButton
//                           fontSize='small'
//                           onClick={() =>
//                             setEditProductData(prevData => ({
//                               ...prevData,
//                               mediaUrl: prevData.mediaUrl.filter((_, i) => i !== index)
//                             }))
//                           }
//                           color='error'
//                         >
//                           <Delete fontSize='small' />
//                         </IconButton>
//                       </CardActions>
//                     </Card>
//                   ))}
//                 </Box>
//               </Box>

//               <TextField
//                 required
//                 label='Title'
//                 fullWidth
//                 margin='normal'
//                 value={editProductData?.title || ''}
//                 onChange={e => setEditProductData({ ...editProductData, title: e.target.value })}
//               />
//               {/* <TextField
//                 label='Description'
//                 fullWidth
//                 margin='normal'
//                 multiline
//                 rows={4}
//                 value={editProductData?.descriptionHtml}
//                 onChange={e => setEditProductData({ ...editProductData, descriptionHtml: e.target.value })}
//               /> */}
//               <Box sx={{ mt: 3 }}>
//                 <Typography variant='h6'>Description</Typography>
//                 <ReactQuill
//                   ref={reactQuillRef}
//                   theme='snow'
//                   placeholder='Start writing...'
//                   modules={{
//                     toolbar: {
//                       container: [
//                         [{ header: '1' }, { header: '2' }, { font: [] }],
//                         [{ size: [] }],
//                         ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                         [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
//                         ['link', 'image', 'video'],
//                         ['code-block'],
//                         ['clean']
//                       ]
//                     },
//                     clipboard: {
//                       matchVisual: false
//                     }
//                   }}
//                   formats={[
//                     'header',
//                     'font',
//                     'size',
//                     'bold',
//                     'italic',
//                     'underline',
//                     'strike',
//                     'blockquote',
//                     'list',
//                     'bullet',
//                     'indent',
//                     'link',
//                     'image',
//                     'video',
//                     'code-block'
//                   ]}
//                   value={editProductData?.descriptionHtml}
//                   onChange={value => setEditProductData({ ...editProductData, descriptionHtml: value })}
//                 />
//               </Box>
//               <TextField
//                 select
//                 label='Type'
//                 fullWidth
//                 margin='normal'
//                 value={editProductData?.type || ''}
//                 onChange={e =>
//                   setEditProductData({
//                     ...editProductData,
//                     type: e.target.value
//                   })
//                 }
//                 sx={{ mb: 2 }}
//               >
//                 {productTypes?.map(option => (
//                   <MenuItem key={option} value={option?.value}>
//                     {option.label}
//                   </MenuItem>
//                 ))}
//               </TextField>

//               <TextField
//                 label='Tags'
//                 fullWidth
//                 margin='normal'
//                 value={editProductData?.tags}
//                 onChange={e => setEditProductData({ ...editProductData, tags: e.target.value })}
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 fullWidth
//                 select
//                 label='Collection'
//                 value={editProductData?.collection}
//                 onChange={e => setEditProductData({ ...editProductData, collection: e.target.value })}
//                 margin='normal'
//                 sx={{ mb: 2 }}
//               >
//                 {categories?.map(category => (
//                   <MenuItem key={category.id} value={category.id}>
//                     {category.title}
//                   </MenuItem>
//                 ))}
//               </TextField>
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
//                 {Array.isArray(editProductData?.collection) &&
//                   editProductData?.collection.map((collectionName, index) => (
//                     <Chip
//                       key={index}
//                       label={collectionName}
//                       color='primary'
//                       variant='outlined'
//                       onDelete={() => handleRemoveCollection(collectionName)}
//                     />
//                   ))}
//               </Box>
//               <TextField
//                 fullWidth
//                 select
//                 label='Brands'
//                 value={editProductData?.brand}
//                 onChange={e => setEditProductData({ ...editProductData, brand: e.target.value })}
//                 margin='normal'
//                 sx={{ mb: 2 }}
//               >
//                 {brands?.map((brand, index) => (
//                   <MenuItem key={index} value={`${index + 1}_${brand.name}`}>
//                     {`${index + 1}. ${brand.name}`}
//                   </MenuItem>
//                 ))}
//               </TextField>
//               {editProductData?.brand ? (
//                 <Chip
//                   key={editProductData?.brand}
//                   label={formatBrand(editProductData?.brand)}
//                   color='primary'
//                   variant='outlined'
//                   // onDelete={() => {
//                   //   const updatedCollections = editProductData.collection.filter((_, i) => i !== index)
//                   //   setEditProductData({ ...editProductData, collection: updatedCollections })
//                   // }
//                   onDelete={index => {
//                     console.log('delete product', editProductData)

//                     setEditProductData({ ...editProductData, brand: '' })
//                   }}
//                 />
//               ) : (
//                 ''
//               )}

//               <Box display='flex' justifyContent='space-between' mt={3}>
//                 {/* Previous button not shown on step 1 */}
//                 <Box />
//                 <Box>
//                   <Button variant='contained' color='primary' onClick={handleCancel}>
//                     Cancel
//                   </Button>
//                   <Button variant='contained' color='primary' onClick={handleAllDetailsSave} sx={{ ml: 2 }}>
//                     Next
//                   </Button>
//                 </Box>
//               </Box>
//             </>
//           ) : (
//             <>
//               <Typography variant='h4' gutterBottom>
//                 Edit Variant Details
//               </Typography>

//               <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflowY: 'auto', mb: 3 }}>
//                 <Table stickyHeader>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Variant Title</TableCell>
//                       <TableCell>Price</TableCell>
//                       <TableCell>Gst</TableCell>
//                       <TableCell>Compare Price</TableCell>
//                       <TableCell>Inventory Quantity</TableCell>
//                       <TableCell>MRP with GST</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {editVariantDetails?.map((variant, index) => (
//                       <TableRow key={variant.id}>
//                         <TableCell>{variant.title}</TableCell>
//                         <TableCell>
//                           <TextField
//                             type='number'
//                             value={variant.price}
//                             onChange={e => {
//                               const updatedVariants = [...editVariantDetails]
//                               updatedVariants[index].price = e.target.value
//                               setEditVariantDetails(updatedVariants)
//                             }}
//                             fullWidth
//                             sx={{ mb: 2 }}
//                           />
//                         </TableCell>
//                         <Box mb={2}>
//                           <TextField
//                             label='GST Percentage'
//                             fullWidth
//                             type='number'
//                             value={gstPercentage}
//                             onChange={e => setGstPercentage(Number(e.target.value))}
//                             margin='normal'
//                           />
//                         </Box>

//                         <TableCell>
//                           <TextField
//                             type='number'
//                             value={variant.comparePrice}
//                             onChange={e => {
//                               const updatedVariants = [...editVariantDetails]
//                               updatedVariants[index].comparePrice = e.target.value
//                               setEditVariantDetails(updatedVariants)
//                             }}
//                             fullWidth
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type='number'
//                             value={variant.inventoryQuantity}
//                             onChange={e => {
//                               const updatedVariants = [...editVariantDetails]
//                               updatedVariants[index].inventoryQuantity = e.target.value
//                               setEditVariantDetails(updatedVariants)
//                             }}
//                             fullWidth
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             label='MRP Price (with GST)'
//                             type='text'
//                             value={
//                               variant.price
//                                 ? `₹${(parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2)}`
//                                 : ''
//                             }
//                             disabled
//                             fullWidth
//                           />
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>

//               <Box display='flex' justifyContent='space-between' mt={3}>
//                 <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
//                   Previous
//                 </Button>
//                 <Box>
//                   <Button variant='outlined' onClick={handleCancel}>
//                     Cancel
//                   </Button>
//                   <Button variant='contained' color='primary' onClick={handleSaveEdit} sx={{ ml: 2 }}>
//                     Save
//                   </Button>
//                 </Box>
//               </Box>
//             </>
//           )}
//         </Box>
//       </Modal>
//       <Modal open={isImagePreviewOpen} onClose={handleCloseImagePreview}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',

//             width: '90%',
//             maxWidth: '1000px',
//             maxHeight: '90vh',

//             bgcolor: 'background.paper',
//             borderRadius: 2,
//             boxShadow: 24,
//             p: 2,

//             // Make sure content can scroll if needed
//             overflowY: 'auto',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center'
//           }}
//         >
//           {selectedReviewImages.length > 0 && (
//             <>
//               <img
//                 src={selectedReviewImages[currentImageIndex]}
//                 alt='Full Preview'
//                 // Increase the image size
//                 style={{
//                   width: '100%', // fill the container width
//                   maxHeight: '70vh', // keep it within viewport height
//                   objectFit: 'contain' // prevent distortion
//                 }}
//               />

//               {/* Navigation + Close buttons here */}
//             </>
//           )}
//         </Box>
//       </Modal>

//       <Modal open={openDescriptionModal} onClose={() => setOpenDescriptionModal(false)}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: 600,
//             bgcolor: 'background.paper',
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2,
//             maxHeight: '80vh',
//             overflowY: 'auto'
//           }}
//         >
//           <Typography variant='h6' gutterBottom>
//             Full Description
//           </Typography>
//           <div dangerouslySetInnerHTML={{ __html: selectedDescription }} />
//           <Box sx={{ textAlign: 'right', mt: 2 }}>
//             <Button onClick={() => setOpenDescriptionModal(false)} variant='contained'>
//               Close
//             </Button>
//           </Box>
//         </Box>
//       </Modal>
//     </Box>
//   )
// }

// // export default ProductTable

// const ProtectedChatPage = () => {
//   return (
//     <ProtectedRoutes requiredPermission='shop'>
//       <ProductTable />
//     </ProtectedRoutes>
//   )
// }

// export default ProtectedChatPage

'use client'

import React, { useState, useEffect, useRef } from 'react'

import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Typography,
  Box,
  Button,
  Modal,
  TextField,
  MenuItem,
  Card,
  CardMedia,
  CardActions,
  Pagination,
  CircularProgress,
  DialogContent,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContentText,
  LinearProgress,
  CardHeader,
  Chip,
  Stepper,
  StepLabel,
  Step,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'

import CountUp from 'react-countup'

import {
  ExpandMore,
  ExpandLess,
  Edit,
  Add,
  Delete,
  ProductionQuantityLimitsSharp,
  CommentOutlined,
  Close,
  EditAttributes,
  EditNote
} from '@mui/icons-material'

import { ToastContainer, toast } from 'react-toastify'

import ProtectedRoutes from '@/components/ProtectedRoute'

import 'react-toastify/dist/ReactToastify.css'

import ProductCard from './ProductCard'

import {
  getAllProducts,
  getCollections,
  createProduct,
  uploadImage,
  updateProduct,
  deleteProduct,
  updateProductPrice,
  getAllOrders,
  getAllBrands,
  removeCollectionFromProduct,
  updateVariantsData
} from '@/app/api'

const ProductTable = () => {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [deleteProductId, setDeleteProductId] = useState(null)
  const [isDeletedModal, setIsDeletedModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [createdProductId, setCreatedProductId] = useState(null)
  const steps = ['Product Details', 'Variants', 'Variant Prices']
  const [editProductData, setEditProductData] = useState({
    id: '',
    title: '',
    descriptionHtml: '',
    collection: '',
    vendor: '',
    tags: ''
  })
  const [editVariantDetails, setEditVariantDetails] = useState([])

  const [variantDetails, setVariantDetails] = useState([
    { name: '', price: '', comparePrice: '', gst: '', inventory: '' }
  ])
  const initialState = {
    title: '',
    descriptionHtml: '',
    mediaUrl: [],
    variants: [],
    tags: '',
    type: '',
    category: '',
    collection: '',
    comparePrice: '',
    brand: ''
  }

  const [newProductData, setNewProductData] = useState({
    title: '',
    descriptionHtml: '',
    mediaUrl: [],
    variants: [],
    tags: '',
    category: '',
    collection: '',
    comparePrice: '',
    brand: ''
  })
  const [isVariantEditModalOpen, setVariantEditModalOpen] = useState(false)

  const [selectedVariant, setSelectedVariant] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [newlyCreatedProductId, setNewlyCreatedProductId] = useState(null)
  const [editableVariantId, setEditableVariantId] = useState(null)
  const [variantEdits, setVariantEdits] = useState([])
  const [gstPercentage, setGstPercentage] = useState(18)
  const [brands, setBrands] = useState([])
  const [isReviewModalOpen, setReviewModalOpen] = useState(false)
  const [currentReviews, setCurrentReviews] = useState([])
  const [userRole, setUserRole] = useState('')

  const [selectedDescription, setSelectedDescription] = useState('')
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false)

  //for product review
  // Holds all images for the currently selected review
  const [selectedReviewImages, setSelectedReviewImages] = useState([])

  // Index of the currently displayed image
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Controls the visibility of the image preview modal
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)

  // MODAL FOR EDITING VARIANTS SPECIFIC PRODUCT
  const [openVariantEdit, setOpenVariantEdit] = useState(false)
  const [variantEditData, setVariantEditData] = useState(null)
  const [EditedVariantProductId, setEditedVariantProductId] = useState('')

  // At the top of your component (inside ProductTable component)
  const [newVariant, setNewVariant] = useState({ optionName: '', optionValue: '' })
  const [showNewVariantForm, setShowNewVariantForm] = useState(false)

  const reactQuillRef = useRef()

  const handleImageClick = (imagesArray, index) => {
    setSelectedReviewImages(imagesArray)
    setCurrentImageIndex(index)
    setIsImagePreviewOpen(true)
  }

  // Close the image preview
  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false)
  }

  // Move to the next image (wrap around with modulo)
  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % selectedReviewImages.length)
  }

  // Move to the previous image (wrap around with modulo)
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + selectedReviewImages.length) % selectedReviewImages.length)
  }

  const getHighestAverageRating = () => {
    const validRatings = products
      .map(product => product.avgRating)
      .filter(rating => rating !== null && rating !== undefined)
    return validRatings.length > 0 ? Math.max(...validRatings) : 0
  }

  const cardData = [
    { label: 'totalProducts', data: `${products?.length}` },
    { label: 'totalBrands', data: `${brands?.length}` },
    { label: 'highestReview', data: getHighestAverageRating() },
    { label: 'blockedUsers', data: 3 }
  ]

  useEffect(() => {
    const userRole = localStorage.getItem('user')
    if (userRole) {
      const parsedData = JSON.parse(userRole)
      setUserRole(parsedData.role)
    } else {
      setUserRole('')
    }
  }, [])
  // REVIEW MODAL
  const handleOpenReviewModal = reviews => {
    setCurrentReviews(reviews)
    setReviewModalOpen(true)
  }

  // Rename this function for consistency:
  const handleModalPageCHange = () => {
    if (!newProductData.title || !newProductData.descriptionHtml || !newProductData.type) {
      toast.error('Please fill all the required fields in Step 1')
      return
    }
    // Move to Step 2
    setCurrentStep(2)
  }

  // Updated validation function for add modal:
  const validateAddComparePrice = () => {
    console.log('under fun', variantDetails)
    // Loop through each variant and check that its mrp is greater than its price
    const isInvalid = variantDetails?.some(variant => {
      const price = parseFloat(variant.price)
      const mrp = parseFloat(variant.mrp)
      // If either price or mrp isn't a valid number, skip that variant
      if (isNaN(price) || isNaN(mrp)) return false
      // If mrp is less than or equal to price, it's invalid
      return mrp <= price
    })

    if (isInvalid) {
      toast.error('MRP must be greater than Price for all variants')
      return false
    }
    return true
  }

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false)
    setCurrentReviews([])
  }

  const handleVariantEdit = (variantId, field, value, inventotyId) => {
    console.log('iv', field, inventotyId)
    setVariantEdits(prevEdits => {
      const existingEdit = prevEdits.find(edit => edit.variantId === variantId)
      if (existingEdit) {
        return prevEdits.map(edit =>
          edit.variantId === variantId ? { ...edit, [field]: value, idQuant: inventotyId } : edit
        )
      }

      return [...prevEdits, { variantId, [field]: value, idQuant: inventotyId }]
    })
  }

  // Compare price validation for add modal
  // Rename this function for consistency:

  // Compare price validation for edit modal
  const validateEditComparePrice = () => {
    const isInvalid = editVariantDetails.some(variant => {
      const price = parseFloat(variant.price)
      const comparePrice = parseFloat(variant.comparePrice)
      return comparePrice >= price
    })
    if (isInvalid) {
      toast.error('Compare Price must be less than Price for all variants')
      return false
    }
    return true
  }

  const createFinalProduct = async () => {
    setLoading(true)

    // Validate compare price before proceeding

    try {
      // Construct the payload
      const payload = {
        productId: createdProductId, // The ID of the newly created product
        variants: variantDetails.map((variant, index) => ({
          variantId: variant.id,
          price: variant.price,
          comparePrice: newProductData.comparePrice, // Use null if empty
          inventoryQuantity: `${variant.inventory}`, // Convert to string
          idQuant: { id: variant.idQuant } || '', // This should be set from the API response
          // mrp: (parseFloat(variant.price) * 1.18).toFixed(2) // Calculate MRP with 18% GST
          mrp: (parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2),
          percentage: gstPercentage
        }))
      }
      const globalComparePrice = parseFloat(newProductData.comparePrice)
      const isInvalid = payload.variants.some(variant => {
        const computedMrp = parseFloat(variant.mrp)
        // If the global comparePrice is less than the computed mrp, then it's invalid.
        return globalComparePrice < computedMrp
      })

      if (isInvalid) {
        toast.error('Compare Price must be greater than Price for all variants')
        setLoading(false)
        setAddModalOpen(true)
        return
      }

      console.log('Final Payload:', payload)

      // Call the API to save the variants with the constructed payload
      const response = await updateProductPrice(payload)

      if (response.status === 200) {
        toast.success('Variants saved successfully')
        setVariantEdits([])

        fetchAllProducts() // Refresh the product list
        setCurrentStep(1) // Reset to the first step

        setAddModalOpen(false)
        setEditModalOpen(false)
        setEditProductData(null)
        setVariantEdits([])
        setEditVariantDetails([])
        setAddModalOpen(false)
      } else {
        toast.error('Failed to save variants')
      }
    } catch (error) {
      console.error('Error saving variants:', error)
      toast.error('Error saving variants')
    } finally {
      setLoading(false)
      // setCurrentStep(1)
      // setAddModalOpen(false)
    }
  }

  const handleSaveVariants = async () => {
    setLoading(true)
    try {
      const payload = {
        productId: createdProductId ? createdProductId : expandedProductId,
        variants: variantEdits.map(edit => ({
          ...edit,
          mrp: (parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2),
          percentage: gstPercentage
        }))
      }
      console.log('to', payload)

      const response = await updateProductPrice(payload)
      console.log('uuu', response)
      if (response.status === 200) {
        toast.success('Variants updated successfully')

        setVariantEdits([])
        setEditableVariantId(null)
        fetchAllProducts()
      } else {
        toast.error('Failed to update variants')
      }
    } catch (error) {
      console.error('Error updating variants:', error)
      toast.error('Error updating variants')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setVariantEdits([])
    setEditableVariantId(null)
  }

  const handleAddVariantOption = () => {
    setNewProductData(prevData => ({
      ...prevData,
      variants: [...prevData.variants, { optionName: '', optionValues: [] }]
    }))
  }

  const handleVariantOptionChange = (index, field, value) => {
    const updatedVariants = newProductData.variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    )
    setNewProductData({ ...newProductData, variants: updatedVariants })
  }

  const handleAddOptionValue = index => {
    const updatedVariants = newProductData.variants.map((variant, i) =>
      i === index ? { ...variant, optionValues: [...variant.optionValues, ''] } : variant
    )
    setNewProductData({ ...newProductData, variants: updatedVariants })
  }

  const handleOptionValueChange = (variantIndex, valueIndex, value) => {
    const updatedVariants = newProductData.variants.map((variant, i) => {
      if (i === variantIndex) {
        const updatedValues = variant.optionValues.map((val, j) => (j === valueIndex ? value : val))
        return { ...variant, optionValues: updatedValues }
      }
      return variant
    })
    setNewProductData({ ...newProductData, variants: updatedVariants })
  }

  const fetchAllProducts = async () => {
    setLoading(true)
    try {
      const response = await getAllProducts()
      if (response.status === 200) {
        setProducts(response.data?.data?.products)
      } else {
        console.error('Error fetching products:', response.message)
      }

      const collectionResponse = await getCollections()
      console.log('coll', collectionResponse)
      if (collectionResponse) {
        const fetchedCategories = collectionResponse?.data?.data?.map(cat => ({
          id: cat.id,
          title: cat.title
        }))
        setCategories(fetchedCategories)
      } else {
        console.error('Error fetching collections:', collectionResponse.message)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  const fetchAllBrands = async () => {
    try {
      const response = await getAllBrands()
      if (response.status === 200) {
        console.log('brands', response.data.data)
        setBrands(response.data.data)
      }
    } catch (error) {
      console.log(error)
      setBrands([])
    }
  }

  useEffect(() => {
    fetchAllProducts()
    fetchAllBrands()
  }, [])

  const closeAddModal = () => {
    setAddModalOpen(false)
    setEditModalOpen(false)
    setNewProductData({
      title: '',
      descriptionHtml: '',
      mediaUrl: [],
      variants: [],
      tags: '',
      category: '',
      collection: ''
    })
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await uploadImage(formData)
        if (response) {
          const imageUrl = response.data.data.fileUrl
          setNewProductData(prevData => ({
            ...prevData,
            mediaUrl: [...prevData.mediaUrl, imageUrl]
          }))
          toast.success('Image uploaded successfully')
        } else {
          toast.error('Failed to upload image')
        }
      } catch (error) {
        toast.error('Error uploading image')
      }
      setIsUploading(false)
    }
  }
  const htmlToText = html => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  // const paginatedProducts = products.slice((page - 1) * rowsPerPage, (page + 1) * rowsPerPage)
  const paginatedProducts = products.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  const openEditModal = product => {
    console.log('edit', product)

    setEditModalOpen(true)
    setCurrentStep(1)
    setAddModalOpen(false)
    setEditData(product)
    setEditProductData({
      id: product.id,
      title: product.title || '',
      descriptionHtml: htmlToText(product.descriptionHtml) || '',
      collection: product.collections.map(collection => collection.title) || '',
      // collection: collections || [],
      type: product.productType,
      brand: product.vendor,
      tags: product.tags || '',
      mediaUrl: product.images ? product.images.map(img => img.originalSrc) : []
    })
    setNewProductData({
      title: product.title || '',
      descriptionHtml: htmlToText(product.descriptionHtml) || '',
      mediaUrl: product.images ? product.images.map(img => img.originalSrc) : [],
      // variants: product.variants || [],
      tags: product.tags || '',
      category: product.productType || '',
      collection: product.collection || '',
      brand: product.vendor || ''
    })
    console.log('vxdvxdvc', product?.variants)
    const variants =
      product.variants?.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: variant.price || '',
        comparePrice: variant.compareAtPrice || '',
        inventoryQuantity: variant.inventoryQuantity || ''
      })) || []

    setEditVariantDetails(variants)
  }

  const handleDelete = async data => {
    if (!deleteProductId) return

    try {
      const payload = {
        id: deleteProductId
      }
      const response = await deleteProduct(payload)
      if (response?.status === 200) {
        toast.success('Product deleted successfully')
        fetchAllProducts()
      }

      console.log('delete', response)
    } catch (error) {
      toast.error('Error deleting product ')
      console.log(error)
    } finally {
      setIsDeletedModal(false)
      setDeleteProductId(null)
    }
  }

  const confirmDeleteProduct = productId => {
    setDeleteProductId(productId?.id)
    setIsDeletedModal(true)
  }

  const cancelDelete = () => {
    setIsDeletedModal(false)
    setDeleteProductId(null)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleNextStep = async () => {
    setLoading(true)
    //check for compareprice value
    // if (!validateAddComparePrice()) {
    //   setLoading(false)
    //   return
    // }
    try {
      const productData = {
        ...newProductData,
        descriptionHtml: `<p>${newProductData.descriptionHtml}</p>`,
        variants: newProductData.variants.map(variant => ({
          optionName: variant.optionName,
          optionValues: variant.optionValues
        }))
      }
      console.log('sending data', productData)
      const response = await createProduct({ productData })
      console.log('res', response)

      if (response.status === 200) {
        // toast.success('Product created successfully')

        console.log('response', response.data.data)
        const createdVariants = response.data?.data?.product?.product?.variants?.edges.map(edge => ({
          id: edge.node.id,
          title: edge.node.title,
          price: edge.node.price || '',
          inventory: edge.node.inventoryQuantity || '',
          gst: '18%',
          idQuant: edge.node.inventoryItem?.id || '' // Capture inventory item ID
          // mrp: (parseFloat(edge.node.price) * 1.18).toFixed(2) || ''
        }))
        console.log('created data', createdVariants)

        setCreatedProductId(response.data?.data?.product?.product?.id)
        console.log('next', response.data?.data?.product?.id)
        setVariantDetails(createdVariants)
        setCurrentStep(2)
      } else {
        toast.error('Error creating product')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create product')
    } finally {
      setCurrentStep(3)
      setLoading(false)
    }
  }

  const handleVariantInputChange = (index, field, value) => {
    setVariantDetails(prevDetails => {
      const updatedVariants = [...prevDetails]
      updatedVariants[index][field] = value
      if (field === 'price') {
        updatedVariants[index]['mrp'] = (parseFloat(value) * 1.18).toFixed(2)
      }

      // Capture the variant's ID and the updated fields
      const variantId = updatedVariants[index].id
      setVariantEdits(prevEdits => {
        const existingEdit = prevEdits.find(edit => edit.variantId === variantId)
        if (existingEdit) {
          return prevEdits.map(edit => (edit.variantId === variantId ? { ...edit, [field]: value } : edit))
        } else {
          return [...prevEdits, { variantId: variantId, [field]: value }]
        }
      })

      return updatedVariants
    })
  }

  const handleSaveEdit = async data => {
    console.log('save', data)
    setLoading(true)

    try {
      // const payload = {
      //   productId: editProductData.id,
      //   variants: editVariantDetails.map((variant, index) => ({
      //     variantId: variant.id,
      //     price: variant.price,
      //     comparePrice: variant.comparePrice,

      //     inventoryQuantity: `${variant.inventoryQuantity}`,
      //     idQuant: editData.variants[index].inventoryItem,
      //     // mrp: (parseFloat(variant.price) * 1.18).toFixed(2)
      //     mrp: (parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2),
      //     percentage: gstPercentage
      //   }))
      // }
      const payload = {
        productId: editProductData.id,
        variants: editVariantDetails.map((variant, index) => {
          // Assume the original price is stored in editData.variants[index].price
          // (Adjust this as needed based on your data source)
          const originalPrice = parseFloat(editData.variants[index].price)
          const currentPrice = parseFloat(variant.price)

          // If the price hasn't changed then use the original price
          // Else, compute the new MRP with GST applied
          const computedMRP = currentPrice === originalPrice ? currentPrice : currentPrice * (1 + gstPercentage / 100)

          return {
            variantId: variant.id,
            price: variant.price,
            comparePrice: variant.comparePrice,
            inventoryQuantity: `${variant.inventoryQuantity}`,
            idQuant: editData.variants[index].inventoryItem,
            mrp: computedMRP.toFixed(2),
            percentage: gstPercentage
          }
        })
      }

      console.log('Payload to API:', payload)
      const isInvalid = payload.variants.some(variant => {
        const mrp = parseFloat(variant.mrp)
        const cp = parseFloat(variant.comparePrice)
        return cp < mrp
      })

      if (isInvalid) {
        toast.error('Compare Price must be greater than or equal to the computed MRP for all variants')
        setLoading(false)
        // Optionally, keep the modal open here
        return
      }

      const response = await updateProductPrice(payload)

      if (response?.status === 200) {
        toast.success('Variants updated successfully')
        setCurrentStep(1)
        setAddModalOpen(false)
        setEditModalOpen(false)
        setEditProductData(null)
        setVariantEdits([])
        setEditVariantDetails([])
        setEditModalOpen(false)

        fetchAllProducts()
      } else {
        toast.error('Failed to update variants')
      }
    } catch (error) {
      console.error('Error updating variants:', error)
      toast.error('Error updating variants')
    } finally {
      setLoading(false)
    }
  }
  const handleAllDetailsSave = async () => {
    setLoading(true)
    console.log('edit2', editProductData)

    try {
      const productData = {
        id: editProductData.id,
        title: editProductData.title,
        descriptionHtml: `<p>${editProductData.descriptionHtml}</p>`,
        collection: editProductData.collection,
        tags: editProductData.tags,
        mediaUrl: editProductData.mediaUrl,
        vendor: editProductData.brand
      }

      const response = await updateProduct(productData)

      if (response?.status === 200) {
        // toast.success('Product details updated successfully')
        setCurrentStep(2)
      } else {
        toast.error('Failed to update product details')
        setCurrentStep(1)
      }
    } catch (error) {
      console.error('Error updating product details:', error)
      toast.error('Error updating product details')
    } finally {
      setLoading(false)
    }
  }

  const formatBrand = text => {
    if (text) {
      const brandName = text.split('_')
      return brandName[1]
    }
    return text
  }
  const handleRemoveCollection = async data => {
    console.log('colldele', data)
    const getRequiredCollection = categories?.filter(cat => cat.title.toLowerCase() === data.toLowerCase())
    console.log('found', getRequiredCollection)
    const removeCollection = {
      id: editProductData?.id,
      removedCollection: getRequiredCollection
    }
    try {
      const response = await removeCollectionFromProduct(removeCollection)
      console.log('res', response)
      if (response?.status === 200) {
        toast.success('Collection removed successfully')
        setEditProductData(prevData => ({
          ...prevData,
          collection: prevData.collection.filter(title => title !== data)
        }))
      }
    } catch (error) {
      toast.error('Unable to remove collection')
    }
  }

  const capitalizeWord = text => {
    if (text) {
      return text.charAt(0).toUpperCase() + text.slice(1)
    }
    return text
  }

  const handleCancel = () => {
    setCurrentStep(1)
    setAddModalOpen(false)
    setEditModalOpen(false)
    setEditProductData(null)
    setVariantEdits([])
    setEditVariantDetails([])
    setNewProductData(initialState)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0) // Reset to first page whenever rows per page changes
  }

  const productTypes = [
    { label: 'Dog', value: 'dog' },
    { label: 'Cat', value: 'cat' }
  ]

  const handleVariantEditModalOpen = (product, variants) => {
    console.log('var', product)
    setEditedVariantProductId(product?.id)
    const processedVariants = variants.map(variant => {
      const processed = processVariantTitle(variant.title)
      return {
        ...variant,

        ...processed
      }
    })
    setVariantEditData(processedVariants)
    setOpenVariantEdit(true)
  }
  const processVariantTitle = title => {
    // Split the title by " / " and trim each part.
    const parts = title.split(' / ').map(item => item.trim())
    // Regular expression to detect a weight/size pattern.
    const sizeRegex = /\d+(\.\d+)?\s*(kg|g|lb|oz)/i
    // List of known colors. Adjust or extend this list as needed.
    const knownColors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'purple']
    // Initialize our fields.
    let size = ''
    let color = ''
    let nameParts = []

    parts.forEach(part => {
      // If it matches the size pattern, consider it the size.
      if (sizeRegex.test(part)) {
        size = part
      } else if (knownColors.includes(part.toLowerCase()) && !color) {
        color = part
      }
      // Otherwise, push it for later use as the name.
      else {
        nameParts.push(part)
      }
    })
    // If we haven't detected a size from the loop, try to check any remaining parts.
    if (!size && nameParts.length > 0) {
      for (let i = 0; i < nameParts.length; i++) {
        if (sizeRegex.test(nameParts[i])) {
          size = nameParts[i]
          // Remove that part from nameParts.
          nameParts.splice(i, 1)
          break
        }
      }
    }
    // If we haven't detected a color but one of the remaining parts is a known color, pick it.
    if (!color && nameParts.length > 0) {
      for (let i = 0; i < nameParts.length; i++) {
        if (knownColors.includes(nameParts[i].toLowerCase())) {
          color = nameParts[i]
          nameParts.splice(i, 1)
          break
        }
      }
    }
    // Combine remaining parts as the variant’s name (or subscription plan).
    const name = nameParts.join(' / ')
    return { color, size, name }
  }

  const handleSaveVariantEdits = async () => {
    // Create a new array with the combined title from size and name.
    const updatedVariants = variantEditData?.map(variant => ({
      ...variant,
      title: `${variant.size} / ${variant.name}`
    }))
    const payload = {
      productId: EditedVariantProductId,
      variantsData: variantEditData?.map(variant => ({
        id: variant.id,
        selectedOptions: [
          // Include the Color option only if available
          ...(variant.color ? [{ name: 'Color', value: variant.color }] : []),
          { name: 'Size', value: variant.size },
          { name: 'Subscription Plan', value: variant.name }
        ]
      })),
      newVariant: newVariant.optionName && newVariant.optionValue ? { ...newVariant } : null
    }

    // Here you can call your update API to persist the changes.
    // For example:
    const res = await updateVariantsData(payload)
    console.log('res', res)

    // For now, we log and show a success toast.
    console.log('Updated Variants:', payload)
    toast.success('Variants updated successfully')
    setVariantEditData(updatedVariants)
    setOpenVariantEdit(false)
  }

  return (
    <Box p={3}>
      <ToastContainer />
      <ProductCard cardData={cardData} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <CardHeader
          avatar={<ProductionQuantityLimitsSharp color='primary' fontSize='large' />} // Icon before title
          title='Products Management'
          titleTypographyProps={{
            variant: 'h5', // Set the text size
            color: 'textPrimary', // Optional: Change text color
            fontWeight: 'bold' // Optional: Make it bold
          }}
          subheader={'Add or Edit Product'}
        />

        <Box sx={{ marginTop: 6 }}>
          {' '}
          <Button
            variant='contained'
            sx={{ backgroundColor: '#ffA500' }}
            startIcon={<Add />}
            onClick={() => setAddModalOpen(true)}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ marginTop: 2, maxWidth: '1200', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Title</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Collections</TableCell>
              <TableCell>Price Range</TableCell>
              <TableCell>Reviews</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts?.map(product => (
              <React.Fragment key={product.id}>
                <TableRow
                  sx={{
                    backgroundColor: '#E0E0E0,',
                    '&:hover': {
                      backgroundColor: '#E0E0E0', // Hover effect
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Shadow effect
                      cursor: 'pointer',
                      '& td': {
                        transform: 'scale(0.92)', // Zoom-out effect
                        transition: 'transform 0.3s ease'
                      }
                    }
                  }}
                >
                  <TableCell>
                    <Typography>{capitalizeWord(product.title)}</Typography>
                  </TableCell>
                  <TableCell>
                    {product?.createdAt
                      ? new Date(product.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip key={''} label={product.productType || 'n/a'} />
                  </TableCell>
                  {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                  </TableCell> */}
                  <TableCell sx={{ maxWidth: 250 }}>
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedDescription(product.descriptionHtml)
                        setOpenDescriptionModal(true)
                      }}
                      size='small'
                    >
                      Read more
                    </Button>
                  </TableCell>
                  <TableCell>
                    {product?.images?.map((img, index) => (
                      <img
                        key={index}
                        src={img.originalSrc}
                        alt={img.altText}
                        style={{ width: '50px', height: '50px', marginRight: 8 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip key={product.id} label={formatBrand(product.vendor) || 'N/A'} />
                  </TableCell>

                  <TableCell>
                    {product?.collections?.map(collection => (
                      <Chip key={collection.id} label={collection.title} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <span>
                      ₹<CountUp start={0} end={Number(product?.priceRange?.minVariantPrice?.amount)} duration={1} /> - ₹
                      <CountUp start={0} end={Number(product?.priceRange?.maxVariantPrice?.amount)} duration={1} />
                    </span>
                  </TableCell>
                  <TableCell>
                    {product?.avgRating ? (
                      <>
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={index}>{index < product.avgRating ? '⭐' : '☆'}</span>
                        ))}

                        <IconButton onClick={() => handleOpenReviewModal(product.reviews)} color='primary'>
                          <CommentOutlined />
                          <Typography variant='body2' sx={{ ml: 0.5 }}>
                            {product.reviews.length}
                          </Typography>
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant='body2'>No Reviews</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => handleVariantEditModalOpen(product, product.variants)}
                    >
                      <EditNote />
                    </IconButton>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => openEditModal(product)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      disabled={userRole !== 'superadmin' && userRole !== 'admin'}
                      onClick={() => confirmDeleteProduct(product)}
                    >
                      <Delete />
                    </IconButton>
                    <IconButton
                      onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                    >
                      {expandedProductId === product.id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={expandedProductId === product.id} timeout='auto' unmountOnExit>
                      <Box margin={2}>
                        <Typography variant='h6' gutterBottom>
                          Variants
                        </Typography>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell>Price</TableCell>
                              <TableCell>Compare Price</TableCell>
                              <TableCell>Inventory Quantity</TableCell>
                              <TableCell>GST%</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {product?.variants?.map(variant => (
                              <TableRow
                                sx={{
                                  backgroundColor: '#E0E0E0,',
                                  '&:hover': {
                                    backgroundColor: '#E0E0E0',
                                    boxShadow: '10px 10px 10px rgba(0, 0, 0, 0.2)',
                                    cursor: 'pointer',
                                    '& td': {
                                      transform: 'scale(0.95)',
                                      transition: 'transform 0.3s ease'
                                    }
                                  }
                                }}
                                key={variant.id}
                              >
                                <TableCell>{variant.title}</TableCell>

                                <TableCell>
                                  {editableVariantId === variant.id ? (
                                    <TextField
                                      type='text'
                                      value={
                                        variantEdits.find(edit => edit.variantId === variant.id)?.price ??
                                        (variant.price !== undefined ? String(variant.price) : '')
                                      }
                                      onChange={e =>
                                        handleVariantEdit(variant.id, 'price', e.target.value, variant.inventoryItem)
                                      }
                                      // onBlur={() => {
                                      //   if (!variantEdits.find(edit => edit.variantId === variant.id)) {
                                      //     setEditableVariantId(null)
                                      //   }
                                      //   console.log('yes')
                                      // }}
                                    />
                                  ) : variantEdits.find(edit => edit.variantId === variant.id)?.price ? (
                                    `₹${variantEdits.find(edit => edit.variantId === variant.id)?.price}`
                                  ) : (
                                    <CountUp start={0} end={Number(variant.price)} prefix='₹' duration={1} />
                                  )}
                                </TableCell>

                                {
                                  <TableCell>
                                    {editableVariantId === variant.id ? (
                                      <TextField
                                        type='text'
                                        value={
                                          variantEdits.find(edit => edit.variantId === variant.id)?.comparePrice ??
                                          (variant.comparePrice !== undefined
                                            ? String(variant.compareAtPrice)
                                            : variant.compareAtPrice)
                                        }
                                        onChange={e =>
                                          handleVariantEdit(
                                            variant.id,
                                            'comparePrice',
                                            e.target.value,
                                            variant.inventoryItem
                                          )
                                        }
                                      />
                                    ) : (
                                      `₹${variantEdits.find(edit => edit.variantId === variant.id)?.compareAtPrice || variant?.compareAtPrice || 'N/A'}`
                                    )}
                                  </TableCell>
                                }

                                <TableCell>
                                  {editableVariantId === variant.id ? (
                                    <TextField
                                      type='text'
                                      value={
                                        variantEdits.find(edit => edit.variantId === variant.id)?.inventoryQuantity ??
                                        (variant.inventoryQuantity !== undefined
                                          ? String(variant.inventoryQuantity)
                                          : variant.inventoryQuantity)
                                      }
                                      onChange={e =>
                                        handleVariantEdit(
                                          variant.id,
                                          'inventoryQuantity',
                                          e.target.value,
                                          variant.inventoryItem
                                        )
                                      }
                                    />
                                  ) : variantEdits.find(edit => edit.variantId === variant.id)?.inventoryQuantity ? (
                                    `${variantEdits.find(edit => edit.variantId === variant.id)?.inventoryQuantity}`
                                  ) : variant?.inventoryQuantity ? (
                                    <CountUp start={0} end={Number(variant.inventoryQuantity)} duration={1} />
                                  ) : (
                                    'N/A'
                                  )}
                                </TableCell>

                                <TableCell>
                                  {product?.appliedPercentage ? JSON.parse(product.appliedPercentage).tax + '%' : 'N/A'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {variantEdits?.length > 0 && (
                          <Box mt={2} display='flex' justifyContent='space-between'>
                            <Button variant='contained' color='primary' onClick={handleSaveVariants}>
                              {loading ? <CircularProgress size={24} sx={{ ml: 2 }} /> : 'Save'}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <Pagination
        count={Math.ceil(products.length / rowsPerPage)}
        page={page}
        onChange={handlePageChange}
        color='primary'
        sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
      /> */}
      <TablePagination
        component='div'
        count={products.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage='Rows per page'
        sx={{ display: 'flex', justifyContent: 'flex-end' }}
      />

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

      <Dialog open={isDeletedModal} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDelete} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isVariantEditModalOpen} onClose={() => setVariantEditModalOpen(false)}>
        <DialogTitle>Edit Variant</DialogTitle>
        <DialogContent>
          <TextField
            label='Variant Title'
            fullWidth
            value={selectedVariant?.editedValue || ''}
            // onChange={e => setSelectedVariant({ ...selectedVariant, title: e.target.value })}
            onChange={e =>
              setSelectedVariant({
                ...selectedVariant,
                editedValue: e.target.value
              })
            }
            margin='normal'
          />
          <TextField
            label='Price'
            fullWidth
            type='text'
            value={selectedVariant?.price || ''}
            onChange={e => setSelectedVariant({ ...selectedVariant, price: e.target.value })}
            margin='normal'
          />
          <TextField
            label='Compare Price'
            fullWidth
            type='text'
            value={selectedVariant?.comparePrice || ''}
            onChange={e => setSelectedVariant({ ...selectedVariant, comparePrice: e.target.value })}
            margin='normal'
          />

          <TextField
            label='Inventory Quantity'
            fullWidth
            type='number'
            value={selectedVariant?.inventoryQuantity || ''}
            onChange={e =>
              setSelectedVariant({
                ...selectedVariant,
                inventoryQuantity: e.target.value
              })
            }
            margin='normal'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariantEditModalOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={() => {
              // handleVariantSave(selectedVariant)
            }}
            color='primary'
          >
            {loading ? <CircularProgress size={24} sx={{ ml: 2 }} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{'Variant Price '}</DialogTitle>
        <DialogContent>
          <DialogContentText>You want to add Prices Variant now ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Skip
          </Button>
          <Button
            onClick={() => {
              setExpandedProductId(newlyCreatedProductId) // Expand product after dialog
              setEditableVariantId(null) // Ensure no variant is editable initially
              setOpenDialog(false)
            }}
            color='secondary'
          >
            okay
          </Button>
        </DialogActions>
      </Dialog>
      <Modal open={isReviewModalOpen} onClose={handleCloseReviewModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 600,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflowY: 'auto'
          }}
        >
          <Typography variant='h5' gutterBottom>
            Product Reviews
          </Typography>
          {currentReviews.length > 0 ? (
            currentReviews.map((review, index) => (
              <Box key={index} mb={3} p={2} border='1px solid #ddd' borderRadius={2}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  {review.customer_name}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  {new Date(review?.created_at)?.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Typography>
                <Box mt={1} mb={1}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>{i < Math.round(review.rating) ? '⭐' : '☆'}</span>
                  ))}
                </Box>
                <Typography variant='body1'>{review.description}</Typography>
                {review?.images && review?.images?.length > 0 && (
                  <Box mt={2} display='flex' flexWrap='wrap' gap={1}>
                    {review?.images?.map((image, imgIndex) => (
                      <CardMedia
                        key={imgIndex}
                        component='img'
                        image={image}
                        onClick={() => handleImageClick(review.images, imgIndex)}
                        alt={`Review image ${imgIndex + 1}`}
                        sx={{ width: 100, height: 100, borderRadius: 1, objectFit: 'cover' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Typography variant='body2'>No reviews available.</Typography>
          )}
          <Box display='flex' justifyContent='flex-end' mt={2}>
            <Button variant='contained' color='primary' onClick={handleCloseReviewModal}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={isAddModalOpen} onClose={closeAddModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            width: '80%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <IconButton onClick={closeAddModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Close />
          </IconButton>
          <Box p={4}>
            <Stepper activeStep={currentStep - 1} alternativeLabel>
              {steps?.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box mt={4}>
              {currentStep === 1 && (
                <>
                  <Typography variant='h5' gutterBottom>
                    Add Product Details
                  </Typography>
                  <Typography variant='subtitle1' gutterBottom>
                    Fill in the details about your product.
                  </Typography>

                  {/* Image Upload Section */}
                  <Box mt={3}>
                    <Typography variant='subtitle1' gutterBottom>
                      Upload Images
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed #ddd',
                        borderRadius: 2,
                        padding: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f9f9f9' }
                      }}
                      onClick={() => document.querySelector('#image-upload').click()}
                    >
                      <Typography variant='body2' color='textSecondary'>
                        Drag & drop images here, or click to upload
                      </Typography>
                      <input
                        id='image-upload'
                        type='file'
                        accept='image/*'
                        hidden
                        multiple
                        onChange={handleImageUpload}
                      />
                    </Box>
                    <Box mt={2} display='flex' gap={2} flexWrap='wrap'>
                      {newProductData?.mediaUrl.map((url, index) => (
                        <Card key={index} sx={{ width: 120, height: 120, position: 'relative', boxShadow: 2 }}>
                          <CardMedia
                            component='img'
                            src={url}
                            alt={`Preview ${index + 1}`}
                            sx={{ objectFit: 'cover', height: '100%' }}
                          />
                          <CardActions
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              borderRadius: '90%'
                            }}
                          >
                            <Button
                              color='error'
                              onClick={() =>
                                setNewProductData(prev => ({
                                  ...prev,
                                  mediaUrl: prev.mediaUrl.filter((_, i) => i !== index)
                                }))
                              }
                            >
                              <Delete fontSize='small' />
                            </Button>
                          </CardActions>
                        </Card>
                      ))}
                    </Box>
                  </Box>

                  {/* Product Details Section */}
                  <Box mt={3}>
                    <TextField
                      label='Product Title'
                      fullWidth
                      value={newProductData.title}
                      onChange={e => setNewProductData({ ...newProductData, title: e.target.value })}
                      margin='normal'
                    />
                    {/* <TextField
                      label='Description'
                      fullWidth
                      multiline
                      rows={4}
                      value={newProductData.descriptionHtml}
                      onChange={e => setNewProductData({ ...newProductData, descriptionHtml: e.target.value })}
                      margin='normal'
                    /> */}
                    <Box mt={3}>
                      <Typography variant='h6'>Description</Typography>
                      <ReactQuill
                        ref={reactQuillRef}
                        theme='snow'
                        placeholder='Start writing...'
                        modules={{
                          toolbar: {
                            container: [
                              [{ header: '1' }, { header: '2' }, { font: [] }],
                              [{ size: [] }],
                              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                              [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                              ['link', 'image', 'video'],
                              ['code-block'],
                              ['clean']
                            ]
                          },
                          clipboard: {
                            matchVisual: false
                          }
                        }}
                        formats={[
                          'header',
                          'font',
                          'size',
                          'bold',
                          'italic',
                          'underline',
                          'strike',
                          'blockquote',
                          'list',
                          'bullet',
                          'indent',
                          'link',
                          'image',
                          'video',
                          'code-block'
                        ]}
                        value={newProductData.descriptionHtml}
                        onChange={value => setNewProductData({ ...newProductData, descriptionHtml: value })}
                      />
                    </Box>
                    <TextField
                      select
                      label='Type'
                      fullWidth
                      value={newProductData.type}
                      onChange={e => setNewProductData({ ...newProductData, type: e.target.value })}
                      margin='normal'
                    >
                      {productTypes?.map(option => (
                        <MenuItem key={option} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label='Tags'
                      value={newProductData.tags}
                      onChange={e => setNewProductData({ ...newProductData, tags: e.target.value })}
                    />
                    {/* <TextField
                      fullWidth
                      label='Category'
                      value={newProductData.category}
                      onChange={e => setNewProductData({ ...newProductData, category: e.target.value })}
                      margin='normal'
                      sx={{ mb: 2 }}
                    /> */}
                  </Box>

                  {/* Collections and Brands */}
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      select
                      label='Collection'
                      value={newProductData?.collection}
                      onChange={e => setNewProductData({ ...newProductData, collection: e.target.value })}
                      margin='normal'
                      sx={{ mb: 2 }}
                    >
                      {categories?.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.title}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      select
                      label='Brands'
                      value={newProductData?.brand}
                      onChange={e => setNewProductData({ ...newProductData, brand: e.target.value })}
                      margin='normal'
                      sx={{ mb: 2 }}
                    >
                      {brands?.map((brand, index) => (
                        <MenuItem key={index} value={`${index + 1}_${brand.name}`}>
                          {`${index + 1}. ${brand.name}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box display='flex' justifyContent='space-between' mt={3}>
                    {currentStep > 1 ? (
                      <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
                        Previous
                      </Button>
                    ) : (
                      <Box />
                    )}
                    <Box>
                      <Button variant='contained' color='primary' onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={handleModalPageCHange}
                        disabled={loading}
                        sx={{ ml: 2 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Typography variant='h5' gutterBottom>
                    Add Variant Details
                  </Typography>
                  <Box mt={3}>
                    {newProductData?.variants?.map((variant, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>Variant {index + 1}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TextField
                            label='Option Name'
                            fullWidth
                            value={variant.optionName}
                            onChange={e => handleVariantOptionChange(index, 'optionName', e.target.value)}
                            margin='normal'
                          />
                          {variant?.optionValues?.map((value, valIndex) => (
                            <TextField
                              key={valIndex}
                              label={`Option Value ${valIndex + 1}`}
                              fullWidth
                              value={value}
                              onChange={e => handleOptionValueChange(index, valIndex, e.target.value)}
                              margin='normal'
                              sx={{ mb: 1 }}
                            />
                          ))}
                          <Button
                            onClick={() => handleAddOptionValue(index)}
                            variant='text'
                            color='primary'
                            sx={{ mt: 1 }}
                          >
                            Add Option Value
                          </Button>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    <Button
                      onClick={handleAddVariantOption}
                      variant='contained'
                      color='primary'
                      startIcon={<Add />}
                      sx={{ mt: 2 }}
                    >
                      Add Variant Option
                    </Button>
                  </Box>
                  <Box display='flex' justifyContent='space-between' mt={3}>
                    <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
                      Previous
                    </Button>
                    <Box>
                      <Button variant='contained' color='primary' onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={handleNextStep}
                        disabled={loading}
                        sx={{ ml: 2 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <Typography variant='h4' gutterBottom>
                    Add Variant Details
                  </Typography>
                  <Box mb={2}>
                    <TextField
                      label='Comparable Price'
                      fullWidth
                      type='number'
                      value={newProductData.comparePrice || ''}
                      onChange={e => setNewProductData({ ...newProductData, comparePrice: e.target.value })}
                      // onChange={e => handleVariantInputChange(index, 'comparePrice', e.target.value)}
                      margin='normal'
                    />
                  </Box>
                  <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflowY: 'auto', mb: 3 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Variant Title</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Inventory Quantity</TableCell>
                          <TableCell>GST (18%)</TableCell>
                          <TableCell>MRP (Price + GST)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {variantDetails?.map((variant, index) => (
                          <TableRow key={variant.id}>
                            <TableCell>{variant.title}</TableCell>
                            <TableCell>
                              <TextField
                                type='number'
                                value={variant.price}
                                onChange={e => handleVariantInputChange(index, 'price', e.target.value)}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type='number'
                                value={variant.inventory}
                                onChange={e => handleVariantInputChange(index, 'inventory', e.target.value)}
                                fullWidth
                              />
                            </TableCell>

                            <TableCell>
                              <TextField
                                label='GST Percentage'
                                fullWidth
                                type='number'
                                value={gstPercentage}
                                onChange={e => setGstPercentage(Number(e.target.value))}
                                margin='normal'
                              />
                            </TableCell>

                            <TableCell>
                              <TextField
                                label='MRP Price (with 18% GST)'
                                type='text'
                                // value={variant.price ? `₹${(parseFloat(variant.price) * 1.18).toFixed(2)}` : ''}
                                value={
                                  variant.price
                                    ? `₹${(parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2)}`
                                    : ''
                                }
                                disabled
                                fullWidth
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    {/* <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
                      Previous
                    </Button> */}
                    <Box>
                      <Button variant='contained' color='primary' onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={createFinalProduct}
                        disabled={loading}
                        sx={{ ml: 2 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            width: 900,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 3
          }}
        >
          {currentStep === 1 ? (
            <>
              <Typography variant='h4' gutterBottom>
                Edit Product Details
              </Typography>
              <Box mb={3}>
                <Typography variant='body1' gutterBottom sx={{ mb: 1 }}>
                  Upload Images
                </Typography>
                <Button variant='contained' component='label' startIcon={<Add />} sx={{ mb: 2 }} color='primary'>
                  Choose Files
                  <input type='file' accept='image/*' hidden multiple onChange={handleImageUpload} />
                </Button>
                {isUploading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
                <Box
                  display='flex'
                  flexWrap='wrap'
                  gap={2}
                  sx={{
                    mt: 2,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 1,
                    justifyContent: 'flex-start'
                  }}
                >
                  {editProductData?.mediaUrl?.map((url, index) => (
                    <Card key={index} sx={{ width: 120, height: 120, position: 'relative', boxShadow: 2 }}>
                      <CardMedia
                        component='img'
                        src={url}
                        alt={`preview ${index}`}
                        height='120'
                        sx={{ borderRadius: 1, objectFit: 'cover' }}
                      />
                      <CardActions
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '50%'
                        }}
                      >
                        <IconButton
                          fontSize='small'
                          onClick={() =>
                            setEditProductData(prevData => ({
                              ...prevData,
                              mediaUrl: prevData.mediaUrl.filter((_, i) => i !== index)
                            }))
                          }
                          color='error'
                        >
                          <Delete fontSize='small' />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              </Box>

              <TextField
                required
                label='Title'
                fullWidth
                margin='normal'
                value={editProductData?.title || ''}
                onChange={e => setEditProductData({ ...editProductData, title: e.target.value })}
              />
              {/* <TextField
                label='Description'
                fullWidth
                margin='normal'
                multiline
                rows={4}
                value={editProductData?.descriptionHtml}
                onChange={e => setEditProductData({ ...editProductData, descriptionHtml: e.target.value })}
              /> */}
              <Box sx={{ mt: 3 }}>
                <Typography variant='h6'>Description</Typography>
                <ReactQuill
                  ref={reactQuillRef}
                  theme='snow'
                  placeholder='Start writing...'
                  modules={{
                    toolbar: {
                      container: [
                        [{ header: '1' }, { header: '2' }, { font: [] }],
                        [{ size: [] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                        ['link', 'image', 'video'],
                        ['code-block'],
                        ['clean']
                      ]
                    },
                    clipboard: {
                      matchVisual: false
                    }
                  }}
                  formats={[
                    'header',
                    'font',
                    'size',
                    'bold',
                    'italic',
                    'underline',
                    'strike',
                    'blockquote',
                    'list',
                    'bullet',
                    'indent',
                    'link',
                    'image',
                    'video',
                    'code-block'
                  ]}
                  value={editProductData?.descriptionHtml}
                  onChange={value => setEditProductData({ ...editProductData, descriptionHtml: value })}
                />
              </Box>
              <TextField
                select
                label='Type'
                fullWidth
                margin='normal'
                value={editProductData?.type || ''}
                onChange={e =>
                  setEditProductData({
                    ...editProductData,
                    type: e.target.value
                  })
                }
                sx={{ mb: 2 }}
              >
                {productTypes?.map(option => (
                  <MenuItem key={option} value={option?.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label='Tags'
                fullWidth
                margin='normal'
                value={editProductData?.tags}
                onChange={e => setEditProductData({ ...editProductData, tags: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                select
                label='Collection'
                value={editProductData?.collection}
                onChange={e => setEditProductData({ ...editProductData, collection: e.target.value })}
                margin='normal'
                sx={{ mb: 2 }}
              >
                {categories?.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {Array.isArray(editProductData?.collection) &&
                  editProductData?.collection.map((collectionName, index) => (
                    <Chip
                      key={index}
                      label={collectionName}
                      color='primary'
                      variant='outlined'
                      onDelete={() => handleRemoveCollection(collectionName)}
                    />
                  ))}
              </Box>
              <TextField
                fullWidth
                select
                label='Brands'
                value={editProductData?.brand}
                onChange={e => setEditProductData({ ...editProductData, brand: e.target.value })}
                margin='normal'
                sx={{ mb: 2 }}
              >
                {brands?.map((brand, index) => (
                  <MenuItem key={index} value={`${index + 1}_${brand.name}`}>
                    {`${index + 1}. ${brand.name}`}
                  </MenuItem>
                ))}
              </TextField>
              {editProductData?.brand ? (
                <Chip
                  key={editProductData?.brand}
                  label={formatBrand(editProductData?.brand)}
                  color='primary'
                  variant='outlined'
                  // onDelete={() => {
                  //   const updatedCollections = editProductData.collection.filter((_, i) => i !== index)
                  //   setEditProductData({ ...editProductData, collection: updatedCollections })
                  // }
                  onDelete={index => {
                    console.log('delete product', editProductData)

                    setEditProductData({ ...editProductData, brand: '' })
                  }}
                />
              ) : (
                ''
              )}

              <Box display='flex' justifyContent='space-between' mt={3}>
                {/* Previous button not shown on step 1 */}
                <Box />
                <Box>
                  <Button variant='contained' color='primary' onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant='contained' color='primary' onClick={handleAllDetailsSave} sx={{ ml: 2 }}>
                    Next
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography variant='h4' gutterBottom>
                Edit Variant Details
              </Typography>

              <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflowY: 'auto', mb: 3 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Variant Title</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Gst</TableCell>
                      <TableCell>Compare Price</TableCell>
                      <TableCell>Inventory Quantity</TableCell>
                      <TableCell>MRP with GST</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editVariantDetails?.map((variant, index) => (
                      <TableRow key={variant.id}>
                        <TableCell>{variant.title}</TableCell>
                        <TableCell>
                          <TextField
                            type='number'
                            value={variant.price}
                            onChange={e => {
                              const updatedVariants = [...editVariantDetails]
                              updatedVariants[index].price = e.target.value
                              setEditVariantDetails(updatedVariants)
                            }}
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                        </TableCell>
                        <Box mb={2}>
                          <TextField
                            label='GST Percentage'
                            fullWidth
                            type='number'
                            value={gstPercentage}
                            onChange={e => setGstPercentage(Number(e.target.value))}
                            margin='normal'
                          />
                        </Box>

                        <TableCell>
                          <TextField
                            type='number'
                            value={variant.comparePrice}
                            onChange={e => {
                              const updatedVariants = [...editVariantDetails]
                              updatedVariants[index].comparePrice = e.target.value
                              setEditVariantDetails(updatedVariants)
                            }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type='number'
                            value={variant.inventoryQuantity}
                            onChange={e => {
                              const updatedVariants = [...editVariantDetails]
                              updatedVariants[index].inventoryQuantity = e.target.value
                              setEditVariantDetails(updatedVariants)
                            }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            label='MRP Price (with GST)'
                            type='text'
                            value={
                              variant.price
                                ? `₹${(parseFloat(variant.price) * (1 + gstPercentage / 100)).toFixed(2)}`
                                : ''
                            }
                            disabled
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display='flex' justifyContent='space-between' mt={3}>
                <Button variant='contained' color='primary' onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
                <Box>
                  <Button variant='outlined' onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => {
                      handleSaveEdit(editVariantDetails)
                    }}
                    sx={{ ml: 2 }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
      <Modal open={isImagePreviewOpen} onClose={handleCloseImagePreview}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',

            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',

            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 2,

            // Make sure content can scroll if needed
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {selectedReviewImages.length > 0 && (
            <>
              <img
                src={selectedReviewImages[currentImageIndex]}
                alt='Full Preview'
                // Increase the image size
                style={{
                  width: '100%', // fill the container width
                  maxHeight: '70vh', // keep it within viewport height
                  objectFit: 'contain' // prevent distortion
                }}
              />

              {/* Navigation + Close buttons here */}
            </>
          )}
        </Box>
      </Modal>

      <Modal open={openDescriptionModal} onClose={() => setOpenDescriptionModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          <Typography variant='h6' gutterBottom>
            Full Description
          </Typography>
          <div dangerouslySetInnerHTML={{ __html: selectedDescription }} />
          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button onClick={() => setOpenDescriptionModal(false)} variant='contained'>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      <Dialog open={openVariantEdit} onClose={() => setOpenVariantEdit(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Edit Variants</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {variantEditData &&
            variantEditData.map((variant, idx) => (
              <Box key={variant.id} mb={2} border='1px solid #ddd' p={1} borderRadius={2}>
                <Typography variant='subtitle1' gutterBottom>
                  Variant {idx + 1}
                </Typography>
                {'color' in variant && (
                  <TextField
                    label='Color'
                    fullWidth
                    value={variant.color}
                    onChange={e =>
                      setVariantEditData(prev =>
                        prev.map(v => (v.id === variant.id ? { ...v, color: e.target.value } : v))
                      )
                    }
                    sx={{ mb: 1 }}
                  />
                )}
                <TextField
                  label='Size'
                  fullWidth
                  value={variant.size}
                  onChange={e =>
                    setVariantEditData(prev =>
                      prev.map(v => (v.id === variant.id ? { ...v, size: e.target.value } : v))
                    )
                  }
                  sx={{ mb: 1 }}
                />
                <TextField
                  label='Name'
                  fullWidth
                  value={variant.name}
                  onChange={e =>
                    setVariantEditData(prev =>
                      prev.map(v => (v.id === variant.id ? { ...v, name: e.target.value } : v))
                    )
                  }
                />
              </Box>
            ))}

          {/* New Variant Section */}
          <Box
            mt={2}
            display='flex'
            alignItems='center'
            sx={{ cursor: 'pointer' }}
            onClick={() => setShowNewVariantForm(prev => !prev)}
          >
            {/* <Add sx={{ mr: 1 }} /> */}
            {/* <Typography variant='body1'>Add New Variant</Typography> */}
          </Box>
          {showNewVariantForm && (
            <Box mt={2} p={2} border='1px dashed #ccc' borderRadius={2}>
              <TextField
                label='Option Name'
                fullWidth
                value={newVariant.optionName}
                onChange={e => setNewVariant({ ...newVariant, optionName: e.target.value })}
                margin='normal'
              />
              <TextField
                label='Option Value'
                fullWidth
                value={newVariant.optionValue}
                onChange={e => setNewVariant({ ...newVariant, optionValue: e.target.value })}
                margin='normal'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVariantEdit(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSaveVariantEdits} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// export default ProductTable

const ProtectedChatPage = () => {
  return (
    <ProtectedRoutes requiredPermission='shop'>
      <ProductTable />
    </ProtectedRoutes>
  )
}

export default ProtectedChatPage
