import axios from 'axios'

export const API = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/v1/',
})

export const API_AUTH = axios.create({
  baseURL: process.env.VUE_APP_AUTH_URL || 'http://localhost:5000/admin/',
})
