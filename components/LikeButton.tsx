'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from '@/app/actions/like'

export default function LikeButton({
  productId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  productId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // 먼저 화면을 바꿔서 빠르게 반응(낙관적 업데이트)
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount(c => c + (nextLiked ? 1 : -1))

    startTransition(async () => {
      const result = await toggleLike(productId)
      if (result.error) {
        // 실패하면 원래대로 되돌림
        setLiked(liked)
        setCount(initialCount)
        if (result.error === 'login-required') router.push('/login')
        return
      }
      setLiked(result.liked)
      setCount(result.count)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors active:scale-95 disabled:opacity-60"
      style={{
        borderColor: liked ? 'var(--goguma)' : 'var(--s-border)',
        backgroundColor: liked ? 'var(--s-badge-bg)' : 'var(--s-bg-card)',
        color: liked ? 'var(--goguma)' : 'var(--s-text-sub)',
      }}
    >
      <span className="text-base leading-none">{liked ? '❤️' : '🤍'}</span>
      <span>좋아요 {count}</span>
    </button>
  )
}
