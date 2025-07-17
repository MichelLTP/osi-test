import { cn } from "@/utils/shadcn/utils"

type VersionIconProps = {
  version: string
  variant?: "primary" | "secondary"
  className?: string
}

export default function VersionIcon({
  version,
  variant = "primary",
  className,
}: VersionIconProps) {
  const variants = {
    primary: "border border-primary text-primary",
    secondary: "bg-secondary text-white dark:bg-secondary-dark",
  }

  return (
    <span
      className={cn(
        "text-[14px] font-bold font-orbitron px-5 py-2 rounded-lg",
        variants[variant],
        className
      )}
    >
      {version}
    </span>
  )
}
