import { useState } from "react"
import { Feature } from "../types"
import { useTheme } from "@/utils/darkTheme/theme-provider"
import { useCloseSidebar } from "@/store/layout"

const FeatureCard: React.FC<Feature> = ({
  disabled = false,
  icon,
  title,
  description,
  hoverText,
  bgImg,
  onclick,
  actionIcon,
  hideOnMobile,
}: Feature) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [theme] = useTheme()
  const close = useCloseSidebar((state) => state.close)
  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 w-full cursor-pointer
        ${close ? "sm:w-[230px]" : "sm:grid-cols-1 lg:w-[230px]"}
            ${hideOnMobile && "hidden sm:block"}
        ${disabled ? "opacity-40 pointer-events-none" : ""}
        `}
      style={{
        backgroundImage:
          theme === "dark"
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), ${bgImg}`
            : bgImg,
        backgroundRepeat: "no-repeat",
        backgroundSize: isHovered ? "110%" : "120%",
        backgroundPosition: "0% 80%",
        transition: "background-size 1.5s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onclick && onclick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onclick && onclick()
        }
      }}
    >
      <div className="flex flex-col p-5 space-y-2">
        {/*expanded icon*/}
        {actionIcon && (
          <div
            className="flex text-[23px] ml-auto opacity-40 transition-opacity duration-300 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              actionIcon.props.icon.iconName === "plus" && onclick && onclick()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation()
              }
            }}
            role="button"
            tabIndex={0}
          >
            {actionIcon}
          </div>
        )}

        {/* Hover text that appears with animation */}
        {hoverText && (
          <div
            className={`absolute text-smbold transition-all duration-700 ${
              isHovered ? "top-4 left-6 opacity-100" : "top-14 left-6 opacity-0"
            }`}
          >
            {hoverText}
          </div>
        )}

        {/* Main content positioned at the bottom with transition */}
        <div className="flex flex-col justify-between transition-transform duration-500 ease-out">
          <div className="flex items-center mb-2">
            {icon && <div className="mr-4 text-[20px]">{icon}</div>}
            <h3 className="text-3xlbold">{title}</h3>
          </div>
          <p className="text-base transition-opacity duration-300 min-h-[46px] line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FeatureCard
