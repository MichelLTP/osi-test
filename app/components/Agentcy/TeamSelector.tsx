import TeamMemberAvatar from "@/components/Agentcy/TeamMemberAvatar"
import { TeamSelectorProps, ActiveMember } from "@/components/Agentcy/types"
import React from "react"

const TeamSelector: React.FC<TeamSelectorProps> = ({
  title,
  members,
  images,
  type,
  activeMember,
  setActiveMember,
  team,
}) => (
  <div className="flex-1">
    <h2 className="text-xlbold mb-2">{title}</h2>
    <ul className="grid grid-cols-4 xs:grid-cols-2 gap-4">
      {members.map((member, i) => {
        const isActive = activeMember[0] === type && activeMember[1] === member
        const isInTeam = team.some(
          (t) => t.type === type && t.specialization === member
        )

        return (
          <TeamMemberAvatar
            key={`${type}-${i}`}
            src={images[i]}
            alt={member}
            isActive={isActive}
            isInTeam={isInTeam}
            onClick={() => {
              if (!isInTeam) setActiveMember([type, member] as ActiveMember)
            }}
            variant="available"
          />
        )
      })}
    </ul>
  </div>
)

export default TeamSelector
