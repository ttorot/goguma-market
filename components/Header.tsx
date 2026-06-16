import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import type { SeasonInfo } from '@/lib/season'
import Avatar from '@/components/Avatar'

interface HeaderProps {
  seasonInfo: SeasonInfo
}

export default async function Header({ seasonInfo }: HeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('nickname, avatar_url').eq('id', user.id).single()
    : { data: null }

  const nickname = profile?.nickname ?? user?.user_metadata?.nickname ?? user?.email?.split('@')[0] ?? '사용자'

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b"
      style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg-card)' }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <span className="text-2xl">🍠</span>
          <span style={{ color: 'var(--goguma)' }}>고구마마켓</span>
        </Link>

        {/* 시즌 배지 */}
        <div className={`hidden sm:flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium season-badge ${seasonInfo.season === 'summer' ? 'summer-badge-anim' : ''}`}>
          <span>{seasonInfo.emoji}</span>
          <span>{seasonInfo.label} 특가</span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/likes"
                className="px-2.5 py-1.5 rounded-full text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--s-text-sub)' }}
                aria-label="좋아요한 상품"
                title="좋아요한 상품"
              >
                ❤️
              </Link>
              <Link
                href="/mypage"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--s-text-sub)' }}
              >
                <Avatar url={profile?.avatar_url} name={nickname} size={28} />
                <span className="hidden sm:block text-sm">{nickname}님</span>
              </Link>
              <Link
                href="/sell"
                className="px-4 py-1.5 rounded-full text-sm font-medium btn-primary"
              >
                판매하기
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--s-border)', color: 'var(--s-text-sub)' }}
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--s-border)', color: 'var(--s-text-sub)' }}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-full text-sm font-medium btn-primary"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
