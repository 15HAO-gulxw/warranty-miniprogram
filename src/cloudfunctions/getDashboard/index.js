const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
    if (admins.length === 0) return { code: 403, message: '无权限' }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const [totalRes, monthlyRes, allRecentRes, expiringRes] = await Promise.all([
      db.collection('records').count(),
      db.collection('records').where({ created_at: db.command.gte(thisMonthStart) }).count(),
      db.collection('records')
        .where({ created_at: db.command.gte(sixMonthsAgo) })
        .field({ construction_date: true, product_brand: true, product_series: true })
        .get(),
      db.collection('records')
        .where({
          warranty_expire: db.command.gte(now.toISOString().split('T')[0]).and(db.command.lte(thirtyDaysLater))
        })
        .orderBy('warranty_expire', 'asc')
        .get(),
    ])

    const trendMap = {}
    allRecentRes.data.forEach(r => {
      const month = (r.construction_date || '').slice(0, 7)
      if (month) trendMap[month] = (trendMap[month] || 0) + 1
    })
    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))

    const productMap = {}
    allRecentRes.data.forEach(r => {
      const key = ((r.product_brand || '') + ' ' + (r.product_series || '')).trim() || '其他'
      productMap[key] = (productMap[key] || 0) + 1
    })
    const product_distribution = Object.entries(productMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return {
      code: 200,
      data: {
        total_records: totalRes.total,
        monthly_count: monthlyRes.total,
        trend,
        product_distribution,
        expiring_soon: expiringRes.data,
        followup_reminders: [],
      }
    }
  } catch (err) {
    return { code: 500, message: '获取统计失败', error: err.message }
  }
}
