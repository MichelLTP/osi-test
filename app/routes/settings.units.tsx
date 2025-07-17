import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"
import { getMenuVariables } from "@/data/menuvariables/menuvariables.server"
import { json } from "@remix-run/node"
import { Label } from "@/components/ui/Label/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"
import { useState } from "react"
import { UnitsRow, UnitsState } from "@/components/Settings/types"

export default function UnitsSettings() {
  const unitOptions = ["N/A", "thousands", "millions", "billions", "trillions"]
  const decimalOptions = ["0", "1", "2", "3", "4", "5"]

  const unitsRows: UnitsRow[] = [
    {
      id: "percentage",
      label: "Percentage (e.g. market share)",
      defaultUnits: "N/A",
      defaultDecimals: "1",
    },
    {
      id: "other",
      label: "Other measures",
      defaultUnits: "billions",
      defaultDecimals: "1",
    },
  ]

  const [unitsState, setUnitsState] = useState<UnitsState>(() => {
    return unitsRows.reduce((acc, row) => {
      acc[row.id] = {
        units: row.defaultUnits,
        decimals: row.defaultDecimals,
      }
      return acc
    }, {} as UnitsState)
  })

  const handleUnitsChange = (id: string, units: string) => {
    setUnitsState((prev) => ({
      ...prev,
      [id]: { ...prev[id], units },
    }))
    console.log(`${id} units changed to:`, units)
  }

  const handleDecimalsChange = (id: string, decimals: string) => {
    setUnitsState((prev) => ({
      ...prev,
      [id]: { ...prev[id], decimals },
    }))
    console.log(`${id} decimal places changed to:`, decimals)
  }

  return (
    <div className="flex flex-col gap-[30px] dark:text-white">
      <h2 className="text-2xl font-bold">Units</h2>

      <div className="flex flex-col">
        <div className="grid grid-cols-8 gap-5 items-center">
          <div className="col-span-2" />
          <Label className="font-medium text-sm col-span-3">Units</Label>
          <Label className="font-medium text-sm col-span-3">
            Decimal places
          </Label>
        </div>

        <div className="space-y-5 mt-3">
          {unitsRows.map((row) => (
            <div key={row.id} className="grid grid-cols-8 gap-5 items-center">
              <Label className="text-sm col-span-2">{row.label}</Label>

              <Select
                value={unitsState[row.id]?.units || row.defaultUnits}
                onValueChange={(value) => handleUnitsChange(row.id, value)}
              >
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-sm bg-third border text-popover-foreground shadow-md dark:bg-secondary-dark">
                  {unitOptions.map((option) => (
                    <SelectItem
                      className="hover:bg-primary hover:text-white transition rounded-sm dark:text-white"
                      key={option}
                      value={option}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={unitsState[row.id]?.decimals || row.defaultDecimals}
                onValueChange={(value) => handleDecimalsChange(row.id, value)}
              >
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-sm bg-third border text-popover-foreground shadow-md dark:bg-secondary-dark">
                  {decimalOptions.map((option) => (
                    <SelectItem
                      className="hover:bg-primary hover:text-white transition rounded-sm dark:text-white"
                      key={option}
                      value={option}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export async function loader() {
  const envVar = await getMenuVariables()
  return json({ envVar })
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
