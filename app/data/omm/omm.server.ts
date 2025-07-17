import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"

import {
  BaseScenario,
  BrandLaunchCompany,
  BrandLaunchData,
  BrandLaunchProducts,
  BubbleData,
  BubbleTypes,
  CompaniesBrands,
  CompanyHier,
  MarketData,
  MarketLevelUnion,
  Measure,
  NpdMarketSharePriceData,
  NpdProducts,
  NpdVolumeData,
  ProductHier,
  ScenarioBubbleResponse,
} from "@/components/OMM/types"
import {
  FullMarketData,
  MonthlyMarketData,
} from "@/components/OMM/EditableTable/types"
import { BanData, MonthlyData } from "@/store/omm"

export const fetchMarkets = async (token: string): Promise<MarketData[]> => {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE_URL_HTTP}/simulator_si/markets/`,
      {
        method: "GET",
      }
    )
    if (!response.body) {
      throw new Error("Response body is null")
    }
    return await response.json()
  } catch (error) {
    console.error("Error in getMarkets:", error)
    throw error
  }
}

export const fetchMarket = async (
  token: string,
  marketID: string
): Promise<MarketData> => {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE_URL_HTTP}/simulator_si/markets/${marketID}`,
      {
        method: "GET",
      }
    )
    if (!response.body) {
      throw new Error("Response body is null")
    }
    return await response.json()
  } catch (error) {
    console.error("Error in getMarket:", error)
    throw error
  }
}

export const fetchCompanies = async (
  token: string,
  variant?: "company" | "brand_family"
): Promise<CompanyHier[]> => {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE_URL_HTTP}/simulator_si/company_hiers/${variant ? `?level=${variant}` : ""}`,
      {
        method: "GET",
      }
    )
    if (!response.body) {
      throw new Error("Response body is null")
    }
    return await response.json()
  } catch (error) {
    console.error("Error in getCompanies:", error)
    throw error
  }
}

export const fetchProducts = async (token: string): Promise<ProductHier[]> => {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE_URL_HTTP}/simulator_si/product_hiers/`,
      {
        method: "GET",
      }
    )
    if (!response.body) {
      throw new Error("Response body is null")
    }
    return await response.json()
  } catch (error) {
    console.error("Error in getProducts:", error)
    throw error
  }
}

export const fetchMeasures = async (token: string): Promise<Measure[]> => {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE_URL_HTTP}/simulator_si/measures/`,
      {
        method: "GET",
      }
    )
    if (!response.body) {
      throw new Error("Response body is null")
    }
    return await response.json()
  } catch (error) {
    console.error("Error in getMeasures:", error)
    throw error
  }
}

export const fetchScenarios = async (
  token: string
): Promise<BaseScenario[]> => {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenarios/scenarios_with_markets?limit=200`
    )
    return await response.json()
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred."
    throw new Error("Failed to fetch scenarios. " + message)
  }
}

