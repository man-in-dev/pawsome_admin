import axios from '../../utils/axios'

// analytics apis
export const vetAnalytics = (startDate, endDate) =>
  axios('2003', 'veterinary', `admin/analytics?startDate=${startDate}&endDate=${endDate}`, 'GET')
export const matchAnalytics = (startDate, endDate) =>
  axios('2007', 'match', `admin/match/analytics?startDate=${startDate}&endDate=${endDate}`, 'GET')

export const profileAnalytics = (startDate, endDate) =>
  axios('2002', 'profile', `admin/analytics?startDate=${startDate}&endDate=${endDate}`, 'GET')

export const shopanAnalytics = data =>
  axios('2006', 'shop', `admin/analytics?startDate=${data?.startDate}&endDate=${data?.endDate}`, 'GET', data)

export const communityAnalytics = (startDate, endDate) =>
  axios('2005', 'community', `admin/analytics?startDate=${startDate}&endDate=${endDate}`, 'GET')

export const changeAdminPassword = data => axios('2001', 'authentication', 'admin/userPassword', 'PUT', data)

//AUTH
export const login = data => axios('2001', 'authentication', 'admin/login', 'POST', data)
//update admin
export const getAdminDetails = id => axios('2001', 'authentication', `admin/getDetails/${id}`, 'GET')
export const updateAdminDetails = (id, data) => axios('2001', 'authentication', `admin/update/${id}`, 'PUT', data)
//---------------------------------------
//api for appointments
export const getVetByClinicId = id => axios('2003', 'veterinary', `admin/vet/vetByClinicId/${id}`, 'GET')
export const updateAppointment = (id, data) =>
  axios('2003', 'veterinary', `admin/appointment/updateAppointment/${id}`, 'PUT', data)
//api for  membership plan

export const createMenbershipPlan = data => axios('2008', 'subscription', 'admin/createsubscription', 'POST', data)
export const getAllPlans = data => axios('2008', 'subscription', 'admin/getAllPlans', 'GET')
export const editPlan = data => axios('2008', 'subscription', 'admin/editplan', 'PUT', data)
export const deletePlan = data => axios('2008', 'subscription', '/admin/deletePlan', 'DELETE', data)

// api for accounts
export const getAllPermission = data => axios('2001', 'authentication', 'admin/fetchAllPermissions', 'GET')
export const createRole = data => axios('2001', 'authentication', 'admin/createRole', 'POST', data)
export const getAllRoles = data => axios('2001', 'authentication', 'admin/getAllRoles', 'GET')
export const createUser = data => axios('2001', 'authentication', 'admin/createUser', 'POST', data)
export const getAllAdminsUser = data => axios('2001', 'authentication', 'admin/getAllAdminUsers', 'GET')

//api to change user details admin user
export const changeDetails = (id, data) => axios('2001', 'authentication', `admin/changeDetails/${id}`, 'PUT', data)

//----------------------------------------------------------------------

//api for users lists in admin panel

export const getAllUsers = data => axios('2001', 'authentication', 'admin/users', 'GET')
// export const getAllUserId = id => axios('2001', 'authentication', `admin/${id}`, 'GET')
export const getUserProfile = id => axios('2002', 'profile', `admin/user/${id}`, 'GET')
export const getPetByUserId = id => axios('2002', 'profile', `admin/pet/user/${id}`, 'GET') //used in userlists
//api to update user paw-points
export const updatePawPoints = (id, data) => axios('2002', 'profile', `admin/user/updatePawPoint/${id}`, 'PUT', data)
export const getUserPetById = id => axios('2002', 'profile', `pet/${id}`, 'GET')
//using below for user detils
export const getusers = data => axios('2002', 'profile', 'admin/user', 'GET')
export const blockUser = (id, data) => axios('2002', 'profile', `admin/user/block/${id}`, 'POST', data)
export const unblockUser = (id, data) => axios('2002', 'profile', `admin/user/unblock/${id}`, 'POST', data)
export const deleteUser = (id) => axios('2002', 'profile', `admin/user/permanently/${id}`, 'DELETE')
//--------------------
//post / community api
export const getAllPosts = () => axios('2005', 'community', 'admin/post', 'GET')
export const getPostById = postId => axios('2005', 'community', `admin/post/${postId}`, 'GET')
export const deleteComment = commentId => axios('2005', 'community', `admin/post/comment/${commentId}`, 'DELETE')
export const deletePost = (data, postId) => axios('2005', 'community', `admin/post/delete/${postId}`, 'DELETE', data)
export const deleteReply = (postId, data) => axios('2005', 'community', `admin/post/reply/${postId}`, 'DELETE', data)

