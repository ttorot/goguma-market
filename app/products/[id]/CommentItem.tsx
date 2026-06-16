'use client'

import { useState } from 'react'
import { updateComment, deleteComment } from '@/app/actions/comment'

type Comment = {
  id: string
  content: string
  created_at: string
}

export default function CommentItem({
  comment,
  authorName,
  isOwner,
  productId,
}: {
  comment: Comment
  authorName: string
  isOwner: boolean
  productId: string
}) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)

  // 수정 저장 처리 (성공하면 보기 모드로 돌아간다)
  async function handleSave(formData: FormData) {
    setSaving(true)
    setError(undefined)
    const result = await updateComment(undefined, formData)
    setSaving(false)
    if (result?.error) setError(result.error)
    else setEditing(false)
  }

  function startEdit() {
    setError(undefined)
    setEditing(true)
  }

  const time = new Date(comment.created_at).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric',
  })

  return (
    <li
      className="rounded-xl px-4 py-3"
      style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: 'var(--s-text)' }}>{authorName}</span>
          <span className="text-xs" style={{ color: 'var(--s-text-sub)' }}>{time}</span>
        </div>
        {isOwner && !editing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startEdit}
              className="text-xs hover:opacity-70"
              style={{ color: 'var(--s-text-sub)' }}
            >
              수정
            </button>
            <form action={deleteComment.bind(null, comment.id, productId)}>
              <button type="submit" className="text-xs hover:opacity-70" style={{ color: 'var(--s-text-sub)' }}>
                삭제
              </button>
            </form>
          </div>
        )}
      </div>

      {editing ? (
        <form action={handleSave} className="mt-2">
          <textarea
            name="content"
            rows={3}
            required
            maxLength={1000}
            defaultValue={comment.content}
            className="input-field w-full px-3 py-2 rounded-lg border text-sm resize-none transition-all"
            style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
          />
          {/* 서버 액션에 필요한 값 */}
          <input type="hidden" name="comment_id" value={comment.id} />
          <input type="hidden" name="product_id" value={productId} />
          {error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: 'var(--s-border)', color: 'var(--s-text-sub)' }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--s-text-sub)' }}>
          {comment.content}
        </p>
      )}
    </li>
  )
}
