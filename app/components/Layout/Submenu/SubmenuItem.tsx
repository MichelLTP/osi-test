import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SubmenuItemProps } from "./type"
import { Button } from "@/components/ui/Button/Button"
import { cn } from "@/utils/shadcn/utils"
import { useCloseSidebar } from "@/store/layout"

const SubmenuItem = ({
  title,
  icon,
  description,
  onClick,
}: SubmenuItemProps): JSX.Element => {
  const close = useCloseSidebar((state) => state.close)

  return (
    <div
      className={`flex flex-col items-center mt-6 custom-height-mq:mt-8 ${
        close ? "md:mt-0" : "md:mt-8"
      }`}
    >
      <Button
        variant="outline"
        onClick={onClick}
        className={cn(
          `group first:flex shadow-lg justify-center items-center h-auto w-full flex-col p-5 custom-height-mq:p-8 hover:bg-primary hover:text-white hover:border-primary transition-none duration-300`
        )}
      >
        <FontAwesomeIcon size="4x" icon={icon} />
        <span
          className={`capitalize dark:text-white text-secondary group-hover:text-white sm:text-lg custom-height-mq:text-xl sm:mt-2 custom-height-mq:mt-4 text-xl mt-5 ml-0"
          }`}
        >
          {title}
        </span>
      </Button>
      <span className="text-center mt-6 text-sm text-black dark:text-white">
        {description}
      </span>
    </div>
  )
}

export default SubmenuItem
