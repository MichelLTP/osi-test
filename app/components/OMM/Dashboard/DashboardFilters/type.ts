export interface DashboardFiltersProps {
  markets: { [key: string]: any }[]
  activeMarkets: number[]
  products: { [key: string]: any }[]
  activeProducts: number[]
  companies: { [key: string]: any }[]
  activeCompanies: number[]
  handleValueChange: (filterField: Filters, selectedValues: number[]) => void
  context?: number
}

type Filters =
  | "markets"
  | "products"
  | "companies"
  | "markets_2"
  | "products_2"
  | "companies_2"
