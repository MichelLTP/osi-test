import { Button } from "@/components/ui/Button/Button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover/Popover"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ConfirmationProps } from "@/components/Shared/ConfirmationPopover/types"
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons"
import { PopoverArrow } from "@radix-ui/react-popover"

export default function ConfirmationPopover({
  onConfirm,
  onCancel,
  confirmationHeader,
  confirmationMessage,
  direction,
  align,
  children,
  buttonAction = "Apply",
}: ConfirmationProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={direction && direction}
        align={align && align}
        className="popover-content-width-full min-w-60 p-3 shadow-sm bg-third dark:bg-secondary-dark !rounded-xs"
      >
        <PopoverArrow className={"fill-border w-4 h-2"} />
        <section className="flex items-start gap-3">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className={"text-error mt-1"}
          />
          <div className="flex flex-1 flex-col">
            <h3 className="text-sm">{confirmationHeader}</h3>
            <p className="text-sm opacity-60">{confirmationMessage}</p>

            <footer className="flex justify-end gap-2">
              <Button
                variant="underline"
                className={" !font-normal text-sm"}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleConfirm()}
                size={"sm"}
                className={"text-error !font-normal text-sm"}
                variant={"underline"}
              >
                {buttonAction}
              </Button>
            </footer>
          </div>
        </section>
      </PopoverContent>
    </Popover>
  )
}
