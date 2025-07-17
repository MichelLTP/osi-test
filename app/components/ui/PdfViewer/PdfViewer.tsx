import { useCallback, useEffect, useRef, useState } from "react"
import Toolbar from "./Toolbar"

const PdfViewer = ({ pdfUrl }) => {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const containerRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  })
  const [aspectRatio, setAspectRatio] = useState(1) // New state for aspect ratio

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setContainerDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
    }
  }, [])

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return
      try {
        const pdfjsLib = await import("pdfjs-dist")
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString()

        const loadingTask = pdfjsLib.getDocument(pdfUrl)
        const pdf = await loadingTask.promise
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
      } catch (error) {
        console.error("Error loading PDF:", error)
      }
    }

    loadPdf()

    return () => {
      if (pdfDoc) {
        pdfDoc.destroy()
        setPdfDoc(null)
      }
    }
  }, [pdfUrl])

  useEffect(() => {
    updateDimensions()
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [updateDimensions])

  useEffect(() => {
    const renderPage = async () => {
      if (
        !pdfDoc ||
        containerDimensions.width <= 0 ||
        containerDimensions.height <= 0 ||
        isFullScreen
      ) {
        return
      }

      try {
        const page = await pdfDoc.getPage(currentPage)
        const originalViewport = page.getViewport({ scale: 1 })

        // Calculate ratio
        const ratio = originalViewport.width / originalViewport.height
        setAspectRatio(ratio)

        const scaleX = containerDimensions.width / originalViewport.width
        const scaleY = containerDimensions.height / originalViewport.height
        const scale = Math.min(scaleX, scaleY)

        const viewport = page.getViewport({ scale })

        const canvas = document.createElement("canvas")
        canvas.height = viewport.height
        canvas.width = viewport.width
        canvas.style.display = "block"
        canvas.style.margin = "0 auto"

        const context = canvas.getContext("2d")

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        const renderTask = page.render(renderContext)
        await renderTask.promise

        if (containerRef.current) {
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild)
          }
          containerRef.current.appendChild(canvas)
        }
      } catch (error) {
        console.error("Error rendering page:", error)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage, containerDimensions, isFullScreen])

  const nextPage = () => {
    setCurrentPage((prevNumber) => Math.min(prevNumber + 1, totalPages))
  }

  const previousPage = () => {
    setCurrentPage((prevNumber) => Math.max(prevNumber - 1, 1))
  }
  const iframeRef = useRef(null)

  const printPDF = () => {
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.width = "0px"
    iframe.style.height = "0px"
    iframe.style.border = "none"
    iframe.src = pdfUrl

    iframe.onload = () => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    }

    document.body.appendChild(iframe)
    iframeRef.current = iframe

    return () => {
      if (iframeRef.current) {
        document.body.removeChild(iframeRef.current)
      }
    }
  }
  const renderFullScreenIframe = () => {
    return (
      <div className="fixed top-[50px] left-[50px] right-[50px] bottom-[50px] bg-white z-[9999] flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.3)] rounded-[10px]">
        <div className="flex justify-end p-2.5 dark:text-black">
          <button onClick={toggleFullScreen}>Close</button>
        </div>
        <iframe
          src={pdfUrl}
          className="flex-1 border-none rounded-b-xs"
          title="Full-screen PDF"
        />
      </div>
    )
  }

  return (
    <div
      className={`${pdfDoc && "bg-secondary bg-opacity-10 dark:bg-secondary-dark dark:bg-opacity-35"}`}
    >
      <Toolbar
        pdfUrl={pdfUrl}
        currentPage={currentPage}
        totalPages={totalPages}
        nextPage={nextPage}
        previousPage={previousPage}
        printPdf={printPDF}
        toggleFullScreen={toggleFullScreen}
      />
      {!pdfDoc && (
        <div className="flex justify-center items-center h-[380px] w-full overflow-auto bg-secondary bg-opacity-10 dark:bg-secondary-dark dark:bg-opacity-35">
          Loading...
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          height: containerDimensions.width / aspectRatio, // Dynamically set height based on aspect ratio
        }}
        className="max-w-[360px] m-auto"
      />
      {isFullScreen && renderFullScreenIframe()}
    </div>
  )
}
export default PdfViewer
