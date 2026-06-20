import { createAdminClient } from '@/lib/supabase/admin'

export async function requireAdmin(userId: string | undefined): Promise<void> {
  if (!userId) {
    throw new Error('UNAUTHORIZED')
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('FORBIDDEN')
  }
}
