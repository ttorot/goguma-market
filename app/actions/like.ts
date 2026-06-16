'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ToggleLikeResult = {
  liked: boolean
  count: number
  error?: string
}

// 좋아요를 켜고 끈다. 새 상태와 전체 좋아요 수를 돌려준다.
export async function toggleLike(productId: string): Promise<ToggleLikeResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { liked: false, count: 0, error: 'login-required' }

  // 이미 눌렀는지 확인
  const { data: existing } = await supabase
    .from('likes')
    .select('product_id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('likes').delete().eq('product_id', productId).eq('user_id', user.id)
  } else {
    await supabase.from('likes').insert({ product_id: productId, user_id: user.id })
  }

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  revalidatePath(`/products/${productId}`)
  revalidatePath('/likes')

  return { liked: !existing, count: count ?? 0 }
}
