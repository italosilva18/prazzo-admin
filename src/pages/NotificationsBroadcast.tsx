import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Eye,
  ArrowLeft,
  Users,
  Building2,
  Shield,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { superadminService } from "@/services/superadminService";
import { cn } from "@/lib/utils";
import type {
  NotificationType,
  BroadcastTarget,
  NotificationBroadcastRequest,
} from "@/types/notification";

interface Company {
  id: string;
  name: string;
}

const notificationTypes: { value: NotificationType; label: string; icon: typeof Info; color: string }[] = [
  { value: "info", label: "Informacao", icon: Info, color: "text-blue-500" },
  { value: "success", label: "Sucesso", icon: CheckCircle, color: "text-green-500" },
  { value: "warning", label: "Aviso", icon: AlertTriangle, color: "text-yellow-500" },
  { value: "error", label: "Erro", icon: XCircle, color: "text-red-500" },
  { value: "system", label: "Sistema", icon: Settings, color: "text-purple-500" },
  { value: "billing", label: "Cobranca", icon: CreditCard, color: "text-orange-500" },
];

const targetOptions: { value: BroadcastTarget; label: string; description: string; icon: typeof Users }[] = [
  { value: "all", label: "Todos os usuarios", description: "Enviar para todos os usuarios do sistema", icon: Users },
  { value: "role", label: "Por cargo", description: "Enviar para usuarios de um cargo especifico", icon: Shield },
  { value: "company", label: "Por empresa", description: "Enviar para todos usuarios de uma empresa", icon: Building2 },
];

const roleOptions = [
  { value: "admin", label: "Administradores" },
  { value: "manager", label: "Gestores" },
  { value: "employee", label: "Funcionarios" },
];

export default function NotificationsBroadcast() {
  const navigate = useNavigate();
  const { broadcast } = useNotifications();

  const [formData, setFormData] = useState<NotificationBroadcastRequest>({
    type: "info",
    title: "",
    message: "",
    target: "all",
    targetValue: undefined,
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch companies for the company target option
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await superadminService.getCompanies({ limit: 100 });
        setCompanies(response.data || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await broadcast(formData);
      navigate("/notifications");
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = notificationTypes.find((t) => t.value === formData.type);
  const TypeIcon = selectedType?.icon || Info;

  const selectedTarget = targetOptions.find((t) => t.value === formData.target);
  const TargetIcon = selectedTarget?.icon || Users;

  const isValid = formData.title.trim() && formData.message.trim() &&
    (formData.target === "all" || formData.targetValue);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enviar Notificacao</h1>
          <p className="text-muted-foreground mt-1">
            Envie notificacoes em massa para usuarios do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notification Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tipo de notificacao
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <TypeIcon className={cn("w-4 h-4", selectedType?.color)} />
                    {selectedType?.label || "Selecione o tipo"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as NotificationType })
                    }
                  >
                    {notificationTypes.map((type) => (
                      <DropdownMenuRadioItem key={type.value} value={type.value}>
                        <type.icon className={cn("w-4 h-4 mr-2", type.color)} />
                        {type.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Titulo
              </label>
              <Input
                placeholder="Digite o titulo da notificacao"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.title.length}/100
              </p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mensagem
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Digite a mensagem da notificacao"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.message.length}/500
              </p>
            </div>

            <Separator />

            {/* Target */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Destinatarios
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <TargetIcon className="w-4 h-4" />
                    {selectedTarget?.label || "Selecione os destinatarios"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuRadioGroup
                    value={formData.target}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        target: value as BroadcastTarget,
                        targetValue: undefined,
                      })
                    }
                  >
                    {targetOptions.map((target) => (
                      <DropdownMenuRadioItem key={target.value} value={target.value}>
                        <div className="flex items-start gap-2">
                          <target.icon className="w-4 h-4 mt-0.5" />
                          <div>
                            <div className="font-medium">{target.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {target.description}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Target Value (Role or Company) */}
            {formData.target === "role" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Selecione o cargo
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {roleOptions.find((r) => r.value === formData.targetValue)?.label ||
                        "Selecione um cargo"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup
                      value={formData.targetValue || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetValue: value })
                      }
                    >
                      {roleOptions.map((role) => (
                        <DropdownMenuRadioItem key={role.value} value={role.value}>
                          {role.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {formData.target === "company" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Selecione a empresa
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {companies.find((c) => c.id === formData.targetValue)?.name ||
                        "Selecione uma empresa"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 max-h-60 overflow-auto">
                    <DropdownMenuRadioGroup
                      value={formData.targetValue || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetValue: value })
                      }
                    >
                      {companies.map((company) => (
                        <DropdownMenuRadioItem key={company.id} value={company.id}>
                          {company.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Ocultar preview" : "Ver preview"}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar notificacao
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className={cn(
          "bg-card rounded-lg border border-border p-6",
          !showPreview && "lg:block hidden"
        )}>
          <h3 className="font-semibold text-foreground mb-4">Preview</h3>

          {formData.title || formData.message ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex gap-3 p-4 bg-accent/30">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  selectedType?.color.replace("text-", "bg-").replace("500", "500/10")
                )}>
                  <TypeIcon className={cn("w-5 h-5", selectedType?.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {formData.title || "Titulo da notificacao"}
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formData.message || "Mensagem da notificacao..."}
                  </p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    Agora mesmo
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-lg">
              <Eye className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Preencha o formulario para ver o preview
              </p>
            </div>
          )}

          {/* Target summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Destinatarios</h4>
            <div className="flex items-center gap-2">
              <TargetIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formData.target === "all" && "Todos os usuarios do sistema"}
                {formData.target === "role" && (
                  formData.targetValue
                    ? `Usuarios com cargo: ${roleOptions.find((r) => r.value === formData.targetValue)?.label}`
                    : "Selecione um cargo"
                )}
                {formData.target === "company" && (
                  formData.targetValue
                    ? `Usuarios da empresa: ${companies.find((c) => c.id === formData.targetValue)?.name}`
                    : "Selecione uma empresa"
                )}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600">Atencao</p>
                <p className="text-yellow-600/80 mt-1">
                  Esta acao enviara notificacoes para todos os usuarios selecionados.
                  Certifique-se de revisar o conteudo antes de enviar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
