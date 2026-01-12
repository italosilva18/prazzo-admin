import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'

export type DateRange = '7d' | '30d' | '90d'

interface DateRangePickerProps {
  value: DateRange
  onChange: (value: DateRange) => void
  className?: string
}

const rangeOptions: Array<{ value: DateRange; label: string }> = [
  { value: '7d', label: 'Ultimos 7 dias' },
  { value: '30d', label: 'Ultimos 30 dias' },
  { value: '90d', label: 'Ultimos 90 dias' },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || 'w-[180px]'}>
        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Selecione o periodo" />
      </SelectTrigger>
      <SelectContent>
        {rangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
