'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CommentState = {
  error?: string
  ok?: boolean
} | undefined

export async function createComment(_prevState: CommentState, formData: FormData): Promise<CommentState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '댓글을 쓰려면 로그인이 필요합니다.' }

  const productId = formData.get('product_id') as string
  const content = (formData.get('content') as string)?.trim()

  if (!productId) return { error: '잘못된 접근입니다.' }
  if (!content) return { error: '댓글 내용을 입력해주세요.' }
  if (content.length > 1000) return { error: '댓글은 1000자 이하로 입력해주세요.' }

  const { error } = await supabase.from('comments').insert({
    product_id: productId,
    user_id: user.id,
    content,
  })

  if (error) return { error: '댓글 등록에 실패했습니다. 다시 시도해주세요.' }

  revalidatePath(`/products/${productId}`)
  return { ok: true }
}

export async function updateComment(_prevState: CommentState, formData: FormData): Promise<CommentState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const commentId = formData.get('comment_id') as string
  const productId = formData.get('product_id') as string
  const content = (formData.get('content') as string)?.trim()

  if (!commentId || !productId) return { error: '잘못된 접근입니다.' }
  if (!content) return { error: '댓글 내용을 입력해주세요.' }
  if (content.length > 1000) return { error: '댓글은 1000자 이하로 입력해주세요.' }

  const { error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId)
    .eq('user_id', user.id) // 본인 댓글만 수정 가능

  if (error) return { error: '댓글 수정에 실패했습니다. 다시 시도해주세요.' }

  revalidatePath(`/products/${productId}`)
  return { ok: true }
}

export async function deleteComment(commentId: string, productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id) // 본인 댓글만 삭제 가능

  revalidatePath(`/products/${productId}`)
}
