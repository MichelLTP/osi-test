export interface DatePickerProps {
  value: string | null
  onChange: (date: string) => void
  showConfirmationPopover?: boolean
  variantPicker?: "default" | "monthpicker"
}

export interface YearVariantProps extends DatePickerProps {
  variant: "year"
  years: string[] | number[]
}

export interface MonthVariantProps extends DatePickerProps {
  variant: "month"
}

export type YearMonthPickerProps = YearVariantProps | MonthVariantProps
