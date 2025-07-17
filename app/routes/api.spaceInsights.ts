import { requiredUserSession } from "@/data/auth/session.server"
import { ActionFunctionArgs } from "@remix-run/node"
import { runSpaceInsights } from "@/data/searchspaces/searchSpaces.server"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const params = new URL(request.url).searchParams
  const id = params.get("id")

  if (!id) {
    return new Response("Space ID is required", { status: 400 })
  }

  return new Response(await runSpaceInsights(token, id))
}
