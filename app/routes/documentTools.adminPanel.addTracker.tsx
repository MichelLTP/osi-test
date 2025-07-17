import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

export default function AddTRACKER() {
  return <>Add TRACKER</>
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