//-----------------------------------------------------------------
//api for packages
export const getAllPackages = data => axios('2003', 'veterinary', `admin/package/allpackage`, 'GET')
export const createPackage = data => axios('2003', 'veterinary', `admin/package/createPackage`, 'POST', data)
export const updatePackage = (id, data) => axios('2003', 'veterinary', `admin/package/updatePackage/${id}`, 'PUT', data)
export const deletePackage = id => axios('2003', 'veterinary', `admin/package/packageDelete/${id}`, 'DELETE')

//api for coupons
export const getAllCoupons = data => axios('2009', 'settings', `coupon/admin/getCoupons`, 'GET')
export const createCoupon = data => axios('2009', 'settings', `coupon/admin/createCoupon`, 'POST', data)
export const editCoupon = (id, data) => axios('2009', 'settings', `coupon/admin/updateCoupon/${id}`, 'PUT', data)
export const updateStatus = (id, data) => axios('2009', 'settings', `coupon/admin/updateStatus/${id}`, 'PUT', data)
export const deleteCoupon = (id, data) => axios('2009', 'settings', `coupon/admin/deleteCoupon/${id}`, 'DELETE', data)

//api to edit role
export const editRole = data => axios('2001', 'authentication', 'admin/updateRole', 'PUT', data)
export const deleteRole = roleId => axios('2001', 'authentication', `admin/role/${roleId}`, 'DELETE')
export const editUser = (id, data) => axios('2001', 'authentication', `admin/role/edit/${id}`, 'PUT', data)
// api for  settings refer points,help,privacy
export const getAllReferPoints = data => axios('2009', 'settings', 'settings', 'GET')
export const updateRefferPoints = data => axios('2009', 'settings', 'settings', 'PUT', data)
export const updateHelpCenter = data => axios('2009', 'settings', 'settings/helpCenter', 'PUT', data)
export const updatePrivacyPolicy = data => axios('2009', 'settings', 'settings/privacyPolicy', 'PUT', data)
export const updateTermsandCondiotion = data => axios('2009', 'settings', 'settings/termsandCondition', 'PUT', data)

// api for hospital managment
export const createHospital = data => axios('2003', 'veterinary', 'admin/clinic', 'POST', data)
export const getAllHospital = data => axios('2003', 'veterinary', 'admin/clinic', 'GET', data)
export const uploadImage = data => axios('2000', 'document', '/file/upload', 'POST', data, true)
export const editHospital = (id, data) => axios('2003', 'veterinary', `admin/clinic/${id}`, 'PUT', data)
export const deleteClinic = id => axios('2003', 'veterinary', `admin/clinic/delete/${id}`, 'DELETE')

//api for vet managment

export const createVet = data => axios('2003', 'veterinary', 'admin/vet', 'POST', data)
export const getAllVets = data => axios('2003', 'veterinary', 'admin/vet', 'GET')
export const editVet = (data, id) => axios('2003', 'veterinary', `admin/vet/${id}`, 'PUT', data)
// export const deleteVet = (data, id) => axios('2003', 'veterinary', `vet/${id}`, 'DELETE')
export const deleteVet = data => axios('2003', 'veterinary', `admin/vet/delete`, 'DELETE', data)

