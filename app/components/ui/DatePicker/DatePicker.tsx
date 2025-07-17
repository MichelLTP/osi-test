import { cn } from "@/utils/shadcn/utils"
import { Button } from "../Button/Button"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DatePickerProps } from "./type"
import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ExternalComponents/DropdownMenu/dropdown-menu"
import { MonthPicker } from "../MonthPicker/MonthPicker"
import { Calendar } from "../Calendar/Calendar"

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  variantPicker = "default",
}) => {
  const [open, setOpen] = useState(false)

  const handleDateChange = (date: Date | undefined) => {
    const isoDate = date ? date.toISOString() : ""
    onChange(isoDate)
    setOpen(false)
  }
  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "p-6 h-[45px] text-left bg-third text-secondary text-base border-none rounded-xs dark:bg-secondary-dark dark:text-white outline-none",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (
              variantPicker === "default" ? (
                format(value, "PPP")
              ) : (
                format(value, "MMMM yyyy")
              )
            ) : (
              <span className="text-secondary dark:text-white">
                Select a date
              </span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto p-0 bg-white dark:bg-secondary-dark">
          {variantPicker === "default" ? (
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={handleDateChange}
              initialFocus
            />
          ) : (
            <MonthPicker
              onMonthSelect={handleDateChange}
              selectedMonth={value ? new Date(value) : undefined}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default DatePicker
