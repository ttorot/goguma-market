'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined)

  return (
    <div
      className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--s-bg)' }}
    >
      <div className="w-full max-w-sm">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍠</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--s-text)' }}>로그인</h1>
          <p className="text-sm" style={{ color: 'var(--s-text-sub)' }}>고구마마켓에 오신 걸 환영해요</p>
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
                placeholder="비밀번호를 입력해주세요"
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

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3 rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--s-text-sub)' }}>
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="link-primary font-semibold">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
