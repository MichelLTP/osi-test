import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion/Accordion"
import { Switch } from "@/components/ui/Switch/Switch"
import { Label } from "@/components/ui/Label/Label"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/Toggle/toggle-group"
import { DashboardOptionsProps } from "./type"
import React from "react"
import YearMonthToggle from "@/components/OMM/YearMonthToggle/YearMonthToggle"

const DashboardOptions: React.FC<DashboardOptionsProps> = ({
  options,
  onOptionChange,
  availableYears,
  currentYear,
}) => {
  const { isDoubleContext, period, baseline } = options
  return (
    <Accordion type="single" collapsible className="w-full p-0 border-t">
      <AccordionItem value="1">
        <AccordionTrigger>
          <p className="text-2xl">Options</p>
        </AccordionTrigger>

        <AccordionContent>
          <section className="flex flex-col items-center md:flex-row md:items-end justify-between gap-20 2xl:gap-40 transition-none">
            <div className="flex gap-4">
              <Label htmlFor="context-selection" className="text-base">
                Compare contexts
              </Label>
              <Switch
                id="context-selection"
                checked={isDoubleContext}
                onCheckedChange={(value: boolean) =>
                  onOptionChange("isDoubleContext", value)
                }
                className={
                  "data-[state=checked]:bg-secondary dark:data-[state=checked]:bg-primary !transition-none"
                }
              />
            </div>

            <YearMonthToggle
              period={period}
              onOptionChange={onOptionChange}
              availableYears={availableYears}
              currentYear={currentYear}
            />

            <div className="flex flex-col gap-4">
              <Label className="text-base -ml-5">Toggle baselines</Label>
              <ToggleGroup
                type="single"
                value={baseline}
                variant="outline"
                onValueChange={(value) => onOptionChange("baseline", value)}
              >
                <ToggleGroupItem value="pure">pure</ToggleGroupItem>
                <ToggleGroupItem value="consensus">consensus</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </section>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default React.memo(DashboardOptions)
