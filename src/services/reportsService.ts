import api from "./api";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "tasks" | "extensions" | "users" | "analytics" | "companies" | "billing";
  formats: ("pdf" | "excel")[];
  filters?: string[];
}

export interface ScheduledReport {
  id: string;
  name: string;
  type: string;
  format: string;
  schedule: string;
  recipients: string[];
  lastRunAt: string | null;
  nextRunAt: string;
  isActive: boolean;
  createdAt: string;
  companyId?: string;
}

export interface GenerateReportParams {
  templateId: string;
  type: "tasks" | "extensions" | "users" | "analytics" | "companies" | "billing";
  format: "pdf" | "excel";
  startDate: string;
  endDate: string;
  filters?: {
    companyId?: string;
    unitId?: string;
    userId?: string;
    status?: string;
    planId?: string;
  };
}

export interface CreateScheduledReportData {
  name: string;
  templateId: string;
  type: string;
  format: "pdf" | "excel";
  schedule: string;
  recipients: string[];
  companyId?: string;
}

export interface UpdateScheduledReportData {
  name?: string;
  format?: "pdf" | "excel";
  schedule?: string;
  recipients?: string[];
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const reportsService = {
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await api.get<ApiResponse<ReportTemplate[]>>("/superadmin/reports/templates");
    return response.data.data;
  },

  async generateReport(params: GenerateReportParams): Promise<Blob> {
    const response = await api.post("/superadmin/reports/generate", params, {
      responseType: "blob",
      timeout: 120000,
    });
    return response.data;
  },

  async getScheduledReports(): Promise<ScheduledReport[]> {
    const response = await api.get<ApiResponse<ScheduledReport[]>>("/superadmin/reports/schedule");
    return response.data.data;
  },

  async createScheduledReport(data: CreateScheduledReportData): Promise<ScheduledReport> {
    const response = await api.post<ApiResponse<ScheduledReport>>("/superadmin/reports/schedule", data);
    return response.data.data;
  },

  async updateScheduledReport(id: string, data: UpdateScheduledReportData): Promise<ScheduledReport> {
    const response = await api.put<ApiResponse<ScheduledReport>>(`/superadmin/reports/schedule/${id}`, data);
    return response.data.data;
  },

  async deleteScheduledReport(id: string): Promise<void> {
    await api.delete(`/superadmin/reports/schedule/${id}`);
  },

  async toggleScheduledReport(id: string, isActive: boolean): Promise<ScheduledReport> {
    const response = await api.patch<ApiResponse<ScheduledReport>>(`/superadmin/reports/schedule/${id}/toggle`, {
      isActive,
    });
    return response.data.data;
  },
};

// Default templates for superadmin with global scope
export const defaultReportTemplates: ReportTemplate[] = [
  {
    id: "tasks-summary",
    name: "Resumo de Tarefas",
    description: "Relatorio completo de tarefas de todas as empresas",
    type: "tasks",
    formats: ["pdf", "excel"],
    filters: ["company", "unit", "status", "dateRange"],
  },
  {
    id: "extensions-report",
    name: "Solicitacoes de Extensao",
    description: "Historico de extensoes em todas as empresas",
    type: "extensions",
    formats: ["pdf", "excel"],
    filters: ["company", "status", "dateRange"],
  },
  {
    id: "users-performance",
    name: "Desempenho de Usuarios",
    description: "Metricas de produtividade global por usuario",
    type: "users",
    formats: ["pdf", "excel"],
    filters: ["company", "role", "dateRange"],
  },
  {
    id: "analytics-overview",
    name: "Analise Geral",
    description: "Visao consolidada do sistema completo",
    type: "analytics",
    formats: ["pdf", "excel"],
    filters: ["dateRange"],
  },
  {
    id: "companies-report",
    name: "Relatorio de Empresas",
    description: "Dados de todas as empresas, usuarios e uso do sistema",
    type: "companies",
    formats: ["pdf", "excel"],
    filters: ["plan", "status", "dateRange"],
  },
  {
    id: "billing-report",
    name: "Relatorio de Faturamento",
    description: "Receitas, assinaturas e metricas financeiras",
    type: "billing",
    formats: ["pdf", "excel"],
    filters: ["plan", "dateRange"],
  },
];

export default reportsService;
