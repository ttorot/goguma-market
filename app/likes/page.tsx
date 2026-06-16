import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductCard, { type CardProduct } from '@/components/ProductCard'

export default async function LikesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('likes')
    .select('created_at, products(id, title, price, category, image_url, status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 삭제된 상품 등 비어있는 항목은 걸러낸다.
  const products = (rows ?? [])
    .map(r => r.products as unknown as CardProduct | null)
    .filter((p): p is CardProduct => !!p)

  return (
    <div style={{ backgroundColor: 'var(--s-bg)', minHeight: '100vh' }}>
      <div className="max-w-screen-md mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--s-text)' }}>
          ❤️ 좋아요한 상품
        </h1>

        {products.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
          >
            <div className="text-5xl mb-4">🤍</div>
            <p className="font-semibold mb-1" style={{ color: 'var(--s-text)' }}>
              아직 좋아요한 상품이 없어요
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--s-text-sub)' }}>
              마음에 드는 상품에 하트를 눌러보세요!
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm"
            >
              상품 구경하기
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
