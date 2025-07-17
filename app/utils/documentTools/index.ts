import { FileTypes } from "@/components/Shared/DocumentSelection/type"
import { Document } from "@/components/LitePaper/types"

export function handleFileType(
  openSiFiles: Document[],
  privateFiles: Document[]
): FileTypes {
  const hasOpenSiFiles = openSiFiles.length > 0
  const hasPrivateFiles = privateFiles.length > 0

  if (hasOpenSiFiles && hasPrivateFiles) return "both"
  if (hasOpenSiFiles) return "openSi"
  if (hasPrivateFiles) return "private"
  return "none"
}
