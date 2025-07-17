export type IncidenceItem = {
  id: string
  frequency: string
  adc: string
}

export type UnitsRow = {
  id: string
  label: string
  defaultUnits: string
  defaultDecimals: string
  unitOptions?: string[]
  decimalOptions?: string[]
}

export type UnitsState = {
  [key: string]: {
    units: string
    decimals: string
  }
}