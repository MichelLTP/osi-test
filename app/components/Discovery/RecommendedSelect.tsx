import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select"

const RecommendedSelect = () => {
  const options = [
    { value: "recommended", label: "Recommended Only" },
    { value: "favorites", label: "Favorites" },
    { value: "all", label: "All Stories" },
  ]

  return (
    <Select defaultValue={"recommended"}>
      <SelectTrigger className="rounded-sm sm:max-w-[210px] bg-third sm:bg-white text-sm dark:bg-secondary-dark dark:text-white">
        <SelectValue placeholder="Story Filter" />
      </SelectTrigger>
      <SelectContent className="rounded-sm shadow-md border border-input bg-white dark:bg-secondary-dark dark:text-white">
        {options.map((option) => (
          <SelectItem
            value={option.value}
            className="hover:bg-[#97A6BB] transition-colors rounded-xs"
            key={crypto.randomUUID()}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default RecommendedSelect
