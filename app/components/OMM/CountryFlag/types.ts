import { ComponentProps } from "react"

export interface FlagProps extends ComponentProps<"span"> {
  countryCode: string
  rounded?: boolean
}
