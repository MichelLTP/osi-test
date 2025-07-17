import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/Toast/Toast"
import { useToast } from "@/hooks/useToast"
import {
  faCheck,
  faExclamation,
  faClose,
  IconDefinition,
  faInfo,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ToastVariant } from "./type"

const variantIcons: Record<ToastVariant, IconDefinition | null> = {
  success: faCheck,
  warning: faExclamation,
  error: faClose,
  destructive: faClose,
  default: faInfo,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant = "default",
        marginRight,
        ...props
      }) {
        let Icon
        if (variant) {
          Icon = variantIcons[variant]
        }

        return (
          <Toast
            key={id}
            {...props}
            variant={variant}
            className={`justify-normal fixed top-[80px] ${marginRight ? marginRight : "right-4 sm:right-16"} max-w-[300px] py-4 pl-5 pr-16 space-x-5`}
          >
            {Icon && (
              <FontAwesomeIcon
                icon={Icon}
                className={`${
                  variant === "success"
                    ? "bg-success"
                    : variant === "error"
                      ? "bg-error"
                      : variant === "warning"
                        ? "bg-warning"
                        : variant === "default"
                          ? "bg-secondary"
                          : "bg-white"
                } text-white p-[3px] min-h-[10px] max-h-[10px] h-[10px] max min-w-[10px] max-w-[10px] w-[10px] rounded-[2px]`}
              />
            )}
            <div>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs text-secondary opacity-60">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
