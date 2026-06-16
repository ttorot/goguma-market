// 프로필 사진을 보여주는 공용 조각. 사진이 없으면 닉네임 첫 글자를 동그라미로 표시한다.
export default function Avatar({
  url,
  name,
  size = 40,
}: {
  url?: string | null
  name: string
  size?: number
}) {
  const initial = name?.[0] ?? '?'

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, border: '1px solid var(--s-border)' }}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        backgroundColor: 'var(--s-badge-bg)',
        color: 'var(--s-badge-text)',
      }}
    >
      {initial}
    </div>
  )
}
