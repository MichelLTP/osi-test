export function doesPathInclude(values: string[], pathname: string): boolean {
  return values.some((value) => pathname.includes(value))
}

export function doesPathIncludeAll(
  values: string[],
  pathname: string
): boolean {
  return values.every((value) => pathname.includes(value))
}

export function getLastPathSegment(url: string): string {
  const parts = url.split("/").filter(Boolean) // Split by '/' and remove empty parts
  const lastSegment = parts[parts.length - 1]?.toLowerCase() // Get the last part and convert to lowercase

  if (lastSegment === "response" && parts.length > 1) {
    return parts[parts.length - 2].toLowerCase() // Return the second-to-last part if "response"
  }

  return lastSegment || "" // Return the last segment or an empty string if no segments exist
}

export function getFirstPathSegment(url: string): string {
  const parts = url.split("/").filter(Boolean) // Split by '/' and remove empty parts
  return parts[0]?.toLowerCase() || "" // Return the first segment or an empty string if none exist
}

export function extractFilenameFromDisposition(disposition: string) {
  const match = disposition.match(/filename="?([^"]+)"?/)
  return match ? match[1] : "unknown.ext" // Handle missing filename
}

export function getPaginatedItems<T>(
  items: T[],
  itemsPerPage: number,
  currentPage: number
): T[] {
  if (items.length === 0) return []

  const start = currentPage * itemsPerPage
  const end = start + itemsPerPage
  return items.slice(start, end)
}

export function getPaginationFooter(
  totalPages: number,
  currentPage: number
): number[] {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }
  let startPage = 0
  if (currentPage >= totalPages - 2) {
    startPage = totalPages - 3
  } else {
    startPage = Math.max(0, currentPage - 1)
  }
  return [startPage, startPage + 1, startPage + 2]
}
