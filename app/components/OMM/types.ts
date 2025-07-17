import {
  FullMarketData,
  MonthlyMarketData,
  SimpleMarketData,
} from "@/components/OMM/EditableTable/types"

export type MarketDataContent =
  | SimpleMarketData
  | FullMarketData
  | MonthlyMarketData

export type Category = "market_level" | "product_level" | "company_level"

export type BubbleTypes =
  | BubbleTableData
  | BrandLaunchBubbleData
  | NpdBubbleData

export type MarketLevelUnion<T extends MarketDataContent> =
  | MarketLevel<T>
  | ProductLevel<T>
  | CompanyLevel<T>

export type CompanyLevel<T extends MarketDataContent> = {
  [driver: string]: {
    [product: string]: {
      [company: string]: T
    }
  }
}

export type ProductLevel<T extends MarketDataContent> = {
  [driver: string]: {
    [product: string]: T
  }
}

export type MarketLevel<T extends MarketDataContent> = {
  [driver: string]: T
}

export type BaseScenario = {
  scenario_name: string
  status: string
  markets: string
  created_by: string | null
  created_at: string
  last_updated_by: string | null
  last_updated_at: string
  is_deleted: boolean
  scenario_id: number
}

export type Scenario = BaseScenario & { market_name: string }

export type MarketData = {
  market: string
  region: string
  subregion: string
  code: string
  scope: boolean
  cluster: number
  market_id: number
}

export type Measure = {
  measure_id: number
  measure_name: string
  measure_unit: string
  display_name: string
  granularity: string
  measure_type?: string
  measure_magnitude?: number
  web_app_display_name?: string
  group: string
  measure_group: string
}

export type ProductCompanySelection = {
  product: string | null
  company: string | null
}

export interface BrandLaunchOptions extends ProductCompanySelection {
  product_name: string | null
  company_name: string | null
  mirror_market: string
}

export interface NpdOptions {
  product: string | null
  product_name: string | null
  year: string
  month: string
  volume_mirror_market: string
  market_share_mirror_market: string
}

export type ScenarioStatus = "Draft" | "Generated" | "Saved" | "Empty"

export type ScenarioBubbleResponse = {
  scenario_name: string
  status: ScenarioStatus
  scenario_id: number
  bubbles_data: BubbleData[]
  detail?: string
}

export type BubbleData = {
  code: string
  change_description: string
  scenario_change_id: number
  product_hier_id?: string | "Null"
  company_hier_id?: string | "Null"
  market_id?: number
  change_type: "Default" | "Brand Launch" | "Ban" | "NPD"
}

export type BubbleTableData = {
  display_name: string
  measure_name: string
  Baseline: MonthlyMarketData
  Scenario: MonthlyMarketData
} & ProductCompanyTableData

export type ProductCompanyTableData = {
  product_id: number | null
  product_name: string | null
  company_id: number | null
  company_name: string | null
  scenarioChange: boolean
}

export type CompanyHier = {
  company: string
  brand_family: string
  level: string
  company_hier_desc: string
  company_hier_id: number
}

export type ProductHier = {
  category: string
  subcategory: string
  product_type: string
  product_definition: string
  product_hier_desc: string
  level: string
  npd_group: string
  product_hier_id: number
}

export type BrandLaunchProducts = {
  baseline_id: number
  products: ProductMirrorMarket[]
}

export type ProductMirrorMarket = {
  product_id: number
  product_name: string
  mirror_markets: MirrorMarket[]
}

export type NpdProducts = {
  baseline_id: number
  products: NpdProductMirrorMarket[]
}

export type NpdProductMirrorMarket = {
  product_id: number
  product_name: string
  product_mirror_markets: string[]
  market_share_mirror_markets: string[]
}

export type MirrorMarket = {
  mirror_market_id: number
  mirror_market_name: string
}

export type BrandLaunchCompany = {
  company_hier_id: number
  company_hier_desc: string
}

export type BrandLaunchGraph = {
  years: number
  [value: string]: number
}

export type NpdGraph = {
  year: number
  [value: string]: number
}

export type BrandLaunchTable = {
  "Market Shares": MarketLevel<FullMarketData>
  Price: MarketLevel<FullMarketData>
}

export type SimpleBrandLaunchTable<T = SimpleMarketData | BrandLaunchGraph[]> =
  {
    market_share: T
    price: T
  }

export type BrandLaunchData = {
  Table: {
    [mirror_market: string]: BrandLaunchTable
  }
  Graphic: BrandLaunchGraph[]
}

export type BrandLaunchBubbleData = {
  baseline_id: number
  market_id: number
  scenario_id: number
  mirror_market_id: number
  mirror_market_name: string
  product_id: number
  product_name: string
  company_id: number
  company_name: string
  year: number
  month: number
  Graphic: BrandLaunchGraph[]
  Table: SimpleBrandLaunchTable
}

export type NpdBubbleData = {
  baseline_id: number
  market_id: number
  scenario_id: number
  product_id: number
  product_name: string
  year: number
  month: number
  volume_mirror_market_name: string
  market_share_mirror_market_name: string
  "Volume Data": NpdVolumeData
  "Market Data": NpdMarketSharePriceData
  Products: string[]
}

export type NpdVolumeData = {
  Table: {
    [volume: string]: FullMarketData
  }
  Graphic: NpdGraph[]
  Products: string[]
}

export type NpdMarketSharePriceData = {
  Table: {
    "Market Shares": {
      [brand: string]: FullMarketData
    }
    Price: {
      [brand: string]: FullMarketData
    }
    price?: {
      [brand: string]: FullMarketData
    }
  }
  Graphic: NpdGraph[]
  Products: string[]
}

export interface NpdDataProps {
  volume: MarketLevel<SimpleMarketData>
  market_share: MarketLevel<SimpleMarketData>
  price: MarketLevel<SimpleMarketData>
}

export interface CompaniesBrands {
  companies: string[]
  brands: string[]
}
