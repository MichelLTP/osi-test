import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Button } from "@/components/ui/Button/Button"
import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/Label/Label"
import TextArea from "@/components/ui/TextArea/TextArea"
import { useEffect, useState } from "react"
import UploadImage from "../UploadImage/UploadImage"
import { useAdminPanelDiscoveryStore } from "@/store/AdminPanel/discovery"
import { MarkdownRenderer } from "@/components/Shared/MarkdownRender/MarkdownRender"

const Sections = ({ title }: { title: string }) => {
  const initialValue = `### Winston Classic KS Launch Below Concept Test
#### Top Key Insights

* Top Insight 1
* Top Insight 2
* Top Insight 3

`

  const [collapsed, setCollapsed] = useState<string>("1")
  const [showImageUpload, setShowImageUpload] = useState<number | null>(null)
  const isKeyQuestions = title === "Key Questions"

  const {
    sections,
    addSection,
    removeSection,
    updateSection,
    removeUploadImage,
    key_questions: keyQuestions,
    addKeyQuestion,
    removeKeyQuestion,
    updateKeyQuestion,
    uploadImages,
  } = useAdminPanelDiscoveryStore()

  const items = isKeyQuestions ? keyQuestions : sections
  const addItem = isKeyQuestions ? addKeyQuestion : addSection
  const removeItem = isKeyQuestions ? removeKeyQuestion : removeSection
  const updateItem = isKeyQuestions ? updateKeyQuestion : updateSection

  useEffect(() => {
    if (items.length === 0) {
      items.push({
        title: "",
        text: "",
      })
    }
  }, [])

  const handleAddItem = () => {
    addItem({
      title: "",
      text: "",
      image: null,
    })
    setCollapsed("")
  }

  const handleDeleteItem = (index: number) => {
    removeItem(index)
    if (collapsed === (index + 1).toString()) {
      setCollapsed("")
    }
  }

  const handleUpdateItem = (
    index: number,
    field: "title" | "text" | "image",
    value: string | null
  ) => {
    const currentItem = items[index]
    if (!currentItem) return

    const updatedItem = {
      ...currentItem,
      [field]: value,
    }

    updateItem(index, updatedItem)
  }

  const deleteImage = (index: number) => {
    const currentItem = items[index]
    if (!currentItem) return

    // Create clean item with only title and text
    const itemWithoutImage = {
      title: currentItem.title,
      text: currentItem.text,
    }

    // If there's an image object with matching_filename, remove it from storage
    if (currentItem.image?.matching_filename) {
      removeUploadImage(currentItem.image.matching_filename)
    }
    // Update the item with clean structure
    updateItem(index, itemWithoutImage)

    setShowImageUpload(null)
  }

  const toggleImage = (index: number) => {
    const currentItem = items[index]
    if (!currentItem) return
    if (
      showImageUpload === index ||
      currentItem.image ||
      (currentItem?.image_name !== null &&
        currentItem?.image_name !== undefined)
    ) {
      deleteImage(index)
    } else {
      setShowImageUpload(index)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Accordion
        type="single"
        collapsible
        className="w-full h-full"
        value={collapsed}
        onValueChange={(value) => setCollapsed(value)}
      >
        {items.map((item, index) => (
          <AccordionItem key={index} value={(index + 1).toString()}>
            <AccordionTrigger>
              <h5 className="text-xlbold text-left w-full lg:max-w-[822px] text-black dark:text-white">
                {item.title || `${title} ${index + 1}`}
              </h5>
            </AccordionTrigger>
            <AccordionContent className="h-full w-full bg-third rounded-[10px] p-9 dark:bg-secondary-dark">
              <div className="flex flex-col mb-14 gap-2">
                <Label>Title</Label>
                <Input
                  className="w-full bg-white dark:border dark:bg-secondary-dark"
                  value={item?.title ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateItem(index, "title", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-9">
                <div className="flex flex-col gap-8">
                  <p className="text-base border-solid border-b border-secondary dark:border-third-dark pt-3 pb-3 justify-left">
                    Provide the section content
                  </p>
                  <TextArea
                    rows="20"
                    className="rounded-xs bg-white dark:bg-secondary-dark dark:text-white"
                    value={items[index]?.text || ""}
                    placeholder={initialValue}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleUpdateItem(index, "text", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-8">
                  <p className="text-base border-solid border-b border-secondary dark:border-third-dark pt-3 pb-3 justify-left">
                    Preview in Markdown
                  </p>
                  <MarkdownRenderer
                    value={items[index]?.text || initialValue}
                  />
                </div>
              </div>

              <div>
                {(showImageUpload === index ||
                  (item?.image_name !== null &&
                    item?.image_name !== undefined) ||
                  (item?.image?.matching_filename !== null &&
                    item?.image?.matching_filename !== undefined)) && (
                  <div className="mb-4">
                    <UploadImage
                      sectionIndex={index}
                      domain={title}
                      imageName={
                        item?.image?.matching_filename ?? item?.image_name ?? ""
                      }
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  {showImageUpload === index ||
                  (item?.image_name !== null &&
                    item?.image_name !== undefined) ? (
                    <Button
                      variant="underline"
                      className="text-error"
                      onClick={() => toggleImage(index)}
                    >
                      - Delete image
                    </Button>
                  ) : (
                    <Button
                      variant="underline"
                      onClick={() => toggleImage(index)}
                    >
                      + Add image
                    </Button>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="flex justify-end gap-4">
        {items.length > 1 && (
          <Button
            variant="underline"
            className="text-error"
            onClick={() => handleDeleteItem(items.length - 1)}
          >
            - Delete {isKeyQuestions ? "question" : "section"}
          </Button>
        )}
        <Button variant="underline" onClick={handleAddItem}>
          + Add {isKeyQuestions ? "question" : "section"}
        </Button>
      </div>
    </div>
  )
}

export default Sections
