import { requiredUserSession } from "@/data/auth/session.server"
import { getGreyPaperPreviewStream } from "@/data/litepaper/litepaper.server"
import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const section = formData.get("section")
  const workspaceId = formData.get("workspaceId")

  if (!section) {
    return new Response("No section data provided", { status: 400 })
  }

  const parsedSection = JSON.parse(section as string)
  const messages = parsedSection

  return new Response(
    await getGreyPaperPreviewStream(token, {
      messages: messages,
      workspaceId: workspaceId,
    })
  )
}
