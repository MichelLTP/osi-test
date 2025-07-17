import React from "react"
import { clsx } from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { TeamMemberAvatarProps } from "@/components/Agentcy/types"

const TeamMemberAvatar: React.FC<TeamMemberAvatarProps> = ({
  src,
  alt,
  isActive = false,
  isInTeam = false,
  onClick,
  variant = "available",
}) => {
  const baseClass =
    "rounded-xs aspect-square flex items-center justify-center overflow-hidden bg-third dark:bg-secondary-dark"

  const availableClass = clsx(
    baseClass,
    "cursor-pointer",
    isInTeam && "opacity-50 pointer-events-none"
  )
  const chosenClass = clsx(
    baseClass,
    "bg-white dark:!bg-primary-dark border transition-[border] border-primary"
  )

  if (variant === "chosen") {
    return (
      <div className={chosenClass}>
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full max-w-32"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <button onClick={isInTeam ? undefined : onClick}>
      <li className={availableClass + " relative"}>
        <img src={src} alt={alt} className="object-cover z-20" />
        <AnimatePresence>
          {isActive && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary rounded-xs z-0"
            />
          )}
        </AnimatePresence>
      </li>
    </button>
  )
}

export default TeamMemberAvatar
