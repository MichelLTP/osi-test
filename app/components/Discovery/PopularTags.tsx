import React from "react"
import { Controller, useForm } from "react-hook-form"
import { Option } from "@/components/ui/MultipleSelector/types"
import MultipleSelector from "@/components/ui/MultipleSelector/MultipleSelector"

const PopularTags = ({
  setSelectedTags,
  options,
  selectedTags,
}: {
  setSelectedTags: (value: Option[]) => void
  options: Option[]
  selectedTags: Option[]
}) => {
  const { control } = useForm()

  const handleTagClick = (values: Option[]) => {
    setSelectedTags(
      values?.map((tag: Option) => ({ label: tag.label, value: tag.value }))
    )
  }

  return (
    <Controller
      name={"tags"}
      control={control}
      defaultValue={[]}
      render={({ field: controllerField }) => {
        return (
          <MultipleSelector
            options={options}
            hidePlaceholderWhenSelected
            placeholder="Search for tags"
            value={selectedTags || controllerField.value}
            onChange={(value) => {
              handleTagClick(value)
              controllerField.onChange(value)
            }}
            className="bg-third dark:bg-zinc-600/25 dark:text-white"
            badgeClassName={
              "bg-[#97A6BB] dark:bg-[#7a8eaa] hover:shadow-md hover:bg-[#7a8eaa] dark:hover:bg-[#97A6BB] transition-colors cursor-pointer tracking-wide font-normal rounded-xs text-white capitalize"
            }
          />
        )
      }}
    />
  )
}
export default PopularTags
