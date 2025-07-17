// utils/useIsIphone.js

import { useState, useEffect } from "react"

const useIsIphone = () => {
  const [isIphone, setIsIphone] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isIphone = /iphone/.test(userAgent)
      const isMobileViewport = window.innerWidth <= 640
      setIsIphone(isIphone && isMobileViewport)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return isIphone
}

export default useIsIphone
