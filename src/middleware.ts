import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const protectedRoutes = ['/dashboard', '/provider', '/admin']
  const isProtected = protectedRoutes.some((r) =>
    request.nextUrl.pathname.startsWith(r),
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      request.nextUrl.pathname.startsWith('/admin') &&
      profile?.role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (
      request.nextUrl.pathname.startsWith('/provider') &&
      profile?.role !== 'provider'
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/provider/:path*', '/admin/:path*'],
}
