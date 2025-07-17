import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

const Omm = () => {
  return (
    <>
      <iframe
        src="https://www.cdc.gov/tobacco"
        title="cdc"
        className="w-full h-full hidden md:flex !border-none"
      ></iframe>
      <iframe
        src="https://www.cdc.gov/tobacco"
        title="cdc"
        className="w-full h-full flex md:hidden focus-visible:outline-none"
      ></iframe>
    </>
  )
}

export default Omm

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
