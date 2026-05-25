function buildTrend(records) {
  const counts = {}
  records.forEach(r => {
    const month = (r.construction_date || '').slice(0, 7)
    if (month) counts[month] = (counts[month] || 0) + 1
  })
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))
}

function buildDistribution(records) {
  const map = {}
  records.forEach(r => {
    const key = ((r.product_brand || '') + ' ' + (r.product_series || '')).trim() || '其他'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

describe('buildTrend', () => {
  test('aggregates by month correctly', () => {
    const records = [
      { construction_date: '2026-04-10' },
      { construction_date: '2026-04-22' },
      { construction_date: '2026-05-01' },
    ]
    expect(buildTrend(records)).toEqual([
      { month: '2026-04', count: 2 },
      { month: '2026-05', count: 1 },
    ])
  })
  test('ignores records with no date', () => {
    expect(buildTrend([{ construction_date: '' }])).toEqual([])
  })
})

describe('buildDistribution', () => {
  test('groups by brand+series', () => {
    const records = [
      { product_brand: '龙膜', product_series: '至尊' },
      { product_brand: '龙膜', product_series: '至尊' },
      { product_brand: '3M', product_series: 'S系列' },
    ]
    const result = buildDistribution(records)
    expect(result[0]).toEqual({ name: '龙膜 至尊', value: 2 })
    expect(result[1]).toEqual({ name: '3M S系列', value: 1 })
  })
})
