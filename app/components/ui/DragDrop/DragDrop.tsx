import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { StyledCheckbox } from "../Checkbox/Checkbox"
import { useSources } from "@/store/openstory"
import { Source } from "@/components/OpenStory/SelectedSource/types"

export function DragDrop() {
  const { sources, setSources } = useSources()
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    source: Source
  ) => {
    e.dataTransfer.setData("text/plain", source.id.toString())
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    const draggedItemId = e.dataTransfer.getData("text/plain")
    const draggedItem = sources.find(
      (source) => source.id === parseInt(draggedItemId)
    )
    if (!draggedItem) return

    const updatedItems = [...sources]
    updatedItems.splice(sources.indexOf(draggedItem), 1)
    updatedItems.splice(index, 0, draggedItem)
    setSources(updatedItems)
  }

  const handleCheckbox = (source: Source) => {
    // set selected value from sources to true or false based on checkbox
    source.selected = !source.selected
    setSources([...sources])
  }

  return (
    <div className="flex flex-col gap-2">
      {sources.map((source, index) => (
        <div
          key={source.id}
          onDragStart={(e) => handleDragStart(e, source)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          draggable
        >
          <div className="flex items-center gap-5 sources-center bg-third dark:bg-transparent dark:text-white rounded-[12px] p-4">
            <FontAwesomeIcon className="cursor-grab" icon={faBars} />
            <StyledCheckbox
              className="text-primary data-[state=checked]:bg-transparent"
              checked={source.selected}
              onClick={() => handleCheckbox(source)}
            />
            {source.description}
          </div>
        </div>
      ))}
    </div>
  )
}
