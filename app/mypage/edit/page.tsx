import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, location, bio, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <ProfileForm
      profile={profile ?? { nickname: null, location: null, bio: null, avatar_url: null }}
      email={user.email ?? ''}
    />
  )
}