// shopify apis
export const getAllProducts = data => axios('2006', 'shop', 'admin/products', 'GET')
export const getCollections = data => axios('2006', 'shop', `admin/getCollections`, 'GET')
export const createProduct = data => axios('2006', 'shop', `admin/createProduct`, 'POST', data)
export const updateProduct = data => axios('2006', 'shop', `admin/updateProductDetails`, 'PUT', data)
export const deleteProduct = data => axios('2006', 'shop', `admin/deleteProduct`, 'DELETE', data)
export const addVariants = data => axios('2006', 'shop', `admin/addVariant`, 'PUT', data)
export const updateProductPrice = data => axios('2006', 'shop', 'admin/updateVariantPrice', 'PUT', data)
export const getAllOrders = data => axios('2006', 'shop', 'admin/getOrders', 'GET')
export const updateOrder = (id, data) => axios('2006', 'shop', `admin/updateOrder?id=${id}`, 'POST', data)
export const getAllCollections = data => axios('2006', 'shop', 'admin/getCollections', 'GET')
export const createCollection = data => axios('2006', 'shop', 'admin/createCollection', 'POST', data)
export const updateCollection = data => axios('2006', 'shop', 'admin/updateCollection', 'PUT', data)
export const deleteCollection = data => axios('2006', 'shop', `admin/deleteCollection`, 'DELETE', data)
export const removeCollectionFromProduct = data => axios('2006', 'shop', `admin/removeCollection`, 'PUT', data)
// brands api
export const getAllBrands = data => axios('2006', 'shop', 'admin/getBrands', 'GET')
export const deleteBrand = (id, data) => axios('2006', 'shop', `admin/deleteBrand/${id}`, 'DELETE')
export const addBrand = data => axios('2006', 'shop', `admin/createBrand`, 'POST', data)
export const updateBrand = (id, data) => axios('2006', 'shop', `admin/updateBrand/${id}`, 'PUT', data)
// api for banners
export const getAllBanners = data => axios('2009', 'settings', `banner/admin/getBanners`, 'GET')
export const createBanner = data => axios('2009', 'settings', `banner/admin/createBanner`, 'POST', data)
export const editBanner = (id, data) => axios('2009', 'settings', `banner/admin/editBanner/${id}`, 'PUT', data)
export const deleteBanner = (id, data) => axios('2009', 'settings', `banner/admin/deleteBanner/${id}`, 'DELETE')

//-----------------
//pet apis

export const getAllPets = () => axios('2003', 'veterinary', 'admin/pet', 'GET')
export const deletePet = (data, id) => axios('2003', 'veterinary', `admin/pet/${id}`, 'DELETE')

export const blockPet = (petId, data) => axios('2002', 'profile', `admin/pet/block/${petId}`, 'PUT', data)
export const unblockPet = (petId, data) => axios('2002', 'profile', `admin/pet/unblock/${petId}`, 'PUT', data)
export const createTemperament = data => axios('2002', 'profile', `admin/pet/createTemperament`, 'POST', data)
export const getAllTemperament = data => axios('2002', 'profile', `admin/pet/getAllTemperament`, 'GET', data)
export const updateTemperament = (id, data) =>
  axios('2002', 'profile', `admin/pet/updateTemperament/${id}`, 'PUT', data)
export const removeTemperament = id => axios('2002', 'profile', `admin/pet/deleteTemperament/${id}`, 'DELETE')
export const getAllDisease = data => axios('2002', 'profile', `admin/pet/getDisease`, 'GET')
export const updateDisease = (id, data) => axios('2002', 'profile', `admin/pet/updateDisease/${id}`, 'PUT', data)
export const createDisease = data => axios('2002', 'profile', `admin/pet/createDisease`, 'POST', data)
export const deleteDisease = (id, data) => axios('2002', 'profile', `admin/pet/deleteDisease/${id}`, 'DELETE', data)

// for shop update variat
export const updateVariantsData = data => axios('2006', 'shop', `admin/updateVariant`, 'PUT', data)


//------------------------------------------------------------------------------------------------------------------------
// api for admin appointments
export const getAllAppointments = data => axios('2003', 'veterinary', 'admin/appointment', 'GET', data)
export const getAllAppointmentsHouse = data => axios('2003', 'veterinary', 'admin/appointment/inhouse', 'GET')
export const updateAppointmentStatus = data =>
  axios('2003', 'veterinary', 'admin/appointment/updateStatus', 'PUT', data)
export const sendNotificationAdmin = data =>
  axios('2001', 'authentication', 'admin/adminSendNotification', 'POST', data)


