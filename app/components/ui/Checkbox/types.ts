export interface Item {
  value: string
  key?: string
  checked: boolean
  disabled?: boolean
}

export interface CheckboxProps {
  items: Item[]
  row?: boolean
  className?: string
  size?: "xs" | "sm" | "md"
  onClick?: (item: Item) => void
  namePrefix?: string
}
