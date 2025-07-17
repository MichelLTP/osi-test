import { json } from "@remix-run/node"
import { requiredUserSession } from "@/data/auth/session.server"
import { getOmmChatStream } from "@/data/omm/omm.server"
import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const { message, threadId, marketID, scenarioID, scenarioName } =
    await request.json()

  if (!message || !threadId || !marketID || !scenarioID) {
    return json({ error: "Missing required fields" }, { status: 400 })
  }

  return new Response(
    await getOmmChatStream(
      token,
      message,
      threadId,
      marketID,
      scenarioID,
      scenarioName
    )
  )
}
