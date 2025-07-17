import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"
import { Button } from "@/components/ui/Button/Button"
import { Input } from "@/components/ui/Input/Input"
import { Label } from "@/components/ui/Label/Label"
import useAggServiceStore, {
  Topic,
} from "@/store/AggregatorService/aggregatorservice"

const TopicRender = () => {
  const [collapsed, setCollapsed] = useState<string>("1")
  const {
    data,
    updateTopicField,
    removeTopic,
    updateTopicMetaAnalysis,
    addTopic,
    deleteTopicMetaAnalysis,
  } = useAggServiceStore()

  // Add a new topic
  const handleAddTopic = () => {
    // Find the highest existing ID
    const maxId = data.topics.reduce((max, topic) => {
      const topicId = parseInt(topic.id || "0")
      return topicId > max ? topicId : max
    }, 0)

    const newTopic: Topic = {
      id: (maxId + 1).toString(),
      title: "",
      prompt: "",
    }

    setCollapsed(newTopic.id || "0")
    addTopic(newTopic)
  }

  // Delete a topic
  const handleDeleteTopic = (topicId: number) => {
    const updatedTopics = data.topics.filter(
      (topic) => Number(topic.id) !== topicId
    )
    if (Number(collapsed) === topicId && updatedTopics.length > 0) {
      setCollapsed("0")
    }
    removeTopic(topicId)
  }

  // Update topic fields
  const handleUpdateTopic = (
    topicId: number,
    field: "title" | "prompt",
    value: string
  ) => {
    // we have to remove -1 from topicId because the index starts from 0
    updateTopicField(topicId, field, value)
  }

  // Add a meta-analysis to a specific topic
  const handleAddMetaAnalysis = (topicId: number) => {
    updateTopicMetaAnalysis(topicId, {
      title: "",
      prompt: "",
    })
  }

  // Delete meta-analysis from a topic
  const handleDeleteMetaAnalysis = (topicId: number) => {
    deleteTopicMetaAnalysis(topicId)
  }

  // Update meta-analysis fields
  const handleUpdateMetaAnalysis = (
    topicId: number,
    field: "title" | "prompt",
    value: string
  ) => {
    const updatedTopics = [...data.topics]
    const topicPosition = updatedTopics.findIndex(
      (topic) => topic.id === topicId.toString()
    )
    const topic = data.topics[topicPosition]
    if (topicPosition === -1) return

    if (topic) {
      const currentMetaAnalysis = topic.meta_analysis || {
        title: "",
        prompt: "",
      }
      updateTopicMetaAnalysis(topicId, {
        ...currentMetaAnalysis,
        [field]: value,
      })
    } else {
      const currentMetaAnalysis = {
        title: "",
        prompt: "",
      }
      updateTopicMetaAnalysis(topicId, {
        ...currentMetaAnalysis,
        [field]: value,
      })
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-10 mb-8 border-b border-secondary border-opacity-60 dark:border-third-dark">
      <Accordion
        type="multiple"
        variant="expandLastOnly"
        className="w-full h-full"
      >
        {data.topics?.map((topic, index) => (
          <AccordionItem
            key={topic.id}
            value={topic.id || "1"}
            isLastItem={index === data.topics.length - 1}
            className="border-none"
          >
            <AccordionTrigger>
              <h5 className="text-basebold text-left w-full lg:max-w-[822px] text-black dark:text-white">
                Topic {index + 1}
              </h5>
            </AccordionTrigger>
            <AccordionContent
              variant="litePaper section"
              className="h-full w-full "
            >
              <div className="w-full h-full bg-third rounded-[10px] p-[15px] mb-4 dark:bg-secondary-dark ">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-2">
                    <Label className="text-base">Title*</Label>
                    <Input
                      className="w-full focus:outline-none bg-white dark:border dark:bg-secondary-dark "
                      value={topic.title || ""}
                      placeholder="Topic"
                      required
                      onChange={(e) =>
                        handleUpdateTopic(
                          Number(topic.id),
                          "title",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="flex flex-col col-span-2 gap-2">
                    <Label className="text-base">Prompt*</Label>
                    <Input
                      required
                      placeholder="Enter a question"
                      className="w-full bg-white focus:outline-none dark:border dark:bg-secondary-dark"
                      value={topic.prompt || ""}
                      onChange={(e) =>
                        handleUpdateTopic(
                          Number(topic.id),
                          "prompt",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {topic.meta_analysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                    <div className="flex flex-col gap-2">
                      <Label className="text-base">Meta-Analysis Title</Label>
                      <Input
                        className="w-full bg-white focus:outline-none dark:border dark:bg-secondary-dark"
                        value={topic.meta_analysis.title}
                        placeholder="Title"
                        onChange={(e) =>
                          handleUpdateMetaAnalysis(
                            Number(topic.id),
                            "title",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col col-span-2 gap-2">
                      <Label className="text-base">Meta-Analysis Prompt</Label>
                      <Input
                        placeholder="Enter a question "
                        className="w-full bg-white focus:outline-none dark:border dark:bg-secondary-dark"
                        value={topic.meta_analysis.prompt}
                        onChange={(e) =>
                          handleUpdateMetaAnalysis(
                            Number(topic.id),
                            "prompt",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                {topic.meta_analysis && (
                  <div className="flex justify-end mt-[15px]">
                    <Button
                      variant="underline"
                      className="text-error"
                      onClick={() => handleDeleteMetaAnalysis(Number(topic.id))}
                    >
                      - Delete Meta-Analysis
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-8">
                <Button variant="underline" onClick={() => handleAddTopic()}>
                  + Add topic
                </Button>
                {!topic.meta_analysis && (
                  <Button
                    variant="underline"
                    onClick={() => handleAddMetaAnalysis(Number(topic.id))}
                  >
                    + Add Meta-Analysis
                  </Button>
                )}
                {data.topics.length > 1 && (
                  <Button
                    variant="underline"
                    className="text-error"
                    onClick={() => handleDeleteTopic(Number(topic.id))}
                  >
                    - Delete topic
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default TopicRender
