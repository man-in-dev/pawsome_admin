import axios from 'axios'
import { getApiUrl } from './apiConfig'

export default (port, service, endpoint, method, data, isMultipart) => {
  // Use localhost for development, production URL for production
  const apiUrl = getApiUrl(port, service)
  const fullUrl = `${apiUrl}/${endpoint}`

  return axios({
    url: fullUrl,
    method,
    data,
    headers: {
      'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
}