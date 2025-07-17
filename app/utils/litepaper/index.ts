import {
  AggregationSection,
  SectionObj,
  SubsectionsSection,
  ValidationError,
} from "@/components/LitePaper/types"

export const hasChatSISubtype = (sections: SectionObj[]): boolean => {
  return sections.some(
    (section) =>
      section.subtype === "Chat SI" ||
      (section.subsections?.some(
        (subsection) => subsection.subtype === "Chat SI"
      ) ??
        false)
  )
}

export function validateSection(section: SectionObj, subs = false): string[] {
  const errors: string[] = []
  const level = subs ? "Subsection" : "section"

  if (!section.title || section.title.trim() === "") {
    errors.push(
      `${level} ${section.layout_metadata.displayId} is missing a title.`
    )
  }

  if (!section.type || section.type.trim() === "") {
    errors.push(
      `${level} ${section.layout_metadata.displayId} is missing a type.`
    )
  }

  // === Check based on the section type ===
  switch (section.type) {
    case "Custom Text":
      if (!section.prompt || section.prompt.trim() === "") {
        errors.push(
          `${level} ${section.layout_metadata.displayId} is missing a prompt.`
        )
      }
      break

    case "Documents":
      if (!section.subtype || section.subtype.trim() === "") {
        errors.push(
          `${level} ${section.layout_metadata.displayId} is missing a subtype.`
        )
      } else if (!section.prompt || section.prompt.trim() === "") {
        errors.push(
          `${level} ${section.layout_metadata.displayId} is missing a prompt.`
        )
      }
      break

    case "Data":
      if (!section.subtype || section.subtype.trim() === "") {
        errors.push(
          `${level} ${section.layout_metadata.displayId} is missing a subtype.`
        )
      } else if (!section.prompt || section.prompt.trim() === "") {
        errors.push(
          `${level} ${section.layout_metadata.displayId} is missing a prompt.`
        )
      }
      break

    // For these types we assume the section should have a title and a prompt.
    case "APIs":
      if (!section.subtype || section.subtype.trim() === "") {
        errors.push(
          `${level} ${section.layout_metadata.displayId} is missing a subtype.`
        )
      } else if (!section.prompt || section.prompt.trim() === "") {
        errors.push(
          `${level} ${section.layout_metadata.displayId} is missing a prompt.`
        )
      }
      break

    case "Aggregation":
      const aggregationSection = section as AggregationSection
      if (
        !aggregationSection.topics ||
        aggregationSection.topics.length === 0
      ) {
        errors.push("topics are missing or empty")
      } else {
        // Validate each aggregation topic
        aggregationSection.topics.forEach((topic, index) => {
          if (!topic.title || topic.title.trim() === "") {
            errors.push(`topic ${index + 1} title is missing`)
          }
          if (!topic.prompt || topic.prompt.trim() === "") {
            errors.push(`topic ${index + 1} prompt is missing`)
          }
          if (topic.meta_analysis) {
            if (
              !topic.meta_analysis.title ||
              topic.meta_analysis.title.trim() === ""
            ) {
              errors.push(
                `meta_analysis title in topic ${index + 1} is missing`
              )
            }
            if (
              !topic.meta_analysis.prompt ||
              topic.meta_analysis.prompt.trim() === ""
            ) {
              errors.push(
                `meta_analysis prompt in topic ${index + 1} is missing`
              )
            }
          }
        })
      }
      if (aggregationSection.meta_analysis) {
        if (
          !aggregationSection.meta_analysis.title ||
          aggregationSection.meta_analysis.title.trim() === ""
        ) {
          errors.push("Aggregation meta_analysis title is missing")
        }
        if (
          !aggregationSection.meta_analysis.prompt ||
          aggregationSection.meta_analysis.prompt.trim() === ""
        ) {
          errors.push("Aggregation meta_analysis prompt is missing")
        }
      }
      break

    case "Subsections":
      if (!section.prompt || section.prompt.trim() === "") {
        ;`${level} ${section.layout_metadata.displayId} is missing a prompt.`
      }
      const subsectionsSection = section as SubsectionsSection
      if (
        !subsectionsSection.subsections ||
        subsectionsSection.subsections.length === 0
      ) {
        errors.push(
          `Subsections are missing or empty on Section ${section.layout_metadata.displayId}.`
        )
      } else {
        // Recursively validate each subsection and report its issues
        subsectionsSection.subsections.forEach((subSection, index) => {
          const subErrors = validateSection(subSection, true)
          if (subErrors.length > 0) {
            subErrors.forEach((errMsg, index) => {
              errors.push(`${errMsg}`)
            })
          }
        })
      }
      break

    default:
      // If section.type is undefined or not one of the handled cases,
      // you could either add an error or treat it as a base section.
      break
  }

  return errors
}

// This function validates an array of sections.
// It returns an array with a ValidationError object for every section that has one or more errors.
export function validateSections(sections: SectionObj[]): ValidationError[] {
  const validationErrors: ValidationError[] = []
  sections.forEach((section) => {
    const errors = validateSection(section)
    if (errors.length > 0) {
      validationErrors.push({
        uuid: section.uuid,
        displayId: section.layout_metadata.displayId,
        errors,
      })
    }
  })
  return validationErrors
}

export function buildErrorDescription(errors: ValidationError[]): string {
  // If no errors, return an empty string (or some default text).
  if (!errors || errors.length === 0) {
    return ""
  }

  let description = ""

  errors.forEach((errorObj, index) => {
    description += `Section ${errorObj.displayId}\n`
    errorObj.errors.forEach((errMsg) => {
      description += `  - ${errMsg}\n`
    })
    description += "\n"
  })

  description += "Please correct the above fields before proceding."

  return description
}
