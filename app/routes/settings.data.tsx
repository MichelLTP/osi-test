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
import Checkbox from "@/components/ui/Checkbox/Checkbox"
import { useState } from "react"
import { IncidenceItem } from "@/components/Settings/types"
import { cn } from "@/utils/shadcn/utils"

export default function DataSettings() {
  const baseOptions = ["RMC", "FCT", "HT", "LC"]
  const frequencyOptions = ["Daily / Weekly", "Weekly", "Monthly", "Yearly"]
  const adcOptions = ["1", "2", "3", "4", "5", "none"]

  const [marketShareSelections, setMarketShareSelections] = useState<string[]>(
    []
  )
  const [incidenceBaseSelections, setIncidenceBaseSelections] = useState<
    string[]
  >([])
  const [adcBaseSelections, setAdcBaseSelections] = useState<string[]>([])

  const [incidenceData, setIncidenceData] = useState<IncidenceItem[]>([
    { id: "RMC", frequency: "Daily / Weekly", adc: "1" },
    { id: "FCT", frequency: "Daily / Weekly", adc: "3" },
    { id: "HT", frequency: "Daily / Weekly", adc: "none" },
    { id: "EV", frequency: "Daily / Weekly", adc: "none" },
    { id: "Oral", frequency: "Daily / Weekly", adc: "none" },
  ])

  const calculateResult = (frequency: string, adc: string): string => {
    if (adc === "none") {
      return frequency
    }

    const adcNum = parseInt(adc)
    if (frequency === "Daily / Weekly") {
      return `${adcNum}+ Daily / ${adcNum * 7}+ Weekly`
    }
    if (frequency === "Weekly") {
      return `${adcNum}+ Weekly`
    }
    if (frequency === "Monthly") {
      return `${adcNum}+ Monthly`
    }
    if (frequency === "Yearly") {
      return `${adcNum}+ Yearly`
    }
    return frequency
  }

  const toggleSelection = (
    selections: string[],
    setSelections: (selections: string[]) => void,
    value: string
  ) => {
    if (selections.includes(value)) {
      setSelections(selections.filter((item) => item !== value))
    } else {
      setSelections([...selections, value])
    }
  }

  const handleMarketShareChange = (item: { value: string }) => {
    toggleSelection(marketShareSelections, setMarketShareSelections, item.value)
  }

  const handleIncidenceBaseChange = (item: { value: string }) => {
    toggleSelection(
      incidenceBaseSelections,
      setIncidenceBaseSelections,
      item.value
    )
  }

  const handleAdcBaseChange = (item: { value: string }) => {
    toggleSelection(adcBaseSelections, setAdcBaseSelections, item.value)
  }

  const handleFrequencyChange = (id: string, frequency: string) => {
    setIncidenceData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, frequency } : item))
    )
  }

  const handleAdcChange = (id: string, adc: string) => {
    setIncidenceData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, adc } : item))
    )
  }

  const createCheckboxItems = (options: string[], selections: string[]) => {
    return options.map((option) => ({
      value: option,
      checked: selections.includes(option),
    }))
  }

  const checkboxGroups = [
    {
      label: "Market share base",
      options: baseOptions,
      selections: marketShareSelections,
      onChange: handleMarketShareChange,
      namePrefix: "market-share",
      marginTop: "mt-[30px]",
    },
    {
      label: "Incidence base",
      options: baseOptions,
      selections: incidenceBaseSelections,
      onChange: handleIncidenceBaseChange,
      namePrefix: "incidence",
      marginTop: "mt-[40px]",
    },
    {
      label: "ADC base",
      options: baseOptions,
      selections: adcBaseSelections,
      marginTop: "mt-[40px]",
      onChange: handleAdcBaseChange,
      namePrefix: "adc",
    },
  ]

  return (
    <div className="flex flex-col dark:text-white">
      <h2 className="text-2xl font-bold">Data</h2>

      {checkboxGroups.map((group) => (
        <div className={cn("flex flex-col", group.marginTop)} key={group.label}>
          <Label className="border-b border-secondary/20 dark:border-secondary-dark pb-3">
            {group.label}
          </Label>
          <div className="mt-5">
            <Checkbox
              items={createCheckboxItems(group.options, group.selections)}
              row={true}
              size="md"
              onClick={group.onChange}
              className="space-x-10"
              namePrefix={group.namePrefix}
            />
          </div>
        </div>
      ))}

      <div className="flex flex-col mt-[40px]">
        <Label className="border-b border-secondary/20 dark:border-secondary-dark pb-3">
          Incidence
        </Label>
        <div className="mt-5">
          <div className="grid grid-cols-10 gap-5 items-center mb-4">
            <div className="font-medium text-sm col-span-1"></div>
            <div className="font-medium text-sm col-span-3">Frequency</div>
            <div className="font-medium text-sm col-span-3">ADC</div>
            <div className="font-medium text-sm col-span-3">Result</div>
          </div>

          <div className="space-y-5">
            {incidenceData.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-10 gap-5 items-center"
              >
                <div className="font-medium text-sm col-span-1">{item.id}</div>

                <Select
                  value={item.frequency}
                  onValueChange={(value) =>
                    handleFrequencyChange(item.id, value)
                  }
                >
                  <SelectTrigger className="w-full col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm bg-third border text-popover-foreground shadow-md dark:bg-secondary-dark">
                    {frequencyOptions.map((option) => (
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
                  value={item.adc}
                  onValueChange={(value) => handleAdcChange(item.id, value)}
                >
                  <SelectTrigger className="w-full col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm bg-third border text-popover-foreground shadow-md dark:bg-secondary-dark">
                    {adcOptions.map((option) => (
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

                <div className="text-sm text-gray-600 dark:text-gray-300 col-span-3">
                  {calculateResult(item.frequency, item.adc)}
                </div>
              </div>
            ))}
          </div>
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
