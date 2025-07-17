import { useEffect } from "react"
import { Input } from "@/components/ui/Input/Input"
import TextArea from "@/components/ui/TextArea/TextArea"
import { Button } from "@/components/ui/Button/Button"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { Label } from "@/components/ui/Label/Label"
import { Section } from "../SectionComponent/types"
import { Source } from "../SelectedSource/types"
import { Subsection } from "./types"
import { useSources } from "@/store/openstory"

const SubsectionComponent = ({
  section,
  source,
  subsection,
}: {
  section: Section
  source: Source
  subsection: Subsection
}) => {
  const {
    sources,
    setSources,
    addSubsection,
    removeSubsection,
    addUserTitleToSubSection,
    addUserPromptToSubsection,
  } = useSources()

  useEffect(() => {
    const updatedSources = sources.map((src) => {
      if (src.id === source.id) {
        const updatedSections = src.sections.map((sec) => {
          if (sec.id === section.id) {
            const updatedSubsections = sec.subsections.map((sub, index) => ({
              ...sub,
              title: `Subsection ${index + 1}`, // Update subsection titles
            }))
            return {
              ...sec,
              subsections: updatedSubsections,
            }
          }
          return sec
        })

        return {
          ...src,
          sections: updatedSections,
        }
      }
      return src
    })

    // Check if the updatedSources are different from the current sources
    const sourcesChanged = updatedSources.some((src, index) => {
      const originalSections = sources[index].sections

      return src.sections.some((sec, sectionIndex) => {
        const originalSubsections = originalSections[sectionIndex].subsections

        return (
          sec.subsections.length !== originalSubsections.length ||
          sec.subsections.some(
            (sub, subIndex) =>
              sub.id !== originalSubsections[subIndex].id ||
              sub.title !== originalSubsections[subIndex].title
          )
        )
      })
    })

    if (sourcesChanged) {
      setSources(updatedSources)
    }
  }, [sources, section.id, source.id, setSources])

  return (
    <div className="space-y-2">
      <Label>{subsection.title}</Label>
      <div className="grid grid-cols-3 gap-8 flex-grow">
        <Input
          className="bg-white dark:bg-opacity-5 rounded-xs"
          type="text"
          placeholder={subsection.title}
          value={subsection.userTitle ? subsection.userTitle : ""}
          onChange={(e) =>
            addUserTitleToSubSection(
              source.id,
              section.id,
              subsection.id,
              e.target.value
            )
          }
        />
        <TextArea
          rows="2"
          className="bg-white dark:bg-opacity-5 dark:text-white rounded-xs dark:text-secondary col-span-2"
          placeholder="What would you like to know?"
          value={subsection.prompt ? subsection.prompt : ""}
          onChange={(e) =>
            addUserPromptToSubsection(
              source.id,
              section.id,
              subsection.id,
              e.target.value
            )
          }
        />
      </div>

      <div className="flex items-center justify-end">
        {subsection === section.subsections[section.subsections.length - 1] && (
          <Button
            className="text-primary dark:text-primary dark:hover:text-primary hover:underline"
            variant="ghost"
            icon={faPlus}
            onClick={() => addSubsection(source.id, section.id)}
          >
            Add subsection
          </Button>
        )}
        {section.subsections.length > 1 && (
          <Button
            className="text-error hover:text-error dark:text-error dark:hover:text-error hover:underline"
            variant="ghost"
            icon={faMinus}
            onClick={() =>
              removeSubsection(source.id, section.id, subsection.id)
            }
          >
            Delete subsection
          </Button>
        )}
      </div>
    </div>
  )
}

export default SubsectionComponent
