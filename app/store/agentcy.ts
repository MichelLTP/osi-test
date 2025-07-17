import { create } from "zustand"
import { FileType } from "@/components/Shared/FileUploadProgress/type"
import { Document } from "@/components/LitePaper/types"
import { TeamMember } from "@/components/Agentcy/types"

export interface ProposalSection {
  title: string
  type: string
  subtype?: string | null
  subsection?: ProposalSubsection[]
  prompt?: string
  [key: string]: any
}

export type ProposalSubsection = {
  layout_metadata?: {
    displayMode?: string
    [key: string]: any
  }
  title: string
  prompt?: string
  type?: string
  subtype?: string | null
  is_opensi_selected?: boolean
  [key: string]: any
}

type ActiveAgentcyOptions = {
  activeOptions: {
    agentcyParameter: "Factual Search" | "Hypothesis Testing" | "Ideation" | ""
    prompt: string
    managementTeam: "Hierarchical" | "Flat" | "Matrix" | ""
    writingSample: FileType[] | Document[] //I'm basing this on LitePaper, as it seems it will be redirected to this UC.
    writingStyle: string
    proposal: ProposalSection[]
    hiringMethod:
      | "Custom"
      | "Auto"
      | "Consumer Centriq"
      | "PeakPerform"
      | "OpenSearch"
      | ""
    team: TeamMember[]
  }
  updateOption: <K extends keyof ActiveAgentcyOptions["activeOptions"]>(
    key: K,
    value: ActiveAgentcyOptions["activeOptions"][K]
  ) => void
  addProposalSection: (section: ProposalSection) => void
  editProposalSection: (index: number, updatedSection: ProposalSection) => void
  deleteProposalSection: (index: number) => void
  addTeamMember: (member: TeamMember) => void
  removeTeamMember: (member: Partial<TeamMember>) => void
}

export const useAgentcy = create<ActiveAgentcyOptions>((set) => ({
  activeOptions: {
    agentcyParameter: "Factual Search",
    prompt: "",
    managementTeam: "",
    proposal: [],
    writingSample: [],
    writingStyle: "",
    hiringMethod: "",
    team: [],
  },
  updateOption: (key, value) =>
    set((state) => ({
      activeOptions: {
        ...state.activeOptions,
        [key]: value,
      },
    })),
  addProposalSection: (section) =>
    set((state) => ({
      activeOptions: {
        ...state.activeOptions,
        proposal: [...state.activeOptions.proposal, section],
      },
    })),
  editProposalSection: (index, updatedSection) =>
    set((state) => ({
      activeOptions: {
        ...state.activeOptions,
        proposal: state.activeOptions.proposal.map((sec, i) =>
          i === index ? updatedSection : sec
        ),
      },
    })),
  deleteProposalSection: (index) =>
    set((state) => ({
      activeOptions: {
        ...state.activeOptions,
        proposal: state.activeOptions.proposal.filter((_, i) => i !== index),
      },
    })),
  addTeamMember: (member) =>
    set((state) => ({
      activeOptions: {
        ...state.activeOptions,
        team: [...state.activeOptions.team, member],
      },
    })),
  removeTeamMember: (member) =>
    set((state) => ({
      activeOptions: {
        ...state.activeOptions,
        team: state.activeOptions.team.filter(
          (m) =>
            m.type !== member.type ||
            (member.specialization &&
              m.specialization !== member.specialization)
        ),
      },
    })),
}))
