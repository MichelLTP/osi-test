import { create } from "zustand"
import {
  BaseMonthlyMarketData,
  FullMarketData,
  SimpleMarketData,
} from "@/components/OMM/EditableTable/types"
import {
  Category,
  CompanyLevel,
  MarketLevel,
  ProductLevel,
  ScenarioStatus,
} from "@/components/OMM/types"
import { MonthlyMarketData } from "@/components/OMM/EditableTable/types"

export type ScenarioData = {
  scenario_id: number
  scenario_name: string
  status: ScenarioStatus
}

export type BanData = {
  scenario_id: number
  scenario_name: string
  product_name?: string
  market_id?: number
  month_launch?: number
  tableData?: Record<string, Record<string, { value: number; format: string }>>
}

type BanDataChanges = {
  market_id: number
  month_launch: number
  tableData?: Record<string, Record<string, { value: number; format: string }>>
}

type MonthlyDataChanges = {
  market_id: number
  driver: string
  year: string
  months: string[]
  values: number[]
  category: Category
  companyKey?: string
  productKey?: string
}

type MonthlyDataUpdate = {
  marketId: number
  driver: string
  year: string
  productKey: string
  companyKey: string
  category: Category
  value: number
  round_digits: number
  values: number[]
}

export type MonthlyData = {
  [marketId: string]: {
    market_level?: MarketLevel<MonthlyMarketData>
    product_level?: ProductLevel<MonthlyMarketData>
    company_level?: CompanyLevel<MonthlyMarketData>
  }
}

export type NpdData = {
  price_data: MarketLevel<SimpleMarketData>
  market_shares_data: MarketLevel<SimpleMarketData>
  volume_shares_data: MarketLevel<SimpleMarketData>
}

type NpdValueUpdate = {
  variant: NpdVariant
  newValue: MarketLevel<SimpleMarketData>
  isManualChange?: boolean
}

export type NpdVariant =
  | "price_data"
  | "market_shares_data"
  | "volume_shares_data"

type TableStore = {
  scenarioData: ScenarioData
  banData: BanData
  monthlyData: MonthlyData
  saveBanData: (newBanData: BanDataChanges) => void
  saveMonthlyData: (change: MonthlyDataChanges) => void
  updateMonthlyDataWithPropagation: ({
    marketId,
    driver,
    year,
    productKey,
    companyKey,
    category,
    values,
  }: MonthlyDataUpdate) => void
  updateMonthlyData: ({
    marketId,
    driver,
    year,
    productKey,
    companyKey,
    category,
    value,
    round_digits,
  }: MonthlyDataUpdate) => void
  isMonthlyDataDiscard: boolean
  discardMonthlyData: () => void
  resetData: () => void
  emptyMonthlyData: () => void
  handleScenarioName: (scenarioName: string) => void
  handleScenarioStatus: (status: ScenarioStatus) => void
  handleScenarioSelection: (scenarioID: number, scenarioName: string) => void //FIXME: Might not be needed, but need to switch to other methods where this is used
  handleScenarioId: (scenarioID: string) => void
  npdData: NpdData
  setInitialNpdData: (data: NpdData) => void
  addNpdRow: (variant: NpdVariant, key: string, data: SimpleMarketData) => void
  removeNpdRow: (variant: NpdVariant, key: string) => void
  updateNpdValue: (update: NpdValueUpdate) => void
  modifyNpdKey: (oldKey: string, newKey: string, variant: NpdVariant) => void
  getMonthlyStoredData: ({
    marketKey,
    driver,
    year,
    productKey,
    companyKey,
    category,
  }: {
    marketKey: number
    driver: string
    year: string
    productKey?: string
    companyKey?: string
    category: Category
  }) => FullMarketData<BaseMonthlyMarketData> | undefined
}

