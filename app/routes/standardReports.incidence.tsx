import { ErrorBoundaryComponent } from "@/components/ui/ErrorBoundaryComponent/ErrorBoundaryComponent"

const Incidence = () => {
  return (
    <>
      <iframe
        src="https://www.youtube.com/embed/5G-QHWsyOF0?si=fnFrlptlM4A5YZFd"
        title="yt"
        className="w-full h-full hidden md:flex !border-none"
      ></iframe>
      <iframe
        src="https://www.youtube.com/embed/5G-QHWsyOF0?si=fnFrlptlM4A5YZFd"
        title="yt"
        className="w-full h-full flex md:hidden focus-visible:outline-none"
      ></iframe>
    </>
  )
}

export default Incidence

export function ErrorBoundary() {
  return <ErrorBoundaryComponent isMainRoute={false} />
}
