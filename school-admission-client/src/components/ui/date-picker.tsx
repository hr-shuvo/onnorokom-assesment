import { format, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  minDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={minDate ? (date) => date < startOfDay(minDate) : undefined}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
