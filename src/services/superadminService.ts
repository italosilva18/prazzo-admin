import api from './api'

export const superadminService = {
  // Dashboard
  getDashboardStats: async () => {
    const { data } = await api.get('/superadmin/dashboard/stats')
    return data.data
  },

  getQuickStats: async () => {
    const { data } = await api.get('/superadmin/dashboard/quick-stats')
    return data.data
  },

  // Companies
  getCompanies: async (params?: { status?: string; plan?: string; search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/superadmin/companies', { params })
    return data
  },

  getCompanyDetail: async (id: string) => {
    const { data } = await api.get(`/superadmin/companies/${id}`)
    return data.data
  },

  createCompany: async (companyData: any) => {
    const { data } = await api.post('/superadmin/companies', companyData)
    return data.data
  },

  updateCompany: async (id: string, companyData: any) => {
    const { data } = await api.put(`/superadmin/companies/${id}`, companyData)
    return data.data
  },

  deleteCompany: async (id: string) => {
    const { data } = await api.delete(`/superadmin/companies/${id}`)
    return data
  },

  // Users
  getUsers: async (params?: { company_id?: string; role?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/superadmin/users', { params })
    return data
  },

  getUserDetail: async (id: string) => {
    const { data } = await api.get(`/superadmin/users/${id}`)
    return data.data
  },

  updateUser: async (id: string, userData: any) => {
    const { data } = await api.put(`/superadmin/users/${id}`, userData)
    return data.data
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/superadmin/users/${id}`)
    return data
  },

  getUserStats: async () => {
    const { data } = await api.get('/superadmin/users/stats')
    return data.data
  },

  // Billing
  getBillingOverview: async () => {
    const { data } = await api.get('/superadmin/billing/overview')
    return data.data
  },

  // Analytics
  getAnalyticsOverview: async () => {
    const { data } = await api.get('/superadmin/analytics/overview')
    return data.data
  },

  // System
  getSystemHealth: async () => {
    const { data } = await api.get('/superadmin/system/health')
    return data.data
  },

  getSystemConfig: async () => {
    const { data } = await api.get('/superadmin/system/config')
    return data.data
  },

  setMaintenanceMode: async (enabled: boolean, message?: string) => {
    const { data } = await api.post('/superadmin/system/maintenance', { enabled, message })
    return data
  },
}

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data.data
  },
}