export const updatePaidStatus = data => axios('2003', 'veterinary', 'admin/appointment/paidStatus', 'PUT', data)
export const amountPaid = data => axios('2003', 'veterinary', 'admin/appointment/amountpaid', 'PUT', data)
export const amountPaidOnSopt = data => axios('2003', 'veterinary', 'admin/appointment/amountpaidonspot', 'PUT', data)

export const amountPaidVet = data => axios('2003', 'veterinary', 'admin/appointment/inhousepaid', 'PUT', data)
export const amountPaidVetSpot = data => axios('2003', 'veterinary', 'admin/appointment/inhouseonsopt', 'PUT', data)

export const addComment = data => axios('2003', 'veterinary', 'admin/appointment/addComment', 'PUT', data)
// api for notificatoion
export const sendNotification = data => axios('2001', 'authentication', 'admin/notificationSend', 'POST', data)

// api to block user
// api for matches admin
export const getAllMatches = petId => axios('2007', 'match', `admin/match/match/${petId}`, 'GET')
// api to fetch chat
export const getAllChats = id => axios('2007', 'match', `admin/match/chat/${id}`, 'GET')

//api for report users lists
export const getAllReports = data => axios('2009', 'settings', 'admin/adminreport', 'GET')

//api for sending forgot re-set link
export const forgotPassword = data => axios('2001', 'authentication', `admin/resetLink`, 'POST', data)
export const resetPassword = data => axios('2001', 'authentication', `admin/resetPassword`, 'POST', data)

// ANALYTICS
export const getUserAnalytics = data => axios('2002', 'profile', 'admin/user/getAnalytics', 'GET')

//DELIVERY

export const getDeliveryDetails = data => axios('2006', 'shop', 'admin/deliverydetails', 'GET')
export const createDeliveryDetails = data => axios('2006', 'shop', 'admin/createDelivery', 'POST', data)
export const updateDeliveryDetails = data => axios('2006', 'shop', 'admin/updateDeliveryDetails', 'PUT', data)
export const deleteDeliveryDetails = data => axios('2006', 'shop', 'admin/deliveryDetails', 'DELETE', data)

export const updateAdminPassword = data => {
  axios('')
}

//DOCUMENTS
export const uploadSingleDocument = file => {
  axios()
}

//ADMINS
export const getAdmins = search => axios(`admins${search}`, 'GET')

export const getPermissions = () => axios('admins/permissions', 'GET')

export const createAdmin = data => axios('admins', 'POST', data)

export const updateAdmin = (id, data) => axios(`admins/${id}`, 'PUT', data)
export const activateDeactivateAdmin = (id, data) => axios(`admins/${id}`, 'PATCH', data)

// export const changePassword = (id, data) =>
//   axios(`admins/${id}/password`, "PATCH", data);

// API RELATED TO GET / CREATE CATEGORIES
export const getAllCategory = () => axios(`admin/category/get_all_category`, 'GET')

//API TO GET ALL USER
export const getAllUser = () => axios(`admin/user/all_users`, 'GET')

export const getAllEmailUsers = () => axios(`admin/notification/all_Users_Email`, 'GET')

//API TO CHANGE PASSWORD
export const changePassword = data => axios(`admin/auth/change_password`, 'POST', data)

//API TO SEND OTP
export const sendOTP = data => axios(`admin/otp/send_otp`, 'POST', data)

//API TO SEND CHANGED PASSWORD
export const sendPassword = data => axios(`admin/auth/change_password`, 'POST', data)

//API TO GET DASHBOARD DATA
export const getDashboard = () => axios(`admin/user/dashboard`, 'GET')

//API TO GET USER BY ID
export const getUserById = id => axios(`/admin/user/user_by_id?id=${id}`, 'GET')

//API TO SEND BULK EMAIL
export const sendEmail = data => axios(`admin/notification/bulk_email`, 'POST', data)

//API TO GET ALL COMMINITY
export const getAllCommunity = () => axios(`admin/community/get_all_community`, 'GET')

//API TO GET ALL PERMISSIONS
// export const getAllPermission = () => axios(`admin/role/get_all_permissions`, "GET")

//API TO CREATE ROLE
// export const createRole = (data) => axios(`admin/role/create_role`, "POST", data)

//API TO GET ALL ROLES
// export const getAllRoles = () => axios(`admin/role/get_all_roles`, "GET")

