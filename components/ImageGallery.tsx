'use client'

import { useState } from 'react'

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0)

  return (
    <div>
      {/* 큰 사진 */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--s-bg-card)', border: '1px solid var(--s-border)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[current]}
          alt={alt}
          className="w-full object-cover max-h-96"
        />
      </div>

      {/* 사진이 여러 장일 때만 아래에 작은 미리보기 */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setCurrent(i)}
              className="shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
              style={{
                border: i === current ? '2px solid var(--goguma)' : '1px solid var(--s-border)',
                opacity: i === current ? 1 : 0.6,
              }}
              aria-label={`사진 ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