export const fetchGraphData = async (
  token: string,
  marketId: number,
  mandatoryParams: Record<string, string | number | number[] | string[]>,
  optionalParams?: Record<string, string | number | number[]>
) => {
  try {
    const queryParams = Object.entries({
      ...mandatoryParams,
      ...(optionalParams || {}),
    })
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          // For arrays, repeat the key for each value
          return value.map(
            (v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
          )
        } else {
          // For single values, just encode the key-value pair
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        }
      })
      .join("&")

    const url = `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/${marketId}/retrieve_graphic_data?${queryParams}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in headers
      },
    })

    if (!response.body) {
      throw new Error("Response body is null")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in fetchGraphData:", error)
    throw error
  }
}

export const getMeasuresByGranularity = async (
  marketId: string
): Promise<Measure[]> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/${marketId}/new_scenario_measures_by_category`
  )

  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to fetch measures: ${errorText}`)
  }

  return await response.json()
}

export const getMeasureDisplayName = async (
  driver: string,
  marketId?: string
): Promise<string> => {
  const measure = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si` +
      `/baselines_values/${marketId ?? "13"}/new_scenario_measures_by_category`
  )

  if (!measure.ok) {
    const errorText = await measure.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to fetch measures: ${errorText}`)
  }

  const measureData = await measure.json()
  const currentDriver = measureData.find(
    (measure: { measure_name: string }) => measure.measure_name === driver
  )

  if (!currentDriver)
    throw new Response("Market Driver Not Found:" + driver, { status: 404 })
  return currentDriver ? currentDriver.display_name : driver
}

export const getTableBaseline = async (
  marketId: string,
  driver: string,
  category: string
): Promise<MarketLevelUnion<MonthlyMarketData>> => {
  const endpoint = `/new_scenario_baseline_${category}_monthly`
  const baseline = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/${marketId}${endpoint}?measure_name=${driver}`
  )
  if (!baseline.ok) {
    const errorText = await baseline.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to fetch baseline: ${errorText}`)
  }

  const baselineResponse = await baseline.json()
  if (!baselineResponse)
    throw new Response("Market Driver Not Found:" + driver, { status: 404 })

  const [fullDriverData] = Object.values(baselineResponse)
  return fullDriverData as MarketLevelUnion<FullMarketData>
}

export const getBrandAndCompanies = async (): Promise<CompaniesBrands> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/companies_and_brands/`
  )

  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to fetch brand and companies: ${errorText}`)
  }
  return await response.json()
}

export const fetchDashboardData = async (
  token: string,
  marketId: number,
  mandatoryParams: Record<string, string | number | number[] | string[]>,
  optionalParams?: Record<string, string | number | number[]>
) => {
  try {
    const queryParams = Object.entries({
      ...mandatoryParams,
      ...(optionalParams || {}),
    })
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          // For arrays, repeat the key for each value
          return value.map(
            (v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
          )
        } else {
          // For single values, just encode the key-value pair
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        }
      })
      .join("&")

    const url = `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/${marketId}/retrieve_dashboard_data?${queryParams}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.body) {
      throw new Error("Response body is null")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in fetchGraphData:", error)
    throw error
  }
}

const parseIdsForExport = (input: string): number[] =>
  input
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id))

export const fetchAndExportFile = async (
  marketIds: string,
  companies: string,
  products: string,
  period: string = "yearly",
  year: string | null = null
) => {
  // FIX: New endpoint for the baseline export. To fix later with scenario.
  const marketIdsArray = parseIdsForExport(marketIds)
  const companiesArray = parseIdsForExport(companies)
  const productsArray = parseIdsForExport(products)

  const searchParams = new URLSearchParams()
  searchParams.set("granularity", period)
  searchParams.set("all_parameters", "false")
  if (year && year.trim() !== "null" && year !== "")
    searchParams.set("year", year)

  marketIdsArray.forEach((id) =>
    searchParams.append("market_ids", id.toString())
  )
  productsArray.forEach((id) =>
    searchParams.append("product_hiers", id.toString())
  )
  companiesArray.forEach((id) =>
    searchParams.append("company_hiers", id.toString())
  )

  const url = `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/export_baseline/?${searchParams.toString()}`

  const response = await fetch(url, {
    headers: {
      Accept: "application/json, application/octet-stream",
    },
    method: "GET",
  })

  if (!response.ok) {
    const errorText = await response.text()
    try {
      const parsed = JSON.parse(errorText)
      const detail = Array.isArray(parsed?.detail)
        ? parsed.detail.map((d: any) => d.msg).join(", ")
        : parsed?.detail
      throw new Error(`Failed to export baseline: ${detail || errorText}`)
    } catch {
      throw new Error(`Failed to export baseline: ${errorText}`)
    }
  }

  const blob = await response.blob()

  const extractFilenameFromDisposition = (disposition: string) => {
    const match = disposition.match(/filename="?([^"]+)"?/)
    return match ? match[1] : "unknown.ext"
  }

  const disposition = response.headers.get("content-disposition")
  const fileName = extractFilenameFromDisposition(disposition ?? "")
  const arrayBuffer = await blob.arrayBuffer()
  const file = Buffer.from(arrayBuffer).toString("base64")
  const fileType = response.headers.get("content-type")

  return { file, fileType, fileName }
}

