import { authenticator } from "@/data/auth/azuread/azuread.server"
import { type ActionFunctionArgs } from "@remix-run/node"

export const loader = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate("microsoft", request)
}
