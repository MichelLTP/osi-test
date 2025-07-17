import { requiredUserSession } from "@/data/auth/session.server"
import { getGreyPaperRunStream } from "@/data/litepaper/litepaper.server"
import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const sections = formData.get("sections")
  const workspaceId = formData.get("workspaceId")

  if (!sections) {
    return new Response("No section data provided", { status: 400 })
  }

  const parsedSections = JSON.parse(sections as string)
  const messages = parsedSections

  return new Response(
    await getGreyPaperRunStream(token, {
      messages: messages,
      workspaceId: workspaceId,
    })
  )
}
