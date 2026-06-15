import { createClient } from '@/lib/supabase/server'
import { getSeason } from '@/lib/season'
import Link from 'next/link'

const CATEGORIES = [
  '전체', '디지털/가전', '의류/잡화', '도서/음반', '생활/주방',
  '가구/인테리어', '스포츠/레저', '유아동', '식품', '기타',
]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; listed?: string; category?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const seasonInfo = getSeason()
  const params = await searchParams
  const isWelcome = params.welcome === '1'
  const isListed = params.listed === '1'
  const selectedCategory = params.category ?? '전체'

  const nickname = user?.user_metadata?.nickname ?? user?.email?.split('@')[0]

  // 상품 목록 조회
  let query = supabase
    .from('products')
    .select('id, title, price, category, image_url, status, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(40)

  if (selectedCategory !== '전체') {
    query = query.eq('category', selectedCategory)
  }

  const { data: products } = await query

  return (
    <div style={{ backgroundColor: 'var(--s-bg)', minHeight: '100vh' }}>
      <div className="max-w-screen-md mx-auto px-4 py-6">

        {/* 알림 배너 */}
        {isWelcome && user && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: 'var(--s-badge-bg)', color: 'var(--s-badge-text)', border: '1px solid var(--s-border)' }}>
            🎉 환영합니다! <strong>{nickname}</strong>님, 고구마마켓 이웃이 되어주셔서 감사해요!
          </div>
        )}
        {isListed && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            ✅ 상품이 등록되었습니다!
          </div>
        )}

        {/* 히어로 */}
        <div className="rounded-2xl px-5 py-6 mb-6 season-gradient flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 season-badge px-2.5 py-1 rounded-full text-xs font-medium mb-2">
              <span>{seasonInfo.emoji}</span>
              <span>{seasonInfo.label} 특가</span>
            </div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--s-text)' }}>
              따뜻한 동네 중고거래
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--s-text-sub)' }}>
              {user ? `${nickname}님 근처의 매물` : '이웃과 가깝게 거래해요'}
            </p>
          </div>
          <div className="text-5xl">🍠</div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={cat === '전체' ? '/' : `/?category=${encodeURIComponent(cat)}`}
              className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={selectedCategory === cat ? {
                backgroundColor: 'var(--s-primary)',
                color: 'white',
              } : {
                backgroundColor: 'var(--s-bg-card)',
                color: 'var(--s-text-sub)',
                border: '1px solid var(--s-border)',
              }}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* 상품 목록 */}
        {!products || products.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
          >
            <div className="text-5xl mb-4">🍠</div>
            <p className="font-semibold mb-1" style={{ color: 'var(--s-text)' }}>
              아직 등록된 상품이 없어요
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--s-text-sub)' }}>
              첫 번째 판매자가 되어보세요!
            </p>
            {user ? (
              <Link
                href="/sell"
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                🍠 판매하기
              </Link>
            ) : (
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                시작하기
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)', boxShadow: '0 2px 8px var(--s-shadow)' }}
              >
                {/* 상품 이미지 */}
                <div
                  className="w-full aspect-square flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: 'var(--s-bg)' }}
                >
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-4xl">🍠</span>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="p-3">
                  <p
                    className="text-sm font-medium leading-tight mb-1 line-clamp-2"
                    style={{ color: 'var(--s-text)' }}
                  >
                    {product.title}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--goguma)' }}>
                    {product.price === 0 ? '무료 나눔' : `${product.price.toLocaleString('ko-KR')}원`}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--s-text-sub)' }}>
                    {product.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
