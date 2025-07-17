import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Input } from "@/components/ui/Input/Input"
import TextArea from "@/components/ui/TextArea/TextArea"
import { Button } from "@/components/ui/Button/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLayerGroup,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons"

import { Label } from "@/components/ui/Label/Label"
import React, { useEffect } from "react"
import { Section } from "./types"
import { useSources } from "@/store/openstory"
import UploadFileOrLoadFromDB from "@/components/Shared/UploadFileOrLoadFromDB/UploadFileOrLoadFromDB"
import SubsectionComponent from "../SubsectionComponent/SubsectionComponent"
import { Source } from "../SelectedSource/types"

const SectionComponent = ({
  source,
  section,
  isLastSection,
}: {
  source: Source
  section: Section
  isLastSection: boolean
}) => {
  const {
    sources,
    setSources,
    addSection,
    removeSection,
    addUserTitleToSection,
    addUserMetaTitleToSection,
    addUserMetaPromptToSection,
  } = useSources()

  useEffect(() => {
    const updatedSources = sources.map((source) => {
      const updatedSections = source.sections.map((section, index) => ({
        ...section,
        title: `Section ${index + 1}`, // Update section titles
      }))
      return {
        ...source,
        sections: updatedSections,
      }
    })

    // Check if the updatedSources are different from the current sources
    const sourcesChanged = updatedSources.some((source, index) => {
      return (
        source.sections.length !== sources[index].sections.length ||
        source.sections.some(
          (section, sectionIndex) =>
            section.id !== sources[index].sections[sectionIndex].id ||
            section.title !== sources[index].sections[sectionIndex].title
        )
      )
    })

    if (sourcesChanged) {
      setSources(updatedSources)
    }
  }, [sources, setSources])

  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="w-full mt-5"
        defaultValue="3"
      >
        <AccordionItem value={"3"} className="border-none">
          <AccordionTrigger className="text-xlbold">
            <div className="flex gap-10">
              <h3 className="space-x-2">{section.title}</h3>
              <div className="flex gap-2">
                <span className="font-light">subsections</span>
                <span className="text-primary">
                  {section.subsections.length}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <section className="bg-third dark:bg-secondary-dark p-5 rounded-sm">
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-2">
                  <Label>
                    <span>{`Title ${section.title}`}</span>
                  </Label>
                  <Input
                    className="bg-white dark:bg-opacity-5 rounded-xs"
                    type="text"
                    placeholder={
                      section.userTitle ? section.userTitle : section.title
                    }
                    value={section.userTitle ? section.userTitle : ""} // Tie the input value to state
                    onChange={(e) =>
                      addUserTitleToSection(
                        source.id,
                        section.id,
                        e.target.value
                      )
                    }
                  />
                  {source.title === "Documents" && (
                    <UploadFileOrLoadFromDB
                      sourceId={source.id}
                      sectionId={section.id}
                    />
                  )}
                </div>

                <div className="w-full lg:col-span-3 space-y-2">
                  {section.subsections.map((subsection) => (
                    <React.Fragment key={subsection.id}>
                      <SubsectionComponent
                        section={section}
                        source={source}
                        subsection={subsection}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {source.title === "Documents" && (
                <div className="mt-16 space-y-8">
                  <h2 className="flex items-center gap-2 font-bold">
                    <FontAwesomeIcon icon={faLayerGroup} />
                    <span>Meta-analysis</span>
                  </h2>
                  <div className="grid grid-cols-5 gap-8">
                    <div className="col-span-2 space-y-2">
                      <Label className="font-normal">
                        {`${section.title}: meta-analysis title`}
                      </Label>
                      <Input
                        className="bg-white dark:bg-opacity-5 rounded-xs border border-gray-400"
                        type="text"
                        placeholder={`${section.title}: meta-analysis title`}
                        value={
                          section.sectionMetaAnalysis?.title
                            ? section.sectionMetaAnalysis.title
                            : ""
                        } // Tie the input value to state
                        onChange={(e) =>
                          addUserMetaTitleToSection(
                            source.id,
                            section.id,
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="font-normal">
                        {`${section.title}: meta-analysis prompt`}
                      </Label>
                      <TextArea
                        rows="2"
                        className="bg-white dark:bg-opacity-5 dark:text-white rounded-xs dark:text-secondary !border !border-gray-400"
                        placeholder={`${section.title}: meta-analysis prompt`}
                        value={
                          section.sectionMetaAnalysis?.prompt
                            ? section.sectionMetaAnalysis.prompt
                            : ""
                        }
                        onChange={(e) =>
                          addUserMetaPromptToSection(
                            source.id,
                            section.id,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="flex items-center justify-end">
              {source.sections.length > 1 && (
                <Button
                  className="text-error hover:text-error dark:text-error dark:hover:text-error hover:underline"
                  variant="ghost"
                  icon={faMinus}
                  onClick={() => removeSection(source.id, section.id)}
                >
                  Delete section
                </Button>
              )}
              {isLastSection && (
                <Button
                  className="text-primary dark:text-primary dark:hover:text-primary hover:underline"
                  variant="ghost"
                  icon={faPlus}
                  onClick={() => addSection(source.id)}
                >
                  Add section
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default SectionComponent
