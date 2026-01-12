import { useState, useEffect } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

interface Preset {
  label: string;
  getValue: () => DateRange;
}

const presets: Preset[] = [
  {
    label: "Ultimos 7 dias",
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "Ultimos 30 dias",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "Este mes",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: "Mes anterior",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "Ultimos 90 dias",
    getValue: () => ({
      from: subDays(new Date(), 90),
      to: new Date(),
    }),
  },
];

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    // Try to detect which preset matches the current value
    const matchingPreset = presets.find((preset) => {
      const range = preset.getValue();
      return (
        format(range.from, "yyyy-MM-dd") === format(value.from, "yyyy-MM-dd") &&
        format(range.to, "yyyy-MM-dd") === format(value.to, "yyyy-MM-dd")
      );
    });
    setSelectedPreset(matchingPreset?.label || null);
  }, [value]);

  const handlePresetClick = (preset: Preset) => {
    const range = preset.getValue();
    onChange(range);
    setSelectedPreset(preset.label);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange) => {
    if (!range.from || !range.to) return "Selecione o periodo";
    if (selectedPreset) return selectedPreset;
    return `${format(range.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(range.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "justify-start text-left font-normal min-w-[200px]",
          !value && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDateRange(value)}
        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              Selecione o periodo
            </p>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant={selectedPreset === preset.label ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DateRangePicker;
