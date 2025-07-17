import {
  FinalResult,
  OutputSectionResponse,
} from "@/components/LitePaper/Output/types"
import { AggregatorData } from "@/store/AggregatorService/aggregatorservice"
import TextOutput from "@/components/LitePaper/OutputHandler/TextOutput/TextOutput"
import ChartOutput from "@/components/LitePaper/OutputHandler/ChartOutput/ChartOutput"
import CodeOutput from "@/components/LitePaper/OutputHandler/CodeOutput/CodeOutput"
import TableOutput from "@/components/LitePaper/OutputHandler/TableOutput/TableOutput"
import { TableData } from "@/components/ui/DynamicDataTable/types"
import LoadingStatus from "@/components/Shared/LoadingStatus/LoadingStatus"
import { AllDocuments } from "@/store/localDB"

/**
 * Checks if db_documents is empty or if the subsections title is empty or
 * if meta_analysis title or prompt is empty.
 *
 * @param {Object} data - The data object to check
 * @returns {boolean} - Returns true if any of the checked fields are empty
 */
export function checkEmptyFields(data: AggregatorData, allDocs: AllDocuments) {
  if (!data || !data.topics) {
    return true
  }

  const topics = data.topics

  if (
    topics.length === 0 ||
    topics[0]?.title === "" ||
    topics[0]?.prompt === ""
  ) {
    return true
  }

  const hasOpenSIDocs =
    Array.isArray(allDocs.opensi_documents) &&
    allDocs.opensi_documents.length > 0
  const hasPrivateDocs =
    Array.isArray(allDocs.private_documents) &&
    allDocs.private_documents.length > 0

  if (!hasOpenSIDocs && !hasPrivateDocs) {
    return true
  }

  return false
}

/**
 * Finds the matching result content for a given UUID
 *
 * @param {string} uuid - The UUID to search for
 * @param {FinalResult[]} result - The array of FinalResult objects to search in
 * @returns {Object|null} - Returns the matching content object or null if not found
 */
export function findMatchingContent(uuid: string, result: FinalResult[]) {
  if (!result || !Array.isArray(result)) return null

  // Find the result item that matches the UUID
  const matchingResult = result.find((item) => item.uuid === uuid)

  // If there's a match and it has content
  if (
    matchingResult &&
    matchingResult.content &&
    Array.isArray(matchingResult.content) &&
    matchingResult.content.length > 0 &&
    matchingResult.content[0].result
  ) {
    return matchingResult.content[0]
  }

  return null
}

/**
 * Renders the output handler based on the response type
 *
 * @param {Object} response - The response object to render
 * @returns {JSX.Element} - The rendered output component
 */

export function renderOutputHandler(
  response: OutputSectionResponse,
  handleSave?: (content: OutputSectionResponse, docValue: string) => void
) {
  if (response.completed === false) {
    return <LoadingStatus statusMessage={{ body: response.result as string }} />
  }

  switch (response.type) {
    case "Table":
      return (
        <TableOutput
          tableData={{ type: "Table", body: response?.result } as TableData}
        />
      )
    case "Plotly":
      return (
        <ChartOutput
          content={{ type: "chart", chartData: { body: response.result } }}
        />
      )
    case "code":
      return <CodeOutput content={response} />
    default:
      return <TextOutput content={response} handleSave={handleSave} />
  }
}
