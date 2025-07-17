import { useEffect, useState } from "react"
import { SectionInputProps } from "@/components/LitePaper/SectionInputs/types"
import { SectionObj, SubsectionsSection } from "@/components/LitePaper/types"
import StructuredType from "./StructuredType/StructuredType"
import ChatSiSubtype from "@/components/LitePaper/SectionInputs/ChatSiSubtype/ChatSiSubtype"
import CustomTextType from "./CustomTextType/CustomTextType"
import ChatGPTType from "./ChatGPTType/ChatGPTType"
import NewSection from "../NewSection/NewSection"
import WikipediaType from "./Wikipedia/Wikipedia"
import WebSearchType from "./WebSearchType/WebSearchType"

const SectionInput = ({
  section,
  type,
  subtype,
  expandedSections,
  inputsUuid = "",
}: SectionInputProps) => {
  const [expandedSubsections, setExpandedSubsection] = useState<string[]>([])

  let allSubsections: SectionObj[] = []

  useEffect(() => {
    if (allSubsections.length > 0) {
      setExpandedSubsection(allSubsections.map((sub) => sub.uuid))
    }
  }, [expandedSections])

  if (type === "Documents") {
    switch (subtype) {
      // case "Docs":
      //   return <DocSubtype section={section} inputsUuid={inputsUuid} />
      // case "Summary":
      //   return <SummarySubtype section={section} />
      case "Chat SI":
        return <ChatSiSubtype section={section} inputsUuid={inputsUuid} />
      default:
        return <></>
    }
  } else if (type === "Data" && subtype) {
    return <StructuredType section={section} inputsUuid={inputsUuid} />
  } else if (type === "Custom Text") {
    return <CustomTextType section={section} inputsUuid={inputsUuid} />
  } else if (type === "APIs") {
    switch (subtype) {
      case "ChatGPT":
        return <ChatGPTType section={section} inputsUuid={inputsUuid} />
      case "Web Search":
        return <WebSearchType section={section} inputsUuid={inputsUuid} />
      case "Wikipedia":
        return <WikipediaType section={section} inputsUuid={inputsUuid} />
      default:
        return <></>
    }
  } else if (type === "Subsections") {
    const subsectionContent = section as SubsectionsSection
    const subsections = subsectionContent.subsections
    if (!subsections || subsections.length === 0) {
      return <></>
    }

    allSubsections = [...subsections]

    return subsections.map((subsection: SectionObj, index: number) => (
      <NewSection
        key={subsection.uuid}
        section={subsection}
        InputsUuid={section.uuid}
        setExpandedSections={setExpandedSubsection}
        expandedSections={expandedSubsections}
        isSubsection={true}
        subsectionIndex={index}
      />
    ))
  }
  return <></>
}

//TODO: Check ErrorBoundary component when any of the types are invalid

export default SectionInput
