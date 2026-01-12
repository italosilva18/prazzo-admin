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

  getBillingStats: async () => {
    const { data } = await api.get('/superadmin/billing/stats')
    return data.data
  },

  getRevenueReport: async (params?: { start_date?: string; end_date?: string; group_by?: string }) => {
    const { data } = await api.get('/superadmin/billing/revenue-report', { params })
    return data.data
  },

  // Plans
  getPlans: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/superadmin/billing/plans', { params })
    return data
  },

  getPlanDetail: async (id: string) => {
    const { data } = await api.get(`/superadmin/billing/plans/${id}`)
    return data.data
  },

  createPlan: async (planData: {
    name: string
    description?: string
    monthly_price: number
    annual_price: number
    features: string[]
    limits: {
      max_users?: number
      max_units?: number
      max_tasks?: number
    }
    is_active: boolean
  }) => {
    const { data } = await api.post('/superadmin/billing/plans', planData)
    return data.data
  },

  updatePlan: async (id: string, planData: {
    name?: string
    description?: string
    monthly_price?: number
    annual_price?: number
    features?: string[]
    limits?: {
      max_users?: number
      max_units?: number
      max_tasks?: number
    }
    is_active?: boolean
  }) => {
    const { data } = await api.put(`/superadmin/billing/plans/${id}`, planData)
    return data.data
  },

  deletePlan: async (id: string) => {
    const { data } = await api.delete(`/superadmin/billing/plans/${id}`)
    return data
  },

  togglePlanStatus: async (id: string, is_active: boolean) => {
    const { data } = await api.patch(`/superadmin/billing/plans/${id}/status`, { is_active })
    return data.data
  },

  // Subscriptions
  getSubscriptions: async (params?: {
    company_id?: string
    plan_id?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const { data } = await api.get('/superadmin/billing/subscriptions', { params })
    return data
  },

  getSubscriptionDetail: async (id: string) => {
    const { data } = await api.get(`/superadmin/billing/subscriptions/${id}`)
    return data.data
  },

  cancelSubscription: async (id: string, reason?: string) => {
    const { data } = await api.post(`/superadmin/billing/subscriptions/${id}/cancel`, { reason })
    return data
  },

  upgradeSubscription: async (id: string, new_plan_id: string) => {
    const { data } = await api.post(`/superadmin/billing/subscriptions/${id}/upgrade`, { new_plan_id })
    return data.data
  },

  renewSubscription: async (id: string) => {
    const { data } = await api.post(`/superadmin/billing/subscriptions/${id}/renew`)
    return data.data
  },

  // Invoices
  getInvoices: async (params?: {
    company_id?: string
    status?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }) => {
    const { data } = await api.get('/superadmin/billing/invoices', { params })
    return data
  },

  getInvoiceDetail: async (id: string) => {
    const { data } = await api.get(`/superadmin/billing/invoices/${id}`)
    return data.data
  },

  markInvoicePaid: async (id: string, payment_data?: {
    payment_method?: string
    payment_date?: string
    transaction_id?: string
  }) => {
    const { data } = await api.post(`/superadmin/billing/invoices/${id}/mark-paid`, payment_data)
    return data
  },

  cancelInvoice: async (id: string, reason?: string) => {
    const { data } = await api.post(`/superadmin/billing/invoices/${id}/cancel`, { reason })
    return data
  },

  sendInvoiceReminder: async (id: string) => {
    const { data } = await api.post(`/superadmin/billing/invoices/${id}/send-reminder`)
    return data
  },

  // Payments
  getPayments: async (params?: {
    company_id?: string
    status?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }) => {
    const { data } = await api.get('/superadmin/billing/payments', { params })
    return data
  },

  // Analytics - Overview
  getAnalyticsOverview: async (period: '7d' | '30d' | '90d' = '30d') => {
    try {
      const { data } = await api.get('/superadmin/analytics/overview', { params: { period } })
      return data.data
    } catch {
      // Return mock data for development
      return {
        total_users: 1234,
        active_today: 456,
        tasks_created: 8765,
        completion_rate: 78.5,
        user_change: 5.2,
        active_change: -2.1,
        tasks_change: 12.3,
        completion_change: 3.4,
        tasks_created_today: 145,
        tasks_completed_today: 98,
        tasks_by_status: [
          { status: 'completed', count: 5432 },
          { status: 'active', count: 1234 },
          { status: 'pending', count: 876 },
          { status: 'expired', count: 223 },
        ],
        usage_by_company: [
          { company_id: '1', company_name: 'TechCorp Brasil', users_count: 45, tasks_count: 234, completion_rate: 85 },
          { company_id: '2', company_name: 'Vendas Express', users_count: 32, tasks_count: 189, completion_rate: 72 },
          { company_id: '3', company_name: 'Logistica Prime', users_count: 28, tasks_count: 156, completion_rate: 91 },
          { company_id: '4', company_name: 'Construcao ABC', users_count: 22, tasks_count: 134, completion_rate: 68 },
          { company_id: '5', company_name: 'Saude Total', users_count: 18, tasks_count: 98, completion_rate: 82 },
        ],
      }
    }
  },

  // Analytics - Chart Data
  getChartData: async (range: '7d' | '30d' | '90d' = '30d') => {
    try {
      const { data } = await api.get('/superadmin/analytics/charts', { params: { range } })
      return data.data
    } catch {
      // Return mock data for development
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
      const generateChartData = (numDays: number) => {
        const chartData = []
        const now = new Date()
        for (let i = numDays - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          chartData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: Math.floor(Math.random() * 200) + 50,
            created: Math.floor(Math.random() * 50) + 10,
            completed: Math.floor(Math.random() * 40) + 5,
          })
        }
        return chartData
      }
      return {
        active_users_chart: generateChartData(days),
        tasks_chart: generateChartData(days),
        plans_distribution: [
          { name: 'Free', value: 45, color: '#6B7280' },
          { name: 'Starter', value: 120, color: '#3B82F6' },
          { name: 'Professional', value: 85, color: '#8B5CF6' },
          { name: 'Enterprise', value: 25, color: '#2DD4B7' },
        ],
      }
    }
  },

  // Analytics - Usage Metrics
  getUsageMetrics: async (period: '7d' | '30d' | '90d' = '30d') => {
    try {
      const { data } = await api.get('/superadmin/analytics/usage', { params: { period } })
      return data.data
    } catch {
      // Return mock data for development
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const generateChartData = (numDays: number) => {
        const chartData = []
        const now = new Date()
        for (let i = numDays - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          chartData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: Math.floor(Math.random() * 200) + 50,
          })
        }
        return chartData
      }
      const generatePeakHours = () => {
        const hours = []
        for (let i = 6; i <= 22; i++) {
          hours.push({
            hour: `${i}:00`,
            activity: Math.floor(Math.random() * 100) + (i >= 9 && i <= 18 ? 50 : 10),
          })
        }
        return hours
      }
      const generateWeekdays = () => {
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
        return weekDays.map((day, i) => ({
          day,
          value: Math.floor(Math.random() * 100) + (i >= 1 && i <= 5 ? 40 : 10),
        }))
      }
      return {
        dau: 456,
        wau: 1234,
        mau: 3456,
        dau_change: 5.2,
        wau_change: 3.1,
        mau_change: 8.7,
        avg_session_duration: 12,
        actions_per_session: 8.5,
        dau_chart: generateChartData(days),
        peak_hours: generatePeakHours(),
        weekday_distribution: generateWeekdays(),
        retention: { day1: 85, day7: 62, day30: 45 },
        top_companies: [
          { id: '1', name: 'TechCorp Brasil', active_users: 42, tasks_per_day: 15.3, activity_score: 92, last_activity: new Date().toISOString() },
          { id: '2', name: 'Vendas Express', active_users: 28, tasks_per_day: 12.1, activity_score: 85, last_activity: new Date().toISOString() },
          { id: '3', name: 'Logistica Prime', active_users: 24, tasks_per_day: 18.7, activity_score: 88, last_activity: new Date().toISOString() },
          { id: '4', name: 'Construcao ABC', active_users: 19, tasks_per_day: 9.4, activity_score: 72, last_activity: new Date().toISOString() },
          { id: '5', name: 'Saude Total', active_users: 16, tasks_per_day: 11.2, activity_score: 79, last_activity: new Date().toISOString() },
          { id: '6', name: 'Educacao Plus', active_users: 14, tasks_per_day: 8.9, activity_score: 68, last_activity: new Date().toISOString() },
          { id: '7', name: 'Financeira XYZ', active_users: 12, tasks_per_day: 7.5, activity_score: 65, last_activity: new Date().toISOString() },
          { id: '8', name: 'Varejo Central', active_users: 11, tasks_per_day: 6.8, activity_score: 61, last_activity: new Date().toISOString() },
          { id: '9', name: 'Industria Norte', active_users: 9, tasks_per_day: 5.2, activity_score: 54, last_activity: new Date().toISOString() },
          { id: '10', name: 'Servicos Sul', active_users: 8, tasks_per_day: 4.1, activity_score: 48, last_activity: new Date().toISOString() },
        ],
      }
    }
  },

  // Analytics - Growth Metrics
  getGrowthMetrics: async () => {
    try {
      const { data } = await api.get('/superadmin/analytics/growth')
      return data.data
    } catch {
      // Return mock data for development
      const generateGrowthData = (numDays: number) => {
        const growthData = []
        const now = new Date()
        let totalUsers = 1000
        let totalCompanies = 50
        for (let i = numDays - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const newUsers = Math.floor(Math.random() * 20) + 5
          const newCompanies = Math.floor(Math.random() * 3)
          totalUsers += newUsers
          totalCompanies += newCompanies
          growthData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            total: totalUsers,
            new: newUsers,
            companies: totalCompanies,
          })
        }
        return { data: growthData, finalUsers: totalUsers, finalCompanies: totalCompanies }
      }
      const { data: userGrowth, finalUsers, finalCompanies } = generateGrowthData(30)
      return {
        new_users_30d: 342,
        new_companies_30d: 12,
        user_growth_rate: 8.5,
        company_growth_rate: 6.2,
        churn_rate: 2.3,
        churn_change: -0.5,
        churn_trend: 'down',
        trial_conversion_rate: 34.5,
        conversion_change: 2.1,
        churned_companies: 3,
        revenue_lost: 4500,
        avg_churned_ltv: 1500,
        user_growth: userGrowth,
        company_growth: userGrowth.map((d) => ({ ...d, total: Math.floor(d.total / 20), new: Math.floor(d.new / 10) })),
        churn_history: [
          { month: 'Jul', churned: 2, retained: 48 },
          { month: 'Ago', churned: 4, retained: 52 },
          { month: 'Set', churned: 3, retained: 55 },
          { month: 'Out', churned: 2, retained: 58 },
          { month: 'Nov', churned: 3, retained: 60 },
          { month: 'Dez', churned: 2, retained: 63 },
        ],
        projected_users: finalUsers + 150,
        projected_user_growth: 150,
        projected_companies: finalCompanies + 8,
        projected_company_growth: 8,
        projected_mrr: 125000,
        mrr_growth_rate: 0.12,
        projections: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          users: finalUsers + Math.floor(i * 5),
          companies: finalCompanies + Math.floor(i * 0.3),
        })),
        conversion_funnel: [
          { name: 'Visitantes', count: 10000, rate: 100 },
          { name: 'Cadastros', count: 2500, rate: 25 },
          { name: 'Trial Ativo', count: 1800, rate: 18 },
          { name: 'Primeira Tarefa', count: 1200, rate: 12 },
          { name: 'Plano Pago', count: 620, rate: 6.2 },
        ],
      }
    }
  },

  // Analytics - Company Ranking
  getCompanyRanking: async (params?: { period?: string; sortBy?: string; sortOrder?: string }) => {
    try {
      const { data } = await api.get('/superadmin/analytics/companies', { params })
      return data.data
    } catch {
      // Return mock data for development
      const companies = [
        { id: '1', name: 'TechCorp Brasil', plan: 'Enterprise', users_count: 45, active_users: 42, tasks_count: 1234, completion_rate: 85, activity_score: 92, status: 'active', last_activity: new Date().toISOString() },
        { id: '2', name: 'Vendas Express', plan: 'Professional', users_count: 32, active_users: 28, tasks_count: 876, completion_rate: 72, activity_score: 85, status: 'active', last_activity: new Date().toISOString() },
        { id: '3', name: 'Logistica Prime', plan: 'Professional', users_count: 28, active_users: 24, tasks_count: 654, completion_rate: 91, activity_score: 88, status: 'active', last_activity: new Date().toISOString() },
        { id: '4', name: 'Construcao ABC', plan: 'Starter', users_count: 22, active_users: 15, tasks_count: 432, completion_rate: 68, activity_score: 62, status: 'active', last_activity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '5', name: 'Saude Total', plan: 'Professional', users_count: 18, active_users: 16, tasks_count: 543, completion_rate: 82, activity_score: 79, status: 'active', last_activity: new Date().toISOString() },
        { id: '6', name: 'Educacao Plus', plan: 'Starter', users_count: 15, active_users: 10, tasks_count: 321, completion_rate: 75, activity_score: 58, status: 'active', last_activity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '7', name: 'Financeira XYZ', plan: 'Enterprise', users_count: 38, active_users: 8, tasks_count: 234, completion_rate: 45, activity_score: 32, status: 'churn_risk', last_activity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '8', name: 'Varejo Central', plan: 'Starter', users_count: 12, active_users: 11, tasks_count: 198, completion_rate: 88, activity_score: 71, status: 'active', last_activity: new Date().toISOString() },
        { id: '9', name: 'Industria Norte', plan: 'Free', users_count: 8, active_users: 3, tasks_count: 87, completion_rate: 52, activity_score: 28, status: 'inactive', last_activity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '10', name: 'Servicos Sul', plan: 'Starter', users_count: 10, active_users: 7, tasks_count: 156, completion_rate: 79, activity_score: 65, status: 'active', last_activity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ]
      const sortBy = params?.sortBy || 'activity'
      const sortOrder = params?.sortOrder || 'desc'
      companies.sort((a: any, b: any) => {
        let aVal, bVal
        switch (sortBy) {
          case 'users': aVal = a.users_count; bVal = b.users_count; break
          case 'tasks': aVal = a.tasks_count; bVal = b.tasks_count; break
          case 'last_activity': aVal = new Date(a.last_activity).getTime(); bVal = new Date(b.last_activity).getTime(); break
          default: aVal = a.activity_score; bVal = b.activity_score
        }
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      })
      return {
        companies,
        total: companies.length,
        summary: { total_companies: 275, active_companies: 245, at_risk: 18, avg_completion_rate: 76 },
      }
    }
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

  // Support
  getSupportStats: async () => {
    const { data } = await api.get('/superadmin/support/stats')
    return data.data
  },

  getTickets: async (params?: { company_id?: string; status?: string; priority?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/superadmin/support/tickets', { params })
    return data
  },

  getTicketDetail: async (id: string) => {
    const { data } = await api.get(`/superadmin/support/tickets/${id}`)
    return data.data
  },

  updateTicket: async (id: string, ticketData: { status?: string; priority?: string }) => {
    const { data } = await api.put(`/superadmin/support/tickets/${id}`, ticketData)
    return data
  },

  replyTicket: async (id: string, message: string) => {
    const { data } = await api.post(`/superadmin/support/tickets/${id}/reply`, { message })
    return data
  },
}

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data.data
  },
}
