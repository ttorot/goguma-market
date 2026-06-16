'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createComment } from '@/app/actions/comment'

export default function CommentForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(createComment, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  // 등록에 성공하면 입력칸을 비운다.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="mb-5">
      <input type="hidden" name="product_id" value={productId} />
      <textarea
        name="content"
        rows={3}
        required
        maxLength={1000}
        placeholder="궁금한 점이나 거래 문의를 남겨보세요"
        className="input-field w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all"
        style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
      />
      {state?.error && (
        <p className="text-xs mt-1.5" style={{ color: '#dc2626' }}>{state.error}</p>
      )}
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? '등록 중...' : '댓글 달기'}
        </button>
      </div>
    </form>
  )
}