export const generateScenario = async (scenarioId: string) => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/${scenarioId}/generate_scenario`,
    {
      method: "POST",
    }
  )
  if (!response.ok) {
    const errorText = await response.text()
    try {
      const parsed = JSON.parse(errorText)
      const detail = Array.isArray(parsed?.detail)
        ? parsed.detail.map((d: any) => d.msg).join(", ")
        : parsed?.detail
      throw new Error(`Failed to export baseline: ${detail || errorText}`)
    } catch {
      throw new Error(`Failed to export baseline: ${errorText}`)
    }
  }
  return await response.json()
}

export const duplicateScenario = async (scenarioId: string) => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/${scenarioId}/duplicate_scenario_monthly`,
    {
      method: "POST",
    }
  )
  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to duplicate scenario: ${errorText}`)
  }
  return await response.json()
}

export const saveScenario = async (
  scenarioId: string,
  scenarioName: string
) => {
  const save = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/${scenarioId}/save_scenario?scenario_name=${scenarioName}`,
    {
      method: "POST",
    }
  )
  if (!save.ok) {
    const errorText = await save.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to save scenario data: ${errorText}`)
  }
  return await save.json()
}

export const saveMonthlyScenarioData = async (
  data: MonthlyData,
  scenario_id: number
): Promise<{
  success: boolean
  scenario_id: number
}> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/scenario_inputs_save_monthly?scenario_id=${scenario_id}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) {
      throw new Error(
        typeof responseText.detail === "string"
          ? responseText.detail
          : Array.isArray(responseText.detail)
            ? (responseText.detail[0]?.msg ?? "Unknown error")
            : "Unknown error"
      )
    }
    throw new Error(`Failed to save scenario data: ${errorText}`)
  }
  return await response.json()
}

export const updateScenarioName = async (
  scenarioId: string,
  scenarioName: string
) => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/${scenarioId}/save_scenario_name?scenario_name=${scenarioName}`,
    {
      method: "POST",
    }
  )
  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to update scenario name: ${errorText}`)
  }
  return await response.json()
}

export const fetchScenarioBubbles = async (
  scenarioId: string
): Promise<ScenarioBubbleResponse> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/${scenarioId}/fetch_bubbles_data`
  )
  const bubblesData: ScenarioBubbleResponse = await response.json()

  if (!bubblesData.bubbles_data) return bubblesData

  return {
    ...bubblesData,
    bubbles_data: bubblesData.bubbles_data as BubbleData[],
  }
}

export const deleteScenario = async (scenarioId: string) => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/${scenarioId}/delete_scenario_monthly`,
    {
      method: "DELETE",
    }
  )
  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to delete scenario: ${errorText}`)
  }
  return await response.json()
}

export const resetScenario = async (scenarioId: string) => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/${scenarioId}/reset_scenario_monthly`,
    {
      method: "DELETE",
    }
  )
  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    throw new Error(`Failed to reset scenario: ${errorText}`)
  }
  return await response.json()
}

export const deleteScenarioChangesBubble = async (
  scenarioChangeId: number
): Promise<boolean> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/delete_specific_change_monthly?scenario_change_id=${scenarioChangeId}`,
    {
      method: "DELETE",
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    else throw new Error(`Failed to delete scenario change: ${errorText}`)
  }
  return await response.json()
}

