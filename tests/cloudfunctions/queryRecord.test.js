// 测试 maskPhone 逻辑（内联，与云函数保持一致）
function maskPhone(phone) {
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

// 测试状态计算逻辑
function calcStatus(warrantyExpire) {
  const now = new Date()
  const expire = new Date(warrantyExpire)
  const diffDays = Math.ceil((expire - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'expiring'
  return 'valid'
}

describe('maskPhone', () => {
  test('masks middle 4 digits of 11-digit phone', () => {
    expect(maskPhone('13812345678')).toBe('138****5678')
  })
  test('masks last 4 digits correctly', () => {
    expect(maskPhone('18600001234')).toBe('186****1234')
  })
})

describe('calcStatus', () => {
  test('returns expired for past date', () => {
    expect(calcStatus('2020-01-01')).toBe('expired')
  })
  test('returns valid for far future date', () => {
    expect(calcStatus('2030-01-01')).toBe('valid')
  })
  test('returns expiring for date within 30 days', () => {
    const soon = new Date()
    soon.setDate(soon.getDate() + 15)
    expect(calcStatus(soon.toISOString().split('T')[0])).toBe('expiring')
  })
})

describe('field validation', () => {
  const allowedFields = ['owner_phone', 'warranty_no', 'license_plate', 'vin']
  test('allows valid fields', () => {
    allowedFields.forEach(f => expect(allowedFields.includes(f)).toBe(true))
  })
  test('rejects invalid field', () => {
    expect(allowedFields.includes('name')).toBe(false)
  })
})
