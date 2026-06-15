'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '@/app/actions/product'

const CATEGORIES = [
  '디지털/가전', '의류/잡화', '도서/음반', '생활/주방',
  '가구/인테리어', '스포츠/레저', '유아동', '식품', '기타',
]

export default function SellPage() {
  const [state, formAction, isPending] = useActionState(createProduct, undefined)
  const [preview, setPreview] = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10" style={{ backgroundColor: 'var(--s-bg)' }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="text-2xl hover:opacity-70 transition-opacity"
          aria-label="뒤로가기"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--s-text)' }}>
          🍠 내 물건 팔기
        </h1>
      </div>

      <form action={formAction} className="space-y-5">
        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--s-text)' }}>
            상품 사진
          </label>
          <label
            htmlFor="image-input"
            className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors overflow-hidden"
            style={{
              borderColor: preview ? 'transparent' : 'var(--s-border)',
              backgroundColor: preview ? 'transparent' : 'var(--s-bg-card)',
              height: preview ? 'auto' : '160px',
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="상품 미리보기"
                className="w-full rounded-2xl object-cover max-h-72"
              />
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm" style={{ color: 'var(--s-text-sub)' }}>
                  사진을 추가해주세요
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--s-text-sub)', opacity: 0.7 }}>
                  JPG, PNG, WebP · 최대 5MB
                </p>
              </div>
            )}
          </label>
          <input
            id="image-input"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageChange}
          />
          {preview && (
            <button
              type="button"
              className="mt-2 text-xs"
              style={{ color: 'var(--s-text-sub)' }}
              onClick={() => {
                setPreview(null)
                const input = document.getElementById('image-input') as HTMLInputElement
                if (input) input.value = ''
              }}
            >
              사진 삭제
            </button>
          )}
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

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? '등록 중...' : '판매 등록하기'}
        </button>
      </form>
    </div>
  )
}
