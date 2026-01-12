import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, FileSpreadsheet, Download, Loader2, Building2, Users, CreditCard, BarChart3 } from "lucide-react";
import type { ReportTemplate } from "@/services/reportsService";

interface ReportCardProps {
  template: ReportTemplate;
  onGenerate: (format: "pdf" | "excel") => void;
  isLoading: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  tasks: <FileText className="w-6 h-6 text-white" />,
  extensions: <FileText className="w-6 h-6 text-white" />,
  users: <Users className="w-6 h-6 text-white" />,
  analytics: <BarChart3 className="w-6 h-6 text-white" />,
  companies: <Building2 className="w-6 h-6 text-white" />,
  billing: <CreditCard className="w-6 h-6 text-white" />,
};

const typeColors: Record<string, string> = {
  tasks: "bg-blue-500",
  extensions: "bg-amber-500",
  users: "bg-emerald-500",
  analytics: "bg-purple-500",
  companies: "bg-indigo-500",
  billing: "bg-pink-500",
};

export function ReportCard({ template, onGenerate, isLoading }: ReportCardProps) {
  const icon = typeIcons[template.type] || typeIcons.tasks;
  const color = typeColors[template.type] || typeColors.tasks;

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{template.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
          <div className="flex items-center gap-2 mt-3">
            {template.formats.length === 1 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerate(template.formats[0])}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : template.formats[0] === "pdf" ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Gerar {template.formats[0].toUpperCase()}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Gerar Relatorio
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {template.formats.includes("pdf") && (
                    <DropdownMenuItem onClick={() => onGenerate("pdf")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </DropdownMenuItem>
                  )}
                  {template.formats.includes("excel") && (
                    <DropdownMenuItem onClick={() => onGenerate("excel")}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Baixar Excel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportCard;
