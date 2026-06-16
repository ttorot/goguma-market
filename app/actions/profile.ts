'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ProfileState = {
  error?: string
} | undefined

const AVATAR_BUCKET = 'avatars'
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function avatarPathFromUrl(url: string | null): string | null {
  if (!url) return null
  const marker = `/${AVATAR_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export async function updateProfile(_prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nickname = (formData.get('nickname') as string)?.trim()
  const location = (formData.get('location') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim()
  const avatarFile = formData.get('avatar') as File | null
  const removeAvatar = formData.get('remove_avatar') === '1'

  if (!nickname) return { error: '닉네임을 입력해주세요.' }
  if (nickname.length > 20) return { error: '닉네임은 20자 이하로 입력해주세요.' }
  if (bio && bio.length > 200) return { error: '자기소개는 200자 이하로 입력해주세요.' }

  // 기존 프로필(특히 기존 사진 주소) 확인
  const { data: existing } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  const oldAvatar: string | null = existing?.avatar_url ?? null
  let avatar_url: string | null = oldAvatar
  let avatarToDelete: string | null = null

  if (avatarFile && avatarFile.size > 0) {
    // 새 프로필 사진 업로드
    const fileExt = avatarFile.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !ALLOWED_EXT.includes(fileExt)) {
      return { error: '사진은 JPG, PNG, WebP, GIF만 가능합니다.' }
    }
    if (avatarFile.size > MAX_SIZE) {
      return { error: '사진 크기는 5MB 이하여야 합니다.' }
    }

    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(fileName, avatarFile)
    if (uploadError) {
      console.error('프로필 사진 업로드 실패:', uploadError.message)
      return { error: '사진 업로드에 실패했습니다. 다시 시도해주세요.' }
    }
    const { data: { publicUrl } } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(fileName)
    avatar_url = publicUrl
    avatarToDelete = oldAvatar
  } else if (removeAvatar) {
    avatar_url = null
    avatarToDelete = oldAvatar
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      nickname,
      location: location || null,
      bio: bio || null,
      avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    // 닉네임 중복 등
    if (error.code === '23505') return { error: '이미 사용 중인 닉네임입니다.' }
    // 수정 실패 시 새로 올린 사진 정리
    if (avatarFile && avatarFile.size > 0 && avatar_url) {
      const p = avatarPathFromUrl(avatar_url)
      if (p) await supabase.storage.from(AVATAR_BUCKET).remove([p])
    }
    return { error: '프로필 수정에 실패했습니다. 다시 시도해주세요.' }
  }

  // 더 이상 쓰지 않는 옛 사진 정리
  if (avatarToDelete && avatarToDelete !== avatar_url) {
    const p = avatarPathFromUrl(avatarToDelete)
    if (p) await supabase.storage.from(AVATAR_BUCKET).remove([p])
  }

  revalidatePath('/', 'layout')
  revalidatePath('/mypage')
  redirect('/mypage')
}
