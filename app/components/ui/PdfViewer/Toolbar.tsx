import {
  faAngleDown,
  faAngleUp,
  faDownload,
  faExpand,
  faPrint,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ExternalComponents/Tooltip/Tooltip"
import { ToolbarButtonProps, ToolbarProps } from "./types"
import React from "react"
import useIsMobile from "@/hooks/useIsMobile"

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  onClick,
  tooltip,
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        className="text-white text-[20px] lg:text-[14px]"
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} />
      </button>
    </TooltipTrigger>
    <TooltipContent className="bg-white text-secondary">
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
)

const Toolbar: React.FC<ToolbarProps> = ({
  pdfUrl,
  currentPage,
  totalPages,
  nextPage,
  previousPage,
  printPdf,
  toggleFullScreen,
}) => {
  const isMobile = useIsMobile()

  const downloadPdf = () => {
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = "document.pdf"
    link.click()
  }

  const buttons: ToolbarButtonProps[] = [
    { icon: faExpand, onClick: toggleFullScreen, tooltip: "Full Screen" },
    { icon: faAngleUp, onClick: previousPage, tooltip: "Page Up" },
    { icon: faAngleDown, onClick: nextPage, tooltip: "Page Down" },
    { icon: faPrint, onClick: printPdf, tooltip: "Print" },
    { icon: faDownload, onClick: downloadPdf, tooltip: "Download" },
  ]

  return (
    <TooltipProvider>
      <div className="flex justify-evenly sm:gap-10 lg:gap-4 bg-secondary text-white p-2 sm:justify-center lg:justify-evenly items-center">
        {buttons.map((button, index) => (
          <React.Fragment key={index}>
            {isMobile && index === 0 ? null : <ToolbarButton {...button} />}
            {index === 2 && (
              <div className="flex gap-1 w-20 justify-center bg-white rounded px-2">
                <span className="text-secondary">{currentPage}</span>
                <span className="text-secondary">of</span>
                <span className="text-secondary">{totalPages}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default Toolbar
