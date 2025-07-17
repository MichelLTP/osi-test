import { ReactNode } from "react"

export type TabsProps = {
  tabs: Tab[]
}

export type Tab = {
  label: string
  id: string
  children: ReactNode
}
