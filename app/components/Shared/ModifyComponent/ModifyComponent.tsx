import Approve from "@/components/DocTools/AdminPanel/Tabs/Approve/Approve"
import DocumentPreview from "@/components/DocTools/AdminPanel/Tabs/DocumentPreview/DocumentPreview"
import MetadataInput from "@/components/DocTools/AdminPanel/Tabs/MetadataInput/MetadataInput"
import SummaryPreview from "@/components/DocTools/AdminPanel/Tabs/SummaryPreview/SummaryPreview"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/NewTabs/tabs"
import TopInsightPreview from "@/components/DocTools/AdminPanel/Tabs/TopInsightPreview/TopInsightPreview"
import { Button } from "@/components/ui/Button/Button"
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons"
import { faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import Nodes from "@/components/DocTools/AdminPanel/Tabs/Nodes/Nodes"

export default function ModifyComponent() {
  const tabs = [
    {
      id: "documentPreview",
      label: "Document Preview",
      children: <DocumentPreview />,
    },
    {
      id: "metadataInput",
      label: "Metadata Input",
      children: <MetadataInput />,
    },
    {
      id: "summaryPreview",
      label: "Summary Preview",
      children: <SummaryPreview />,
    },
    {
      id: "topInsightsPreview",
      label: "Top Insights Preview",
      children: <TopInsightPreview />,
    },
    {
      id: "nodes",
      label: "Nodes",
      children: <Nodes />,
    },
    {
      id: "approve",
      label: "Approve",
      children: <Approve />,
    },
  ]

  const [currentTabIndex, setCurrentTabIndex] = useState(tabs[0].id)
  const handleTabChange = (tabId: string) => {
    setCurrentTabIndex(tabId)
  }
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end my-5">
        <div className="flex flex-col gap-1 max-w-full">
          <label htmlFor="occupation">Document id</label>
          <input
            className="flex items-center bg-third h-[40px] pl-5 rounded-xs dark:bg-secondary-dark dark:text-white outline-none text-secondary"
            type="number"
            name="documentId"
            id="documentId"
            placeholder="0"
          />
        </div>
        <div className="flex gap-5 grow flex-wrap md:flex-nowrap">
          <Button className="mt-5 px-6" icon={faPaperPlane} type="submit">
            Process
          </Button>
          <Button
            className="mt-5 px-6 bg-error"
            icon={faTrashCan}
            type="button"
          >
            Delete document
          </Button>
        </div>
      </div>
      <div>
        <Tabs
          value={String(currentTabIndex)}
          onValueChange={(value) => handleTabChange(value)}
        >
          <TabsList
            currentValue={currentTabIndex}
            onValueChange={(value) => handleTabChange(value)}
          >
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
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
    </>
  )
}
