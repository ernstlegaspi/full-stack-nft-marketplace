import { cookies } from "next/headers"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"

export const useCookies = async (): Promise<{ token: RequestCookie, isAuthenticated: boolean }> => {
  const _cookies = await cookies()
  const token = _cookies.get('token')!
  const isAuthenticated = token ? true : false

  return { token, isAuthenticated }
}