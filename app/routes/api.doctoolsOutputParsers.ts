import { requiredUserSession } from "@/data/auth/session.server"
import { getOutputParsersStream } from "@/data/documenttools/documenttools.server"
import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  return new Response(
    await getOutputParsersStream(token, {
      messages: (await request.json()).messages,
    })
  )
}
