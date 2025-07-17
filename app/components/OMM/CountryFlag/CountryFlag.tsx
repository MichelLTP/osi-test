import { twMerge } from "tailwind-merge"
import { FlagProps } from "@/components/OMM/CountryFlag/types"
import "/node_modules/flag-icons/css/flag-icons.min.css"

export function CountryFlag({
  countryCode,
  className,
  rounded = false,
  ...props
}: FlagProps) {
  return (
    <div
      className={
        "h-auto min-w-6 mt-[1px] w-6 object-cover bg-cover aspect-square" +
        (rounded ? " rounded-full overflow-hidden !w-4 !min-w-4" : "")
      }
    >
      <span
        className={twMerge(
          `fi fi-${countryCode?.toLowerCase()} rounded-[5px] shadow-sm !leading-relaxed !w-full aspect-[4/3] h-auto`,
          className
        )}
        {...props}
      />
    </div>
  )
}
