import { useCallback, useEffect, useState } from "react"
import { ScenarioBubbleResponse } from "@/components/OMM/types"
import { useToast } from "@/hooks/useToast"
import { useScenarioTableStore } from "@/store/omm"
import { useFetcher, useLocation, useNavigate } from "@remix-run/react"
import { SetURLSearchParams } from "react-router-dom"

const useOmmScenarioManager = ({
  bubbles,
  setSearchParams,
}: {
  bubbles: ScenarioBubbleResponse | null
  setSearchParams: SetURLSearchParams
}) => {
  const { toast, dismiss } = useToast()
  const {
    scenarioData,
    resetData,
    handleScenarioSelection,
    handleScenarioStatus,
  } = useScenarioTableStore()
  const fetcher = useFetcher()
  const [scenarioName, setScenarioName] = useState<string>("")
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean
    action: "reset" | "delete" | "delete-bubble" | null
    extraInfo?: null | any
  }>({ open: false, action: null, extraInfo: null })

  const showToast = useCallback(
    (type: "error" | "success" | "loading", action: string) => {
      toast({
        title:
          type === "success"
            ? "Success"
            : type === "error"
              ? "Error"
              : type === "loading" && action === "generation"
                ? "Scenario Generation"
                : "Loading...",
        description: `Scenario ${action} ${
          type === "success"
            ? "successfully"
            : type === "error"
              ? "failed"
              : "in progress"
        }`,
        variant: type === "loading" ? "warning" : type,
        open: action === "generation",
        onOpenChange: (open) => {
          if (!open) dismiss()
        },
      })
    },
    [toast]
  )

  const handleScenarioGeneration = useCallback(() => {
    const scenarioId = scenarioData?.scenario_id
    try {
      fetcher.submit(
        {
          intent: "generate",
          scenarioId: JSON.stringify(scenarioId),
        },
        { method: "post" }
      )
      showToast("loading", "generation")
    } catch {
      showToast("error", "generation")
    }
  }, [fetcher, scenarioData, showToast, setSearchParams])

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      fetcher.data?.intent === "generate"
    ) {
      setSearchParams((prev) => {
        prev.set("generated", "true")
        return prev
      })
    }
  }, [fetcher.state])

  const duplicateScenarioChanges = useCallback(() => {
    try {
      fetcher.submit(
        { "scenario-id": scenarioData.scenario_id, intent: "duplicate" },
        { method: "post" }
      )
      showToast("loading", "duplication")
    } catch {
      showToast("error", "duplication")
    }
  }, [fetcher, scenarioData, showToast])

  const removeSpecificChanges = useCallback(
    (changeId: number | null) => {
      if (!changeId) return

      try {
        fetcher.submit(
          { "scenario-change-id": changeId, intent: "removeBubble" },
          { method: "delete" }
        )
        setConfirmationModal({
          open: false,
          action: "delete-bubble",
          extraInfo: null,
        })
        showToast("loading", "change deletion")
      } catch {
        showToast("error", "change deletion")
      }
    },
    [fetcher, scenarioData, showToast]
  )

  const saveScenarioChanges = useCallback(() => {
    try {
      fetcher.submit(
        { intent: "save", data: JSON.stringify(scenarioData) },
        { method: "post" }
      )
      showToast("loading", "saving")
    } catch {
      showToast("error", "saving")
    }
  }, [fetcher, scenarioData, showToast])

  const removeScenarioChanges = useCallback(
    (type: "delete" | "reset") => {
      try {
        fetcher.submit(
          { "scenario-id": scenarioData.scenario_id, intent: type },
          { method: "post" }
        )
        const scenarioInfo = {
          scenario_id: scenarioData.scenario_id,
          scenario_name: scenarioName,
        }
        resetData()
        if (type === "delete") {
          setScenarioName("")
          setSearchParams((prev) => {
            prev.delete("scenario-id")
            return prev
          })
        } else if (type === "reset") {
          handleScenarioSelection(
            scenarioInfo.scenario_id,
            scenarioInfo.scenario_name
          )
        }
        setConfirmationModal({ open: false, action: null, extraInfo: null })
        showToast("loading", type === "delete" ? "deletion" : "reset")
      } catch {
        showToast("error", type === "delete" ? "deletion" : "reset")
      }
    },
    [
      fetcher,
      scenarioData,
      resetData,
      handleScenarioSelection,
      scenarioName,
      setSearchParams,
      showToast,
    ]
  )

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      [
        "reset",
        "delete",
        "removeBubble",
        "save",
        "duplicate",
        "generate",
      ].includes(fetcher.data?.intent) &&
      fetcher.data?.status?.toString() === "200"
    ) {
      const actionMap: Record<string, string> = {
        reset: "was reset",
        delete: "deleted",
        removeBubble: "bubble removed",
        save: "saved",
        duplicate: "duplicated",
        generate: "generated",
      }
      showToast("success", actionMap[fetcher.data.intent])
    }
  }, [fetcher.state])

  useEffect(() => {
    if (scenarioData?.scenario_name) setScenarioName(scenarioData.scenario_name)
  }, [scenarioData])

  useEffect(() => {
    if (!scenarioData?.scenario_name && bubbles?.scenario_name)
      setScenarioName(bubbles.scenario_name)
    if (bubbles?.status) {
      handleScenarioStatus(bubbles.status)
    } else {
      handleScenarioStatus("Empty")
    }
  }, [bubbles])

  return {
    scenarioName,
    setScenarioName,
    confirmationModal,
    removeSpecificChanges,
    setConfirmationModal,
    handleScenarioGeneration,
    duplicateScenarioChanges,
    saveScenarioChanges,
    removeScenarioChanges,
  }
}

export default useOmmScenarioManager
