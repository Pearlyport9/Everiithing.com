# Everiithing•com — Authentication

## Platform: Supabase Auth

---

## Auth Strategy

| User Type | Method | Reason |
|-----------|--------|--------|
| Customer | Email + Password or Phone OTP | Low friction for booking |
| Provider | Phone OTP (primary) | Most Nigerian artisans prefer SMS |
| Admin | Email + Password + MFA | Security |

---

## User Roles
Stored in `profiles.role`:
- `customer` — books services
- `provider` — receives and completes jobs
- `admin` — manages platform, verifications, disputes

---

## Auth Flows

### Customer Sign Up
```
1. Enter phone number or email
2. Receive OTP via SMS (Termii) or email (Resend)
3. Verify OTP
4. Enter name → profile created with role: 'customer'
5. Redirect → /book (or intended page)
```

### Provider Sign Up
```
1. Click "Become a Provider" on landing page
2. Enter phone number
3. Verify OTP
4. Fill multi-step onboarding form:
   Step 1: Personal info (name, LGA, NIN)
   Step 2: Service categories (select all that apply)
   Step 3: Upload documents (ID, certificate)
   Step 4: Guarantor details
5. Profile created with role: 'provider', verification_status: 'pending'
6. Redirect → /provider/dashboard (pending state shown)
7. Ops team picks up from verification pipeline
```

### Admin Sign Up
```
- Created manually in Supabase dashboard by super admin
- No public registration
- MFA enforced via Supabase Auth settings
```

---

## Session Management

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      }
    }
  )
}
```

---

## Route Protection

### Middleware
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/provider', '/admin']
  const isProtected = protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based redirect
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (request.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/provider') && profile?.role !== 'provider') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}
```

---

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-side only, never expose to client
```

---

## Security Rules
- Passwords: minimum 8 characters enforced
- OTP: 6-digit, expires in 10 minutes
- Sessions: 7-day expiry, refresh token rotation enabled
- Admin: MFA required
- Provider documents: Only readable by owner + admin (RLS enforced)
- NIN data: Never logged, encrypted at rest via Supabase