export const getBubblesTable = async <T extends BubbleTypes>(
  scenarioChangeId: string,
  change_type = "Default"
): Promise<T> => {
  const res = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/scenario_inputs_from_change/?scenario_change_id=` +
      Number(scenarioChangeId) +
      "&change_type=" +
      encodeURIComponent(change_type)
  )
  const data = await res.json()
  if (data.detail) throw new Error(data.detail)
  return data
}

export const getProductBans = async (marketId: string) => {
  const productBan = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/bans/?market_id=` +
      marketId
  )
  if (!productBan.ok) throw new Error("Failed to fetch product bans")
  const data = await productBan.json()
  if (data.detail) throw new Error(data.detail)
  return data
}

export const getProductBanShares = async (
  marketId: string,
  product_hier: string
) => {
  const banShares = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si` +
      "/ban/" +
      marketId +
      "/" +
      product_hier
  )
  if (!banShares.ok) throw new Error("Failed to fetch ban shares")
  const data = await banShares.json()
  if (data.detail) throw new Error(data.detail)
  return data
}

export const saveBanData = async (
  data: BanData,
  product: string,
  scenarioId: number
) => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/scenario_save_bans?scenario_id=${scenarioId ?? 0}&market_id=${data.market_id}&product_name_to_ban=${encodeURIComponent(product)}&month_launch=${data.month_launch}`,
    {
      method: "POST",
      body: JSON.stringify(data.tableData),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) {
      if (typeof responseText?.detail === "string")
        throw new Error(responseText.detail)
      else
        throw new Error(
          responseText?.detail[0]?.msg ||
            "Failed to save BAN: Unknown error occurred"
        )
    } else throw new Error(`Failed to save BAN: ${errorText}`)
  }

  return await response.json()
}

export const fetchBrandLaunchProducts = async (
  marketId: string
): Promise<BrandLaunchProducts> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/brand_launches/?market_id=${marketId}`
  )
  if (!response.ok) throw new Error("Failed to fetch brand launch products")
  const data = await response?.json()
  if (data?.detail) throw new Error(data.detail)
  return data
}

export const fetchBrandLaunchData = async (
  baselineId: string,
  productId: string,
  mirrorMarketId: string
): Promise<BrandLaunchData> => {
  const response =
    await fetch(`${BACKEND_API_BASE_URL_HTTP}/simulator_si/NPD/data_for_brand_launch_graphic/?
	mirror_company_id=${mirrorMarketId}&product_id=${productId}&baseline_id=${baselineId}`)

  if (!response.ok) throw new Error("Failed to fetch brand launch graph data")
  const data = await response.json()
  if (data.detail) throw new Error(data.detail)
  return data
}

export const fetchBrandLaunchCompanies = async (
  productId: string,
  baselineId: string
): Promise<BrandLaunchCompany[]> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/NPD/companies_for_brand_launch/?product_id=${productId}&baseline_id=${baselineId}`
  )
  if (!response.ok) throw new Error("Failed to fetch brand launch companies")
  const data = await response.json()
  if (data.detail) throw new Error(data.detail)
  return data
}

export const saveBrandLaunchData = async (
  scenarioId: string,
  baselineId: string,
  marketId: string,
  productName: string,
  productId: string,
  companyId: string,
  companyName: string,
  year: string,
  month: string,
  mirrorMarketId: string,
  data: string
): Promise<{ success: boolean; scenario_id: number }> => {
  const params = `scenario_id=${scenarioId}&baseline_id=${encodeURIComponent(
    baselineId
  )}&market_id=${encodeURIComponent(marketId)}&
	product_name=${encodeURIComponent(productName)}&product_id=${encodeURIComponent(
    productId
  )}&company_id=${encodeURIComponent(companyId)}&
	company_name=${encodeURIComponent(companyName)}&year=${encodeURIComponent(
    year
  )}&month=${encodeURIComponent(month)}&
	mirror_market_id=${encodeURIComponent(mirrorMarketId)}`

  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/scenario_save_brand_launches?${params}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    else throw new Error(`Failed to save brand launch: ${errorText}`)
  }

  return await response.json()
}

