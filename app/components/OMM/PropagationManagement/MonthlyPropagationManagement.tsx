import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Label } from "@/components/ui/Label/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import { Input } from "@/components/ui/Input/Input"
import {
  PropagationAdjustments,
  PropagationManagementProps,
  PropagationType,
} from "@/components/OMM/PropagationManagement/types"
import { Button } from "@/components/ui/Button/Button"
import { getYear } from "date-fns"
import YearMonthSelector from "@/components/OMM/YearMonthSelector/YearMonthSelector"

const MonthlyPropagationManagement = ({
  years,
  applyPropagation,
}: PropagationManagementProps) => {
  const [propagationAdjustments, setPropagationAdjustments] =
    useState<PropagationAdjustments>({
      year: years[0] ?? getYear(new Date()),
      month: "Jan",
      value: 1,
      type: "Absolute",
    })

  const yearOptions = useMemo(() => years?.map(String), [years])
  const typeOptions: PropagationType[] = ["Absolute", "Percentual"]

  const handleApply = useCallback(() => {
    applyPropagation(
      Number(propagationAdjustments.year),
      propagationAdjustments.month,
      propagationAdjustments.type as PropagationType,
      propagationAdjustments.value
    )
  }, [applyPropagation, propagationAdjustments])

  useEffect(() => {
    setPropagationAdjustments({
      year: years[0],
      month: "Jan",
      value: 1,
      type: "Absolute",
    })
  }, [years])

  return (
    <>
      <h3
        className={
          "text-xlbold pt-10 border-t border-t-secondary/50 dark:border-t-third/50"
        }
      >
        Continuous Scenario Changes
      </h3>
      <p className={"mb-4 text-sm"}>
        Apply forward changes to your scenario, by selecting a starting year,
        the type of change and the value.
      </p>
      <fieldset className={"grid sm:grid-cols-3 gap-4 mb-2 items-end"}>
        <div className={"flex flex-col gap-3"}>
          <Label htmlFor={"year"} className={"text-sm"}>
            Select the date to apply changes
          </Label>
          <YearMonthSelector
            currentDate={{
              month: propagationAdjustments.month,
              year: propagationAdjustments.year,
            }}
            setCurrentDate={(date) => {
              setPropagationAdjustments({
                ...propagationAdjustments,
                year: date.year,
                month: date.month,
              })
            }}
            years={yearOptions}
          />
        </div>
        <div>
          <Label htmlFor={"propagation-type"} className={"text-sm"}>
            Select the type of changes
          </Label>
          <Select
            value={propagationAdjustments.type}
            onValueChange={(value) =>
              setPropagationAdjustments({
                ...propagationAdjustments,
                type: value,
              })
            }
            name={"propagation-type"}
          >
            <SelectTrigger
              name={"propagation-type"}
              id={"propagation-type"}
              className="input-focus mt-3 flex items-center justify-between bg-third h-[45px] pl-5 rounded-xs dark:bg-secondary-dark dark:text-white outline-none"
            >
              <SelectValue
                className="text-red-400 border-2 border-red-500 p-2"
                placeholder={"Choose one"}
              />
            </SelectTrigger>
            <SelectContent className="input-focus rounded-sm shadow-md border border-input bg-white dark:bg-secondary-dark dark:text-white">
              {typeOptions.map((type: string) => (
                <SelectItem
                  className="rounded-sm hover:bg-primary hover:text-white dark:text-white hover:dark:text-white transition"
                  key={type}
                  value={type}
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={"propagate-value"} className={"text-sm"}>
            Choose the value
          </Label>
          <Input
            name={"propagate-value"}
            type={"number"}
            inputMode={"decimal"}
            className="mt-3 dark:bg-secondary-dark dark:text-white outline-none input-focus"
            value={propagationAdjustments.value.toString()}
            onChange={(e) =>
              setPropagationAdjustments({
                ...propagationAdjustments,
                value: e.target.valueAsNumber,
              })
            }
          />
        </div>
      </fieldset>
      <div className="flex justify-end">
        <Button
          type={"button"}
          variant={"underline"}
          onClick={() => handleApply()}
        >
          Apply
        </Button>
      </div>
    </>
  )
}
export default React.memo(MonthlyPropagationManagement)
