import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const DiscoverySectionHeading = ({
  title,
  icon,
  textClasses = "",
}: {
  title: string
  icon: IconDefinition
  textClasses?: string
}) => {
  return (
    <header className="flex gap-2 items-center mb-4 antialiased">
      <FontAwesomeIcon
        icon={icon}
        size="xs"
        className="text-secondary dark:text-white"
        style={{ minWidth: 15, minHeight: 15 }}
      />
      <span
        className={`text-secondary dark:text-white text-basebold ${textClasses}`}
      >
        {title}
      </span>
    </header>
  )
}

export default DiscoverySectionHeading
