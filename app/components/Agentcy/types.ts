import React from "react"
import { ProposalSection, ProposalSubsection } from "@/store/agentcy"
import {
  contentWriterAnalysisStyles,
  contentWriters,
  specialistAnalysisStyles,
  researchers,
  specialists,
  researcherAnalysisStyles,
} from "@/components/Agentcy/teamData"

export type TeamMemberTypes = "specialist" | "researcher" | "content writer"
export type AnalysisStyles =
  | (typeof specialistAnalysisStyles)[number]["title"]
  | (typeof contentWriterAnalysisStyles)[number]["title"]
  | (typeof researcherAnalysisStyles)[number]["title"]

export type ActiveMember =
  | ["specialist", (typeof specialists)[number]]
  | ["researcher", (typeof researchers)[number]]
  | ["content writer", (typeof contentWriters)[number]]

export interface TeamMember {
  type: TeamMemberTypes
  specialization: string
  instructions: string | null
  analysisStyle: AnalysisStyles
}

export interface TeamSelectorProps {
  title: string
  members: readonly string[]
  images: readonly string[]
  type: TeamMemberTypes
  activeMember: [TeamMemberTypes, string]
  setActiveMember: (member: ActiveMember) => void
  team: TeamMember[]
}

export interface TeamMemberAvatarProps {
  src: string
  alt: string
  isActive?: boolean
  isInTeam?: boolean
  onClick?: () => void
  variant?: "available" | "chosen"
}

export type ProposalSectionItemProps = {
  item: ProposalSection
  index: number
  isEditing: boolean
  editTitle: string
  editSubsections: ProposalSubsection[]
  setEditTitle: (v: string) => void
  setEditSubsections: (v: ProposalSubsection[]) => void
  onSave: () => void
  onCancel: () => void
  onEdit: () => void
  onDelete: () => void
}

export type ProposalLoadingAnimationProps = {
  isAnimating: boolean
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  lengthCondition: number
  updateOption: (key: string, value: any) => void
  setVisibleSections: React.Dispatch<React.SetStateAction<number>>
  defaultSections: ProposalSection[]
}
