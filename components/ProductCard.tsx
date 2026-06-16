import Link from 'next/link'

export type CardProduct = {
  id: string
  title: string
  price: number
  category: string
  image_url: string | null
  status?: string
}

export default function ProductCard({
  product,
  likeCount,
  commentCount,
}: {
  product: CardProduct
  likeCount?: number
  commentCount?: number
}) {
  const isSold = product.status === 'sold'

  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)', boxShadow: '0 2px 8px var(--s-shadow)' }}
    >
      {/* 상품 이미지 */}
      <div
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
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
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <span className="text-white text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              거래완료
            </span>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-3">
        <p className="text-sm font-medium leading-tight mb-1 line-clamp-2" style={{ color: 'var(--s-text)' }}>
          {product.title}
        </p>
        <p className="text-sm font-bold" style={{ color: 'var(--goguma)' }}>
          {product.price === 0 ? '무료 나눔' : `${product.price.toLocaleString('ko-KR')}원`}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'var(--s-text-sub)' }}>
          <span>{product.category}</span>
          {(likeCount !== undefined || commentCount !== undefined) && (
            <span className="ml-auto flex items-center gap-2">
              <span>❤️ {likeCount ?? 0}</span>
              <span>💬 {commentCount ?? 0}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
