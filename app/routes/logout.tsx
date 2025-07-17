import { logout } from "@/data/auth/session.server"
import { type LoaderFunctionArgs } from "@remix-run/node"

export async function loader({ request }: LoaderFunctionArgs) {
  return logout(request)
}
