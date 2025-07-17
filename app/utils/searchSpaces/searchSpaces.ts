import { FormStream, StreamSectionKey } from "@/data/searchSpaces/types"

export const mapInsightIds = (
  form: FormStream
): Record<StreamSectionKey, string> => {
  const layout = form.content.layout
  return {
    summary: layout.summary.uuid,
    trending_topics: layout.trending_topics.uuid,
    related_documents: layout.related_documents.uuid,
    key_insights: layout.insights_compiler.key_insights.uuid,
    intents: layout.insights_compiler.intents.uuid,
    entity_map: layout.insights_compiler.entity_map.uuid,
    comparative_insights: layout.insights_compiler.comparative_insights.uuid,
    key_data_statistics: layout.insights_compiler.key_data_statistics.uuid,
    ai_dive: layout.insights_compiler.ai_dive.uuid,
    ai_dive_critique_prompts:
      layout.insights_compiler.ai_dive.critique_prompts.uuid,
    ai_dive_explore_prompts:
      layout.insights_compiler.ai_dive.explore_prompts.uuid,
    ai_dive_synthesize_prompts:
      layout.insights_compiler.ai_dive.synthesize_prompts.uuid,
    ai_dive_hypothesize_prompts:
      layout.insights_compiler.ai_dive.hypothesize_prompts.uuid,
    ai_dive_lookforward_prompts:
      layout.insights_compiler.ai_dive.lookforward_prompts.uuid,
    ai_dive_relate_prompts:
      layout.insights_compiler.ai_dive.relate_prompts.uuid,
  }
}

export const getInsightSectionFromId = (
  map: Record<StreamSectionKey, string>
): Record<string, StreamSectionKey> => {
  const inverted: Record<string, StreamSectionKey> = {}
  for (const [key, value] of Object.entries(map)) {
    inverted[value] = key as StreamSectionKey
  }
  return inverted
}
