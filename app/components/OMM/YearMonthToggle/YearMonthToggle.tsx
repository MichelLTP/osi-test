import React from "react"
import { Label } from "@/components/ui/Label/Label"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/Toggle/toggle-group"
import SingleSelection from "@/components/Shared/SingleSelection/SingleSelection"
import { YearMonthToggleProps } from "@/components/OMM/YearMonthToggle/types"

const YearMonthToggle = ({
  period,
  onOptionChange,
  availableYears,
  currentYear,
  showLabel = false,
}: YearMonthToggleProps) => {
  return (
    <fieldset className="flex flex-col md:flex-row items-end gap-6">
      <section className="flex flex-col gap-4">
        {showLabel && <Label className="text-sm -ml-5">Select a View</Label>}
        <ToggleGroup
          type="single"
          value={period}
          variant="outline"
          size="default"
          onValueChange={(value) => onOptionChange("period", value)}
        >
          <ToggleGroupItem value="yearly">yearly</ToggleGroupItem>
          <ToggleGroupItem value="monthly">monthly</ToggleGroupItem>
        </ToggleGroup>
      </section>

      <section className={"-mb-2"}>
        <SingleSelection
          disabled={period === "yearly"}
          triggerClasses={"w-52"}
          placeholder={"Select a Year"}
          handleValueChange={(value) => onOptionChange("activeYear", value)}
          options={availableYears.map((year: number) => ({
            value: year?.toString(),
            label: year?.toString(),
          }))}
          value={currentYear ? currentYear.toString() : null}
        />
      </section>
    </fieldset>
  )
}
export default YearMonthToggle
