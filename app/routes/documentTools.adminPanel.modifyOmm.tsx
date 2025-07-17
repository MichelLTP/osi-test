import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

export default function ModifyOmm() {
  return <>Modify OMM</>
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
