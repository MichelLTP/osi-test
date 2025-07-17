import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

const Tracker = () => {
  return (
    <>
      <iframe
        src="https://www.youtube.com/embed/spfTeeEWj0Q?si=woIlyYlWWMAsYOvD"
        title="yt"
        className="w-full h-full hidden md:flex !border-none"
      ></iframe>
      <iframe
        src="https://www.youtube.com/embed/spfTeeEWj0Q?si=woIlyYlWWMAsYOvD"
        title="yt"
        className="w-full h-full flex md:hidden focus-visible:outline-none"
      ></iframe>
    </>
  )
}

export default Tracker

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
