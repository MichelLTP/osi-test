import { useEffect, useRef, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ExternalComponents/DropdownMenu/dropdown-menu"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/Button/Button"
import { clsx } from "clsx"
import { DropdownProps } from "@/components/ui/DropdownContent/types"
import { useNavigation } from "@remix-run/react"
import { cva } from "class-variance-authority"
import { cn } from "@/utils/shadcn/utils"

const dropdownVariants = cva(
  "border dark:bg-secondary-dark shadow-lg rounded-xs",
  {
    variants: {
      variant: {
        grey: "bg-[#f4f5f6] py-1",
        default: "bg-white border-primary py-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const DropdownContent = ({
  items,
  customTrigger,
  direction = "top",
  align = "end",
  yOffset = 0,
  variant = "default",
  className,
}: DropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const navigation = useNavigation()
  const isLoading =
    navigation.state === "loading" || navigation.state === "submitting"
  const prevStatus = useRef(navigation.state)

  useEffect(() => {
    if (prevStatus.current === "loading" && navigation.state === "idle") {
      setIsDropdownOpen(false)
    }
    prevStatus.current = navigation.state
  }, [navigation.state])

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}
      open={isDropdownOpen}
    >
      <DropdownMenuTrigger
        asChild={!customTrigger}
        className={clsx(
          "self-end cursor-pointer z-10",
          customTrigger && isDropdownOpen && "text-primary"
        )}
      >
        {customTrigger ? (
          customTrigger
        ) : (
          <FontAwesomeIcon
            icon={faEllipsis}
            className={
              "hover:text-primary" + (isDropdownOpen ? " text-primary" : "")
            }
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`border-none shadow-none mb-4 sm:mb-0}`}
        align={align}
        alignOffset={-6}
        side={direction}
        sideOffset={yOffset}
        isLowerZIndex={true}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(dropdownVariants({ variant, className }))}
          >
            {items.map((item, index) => (
              <DropdownMenuItem
                key={index + item.text}
                className={clsx(
                  "transition-colors duration-300 py-0",
                  items.length > 1 && "-mb-3",
                  items.length > 1 && index === items.length - 1 && "mb-0"
                )}
              >
                <Button
                  onClick={(e) => {
                    item.showSpinner && e.stopPropagation()
                    item.action && item.action()
                  }}
                  variant={"ghost"}
                  disabled={item.disabled || isLoading}
                  icon={item.icon}
                  isLoading={isLoading && item.showSpinner}
                  className={clsx(
                    "!px-4 cursor-pointer !font-normal !text-sm",
                    item?.danger && "!text-error dark:!text-red-400"
                  )}
                >
                  {item.text}
                </Button>
              </DropdownMenuItem>
            ))}
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownContent
