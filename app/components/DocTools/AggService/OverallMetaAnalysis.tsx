import { Button } from "@/components/ui/Button/Button"
import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/Label/Label"
import TextArea from "@/components/ui/TextArea/TextArea"
import useAggServiceStore, {
  AggregatorData,
} from "@/store/AggregatorService/aggregatorservice"
import { faLayerGroup, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"

const OverallMetaAnalysis: React.FC = () => {
  const [showGlobalMeta, setShowGlobalMeta] = useState<boolean>(false)
  const { data, setData } = useAggServiceStore()

  // Update the overall meta analysis in the store
  const updateOverallMetaAnalysis = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: "title" | "prompt"
  ): void => {
    // Create a new data object with the updated meta analysis
    const updatedData: AggregatorData = {
      ...(data as AggregatorData),
      meta_analysis: {
        title:
          type === "title" ? e.target.value : data.meta_analysis?.title || "",
        prompt:
          type === "prompt" ? e.target.value : data.meta_analysis?.prompt || "",
      },
    }

    setData(updatedData as AggregatorData)
  }

  const deleteGlobalMeta = (): void => {
    const updatedData: AggregatorData = {
      ...data,
      meta_analysis: null,
    }
    setData(updatedData)
    setShowGlobalMeta(false)
  }

  const addGlobalMeta = (): void => {
    setShowGlobalMeta(true)

    const initialMetaAnalysis = {
      title: "",
      prompt: "",
    }

    const updatedData: AggregatorData = {
      ...(data as AggregatorData),
      meta_analysis: initialMetaAnalysis,
    }

    setData(updatedData as AggregatorData)
  }
  return (
    <>
      {(showGlobalMeta ||
        (data.meta_analysis !== null &&
          Object.keys(data.meta_analysis).length !== 0)) && (
        <div className="bg-third rounded-[10px] dark:bg-secondary-dark p-[15px] mb-6">
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
            <h3 className="text-xlbold">Overall Meta-Analysis</h3>
          </div>

          <div className="space-y-4 flex items-center justify-center w-full gap-6">
            <div className="flex flex-col gap-2 w-1/3">
              <Label className="text-base" htmlFor="overall-meta-title">
                Overall meta-analysis title
              </Label>
              <Input
                className="w-full bg-white focus:outline-none dark:border dark:bg-secondary-dark"
                id="overall-meta-title"
                value={data.meta_analysis?.title || ""}
                onChange={(e) => updateOverallMetaAnalysis(e, "title")}
                placeholder="Enter meta-analysis title"
              />
            </div>

            <div className="flex flex-col gap-2 w-2/3">
              <Label className="text-base" htmlFor="overall-meta-prompt">
                Overall meta-analysis prompt
              </Label>
              <TextArea
                className="w-full bg-white focus:outline-none focus:border-0 border-0 dark:border dark:bg-secondary-dark"
                id="overall-meta-prompt"
                value={data.meta_analysis?.prompt || ""}
                onChange={(e) => updateOverallMetaAnalysis(e, "prompt")}
                placeholder="Enter meta-analysis prompt"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        {data?.meta_analysis === null ? (
          <Button variant="underline" icon={faPlus} onClick={addGlobalMeta}>
            Add Overall Meta-Analysis
          </Button>
        ) : (
          <Button
            variant="underline"
            className="text-error"
            onClick={deleteGlobalMeta}
          >
            - Delete Meta-Analysis
          </Button>
        )}
      </div>
    </>
  )
}

export default OverallMetaAnalysis
