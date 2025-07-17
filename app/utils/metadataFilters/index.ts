export function refactorObjectValuesToArrays(
  obj: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (
      key === "earliest_publication_date" ||
      key === "latest_publication_date"
    ) {
      result[key] = value
    } else if (Array.isArray(value)) {
      // Check if the array items are objects with a 'label' property
      if (
        value.length > 0 &&
        typeof value[0] === "object" &&
        "label" in value[0]
      ) {
        result[key] = value.length > 0 ? value.map((item) => item.label) : ""
      } else {
        // If array items are not objects with 'label', assume they are strings
        result[key] = value
      }
    } else {
      result[key] = ""
    }
  })

  return result
}

export function createMetadataSearchFilters_BEStructure(formData: FormData) {
  const singleValueFields = new Set([
    "earliest_publication_date",
    "latest_publication_date",
  ])

  const result: Record<string, string | string[]> = {}

  for (const key of new Set(formData.keys())) {
    if (singleValueFields.has(key)) {
      let value = formData.get(key) as string

      // Special handling for latest_publication_date
      if (key === "latest_publication_date" && value) {
        const date = new Date(value)
        date.setMonth(date.getMonth() + 1)
        date.setDate(1)
        value = date.toISOString()
      }

      result[key] = value
    } else {
      const values = formData
        .getAll(key)
        .filter((value) => value !== "")
        .flatMap((value) => {
          if (typeof value === "string" && value.includes(",")) {
            return value.split(",").map((item) => item.trim())
          }
          return value
        })

      result[key] = values as string[]
    }
  }

  return result
}

export function transformOptions(
  options: string[]
): { value: string; label: string }[] {
  if (options?.length > 0 && options !== undefined) {
    return options?.map((option) => ({ value: option, label: option }))
  } else {
    return []
  }
}
