import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition as RegularIcon} from "@fortawesome/free-regular-svg-icons"
import { IconDefinition as SolidIcon} from "@fortawesome/free-solid-svg-icons"
import { cn } from "@/utils/shadcn/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xs text-base font-medium hover:transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 hover:transition-all hover:duration-300",
  {
    variants: {
      variant: {
        default: "hover:bg-opacity-80 text-white bg-primary",
        outline:
          "text-primary border-primary border hover:text-secondary hover:border-secondary dark:hover:text-white dark:hover:border-white",
        ghost:
          "text-secondary dark:text-white hover:text-primary dark:hover:text-primary !p-1.5",
        borderGhost:
          "text-secondary border border-secondary hover:border-opacity-80 hover:opacity-80 dark:border-white dark:text-white dark:hover:text-opacity-80 dark:hover:border-opacity-80",
        underline:
          "rounded-none underline underline-offset-5 text-primary hover:text-secondary dark:hover:text-third/70 !p-1.5",
        lucideIcon:
          "flex items-center justify-center bg-primary border border-primary rounded-full p-[6.5px] text-white hover:bg-transparent hover:text-primary hover:border hover:border-primary ease-in-out duration-300",
        icon: "bg-primary border border-primary rounded-full !p-3.5 text-white !w-[35px] !h-[35px] hover:bg-transparent hover:text-primary hover:border hover:border-primary",
        ghostIcon:
          "rounded-full !p-3.5 text-primary !w-[35px] !h-[35px] hover:text-secondary dark:hover:text-white",
        outlineIcon:
          "border-primary border rounded-full !p-3.5 text-primary !w-[35px] !h-[35px] hover:border-primary hover:bg-primary hover:text-white",
        delete:
          "text-error border-error border hover:bg-error hover:text-white",
        outlineHighlight:
          "rounded-sm block min-w-56 group text-sm font-bold border-primary border hover:text-secondary hover:border-secondary dark:hover:text-white dark:hover:border-white",
      },
      size: {
        default: "h-11 px-16",
        sm: "h-11 px-6",
        md: "h-11 px-8 py-4",
        theme: "h-35 w-35",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: SolidIcon | RegularIcon
  isLoading?: boolean
  helperText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      icon,
      isLoading = false,
      children,
      helperText = "",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    const hasHelperTextClass = "whitespace-normal h-auto justify-start !p-5 "

    const iconElement = isLoading ? (
      <Loader2
        className={cn(
          "animate-spin min-w-[14px] min-h-[14px]",
          variant && ["icon", "ghostIcon", "outlineIcon"].includes(variant)
            ? "mr-0"
            : "mr-2 max-w-[14px] max-h-[14px]",
          variant === "outlineHighlight" &&
            "text-primary mt-1 dark:group-hover:text-primary group-hover:text-secondary"
        )}
      />
    ) : (
      icon && (
        <FontAwesomeIcon
          icon={icon}
          className={cn(
            variant && ["icon", "ghostIcon", "outlineIcon"].includes(variant)
              ? "mr-0"
              : "mr-2 max-w-[14px] max-h-[14px]",
            variant === "outlineHighlight" &&
              "text-primary mt-1 dark:group-hover:text-primary group-hover:text-secondary"
          )}
        />
      )
    )

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
          }),
          helperText && hasHelperTextClass,
          isLoading && "cursor-not-allowed opacity-70"
        )}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {!helperText && (
          <>
            {iconElement}
            {children}
          </>
        )}
        {helperText && (
          <div className={"flex gap-2"}>
            {iconElement}
            <div className={"text-left"}>
              <p className={"whitespace-nowrap"}>{children}</p>
              <p className="font-normal whitespace-nowrap">{helperText}</p>
            </div>
          </div>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
