import { requiredUserSession } from "@/data/auth/session.server"
import { getChatSIStream } from "@/data/chatsi/chatsi.server"
import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)

  return new Response(
    await getChatSIStream(token, {
      messages: (await request.json()).messages,
    })
  )
}
