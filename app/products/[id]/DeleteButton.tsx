'use client'

export default function DeleteButton() {
  return (
    <button
      type="submit"
      className="w-full py-3 rounded-xl text-sm font-semibold"
      style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
      onClick={(e) => {
        if (!confirm('정말 삭제하시겠어요?')) e.preventDefault()
      }}
    >
      삭제하기
    </button>
  )
}
