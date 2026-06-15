export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SeasonInfo {
  season: Season
  className: string
  label: string
  emoji: string
  description: string
}

export function getSeason(month?: number): SeasonInfo {
  const m = month ?? new Date().getMonth() + 1

  if (m >= 3 && m <= 5) {
    return {
      season: 'spring',
      className: 'season-spring',
      label: '봄',
      emoji: '🌸',
      description: '벚꽃이 피는 따스한 봄',
    }
  }
  if (m >= 6 && m <= 8) {
    return {
      season: 'summer',
      className: 'season-summer',
      label: '여름',
      emoji: '☀️',
      description: '싱그러운 여름',
    }
  }
  if (m >= 9 && m <= 11) {
    return {
      season: 'autumn',
      className: 'season-autumn',
      label: '가을',
      emoji: '🍂',
      description: '단풍이 물드는 가을',
    }
  }
  return {
    season: 'winter',
    className: 'season-winter',
    label: '겨울',
    emoji: '❄️',
    description: '눈꽃이 내리는 겨울',
  }
}
