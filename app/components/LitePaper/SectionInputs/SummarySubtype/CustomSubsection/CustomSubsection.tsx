import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Input } from "@/components/ui/Input/Input"
import TextArea from "@/components/ui/TextArea/TextArea"
import { CustomSubsectionProps } from "@/components/LitePaper/SectionInputs/SummarySubtype/CustomSubsection/types"
import { Button } from "@/components/ui/Button/Button"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"

const CustomSubsection = ({
  isCustomSubsection,
  section,
  index,
  length,
}: CustomSubsectionProps) => {
  const isLastSubsection = index === length - 1

  return (
    <AnimatePresence>
      {isCustomSubsection && (
        <motion.div
          className={"bg-secondary/5 dark:bg-primary-dark/50 p-4 rounded-xs"}
          layout="position"
          initial={{ y: 100, transformOrigin: "top", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            y: 100,
            opacity: 0,
            transition: { ease: "easeOut", duration: 0.3 },
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 40,
            duration: 0.1,
          }}
        >
          <label htmlFor={`custom-subsection-${index}-${section?.id}-title`}>
            Subsection Name {index + 1}
          </label>
          <Input
            id={`section-${section?.id}-title`}
            defaultValue={section?.title || "New Section"}
            name={`section-${section?.id}-title`}
            className="bg-white dark:bg-opacity-5 dark:text-white h-11 rounded-xs input-focus border mt-2 mb-4"
            type="text"
          />
          <label
            htmlFor={`custom-subsection-${index}-section-${section?.id}-title`}
          >
            Subsection Description {index + 1}
          </label>
          <TextArea
            id={`section-${section?.id}-document-prompt`}
            name={`section-${section?.id}-document-prompt`}
            rows="4"
            placeholder="Enter a question or request information about your document"
            className="mt-3 rounded-xs bg-white dark:bg-[#484954] dark:text-white"
          />
          <section className="flex items-center justify-end">
            {isLastSubsection && (
              <Button
                className="text-primary dark:text-primary dark:hover:text-primary hover:underline"
                variant="ghost"
                icon={faPlus}
              >
                Add Subsection
              </Button>
            )}
            {length > 1 && (
              <Button
                className="text-error hover:text-error dark:text-error dark:hover:text-error hover:underline"
                variant="ghost"
                icon={faMinus}
              >
                Delete
              </Button>
            )}
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default CustomSubsection
