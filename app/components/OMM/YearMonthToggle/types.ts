export type YearMonthToggleProps = {
  period: "yearly" | "monthly"
  onOptionChange: (key: "period" | "activeYear", value: string) => void
  availableYears: number[] | string[]
  currentYear: string | number
  showLabel?: boolean
}
