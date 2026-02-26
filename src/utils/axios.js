import axios from 'axios'
import { getApiUrl } from './apiConfig'

export default (port, service, endpoint, method, data, isMultipart) => {
  // Use localhost for development, production URL for production
  const apiUrl = getApiUrl(port, service)
  const fullUrl = `${apiUrl}/${endpoint}`

  const isGetMethod = method?.toUpperCase() === 'GET'

  return axios({
    url: fullUrl,
    method,
    // For GET requests, send data as query params; for others, send as body
    ...(isGetMethod ? { params: data } : { data }),
    headers: {
      'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
}