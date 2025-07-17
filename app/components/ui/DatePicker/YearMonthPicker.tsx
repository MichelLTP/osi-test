import { cn } from "@/utils/shadcn/utils"
import { Button } from "../Button/Button"
import { CalendarIcon } from "lucide-react"
import { YearMonthPickerProps, YearVariantProps } from "./type"
import React, { useId } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ExternalComponents/DropdownMenu/dropdown-menu"
import { format, parse } from "date-fns"
import ConfirmationPopover from "@/components/Shared/ConfirmationPopover/ConfirmationPopover"

const YearMonthPicker: React.FC<
  YearMonthPickerProps & { className?: string; disabled?: boolean }
> = ({
  value,
  onChange,
  variant = "month",
  className,
  disabled = false,
  showConfirmationPopover,
  ...props
}) => {
  const [open, setOpen] = React.useState(false)
  const id = useId()
  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(0, i), "MMM")
  )
  const options =
    variant === "year" ? (props as YearVariantProps).years : months

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className={cn(
              "!px-4 h-[45px] cursor-pointer !justify-between bg-third font-normal dark:bg-secondary-dark input-focus hover:opacity-80 hover:text-color-inherit",
              !value && "text-muted-foreground",
              className,
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            {value ? (
              <span className="text-secondary dark:text-white">
                {variant === "year"
                  ? value
                  : format(parse(value, "MMM", new Date()), "MMMM")}
              </span>
            ) : (
              <span className="text-secondary/50 dark:text-white/50">
                Select a {variant}
              </span>
            )}

            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="@container rounded-xs dropdown-content-width-full p-0 bg-white dark:bg-secondary-dark">
          <div className="grid grid-cols-3 @xs:grid-cols-4 gap-1 @xs:gap-2 p-2">
            {options?.map((option, index) =>
              variant === "year" && showConfirmationPopover ? (
                <ConfirmationPopover
                  key={index + id}
                  onConfirm={() => {
                    onChange?.(option.toString())
                    setOpen(false)
                  }}
                  confirmationHeader={"Change the starting year?"}
                  confirmationMessage={"All changes will be lost."}
                  onCancel={() => setOpen(false)}
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="py-2 @xs:px-3 mx-auto text-center text-sm hover:cursor-pointer hover:bg-third dark:hover:bg-secondary"
                  >
                    {option}
                  </DropdownMenuItem>
                </ConfirmationPopover>
              ) : (
                <DropdownMenuItem
                  key={index + id}
                  onClick={() => onChange && onChange(option.toString())}
                  className="py-2 @xs:px-3 mx-auto text-center text-sm hover:cursor-pointer hover:bg-third dark:hover:bg-secondary"
                >
                  {option}
                </DropdownMenuItem>
              )
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default YearMonthPicker
