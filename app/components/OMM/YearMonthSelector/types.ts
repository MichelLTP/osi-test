export type YearMonthSelectorProps = {
  currentDate: { month: string; year: string }
  setCurrentDate: (date: { month: string; year: string }) => void
  years: string[]
  classNames?: string
  disabled?: boolean
  showConfirmationPopover?: boolean
}
