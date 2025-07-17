import React from "react"
import { faBinoculars } from "@fortawesome/free-solid-svg-icons/faBinoculars"
import {
  faComment,
  faLayerGroup,
  faDownload,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons"
import DocumentActions from "@/components/Shared/DocumentActions/DocumentActions"
import { ActionItem } from "@/components/Shared/DocumentActions/types"
import { SearchSpaceActionsProps } from "@/components/SearchSpaces/SearchSpaceActions/types"
import { toast } from "@/hooks/useToast"
import { useNavigate } from "@remix-run/react"
import { useFiltersStore } from "@/store/filters"
import useLocalDBFilesStore from "@/store/localDB"
import { usePreDefinedPrompt, useRouterID } from "@/store/chatsi"
import useIsMobile from "@/hooks/useIsMobile"

const SearchSpaceActions: React.FC<SearchSpaceActionsProps> = ({
  hideInsightButton = false,
  searchSpaceId,
  docs,
  onDelete,
}) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile(690)
  const {
    setFilters,
    setIsFiltersSelected,
    setPreventFiltersReset,
    emptyFilters,
  } = useFiltersStore()
  const { addOpensiDocument, setPreventDocsReset } = useLocalDBFilesStore()
  const { setRouterID } = useRouterID()
  const { SetPreDefinedPrompt } = usePreDefinedPrompt()

  const handleSpaceInsights = () => {
    navigate("/searchSpaces/insights/" + searchSpaceId)
  }

  const handleChatWithSpace = () => {
    setRouterID("docs")
    SetPreDefinedPrompt("")
    setPreventFiltersReset(true)
    setFilters({
      ...emptyFilters,
      document_title: docs?.doc_names || [],
    })
    navigate("/chatSi")
    toast({
      title: `Space documents added to filters`,
      description: `You can now chat with the space documents.`,
      variant: "success",
    })
    setIsFiltersSelected(true)
  }

  const handleAddToAggregator = () => {
    setPreventDocsReset(true)
    docs?.doc_ids?.forEach((doc, index) => {
      addOpensiDocument({
        id: doc,
        filename: docs?.doc_names[index],
      })
    })
    navigate("/documentTools/aggService")
    toast({
      title: `Space documents added to Aggregator`,
      description: `You can now use the Aggregator with your space documents.`,
      variant: "success",
    })
    setIsFiltersSelected(true)
  }

  const actions: ActionItem[] = [
    {
      icon: faBinoculars,
      tooltiptext: "Space Insights",
      onClick: handleSpaceInsights,
      disabled: docs && docs?.doc_ids?.length === 0,
    },
    {
      icon: faComment,
      tooltiptext: "Chat with Space",
      onClick: handleChatWithSpace,
      disabled: docs && docs?.doc_ids?.length === 0,
    },
    {
      icon: faLayerGroup,
      tooltiptext: "Add Space to Aggregator",
      onClick: handleAddToAggregator,
      disabled: (docs && docs?.doc_ids?.length === 0) || isMobile,
    },
    {
      icon: faDownload,
      tooltiptext: "Download Space",
      disabled: true,
    },
    {
      icon: faTrashCan,
      tooltiptext: "Delete Space",
      onClick: () => {
        if (onDelete) {
          onDelete()
        }
      },
      disabled: !onDelete,
    },
  ]

  const filteredActions = hideInsightButton
    ? actions.filter((a) => a.tooltiptext !== "Space Insights")
    : actions

  return (
    <nav>
      <DocumentActions data={filteredActions} />
    </nav>
  )
}

export default SearchSpaceActions
