import * as React from "react"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { StyledCheckbox } from "@/components/ui/Checkbox/Checkbox"
import { GroupItemProps } from "@/components/OMM/FilterSelect/type"

const GroupItem = React.memo(
  ({
    group,
    groupOptions,
    subGroups,
    isGroupSelected,
    handleGroupClick,
    renderOption,
    renderSubGroup,
    isLastGroup,
    lastGroupRef,
  }: GroupItemProps) => {
    return (
      <AccordionItem
        key={group}
        value={group}
        ref={isLastGroup ? lastGroupRef : undefined}
      >
        <AccordionTrigger
          iconStyle="arrow"
          className={"text-sm flex space-between p-2 !text-left"}
        >
          <div
            className={`w-full pl-2 py-2 m-0 rounded-xs flex items-center justify-start gap-4 ${
              isGroupSelected ? "font-bold text-primary" : ""
            }`}
          >
            <StyledCheckbox
              className={
                "text-primary bg-white border-gray-400 border-1 data-[state=checked]:bg-white"
              }
              checked={isGroupSelected}
              onClick={handleGroupClick}
            />
            {group}
          </div>
        </AccordionTrigger>
        <AccordionContent className={"p-2 ml-2 pb-0"}>
          {subGroups.length === 0
            ? groupOptions.map(renderOption)
            : subGroups.map((subGroup) => renderSubGroup(group, subGroup))}
        </AccordionContent>
      </AccordionItem>
    )
  }
)

export default GroupItem
