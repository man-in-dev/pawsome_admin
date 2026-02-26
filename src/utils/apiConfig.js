// API Configuration for Development/Production
// Service Port Mapping

const SERVICE_PORTS = {
  document: 2000,
  authentication: 2001,
  profile: 2002,
  veterinary: 2003,
  payment: 2004,
  community: 2005,
  shop: 2006,
  match: 2007,
  subscription: 2008,
  settings: 2009,
  notification: 2010,
  grooming: 4001,
  boarding: 4002
}

// Development mode - use localhost
// Set NODE_ENV=development or NEXT_PUBLIC_ENV=development to enable dev mode
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_ENV === 'development' ||
  !process.env.NEXT_PUBLIC_ENV // Default to development if not set

// Base URL configuration
const BASE_URL = 'https://api.pawsomeindia.com'  // Production


  //  IS_DEVELOPMENT
  // ? 'http://localhost'

// Get API URL for a service
export const getApiUrl = (port, service) => {
  // if (IS_DEVELOPMENT) {
  //   // Use the port parameter for localhost
  //   return `http://localhost:${port}/${service}/api/v1`
  // }
  // Production uses the service name in URL
  return `${BASE_URL}/${service}/api/v1`
}

// Export configuration
export const API_CONFIG = {
  IS_DEVELOPMENT,
  BASE_URL,
  SERVICE_PORTS
}


export default API_CONFIG
