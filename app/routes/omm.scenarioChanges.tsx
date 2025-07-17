import { ActionFunctionArgs, json } from "@remix-run/node"
import { getMeasuresByGranularity } from "@/data/omm/omm.server"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const marketId = formData.get("marketId") as string

  if (!marketId) {
    throw new Response("Market ID is required", { status: 400 })
  }
  try {
    const measures = await getMeasuresByGranularity(marketId)
    return json({ measures })
  } catch (error) {
    console.error("Failed to fetch measures:", error)
    throw new Response("Failed to fetch measures", { status: 500 })
  }
}
