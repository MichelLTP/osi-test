import { requiredUserSession } from "@/data/auth/session.server"
import { getAggServiceStream } from "@/data/litepaper/litepaper.server"
import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()
  const form = formData.get("form")
  const session_id = formData.get("session_id")
  const workspaceId = formData.get("workspaceId")

  if (!form) {
    return new Response("No form data provided", { status: 400 })
  }

  const parsedForm = JSON.parse(form as string)
  const messages = parsedForm.forms

  // Retrieve files from FormData
  const files = []
  for (const entry of formData.entries()) {
    if (entry[0].startsWith("file_")) {
      const file = entry[1] // File object
      files.push(file)
    }
  }

  return new Response(
    await getAggServiceStream(token, {
      messages: messages,
      files: files,
      session_id: session_id,
      workspaceId: workspaceId,
    })
  )
}