//API TO CREATE ADMIN USER
export const createAdminUser = data => axios(`admin/role/create_user`, 'POST', data)

// API TO CREATE POST
export const createPost = data => axios(`admin/post/post`, 'POST', data)

//API TO GET ALL POST
export const getAllPost = () => axios(`admin/post/all_post`, 'GET')

//API TP GET ALL ADMIN USERS
// export const getALlAdminsUser = () => axios(`admin/role/all_admin`, "GET")

//API TO SEND POST
export const sendPost = data => axios(`admin/notification/bulk_notification`, 'POST', data)

// API TO UPDATE COMMINITY
export const updateCommunity = data => axios(`admin/community/update_community`, 'PUT', data, false)

// API TO CREATE A COMMINITY
export const createCommunity = data => axios(`admin/community/create_community`, 'POST', data)

// API TO DELETE A COMMUNITY
export const deleteCommunity = id => axios(`admin/community/delete_community`, 'DELETE', id)

// API TO EDIT ROLE
export const updateROle = data => axios(`admin/role/update_role`, 'PUT', data)

//API TO EDIT ADMIN USER
export const updateAdminUser = data => axios(`admin/role/update_user`, 'PUT', data)

//API TO DELETE ADMIN USER
export const deleteAdminUser = id => axios(`admin/role/delete_user`, 'DELETE', id)

export const updateCategory = data => axios(`admin/category/update_category`, 'PATCH', data)

//API TO SEND FORGOT PASSWORD

export const updateSubCategory = data => axios(`admin/subcategory/update_subcategory`, 'PATCH', data)

//API TO DELETE A CATEGORY
export const deleteCategory = data => axios(`admin/category/delete_category`, 'DELETE', data)

//API TO DELETE A SUBCATEGORY
export const deleteSubCategory = data => axios(`admin/subcategory/delete_subcategory`, 'DELETE', data)

//API TO BLOCK A UAER

//API TO UPDATE POST
export const updatePost = data => axios(`admin/post/update_post`, 'PUT', data)

//API TO DELETE A POST
// export const deletePost = data => axios(`admin/post/delete_post`, 'DELETE', data)

//API TO GET USER B Y COMMUNITY
export const getUserByCommunity = id => axios(`admin/community/get_user_by_community?community_id=${id}`, 'GET')

//api to send invites

export const sendInvites = data => axios(`admin/community/send_invite`, 'POST', data)

// API TO SEND RESET PASSWORD

//API TO GET POST BY ID
// export const getPostById = id => axios(`admin/post/get_post_by_id?post_id=${id}`, 'GET')

//API TO GET USER CHART DETAILS

export const getUserChart = (from, to) => axios(`admin/user/average_user_count?from=${from}&to=${to}`, 'GET')

//API TO GET USER CHATS

export const getUserChat = id => axios(`admin/user/chat_list?id=${id}`, 'GET')
export const getUserChats = roomId => axios(`admin/user/load_chat?roomId=${roomId}`, 'GET')

// API TO CREATE POLICY

export const createPolicy = data => axios(`admin/privacy/create_policy`, 'POST', data)

// API TO GET POLICY

export const getAllPolicy = () => axios(`admin/privacy/get_policy`, 'GET')

// API TO UNBLOCK A USER

export const unBlockUser = data => axios(`user/action/unblock_user`, 'POST', data)

// api to get all reported user

export const reportedUsers = () => axios(`admin/report/get_all_report`, 'GET')

// api to delete reported user

export const deleteReportedUser = data => axios(`admin/user/delete_user`, 'DELETE', data)

// api to edit pet details
export const editPetDetails = data => axios('2002', 'Profile', 'admin/pet/updateDetails', 'PUT', data)

//export const updatePawPoints = (id, data) => axios('2002', 'profile', `admin/user/updatePawPoint/${id}`, 'PUT', data)

//api to update app user details
export const updateAppUser = (id, data) => axios('2002', 'profile', `admin/user/updateAppUser/${id}`, 'PUT', data)

//api to add note in appointment
export const addNote = data => axios('2003', 'veterinary', 'admin/appointment/updateNote', 'PUT', data)