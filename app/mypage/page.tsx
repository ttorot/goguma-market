import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductCard, { type CardProduct } from '@/components/ProductCard'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: myProducts },
    { count: likeCount },
  ] = await Promise.all([
    supabase.from('profiles').select('nickname, location').eq('id', user.id).single(),
    supabase
      .from('products')
      .select('id, title, price, category, image_url, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const nickname = profile?.nickname ?? user.user_metadata?.nickname ?? user.email?.split('@')[0] ?? '이웃'
  const products = (myProducts ?? []) as CardProduct[]
  const sellingCount = products.filter(p => p.status === 'active').length
  const soldCount = products.filter(p => p.status === 'sold').length

  return (
    <div style={{ backgroundColor: 'var(--s-bg)', minHeight: '100vh' }}>
      <div className="max-w-screen-md mx-auto px-4 py-8">

        {/* 프로필 */}
        <div
          className="flex items-center gap-4 rounded-2xl px-5 py-5 mb-5"
          style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: 'var(--s-badge-bg)', color: 'var(--s-badge-text)' }}
          >
            {nickname[0]}
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--s-text)' }}>{nickname}</p>
            <p className="text-sm" style={{ color: 'var(--s-text-sub)' }}>
              {profile?.location ?? '동네 미설정'} · {user.email}
            </p>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          <div className="rounded-xl py-4 text-center" style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--goguma)' }}>{sellingCount}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--s-text-sub)' }}>판매중</p>
          </div>
          <div className="rounded-xl py-4 text-center" style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--s-text)' }}>{soldCount}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--s-text-sub)' }}>거래완료</p>
          </div>
          <Link href="/likes" className="rounded-xl py-4 text-center transition-transform hover:-translate-y-0.5" style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}>
            <p className="text-xl font-bold" style={{ color: 'var(--s-text)' }}>{likeCount ?? 0}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--s-text-sub)' }}>❤️ 좋아요</p>
          </Link>
        </div>

        {/* 내 판매글 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: 'var(--s-text)' }}>내 판매글</h2>
          <Link
            href="/sell"
            className="text-sm font-medium link-primary"
          >
            + 새 상품 등록
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
          >
            <div className="text-5xl mb-4">🍠</div>
            <p className="font-semibold mb-1" style={{ color: 'var(--s-text)' }}>아직 등록한 상품이 없어요</p>
            <p className="text-sm mb-5" style={{ color: 'var(--s-text-sub)' }}>첫 상품을 등록해보세요!</p>
            <Link
              href="/sell"
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm"
            >
              🍠 판매하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
