import {
  faAtom,
  faChartSimple,
  faClock,
  faTable,
} from "@fortawesome/free-solid-svg-icons"
import { faLightbulb } from "@fortawesome/free-regular-svg-icons"
import type { TeamMember } from "@/components/Agentcy/types"

export const specialists = [
  "RADRS",
  "Incidence",
  "OMM",
  "Tracker",
  "Web Search",
  "ChatGPT",
] as const

export const specialistDetails = {
  RADRS: {
    description:
      "Specialist in RADRS dataset, including market and share performance",
    keyTools: ["Text", "KPI calculation", "Tables and charts"],
  },
  Incidence: {
    description:
      "Specialist in survey data of incidence and category consumption",
    keyTools: ["Text", "KPI calculation", "Tables and charts"],
  },
  OMM: {
    description: "Specialist in forecasts to 2035 of key topline KPIs",
    keyTools: ["Text", "KPI calculation", "Tables and charts"],
  },
  Tracker: {
    description:
      "Specialist in Survey of brand profile, perception, funnel and more",
    keyTools: ["Text", "KPI calculation", "Tables and charts"],
  },
  "Web Search": {
    description: "Specialist in web search and result synthesis",
    keyTools: ["Web search", "Result ranking", "Sub-query generation"],
  },
  ChatGPT: {
    description: "Specialist in prompt engineering and structuring",
    keyTools: [
      "Prompt engineering",
      "Output structuring",
      "Sub-query generation",
    ],
  },
} as const

export const researchers = ["ChatGPT", "Wikipedia", "Web Search"] as const

export const researcherDetails = {
  "Web Search": {
    description: "Specialist in web search and result synthesis",
    keyTools: ["Web search", "Result ranking", "Sub-query generation"],
  },
  ChatGPT: {
    description: "Specialist in prompt engineering and structuring",
    keyTools: [
      "Prompt engineering",
      "Output structuring",
      "Sub-query generation",
    ],
  },
  Wikipedia: {
    description: "Specialist in wikipedia searching and synthesis.",
    keyTools: [
      "Article searching",
      "Article synthesis",
      "Sub-query generation",
    ],
  },
} as const

export const contentWriters = ["Documents"] as const

export const contentWriterDetails = {
  Documents: {
    description: "Specialist in LitePaper definition and plan definition",
    keyTools: ["LitePaper parameters", "Paper structuring", "Plan definition"],
  },
} as const

export const specialistImages = [
  "/img/agentcy/avatar_1.png",
  "/img/agentcy/avatar_9.png",
  "/img/agentcy/avatar_8.png",
  "/img/agentcy/avatar_7.png",
  "/img/agentcy/avatar_6.png",
  "/img/agentcy/avatar_5.png",
] as const

export const researcherImages = [
  "/img/agentcy/avatar_10.png",
  "/img/agentcy/avatar_2.png",
  "/img/agentcy/avatar_3.png",
] as const

export const contentWriterImages = ["/img/agentcy/avatar_4.png"] as const

export const specialistAnalysisStyles = [
  {
    icon: faTable,
    title: "Concise",
    description: "Brief, direct answer only",
  },
  {
    icon: faChartSimple,
    title: "Detailed",
    description: "More verbose and added visuals",
  },
  {
    icon: faAtom,
    title: "Complementary",
    description: "Adds context or extra insights",
  },
] as const

export const contentWriterAnalysisStyles = [
  {
    icon: faTable,
    title: "Balanced",
    description: "Concise and detailed",
  },
  {
    icon: faChartSimple,
    title: "Critical",
    description: "In-depth analysis with a focus on critical thinking",
  },
  {
    icon: faLightbulb,
    title: "Positive",
    description: "Highlights strengths and opportunities",
  },
] as const

export const researcherAnalysisStyles = [
  {
    icon: faClock,
    title: "Quick",
    description: "Fast and concise summary",
  },
  {
    icon: faChartSimple,
    title: "Advanced",
    description: "Comprehensive and detailed analysis",
  },
  {
    icon: faLightbulb,
    title: "Deep Research",
    description: "Thorough exploration and insights",
  },
] as const

export const TEAM_TYPES = [
  {
    title: "Specialists",
    members: specialists,
    images: specialistImages,
    type: "specialist" as TeamMember["type"],
  },
  {
    title: "Researchers",
    members: researchers,
    images: researcherImages,
    type: "researcher" as TeamMember["type"],
  },
  {
    title: "Content Writers",
    members: contentWriters,
    images: contentWriterImages,
    type: "content writer" as TeamMember["type"],
  },
]
