import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Plus } from "lucide-react";
import { CronPresets } from "./CronPresets";
import type { ReportTemplate, CreateScheduledReportData, ScheduledReport } from "@/services/reportsService";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ReportTemplate[];
  onSubmit: (data: CreateScheduledReportData) => Promise<void>;
  editData?: ScheduledReport | null;
  isLoading?: boolean;
}

export function ScheduleModal({
  open,
  onOpenChange,
  templates,
  onSubmit,
  editData,
  isLoading,
}: ScheduleModalProps) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [schedule, setSchedule] = useState("0 8 * * 1");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setTemplateId(editData.type);
      setFormat(editData.format as "pdf" | "excel");
      setSchedule(editData.schedule);
      setRecipients(editData.recipients);
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setName("");
    setTemplateId(templates[0]?.id || "");
    setFormat("pdf");
    setSchedule("0 8 * * 1");
    setRecipients([]);
    setEmailInput("");
  };

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && isValidEmail(email) && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTemplate = templates.find((t) => t.id === templateId);

    await onSubmit({
      name,
      templateId,
      type: selectedTemplate?.type || "tasks",
      format,
      schedule,
      recipients,
    });
  };

  const selectedTemplate = templates.find((t) => t.id === templateId);
  const availableFormats = selectedTemplate?.formats || ["pdf", "excel"];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {editData ? "Editar Relatorio Agendado" : "Novo Relatorio Agendado"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure um relatorio para ser gerado e enviado automaticamente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nome do Agendamento</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Relatorio Semanal de Tarefas"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatorio</label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Formato</label>
                <Select value={format} onValueChange={(v) => setFormat(v as "pdf" | "excel")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFormats.includes("pdf") && (
                      <SelectItem value="pdf">PDF</SelectItem>
                    )}
                    {availableFormats.includes("excel") && (
                      <SelectItem value="excel">Excel</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CronPresets value={schedule} onChange={setSchedule} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Destinatarios (E-mails)</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="email@exemplo.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddEmail}
                  disabled={!emailInput.trim() || !isValidEmail(emailInput.trim())}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Pressione Enter ou clique no + para adicionar
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !name || !templateId || recipients.length === 0}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editData ? "Salvar Alteracoes" : "Criar Agendamento"}
              </Button>
            </div>
          </form>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
      </div>
    </div>
  );
}

export default ScheduleModal;
