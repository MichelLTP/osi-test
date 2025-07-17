export async function getMenuVariables() {
  const envVar = {
    SHOW_CHAT_SI: process.env.SHOW_CHAT_SI === "true",
    SHOW_SEARCH_SI: process.env.SHOW_SEARCH_SI === "true",
    SHOW_SEARCH_SI_SEMANTIC_SEARCH:
      process.env.SHOW_SEARCH_SI_SEMANTIC_SEARCH === "true",
    SHOW_SEARCH_SI_METADATA_SEARCH:
      process.env.SHOW_SEARCH_SI_METADATA_SEARCH === "true",
    SHOW_SEARCH_SI_HYBRID_SEARCH:
      process.env.SHOW_SEARCH_SI_HYBRID_SEARCH === "true",
    SHOW_DOCUMENT_TOOLS: process.env.SHOW_DOCUMENT_TOOLS === "true",
    SHOW_DOCUMENT_TOOLS_QA: process.env.SHOW_DOCUMENT_TOOLS_QA === "true",
    SHOW_DOCUMENT_TOOLS_SUMMARIZATION:
      process.env.SHOW_DOCUMENT_TOOLS_SUMMARIZATION === "true",
    SHOW_DOCUMENT_TOOLS_OUTPUT_PARSERS:
      process.env.SHOW_DOCUMENT_TOOLS_OUTPUT_PARSERS === "true",
    SHOW_OPEN_STORY: process.env.SHOW_OPEN_STORY === "true",
    SHOW_OPEN_STORY_GRAY_PAPER:
      process.env.SHOW_OPEN_STORY_GRAY_PAPER === "true",
    SHOW_OPEN_STORY_CREW_STORY:
      process.env.SHOW_OPEN_STORY_CREW_STORY === "true",
    SHOW_DISCOVERY: process.env.SHOW_DISCOVERY === "true",
    SHOW_DOCUMENT_TOOLS_ADMIN_PANEL:
      process.env.SHOW_DOCUMENT_TOOLS_ADMIN_PANEL === "true",
    SHOW_DOCUMENT_TOOLS_AGG_SERVICE:
      process.env.SHOW_DOCUMENT_TOOLS_AGG_SERVICE === "true",
    SHOW_FORECAST: process.env.SHOW_FORECAST === "true",
    SHOW_SEARCH_SPACES: process.env.SHOW_SEARCH_SPACES === "true",
  }

  return envVar
}
