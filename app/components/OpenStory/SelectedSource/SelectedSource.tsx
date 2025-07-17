import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import SectionComponent from "../SectionComponent/SectionComponent"
import React, { useEffect, useRef, useState } from "react"
import { Source } from "./types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons"
import { Label } from "@/components/ui/Label/Label"
import { Input } from "@/components/ui/Input/Input"
import TextArea from "@/components/ui/TextArea/TextArea"
import { useSources } from "@/store/openstory"

export default function SelectedSource({
  source,
  defaultValue,
}: {
  source: Source
  defaultValue: string
}) {
  const { addOverallUserMetaPromptToSource, addOverallUserMetaTitleToSource } =
    useSources()

  const [value, setValue] = useState(defaultValue)
  const isControlledRef = useRef(false)

  useEffect(() => {
    if (!isControlledRef.current) {
      setValue(defaultValue)
    }
    isControlledRef.current = false
  }, [defaultValue])

  const handleValueChange = (newValue: string) => {
    isControlledRef.current = true
    setValue(newValue)
  }

  return (
    <>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={handleValueChange}
      >
        <AccordionItem value={"3"} className="border-none">
          <AccordionTrigger className="text-xlbold border-b border-secondary dark:border-third-dark">
            <div className="flex gap-10">
              <h3 className="space-x-[5px]">{`${source.title} service setup`}</h3>
              <div className="flex gap-2">
                <span className="font-light">sections</span>
                <span className="text-primary">{source.sections.length}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {source.sections.map((section, index) => (
              <React.Fragment key={section.id}>
                <SectionComponent
                  source={source}
                  section={section}
                  isLastSection={index === source.sections.length - 1}
                />
              </React.Fragment>
            ))}
            {source.title === "Documents" && source.sections.length > 1 && (
              <section className="bg-third dark:bg-secondary-dark p-5 rounded-sm">
                <div className="space-y-8">
                  <h2 className="flex items-center gap-2 font-bold">
                    <FontAwesomeIcon icon={faLayerGroup} />
                    <span>Overall meta-analysis</span>
                  </h2>
                  <div className="grid grid-cols-5 gap-8">
                    <div className="col-span-2 space-y-2">
                      <Label className="text-primary font-normal">
                        Overall meta-analysis title
                      </Label>
                      <Input
                        className="bg-white dark:bg-opacity-5 rounded-xs border border-gray-400"
                        type="text"
                        placeholder="Overall meta-analysis title"
                        value={
                          source.overallMetaAnalysis?.title
                            ? source.overallMetaAnalysis.title
                            : ""
                        } // Tie the input value to state
                        onChange={(e) =>
                          addOverallUserMetaTitleToSource(
                            source.id,
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="text-primary font-normal">
                        Overall meta-analysis prompt
                      </Label>
                      <TextArea
                        rows="4"
                        className="bg-white dark:bg-opacity-5 dark:text-white rounded-xs dark:text-secondary col-span-2 !border !border-gray-400"
                        placeholder="Overall meta-analysis prompt"
                        value={
                          source.overallMetaAnalysis?.prompt
                            ? source.overallMetaAnalysis.prompt
                            : ""
                        } // Tie the input value to state
                        onChange={(e) =>
                          addOverallUserMetaPromptToSource(
                            source.id,
                            e.target?.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}
