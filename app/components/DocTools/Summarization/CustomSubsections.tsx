import { Button } from "@/components/ui/Button/Button"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { CustomSubsectionsProps } from "./types"
import { Input } from "@/components/ui/Input/Input"

export default function CustomSubsections({
  subsections,
  onSubsectionsChange,
}: CustomSubsectionsProps) {
  const addSubsection = () => {
    onSubsectionsChange([...subsections, { name: "", description: "" }])
  }

  const removeSubsection = () => {
    if (subsections.length > 1) {
      onSubsectionsChange(subsections.slice(0, -1))
    }
  }

  const updateSubsection = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const updatedSubsections = subsections.map((subsection, i) =>
      i === index ? { ...subsection, [field]: value } : subsection
    )
    onSubsectionsChange(updatedSubsections)
  }

  return (
    <div>
      {subsections.map((subsection, index) => {
        const fieldIndex = index + 1
        return (
          <div
            key={index}
            id="step-three-fields"
            className="flex gap-5 flex-wrap pt-8"
          >
            <div className="flex flex-col gap-1 min-w-[266px] sm:grow lg:grow-0">
              <label htmlFor={`subsection-name-${index}`}>
                Subsection Name {fieldIndex}
              </label>
              <Input
                className="flex items-center bg-third pl-5 rounded-xs dark:bg-secondary-dark dark:text-white outline-none text-secondary focus-within:border-primary transition-[border-color] duration-300 focus-within:border-opacity-15 focus-within:border border border-transparent"
                type="text"
                name={`subsection-name-${index}`}
                id={`subsection-name-${index}`}
                placeholder={`Subsection ${fieldIndex}`}
                value={subsection.name}
                onChange={(e) =>
                  updateSubsection(index, "name", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-1 grow">
              <label htmlFor={`subsection-description-${index}`}>
                Field description {fieldIndex}
              </label>
              <textarea
                className="flex items-center min-w-[300px] bg-third h-[65px] min-h-[65px] max-h-[200px] pl-5 pt-[12px] rounded-xs dark:bg-secondary-dark dark:text-white outline-none text-secondary focus-within:border-primary transition-[border-color] duration-300 focus-within:border-opacity-15 focus-within:border border border-transparent"
                name={`subsection-description-${index}`}
                id={`subsection-description-${index}`}
                rows={5}
                placeholder="Describe the field"
                value={subsection.description}
                onChange={(e) =>
                  updateSubsection(index, "description", e.target.value)
                }
              />
            </div>
          </div>
        )
      })}
      <div className="flex justify-end gap-5">
        {subsections.length > 1 && (
          <Button
            onClick={removeSubsection}
            className="mt-5 w-full sm:w-auto text-error dark:text-error dark:hover:text-error hover:text-error hover:underline"
            variant="ghost"
            icon={faMinus}
          >
            Remove field
          </Button>
        )}
        <Button
          onClick={addSubsection}
          className="mt-5 w-full sm:w-auto text-primary dark:text-primary dark:hover:text-primary hover:underline"
          variant="ghost"
          icon={faPlus}
        >
          Add field
        </Button>
      </div>
    </div>
  )
}
