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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/RadioGroup/RadioGroup"

export default function GeneralSettings() {
  const documents = ["Neutral", "Verbose", "Concise"]

  const dataOutputPreferences = [
    "Tables as outputs",
    "Charts as outputs",
    "Combination of tables and charts",
  ]

  const handleDocumentChange = (value: string) => {
    // TODO: Handle the selected document
    console.log("Document changed to:", value)
  }

  const handleDataChange = (value: string) => {
    // TODO: Handle the selected data
    console.log("Data changed to:", value)
  }

  return (
    <div className="flex flex-col gap-[30px] dark:text-white">
      <h2 className="text-2xlbold">General</h2>

      <div className="flex flex-col gap-5">
        <Label className="border-b border-secondary/20 dark:border-secondary-dark pb-3">
          Output Language
        </Label>
        <Select onValueChange={() => {}}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="English" />
          </SelectTrigger>
          <SelectContent className="rounded-sm bg-third border text-popover-foreground shadow-md dark:bg-secondary-dark">
            {["English", "Spanish", "French", "German", "Italian"].map(
              (lang, index) => (
                <SelectItem
                  className="hover:bg-primary hover:text-white transition rounded-sm dark:text-white"
                  key={index}
                  value={lang.toLowerCase()}
                >
                  {lang}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        <Label className="border-b border-secondary/20 dark:border-secondary-dark pb-3">
          Output Writing Style
        </Label>
        <div className="mt-5 space-y-4">
          <h3>Documents</h3>
          <RadioGroup
            className="flex grow gap-6"
            onValueChange={handleDocumentChange}
          >
            {documents.map((doc, index) => (
              <div className="flex items-center space-x-3" key={index}>
                <RadioGroupItem
                  className="border-gray-200 bg-third dark:border-gray-500"
                  value={doc}
                  id={doc}
                />
                <Label className="!leading-normal font-normal" htmlFor={doc}>
                  {doc}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="mt-8 space-y-4">
          <h3>Data output preference</h3>
          <RadioGroup
            className="flex grow gap-6"
            onValueChange={handleDataChange}
          >
            {dataOutputPreferences.map((data, index) => (
              <div className="flex items-center space-x-3" key={index}>
                <RadioGroupItem
                  className="border-gray-200 bg-third dark:border-gray-500"
                  value={data}
                  id={data}
                />
                <Label className="!leading-normal font-normal" htmlFor={data}>
                  {data}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
