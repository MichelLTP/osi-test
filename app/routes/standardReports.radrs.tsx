import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

const Radrs = () => {
  return (
    <>
      <iframe
        src="https://pt.m.wikipedia.org/wiki/Japan_Tobacco_International"
        title="wiki"
        className="w-full h-full hidden md:flex !border-none"
      ></iframe>
      <iframe
        src="https://pt.m.wikipedia.org/wiki/Japan_Tobacco_International"
        title="wiki"
        className="w-full h-full flex md:hidden focus-visible:outline-none"
      ></iframe>
    </>
  )
}

export default Radrs

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
