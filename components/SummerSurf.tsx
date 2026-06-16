// 여름 시즌 전용: 홈 배너 아래에서 파도가 흐르고 서퍼가 타는 애니메이션
// (순수 CSS 애니메이션 — 자바스크립트 없이 동작)

const WAVE_FRONT = 'M0 60 C 100 22, 200 22, 300 60 S 500 98, 600 60 S 800 22, 900 60 S 1100 98, 1200 60 L1200 120 L0 120 Z'
const WAVE_MID = 'M0 70 C 150 44, 350 96, 600 70 S 1050 44, 1200 70 L1200 120 L0 120 Z'
const WAVE_BACK = 'M0 80 C 200 62, 400 98, 600 80 S 1000 62, 1200 80 L1200 120 L0 120 Z'

function Wave({ d, color }: { d: string; color: string }) {
  // 같은 파형 2장을 나란히 → -50% 스크롤 시 끊김 없이 반복
  return (
    <>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d={d} fill={color} />
      </svg>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d={d} fill={color} />
      </svg>
    </>
  )
}

export default function SummerSurf() {
  return (
    <div className="surf-scene" aria-hidden="true">
      {/* 뒤쪽(연한)부터 앞쪽(진한) 파도 순서 */}
      <div className="surf-wave surf-wave-back"><Wave d={WAVE_BACK} color="#7dd3fc" /></div>
      <div className="surf-wave surf-wave-mid"><Wave d={WAVE_MID} color="#38bdf8" /></div>

      {/* 파도 마루에서 터지는 물보라 */}
      <span className="surf-foam" style={{ width: 14, height: 14, left: '24%', bottom: 52, animationDelay: '0s' }} />
      <span className="surf-foam" style={{ width: 10, height: 10, left: '30%', bottom: 58, animationDelay: '0.5s' }} />
      <span className="surf-foam" style={{ width: 18, height: 18, left: '62%', bottom: 50, animationDelay: '0.9s' }} />
      <span className="surf-foam" style={{ width: 12, height: 12, left: '70%', bottom: 56, animationDelay: '1.3s' }} />

      {/* 서퍼 */}
      <span className="surfer">🏄</span>

      {/* 맨 앞 파도 */}
      <div className="surf-wave surf-wave-front"><Wave d={WAVE_FRONT} color="#0284c7" /></div>
    </div>
  )
}
