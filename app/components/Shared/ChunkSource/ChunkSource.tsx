import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClose } from "@fortawesome/free-solid-svg-icons"
import { Dialog, DialogTitle } from "@radix-ui/react-dialog"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
} from "@/components/ui/Dialog/Dialog"
import { Label } from "@/components/ui/Label/Label"
import { useSource } from "@/store/sources"
import SourceImage from "./SourceImage"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function ChunkSource() {
  const {
    sourceState,
    resetSourceState,
    isSourceModalOpen,
    setIsSourceModalOpen,
    isSourceImageFullScreen,
  } = useSource()
  const handleCloseSource = () => {
    document.body.style.overflowY = "auto"
    resetSourceState()
    setIsSourceModalOpen(false)
  }

  if (isSourceImageFullScreen) {
    return <SourceImage fullscreen />
  }

  return (
    <Dialog
      open={!isSourceModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseSource()
        }
      }}
    >
      <DialogContent className="border-primary shadow-lg rounded-lg max-w-[90vw] md:w-full sm:max-w-[556px] py-8 pl-8">
        <DialogTitle className="text-basebold mr-8">
          {sourceState.title || "Not Available"}
        </DialogTitle>
        <DialogClose
          className="absolute top-5 right-5 flex justify-center items-center cursor-pointer"
          onClick={() => {
            handleCloseSource()
          }}
        >
          <FontAwesomeIcon
            icon={faClose}
            className="text-primary !text-[15px] hover:text-secondary dark:hover:text-white transition-all duration-300"
            size="xl"
          />
        </DialogClose>
        <VisuallyHidden asChild>
          <DialogDescription>source-description</DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col gap-1 max-h-[650px] text-sm overflow-y-auto pr-2 styled-scrollbar">
          {sourceState.images?.length > 0 && <SourceImage />}
          <p>
            <Label className="font-bold">Author: </Label>
            {sourceState.author || "Not Available"}
          </p>
          <p>
            <Label className="font-bold">Date: </Label>
            {sourceState.date || "Not Available"}
          </p>
          <p>
            <Label className="font-bold">Pages: </Label>
            {sourceState.pages || "Not Available"}
          </p>
          {/* <p>
            <Label className="font-bold">Section: </Label>
            {sourceState.section || "Not Available"}
          </p>
          <p>
            <Label className="font-bold">Subsection: </Label>
            {sourceState.subsection || "Not Available"}
          </p>
          <p>
            <Label className="font-bold">Subsubsection: </Label>
            {sourceState.subsubsection || "Not Available"}
          </p>
            {source.subsubsection || "Not Available"}
          </p> */}
          <p>
            <Label className="font-bold">Content: </Label>
            {sourceState.content || "Not Available"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
