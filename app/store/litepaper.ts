import { create } from "zustand"
import {
  NonSubsectionSectionObj,
  SectionObj,
} from "@/components/LitePaper/types"
import { v4 as uuidv4 } from "uuid"
import {
  FinalResult,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"

const initialLitePaperSection: SectionObj[] = [
  {
    uuid: uuidv4(),
    layout_metadata: {
      displayId: 1,
    },
  },
]

const defaultState = () => ({
  paperName: "",
  description: "",
  subtitle: "",
  authors: "",
  writingStyle: "",
  sections: initialLitePaperSection,
  result: [],
  hasInputs: false,
})

export type LitePaperState = {
  sections: SectionObj[]
  paperName: string
  description: string
  subtitle: string
  authors: string
  writingStyle: string
  result: FinalResult[]
  hasInputs: boolean
  setPaperName: (newStoryName: string) => void
  setDescription: (description: string) => void
  setSubtitle: (subtitle: string) => void
  setAuthors: (authors: string) => void
  setWritingStyle: (writingStyle: string) => void
  setResults: (newResults: FinalResult[]) => void
  setSections: (form: SectionObj[]) => void
  setHasInputs: (flag: boolean) => void
  resetLitePaper: () => void
  resetLitePaperResult: () => void
  addSectionOrSubsection: (parentId?: string) => void
  removeSectionOrSubsection: (uuid: string) => void
  duplicateSectionOrSubsection: (uuid: string, parentUuid?: string) => void
  reorderSectionOrSubsection: (
    newItems: SectionObj[],
    parentUUID?: string
  ) => void
  updateSectionOrSubsectionField: (
    uuid: string,
    updates: Partial<SectionObj>,
    parentId?: string,
    append?: boolean,
    reset?: boolean
  ) => void
  addOutputSectionResponse: (
    uuid: string,
    newResponse: OutputSectionResponse,
    hash_id?: string
  ) => void
  updateOutputSectionResponse: (
    finalResultUuid: string,
    index: number,
    newResponse: OutputSectionResponse
  ) => void
  addResultToSectionPreview: (uuid: string) => void
}

export const useLitePaper = create<LitePaperState>((set) => ({
  ...defaultState(),

  resetLitePaper: () => set(() => ({ ...defaultState() })),

  resetLitePaperResult: () => set(() => ({ result: [] })),

  setPaperName: (newPaperName: string) => set({ paperName: newPaperName }),

  setSubtitle: (subtitle: string) => set({ subtitle: subtitle }),

  setAuthors: (authors: string) => set({ authors: authors }),

  setWritingStyle: (writingStyle: string) =>
    set({ writingStyle: writingStyle }),

  setDescription: (description: string) => set({ description: description }),

  setSections: (form: SectionObj[]) => set({ sections: form }),

  setResults: (newResults: FinalResult[]) => set({ result: newResults }),

  setHasInputs: (flag: boolean) => set({ hasInputs: flag }),

  addSectionOrSubsection: (parentUuid?: string) =>
    set((state) => {
      if (parentUuid) {
        // Adding a subsection
        return {
          sections: state.sections.map((section) => {
            if (section.uuid === parentUuid && section.type === "Subsections") {
              const newSubSection = {
                uuid: uuidv4(),
                layout_metadata: {
                  displayId: (section.subsections?.length ?? 0) + 1,
                  // preview: [],
                  // previewMode: false,
                  displayMode: "Single block",
                },
              }
              return {
                ...section,
                subsections: [...(section.subsections || []), newSubSection],
              }
            }
            return section
          }),
        }
      } else {
        // Adding a top-level section
        const newSection = {
          uuid: uuidv4(),
          layout_metadata: {
            displayId: state.sections.length + 1,
            // preview: [],
            // previewMode: false
          },
        }
        return { sections: [...state.sections, newSection] }
      }
    }),

  removeSectionOrSubsection: (uuid: string) =>
    set((state) => {
      // First, try to find the target as a top-level section
      const targetIndex = state.sections.findIndex(
        (section) => section.uuid === uuid
      )
      if (targetIndex !== -1) {
        const targetSection = state.sections[targetIndex]
        const newTopLevel = state.sections
          .filter((section) => section.uuid !== uuid)
          .map((section) => ({
            ...section,
            layout_metadata: {
              ...section.layout_metadata,
              displayId:
                section.layout_metadata.displayId >
                targetSection.layout_metadata.displayId
                  ? section.layout_metadata.displayId - 1
                  : section.layout_metadata.displayId,
            },
          }))
        return { sections: newTopLevel }
      }

      // If not found at top-level, search within subsections
      let updated = false
      const newSections = state.sections.map((section) => {
        if (section.type === "Subsections" && section.subsections) {
          const subIndex = section.subsections.findIndex(
            (sub) => sub.uuid === uuid
          )
          if (subIndex !== -1) {
            const targetSub = section.subsections[subIndex]
            const newSubsections = section.subsections
              .filter((sub) => sub.uuid !== uuid)
              .map((sub) => ({
                ...sub,
                layout_metadata: {
                  ...sub.layout_metadata,
                  displayId:
                    sub.layout_metadata.displayId >
                    targetSub.layout_metadata.displayId
                      ? sub.layout_metadata.displayId - 1
                      : sub.layout_metadata.displayId,
                },
              }))
            updated = true
            return { ...section, subsections: newSubsections }
          }
        }
        return section
      })

      // If nothing was updated, return state; otherwise, return the new state.
      return updated ? { sections: newSections } : state
    }),

  duplicateSectionOrSubsection: (uuid: string, parentUuid?: string) =>
    set((state) => {
      // Helper: recursively update uuids and displayIds for nested subsections
      const updateSubsectionUuids = (
        subsections: NonSubsectionSectionObj[],
        startingDisplayId = 1
      ): NonSubsectionSectionObj[] => {
        return subsections.map((subsection, index) => {
          const newUuid = uuidv4()
          // If this duplicated item is of type "Subsections", recursively update its subsections.
          return {
            ...subsection,
            uuid: newUuid,
            layout_metadata: {
              ...subsection.layout_metadata,
              displayId: startingDisplayId + index,
            },
            ...(subsection.type === "Subsections" && {
              subsections: subsection.subsections
                ? updateSubsectionUuids(
                    subsection.subsections,
                    startingDisplayId
                  )
                : [],
            }),
          }
        })
      }

      // --- Top-Level Section Duplication ---
      if (!parentUuid) {
        const sectionIndex = state.sections.findIndex(
          (section) => section.uuid === uuid
        )
        if (sectionIndex === -1) {
          console.warn(`Section with UUID ${uuid} not found`)
          return state
        }
        const originalSection = state.sections[sectionIndex]
        const newUuid = uuidv4()

        const duplicatedSection: SectionObj = {
          ...originalSection,
          uuid: newUuid,
          // If the section is of type "Subsections", update its nested subsections
          ...(originalSection.type === "Subsections" && {
            subsections: originalSection.subsections
              ? updateSubsectionUuids(originalSection.subsections)
              : [],
          }),
        }

        // Insert duplicated section immediately after the original
        const updatedSections = [
          ...state.sections.slice(0, sectionIndex + 1),
          duplicatedSection,
          ...state.sections.slice(sectionIndex + 1),
        ]

        // Recalculate displayId for all top-level sections
        const sectionsWithUpdatedDisplayId = updatedSections.map(
          (section, index) => ({
            ...section,
            layout_metadata: {
              ...section.layout_metadata,
              displayId: index + 1,
            },
          })
        )

        return { sections: sectionsWithUpdatedDisplayId }
      }

      // --- Subsection Duplication ---
      else {
        const updatedSections = state.sections.map((section) => {
          // Look for the parent section by UUID and ensure its type is "Subsections"
          if (section.uuid === parentUuid && section.type === "Subsections") {
            if (!section.subsections) {
              console.warn(`Parent section ${parentUuid} has no subsections`)
              return section
            }
            const subsectionIndex = section.subsections.findIndex(
              (sub) => sub.uuid === uuid
            )
            if (subsectionIndex === -1) {
              console.warn(
                `Subsection with UUID ${uuid} not found in parent ${parentUuid}`
              )
              return section
            }

            const originalSubsection = section.subsections[subsectionIndex]
            const newUuid = uuidv4()

            const duplicatedSubsection: NonSubsectionSectionObj = {
              ...originalSubsection,
              uuid: newUuid,
              // Recursively update nested subsections if any (if type "Subsections")
              ...(originalSubsection.type === "Subsections" && {
                subsections: originalSubsection.subsections
                  ? updateSubsectionUuids(originalSubsection.subsections)
                  : [],
              }),
            }

            const updatedSubsections = [
              ...section.subsections.slice(0, subsectionIndex + 1),
              duplicatedSubsection,
              ...section.subsections.slice(subsectionIndex + 1),
            ]

            // Recalculate displayId for the parent's subsections
            const subsectionsWithUpdatedDisplayId = updatedSubsections.map(
              (sub, index) => ({
                ...sub,
                layout_metadata: {
                  ...sub.layout_metadata,
                  displayId: index + 1,
                },
              })
            )

            return {
              ...section,
              subsections: subsectionsWithUpdatedDisplayId,
            }
          }
          return section
        })

        return { sections: updatedSections }
      }
    }),

  reorderSectionOrSubsection: (newItems: SectionObj[], parentUUID?: string) =>
    set((state) => {
      if (parentUUID) {
        // Reorder the subsections for the section with the given parentUUID
        return {
          sections: state.sections.map((section) => {
            if (section.uuid === parentUUID && section.type === "Subsections") {
              // Optionally update displayId for each subsection
              const updatedSubsections = newItems.map((sub, index) => ({
                ...sub,
                layout_metadata: {
                  ...sub.layout_metadata,
                  displayId: index + 1,
                },
              }))
              return { ...section, subsections: updatedSubsections }
            }
            return section
          }),
        }
      } else {
        // Reorder top-level sections; optionally update their displayId
        const updatedSections = newItems.map((section, index) => ({
          ...section,
          layout_metadata: {
            ...section.layout_metadata,
            displayId: index + 1,
          },
        }))
        return { sections: updatedSections }
      }
    }),

  updateSectionOrSubsectionField: (
    uuid: string,
    updates: Partial<SectionObj>,
    parentId?: string,
    append: boolean = false,
    reset: boolean = false
  ) =>
    set((state) => {
      const updateTarget = (target: SectionObj) => {
        if (append) {
          // For each key in the update object,
          // if the target already has an array for that key and the new value is an array,
          // then merge them.
          return Object.keys(updates).reduce(
            (acc, key) => {
              const updateValue = updates[key as keyof SectionObj]
              if (
                Array.isArray(acc[key as keyof SectionObj]) &&
                Array.isArray(updateValue)
              ) {
                return {
                  ...acc,
                  [key]: [
                    ...(acc[key as keyof SectionObj] as any[]),
                    ...updateValue,
                  ],
                }
              }
              return { ...acc, [key]: updateValue }
            },
            { ...target }
          )
        } else if (reset) {
          const { uuid, title, layout_metadata } = target
          return {
            uuid,
            title,
            layout_metadata: {
              displayId: layout_metadata.displayId,
              ...(layout_metadata.preview !== undefined ? { preview: [] } : {}),
              ...(layout_metadata.previewMode !== undefined
                ? { previewMode: false }
                : {}),
              ...(layout_metadata.displayMode !== undefined
                ? { displayMode: layout_metadata.displayMode }
                : {}),
            },
            ...updates,
          }
        } else {
          return { ...target, ...updates }
        }
      }

      if (parentId) {
        // Update a subsection (subsections are directly on the section)
        return {
          sections: state.sections.map((section) => {
            if (
              section.uuid === parentId &&
              section.type === "Subsections" &&
              section.subsections
            ) {
              return {
                ...section,
                subsections: section.subsections.map((sub) =>
                  sub.uuid === uuid ? updateTarget(sub) : sub
                ),
              }
            }
            return section
          }),
        }
      } else {
        // Update a top-level section
        return {
          sections: state.sections.map((section) =>
            section.uuid === uuid ? updateTarget(section) : section
          ),
        }
      }
    }),

  addOutputSectionResponse: (
    finalResultUuid: string,
    newResponse: OutputSectionResponse,
    hash_id?: string
  ) =>
    set((state) => ({
      result: state.result.map((finalResult) => {
        if (finalResult.uuid === finalResultUuid) {
          // Remove any existing responses of type "Status"
          const filteredContent = finalResult.content.filter(
            (item) => item.type !== "Status"
          )
          return {
            ...finalResult,
            content: [...filteredContent, newResponse],
            ...(hash_id ? { hash_id } : {}),
          }
        }
        return finalResult
      }),
    })),

  updateOutputSectionResponse: (
    finalResultUuid: string,
    index: number,
    newResponse: OutputSectionResponse
  ) =>
    set((state) => ({
      result: state.result.map((finalResult) => {
        if (finalResult.uuid === finalResultUuid) {
          const updatedContent = [...finalResult.content]
          if (index >= 0 && index < updatedContent.length) {
            updatedContent[index] = newResponse
          } else {
            console.warn(
              `Index ${index} is out of bounds for finalResult with uuid ${finalResultUuid}.`
            )
          }
          return {
            ...finalResult,
            content: updatedContent,
          }
        }
        return finalResult
      }),
    })),

  addResultToSectionPreview: (uuid: string) => {
    set((state) => {
      const matchingResult = state.result
      if (!matchingResult) {
        console.warn(`No result found with UUID: ${uuid}`)
        return state
      }
      const updatedSections = state.sections.map((section) =>
        section.uuid === uuid
          ? {
              ...section,
              layout_metadata: {
                ...section.layout_metadata,
                preview: matchingResult,
              },
            }
          : section
      )

      return {
        sections: updatedSections,
      }
    })
  },
}))
