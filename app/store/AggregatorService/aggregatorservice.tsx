import {
  FinalResult,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"
import { create } from "zustand"

export interface MetaAnalysis {
  title: string
  prompt: string
}

export interface Topic {
  id?: string
  title: string
  prompt: string
  meta_analysis?: MetaAnalysis
  metaAnalysis?: MetaAnalysis
}

export interface AggregatorData {
  type: string
  topics: Topic[]
  meta_analysis: MetaAnalysis | null
}

export interface TopicMetaAnalysis {
  uuid: string
  title: string
  prompt: string
  topic_title: string
}

export interface DisplayTopic {
  uuid: string
  title: string
  prompt: string
  response_uuid: string
}

export interface DisplayDocument {
  filename: string
  id: string
  topics: DisplayTopic[]
}

export interface DisplayMetaAnalysis {
  topic_meta_analysis: TopicMetaAnalysis[]
  overall_meta_analysis: {
    uuid: string
    title: string
    prompt: string
  }
}

export interface DisplayData {
  documents: DisplayDocument[]
  meta_analysis: DisplayMetaAnalysis
}

interface AggServiceState {
  aggId: string
  data: AggregatorData
  display: DisplayData
  result: FinalResult[]
  setData: (data: AggregatorData) => void
  setDisplay: (displayData: DisplayData) => void
  setResults: (newResults: FinalResult[]) => void
  setAggId: (aggId: string) => void
  resetData: () => void
  resetDisplay: () => void
  addTopic: (topic: Topic) => void
  removeTopic: (topicIndex: number) => void
  updateTopicField: (
    topicIndex: number,
    field: "title" | "prompt",
    value: string
  ) => void
  addOutputSectionResponse: (
    uuid: string,
    newResponse: OutputSectionResponse,
    hash_id?: string
  ) => void

  updateOutputSectionResponse: (
    finalResultUuid: string,
    index: number,
    newResponse: OutputSectionResponse
  ) => void
  updateTopicMetaAnalysis: (
    topicIndex: number,
    metaAnalysis: MetaAnalysis
  ) => void
  deleteTopicMetaAnalysis: (topicIndex: number) => void
  updateMetaAnalysis: (metaAnalysis: MetaAnalysis) => void
}

const initialData: AggregatorData = {
  type: "Aggregation",
  topics: [
    {
      id: "1",
      title: "",
      prompt: "",
    },
  ],
  meta_analysis: null,
}

const initialDisplay: DisplayData = {
  documents: [],
  meta_analysis: {
    topic_meta_analysis: [],
    overall_meta_analysis: {
      uuid: "",
      title: "",
      prompt: "",
    },
  },
}

const useAggServiceStore = create<AggServiceState>()((set) => ({
  aggId: "",
  data: initialData,
  display: initialDisplay,
  result: [],
  setData: (data) => set({ data }),
  setDisplay: (displayData: DisplayData) => set({ display: displayData }),
  setResults: (newResults: FinalResult[]) => set({ result: newResults }),
  setAggId: (aggId: string) => set({ aggId }),
  resetData: () => set({ data: initialData }),

  resetDisplay: () => set({ display: initialDisplay }),

  addTopic: (topic) =>
    set((state) => ({
      data: {
        ...state.data,
        topics: [...state.data.topics, topic],
      },
    })),

  removeTopic: (topicId) =>
    set((state) => {
      const topicPosition = state.data.topics.findIndex(
        (topic) => topic.id === topicId.toString()
      )

      if (topicPosition === -1) return state

      const updatedTopics = [...state.data.topics]
      updatedTopics.splice(topicPosition, 1)

      return {
        data: {
          ...state.data,
          topics: updatedTopics,
        },
      }
    }),

  updateTopicField: (topicId, field, value) =>
    set((state) => {
      const topicPosition = state.data.topics.findIndex(
        (topic) => topic.id === topicId.toString()
      )

      if (topicPosition === -1) return state

      const currentTopics = [...state.data.topics]

      currentTopics[topicPosition] = {
        ...currentTopics[topicPosition],
        [field]: value,
      }

      return {
        data: {
          ...state.data,
          topics: currentTopics,
        },
      }
    }),

  updateTopicMetaAnalysis: (topicIndex, metaAnalysis) =>
    set((state) => {
      const updatedTopics = [...state.data.topics]

      const topicPosition = updatedTopics.findIndex(
        (topic) => topic.id === topicIndex.toString()
      )

      if (topicPosition === -1) return state

      updatedTopics[topicPosition] = {
        ...updatedTopics[topicPosition],
        meta_analysis: metaAnalysis,
      }

      return {
        data: {
          ...state.data,
          topics: updatedTopics,
        },
      }
    }),

  deleteTopicMetaAnalysis: (topicId) =>
    set((state) => {
      const topicPosition = state.data.topics.findIndex(
        (topic) => topic.id === topicId.toString()
      )

      if (topicPosition === -1) return state

      const currentTopics = [...state.data.topics]

      const { meta_analysis, ...topicWithoutMeta } =
        currentTopics[topicPosition]

      currentTopics[topicPosition] = topicWithoutMeta

      return {
        data: {
          ...state.data,
          topics: currentTopics,
        },
      }
    }),

  updateMetaAnalysis: (metaAnalysis) =>
    set((state) => ({
      data: {
        ...state.data,
        meta_analysis: metaAnalysis,
      },
    })),

  addOutputSectionResponse: (finalResultUuid, newResponse, hash_id) =>
    set((state) => ({
      result: state.result.map((finalResult) => {
        if (finalResult.uuid === finalResultUuid) {
          // Remove any existing responses of type "Status"
          const filteredContent = finalResult.content.filter(
            (item) => item.type !== "Status"
          )
          return {
            ...finalResult,
            content: [...filteredContent, newResponse],
            ...(hash_id ? { hash_id } : {}),
          }
        }
        return finalResult
      }),
    })),

  updateOutputSectionResponse: (finalResultUuid, index, newResponse) =>
    set((state) => ({
      result: state.result.map((finalResult) => {
        if (finalResult.uuid === finalResultUuid) {
          const updatedContent = [...finalResult.content]
          if (index >= 0 && index < updatedContent.length) {
            updatedContent[index] = newResponse
          } else {
            console.warn(
              `Index ${index} is out of bounds for finalResult with uuid ${finalResultUuid}.`
            )
          }
          return {
            ...finalResult,
            content: updatedContent,
          }
        }
        return finalResult
      }),
    })),
}))

export default useAggServiceStore
