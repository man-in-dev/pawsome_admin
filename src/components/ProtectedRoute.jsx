// import React, { useEffect, useState } from 'react'

// import { useRouter } from 'next/navigation'

// const ProtectedRoute = ({ children, requiredPermission }) => {
//   const router = useRouter()
//   const [isAuthorized, setIsAuthorized] = useState(false)

//   useEffect(() => {
//     const storedPermissions = localStorage.getItem('permissions')

//     if (storedPermissions) {
//       try {
//         const permissions = JSON.parse(storedPermissions) // Extract permissions array from local storage
//         console.log('Permissions:', permissions)
//         console.log('Required Permission:', requiredPermission)

//         // Check if user has the required permission
//         if (permissions.includes(requiredPermission)) {
//           setIsAuthorized(true)
//         } else {
//           setIsAuthorized(false)
//           router.push('/unauthorized') // Redirect to unauthorized page
//         }
//       } catch (error) {
//         console.error('Error parsing permissions:', error)
//         router.push('/login')
//       }
//     } else {
//       router.push('/login') // Redirect to login if no permissions are found
//     }
//   }, [requiredPermission, router])

//   if (!isAuthorized) {
//     return null // You can add a loading spinner or placeholder here
//   }

//   return <>{children}</>
// }

// export default ProtectedRoute

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

const ProtectedRoute = ({ children, requiredPermission }) => {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(null) // null is for loading state
  const [loading, setLoading] = useState(true) // To show loading while checking permissions

  useEffect(() => {
    const storedToken = localStorage.getItem('token') // Or sessionStorage depending on how you're storing it
    const storedPermissions = localStorage.getItem('permissions')

    // Early return if token or permissions are missing
    if (!storedToken || !storedPermissions) {
      router.push('/login') // Redirect to login if no token or permissions
      return
    }

    try {
      const permissions = JSON.parse(storedPermissions) // Parse permissions
      // console.log('Permissions:', permissions)
      // console.log('Required Permission:', requiredPermission)

      // Check if the user has the required permission
      if (permissions.includes(requiredPermission)) {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
        router.push('/unauthorized') // Redirect to unauthorized page if permission not found
      }
    } catch (error) {
      console.error('Error parsing permissions:', error)
      router.push('/login') // Redirect to login if there's an error
    } finally {
      setLoading(false) // Set loading to false after checking
    }
  }, [requiredPermission, router])

  if (loading) {
    return <div>Loading...</div> // You can show a spinner or some loading indicator here
  }

  if (!isAuthorized) {
    return null // Don't render anything if not authorized
  }

  return <>{children}</> // Render the children components if authorized
}

export default ProtectedRoute
