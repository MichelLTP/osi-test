import YearMonthPicker from "@/components/ui/DatePicker/YearMonthPicker"
import React from "react"
import { clsx } from "clsx"
import { YearMonthSelectorProps } from "@/components/OMM/YearMonthSelector/types"

const YearMonthSelector = ({
  currentDate,
  setCurrentDate,
  years,
  classNames,
  disabled = false,
  showConfirmationPopover = false,
}: YearMonthSelectorProps) => {
  return (
    <fieldset className={clsx("flex gap-4 w-full", classNames && classNames)}>
      <YearMonthPicker
        variant={"month"}
        value={currentDate.month}
        className={"w-full"}
        onChange={(date) => setCurrentDate({ ...currentDate, month: date })}
        disabled={disabled}
        showConfirmationPopover={showConfirmationPopover}
      />
      <YearMonthPicker
        variant={"year"}
        value={currentDate.year}
        className={"w-full"}
        years={years}
        onChange={(date) => setCurrentDate({ ...currentDate, year: date })}
        disabled={disabled}
        showConfirmationPopover={showConfirmationPopover}
      />
    </fieldset>
  )
}

export default YearMonthSelector
