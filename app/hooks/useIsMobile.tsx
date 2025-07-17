import { useState, useEffect } from "react"

// FIX: Refactor this hook to return the "small", "medium", and "large" breakpoints
// - small: < 640px
// - medium: >= 640px and < 768px
// - large: >= 768px

const useIsMobile = (breakpoint = 768.0) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [breakpoint])

  return isMobile
}

export default useIsMobile
