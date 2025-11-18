import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  const accessToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  )

  if (accessToken && refreshToken) {
    const {
      data: { session },
      error,
    } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error || !session) {
      // Clear invalid tokens
      response.cookies.delete("sb-access-token")
      response.cookies.delete("sb-refresh-token")

      if (!request.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    }
  } else if (!request.nextUrl.pathname.startsWith("/auth")) {
    // No tokens and not on auth page, redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return response
}
