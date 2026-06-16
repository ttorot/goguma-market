'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import { updateProfile } from '@/app/actions/profile'

type Profile = {
  nickname: string | null
  location: string | null
  bio: string | null
  avatar_url: string | null
}

export default function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, formAction, isPending] = useActionState(updateProfile, undefined)
  const [preview, setPreview] = useState<string | null>(null)
  const [keepExisting, setKeepExisting] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const existingAvatar = profile.avatar_url
  const shownAvatar = preview ?? (keepExisting ? existingAvatar : null)
  const removeAvatar = !preview && !keepExisting && !!existingAvatar
  const displayName = profile.nickname ?? email.split('@')[0]

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setKeepExisting(true)
  }

  function clearAvatar() {
    setPreview(null)
    setKeepExisting(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10" style={{ backgroundColor: 'var(--s-bg)' }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mypage" className="text-2xl hover:opacity-70 transition-opacity" aria-label="뒤로가기">
          ←
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--s-text)' }}>
          프로필 수정
        </h1>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="remove_avatar" value={removeAvatar ? '1' : '0'} />

        {/* 프로필 사진 */}
        <div className="flex flex-col items-center gap-3">
          <label htmlFor="avatar-input" className="cursor-pointer relative">
            {shownAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shownAvatar}
                alt="프로필 사진"
                className="rounded-full object-cover"
                style={{ width: 96, height: 96, border: '1px solid var(--s-border)' }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center text-3xl font-bold"
                style={{ width: 96, height: 96, backgroundColor: 'var(--s-badge-bg)', color: 'var(--s-badge-text)' }}
              >
                {displayName[0]}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: 'var(--s-primary)', color: 'white', border: '2px solid var(--s-bg)' }}
            >
              📷
            </span>
          </label>
          {shownAvatar && (
            <button type="button" onClick={clearAvatar} className="text-xs" style={{ color: 'var(--s-text-sub)' }}>
              사진 삭제
            </button>
          )}
          <input
            ref={inputRef}
            id="avatar-input"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--s-text)' }}>
            닉네임 <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            name="nickname"
            type="text"
            required
            maxLength={20}
            defaultValue={profile.nickname ?? ''}
            placeholder="닉네임을 입력해주세요"
            className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
            style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
          />
        </div>

        {/* 동네 */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--s-text)' }}>
            동네
          </label>
          <input
            name="location"
            type="text"
            maxLength={30}
            defaultValue={profile.location ?? ''}
            placeholder="예: 서울 강남구 역삼동"
            className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
            style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
          />
        </div>

        {/* 자기소개 */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--s-text)' }}>
            자기소개
          </label>
          <textarea
            name="bio"
            rows={4}
            maxLength={200}
            defaultValue={profile.bio ?? ''}
            placeholder="이웃들에게 나를 소개해보세요 (최대 200자)"
            className="input-field w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all"
            style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
          />
        </div>

        {/* 에러 */}
        {state?.error && (
          <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            {state.error}
          </p>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <Link
            href="/mypage"
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm border text-center transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--s-border)', color: 'var(--s-text-sub)' }}
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary flex-1 py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
