'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import { updateProduct } from '@/app/actions/product'

const CATEGORIES = [
  '디지털/가전', '의류/잡화', '도서/음반', '생활/주방',
  '가구/인테리어', '스포츠/레저', '유아동', '식품', '기타',
]

const MAX_IMAGES = 5

type Product = {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  image_urls: string[] | null
}

type Picked = { file: File; url: string }

export default function EditProductForm({ product }: { product: Product }) {
  const [state, formAction, isPending] = useActionState(updateProduct, undefined)

  // 기존에 올려둔 사진 주소들 (사용자가 지우면 목록에서 빠진다)
  const initialExisting = product.image_urls ?? (product.image_url ? [product.image_url] : [])
  const [existing, setExisting] = useState<string[]>(initialExisting)
  // 새로 고른 사진 파일들
  const [picked, setPicked] = useState<Picked[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const total = existing.length + picked.length

  function syncInput(next: Picked[]) {
    const dt = new DataTransfer()
    next.forEach(p => dt.items.add(p.file))
    if (inputRef.current) inputRef.current.files = dt.files
  }

  function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? [])
    if (newFiles.length === 0) return
    const room = MAX_IMAGES - total
    const added = newFiles.slice(0, room).map(file => ({ file, url: URL.createObjectURL(file) }))
    const next = [...picked, ...added]
    setPicked(next)
    syncInput(next)
  }

  function removeExisting(url: string) {
    setExisting(existing.filter(u => u !== url))
  }

  function removePicked(i: number) {
    URL.revokeObjectURL(picked[i].url)
    const next = picked.filter((_, idx) => idx !== i)
    setPicked(next)
    syncInput(next)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10" style={{ backgroundColor: 'var(--s-bg)' }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/products/${product.id}`} className="text-2xl hover:opacity-70 transition-opacity" aria-label="뒤로가기">
          ←
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--s-text)' }}>
          🍠 판매글 수정
        </h1>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={product.id} />
        {/* 그대로 유지할 기존 사진 주소들 */}
        {existing.map(url => (
          <input key={url} type="hidden" name="existing_images" value={url} />
        ))}

        {/* 이미지 */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--s-text)' }}>
            상품 사진 <span style={{ color: 'var(--s-text-sub)' }}>({total}/{MAX_IMAGES})</span>
          </label>

          {total === 0 ? (
            <label
              htmlFor="image-input"
              className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors"
              style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg-card)', height: '160px' }}
            >
              <div className="text-center p-6">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm" style={{ color: 'var(--s-text-sub)' }}>사진을 추가해주세요</p>
                <p className="text-xs mt-1" style={{ color: 'var(--s-text-sub)', opacity: 0.7 }}>
                  JPG, PNG, WebP · 최대 {MAX_IMAGES}장 · 한 장당 5MB
                </p>
              </div>
            </label>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {/* 기존 사진 */}
              {existing.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden" style={{ border: '1px solid var(--s-border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`기존 사진 ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--goguma)', color: 'white' }}>
                      대표
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExisting(url)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                    aria-label="사진 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* 새로 고른 사진 */}
              {picked.map((p, i) => (
                <div key={p.url} className="relative aspect-square rounded-xl overflow-hidden" style={{ border: '1px solid var(--s-border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`새 사진 ${i + 1}`} className="w-full h-full object-cover" />
                  {existing.length === 0 && i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--goguma)', color: 'white' }}>
                      대표
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePicked(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                    aria-label="사진 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {total < MAX_IMAGES && (
                <label
                  htmlFor="image-input"
                  className="cursor-pointer aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center"
                  style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg-card)', color: 'var(--s-text-sub)' }}
                >
                  <span className="text-2xl">＋</span>
                  <span className="text-xs mt-1">추가</span>
                </label>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            id="image-input"
            name="image"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAdd}
          />
        </div>

        {/* 상품명 */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--s-text)' }}>
            상품명 <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            maxLength={50}
            defaultValue={product.title}
            placeholder="상품명을 입력해주세요"
            className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
            style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--s-text)' }}>
            카테고리
          </label>
          <select
            name="category"
            defaultValue={product.category}
            className="input-field w-full px-4 py-3 rounded-xl border text-sm transition-all"
            style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--s-text)' }}>
            가격 <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="relative">
            <input
              name="price"
              type="number"
              required
              min={0}
              defaultValue={product.price}
              placeholder="0"
              className="input-field w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-all"
              style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
              style={{ color: 'var(--s-text-sub)' }}
            >
              원
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--s-text-sub)' }}>
            무료 나눔은 0원으로 입력해주세요
          </p>
        </div>

        {/* 상품 설명 */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--s-text)' }}>
            상품 설명
          </label>
          <textarea
            name="description"
            rows={5}
            maxLength={500}
            defaultValue={product.description ?? ''}
            placeholder="상품의 상태, 구매 시기, 하자 유무 등을 자세히 적어주세요"
            className="input-field w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all"
            style={{ borderColor: 'var(--s-border)', backgroundColor: 'var(--s-bg)', color: 'var(--s-text)' }}
          />
        </div>

        {/* 에러 메시지 */}
        {state?.error && (
          <p
            className="text-sm px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
          >
            {state.error}
          </p>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <Link
            href={`/products/${product.id}`}
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
            {isPending ? '저장 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </div>
  )
}
