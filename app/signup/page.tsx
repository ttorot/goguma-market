'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, undefined)

  return (
    <div
      className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--s-bg)' }}
    >
      <div className="w-full max-w-sm">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍠</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--s-text)' }}>회원가입</h1>
          <p className="text-sm" style={{ color: 'var(--s-text-sub)' }}>고구마마켓 이웃이 되어주세요!</p>
        </div>

        {/* 폼 카드 */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            backgroundColor: 'var(--s-bg-card)',
            border: '1px solid var(--s-border)',
            boxShadow: '0 4px 16px var(--s-shadow)',
          }}
        >
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--s-text)' }}>
                닉네임
              </label>
              <input
                name="nickname"
                type="text"
                required
                placeholder="동네에서 사용할 닉네임"
                className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
                style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--s-text)' }}>
                이메일
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
                style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--s-text)' }}>
                비밀번호
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="6자 이상 입력해주세요"
                className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
                style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--s-text)' }}>
                비밀번호 확인
              </label>
              <input
                name="confirm"
                type="password"
                required
                placeholder="비밀번호를 다시 입력해주세요"
                className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
                style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
              />
            </div>

            {state?.error && (
              <p
                className="text-sm px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
              >
                {state.error}
              </p>
            )}
            {state?.message && (
              <p
                className="text-sm px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
              >
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3 rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>

        {/* 로그인 링크 */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--s-text-sub)' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="link-primary font-semibold">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
