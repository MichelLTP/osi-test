import {
  MarketLevel,
  NpdDataProps,
  NpdGraph,
  NpdOptions,
} from "@/components/OMM/types"
import { SimpleMarketData } from "@/components/OMM/EditableTable/types"

export type NpdTabTypes = "volume" | "market-share" | "price"

export interface NpdContentPropsBase {
  variant: NpdTabTypes
  currentSelection: NpdOptions
  tableData: MarketLevel<SimpleMarketData>
  isStacked?: boolean
  mirrorMarkets: string[]
  handleMirrorMarket: (mirrorMarket: string, type: NpdTabTypes) => void
  syncChart?: (value: Partial<NpdDataProps>) => void
  loading: boolean
  isDisabled?: boolean
  addRowList: string[]
}

export type NpdContentProps = NpdContentPropsBase &
  (
    | {
        variant: "price"
        chartData?: never
      }
    | {
        variant: "volume"
        chartData: NpdGraph[]
      }
    | {
        variant: "market-share"
        chartData: NpdGraph[]
      }
  )