export const fetchNpdProducts = async (
  marketId: string
): Promise<NpdProducts> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/baselines_values/npds/?market_id=${marketId}`
  )
  const data = await response?.json()
  if (data?.detail) throw new Error(data.detail)
  if (!response.ok) throw new Error("Failed to fetch NPD products")
  return data
}

export const fetchNpdVolumes = async (
  baselineId: string,
  productId: string,
  mirrorMarket: string
): Promise<NpdVolumeData> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/NPD/get_volume_data/?product_id=${productId}&baseline_id=${baselineId}&mirror_market_name=${encodeURIComponent(
      mirrorMarket
    )}`
  )
  const data = await response?.json()
  if (data.detail) throw new Error(data.detail)
  if (!response.ok) throw new Error("Failed to fetch NPD volumes")
  return data
}

export const fetchNpdMarketSharePrice = async (
  baselineId: string,
  productId: string,
  mirrorMarket: string
): Promise<NpdMarketSharePriceData> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/NPD/get_market_share_and_price_data/?product_id=${productId}&baseline_id=${baselineId}&mirror_market_name=${encodeURIComponent(
      mirrorMarket
    )}`
  )
  const data = await response.json()
  if (data.detail) throw new Error(data.detail)
  if (!response.ok) throw new Error("Failed to fetch NPD market shares")

  return data
}

export const fetchNpdCompanies = async (
  baselineId: number | string,
  productId: number | string
): Promise<string[]> => {
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/NPD/companies_for_npd/?product_id=${productId}&baseline_id=${baselineId}`
  )
  if (!response.ok) throw new Error("Failed to fetch NPD companies")
  const data = await response.json()
  if (data?.detail)
    throw new Error(
      typeof data?.detail === "string" ? data?.detail : data?.detail[0].msg
    )
  return data
}

export const saveNpdData = async (
  scenarioId: string,
  baselineId: string,
  marketId: string,
  productName: string,
  productId: string,
  year: string,
  month: string,
  volumeMirrorMarketId: string,
  marketSharesMirrorMarketId: string,
  data: string
): Promise<{
  success: boolean
  scenario_id: number
}> => {
  const params = `scenario_id=${scenarioId}&baseline_id=${encodeURIComponent(
    baselineId
  )}&market_id=${encodeURIComponent(marketId)}&
	product_name=${encodeURIComponent(productName)}&product_id=${encodeURIComponent(
    productId
  )}&market_share_mirror_name=${encodeURIComponent(marketSharesMirrorMarketId)}&
	&year=${encodeURIComponent(year)}&month=${encodeURIComponent(
    month
  )}&volume_shares_mirror_name=${encodeURIComponent(volumeMirrorMarketId)}`
  const response = await fetch(
    `${BACKEND_API_BASE_URL_HTTP}/simulator_si/scenario_inputs/scenario_save_npd?${params}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    const responseText = JSON.parse(errorText)
    if (responseText?.detail) throw new Error(responseText.detail)
    else throw new Error(`Failed to save npd: ${errorText}`)
  }

  return await response.json()
}

export const getOmmChatStream = async (
  token: string,
  message: string,
  threadId: string,
  marketID: string,
  scenarioID: string,
  scenarioName: string
) => {
  try {
    // Construct query parameters
    const params = new URLSearchParams({
      message,
      thread_id: threadId,
      scenario_id: scenarioID,
      scenario_name: scenarioName,
      market_id: marketID,
    }).toString()

    const response = await fetch(
      `${BACKEND_API_BASE_URL_HTTP}/simulator_si/omm_chat/invoke?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.body) throw new Error("Response body is null")

    const reader = response.body.getReader()
    const encoder = new TextEncoder()

    return new ReadableStream({
      async start(controller) {
        try {
          let done = false
          while (!done) {
            const { done, value } = await reader.read()

            if (done) break

            // For SSE, format data in the expected way: data: <chunk>
            const text = new TextDecoder().decode(value)

            // Enqueue formatted SSE data
            controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })
  } catch (error) {
    console.error("Error in getOmmChatStream:", error)
    throw error
  }
}
