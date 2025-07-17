import { Button } from "@/components/ui/Button/Button"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { SectionActionsProps } from "@/components/LitePaper/SectionActions/types"
import { useLitePaper } from "@/store/litepaper"

const SectionActions = ({
  isFirstSection = false,
  isSubsection = false,
  isGeneralActions = false,
  sectionUuid = "",
  className = "",
  inputsUuid = "",
}: SectionActionsProps) => {
  const litePaper = useLitePaper()

  const handleAddSection = () => {
    litePaper.addSectionOrSubsection()
  }

  const handleDuplicateSection = (uuid: string) => {
    litePaper.duplicateSectionOrSubsection(uuid)
  }

  const handleRemoveSection = (uuid: string) => {
    litePaper.removeSectionOrSubsection(uuid)
  }

  const handleAddSubSection = (uuid: string) => {
    litePaper.addSectionOrSubsection(uuid)
  }

  const handleRemoveSubSection = (uuid: string) => {
    litePaper.removeSectionOrSubsection(uuid)
  }

  const handleDuplicateSubsection = (ParentUuid: string, uuid: string) => {
    litePaper.duplicateSectionOrSubsection(uuid, ParentUuid)
  }

  return (
    <section
      className={`flex flex-wrap items-center gap-3 justify-between mt-4 ${className}`}
    >
      {isSubsection && (
        <Button
          className="text-primary dark:text-primary dark:hover:text-primary hover:underline"
          variant="ghost"
          icon={faPlus}
          onClick={() => handleDuplicateSubsection(inputsUuid, sectionUuid)}
        >
          Duplicate Subsection
        </Button>
      )}
      <div>
        {!isGeneralActions && isFirstSection && (
          <Button
            className="text-primary dark:text-primary dark:hover:text-primary hover:underline"
            variant="ghost"
            icon={faPlus}
            onClick={() => handleDuplicateSection(sectionUuid)}
          >
            Duplicate Section
          </Button>
        )}
        <Button
          className="text-primary dark:text-primary dark:hover:text-primary hover:underline"
          variant="ghost"
          icon={faPlus}
          onClick={() =>
            isFirstSection
              ? handleAddSection()
              : isSubsection
                ? handleAddSubSection(inputsUuid)
                : handleDuplicateSection(sectionUuid)
          }
        >
          {isFirstSection
            ? "Add Section"
            : isSubsection
              ? "Add Subsection"
              : "Duplicate Section"}
        </Button>
        {!isFirstSection && (
          <Button
            className="text-error hover:text-error dark:text-error dark:hover:text-error hover:underline"
            variant="ghost"
            icon={faMinus}
            onClick={() =>
              isSubsection
                ? handleRemoveSubSection(sectionUuid)
                : handleRemoveSection(sectionUuid)
            }
          >
            {isSubsection ? "Delete Subsection" : "Delete Section"}
          </Button>
        )}
      </div>
    </section>
  )
}

export default SectionActions
