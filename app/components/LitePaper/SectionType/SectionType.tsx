import { Input } from "@/components/ui/Input/Input"
import {
  SectionObj,
  SectionSubtypes,
  SectionTypes,
  SectionAPISubtypes,
  SectionDataSubtypes,
  SectionDocSubtypes,
} from "@/components/LitePaper/types"
import { clsx } from "clsx"
import { motion } from "framer-motion"
import SectionInput from "@/components/LitePaper/SectionInputs/SectionInput"
import TypeDropdown from "@/components/LitePaper/SectionType/TypeDropdown/TypeDropdown"
import { SectionTypeProps } from "@/components/LitePaper/SectionType/types"
import SectionActions from "@/components/LitePaper/SectionActions/SectionActions"
import { useCloseSidebar } from "@/store/layout"
import { useLitePaper } from "@/store/litepaper"
import { v4 as uuidv4 } from "uuid"

export const SECTION_TYPES: SectionTypes[] = [
  "Documents",
  "Data",
  "APIs",
  "Custom Text",
  "Subsections",
]

type SectionType = "Data" | "APIs" | "Documents"

export const sectionDocSubtypes: SectionDocSubtypes[] = ["Chat SI"]
export const sectionDataSubtypes: SectionDataSubtypes[] = [
  "OMM",
  "RADRS",
  "Incidence",
  "Tracker",
]
export const sectionAPISubtypes: SectionAPISubtypes[] = [
  "ChatGPT",
  "Web Search",
  "Wikipedia",
]

export function getSubtypes(type: SectionType): SectionSubtypes[] {
  switch (type) {
    case "Data":
      return sectionDataSubtypes
    case "APIs":
      return sectionAPISubtypes
    case "Documents":
      return sectionDocSubtypes
    default:
      return []
  }
}

const SectionType = ({
  section,
  isSubsection = false,
  changeType = () => {},
  setExpandedSections,
  expandedSections,
  inputsUuid = "",
}: SectionTypeProps) => {
  const litePaper = useLitePaper()

  const createInitialSubSection = (): SectionObj[] => [
    {
      uuid: uuidv4(),
      layout_metadata: {
        displayId: 1,
        displayMode: "Single block",
      },
    },
  ]

  const isSidebarClosed = useCloseSidebar((state) => state.close)
  const { uuid, title, type, subtype, layout_metadata } = section
  const selectedType = type || ""
  const selectedSubtype = subtype || ""
  const hasSubtype = ["Documents", "APIs", "Data"].includes(
    type as SectionTypes
  )

  const directInput = ["Data", "APIs", "Custom Text"].includes(
    type as SectionTypes
  )

  const filteredSectionTypes = isSubsection
    ? SECTION_TYPES.filter((sectionType) => sectionType !== "Subsections")
    : SECTION_TYPES

  return (
    <>
      <section className="bg-white dark:bg-secondary-dark px-6 py-8 rounded-sm my-4 dark:text-white">
        <div
          className={clsx(
            "grid w-full gap-x-4 lg:gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2",
            hasSubtype &&
              (isSidebarClosed
                ? "lg:grid-cols-3"
                : "lg:grid-cols-2 xl:grid-cols-3")
          )}
        >
          <motion.fieldset layout="position">
            <label
              className={"text-base"}
              htmlFor={`section-${layout_metadata.displayId}-title`}
            >
              Section Title
            </label>
            <Input
              id={`section-${layout_metadata.displayId}-title`}
              value={title ?? ""}
              placeholder="New Section"
              name={`section-${layout_metadata.displayId}-title`}
              onChange={(e) =>
                isSubsection
                  ? litePaper.updateSectionOrSubsectionField(
                      uuid,
                      { title: e.target.value },
                      inputsUuid
                    )
                  : litePaper.updateSectionOrSubsectionField(uuid, {
                      title: e.target.value,
                    })
              }
              className="bg-third dark:bg-opacity-5 dark:text-white rounded-xs input-focus mt-2"
              type="text"
            />
          </motion.fieldset>

          <motion.fieldset layout="position">
            <TypeDropdown
              value={selectedType as SectionTypes}
              onChange={
                (value: SectionTypes) =>
                  isSubsection
                    ? litePaper.updateSectionOrSubsectionField(
                        uuid,
                        { type: value },
                        inputsUuid,
                        undefined,
                        true
                      ) //subsection
                    : litePaper.updateSectionOrSubsectionField(
                        uuid,
                        value === "Subsections"
                          ? {
                              type: value,
                              subsections: createInitialSubSection(),
                            }
                          : { type: value },
                        undefined,
                        undefined,
                        true
                      ) //section
              }
              options={filteredSectionTypes}
              placeholder={"Section Type"}
              id={`section-${layout_metadata.displayId}-type`}
              label={"Section Type"}
              classname="text-base"
            />
          </motion.fieldset>

          {hasSubtype && (
            <motion.fieldset
              layout="position"
              initial={{ x: 100, transformOrigin: "right", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 40,
                duration: 0.1,
              }}
              className={clsx(
                "col-span-1 sm:col-span-2",
                isSidebarClosed
                  ? "lg:col-span-1"
                  : "lg:col-span-2 xl:col-span-1"
              )}
            >
              <TypeDropdown
                value={selectedSubtype as SectionSubtypes}
                onChange={(value: SectionSubtypes) => {
                  isSubsection
                    ? litePaper.updateSectionOrSubsectionField(
                        uuid,
                        { subtype: value, type: section.type },
                        inputsUuid,
                        undefined,
                        true
                      )
                    : litePaper.updateSectionOrSubsectionField(
                        uuid,
                        { subtype: value, type: section.type },
                        undefined,
                        undefined,
                        true
                      )
                }}
                options={getSubtypes(type as SectionType)}
                placeholder={"Subtype"}
                id={`section-${layout_metadata.displayId}-subtype-${subtype}`}
                label={"Subtype"}
              />
            </motion.fieldset>
          )}
          {(hasSubtype || directInput) && (
            <SectionInput
              section={section}
              type={type as SectionTypes}
              subtype={subtype as SectionSubtypes}
              setExpandedSections={setExpandedSections}
              expandedSections={expandedSections}
              inputsUuid={inputsUuid}
            />
          )}
        </div>
      </section>
      {isSubsection && (
        <SectionActions
          isSubsection={true}
          sectionUuid={uuid}
          inputsUuid={inputsUuid}
        />
      )}
      {section.type === "Subsections" && (
        <SectionInput
          section={section}
          type={type as SectionTypes}
          setExpandedSections={setExpandedSections}
          expandedSections={expandedSections}
          inputsUuid={inputsUuid}
        />
      )}
    </>
  )
}

export default SectionType
