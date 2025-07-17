import { DocumentActionProps } from "./types"
import Tooltip from "@/components/ui/Tooltip/Tooltip"

const DocumentActions: React.FC<DocumentActionProps> = ({ data }) => {
  return (
    data &&
    data.map((item, index) => (
      <Tooltip
        key={index}
        icon={item.icon}
        text={item.tooltiptext}
        className={item.className}
        disabled={item.disabled}
        onClick={item.onClick}
      />
    ))
  )
}

export default DocumentActions
