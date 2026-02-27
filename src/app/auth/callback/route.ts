import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function callProvisioning(user_id: string, email: string) {
  fetch(`${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/users/provisioned`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, email }),
  }).catch(() => {}) // fire-and-forget, silent fail
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth?error=oauth_failed`)
  }

  const { user } = data.session

  // Detect new user: created_at and last_sign_in_at are within 5 seconds of each other
  const created = new Date(user.created_at).getTime()
  const lastSignIn = new Date(user.last_sign_in_at!).getTime()
  const isNewUser = Math.abs(created - lastSignIn) < 5000

  if (isNewUser) {
    callProvisioning(user.id, user.email ?? '')
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
