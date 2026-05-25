const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
  if (admins.length === 0) return { code: 403, message: '无权限' }

  const { _id, record } = event
  if (!_id || !record) return { code: 400, message: '缺少参数' }

  if (record.construction_date !== undefined || record.warranty_years !== undefined) {
    const { data: existing } = await db.collection('records').doc(_id).get()
    const constructDate = new Date(record.construction_date || existing.construction_date)
    const years = record.warranty_years !== undefined ? record.warranty_years : existing.warranty_years
    constructDate.setFullYear(constructDate.getFullYear() + years)
    record.warranty_expire = constructDate.toISOString().split('T')[0]
  }

  try {
    await db.collection('records').doc(_id).update({
      data: { ...record, updated_at: db.serverDate() }
    })
    return { code: 200 }
  } catch (err) {
    return { code: 500, message: '更新失败', error: err.message }
  }
}
