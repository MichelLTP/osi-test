import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

export default function AddOmm() {
  return <>Add OMM</>
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
