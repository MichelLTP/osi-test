import { requiredUserSession } from "@/data/auth/session.server"
import { submitRunAnalysis } from "@/data/documenttools/documenttools.server"
import { ActionFunctionArgs } from "@remix-run/node"

export async function action({ request }: ActionFunctionArgs) {
  const token = await requiredUserSession(request)
  const formData = await request.formData()

  if (!formData) {
    return new Response("No form data provided", { status: 400 })
  }

  return new Response(await submitRunAnalysis(token, formData))
}
