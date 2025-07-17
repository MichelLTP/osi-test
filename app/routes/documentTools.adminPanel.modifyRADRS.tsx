import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

export default function ModifyRADRS() {
  return <>Modify RADRS</>
}

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
