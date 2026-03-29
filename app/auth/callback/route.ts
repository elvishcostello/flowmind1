import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) =>
            cs.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    )
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      const displayName =
        session.user.user_metadata?.full_name ||
        session.user.email ||
        'Flowmind User'

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: session.user.id,
            display_name: displayName,
            email: session.user.email,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )

      if (profileError) console.error('user_profiles upsert failed:', profileError)

      const { error: activityError } = await supabase
        .from('user_activity')
        .upsert(
          { id: session.user.id },
          { onConflict: 'id', ignoreDuplicates: true }
        )

      if (activityError) console.error('user_activity upsert failed:', activityError)
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
