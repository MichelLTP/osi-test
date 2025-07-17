import { Button } from "@/components/ui/Button/Button"
import { faCheck, faClose, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import { ModalProps } from "@/components/Shared/Modal/types"
import { useNavigate, useNavigation } from "@remix-run/react"

const Modal = ({
  title,
  icon,
  children,
  handleClose,
  variant = "default",
  size = "default",
  confirmationProps,
  hasCancel = false,
}: ModalProps) => {
  const navigate = useNavigate()
  const navigation = useNavigation()

  const modalWidth = {
    "x-small": "sm:max-w-[500px]",
    small: "sm:max-w-[650px]",
    big: "sm:max-w-[1050px]",
    default: "sm:max-w-[850px]",
  }[size]

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="fixed top-0 left-0 w-full h-full bg-secondary-dark/70 z-49"
        onClick={
          handleClose
            ? handleClose
            : () => navigation.state !== "loading" && navigate(-1)
        }
      ></div>

      <motion.main
        className={`relative bg-white overflow-auto max-h-[95vh] dark:bg-primary-dark border border-primary dark:border-secondary
      p-10 rounded-[20px] flex flex-col text-secondary dark:text-white shadow-lg min-w-sm w-[85%] ${modalWidth}`}
        initial={{ y: "-10%", opacity: 0 }}
        animate={{ y: "0", opacity: 1 }}
        exit={{ y: "-10%", opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          className="absolute bg-neutral top-3 right-3 text-xl hover:text-secondary hover:dark:text-white text-primary"
          variant={"ghostIcon"}
          icon={faClose}
          onClick={
            handleClose
              ? handleClose
              : () => navigation.state !== "loading" && navigate(-1)
          }
        />
        <header className="flex items-center gap-2 mb-6">
          {icon && <FontAwesomeIcon icon={icon} />}
          <span className="text-xlbold">{title}</span>
        </header>
        {children}
        {variant === "confirmation" && confirmationProps && (
          <footer className={"flex justify-end gap-4 flex-wrap"}>
            {hasCancel ? (
              <div className="flex justify-end flex-col xs:flex-row gap-4 w-full">
                <Button
                  onClick={
                    handleClose
                      ? handleClose
                      : () => navigation.state !== "loading" && navigate(-1)
                  }
                  className={"max-w-full xs:max-w-[48%]"}
                  variant={"outline"}
                  name="intent"
                >
                  <FontAwesomeIcon
                    icon={faClose}
                    className={"mr-2 w-[11px] h-[11px]"}
                  />
                  Cancel
                </Button>
                <Button
                  onClick={confirmationProps.handleAction}
                  className={
                    "text-error border-error hover:bg-error hover:text-white dark:hover:border-error hover:border-error max-w-full xs:max-w-[48%]"
                  }
                  variant={"outline"}
                  name="intent"
                >
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    className={"mr-2 w-[11px] h-[11px]"}
                  />
                  {confirmationProps.actionText}
                </Button>
              </div>
            ) : (
              <Button
                onClick={confirmationProps.handleAction}
                className={"w-full sm:w-1/2 max-w-52 self-end !font-normal"}
                name="intent"
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className={"mr-2 w-[11px] h-[11px]"}
                />
                {confirmationProps.actionText}
              </Button>
            )}
          </footer>
        )}
      </motion.main>
    </motion.div>
  )
}
export default Modal
