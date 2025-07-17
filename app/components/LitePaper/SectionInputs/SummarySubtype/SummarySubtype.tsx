import React, { useState } from "react"
import { SectionObj } from "@/components/LitePaper/types"
import DocumentSelection from "@/components/Shared/DocumentSelection/DocumentSelection"
import SummarizationSettings from "@/components/DocTools/Summarization/SummarizationSettings"
import { ISummarizationSettings } from "@/components/DocTools/Summarization/types"
import CustomSubsection from "@/components/LitePaper/SectionInputs/SummarySubtype/CustomSubsection/CustomSubsection"

const SummarySubtype = ({ section }: { section: SectionObj }) => {
  const [settings, setSettings] = useState<ISummarizationSettings>({
    lang: "English",
    selectedSummary: "Auto summary",
    writing_style: "",
  })

  const isCustomSubsection = settings.selectedSummary === "Custom subsections"

  return (
    <>
      <fieldset className={"col-span-2 sm:col-span-1"}>
        <DocumentSelection />
      </fieldset>
      <fieldset className={"col-span-2"}>
        <SummarizationSettings
          settings={settings}
          onSettingsChange={setSettings}
          isGreyPaper={true}
        />

        <section className={"mt-4 grid gap-4"}>
          {/* TODO: When this becomes an array, there might need to be adjustments on the props / section */}
          {/*<CustomSubsection section={section} isCustomSubsection={isCustomSubsection} index={0} length={1} />*/}

          {/* Test to see how the index / length plays out */}
          <CustomSubsection
            section={section}
            isCustomSubsection={isCustomSubsection}
            index={0}
            length={2}
          />
          <CustomSubsection
            section={section}
            isCustomSubsection={isCustomSubsection}
            index={1}
            length={2}
          />
        </section>
      </fieldset>
    </>
  )
}
export default SummarySubtype
