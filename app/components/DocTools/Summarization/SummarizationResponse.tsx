import MetaAnalysis from "@/components/DocTools/Summarization/MetaAnalysis"
import SubsectionSummary from "@/components/DocTools/Summarization/SubsectionSummary"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import TopInsights from "./TopInsights"
import { SummarizationResponseProps } from "@/components/DocTools/Summarization/types"
import { useSummarizationStore } from "@/store/documenttools"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import { useState } from "react"

const SummarizationResponse = ({
  response,
  index,
}: {
  response: SummarizationResponseProps
  index: number
}) => {
  const { isOutputCollapsed, setIsOutputCollapsed } = useSummarizationStore()
  const tabs = [
    {
      label: "Subsection summary",
      children: <SubsectionSummary summarizationResponse={response} />,
      id: "summary",
    },
    {
      label: "Executive Summary",
      children: <MetaAnalysis summarizationResponse={response} />,
      id: "executivesummary",
    },
    {
      label: "Top insights",
      children: <TopInsights summarizationResponse={response} />,
      id: "topinsights",
    },
  ]

  const [currentTabIndex, setCurrentTabIndex] = useState(tabs[0].id)

  const handleTabChange = (index: string) => {
    setCurrentTabIndex(index)
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={`${isOutputCollapsed}`}
      onValueChange={(value) => setIsOutputCollapsed(value)}
    >
      <AccordionItem value={"item-" + index} className="!border-b-0">
        <AccordionTrigger
          showMetadataFilters={false}
          className="text-2xlbold text-left"
        >
          {response?.doc_name}
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col sm:flex-row sm:gap-x-2 md:items-stretch sm:justify-between mb-4 sm:mb-0 h-full">
            <div className="flex flex-col sm:w-2/3 w-full justify-between flex-grow">
              <Tabs
                value={String(currentTabIndex)}
                onValueChange={(value) => handleTabChange(value)}
              >
                <TabsList
                  currentValue={currentTabIndex}
                  onValueChange={(value) => handleTabChange(value)}
                  variant="result"
                >
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} variant="result">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id}>
                    {tab.children}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default SummarizationResponse
