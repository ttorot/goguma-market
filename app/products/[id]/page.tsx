import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteProduct, markAsSold } from '@/app/actions/product'
import DeleteButton from './DeleteButton'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const [{ data: { user } }, { data: sellerProfile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('nickname').eq('id', product.user_id).single(),
  ])

  const isOwner = user?.id === product.user_id

  const sellerName = sellerProfile?.nickname ?? '이웃'

  const formattedPrice = product.price === 0
    ? '무료 나눔'
    : `${product.price.toLocaleString('ko-KR')}원`

  const formattedDate = new Date(product.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="max-w-lg mx-auto px-4 py-8" style={{ backgroundColor: 'var(--s-bg)' }}>

      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--s-text-sub)' }}
      >
        ← 목록으로
      </Link>

      {/* 상품 이미지 */}
      <div
        className="w-full rounded-2xl overflow-hidden mb-5"
        style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)', minHeight: '200px' }}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full object-cover max-h-80"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-48" style={{ color: 'var(--s-text-sub)' }}>
            <div className="text-5xl mb-2">🍠</div>
            <p className="text-sm">사진 없음</p>
          </div>
        )}
      </div>

      {/* 판매자 정보 */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
        style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ backgroundColor: 'var(--s-badge-bg)', color: 'var(--s-badge-text)' }}
        >
          {sellerName[0]}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--s-text)' }}>{sellerName}</p>
          <p className="text-xs" style={{ color: 'var(--s-text-sub)' }}>등록일 {formattedDate}</p>
        </div>
      </div>

      {/* 상품 정보 */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
      >
        {/* 상태 배지 */}
        {product.status === 'sold' && (
          <span
            className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
            style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
          >
            거래완료
          </span>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--s-text)' }}>
            {product.title}
          </h1>
          <span
            className="text-xs px-2.5 py-1 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: 'var(--s-badge-bg)', color: 'var(--s-badge-text)' }}
          >
            {product.category}
          </span>
        </div>

        <p className="text-2xl font-bold mb-4" style={{ color: 'var(--goguma)' }}>
          {formattedPrice}
        </p>

        {product.description && (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--s-text-sub)' }}
          >
            {product.description}
          </p>
        )}
      </div>

      {/* 버튼 영역 */}
      {isOwner ? (
        <div className="flex gap-3">
          {product.status === 'active' && (
            <form action={markAsSold.bind(null, product.id)} className="flex-1">
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--s-border)', color: 'var(--s-text-sub)' }}
              >
                거래완료 처리
              </button>
            </form>
          )}
          <form action={deleteProduct.bind(null, product.id)} className="flex-1">
            <DeleteButton />
          </form>
        </div>
      ) : (
        <div>
          {product.status === 'active' ? (
            <button
              className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm"
            >
              💬 채팅으로 거래하기
            </button>
          ) : (
            <div
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-center"
              style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}
            >
              거래가 완료된 상품입니다
            </div>
          )}
        </div>
      )}
    </div>
  )
}
