import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CronPresetsProps {
  value: string;
  onChange: (cron: string) => void;
  className?: string;
}

interface CronPreset {
  label: string;
  value: string;
  description: string;
}

const presets: CronPreset[] = [
  {
    label: "Diariamente as 8h",
    value: "0 8 * * *",
    description: "Todos os dias as 08:00",
  },
  {
    label: "Diariamente as 18h",
    value: "0 18 * * *",
    description: "Todos os dias as 18:00",
  },
  {
    label: "Segunda-feira as 9h",
    value: "0 9 * * 1",
    description: "Toda segunda as 09:00",
  },
  {
    label: "Sexta-feira as 17h",
    value: "0 17 * * 5",
    description: "Toda sexta as 17:00",
  },
  {
    label: "Primeiro dia do mes",
    value: "0 8 1 * *",
    description: "Dia 1 de cada mes as 08:00",
  },
  {
    label: "Dia 15 de cada mes",
    value: "0 8 15 * *",
    description: "Dia 15 de cada mes as 08:00",
  },
];

export function CronPresets({ value, onChange, className }: CronPresetsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">Frequencia de Envio</p>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant={value === preset.value ? "default" : "outline"}
            size="sm"
            className="h-auto py-2 px-3 flex flex-col items-start text-left"
            onClick={() => onChange(preset.value)}
          >
            <span className="font-medium text-xs">{preset.label}</span>
            <span className={cn(
              "text-[10px] mt-0.5",
              value === preset.value ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {preset.description}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function getCronDescription(cron: string): string {
  const preset = presets.find((p) => p.value === cron);
  if (preset) return preset.description;

  const parts = cron.split(" ");
  if (parts.length !== 5) return "Expressao personalizada";

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const weekDays: Record<string, string> = {
    "0": "Domingo",
    "1": "Segunda-feira",
    "2": "Terca-feira",
    "3": "Quarta-feira",
    "4": "Quinta-feira",
    "5": "Sexta-feira",
    "6": "Sabado",
    "*": "todos os dias",
  };

  if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
    return `Dia ${dayOfMonth} de cada mes as ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }

  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
    return `${weekDays[dayOfWeek] || "Dia " + dayOfWeek} as ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }

  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `Todos os dias as ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }

  return "Expressao personalizada";
}

export default CronPresets;
