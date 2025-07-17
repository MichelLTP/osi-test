export type PropagationManagementProps = {
  years: number[]
  applyPropagation: (
    startingYear: number,
    startingMonth: string,
    type: PropagationType,
    valueToPropagate: number
  ) => void
}

export type PropagationType = "Absolute" | "Percentual"

export type PropagationAdjustments = {
  year: string | number
  value: number
  type: string
  month: string
}
