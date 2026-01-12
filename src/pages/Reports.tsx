import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Mail,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ReportCard,
  DateRangePicker,
  ScheduleModal,
  getCronDescription,
  type DateRange,
} from "@/components/reports";
import {
  reportsService,
  defaultReportTemplates,
  type ReportTemplate,
  type ScheduledReport,
  type CreateScheduledReportData,
} from "@/services/reportsService";
import { superadminService } from "@/services/superadminService";

export default function Reports() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"generate" | "scheduled">("generate");
  const [generating, setGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, _setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  // Fetch templates
  const { data: templates = defaultReportTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ["report-templates"],
    queryFn: () => reportsService.getTemplates().catch(() => defaultReportTemplates),
  });

  // Fetch scheduled reports
  const { data: scheduledReports = [], isLoading: scheduledLoading } = useQuery({
    queryKey: ["scheduled-reports"],
    queryFn: () => reportsService.getScheduledReports().catch(() => []),
  });

  // Fetch companies for filter
  const { data: companies = [] } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      try {
        const data = await superadminService.getCompanies();
        return data.companies || [];
      } catch {
        return [];
      }
    },
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: reportsService.createScheduledReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
      setScheduleModalOpen(false);
      toast.success("Agendamento criado com sucesso!");
    },
    onError: () => {
      toast.error("Nao foi possivel criar o agendamento.");
    },
  });

  // Toggle schedule mutation
  const toggleScheduleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      reportsService.toggleScheduledReport(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
      toast.success(data.isActive ? "Agendamento ativado." : "Agendamento desativado.");
    },
    onError: () => {
      toast.error("Nao foi possivel alterar o status.");
    },
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: reportsService.deleteScheduledReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      toast.success("Agendamento removido com sucesso.");
    },
    onError: () => {
      toast.error("Nao foi possivel excluir o agendamento.");
    },
  });

  const handleGenerateReport = async (template: ReportTemplate, reportFormat: "pdf" | "excel") => {
    try {
      setGenerating(template.id);
      toast.info(`Gerando ${template.name} em ${reportFormat.toUpperCase()}...`);

      const blob = await reportsService.generateReport({
        templateId: template.id,
        type: template.type,
        format: reportFormat,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        filters: companyFilter !== "all" ? { companyId: companyFilter } : undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${template.id}_${format(dateRange.from, "yyyyMMdd")}_${format(dateRange.to, "yyyyMMdd")}.${reportFormat === "pdf" ? "pdf" : "xlsx"}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Relatorio baixado com sucesso!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Nao foi possivel gerar o relatorio. Tente novamente.");
    } finally {
      setGenerating(null);
    }
  };

  const handleCreateSchedule = async (data: CreateScheduledReportData) => {
    await createScheduleMutation.mutateAsync(data);
  };

  const handleToggleSchedule = (schedule: ScheduledReport) => {
    toggleScheduleMutation.mutate({ id: schedule.id, isActive: !schedule.isActive });
  };

  const handleDeleteSchedule = () => {
    if (deletingId) {
      deleteScheduleMutation.mutate(deletingId);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const isLoading = templatesLoading || scheduledLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gere e agende relatorios do sistema
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("generate")}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "generate"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Gerar Relatorios
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "scheduled"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Agendados
          </button>
        </div>
      </div>

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">Periodo:</span>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">Empresa:</span>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Report Templates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-8 bg-muted rounded w-32 mt-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <ReportCard
                  key={template.id}
                  template={template}
                  onGenerate={(reportFormat) => handleGenerateReport(template, reportFormat)}
                  isLoading={generating === template.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === "scheduled" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Relatorios enviados automaticamente por e-mail
            </p>
            <Button size="sm" onClick={() => setScheduleModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
                  <div className="h-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : scheduledReports.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Nenhum agendamento configurado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie agendamentos para receber relatorios automaticamente por e-mail.
              </p>
              <Button onClick={() => setScheduleModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Agendamento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledReports.map((schedule) => (
                <div key={schedule.id} className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {schedule.name}
                        </h3>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {schedule.format.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getCronDescription(schedule.schedule)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {schedule.recipients.length} destinatario(s)
                        </span>
                      </div>
                      {schedule.nextRunAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Proximo envio: {format(new Date(schedule.nextRunAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleSchedule(schedule)}
                        title={schedule.isActive ? "Desativar" : "Ativar"}
                      >
                        {schedule.isActive ? (
                          <ToggleRight className="w-5 h-5 text-primary" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(schedule.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        templates={templates}
        onSubmit={handleCreateSchedule}
        editData={editingSchedule}
        isLoading={createScheduleMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-background rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-foreground mb-2">Excluir Agendamento</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Tem certeza que deseja excluir este agendamento? Esta acao nao pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSchedule}
                disabled={deleteScheduleMutation.isPending}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
