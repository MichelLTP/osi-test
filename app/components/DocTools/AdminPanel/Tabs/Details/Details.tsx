import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/Label/Label"
import MultipleSelector from "@/components/ui/MultipleSelector/MultipleSelector"
import { Option } from "@/components/ui/MultipleSelector/types"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import { useFetcher } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Tags } from "./types"
import {
  convertFromOptions,
  convertToOptions,
} from "@/utils/documentTools/adminPanel/discovery"

const Details = () => {
  const [selectedTags, setSelectedTags] = useState<Option[]>([])
  const [tagsDB, setTagsDB] = useState<Tags[]>([])

  const fetcher = useFetcher<{ tags: Tags[] }>()
  const { duration_min, setDurationMin, addTag, tags } =
    useAdminPanelDiscoveryStore()
  useEffect(() => {
    if (tagsDB?.length === 0) {
      fetcher.load(`/documentTools/adminPanel/addDiscovery?intent=tags`)
    }

    if (tags.length !== 0 && selectedTags.length === 0) {
      setSelectedTags(convertToOptions(tags))
    }
  }, [])

  useEffect(() => {
    if (fetcher.data) {
      setTagsDB(convertToOptions(fetcher.data.tags?.data) as Tags[])
    }
  }, [fetcher.data])

  const handleTagClick = (values: Option[]) => {
    setSelectedTags(
      values?.map((tag: Option) => ({ label: tag.label, value: tag.value }))
    )

    addTag(convertFromOptions(values))
  }

  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-10 w-full ">
        <div className="flex flex-col md:flex-row gap-8">
          <div className=" flex flex-col gap-2">
            <Label>Read time (minutes)*</Label>
            <Input
              className="dark:bg-secondary-dark"
              type="number"
              value={duration_min}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </div>
          <div className=" flex flex-col gap-2 w-full">
            <Label>Tags (máx 3)*</Label>
            <MultipleSelector
              maxSelected={3}
              options={tagsDB}
              hidePlaceholderWhenSelected
              placeholder="Search for tags"
              value={selectedTags}
              onChange={handleTagClick}
              className="bg-third dark:bg-secondary-dark dark:text-white"
              badgeClassName={
                "bg-[#97A6BB] dark:bg-[#7a8eaa] hover:shadow-md hover:bg-[#7a8eaa] dark:hover:bg-[#97A6BB] transition-colors cursor-pointer tracking-wide font-normal rounded-xs text-white capitalize"
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Details
