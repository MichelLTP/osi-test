import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

export default function ModifyTracker() {
  return <>Modify Tracker</>
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
