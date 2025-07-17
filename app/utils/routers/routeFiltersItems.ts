import {
  faBookOpenReader,
  faChartSimple,
  faEarthAsia,
  faGlobe,
  faPercent,
  faPlug,
  faUsersViewfinder,
} from "@fortawesome/free-solid-svg-icons"
import { faWikipediaW } from "@fortawesome/free-brands-svg-icons"
import { IRouteCategory } from "@/components/Layout/ChatbarArea/type"
import { TransformKey } from "./types"

export const routeFiltersItems: IRouteCategory[] = [
  {
    category: "Documents",
    options: [
      {
        title: "All Documents",
        id: "docs",
        description: "All database docs",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Strategic Insights",
        id: "strategic_insights",
        description: "SI research library",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Ploom Docs",
        id: "ploom",
        description: "Ploom-focused reports",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Competitive Intel.",
        id: "competitive_intelligence",
        description: "Competitor analysis",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Euromonitor",
        id: "euromonitor",
        description: "Industry trends & economics",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Public Filings",
        id: "public",
        description: "Company filings & public info",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Regulatory Docs",
        id: "regulatory",
        description: "Market regulations",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Performance Docs",
        id: "performance",
        description: "Market & brand performance",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Incidence & Tracker",
        id: "incidence_tracker",
        description: "Market tracker reports",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "Commercial Strategy",
        id: "commercial_strategy",
        description: "Commercial strategy insights",
        icon: faBookOpenReader,
        disabled: false,
      },
      {
        title: "GRRP",
        id: "grrp",
        description: "Consumer, health & experience studies",
        icon: faBookOpenReader,
        disabled: false,
      },
    ],
  },
  {
    category: "Data",
    options: [
      {
        title: "Retail Audit",
        id: "radrs",
        description:
          "RADRS performance dataset for retail share and market size",
        icon: faChartSimple,
        disabled: false,
      },
      {
        title: "Incidence",
        id: "incidence",
        description: "Survey of incidence and category consumption",
        icon: faPercent,
        disabled: false,
      },
      {
        title: "Global Tracker",
        id: "tracker",
        description: "Survey of brand profile, perception, funnel and more",
        icon: faUsersViewfinder,
        disabled: false,
      },
      {
        title: "One Market Model",
        id: "omm",
        description: "Global forecast to 2035 of key topline KPIs",
        icon: faEarthAsia,
        disabled: false,
      },
      {
        title: "GRRP",
        id: "data_grrp",
        description: "GRRP data on new product development surveys",
        icon: faPlug,
        disabled: true,
      },
      {
        title: "Euromonitor",
        id: "data_euromonitor",
        description: "Comprehensive global market and consumer data",
        icon: faPlug,
        disabled: true,
      },
      {
        title: "Economist",
        id: "economist",
        description: "Global economic, political and market data",
        icon: faPlug,
        disabled: true,
      },
      {
        title: "Oxford Economics",
        id: "oxford_economics",
        description: "Global macroeconomic data, trends, and forecasts",
        icon: faPlug,
        disabled: true,
      },
      {
        title: "RRP Footprint",
        id: "rrp",
        description: "Granular RRP product availability and pricing",
        icon: faPlug,
        disabled: true,
      },
    ],
  },
  {
    category: "APIs",
    options: [
      {
        title: "ChatGPT",
        id: "gpt4",
        description: "Safely use JTI’s deployment of ChatGPT",
        icon: "chatGPT",
        disabled: false,
      },
      {
        title: "Wikipedia",
        id: "wikipedia",
        description: "Connect to the free encyclopedia",
        icon: faWikipediaW,
        disabled: false,
      },
      {
        title: "Web Search",
        id: "duckduckgo",
        description: "Search the web",
        icon: faGlobe,
        disabled: false,
      },
      {
        title: "Arxiv",
        id: "arxiv",
        description:
          "Open-access repository for preprints in science disciplines",
        icon: faPlug,
        disabled: true,
      },
      {
        title: "PubMed",
        id: "pubmed",
        description:
          "Free database for biomedical and life sciences literature",
        icon: faPlug,
        disabled: true,
      },
    ],
  },
]

export function transformRouter(value: string | boolean): string {
  const valueStr = String(value)

  for (const category of routeFiltersItems) {
    const match = category.options.find((option) => option.id === valueStr)
    if (match) return match.title
  }

  return valueStr
}
