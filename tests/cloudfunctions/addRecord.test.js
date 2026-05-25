// 测试质保卡号生成格式
function generateWarrantyNo(dateStr, sequence) {
  const seq = String(sequence).padStart(4, '0')
  return 'BM' + dateStr.replace(/-/g, '') + seq
}

// 测试到期日计算
function calcExpire(constructionDate, warrantyYears) {
  const date = new Date(constructionDate)
  date.setFullYear(date.getFullYear() + warrantyYears)
  return date.toISOString().split('T')[0]
}

describe('generateWarrantyNo', () => {
  test('formats with 4-digit sequence', () => {
    expect(generateWarrantyNo('2026-05-25', 1)).toBe('BM202605250001')
  })
  test('pads sequence with zeros', () => {
    expect(generateWarrantyNo('2026-05-25', 99)).toBe('BM202605250099')
  })
  test('max 4-digit sequence', () => {
    expect(generateWarrantyNo('2026-05-25', 9999)).toBe('BM202605259999')
  })
})

describe('calcExpire', () => {
  test('adds warranty years correctly', () => {
    expect(calcExpire('2026-05-25', 3)).toBe('2029-05-25')
  })
  test('handles 1 year warranty', () => {
    expect(calcExpire('2026-01-01', 1)).toBe('2027-01-01')
  })
})