const useScenarioTableStore = create<TableStore>((set) => ({
  scenarioData: {
    scenario_id: 0,
    scenario_name: "",
    status: "Empty",
  },
  npdData: {
    price_data: {},
    market_shares_data: {},
    volume_shares_data: {},
  },
  banData: {
    scenario_id: 0,
    scenario_name: "",
  },
  monthlyData: {},
  isMonthlyDataDiscard: false,
  saveBanData: (newBanData) => {
    set((state) => ({
      ...state,
      banData: {
        ...state.banData,
        market_id: newBanData.market_id,
        month_launch: newBanData.month_launch,
        tableData: newBanData.tableData,
      },
    }))
  },
  updateMonthlyDataWithPropagation: ({
    marketId,
    driver,
    year,
    productKey,
    companyKey,
    category,
    values,
  }) =>
    set((state) => {
      const marketKey = String(marketId)
      let storedData = state.getMonthlyStoredData({
        marketKey: marketId,
        driver,
        year,
        productKey,
        companyKey,
        category,
      })

      if (!storedData) {
        console.warn("Stored data not found for the given parameters.")
        return state
      }

      let updatedDriverData
      if (category === "market_level") {
        updatedDriverData = {
          ...state.monthlyData[marketKey]?.[category]?.[driver],
          [year]: {
            ...storedData,
            values: values,
          },
        }
      } else if (category === "company_level" && companyKey && productKey) {
        updatedDriverData = {
          [productKey]: {
            [companyKey]: {
              ...state.monthlyData[marketKey]?.[category]?.[driver]?.[
                productKey
              ]?.[companyKey],
              [year]: {
                ...storedData,
                values: values,
              },
            },
          },
        }
      } else if (category === "product_level" && productKey) {
        updatedDriverData = {
          [productKey]: {
            ...state.monthlyData[marketKey]?.[category]?.[driver]?.[productKey],
            [year]: {
              ...storedData,
              values: values,
            },
          },
        }
      }
      return {
        ...state,
        monthlyData: {
          ...state.monthlyData,
          [marketKey]: {
            ...state.monthlyData[marketKey],
            [category]: {
              ...state.monthlyData[marketKey]?.[category],
              [driver]: {
                ...state.monthlyData[marketKey]?.[category]?.[driver],
                ...updatedDriverData,
              },
            },
          },
        },
      }
    }),
  getMonthlyStoredData: ({
    marketKey,
    driver,
    year,
    productKey,
    companyKey,
    category,
  }): FullMarketData<BaseMonthlyMarketData> | undefined => {
    const state = useScenarioTableStore.getState()
    if (!state.monthlyData[marketKey]) return undefined
    if (category === "market_level") {
      return state.monthlyData[marketKey]?.[category]?.[driver]?.[year]
    }
    if (category === "company_level" && productKey && companyKey) {
      return state.monthlyData[marketKey]?.[category]?.[driver]?.[productKey]?.[
        companyKey
      ]?.[year]
    }
    if (category === "product_level" && productKey) {
      return state.monthlyData[marketKey]?.[category]?.[driver]?.[productKey]?.[
        year
      ]
    }
    return undefined
  },
  updateMonthlyData: ({
    marketId,
    driver,
    year,
    productKey,
    companyKey,
    category,
    value,
    round_digits,
  }) =>
    // Note: Consider equal proportions
    set((state) => {
      const marketKey = String(marketId)
      let storedData = state.getMonthlyStoredData({
        marketKey: marketId,
        driver,
        year,
        productKey,
        companyKey,
        category,
      })

      if (!storedData) {
        console.warn("Stored data not found for the given parameters.")
        return state
      }

      const yearlySum = storedData.values.reduce(
        (sum: number, val: string) => sum + Number(val),
        0
      )
      const targetSum = Number(value) * storedData.values.length

      const proportionalValues = storedData.values.map(
        (originalValue: string) => {
          const ratio = targetSum / yearlySum
          const adjustedValue = Number(originalValue) * ratio
          return Number(adjustedValue.toFixed(round_digits))
        }
      )

      let updatedDriverData
      if (category === "market_level") {
        updatedDriverData = {
          ...state.monthlyData[marketKey]?.[category]?.[driver],
          [year]: {
            ...storedData,
            values: proportionalValues,
          },
        }
      } else if (category === "company_level" && companyKey && productKey) {
        updatedDriverData = {
          [productKey]: {
            [companyKey]: {
              ...state.monthlyData[marketKey]?.[category]?.[driver]?.[
                productKey
              ]?.[companyKey],
              [year]: {
                ...storedData,
                values: proportionalValues,
              },
            },
          },
        }
      } else if (category === "product_level" && productKey) {
        updatedDriverData = {
          [productKey]: {
            ...state.monthlyData[marketKey]?.[category]?.[driver]?.[productKey],
            [year]: {
              ...storedData,
              values: proportionalValues,
            },
          },
        }
      }

      return {
        ...state,
        monthlyData: {
          ...state.monthlyData,
          [marketKey]: {
            ...state.monthlyData[marketKey],
            [category]: {
              ...state.monthlyData[marketKey]?.[category],
              [driver]: {
                ...state.monthlyData[marketKey]?.[category]?.[driver],
                ...updatedDriverData,
              },
            },
          },
        },
      }
    }),
  saveMonthlyData: (change) =>
    set((state) => {
      const {
        market_id,
        driver,
        year,
        months,
        values,
        category,
        productKey,
        companyKey,
      } = change
      const marketKey = String(market_id)
      if (
        (category === "company_level" && !companyKey) ||
        (category === "product_level" && !productKey)
      ) {
        console.warn(
          "Invalid company or product key specified:",
          companyKey,
          productKey
        )
        return state
      }

      let updatedDriverData

      if (category === "company_level" && companyKey && productKey) {
        updatedDriverData = {
          [productKey]: {
            [companyKey]: {
              ...state.monthlyData[marketKey]?.[category]?.[driver]?.[
                productKey
              ]?.[companyKey],
              [year]: {
                months,
                values,
              },
            },
          },
        }
      } else if (category === "product_level" && productKey) {
        updatedDriverData = {
          [productKey]: {
            ...state.monthlyData[marketKey]?.[category]?.[driver]?.[productKey],
            [year]: { months, values },
          },
        }
      } else {
        updatedDriverData = {
          ...state.monthlyData[marketKey]?.[category]?.[driver],
          [year]: {
            ...state.monthlyData[marketKey]?.[category]?.[driver]?.[year],
            months,
            values,
          },
        }
      }
      return {
        ...state,
        monthlyData: {
          ...state.monthlyData,
          [marketKey]: {
            ...state.monthlyData[marketKey],
            [category]: {
              ...state.monthlyData[marketKey]?.[category],
              [driver]: {
                ...updatedDriverData,
              },
            },
          },
        },
      }
    }),
  handleScenarioName: (scenarioName) =>
    set((state) => ({
      ...state,
      scenarioData: {
        ...state.scenarioData,
        scenario_name: scenarioName,
      },
      banData: {
        ...state.banData,
        scenario_name: scenarioName,
      },
    })),
  handleScenarioStatus: (status) =>
    set((state) => ({
      ...state,
      scenarioData: {
        ...state.scenarioData,
        status: status,
      },
    })),
  resetData: () =>
    set(() => ({
      scenarioData: {
        scenario_id: 0,
        scenario_name: "",
        status: "Draft",
      },
      banData: {
        scenario_id: 0,
        scenario_name: "",
      },
      monthlyData: {},
    })),
  handleScenarioSelection: (scenarioID, scenarioName) =>
    set((state) => ({
      ...state,
      scenarioData: {
        ...state.scenarioData,
        scenario_id: scenarioID,
        scenario_name: scenarioName,
      },
      banData: {
        ...state.banData,
        scenario_id: Number(scenarioID),
        scenario_name: scenarioName,
      },
    })),
  handleScenarioId: (scenarioID) =>
    set((state) => ({
      ...state,
      scenarioData: {
        ...state.scenarioData,
        scenario_id: Number(scenarioID),
      },
      banData: {
        ...state.banData,
        scenario_id: Number(scenarioID),
      },
    })),
  emptyMonthlyData: () => {
    set((state) => ({
      ...state,
      monthlyData: {},
    }))
  },
  discardMonthlyData: () =>
    set((state) => ({
      ...state,
      isMonthlyDataDiscard: !state.isMonthlyDataDiscard,
    })),
  setInitialNpdData: (data) =>
    set((state) => ({
      ...state,
      npdData: {
        price_data: { ...data.price_data },
        market_shares_data: { ...data.market_shares_data },
        volume_shares_data: { ...data.volume_shares_data },
      },
    })),
  addNpdRow: (variant, key, data) =>
    set((state) => {
      const baseUpdate = {
        [key]: {
          years: [...data.years],
          values: [...data.values],
        },
      }
      if (variant === "price_data" || variant === "market_shares_data") {
        const otherVariant =
          variant === "price_data" ? "market_shares_data" : "price_data"
        return {
          ...state,
          npdData: {
            ...state.npdData,
            [variant]: {
              ...state.npdData[variant],
              ...baseUpdate,
            },
            [otherVariant]: {
              ...state.npdData[otherVariant],
              ...baseUpdate,
            },
          },
        }
      }

      return {
        ...state,
        npdData: {
          ...state.npdData,
          [variant]: {
            ...state.npdData[variant],
            ...baseUpdate,
          },
        },
      }
    }),
  removeNpdRow: (variant, key) =>
    set((state) => {
      const updatedVariantData = { ...state.npdData[variant] }
      const cleanupKey = key.replace(/\s*\([^)]*\)/g, "")
      const foundKey = Object.keys(updatedVariantData).find((k) =>
        k.includes(cleanupKey)
      )
      if (foundKey) delete updatedVariantData[foundKey]

      if (variant === "price_data" || variant === "market_shares_data") {
        const otherVariant =
          variant === "price_data" ? "market_shares_data" : "price_data"
        const updatedOtherVariantData = { ...state.npdData[otherVariant] }
        const otherFoundKey = Object.keys(updatedOtherVariantData).find((k) =>
          k.includes(cleanupKey)
        )
        if (otherFoundKey) delete updatedOtherVariantData[otherFoundKey]
        return {
          ...state,
          npdData: {
            ...state.npdData,
            [variant]: updatedVariantData,
            [otherVariant]: updatedOtherVariantData,
          },
        }
      } else {
        return {
          ...state,
          npdData: {
            ...state.npdData,
            [variant]: updatedVariantData,
          },
        }
      }
    }),
  updateNpdValue: ({ variant, newValue, isManualChange = false }) =>
    set((state) => {
      if (!isManualChange) {
        return {
          ...state,
          npdData: {
            ...state.npdData,
            [variant]: newValue,
          },
        }
      }
      const years = Object.keys(newValue).filter(
        (key) => key !== "scenario-type"
      )
      const values = years.map((year) => newValue[year])
      const scenarioType = newValue["scenario-type"]
      return {
        ...state,
        npdData: {
          ...state.npdData,
          [variant]: {
            ...state.npdData[variant],
            [scenarioType]: {
              years,
              values,
            },
          },
        },
      }
    }),
  modifyNpdKey: (oldKey, newKey, variant) =>
    set((state) => {
      if (variant === "volume_shares_data") {
        const updatedVolumeSharesData = { ...state.npdData.volume_shares_data }
        const foundKey = Object.keys(updatedVolumeSharesData).find((k) =>
          k.includes(oldKey)
        )
        if (foundKey) {
          updatedVolumeSharesData[newKey] = {
            ...updatedVolumeSharesData[foundKey],
          }
          delete updatedVolumeSharesData[foundKey]
        }
        return {
          ...state,
          npdData: {
            ...state.npdData,
            volume_shares_data: updatedVolumeSharesData,
          },
        }
      } else {
        const variants = ["price_data", "market_shares_data"] as const
        const updatedNpdData = { ...state.npdData }

        for (const variant of variants) {
          const updatedVariantData = { ...updatedNpdData[variant] }
          const foundKey = Object.keys(updatedVariantData).find((k) =>
            k.includes(oldKey)
          )
          if (foundKey) {
            const newValue = updatedVariantData[foundKey]
            delete updatedVariantData[foundKey]
            updatedNpdData[variant] = {
              ...updatedVariantData,
              [newKey]: newValue,
            }
          }
        }

        return {
          ...state,
          npdData: updatedNpdData,
        }
      }
    }),
}))

export { useScenarioTableStore }
