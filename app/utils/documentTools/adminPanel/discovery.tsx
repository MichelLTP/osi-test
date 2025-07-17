import { Tags } from "@/components/DocTools/AdminPanel/Tabs/Details/types"

export function convertToOptions(
  inputArray: { tag: string; id: string }[]
): Tags[] {
  return inputArray.map((item) => ({
    label: item.tag,
    value: item.id,
  }))
}

export function convertToOptions_Modify(
  inputArray: { title: string; id: string }[]
): Tags[] {
  return inputArray.map((item) => ({
    label: item.title,
    value: item.id,
  }))
}

export function convertFromOptions(
  options: { label: string; value: string }[]
): { id: string; tag: string }[] {
  return options.map((option) => ({
    tag: option.label,
    id: option.value,
  }))
}

/**
 * Finds a matching image from an array of uploaded files and returns its URL
 * @param uploadedImages Array of uploaded File objects
 * @param searchImageName Name of the image to search for
 * @returns URL string for the matching image or null if not found
 */
export const findMatchingImage = (
  uploadedImages: File[],
  searchImageName: string
): string | null => {
  const position = uploadedImages.findIndex(
    (file) => file.name === searchImageName
  )

  if (position !== -1) {
    return URL.createObjectURL(uploadedImages[position])
  }

  return null
}
